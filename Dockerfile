# 🟢 Base image
FROM node:18

# 📁 Set working directory
WORKDIR /app

# 📦 Install dependencies
COPY package*.json ./
RUN npm install

# 📂 Copy application code
COPY . .

# 🔐 Optional: install global tools (e.g. nodemon for dev)
# RUN npm install -g nodemon

# 🌍 Expose backend port
EXPOSE 3000

# 🏁 Start the server
CMD ["node", "server.js"]