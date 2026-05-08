const API_BASE = 'http://localhost:5000/api';

// ========== UTILITIES ==========
function showLoader() {
  document.getElementById('loader')?.classList.add('active');
}

function hideLoader() {
  document.getElementById('loader')?.classList.remove('active');
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  const bgColor = type === 'success' ? '#22C55E' : type === 'error' ? '#EF4444' : '#4F46E5';
  toast.style.cssText = `position:fixed;bottom:80px;right:20px;padding:12px 20px;border-radius:10px;color:#fff;font-weight:500;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,0.15);animation:slideIn 0.3s ease;background:${bgColor};`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
}

function scrollToLogin() {
  const authSection = document.getElementById('authSection');
  if (authSection) {
    authSection.scrollIntoView({ behavior: 'smooth' });
  }
}

// ========== THEME INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  
  // Check if user is already logged in
  checkAuthStatus();
  
  // Setup login form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
});

// ========== AUTHENTICATION ==========
async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  
  if (!email || !password) {
    showToast('Please fill all fields', 'error');
    return;
  }
  
  showLoader();
  
  try {
    // Try admin login first
    let data = await tryLogin('/auth/admin/login', { email, password });
    if (data) {
      saveSession('admin', data);
      showToast('Admin login successful!', 'success');
      setTimeout(() => window.location.href = 'dashboards/admin-dashboard.html', 800);
      return;
    }
    
    // Try faculty login
    data = await tryLogin('/auth/faculty/login', { email, password });
    if (data) {
      saveSession('faculty', data);
      showToast('Faculty login successful!', 'success');
      setTimeout(() => window.location.href = 'dashboards/faculty-dashboard.html', 800);
      return;
    }
    
    // Try student login
    data = await tryLogin('/auth/student/login', { email, password });
    if (data) {
      saveSession('student', data);
      showToast('Student login successful!', 'success');
      setTimeout(() => window.location.href = 'dashboards/student-dashboard.html', 800);
      return;
    }
    
    showToast('Invalid credentials', 'error');
  } catch (err) {
    showToast(err.message || 'Login failed', 'error');
  } finally {
    hideLoader();
  }
}

async function tryLogin(endpoint, body) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch {
    return null;
  }
}

function saveSession(role, data) {
  localStorage.setItem('userRole', role);
  localStorage.setItem('authToken', data.token);
  localStorage.setItem('userData', JSON.stringify(data.user));
}

function getSession() {
  return {
    role: localStorage.getItem('userRole'),
    token: localStorage.getItem('authToken'),
    user: JSON.parse(localStorage.getItem('userData') || 'null')
  };
}

function checkAuthStatus() {
  const session = getSession();
  
  // If on login page and already authenticated, redirect to dashboard
  if (session.token && session.role) {
    const currentPage = window.location.pathname;
    if (currentPage.includes('index.html') || currentPage === '/') {
      const dashboardMap = {
        'admin': 'dashboards/admin-dashboard.html',
        'faculty': 'dashboards/faculty-dashboard.html',
        'student': 'dashboards/student-dashboard.html'
      };
      
      const redirectUrl = dashboardMap[session.role];
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    }
  }
}

// ========== API UTILITIES ==========
function getHeaders() {
  const session = getSession();
  const headers = { 'Content-Type': 'application/json' };
  if (session.token) {
    headers['Authorization'] = `Bearer ${session.token}`;
  }
  return headers;
}

async function apiRequest(endpoint, options = {}) {
  showLoader();
  try {
    const url = `${API_BASE}${endpoint}`;
    const config = {
      ...options,
      headers: { ...getHeaders(), ...(options.headers || {}) }
    };
    
    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
      config.body = JSON.stringify(options.body);
    }
    
    const res = await fetch(url, config);
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || 'Request failed');
    }
    
    return data;
  } finally {
    hideLoader();
  }
}

// ========== ROLE-BASED API WRAPPERS ==========
const api = {
  auth: {
    adminLogin: (body) => apiRequest('/auth/admin/login', { method: 'POST', body }),
    facultyLogin: (body) => apiRequest('/auth/faculty/login', { method: 'POST', body }),
    studentLogin: (body) => apiRequest('/auth/student/login', { method: 'POST', body }),
    profile: () => apiRequest('/auth/profile'),
    logout: () => {
      localStorage.clear();
      window.location.href = 'index.html';
    }
  },
  
  // ADMIN ENDPOINTS
  admin: {
    stats: () => apiRequest('/admin/stats'),
    students: (page = 1) => apiRequest(`/admin/students?page=${page}`),
    searchStudents: (query) => apiRequest(`/admin/students?search=${query}`),
    addStudent: (body) => apiRequest('/admin/students', { method: 'POST', body }),
    updateStudent: (id, body) => apiRequest(`/admin/students/${id}`, { method: 'PUT', body }),
    deleteStudent: (id) => apiRequest(`/admin/students/${id}`, { method: 'DELETE' }),
    
    faculty: (page = 1) => apiRequest(`/admin/faculty?page=${page}`),
    searchFaculty: (query) => apiRequest(`/admin/faculty?search=${query}`),
    addFaculty: (body) => apiRequest('/admin/faculty', { method: 'POST', body }),
    updateFaculty: (id, body) => apiRequest(`/admin/faculty/${id}`, { method: 'PUT', body }),
    deleteFaculty: (id) => apiRequest(`/admin/faculty/${id}`, { method: 'DELETE' }),
    
    attendance: () => apiRequest('/admin/attendance'),
    markAttendance: (body) => apiRequest('/attendance/mark', { method: 'POST', body }),
    
    results: () => apiRequest('/admin/results'),
    addResult: (body) => apiRequest('/results', { method: 'POST', body }),
    
    fees: () => apiRequest('/admin/fees'),
    updateFee: (id, body) => apiRequest(`/fees/${id}`, { method: 'PUT', body }),
    
    notifications: () => apiRequest('/admin/notifications'),
    sendNotification: (body) => apiRequest('/notifications', { method: 'POST', body })
  },
  
  // FACULTY ENDPOINTS
  faculty: {
    profile: () => apiRequest('/auth/faculty/profile'),
    updateProfile: (body) => apiRequest('/auth/faculty/profile', { method: 'PUT', body }),
    
    classes: () => apiRequest('/faculty/classes'),
    markAttendance: (body) => apiRequest('/attendance/mark', { method: 'POST', body }),
    getAttendance: () => apiRequest('/faculty/attendance'),
    
    postResult: (body) => apiRequest('/results', { method: 'POST', body }),
    getResults: () => apiRequest('/faculty/results'),
    
    getNotifications: () => apiRequest('/notifications/faculty'),
    markNotificationRead: (id) => apiRequest(`/notifications/${id}/read`, { method: 'PUT' })
  },
  
  // STUDENT ENDPOINTS
  student: {
    profile: () => apiRequest('/auth/student/profile'),
    updateProfile: (body) => apiRequest('/auth/student/profile', { method: 'PUT', body }),
    
    attendance: () => apiRequest('/attendance/student'),
    results: () => apiRequest('/results/student'),
    fees: () => apiRequest('/fees/student'),
    
    notifications: () => apiRequest('/notifications/student'),
    markNotificationRead: (id) => apiRequest(`/notifications/${id}/read`, { method: 'PUT' }),
    
    timetable: () => apiRequest('/timetable/student'),
    upload: (formData) => apiRequest('/upload', { 
      method: 'POST', 
      body: formData, 
      headers: {} 
    })
  }
};

// ========== LOGOUT FUNCTION ==========
function logout() {
  localStorage.clear();
  showToast('Logged out successfully', 'success');
  setTimeout(() => window.location.href = '/index.html', 500);
}
