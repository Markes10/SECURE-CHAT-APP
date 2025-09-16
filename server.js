require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2');
const multer = require('multer');
const { encryptMessage, decryptMessage } = require('./encrypt');
const logger = require('./logger');
const client = require('prom-client');
const bucket = require('./gcs'); // Optional: for cloud storage

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🧠 Prometheus Metrics
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route']
});
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on('finish', () => end({ method: req.method, route: req.path }));
  next();
});
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// 🗄 MySQL Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});
db.connect(err => {
  if (err) throw err;
  console.log('MySQL connected');
});

// 🔐 JWT Middleware
function authorizeRole(requiredRole) {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).send('Missing token');
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role !== requiredRole) return res.status(403).send('Access denied');
      req.user = decoded;
      next();
    } catch {
      res.status(401).send('Invalid token');
    }
  };
}

// 🔐 Register
app.post('/register', async (req, res) => {
  const { username, password, role = 'user' } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  db.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hashed, role], err => {
    if (err) return res.status(409).send('User already exists');
    res.status(201).send('User registered');
  });
});

// 🔐 Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
    if (err || results.length === 0) return res.status(401).send('Invalid credentials');
    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).send('Invalid credentials');
    const token = jwt.sign({ username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  });
});

// 💬 Get Messages
app.get('/messages', (req, res) => {
  db.query('SELECT * FROM messages ORDER BY timestamp DESC', (err, results) => {
    if (err) return res.status(500).send('Error loading messages');
    res.json(results);
  });
});

// 🎙 Voice Upload
const upload = multer({ storage: multer.memoryStorage() });
app.post('/upload-voice', upload.single('voice'), async (req, res) => {
  const blob = bucket.file(`voice_${Date.now()}.webm`);
  const stream = blob.createWriteStream({ resumable: false, contentType: req.file.mimetype });
  stream.on('finish', () => {
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
    db.query('INSERT INTO voices (user, file_url) VALUES (?, ?)', ['anonymous', publicUrl], err => {
      if (err) return res.status(500).send('Failed to store voice');
      res.json({ url: publicUrl });
    });
  });
  stream.end(req.file.buffer);
});

// 🛡 Admin Routes
app.get('/admin/users', authorizeRole('admin'), (req, res) => {
  db.query('SELECT id, username, role FROM users', (err, results) => {
    if (err) return res.status(500).send('Error loading users');
    res.json(results);
  });
});

app.delete('/admin/users/:id', authorizeRole('admin'), (req, res) => {
  db.query('DELETE FROM users WHERE id = ?', [req.params.id], err => {
    if (err) return res.status(500).send('Failed to delete user');
    res.send('User deleted');
  });
});

app.get('/admin/messages', authorizeRole('admin'), (req, res) => {
  db.query('SELECT * FROM messages ORDER BY timestamp DESC', (err, results) => {
    if (err) return res.status(500).send('Error loading messages');
    res.json(results);
  });
});

app.get('/admin/voices', authorizeRole('admin'), (req, res) => {
  db.query('SELECT * FROM voices ORDER BY timestamp DESC', (err, results) => {
    if (err) return res.status(500).send('Error loading voices');
    res.json(results);
  });
});

// 📡 WebSocket Chat
io.on('connection', socket => {
  socket.on('chat message', msg => {
    const encrypted = encryptMessage(msg);
    db.query('INSERT INTO messages (user, content, signature, signature_valid) VALUES (?, ?, ?, ?)', [
      'anonymous',
      encrypted.encryptedMessage,
      encrypted.signature,
      true
    ]);
    io.emit('chat message', {
      user: 'anonymous',
      message: msg,
      signatureValid: true
    });
  });
});

// 🏁 Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});