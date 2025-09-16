const socket = io('http://localhost:3000');
let token = '';
let userRole = 'user'; // default

// 🧠 Emoji Picker Setup
const picker = new EmojiButton();
const emojiBtn = document.getElementById('emoji-btn');
picker.on('emoji', emoji => {
  document.getElementById('message').value += emoji;
});
emojiBtn.addEventListener('click', () => picker.togglePicker(emojiBtn));

// ✅ Input Validation
function validateCredentials(username, password) {
  if (!username || !password) {
    alert("Username and password are required.");
    return false;
  }
  if (username.length < 3 || password.length < 6) {
    alert("Username must be at least 3 characters and password at least 6.");
    return false;
  }
  return true;
}

// 🔐 Register
async function register() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  if (!validateCredentials(username, password)) return;

  await fetch('http://localhost:3000/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  alert('Registered successfully!');
}

// 🔐 Login
async function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  if (!validateCredentials(username, password)) return;

  const res = await fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  token = data.token;
  const decoded = parseJwt(token);
  userRole = decoded.role || 'user';

  document.getElementById('auth').style.display = 'none';
  document.getElementById('chat').style.display = 'block';
}

// 🔓 JWT Decoder
function parseJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(atob(base64).split('').map(c =>
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''));
    return JSON.parse(json);
  } catch {
    return {};
  }
}

// 💬 Send Message
function sendMessage() {
  const msg = document.getElementById('message').value;
  if (!msg.trim()) return;
  socket.emit('chat message', msg);
  document.getElementById('message').value = '';
}

// 🔄 Load Messages
async function loadMessages() {
  const res = await fetch('http://localhost:3000/messages');
  const messages = await res.json();

  const container = document.getElementById('messages');
  container.innerHTML = '';
  messages.forEach(msg => {
    const div = document.createElement('div');
    div.textContent = `${msg.user}: ${msg.content} ${msg.signature_valid ? '✅' : '❌'}`;
    container.appendChild(div);
  });
}

// 🎙 Voice Recording & Upload
function recordVoice() {
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks = [];

      mediaRecorder.ondataavailable = e => audioChunks.push(e.data);

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('voice', audioBlob, 'voiceMessage.webm');

        const res = await fetch('http://localhost:3000/upload-voice', {
          method: 'POST',
          body: formData
        });

        const { url } = await res.json();
        const audio = document.createElement('audio');
        audio.src = url;
        audio.controls = true;
        document.getElementById('messages').appendChild(audio);
      };

      mediaRecorder.start();
      setTimeout(() => mediaRecorder.stop(), 5000); // Record for 5 seconds
    })
    .catch(err => alert('Microphone access denied or unavailable.'));
}

// 📡 WebSocket Listener
socket.on('chat message', data => {
  const div = document.createElement('div');
  div.textContent = `${data.user}: ${data.message} ${data.signatureValid ? '✅' : '❌'}`;
  document.getElementById('messages').appendChild(div);
});