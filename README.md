# SECURE-CHAT-APP 

# 🔐 Secure Chat App

A full-stack, encrypted chat application with real-time messaging, voice uploads, and admin dashboard. Built for security, scalability, and cloud deployment.

---

## 🚀 Features

- 🔐 **JWT Authentication** – Secure login and registration
- 🔒 **Hybrid Encryption** – AES + RSA with digital signatures
- 💬 **Real-Time Chat** – Powered by Socket.io
- 🎙 **Voice Messaging** – Record and upload voice notes
- 🛡 **Admin Dashboard** – Manage users, messages, and uploads
- ☁️ **Cloud Storage** – Google Cloud integration for voice files
- 🧪 **Unit Testing** – Mocha + Chai for backend logic
- 🐳 **Dockerized** – Full stack deployable via Docker Compose
- 📈 **Monitoring & Logs** – Prometheus metrics + Winston logging
- 📱 **Responsive UI** – Mobile-friendly frontend with emoji picker

---

## 🛠 Tech Stack

- **Frontend**: HTML, CSS, JavaScript  
- **Backend**: Node.js, Express  
- **Database**: MySQL  
- **Real-Time**: Socket.io  
- **Security**: bcryptjs, jsonwebtoken, crypto  
- **Cloud**: Google Cloud Storage  
- **Monitoring**: Prometheus, Grafana  
- **Containerization**: Docker, Docker Compose  
- **Testing**: Mocha, Chai

---

## 📦 Installation

### 1. Clone the repo

```bash
git clone https://github.com/your-username/secure-chat-app.git
cd secure-chat-app

Run with Docker
docker-compose up --build

Or run manually:
npm install
node server.js
