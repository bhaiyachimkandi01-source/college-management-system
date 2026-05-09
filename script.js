const API_BASE = window.location.origin + '/api';

function showLoader() {
  document.getElementById('loader')?.classList.add('active');
}

function hideLoader() {
  document.getElementById('loader')?.classList.remove('active');
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  const background = type === 'success' ? '#22C55E' : type === 'error' ? '#EF4444' : '#4F46E5';
  toast.style.cssText = `position:fixed;bottom:80px;right:20px;padding:12px 20px;border-radius:10px;color:#fff;font-weight:500;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,0.15);animation:slideIn 0.3s ease;background:${background};`;
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

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

function getHeaders() {
  const token = localStorage.getItem('authToken');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
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
    const response = await fetch(url, config);
    const contentType = response.headers.get('content-type') || '';
    let data = null;
    if (contentType.includes('application/json')) {
      data = await response.json();
    }
    if (!response.ok) {
      const error = data?.message || response.statusText || 'Request failed';
      throw new Error(error);
    }
    return data;
  } catch (error) {
    throw error;
  } finally {
    hideLoader();
  }
}

const api = {
  auth: {
    adminLogin: (body) => apiRequest('/auth/admin/login', { method: 'POST', body }),
    facultyLogin: (body) => apiRequest('/auth/faculty/login', { method: 'POST', body }),
    studentLogin: (body) => apiRequest('/auth/student/login', { method: 'POST', body }),
    register: (body) => apiRequest('/auth/student/register', { method: 'POST', body })
  },
  admin: {
    stats: () => apiRequest('/admin/stats'),
    students: () => apiRequest('/admin/students'),
    faculty: () => apiRequest('/admin/faculty'),
    attendance: () => apiRequest('/admin/attendance'),
    results: () => apiRequest('/admin/results'),
    fees: () => apiRequest('/admin/fees'),
    notifications: () => apiRequest('/admin/notifications')
  },
  faculty: {
    profile: () => apiRequest('/auth/faculty/profile'),
    classes: () => apiRequest('/faculty/classes'),
    notifications: () => apiRequest('/notifications/faculty')
  },
  student: {
    profile: () => apiRequest('/auth/student/profile'),
    attendance: () => apiRequest('/attendance/student'),
    results: () => apiRequest('/results/student'),
    fees: () => apiRequest('/fees/student'),
    notifications: () => apiRequest('/notifications/student')
  }
};

function saveSession(role, data) {
  localStorage.setItem('userRole', role);
  localStorage.setItem('authToken', data.token || '');
  localStorage.setItem('userData', JSON.stringify(data.user || data));
}

function clearSession() {
  localStorage.removeItem('userRole');
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
}

function getSession() {
  return {
    role: localStorage.getItem('userRole'),
    token: localStorage.getItem('authToken'),
    user: JSON.parse(localStorage.getItem('userData') || 'null')
  };
}

function logout() {
  clearSession();
  showToast('Logged out successfully', 'success');
  setTimeout(() => showPage('page-home'), 500);
}

function getInitialPage() {
  const hash = window.location.hash.slice(1);
  if (!hash) return 'page-home';
  const pageId = `page-${hash}`;
  const section = document.getElementById(pageId);
  return section ? pageId : 'page-home';
}

function showPage(pageId) {
  const sections = Array.from(document.querySelectorAll('.page-section'));
  const target = document.getElementById(pageId);
  if (!target) return;
  sections.forEach((section) => section.classList.remove('active'));
  target.classList.add('active');
  window.location.hash = pageId.replace('page-', '');
  initPage(pageId);
}

const pageInitialized = {};

function initPage(pageId) {
  if (pageInitialized[pageId]) return;
  pageInitialized[pageId] = true;
  switch (pageId) {
    case 'page-student-dashboard':
      initStudentDashboard();
      break;
    case 'page-faculty-dashboard':
      initFacultyDashboard();
      break;
    case 'page-admin-dashboard':
      initAdminDashboard();
      break;
    case 'page-student-login':
    case 'page-student-register':
    case 'page-admin-login':
    case 'page-faculty-login':
    case 'page-home':
    default:
      break;
  }
}

async function handleStudentLogin(event) {
  event.preventDefault();
  const rollNumber = document.getElementById('studentLoginRollNumber').value.trim();
  const password = document.getElementById('studentLoginPassword').value.trim();
  if (!rollNumber || !password) {
    showToast('Please enter roll number and password', 'error');
    return;
  }

  try {
    const data = await api.auth.studentLogin({ rollNumber, password });
    saveSession('student', data);
    showToast('Login successful!', 'success');
    showPage('page-student-dashboard');
  } catch (error) {
    showToast(error.message || 'Login failed', 'error');
  }
}

async function handleStudentRegister(event) {
  event.preventDefault();
  const password = document.getElementById('studentRegisterPassword').value;
  const confirmPassword = document.getElementById('studentRegisterConfirmPassword').value;
  if (password !== confirmPassword) {
    showToast('Passwords do not match', 'error');
    return;
  }
  const body = {
    name: document.getElementById('studentRegisterName').value.trim(),
    rollNumber: document.getElementById('studentRegisterRollNumber').value.trim(),
    email: document.getElementById('studentRegisterEmail').value.trim(),
    phone: document.getElementById('studentRegisterPhone').value.trim(),
    gender: document.getElementById('studentRegisterGender').value,
    dob: document.getElementById('studentRegisterDob').value,
    department: document.getElementById('studentRegisterDepartment').value,
    course: document.getElementById('studentRegisterCourse').value.trim(),
    semester: Number(document.getElementById('studentRegisterSemester').value),
    batch: document.getElementById('studentRegisterBatch').value.trim(),
    password
  };
  try {
    const data = await api.auth.register(body);
    saveSession('student', data);
    showToast('Registration successful!', 'success');
    showPage('page-student-dashboard');
  } catch (error) {
    showToast(error.message || 'Registration failed', 'error');
  }
}

async function handleAdminLogin(event) {
  event.preventDefault();
  const email = document.getElementById('adminLoginEmail').value.trim();
  const password = document.getElementById('adminLoginPassword').value.trim();
  if (!email || !password) {
    showToast('Please enter email and password', 'error');
    return;
  }

  try {
    const data = await api.auth.adminLogin({ email, password });
    saveSession('admin', data);
    showToast('Admin login successful!', 'success');
    showPage('page-admin-dashboard');
  } catch (error) {
    showToast(error.message || 'Login failed', 'error');
  }
}

async function handleFacultyLogin(event) {
  event.preventDefault();
  const email = document.getElementById('facultyLoginEmail').value.trim();
  const password = document.getElementById('facultyLoginPassword').value.trim();
  if (!email || !password) {
    showToast('Please enter email and password', 'error');
    return;
  }

  try {
    const data = await api.auth.facultyLogin({ email, password });
    saveSession('faculty', data);
    showToast('Faculty login successful!', 'success');
    showPage('page-faculty-dashboard');
  } catch (error) {
    showToast(error.message || 'Login failed', 'error');
  }
}

function setupSidebarNavigation(menuSelector, titleId) {
  const menuItems = document.querySelectorAll(`${menuSelector} a`);
  menuItems.forEach((item) => {
    item.addEventListener('click', (event) => {
      event.preventDefault();
      menuItems.forEach((el) => el.classList.remove('active'));
      item.classList.add('active');
      const tabName = item.dataset.tab;
      const title = document.getElementById(titleId);
      if (title) title.textContent = item.textContent.trim();
      const tabs = document.querySelectorAll(`${menuSelector}-content .tab-content`);
      tabs.forEach((tab) => tab.classList.remove('active'));
      const activeTab = document.getElementById(tabName);
      activeTab?.classList.add('active');
      if (typeof window[`load${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`] === 'function') {
        window[`load${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`]();
      }
    });
  });
}

function initStudentDashboard() {
  const session = getSession();
  if (!session.token || session.role !== 'student') {
    showToast('Please login as a student first', 'error');
    showPage('page-student-login');
    return;
  }
  document.getElementById('studentUserName').textContent = session.user?.name || session.user?.email || 'Student';
  document.getElementById('studentAvatar').textContent = session.user?.name?.charAt(0)?.toUpperCase() || 'S';
  setupDashboardNavigation('#studentSidebarMenu', 'studentPageTitle');
  loadStudentDashboardStats();
  loadStudentAttendance();
  loadStudentResults();
  loadStudentNotifications();
  loadStudentProfile();
}

function initFacultyDashboard() {
  const session = getSession();
  if (!session.token || session.role !== 'faculty') {
    showToast('Please login as faculty first', 'error');
    showPage('page-faculty-login');
    return;
  }
  document.getElementById('facultyUserName').textContent = session.user?.name || session.user?.email || 'Faculty';
  document.getElementById('facultyAvatar').textContent = session.user?.name?.charAt(0)?.toUpperCase() || 'F';
  setupDashboardNavigation('#facultySidebarMenu', 'facultyPageTitle');
  loadFacultyDashboardStats();
  loadFacultyNotifications();
  loadFacultyProfile();
}

function initAdminDashboard() {
  const session = getSession();
  if (!session.token || session.role !== 'admin') {
    showToast('Please login as admin first', 'error');
    showPage('page-admin-login');
    return;
  }
  document.getElementById('adminUserName').textContent = session.user?.name || session.user?.email || 'Admin';
  document.getElementById('adminAvatar').textContent = session.user?.name?.charAt(0)?.toUpperCase() || 'A';
  setupSidebarNavigation();
  loadAdminDashboardStats();
}

function setupSidebarNavigation() {
  const menuItems = document.querySelectorAll('.admin-sidebar-menu a');
  menuItems.forEach((item) => {
    item.addEventListener('click', (event) => {
      event.preventDefault();
      menuItems.forEach((mi) => mi.classList.remove('active'));
      item.classList.add('active');
      const tabName = item.dataset.tab;
      const tabs = document.querySelectorAll('.admin-tab-content .tab-content');
      tabs.forEach((tab) => tab.classList.remove('active'));
      document.getElementById(tabName)?.classList.add('active');
      document.getElementById('adminPageTitle').textContent = item.textContent.trim();
      switch (tabName) {
        case 'students':
          loadAdminStudents();
          break;
        case 'faculty':
          loadAdminFaculty();
          break;
        case 'attendance':
          loadAdminAttendance();
          break;
        case 'results':
          loadAdminResults();
          break;
        case 'fees':
          loadAdminFees();
          break;
        case 'notifications':
          loadAdminNotifications();
          break;
      }
    });
  });
}

async function loadAdminDashboardStats() {
  try {
    const data = await api.admin.stats();
    document.getElementById('totalStudents').textContent = data.totalStudents || 0;
    document.getElementById('totalFaculty').textContent = data.totalFaculty || 0;
    document.getElementById('feeCollection').textContent = `₹${(data.feeCollection || 0).toLocaleString()}`;
    document.getElementById('pendingFees').textContent = `₹${(data.pendingFees || 0).toLocaleString()}`;
  } catch (error) {
    document.getElementById('totalStudents').textContent = 0;
    document.getElementById('totalFaculty').textContent = 0;
    document.getElementById('feeCollection').textContent = '₹0';
    document.getElementById('pendingFees').textContent = '₹0';
  }
}

async function loadAdminStudents() {
  const tbody = document.getElementById('studentsTableBody');
  try {
    const data = await api.admin.students();
    const students = data.students || [];
    if (students.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;">No students found</td></tr>';
      return;
    }
    tbody.innerHTML = students.map((student) => `
      <tr>
        <td><strong>${student.rollNumber || 'N/A'}</strong></td>
        <td>${student.name || 'N/A'}</td>
        <td>${student.email || 'N/A'}</td>
        <td>${student.department || 'N/A'}</td>
        <td><span class="badge badge-success">Active</span></td>
        <td><button class="btn btn-primary">Edit</button></td>
      </tr>
    `).join('');
  } catch (error) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;color:#64748B;">Unable to load students</td></tr>';
  }
}

async function loadAdminFaculty() {
  const tbody = document.getElementById('facultyTableBody');
  try {
    const data = await api.admin.faculty();
    const faculty = data.faculty || [];
    if (faculty.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;">No faculty found</td></tr>';
      return;
    }
    tbody.innerHTML = faculty.map((member) => `
      <tr>
        <td><strong>${member.empId || 'N/A'}</strong></td>
        <td>${member.name || 'N/A'}</td>
        <td>${member.email || 'N/A'}</td>
        <td>${member.department || 'N/A'}</td>
        <td><span class="badge badge-success">Active</span></td>
        <td><button class="btn btn-primary">Edit</button></td>
      </tr>
    `).join('');
  } catch (error) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;color:#64748B;">Unable to load faculty</td></tr>';
  }
}

async function loadAdminAttendance() {
  const tbody = document.getElementById('attendanceTableBody');
  try {
    const data = await api.admin.attendance();
    const records = data.attendance || [];
    if (records.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:2rem;">No attendance records found</td></tr>';
      return;
    }
    tbody.innerHTML = records.slice(0, 10).map((record) => `
      <tr>
        <td>${record.studentName || 'N/A'}</td>
        <td>${record.subject || 'N/A'}</td>
        <td>${record.date ? new Date(record.date).toLocaleDateString() : 'N/A'}</td>
        <td><span class="badge ${record.status === 'Present' ? 'badge-success' : 'badge-danger'}">${record.status || 'N/A'}</span></td>
      </tr>
    `).join('');
  } catch (error) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:2rem;color:#64748B;">Unable to load attendance</td></tr>';
  }
}

async function loadAdminResults() {
  const tbody = document.getElementById('resultsTableBody');
  try {
    const data = await api.admin.results();
    const results = data.results || [];
    if (results.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem;">No results found</td></tr>';
      return;
    }
    tbody.innerHTML = results.slice(0, 10).map((result) => `
      <tr>
        <td>${result.studentName || 'N/A'}</td>
        <td>${result.subject || 'N/A'}</td>
        <td>${result.marks ?? 'N/A'}</td>
        <td>${result.grade || 'N/A'}</td>
        <td>${result.sgpa?.toFixed(2) || 'N/A'}</td>
      </tr>
    `).join('');
  } catch (error) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem;color:#64748B;">Unable to load results</td></tr>';
  }
}

async function loadAdminFees() {
  const tbody = document.getElementById('feesTableBody');
  try {
    const data = await api.admin.fees();
    const fees = data.fees || [];
    if (fees.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem;">No fee records found</td></tr>';
      return;
    }
    tbody.innerHTML = fees.slice(0, 10).map((fee) => {
      const pending = (fee.totalFee || 0) - (fee.paidAmount || 0);
      return `
      <tr>
        <td>${fee.studentName || 'N/A'}</td>
        <td>₹${(fee.totalFee || 0).toLocaleString()}</td>
        <td>₹${(fee.paidAmount || 0).toLocaleString()}</td>
        <td>₹${pending.toLocaleString()}</td>
        <td><span class="badge ${pending === 0 ? 'badge-success' : 'badge-warning'}">${pending === 0 ? 'Paid' : 'Pending'}</span></td>
      </tr>`;
    }).join('');
  } catch (error) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem;color:#64748B;">Unable to load fees</td></tr>';
  }
}

async function loadAdminNotifications() {
  const tbody = document.getElementById('notificationsTableBody');
  try {
    const data = await api.admin.notifications();
    const notifications = data.notifications || [];
    if (notifications.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:2rem;">No notifications found</td></tr>';
      return;
    }
    tbody.innerHTML = notifications.slice(0, 10).map((notif) => `
      <tr>
        <td>${notif.message || 'N/A'}</td>
        <td>${notif.recipientCount || 0} users</td>
        <td>${notif.createdAt ? new Date(notif.createdAt).toLocaleDateString() : 'N/A'}</td>
        <td><span class="badge badge-success">Sent</span></td>
      </tr>`;
    }).join('');
  } catch (error) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:2rem;color:#64748B;">Unable to load notifications</td></tr>';
  }
}

function loadStudentDashboardStats() {
  document.getElementById('attendancePercent').textContent = '85%';
  document.getElementById('currentCgpa').textContent = '8.5';
  document.getElementById('feeStatus').textContent = 'Partial';
  document.getElementById('feeStatus').className = 'badge badge-warning';
  document.getElementById('studentUnreadNotifications').textContent = '2';
}

function loadStudentAttendance() {
  const mockAttendance = [
    { subject: 'Computer Science 101', present: 18, total: 20, percentage: 90 },
    { subject: 'Mathematics 101', present: 16, total: 20, percentage: 80 },
    { subject: 'Physics 101', present: 17, total: 20, percentage: 85 },
    { subject: 'Chemistry 101', present: 19, total: 20, percentage: 95 },
    { subject: 'English 101', present: 15, total: 20, percentage: 75 }
  ];
  const tbody = document.getElementById('studentAttendanceTableBody');
  tbody.innerHTML = mockAttendance.map((att) => `
    <tr>
      <td><strong>${att.subject}</strong></td>
      <td>${att.present}</td>
      <td>${att.total}</td>
      <td>${att.percentage}%</td>
      <td><span class="badge ${att.percentage >= 75 ? 'badge-success' : att.percentage >= 60 ? 'badge-warning' : 'badge-danger'}">${att.percentage >= 75 ? 'Good' : att.percentage >= 60 ? 'Average' : 'Poor'}</span></td>
    </tr>`).join('');
  const overallPercent = Math.round(mockAttendance.reduce((sum, att) => sum + att.percentage, 0) / mockAttendance.length);
  document.getElementById('overallAttendance').textContent = `${overallPercent}%`;
  document.getElementById('attendanceBar').style.width = `${overallPercent}%`;
}

function loadStudentResults() {
  const mockResults = [
    { semester: 'Fall 2023', subject: 'Computer Science 101', marks: 95, grade: 'A', sgpa: 9.5, credits: 4 },
    { semester: 'Fall 2023', subject: 'Mathematics 101', marks: 87, grade: 'B+', sgpa: 8.7, credits: 4 },
    { semester: 'Fall 2023', subject: 'Physics 101', marks: 92, grade: 'A-', sgpa: 9.2, credits: 3 },
    { semester: 'Spring 2024', subject: 'Chemistry 101', marks: 89, grade: 'B+', sgpa: 8.9, credits: 4 },
    { semester: 'Spring 2024', subject: 'English 101', marks: 91, grade: 'A-', sgpa: 9.1, credits: 3 }
  ];
  const tbody = document.getElementById('studentResultsTableBody');
  tbody.innerHTML = mockResults.map((result) => `
    <tr>
      <td>${result.semester}</td>
      <td><strong>${result.subject}</strong></td>
      <td>${result.marks}</td>
      <td>${result.grade}</td>
      <td>${result.sgpa}</td>
      <td>${result.credits}</td>
    </tr>`).join('');
  const totalCredits = mockResults.reduce((sum, result) => sum + result.credits, 0);
  const weightedSum = mockResults.reduce((sum, result) => sum + result.sgpa * result.credits, 0);
  const cgpa = (weightedSum / totalCredits).toFixed(2);
  document.getElementById('studentResultsCgpa').textContent = cgpa;
}

function loadStudentNotifications() {
  const notifications = [
    { message: 'Your fee payment has been received.', date: '2024-01-15', read: false },
    { message: 'New semester timetable published.', date: '2024-01-14', read: true },
    { message: 'Mid-term exam schedule released.', date: '2024-01-10', read: false },
    { message: 'Library books due date reminder.', date: '2024-01-08', read: true }
  ];
  const container = document.getElementById('studentNotificationsList');
  container.innerHTML = notifications.map((notif) => `
    <div class="notification-card ${notif.read ? '' : 'unread'}">
      <p>${notif.message}</p>
      <small>${new Date(notif.date).toLocaleDateString()}</small>
      ${notif.read ? '' : '<span class="badge badge-primary">New</span>'}
    </div>`).join('');
}

function loadStudentProfile() {
  const session = getSession();
  const content = document.getElementById('studentProfileContent');
  const user = session.user || {};
  content.innerHTML = `
    <div class="profile-grid">
      <div><label>Name</label><p>${user.name || 'N/A'}</p></div>
      <div><label>Roll Number</label><p>${user.rollNumber || 'N/A'}</p></div>
      <div><label>Email</label><p>${user.email || 'N/A'}</p></div>
      <div><label>Department</label><p>${user.department || 'N/A'}</p></div>
      <div><label>Course</label><p>${user.course || 'N/A'}</p></div>
      <div><label>Semester</label><p>${user.semester || 'N/A'}</p></div>
      <div><label>Phone</label><p>${user.phone || 'N/A'}</p></div>
      <div><label>Date of Birth</label><p>${user.dob || 'N/A'}</p></div>
    </div>
    <div class="profile-actions"><button class="btn btn-primary" onclick="showToast('Profile editing coming soon', 'info')">Edit Profile</button></div>
  `;
}

function loadFacultyDashboardStats() {
  document.getElementById('facultyClasses').textContent = '3';
  document.getElementById('facultyStudents').textContent = '45';
  document.getElementById('facultyResultsPosted').textContent = '12';
  document.getElementById('facultyUnreadNotifications').textContent = '2';
}

function loadFacultyNotifications() {
  const notifications = [
    { message: 'New semester timetable has been published.', date: '2024-01-15', read: false },
    { message: 'Faculty meeting scheduled tomorrow at 2 PM.', date: '2024-01-14', read: true },
    { message: 'Submit course completion reports by end of week.', date: '2024-01-10', read: false }
  ];
  const container = document.getElementById('facultyNotificationsList');
  container.innerHTML = notifications.map((notif) => `
    <div class="notification-card ${notif.read ? '' : 'unread'}">
      <p>${notif.message}</p>
      <small>${new Date(notif.date).toLocaleDateString()}</small>
      ${notif.read ? '' : '<span class="badge badge-primary">New</span>'}
    </div>`).join('');
}

function loadFacultyProfile() {
  const session = getSession();
  const content = document.getElementById('facultyProfileContent');
  const user = session.user || {};
  content.innerHTML = `
    <div class="profile-grid">
      <div><label>Name</label><p>${user.name || 'N/A'}</p></div>
      <div><label>Email</label><p>${user.email || 'N/A'}</p></div>
      <div><label>Employee ID</label><p>${user.empId || 'N/A'}</p></div>
      <div><label>Department</label><p>${user.department || 'N/A'}</p></div>
      <div><label>Designation</label><p>${user.designation || 'N/A'}</p></div>
      <div><label>Joining Date</label><p>${user.joiningDate || 'N/A'}</p></div>
    </div>
    <div class="profile-actions"><button class="btn btn-primary" onclick="showToast('Profile editing coming soon', 'info')">Edit Profile</button></div>
  `;
}

function loadFacultyAttendanceStudents() {
  const classSelect = document.getElementById('facultyAttendanceClass');
  const dateInput = document.getElementById('facultyAttendanceDate');
  if (!classSelect.value || !dateInput.value) {
    showToast('Please select class and date', 'error');
    return;
  }
  const mockStudents = [
    { rollNumber: 'CS001', name: 'John Doe' },
    { rollNumber: 'CS002', name: 'Jane Smith' },
    { rollNumber: 'CS003', name: 'Bob Johnson' },
    { rollNumber: 'CS004', name: 'Alice Brown' },
    { rollNumber: 'CS005', name: 'Charlie Wilson' }
  ];
  const tbody = document.getElementById('facultyAttendanceTableBody');
  tbody.innerHTML = mockStudents.map((student) => `
    <tr>
      <td><strong>${student.rollNumber}</strong></td>
      <td>${student.name}</td>
      <td>
        <select class="attendance-status" data-roll="${student.rollNumber}">
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
          <option value="Late">Late</option>
        </select>
      </td>
      <td><input type="text" class="attendance-remark" data-roll="${student.rollNumber}" placeholder="Remark" /></td>
    </tr>`).join('');
  document.getElementById('facultyAttendanceStudents').style.display = 'block';
  showToast('Students loaded successfully', 'success');
}

function submitFacultyAttendance() {
  const classSelect = document.getElementById('facultyAttendanceClass');
  const dateInput = document.getElementById('facultyAttendanceDate');
  if (!classSelect.value || !dateInput.value) {
    showToast('Please select class and date', 'error');
    return;
  }
  const statusSelects = document.querySelectorAll('.attendance-status');
  const data = Array.from(statusSelects).map((select) => {
    const roll = select.dataset.roll;
    const remark = document.querySelector(`.attendance-remark[data-roll="${roll}"]`)?.value || '';
    return { rollNumber: roll, status: select.value, remark, class: classSelect.value, date: dateInput.value };
  });
  console.log('Attendance submitted:', data);
  showToast('Attendance submitted successfully!', 'success');
  document.getElementById('facultyAttendanceStudents').style.display = 'none';
  classSelect.value = '';
  dateInput.value = '';
}

function loadFacultyResultsStudents() {
  const classSelect = document.getElementById('facultyResultsClass');
  const semesterInput = document.getElementById('facultyResultsSemester');
  if (!classSelect.value) {
    showToast('Please select a class', 'error');
    return;
  }
  const mockStudents = [
    { rollNumber: 'CS001', name: 'John Doe' },
    { rollNumber: 'CS002', name: 'Jane Smith' },
    { rollNumber: 'CS003', name: 'Bob Johnson' },
    { rollNumber: 'CS004', name: 'Alice Brown' },
    { rollNumber: 'CS005', name: 'Charlie Wilson' }
  ];
  const tbody = document.getElementById('facultyResultsTableBody');
  tbody.innerHTML = mockStudents.map((student) => `
    <tr>
      <td><strong>${student.rollNumber}</strong></td>
      <td>${student.name}</td>
      <td><input type="number" class="result-marks" data-roll="${student.rollNumber}" placeholder="Marks" min="0" max="100" /></td>
      <td>
        <select class="result-grade" data-roll="${student.rollNumber}">
          <option value="">Grade</option>
          <option value="A+">A+</option>
          <option value="A">A</option>
          <option value="B+">B+</option>
          <option value="B">B</option>
          <option value="C+">C+</option>
          <option value="C">C</option>
          <option value="D">D</option>
          <option value="F">F</option>
        </select>
      </td>
      <td><input type="text" class="result-remark" data-roll="${student.rollNumber}" placeholder="Remark" /></td>
    </tr>`).join('');
  document.getElementById('facultyResultsStudents').style.display = 'block';
  showToast('Students loaded successfully', 'success');
}

function submitFacultyResults() {
  const classSelect = document.getElementById('facultyResultsClass');
  if (!classSelect.value) {
    showToast('Please select a class', 'error');
    return;
  }
  const entries = Array.from(document.querySelectorAll('.result-marks')).map((input) => {
    const roll = input.dataset.roll;
    const grade = document.querySelector(`.result-grade[data-roll="${roll}"]`)?.value || '';
    const remark = document.querySelector(`.result-remark[data-roll="${roll}"]`)?.value || '';
    return { rollNumber: roll, marks: Number(input.value), grade, remark, class: classSelect.value, semester: document.getElementById('facultyResultsSemester').value || 'Current' };
  }).filter((item) => item.marks >= 0 && item.grade);
  if (entries.length === 0) {
    showToast('Please enter marks and grades for at least one student', 'error');
    return;
  }
  console.log('Results submitted:', entries);
  showToast('Results submitted successfully!', 'success');
  document.getElementById('facultyResultsStudents').style.display = 'none';
  classSelect.value = '';
  document.getElementById('facultyResultsSemester').value = '';
}

function showStudentAction(action) {
  document.querySelectorAll('.student-dashboard-tab').forEach((tab) => tab.classList.remove('active'));
  document.getElementById(action).classList.add('active');
}

function showFacultyAction(action) {
  document.querySelectorAll('.faculty-dashboard-tab').forEach((tab) => tab.classList.remove('active'));
  document.getElementById(action).classList.add('active');
}

function showAdminAction(action) {
  document.querySelectorAll('.admin-tab-content .tab-content').forEach((tab) => tab.classList.remove('active'));
  document.getElementById(action).classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {
  applyTheme(localStorage.getItem('theme') || 'light');
  document.querySelectorAll('[data-page]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      showPage(button.dataset.page);
    });
  });
  document.getElementById('studentLoginForm')?.addEventListener('submit', handleStudentLogin);
  document.getElementById('studentRegisterForm')?.addEventListener('submit', handleStudentRegister);
  document.getElementById('adminLoginForm')?.addEventListener('submit', handleAdminLogin);
  document.getElementById('facultyLoginForm')?.addEventListener('submit', handleFacultyLogin);
  document.getElementById('studentAttendanceLoad')?.addEventListener('click', loadStudentAttendance);
  document.getElementById('facultyAttendanceLoad')?.addEventListener('click', loadFacultyAttendanceStudents);
  document.getElementById('facultyAttendanceSubmit')?.addEventListener('click', submitFacultyAttendance);
  document.getElementById('facultyResultsLoad')?.addEventListener('click', loadFacultyResultsStudents);
  document.getElementById('facultyResultsSubmit')?.addEventListener('click', submitFacultyResults);
  document.getElementById('studentContactForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    showToast('Thank you for contacting us! We will get back to you soon.', 'success');
    event.target.reset();
  });
  showPage(getInitialPage());
});
