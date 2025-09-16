const winston = require('winston');
const path = require('path');

// 📁 Log file paths
const logDir = path.join(__dirname, 'logs');
const logFile = path.join(logDir, 'app.log');
const errorFile = path.join(logDir, 'error.log');

// 🧠 Create Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // 📋 Console output
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),

    // 📁 File output
    new winston.transports.File({ filename: logFile }),
    new winston.transports.File({ filename: errorFile, level: 'error' })
  ]
});

module.exports = logger;