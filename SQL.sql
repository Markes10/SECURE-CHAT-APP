-- 🗄 Create Database
CREATE DATABASE IF NOT EXISTS secure_chat;
USE secure_chat;

-- 👥 Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 💬 Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  signature TEXT,
  signature_valid BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 🎙 Voice Uploads Table
CREATE TABLE IF NOT EXISTS voices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user VARCHAR(50) NOT NULL,
  file_url TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 🔍 Indexes for performance
CREATE INDEX idx_user_role ON users (username, role);
CREATE INDEX idx_message_time ON messages (timestamp);
CREATE INDEX idx_voice_time ON voices (timestamp);