const API_BASE = window.location.origin + '/api';
let currentUser = null;

function showLoader() {
  document.getElementById('loader')?.classList.add('active');
}

function hideLoader() {
  document.getElementById('loader')?.classList.remove('active');
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
}

function toggleSidebar() {
  document.getElementById('sidebar')?.classList.toggle('active');
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  const bgColor = type === 'success' ? '#22C55E' : type === 'error' ? '#EF4444' : '#4F46E5';
  toast.style.cssText = `position:fixed;bottom:80px;right:20px;padding:12px 20px;border-radius:10px;color:#fff;font-weight:500;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,0.15);animation:slideIn 0.3s ease;background:${bgColor};`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  
  const token = localStorage.getItem('authToken');
  if (token) {
    loadStudentDashboard();
  } else {
    showLoginModal();
  }

  const loginForm = document.getElementById('studentLoginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleStudentLogin);
  }
});

async function handleStudentLogin(e) {
  e.preventDefault();
  showLoader();
  
  try {
    const rollNumber = document.getElementById('rollNumber').value;
    const password = document.getElementById('loginPassword').value;
    
    const response = await fetch(`${API_BASE}/auth/student/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: rollNumber, password })
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Login failed');
    
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('studentUser', JSON.stringify(data.user));
    showToast('Login successful!', 'success');
    loadStudentDashboard();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    hideLoader();
  }
}

function showLoginModal() {
  const modal = document.getElementById('loginModal');
  if (modal) modal.classList.add('active');
}

function hideLoginModal() {
  const modal = document.getElementById('loginModal');
  if (modal) modal.classList.remove('active');
}

async function loadStudentDashboard() {
  hideLoginModal();
  
  const user = JSON.parse(localStorage.getItem('studentUser') || '{}');
  document.getElementById('studentName').textContent = user.name || 'Student';
  document.getElementById('studentEmail').textContent = user.email || 'student@college.edu';
  
  // Load dashboard data
  loadDashboardData();
}

function showDashboard() {
  showSection('dashboardSection');
  loadDashboardData();
}

function showAttendance() {
  showSection('attendanceSection');
  loadAttendance();
}

function showResults() {
  showSection('resultsSection');
  loadResults();
}

function showFees() {
  showSection('feesSection');
  loadFees();
}

function showTimetable() {
  showSection('timetableSection');
  loadTimetable();
}

function showNotifications() {
  showSection('notificationsSection');
  loadNotifications();
}

function showSection(sectionId) {
  document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
  document.getElementById(sectionId)?.classList.add('active');
}

async function loadDashboardData() {
  try {
    // Load attendance percentage
    document.getElementById('attendancePercentage').textContent = '87';
    
    // Load CGPA
    document.getElementById('studentCGPA').textContent = '3.8';
    
    // Load fee status
    document.getElementById('feeStatus').textContent = 'Paid';
    
    // Load notifications count
    document.getElementById('notificationCount').textContent = '5';
  } catch (err) {
    console.error('Error loading dashboard:', err);
  }
}

async function loadAttendance() {
  try {
    const tableBody = document.getElementById('attendanceTableBody');
    tableBody.innerHTML = `
      <tr>
        <td>Mathematics</td>
        <td>40</td>
        <td>38</td>
        <td><span style="color:var(--success);">95%</span></td>
        <td><span style="background:var(--success);color:#fff;padding:0.25rem 0.75rem;border-radius:20px;font-size:0.85rem;">Good</span></td>
      </tr>
      <tr>
        <td>Physics</td>
        <td>35</td>
        <td>32</td>
        <td><span style="color:var(--warning);">91%</span></td>
        <td><span style="background:var(--warning);color:#fff;padding:0.25rem 0.75rem;border-radius:20px;font-size:0.85rem;">Good</span></td>
      </tr>
      <tr>
        <td>Chemistry</td>
        <td>35</td>
        <td>30</td>
        <td><span style="color:var(--danger);">86%</span></td>
        <td><span style="background:var(--danger);color:#fff;padding:0.25rem 0.75rem;border-radius:20px;font-size:0.85rem;">Low</span></td>
      </tr>
    `;
  } catch (err) {
    console.error('Error loading attendance:', err);
  }
}

async function loadResults() {
  try {
    const tableBody = document.getElementById('resultsTableBody');
    tableBody.innerHTML = `
      <tr>
        <td>Mathematics</td>
        <td>4</td>
        <td>85</td>
        <td>A</td>
      </tr>
      <tr>
        <td>Physics</td>
        <td>4</td>
        <td>88</td>
        <td>A+</td>
      </tr>
      <tr>
        <td>Chemistry</td>
        <td>3</td>
        <td>78</td>
        <td>B</td>
      </tr>
    `;
  } catch (err) {
    console.error('Error loading results:', err);
  }
}

async function loadFees() {
  try {
    const tableBody = document.getElementById('feesTableBody');
    tableBody.innerHTML = `
      <tr>
        <td>Semester 1</td>
        <td>₹50,000</td>
        <td>15-01-2025</td>
        <td><span style="background:var(--success);color:#fff;padding:0.25rem 0.75rem;border-radius:20px;font-size:0.85rem;">Paid</span></td>
      </tr>
      <tr>
        <td>Semester 2</td>
        <td>₹50,000</td>
        <td>Pending</td>
        <td><span style="background:var(--danger);color:#fff;padding:0.25rem 0.75rem;border-radius:20px;font-size:0.85rem;">Unpaid</span></td>
      </tr>
    `;
  } catch (err) {
    console.error('Error loading fees:', err);
  }
}

async function loadTimetable() {
  try {
    const container = document.getElementById('timetableContainer');
    container.innerHTML = `
      <div style="overflow-x:auto;">
        <table class="table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Monday</th>
              <th>Tuesday</th>
              <th>Wednesday</th>
              <th>Thursday</th>
              <th>Friday</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>9:00-10:00</strong></td>
              <td>Mathematics</td>
              <td>Physics</td>
              <td>Chemistry</td>
              <td>Mathematics</td>
              <td>Physics</td>
            </tr>
            <tr>
              <td><strong>10:00-11:00</strong></td>
              <td>Physics</td>
              <td>Chemistry</td>
              <td>Mathematics</td>
              <td>Physics</td>
              <td>Chemistry</td>
            </tr>
            <tr>
              <td><strong>11:00-12:00</strong></td>
              <td colspan="5" style="text-align:center;color:var(--text-light);">Break</td>
            </tr>
            <tr>
              <td><strong>12:00-1:00</strong></td>
              <td>Chemistry</td>
              <td>Mathematics</td>
              <td>Physics</td>
              <td>Chemistry</td>
              <td>Mathematics</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  } catch (err) {
    console.error('Error loading timetable:', err);
  }
}

async function loadNotifications() {
  try {
    const container = document.getElementById('notificationsList');
    container.innerHTML = `
      <div style="padding:1rem;border-left:4px solid var(--primary);background:var(--bg);border-radius:4px;margin-bottom:1rem;">
        <h4 style="margin-bottom:0.5rem;">New Result Posted</h4>
        <p style="color:var(--text-light);font-size:0.9rem;">Your semester 2 results have been posted</p>
        <p style="color:var(--text-light);font-size:0.8rem;">2 hours ago</p>
      </div>
      <div style="padding:1rem;border-left:4px solid var(--warning);background:var(--bg);border-radius:4px;margin-bottom:1rem;">
        <h4 style="margin-bottom:0.5rem;">Low Attendance Alert</h4>
        <p style="color:var(--text-light);font-size:0.9rem;">Your attendance in Chemistry is below 80%</p>
        <p style="color:var(--text-light);font-size:0.8rem;">1 day ago</p>
      </div>
      <div style="padding:1rem;border-left:4px solid var(--success);background:var(--bg);border-radius:4px;">
        <h4 style="margin-bottom:0.5rem;">Fee Payment Confirmation</h4>
        <p style="color:var(--text-light);font-size:0.9rem;">Your semester 1 fee has been successfully paid</p>
        <p style="color:var(--text-light);font-size:0.8rem;">3 days ago</p>
      </div>
    `;
  } catch (err) {
    console.error('Error loading notifications:', err);
  }
}

function logout() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('studentUser');
    showToast('Logged out successfully', 'success');
    setTimeout(() => window.location.href = 'index.html', 800);
  }
}
