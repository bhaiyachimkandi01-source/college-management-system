const API_BASE = window.location.origin + '/api';
let currentFaculty = null;

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
  
  const token = localStorage.getItem('facultyToken');
  if (token) {
    loadFacultyDashboard();
  } else {
    showLoginModal();
  }

  const loginForm = document.getElementById('facultyLoginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleFacultyLogin);
  }
});

async function handleFacultyLogin(e) {
  e.preventDefault();
  showLoader();
  
  try {
    const email = document.getElementById('facultyEmail').value;
    const password = document.getElementById('facultyPassword').value;
    
    const response = await fetch(`${API_BASE}/auth/faculty/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Login failed');
    
    localStorage.setItem('facultyToken', data.token);
    localStorage.setItem('facultyUser', JSON.stringify(data.user));
    showToast('Faculty login successful!', 'success');
    loadFacultyDashboard();
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

async function loadFacultyDashboard() {
  hideLoginModal();
  
  const user = JSON.parse(localStorage.getItem('facultyUser') || '{}');
  document.getElementById('facultyName').textContent = user.name || 'Faculty';
  document.getElementById('facultyEmail').textContent = user.email || 'faculty@college.edu';
  
  showDashboard();
}

function showDashboard() {
  showSection('dashboardSection');
  loadDashboardData();
}

function showClasses() {
  showSection('classesSection');
  loadClasses();
}

function showAttendance() {
  showSection('attendanceSection');
  loadClassesForAttendance();
}

function showResults() {
  showSection('resultsSection');
  loadClassesForResults();
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
    document.getElementById('classCount').textContent = '4';
    document.getElementById('studentCount').textContent = '120';
    document.getElementById('attendanceToday').textContent = '92';
    document.getElementById('notificationCount').textContent = '3';
    
    const todaysClasses = document.getElementById('todaysClasses');
    todaysClasses.innerHTML = `
      <div style="padding:1rem;background:var(--bg);border-radius:8px;margin-bottom:1rem;">
        <p style="margin-bottom:0.5rem;"><strong>9:00 AM - Mathematics (Section A)</strong></p>
        <p style="color:var(--text-light);font-size:0.9rem;">Room: 101 | Students: 40</p>
      </div>
      <div style="padding:1rem;background:var(--bg);border-radius:8px;margin-bottom:1rem;">
        <p style="margin-bottom:0.5rem;"><strong>11:00 AM - Mathematics (Section B)</strong></p>
        <p style="color:var(--text-light);font-size:0.9rem;">Room: 102 | Students: 42</p>
      </div>
      <div style="padding:1rem;background:var(--bg);border-radius:8px;">
        <p style="margin-bottom:0.5rem;"><strong>2:00 PM - Advanced Mathematics</strong></p>
        <p style="color:var(--text-light);font-size:0.9rem;">Room: 201 | Students: 38</p>
      </div>
    `;
  } catch (err) {
    console.error('Error loading dashboard:', err);
  }
}

async function loadClasses() {
  try {
    const tableBody = document.getElementById('classesTableBody');
    tableBody.innerHTML = `
      <tr>
        <td>CLS001</td>
        <td>Mathematics</td>
        <td>3rd Semester</td>
        <td>42</td>
        <td>Mon, Wed, Fri - 9:00 AM</td>
        <td><button class="btn" style="background:var(--primary);color:#fff;padding:0.4rem 0.8rem;border:none;border-radius:4px;cursor:pointer;font-size:0.9rem;">View</button></td>
      </tr>
      <tr>
        <td>CLS002</td>
        <td>Physics</td>
        <td>3rd Semester</td>
        <td>40</td>
        <td>Tue, Thu - 10:00 AM</td>
        <td><button class="btn" style="background:var(--primary);color:#fff;padding:0.4rem 0.8rem;border:none;border-radius:4px;cursor:pointer;font-size:0.9rem;">View</button></td>
      </tr>
      <tr>
        <td>CLS003</td>
        <td>Chemistry</td>
        <td>2nd Semester</td>
        <td>38</td>
        <td>Mon, Wed - 2:00 PM</td>
        <td><button class="btn" style="background:var(--primary);color:#fff;padding:0.4rem 0.8rem;border:none;border-radius:4px;cursor:pointer;font-size:0.9rem;">View</button></td>
      </tr>
    `;
  } catch (err) {
    console.error('Error loading classes:', err);
  }
}

async function loadClassesForAttendance() {
  try {
    const select = document.getElementById('attendanceClassSelect');
    select.innerHTML = `
      <option value="">Choose a class...</option>
      <option value="1">Mathematics - Section A</option>
      <option value="2">Physics - Section B</option>
      <option value="3">Chemistry - Practical</option>
    `;
  } catch (err) {
    console.error('Error loading classes:', err);
  }
}

async function loadClassStudents() {
  const classId = document.getElementById('attendanceClassSelect').value;
  if (!classId) {
    document.getElementById('attendanceTableBody').innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--text-light);">Select a class to mark attendance</td></tr>';
    return;
  }
  
  try {
    const tableBody = document.getElementById('attendanceTableBody');
    tableBody.innerHTML = `
      <tr>
        <td>CS001</td>
        <td>Raj Kumar</td>
        <td><input type="checkbox" checked></td>
      </tr>
      <tr>
        <td>CS002</td>
        <td>Priya Singh</td>
        <td><input type="checkbox" checked></td>
      </tr>
      <tr>
        <td>CS003</td>
        <td>Amit Patel</td>
        <td><input type="checkbox"></td>
      </tr>
      <tr>
        <td>CS004</td>
        <td>Neha Sharma</td>
        <td><input type="checkbox" checked></td>
      </tr>
    `;
  } catch (err) {
    console.error('Error loading students:', err);
  }
}

function saveAttendance() {
  showToast('Attendance saved successfully!', 'success');
}

async function loadClassesForResults() {
  try {
    const select = document.getElementById('resultsClassSelect');
    select.innerHTML = `
      <option value="">Choose a class...</option>
      <option value="1">Mathematics - Section A</option>
      <option value="2">Physics - Section B</option>
      <option value="3">Chemistry - Practical</option>
    `;
  } catch (err) {
    console.error('Error loading classes:', err);
  }
}

async function loadResultsForm() {
  const classId = document.getElementById('resultsClassSelect').value;
  if (!classId) {
    document.getElementById('resultsTableBody').innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-light);">Select a class to enter results</td></tr>';
    return;
  }
  
  try {
    const tableBody = document.getElementById('resultsTableBody');
    tableBody.innerHTML = `
      <tr>
        <td>CS001</td>
        <td>Raj Kumar</td>
        <td><input type="number" min="0" max="100" placeholder="Marks" value="85" style="width:80px;padding:0.4rem;border:1px solid var(--border);border-radius:4px;"></td>
        <td><span>A</span></td>
      </tr>
      <tr>
        <td>CS002</td>
        <td>Priya Singh</td>
        <td><input type="number" min="0" max="100" placeholder="Marks" value="92" style="width:80px;padding:0.4rem;border:1px solid var(--border);border-radius:4px;"></td>
        <td><span>A+</span></td>
      </tr>
      <tr>
        <td>CS003</td>
        <td>Amit Patel</td>
        <td><input type="number" min="0" max="100" placeholder="Marks" value="78" style="width:80px;padding:0.4rem;border:1px solid var(--border);border-radius:4px;"></td>
        <td><span>B</span></td>
      </tr>
    `;
  } catch (err) {
    console.error('Error loading results form:', err);
  }
}

function saveResults() {
  showToast('Results saved successfully!', 'success');
}

async function loadNotifications() {
  try {
    const container = document.getElementById('notificationsList');
    container.innerHTML = `
      <div style="padding:1rem;border-left:4px solid var(--primary);background:var(--bg);border-radius:4px;margin-bottom:1rem;">
        <h4 style="margin-bottom:0.5rem;">Class Schedule Updated</h4>
        <p style="color:var(--text-light);font-size:0.9rem;">Your Mathematics class schedule has been changed</p>
        <p style="color:var(--text-light);font-size:0.8rem;">2 hours ago</p>
      </div>
      <div style="padding:1rem;border-left:4px solid var(--success);background:var(--bg);border-radius:4px;margin-bottom:1rem;">
        <h4 style="margin-bottom:0.5rem;">Results Published</h4>
        <p style="color:var(--text-light);font-size:0.9rem;">Results for Mathematics exam have been published</p>
        <p style="color:var(--text-light);font-size:0.8rem;">1 day ago</p>
      </div>
      <div style="padding:1rem;border-left:4px solid var(--warning);background:var(--bg);border-radius:4px;">
        <h4 style="margin-bottom:0.5rem;">Pending Attendance Entry</h4>
        <p style="color:var(--text-light);font-size:0.9rem;">Please mark attendance for your classes</p>
        <p style="color:var(--text-light);font-size:0.8rem;">3 days ago</p>
      </div>
    `;
  } catch (err) {
    console.error('Error loading notifications:', err);
  }
}

function logout() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('facultyToken');
    localStorage.removeItem('facultyUser');
    showToast('Logged out successfully', 'success');
    setTimeout(() => window.location.href = 'index.html', 800);
  }
}
