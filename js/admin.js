const API_BASE = window.location.origin + '/api';
let currentAdmin = null;

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
  
  const token = localStorage.getItem('adminToken');
  if (token) {
    loadAdminDashboard();
  } else {
    showLoginModal();
  }

  const loginForm = document.getElementById('adminLoginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleAdminLogin);
  }
});

async function handleAdminLogin(e) {
  e.preventDefault();
  showLoader();
  
  try {
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    
    const response = await fetch(`${API_BASE}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Login failed');
    
    localStorage.setItem('adminToken', data.token);
    localStorage.setItem('adminUser', JSON.stringify(data.user));
    showToast('Admin login successful!', 'success');
    loadAdminDashboard();
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

async function loadAdminDashboard() {
  hideLoginModal();
  showDashboard();
  loadDashboardData();
}

function showDashboard() {
  showSection('dashboardSection');
}

function showStudents() {
  showSection('studentsSection');
  loadStudents();
}

function showFaculty() {
  showSection('facultySection');
  loadFaculty();
}

function showAttendance() {
  showSection('attendanceSection');
}

function showResults() {
  showSection('resultsSection');
}

function showFees() {
  showSection('feesSection');
  loadFeesData();
}

function showSection(sectionId) {
  document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
  document.getElementById(sectionId)?.classList.add('active');
}

async function loadDashboardData() {
  try {
    document.getElementById('totalStudents').textContent = '250';
    document.getElementById('totalFaculty').textContent = '45';
    document.getElementById('totalFeesCollected').textContent = '₹1,25,00,000';
    document.getElementById('pendingFees').textContent = '₹5,00,000';
    
    const activitiesList = document.getElementById('activitiesList');
    activitiesList.innerHTML = `
      <div style="padding:1rem;border-left:4px solid var(--primary);background:var(--bg);border-radius:4px;margin-bottom:1rem;">
        <p style="margin-bottom:0.5rem;"><strong>New student registered</strong></p>
        <p style="color:var(--text-light);font-size:0.9rem;">John Doe (CS001) - 2 hours ago</p>
      </div>
      <div style="padding:1rem;border-left:4px solid var(--success);background:var(--bg);border-radius:4px;margin-bottom:1rem;">
        <p style="margin-bottom:0.5rem;"><strong>Fee payment received</strong></p>
        <p style="color:var(--text-light);font-size:0.9rem;">₹50,000 from CS102 - 5 hours ago</p>
      </div>
      <div style="padding:1rem;border-left:4px solid var(--warning);background:var(--bg);border-radius:4px;">
        <p style="margin-bottom:0.5rem;"><strong>Attendance marked</strong></p>
        <p style="color:var(--text-light);font-size:0.9rem;">Mathematics class - 1 day ago</p>
      </div>
    `;
  } catch (err) {
    console.error('Error loading dashboard:', err);
  }
}

async function loadStudents() {
  try {
    const tableBody = document.getElementById('studentsTableBody');
    tableBody.innerHTML = `
      <tr>
        <td>CS001</td>
        <td>Raj Kumar</td>
        <td>raj@college.edu</td>
        <td>4th Semester</td>
        <td><button class="btn" style="background:var(--primary);color:#fff;padding:0.4rem 0.8rem;border:none;border-radius:4px;cursor:pointer;font-size:0.9rem;">View</button></td>
      </tr>
      <tr>
        <td>CS002</td>
        <td>Priya Singh</td>
        <td>priya@college.edu</td>
        <td>4th Semester</td>
        <td><button class="btn" style="background:var(--primary);color:#fff;padding:0.4rem 0.8rem;border:none;border-radius:4px;cursor:pointer;font-size:0.9rem;">View</button></td>
      </tr>
      <tr>
        <td>CS003</td>
        <td>Amit Patel</td>
        <td>amit@college.edu</td>
        <td>2nd Semester</td>
        <td><button class="btn" style="background:var(--primary);color:#fff;padding:0.4rem 0.8rem;border:none;border-radius:4px;cursor:pointer;font-size:0.9rem;">View</button></td>
      </tr>
    `;
  } catch (err) {
    console.error('Error loading students:', err);
  }
}

async function loadFaculty() {
  try {
    const tableBody = document.getElementById('facultyTableBody');
    tableBody.innerHTML = `
      <tr>
        <td>FAC001</td>
        <td>Dr. Sharma</td>
        <td>sharma@college.edu</td>
        <td>Computer Science</td>
        <td><button class="btn" style="background:var(--primary);color:#fff;padding:0.4rem 0.8rem;border:none;border-radius:4px;cursor:pointer;font-size:0.9rem;">View</button></td>
      </tr>
      <tr>
        <td>FAC002</td>
        <td>Prof. Gupta</td>
        <td>gupta@college.edu</td>
        <td>Mathematics</td>
        <td><button class="btn" style="background:var(--primary);color:#fff;padding:0.4rem 0.8rem;border:none;border-radius:4px;cursor:pointer;font-size:0.9rem;">View</button></td>
      </tr>
    `;
  } catch (err) {
    console.error('Error loading faculty:', err);
  }
}

async function loadFeesData() {
  try {
    const tableBody = document.getElementById('feesTableBody');
    tableBody.innerHTML = `
      <tr>
        <td>Raj Kumar</td>
        <td>CS001</td>
        <td>₹50,000</td>
        <td><span style="background:var(--success);color:#fff;padding:0.25rem 0.75rem;border-radius:20px;font-size:0.85rem;">Paid</span></td>
        <td>15-01-2025</td>
      </tr>
      <tr>
        <td>Priya Singh</td>
        <td>CS002</td>
        <td>₹50,000</td>
        <td><span style="background:var(--danger);color:#fff;padding:0.25rem 0.75rem;border-radius:20px;font-size:0.85rem;">Unpaid</span></td>
        <td>25-02-2025</td>
      </tr>
    `;
  } catch (err) {
    console.error('Error loading fees:', err);
  }
}

function filterStudents() {
  const searchTerm = document.getElementById('studentSearch').value.toLowerCase();
  const rows = document.getElementById('studentsTableBody').querySelectorAll('tr');
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchTerm) ? '' : 'none';
  });
}

function filterFaculty() {
  const searchTerm = document.getElementById('facultySearch').value.toLowerCase();
  const rows = document.getElementById('facultyTableBody').querySelectorAll('tr');
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchTerm) ? '' : 'none';
  });
}

function showAddStudentForm() {
  showToast('Add student form - Feature coming soon', 'info');
}

function showAddFacultyForm() {
  showToast('Add faculty form - Feature coming soon', 'info');
}

function logout() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    showToast('Logged out successfully', 'success');
    setTimeout(() => window.location.href = 'index.html', 800);
  }
}
