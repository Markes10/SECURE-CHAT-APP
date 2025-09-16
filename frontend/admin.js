const API_BASE = 'http://localhost:3000';
const token = localStorage.getItem('adminToken'); // Optional: store JWT after login

// 🧠 Helper: Auth headers
function authHeaders() {
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
}

// 👥 Load Users
async function loadUsers() {
  const res = await fetch(`${API_BASE}/admin/users`, authHeaders());
  const users = await res.json();
  const container = document.getElementById('user-list');
  container.innerHTML = '';

  users.forEach(u => {
    const div = document.createElement('div');
    div.className = 'admin-item';
    div.textContent = `ID: ${u.id}, Username: ${u.username}, Role: ${u.role}`;

    const delBtn = document.createElement('button');
    delBtn.textContent = '🗑 Delete';
    delBtn.onclick = () => deleteUser(u.id, div);

    div.appendChild(delBtn);
    container.appendChild(div);
  });
}

// 🗑 Delete User
async function deleteUser(id, element) {
  const res = await fetch(`${API_BASE}/admin/users/${id}`, {
    method: 'DELETE',
    ...authHeaders()
  });
  if (res.ok) {
    element.remove();
  } else {
    alert('Failed to delete user');
  }
}

// 💬 Load Messages
async function loadMessages() {
  const res = await fetch(`${API_BASE}/admin/messages`, authHeaders());
  const messages = await res.json();
  const container = document.getElementById('message-list');
  container.innerHTML = '';

  messages.forEach(m => {
    const div = document.createElement('div');
    div.className = 'admin-item';
    div.textContent = `${m.user}: ${m.content} ${m.signature_valid ? '✅' : '❌'} (${new Date(m.timestamp).toLocaleString()})`;
    container.appendChild(div);
  });
}

// 🎙 Load Voice Uploads
async function loadVoices() {
  const res = await fetch(`${API_BASE}/admin/voices`, authHeaders());
  const voices = await res.json();
  const container = document.getElementById('voice-list');
  container.innerHTML = '';

  voices.forEach(v => {
    const wrapper = document.createElement('div');
    wrapper.className = 'admin-item';

    const audio = document.createElement('audio');
    audio.src = v.file_url;
    audio.controls = true;

    const label = document.createElement('div');
    label.textContent = `${v.user} - ${new Date(v.timestamp).toLocaleString()}`;

    wrapper.appendChild(label);
    wrapper.appendChild(audio);
    container.appendChild(wrapper);
  });
}

// 🚀 Initialize Dashboard
loadUsers();
loadMessages();
loadVoices();