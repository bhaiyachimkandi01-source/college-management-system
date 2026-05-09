const API_BASE = window.location.origin + '/api';

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

function showLogin() {
  document.getElementById('authSection').style.display = 'flex';
  document.getElementById('registerSection').style.display = 'none';
}

function showRegister() {
  document.getElementById('authSection').style.display = 'none';
  document.getElementById('registerSection').style.display = 'flex';
}

// ========== THEME INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);

  // Check if user is already logged in
  checkAuthStatus();

  // Setup forms
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }

  // Setup sidebar navigation
  setupSidebarNavigation();
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
      setTimeout(() => showDashboard('admin'), 800);
      return;
    }

    // Try faculty login
    data = await tryLogin('/auth/faculty/login', { email, password });
    if (data) {
      saveSession('faculty', data);
      showToast('Faculty login successful!', 'success');
      setTimeout(() => showDashboard('faculty'), 800);
      return;
    }

    // Try student login
    data = await tryLogin('/auth/student/login', { email, password });
    if (data) {
      saveSession('student', data);
      showToast('Student login successful!', 'success');
      setTimeout(() => showDashboard('student'), 800);
      return;
    }

    showToast('Invalid credentials', 'error');
  } catch (err) {
    showToast(err.message || 'Login failed', 'error');
  } finally {
    hideLoader();
  }
}

async function handleRegister(e) {
  e.preventDefault();

  const password = document.getElementById('regPassword').value;
  const confirmPassword = document.getElementById('regConfirmPassword').value;
  if (password !== confirmPassword) {
    showToast('Passwords do not match', 'error');
    return;
  }

  const body = {
    name: document.getElementById('regName').value.trim(),
    rollNumber: document.getElementById('regRollNumber').value.trim(),
    email: document.getElementById('regEmail').value.trim(),
    password,
    department: document.getElementById('regDepartment').value,
    course: document.getElementById('regCourse').value,
    semester: document.getElementById('regSemester').value,
    phone: document.getElementById('regPhone').value.trim(),
    dob: document.getElementById('regDob').value
  };

  showLoader();

  try {
    const res = await fetch(`${API_BASE}/auth/student/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    showToast('Registration successful! Please login.', 'success');
    setTimeout(() => showLogin(), 1500);
  } catch (err) {
    showToast(err.message || 'Registration failed', 'error');
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

  // If on main page and already authenticated, show dashboard
  if (session.token && session.role) {
    showDashboard(session.role);
  }
}

function showDashboard(role) {
  // Hide landing and auth sections
  document.getElementById('landingPage').style.display = 'none';
  document.getElementById('authSection').style.display = 'none';
  document.getElementById('registerSection').style.display = 'none';

  // Show appropriate dashboard
  const dashboards = ['adminDashboard', 'facultyDashboard', 'studentDashboard'];
  dashboards.forEach(id => {
    document.getElementById(id).style.display = 'none';
  });

  const dashboardId = `${role}Dashboard`;
  document.getElementById(dashboardId).style.display = 'flex';

  // Load dashboard data
  loadDashboardData(role);
}

// ========== SIDEBAR NAVIGATION ==========
function setupSidebarNavigation() {
  // Admin sidebar
  document.querySelectorAll('#adminSidebar .admin-sidebar-menu a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = e.target.closest('a').getAttribute('data-tab');
      switchAdminTab(tab);
    });
  });

  // Faculty sidebar
  document.querySelectorAll('#facultySidebar .admin-sidebar-menu a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = e.target.closest('a').getAttribute('data-tab');
      switchFacultyTab(tab);
    });
  });

  // Student sidebar
  document.querySelectorAll('#studentSidebar .admin-sidebar-menu a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = e.target.closest('a').getAttribute('data-tab');
      switchStudentTab(tab);
    });
  });
}

function switchAdminTab(tabName) {
  // Update active link
  document.querySelectorAll('#adminSidebar .admin-sidebar-menu a').forEach(link => {
    link.classList.remove('active');
  });
  document.querySelector(`#adminSidebar [data-tab="${tabName}"]`).classList.add('active');

  // Show tab content
  document.querySelectorAll('#adminDashboard .tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  document.getElementById(tabName).classList.add('active');

  // Update page title
  const titles = {
    'admin-dashboard': 'Dashboard',
    'admin-students': 'Students',
    'admin-faculty': 'Faculty',
    'admin-attendance': 'Attendance',
    'admin-results': 'Results',
    'admin-fees': 'Fees',
    'admin-notifications': 'Notifications'
  };
  document.getElementById('adminPageTitle').textContent = titles[tabName] || 'Dashboard';

  // Load tab data
  loadAdminTabData(tabName);
}

function switchFacultyTab(tabName) {
  // Update active link
  document.querySelectorAll('#facultySidebar .admin-sidebar-menu a').forEach(link => {
    link.classList.remove('active');
  });
  document.querySelector(`#facultySidebar [data-tab="${tabName}"]`).classList.add('active');

  // Show tab content
  document.querySelectorAll('#facultyDashboard .tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  document.getElementById(tabName).classList.add('active');

  // Update page title
  const titles = {
    'faculty-dashboard': 'Dashboard',
    'faculty-attendance': 'Mark Attendance',
    'faculty-results': 'Post Results',
    'faculty-notifications': 'Notifications',
    'faculty-profile': 'Profile'
  };
  document.getElementById('facultyPageTitle').textContent = titles[tabName] || 'Dashboard';

  // Load tab data
  loadFacultyTabData(tabName);
}

function switchStudentTab(tabName) {
  // Update active link
  document.querySelectorAll('#studentSidebar .admin-sidebar-menu a').forEach(link => {
    link.classList.remove('active');
  });
  document.querySelector(`#studentSidebar [data-tab="${tabName}"]`).classList.add('active');

  // Show tab content
  document.querySelectorAll('#studentDashboard .tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  document.getElementById(tabName).classList.add('active');

  // Update page title
  const titles = {
    'student-dashboard': 'Dashboard',
    'student-attendance': 'My Attendance',
    'student-results': 'My Results',
    'student-fees': 'Fee Payment',
    'student-timetable': 'Timetable',
    'student-notifications': 'Notifications',
    'student-profile': 'Profile'
  };
  document.getElementById('studentPageTitle').textContent = titles[tabName] || 'Dashboard';

  // Load tab data
  loadStudentTabData(tabName);
}

// ========== DASHBOARD DATA LOADING ==========
async function loadDashboardData(role) {
  const session = getSession();
  if (!session.user) return;

  // Update user info in header
  const userNameElement = document.getElementById(`${role}UserName`);
  const avatarElement = document.getElementById(`${role}Avatar`);

  if (userNameElement) {
    userNameElement.textContent = session.user.name || session.user.email || 'User';
  }

  if (avatarElement) {
    avatarElement.textContent = (session.user.name || session.user.email || 'U').charAt(0).toUpperCase();
  }

  // Load role-specific data
  if (role === 'admin') {
    loadAdminDashboardStats();
  } else if (role === 'faculty') {
    loadFacultyDashboardStats();
  } else if (role === 'student') {
    loadStudentDashboardStats();
  }
}

async function loadAdminDashboardStats() {
  try {
    // Mock data for demo
    document.getElementById('adminTotalStudents').textContent = '150';
    document.getElementById('adminTotalFaculty').textContent = '25';
    document.getElementById('adminFeeCollection').textContent = '₹2,50,000';
    document.getElementById('adminPendingFees').textContent = '₹50,000';
  } catch (err) {
    console.error('Failed to load admin stats:', err);
  }
}

async function loadFacultyDashboardStats() {
  try {
    // Mock data for demo
    document.getElementById('facultyMyClasses').textContent = '5';
    document.getElementById('facultyStudentsTaught').textContent = '120';
    document.getElementById('facultyResultsPosted').textContent = '45';
    document.getElementById('facultyUnreadNotifications').textContent = '3';
  } catch (err) {
    console.error('Failed to load faculty stats:', err);
  }
}

async function loadStudentDashboardStats() {
  try {
    // Mock data for demo
    document.getElementById('studentAttendancePercent').textContent = '85%';
    document.getElementById('studentCurrentCgpa').textContent = '8.5';
    document.getElementById('studentFeeStatus').textContent = 'Paid';
    document.getElementById('studentUnreadNotifications').textContent = '2';
  } catch (err) {
    console.error('Failed to load student stats:', err);
  }
}

// ========== TAB DATA LOADING FUNCTIONS ==========
async function loadAdminTabData(tabName) {
  switch (tabName) {
    case 'admin-students':
      loadAdminStudents();
      break;
    case 'admin-faculty':
      loadAdminFaculty();
      break;
    case 'admin-attendance':
      loadAdminAttendance();
      break;
    case 'admin-results':
      loadAdminResults();
      break;
    case 'admin-fees':
      loadAdminFees();
      break;
    case 'admin-notifications':
      loadAdminNotifications();
      break;
  }
}

async function loadFacultyTabData(tabName) {
  switch (tabName) {
    case 'faculty-notifications':
      loadFacultyNotifications();
      break;
    case 'faculty-profile':
      loadFacultyProfile();
      break;
  }
}

async function loadStudentTabData(tabName) {
  switch (tabName) {
    case 'student-attendance':
      loadStudentAttendance();
      break;
    case 'student-results':
      loadStudentResults();
      break;
    case 'student-fees':
      loadStudentFees();
      break;
    case 'student-notifications':
      loadStudentNotifications();
      break;
    case 'student-profile':
      loadStudentProfile();
      break;
  }
}

// ========== ADMIN TAB FUNCTIONS ==========
async function loadAdminStudents() {
  try {
    // Mock data for demo
    const tbody = document.getElementById('adminStudentsTableBody');
    tbody.innerHTML = `
      <tr>
        <td>CS001</td>
        <td>John Doe</td>
        <td>john@college.edu</td>
        <td>Computer Science</td>
        <td><span style="background:#22C55E;color:white;padding:4px 8px;border-radius:4px;font-size:0.85rem;">Active</span></td>
        <td>
          <button class="btn btn-primary" style="padding:4px 8px;font-size:0.8rem;">Edit</button>
          <button class="btn btn-danger" style="padding:4px 8px;font-size:0.8rem;">Delete</button>
        </td>
      </tr>
      <tr>
        <td>CS002</td>
        <td>Jane Smith</td>
        <td>jane@college.edu</td>
        <td>Computer Science</td>
        <td><span style="background:#22C55E;color:white;padding:4px 8px;border-radius:4px;font-size:0.85rem;">Active</span></td>
        <td>
          <button class="btn btn-primary" style="padding:4px 8px;font-size:0.8rem;">Edit</button>
          <button class="btn btn-danger" style="padding:4px 8px;font-size:0.8rem;">Delete</button>
        </td>
      </tr>
    `;
  } catch (err) {
    console.error('Failed to load students:', err);
  }
}

async function loadAdminFaculty() {
  try {
    // Mock data for demo
    const tbody = document.getElementById('adminFacultyTableBody');
    tbody.innerHTML = `
      <tr>
        <td>FAC001</td>
        <td>Dr. Robert Johnson</td>
        <td>robert@college.edu</td>
        <td>Computer Science</td>
        <td><span style="background:#22C55E;color:white;padding:4px 8px;border-radius:4px;font-size:0.85rem;">Active</span></td>
        <td>
          <button class="btn btn-primary" style="padding:4px 8px;font-size:0.8rem;">Edit</button>
          <button class="btn btn-danger" style="padding:4px 8px;font-size:0.8rem;">Delete</button>
        </td>
      </tr>
      <tr>
        <td>FAC002</td>
        <td>Prof. Sarah Wilson</td>
        <td>sarah@college.edu</td>
        <td>Mathematics</td>
        <td><span style="background:#22C55E;color:white;padding:4px 8px;border-radius:4px;font-size:0.85rem;">Active</span></td>
        <td>
          <button class="btn btn-primary" style="padding:4px 8px;font-size:0.8rem;">Edit</button>
          <button class="btn btn-danger" style="padding:4px 8px;font-size:0.8rem;">Delete</button>
        </td>
      </tr>
    `;
  } catch (err) {
    console.error('Failed to load faculty:', err);
  }
}

async function loadAdminAttendance() {
  try {
    // Mock data for demo
    const tbody = document.getElementById('adminAttendanceTableBody');
    tbody.innerHTML = `
      <tr>
        <td>John Doe (CS001)</td>
        <td>Computer Science 101</td>
        <td>2024-01-15</td>
        <td><span style="background:#22C55E;color:white;padding:4px 8px;border-radius:4px;font-size:0.85rem;">Present</span></td>
      </tr>
      <tr>
        <td>Jane Smith (CS002)</td>
        <td>Computer Science 101</td>
        <td>2024-01-15</td>
        <td><span style="background:#EF4444;color:white;padding:4px 8px;border-radius:4px;font-size:0.85rem;">Absent</span></td>
      </tr>
    `;
  } catch (err) {
    console.error('Failed to load attendance:', err);
  }
}

async function loadAdminResults() {
  try {
    // Mock data for demo
    const tbody = document.getElementById('adminResultsTableBody');
    tbody.innerHTML = `
      <tr>
        <td>John Doe (CS001)</td>
        <td>Computer Science 101</td>
        <td>85</td>
        <td>A</td>
        <td>8.5</td>
      </tr>
      <tr>
        <td>Jane Smith (CS002)</td>
        <td>Computer Science 101</td>
        <td>78</td>
        <td>B+</td>
        <td>8.2</td>
      </tr>
    `;
  } catch (err) {
    console.error('Failed to load results:', err);
  }
}

async function loadAdminFees() {
  try {
    // Mock data for demo
    const tbody = document.getElementById('adminFeesTableBody');
    tbody.innerHTML = `
      <tr>
        <td>John Doe (CS001)</td>
        <td>₹50,000</td>
        <td>₹45,000</td>
        <td>₹5,000</td>
        <td><span style="background:#F59E0B;color:white;padding:4px 8px;border-radius:4px;font-size:0.85rem;">Partial</span></td>
      </tr>
      <tr>
        <td>Jane Smith (CS002)</td>
        <td>₹50,000</td>
        <td>₹50,000</td>
        <td>₹0</td>
        <td><span style="background:#22C55E;color:white;padding:4px 8px;border-radius:4px;font-size:0.85rem;">Paid</span></td>
      </tr>
    `;
  } catch (err) {
    console.error('Failed to load fees:', err);
  }
}

async function loadAdminNotifications() {
  try {
    // Mock data for demo
    const tbody = document.getElementById('adminNotificationsTableBody');
    tbody.innerHTML = `
      <tr>
        <td>Fee Payment Reminder</td>
        <td>All Students</td>
        <td>2024-01-15</td>
        <td><span style="background:#22C55E;color:white;padding:4px 8px;border-radius:4px;font-size:0.85rem;">Sent</span></td>
      </tr>
      <tr>
        <td>Exam Schedule Update</td>
        <td>Computer Science Students</td>
        <td>2024-01-10</td>
        <td><span style="background:#22C55E;color:white;padding:4px 8px;border-radius:4px;font-size:0.85rem;">Sent</span></td>
      </tr>
    `;
  } catch (err) {
    console.error('Failed to load notifications:', err);
  }
}

// ========== FACULTY TAB FUNCTIONS ==========
async function loadFacultyAttendanceStudents() {
  const classSelect = document.getElementById('facultyAttendanceClass').value;
  const dateSelect = document.getElementById('facultyAttendanceDate').value;

  if (!classSelect || !dateSelect) {
    showToast('Please select class and date', 'error');
    return;
  }

  document.getElementById('facultyAttendanceStudents').style.display = 'block';

  try {
    // Mock data for demo
    const tbody = document.getElementById('facultyAttendanceTableBody');
    tbody.innerHTML = `
      <tr>
        <td>CS001</td>
        <td>John Doe</td>
        <td>
          <select class="search-box" style="width:100px;">
            <option value="present">Present</option>
            <option value="absent">Absent</option>
          </select>
        </td>
        <td><input type="text" class="search-box" placeholder="Remarks" style="width:120px;"></td>
      </tr>
      <tr>
        <td>CS002</td>
        <td>Jane Smith</td>
        <td>
          <select class="search-box" style="width:100px;">
            <option value="present">Present</option>
            <option value="absent">Absent</option>
          </select>
        </td>
        <td><input type="text" class="search-box" placeholder="Remarks" style="width:120px;"></td>
      </tr>
    `;
  } catch (err) {
    console.error('Failed to load attendance students:', err);
  }
}

async function loadFacultyResultsStudents() {
  const classSelect = document.getElementById('facultyResultsClass').value;
  const semesterSelect = document.getElementById('facultyResultsSemester').value;

  if (!classSelect) {
    showToast('Please select class', 'error');
    return;
  }

  document.getElementById('facultyResultsStudents').style.display = 'block';

  try {
    // Mock data for demo
    const tbody = document.getElementById('facultyResultsTableBody');
    tbody.innerHTML = `
      <tr>
        <td>CS001</td>
        <td>John Doe</td>
        <td><input type="number" class="search-box" placeholder="Marks" style="width:80px;" min="0" max="100"></td>
        <td><input type="text" class="search-box" placeholder="Grade" style="width:60px;"></td>
        <td><input type="text" class="search-box" placeholder="Remarks" style="width:120px;"></td>
      </tr>
      <tr>
        <td>CS002</td>
        <td>Jane Smith</td>
        <td><input type="number" class="search-box" placeholder="Marks" style="width:80px;" min="0" max="100"></td>
        <td><input type="text" class="search-box" placeholder="Grade" style="width:60px;"></td>
        <td><input type="text" class="search-box" placeholder="Remarks" style="width:120px;"></td>
      </tr>
    `;
  } catch (err) {
    console.error('Failed to load results students:', err);
  }
}

async function loadFacultyNotifications() {
  try {
    // Mock data for demo
    const container = document.getElementById('facultyNotificationsList');
    container.innerHTML = `
      <div style="background:var(--bg-white);padding:1rem;border-radius:8px;margin-bottom:1rem;box-shadow:var(--shadow);">
        <h4 style="margin-bottom:0.5rem;">Fee Payment Reminder</h4>
        <p style="color:var(--text-light);font-size:0.9rem;margin-bottom:0.5rem;">Please ensure all students have paid their semester fees by the due date.</p>
        <small style="color:var(--text-light);">2024-01-15</small>
      </div>
      <div style="background:var(--bg-white);padding:1rem;border-radius:8px;margin-bottom:1rem;box-shadow:var(--shadow);">
        <h4 style="margin-bottom:0.5rem;">Exam Schedule Update</h4>
        <p style="color:var(--text-light);font-size:0.9rem;margin-bottom:0.5rem;">Mid-term examinations will start from next week. Please check the updated schedule.</p>
        <small style="color:var(--text-light);">2024-01-10</small>
      </div>
    `;
  } catch (err) {
    console.error('Failed to load faculty notifications:', err);
  }
}

async function loadFacultyProfile() {
  try {
    // Mock data for demo
    const container = document.getElementById('facultyProfileContent');
    container.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem;">
        <div><strong>Name:</strong> Dr. Robert Johnson</div>
        <div><strong>Employee ID:</strong> FAC001</div>
        <div><strong>Email:</strong> robert@college.edu</div>
        <div><strong>Department:</strong> Computer Science</div>
        <div><strong>Phone:</strong> +91 9876543210</div>
        <div><strong>Joining Date:</strong> 2020-01-15</div>
      </div>
      <button class="btn btn-primary">Edit Profile</button>
    `;
  } catch (err) {
    console.error('Failed to load faculty profile:', err);
  }
}

// ========== STUDENT TAB FUNCTIONS ==========
async function loadStudentAttendance() {
  try {
    // Mock data for demo
    document.getElementById('studentOverallAttendance').textContent = '85%';
    document.getElementById('studentAttendanceBar').style.width = '85%';

    const tbody = document.getElementById('studentAttendanceTableBody');
    tbody.innerHTML = `
      <tr>
        <td>Computer Science 101</td>
        <td>42</td>
        <td>48</td>
        <td>87.5%</td>
        <td><span style="background:#22C55E;color:white;padding:4px 8px;border-radius:4px;font-size:0.85rem;">Good</span></td>
      </tr>
      <tr>
        <td>Mathematics 101</td>
        <td>38</td>
        <td>48</td>
        <td>79.2%</td>
        <td><span style="background:#F59E0B;color:white;padding:4px 8px;border-radius:4px;font-size:0.85rem;">Average</span></td>
      </tr>
      <tr>
        <td>Physics 101</td>
        <td>45</td>
        <td>48</td>
        <td>93.8%</td>
        <td><span style="background:#22C55E;color:white;padding:4px 8px;border-radius:4px;font-size:0.85rem;">Excellent</span></td>
      </tr>
    `;
  } catch (err) {
    console.error('Failed to load student attendance:', err);
  }
}

async function loadStudentResults() {
  try {
    // Mock data for demo
    document.getElementById('studentResultsCgpa').textContent = '8.5';

    const tbody = document.getElementById('studentResultsTableBody');
    tbody.innerHTML = `
      <tr>
        <td>3rd Semester</td>
        <td>Computer Science 101</td>
        <td>85</td>
        <td>A</td>
        <td>8.5</td>
        <td>4</td>
      </tr>
      <tr>
        <td>3rd Semester</td>
        <td>Mathematics 101</td>
        <td>78</td>
        <td>B+</td>
        <td>8.2</td>
        <td>4</td>
      </tr>
      <tr>
        <td>3rd Semester</td>
        <td>Physics 101</td>
        <td>92</td>
        <td>A+</td>
        <td>9.0</td>
        <td>4</td>
      </tr>
    `;
  } catch (err) {
    console.error('Failed to load student results:', err);
  }
}

async function loadStudentFees() {
  try {
    // Mock data for demo - already populated in HTML
    console.log('Student fees loaded');
  } catch (err) {
    console.error('Failed to load student fees:', err);
  }
}

async function loadStudentNotifications() {
  try {
    // Mock data for demo
    const container = document.getElementById('studentNotificationsList');
    container.innerHTML = `
      <div style="background:var(--bg-white);padding:1rem;border-radius:8px;margin-bottom:1rem;box-shadow:var(--shadow);">
        <h4 style="margin-bottom:0.5rem;">Fee Payment Reminder</h4>
        <p style="color:var(--text-light);font-size:0.9rem;margin-bottom:0.5rem;">Your pending fee payment of ₹5,000 is due by January 31st.</p>
        <small style="color:var(--text-light);">2024-01-15</small>
      </div>
      <div style="background:var(--bg-white);padding:1rem;border-radius:8px;margin-bottom:1rem;box-shadow:var(--shadow);">
        <h4 style="margin-bottom:0.5rem;">Exam Schedule</h4>
        <p style="color:var(--text-light);font-size:0.9rem;margin-bottom:0.5rem;">Mid-term examinations will start from January 20th. Check your timetable.</p>
        <small style="color:var(--text-light);">2024-01-10</small>
      </div>
    `;
  } catch (err) {
    console.error('Failed to load student notifications:', err);
  }
}

async function loadStudentProfile() {
  try {
    // Mock data for demo
    const container = document.getElementById('studentProfileContent');
    container.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem;">
        <div><strong>Name:</strong> John Doe</div>
        <div><strong>Roll Number:</strong> CS001</div>
        <div><strong>Email:</strong> john@college.edu</div>
        <div><strong>Department:</strong> Computer Science</div>
        <div><strong>Course:</strong> B.Tech</div>
        <div><strong>Semester:</strong> 3rd</div>
        <div><strong>Phone:</strong> +91 9876543210</div>
        <div><strong>Date of Birth:</strong> 2002-05-15</div>
      </div>
      <button class="btn btn-primary">Edit Profile</button>
    `;
  } catch (err) {
    console.error('Failed to load student profile:', err);
  }
}

// ========== ACTION FUNCTIONS ==========
function submitFacultyAttendance() {
  showToast('Attendance submitted successfully!', 'success');
}

function submitFacultyResults() {
  showToast('Results posted successfully!', 'success');
}

// ========== LOGOUT FUNCTION ==========
function logout() {
  localStorage.clear();
  showToast('Logged out successfully', 'success');
  setTimeout(() => location.reload(), 500);
}