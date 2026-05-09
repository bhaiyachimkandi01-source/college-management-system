const API_BASE = window.location.origin + '/api';

function getToken() { return localStorage.getItem('studentToken'); }
function getHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

function showLoader() { document.getElementById('loader')?.classList.add('active'); }
function hideLoader() { document.getElementById('loader')?.classList.remove('active'); }

async function apiRequest(endpoint, options = {}) {
  showLoader();
  try {
    const url = `${API_BASE}${endpoint}`;
    const config = { ...options, headers: { ...getHeaders(), ...(options.headers || {}) } };
    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
      config.body = JSON.stringify(options.body);
    }
    const res = await fetch(url, config);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  } finally { hideLoader(); }
}

const api = {
  auth: {
    register: (body) => apiRequest('/auth/student/register', { method: 'POST', body }),
    login: (body) => apiRequest('/auth/student/login', { method: 'POST', body }),
    profile: () => apiRequest('/auth/student/profile'),
    updateProfile: (body) => apiRequest('/auth/student/profile', { method: 'PUT', body })
  },
  attendance: { getMyAttendance: () => apiRequest('/attendance/student') },
  results: { getMyResults: () => apiRequest('/results/student') },
  fees: { getMyFees: () => apiRequest('/fees/student') },
  notifications: {
    getMyNotifications: () => apiRequest('/notifications/student'),
    markRead: (id) => apiRequest(`/notifications/${id}/read`, { method: 'PUT' })
  },
  timetable: { getMyTimetable: () => apiRequest('/timetable/student') },
  upload: (formData) => apiRequest('/upload', { method: 'POST', body: formData, headers: {} })
};

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.style.cssText = `position:fixed;bottom:80px;right:20px;padding:12px 20px;border-radius:10px;color:#fff;font-weight:500;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,0.15);animation:slideIn 0.3s ease;background:${type==='success'?'#22C55E':type==='error'?'#EF4444':'#4F46E5'};`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function logout() {
  localStorage.removeItem('studentToken');
  localStorage.removeItem('studentUser');
  window.location.href = 'login.html';
}

function checkAuth() {
  if (!getToken()) { window.location.href = 'login.html'; return false; }
  return true;
}

function getUser() { try { return JSON.parse(localStorage.getItem('studentUser')); } catch { return null; } }
function setUser(user) { localStorage.setItem('studentUser', JSON.stringify(user)); }

// Dark mode
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
});
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
}
