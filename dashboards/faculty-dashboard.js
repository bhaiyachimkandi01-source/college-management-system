// ========== FACULTY DASHBOARD JS ==========

document.addEventListener('DOMContentLoaded', () => {
  const session = getSession();
  
  // Redirect if not authenticated
  if (!session.token || session.role !== 'faculty') {
    window.location.href = '../index.html';
    return;
  }
  
  // Set user info
  document.getElementById('facultyUserName').textContent = session.user?.name || session.user?.email || 'Faculty';
  if (session.user?.name) {
    document.getElementById('facultyAvatar').textContent = session.user.name.charAt(0).toUpperCase();
  }
  
  // Setup sidebar navigation
  setupSidebarNavigation();
  
  // Load initial data
  loadDashboardStats();
});

// ========== SIDEBAR NAVIGATION ==========
function setupSidebarNavigation() {
  const menuItems = document.querySelectorAll('.admin-sidebar-menu a');
  
  menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Remove active class from all items
      menuItems.forEach(mi => mi.classList.remove('active'));
      item.classList.add('active');
      
      // Hide all tabs
      const tabs = document.querySelectorAll('.tab-content');
      tabs.forEach(tab => tab.classList.remove('active'));
      
      // Show selected tab
      const tabName = item.getAttribute('data-tab');
      const tab = document.getElementById(tabName);
      if (tab) {
        tab.classList.add('active');
        document.getElementById('facultyPageTitle').textContent = 
          item.textContent.trim().replace(/[\n\r]/g, '').trim();
        
        // Load data for the tab
        loadTabData(tabName);
      }
    });
  });
}

// ========== LOAD TAB DATA ==========
async function loadTabData(tabName) {
  try {
    switch(tabName) {
      case 'dashboard':
        await loadDashboardStats();
        break;
      case 'attendance':
        // Attendance tab is ready for interaction
        break;
      case 'results':
        // Results tab is ready for interaction
        break;
      case 'notifications':
        await loadNotifications();
        break;
      case 'profile':
        await loadProfile();
        break;
    }
  } catch (err) {
    console.error(`Error loading ${tabName}:`, err);
    showToast(`Failed to load ${tabName}`, 'error');
  }
}

// ========== LOAD DASHBOARD STATS ==========
async function loadDashboardStats() {
  try {
    // Mock data for demo - in real app, this would come from API
    document.getElementById('myClasses').textContent = '3';
    document.getElementById('studentsTaught').textContent = '45';
    document.getElementById('resultsPosted').textContent = '12';
    document.getElementById('unreadNotifications').textContent = '2';
  } catch (err) {
    console.error('Error loading stats:', err);
  }
}

// ========== ATTENDANCE FUNCTIONS ==========
function loadAttendanceStudents() {
  const classSelect = document.getElementById('attendanceClass');
  const dateInput = document.getElementById('attendanceDate');
  
  if (!classSelect.value || !dateInput.value) {
    showToast('Please select both class and date', 'error');
    return;
  }
  
  // Mock student data for demo
  const mockStudents = [
    { rollNumber: 'CS001', name: 'John Doe' },
    { rollNumber: 'CS002', name: 'Jane Smith' },
    { rollNumber: 'CS003', name: 'Bob Johnson' },
    { rollNumber: 'CS004', name: 'Alice Brown' },
    { rollNumber: 'CS005', name: 'Charlie Wilson' }
  ];
  
  const tbody = document.getElementById('attendanceTableBody');
  tbody.innerHTML = mockStudents.map(student => `
    <tr>
      <td><strong>${student.rollNumber}</strong></td>
      <td>${student.name}</td>
      <td>
        <select class="attendance-status" data-roll="${student.rollNumber}" style="padding:4px 8px;border:1px solid var(--border);border-radius:4px;">
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
          <option value="Late">Late</option>
        </select>
      </td>
      <td>
        <input type="text" class="attendance-remark" data-roll="${student.rollNumber}" placeholder="Remark (optional)" style="padding:4px 8px;border:1px solid var(--border);border-radius:4px;width:120px;" />
      </td>
    </tr>
  `).join('');
  
  document.getElementById('attendanceStudents').style.display = 'block';
  showToast('Students loaded successfully', 'success');
}

function submitAttendance() {
  const classSelect = document.getElementById('attendanceClass');
  const dateInput = document.getElementById('attendanceDate');
  
  if (!classSelect.value || !dateInput.value) {
    showToast('Please select class and date', 'error');
    return;
  }
  
  // Collect attendance data
  const attendanceData = [];
  const statusSelects = document.querySelectorAll('.attendance-status');
  const remarkInputs = document.querySelectorAll('.attendance-remark');
  
  statusSelects.forEach(select => {
    const rollNumber = select.getAttribute('data-roll');
    const remarkInput = document.querySelector(`.attendance-remark[data-roll="${rollNumber}"]`);
    
    attendanceData.push({
      rollNumber,
      status: select.value,
      remark: remarkInput ? remarkInput.value : '',
      class: classSelect.value,
      date: dateInput.value
    });
  });
  
  // In real app, send to API
  console.log('Attendance data:', attendanceData);
  showToast('Attendance submitted successfully!', 'success');
  
  // Reset form
  document.getElementById('attendanceStudents').style.display = 'none';
  classSelect.value = '';
  dateInput.value = '';
}

// ========== RESULTS FUNCTIONS ==========
function loadResultsStudents() {
  const classSelect = document.getElementById('resultsClass');
  const semesterInput = document.getElementById('resultsSemester');
  
  if (!classSelect.value) {
    showToast('Please select a class', 'error');
    return;
  }
  
  // Mock student data for demo
  const mockStudents = [
    { rollNumber: 'CS001', name: 'John Doe' },
    { rollNumber: 'CS002', name: 'Jane Smith' },
    { rollNumber: 'CS003', name: 'Bob Johnson' },
    { rollNumber: 'CS004', name: 'Alice Brown' },
    { rollNumber: 'CS005', name: 'Charlie Wilson' }
  ];
  
  const tbody = document.getElementById('resultsTableBody');
  tbody.innerHTML = mockStudents.map(student => `
    <tr>
      <td><strong>${student.rollNumber}</strong></td>
      <td>${student.name}</td>
      <td>
        <input type="number" class="result-marks" data-roll="${student.rollNumber}" placeholder="Marks" min="0" max="100" style="padding:4px 8px;border:1px solid var(--border);border-radius:4px;width:80px;" />
      </td>
      <td>
        <select class="result-grade" data-roll="${student.rollNumber}" style="padding:4px 8px;border:1px solid var(--border);border-radius:4px;">
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
      <td>
        <input type="text" class="result-remark" data-roll="${student.rollNumber}" placeholder="Remark" style="padding:4px 8px;border:1px solid var(--border);border-radius:4px;width:120px;" />
      </td>
    </tr>
  `).join('');
  
  document.getElementById('resultsStudents').style.display = 'block';
  showToast('Students loaded successfully', 'success');
}

function submitResults() {
  const classSelect = document.getElementById('resultsClass');
  const semesterInput = document.getElementById('resultsSemester');
  
  if (!classSelect.value) {
    showToast('Please select a class', 'error');
    return;
  }
  
  // Collect results data
  const resultsData = [];
  const marksInputs = document.querySelectorAll('.result-marks');
  const gradeSelects = document.querySelectorAll('.result-grade');
  const remarkInputs = document.querySelectorAll('.result-remark');
  
  marksInputs.forEach(input => {
    const rollNumber = input.getAttribute('data-roll');
    const gradeSelect = document.querySelector(`.result-grade[data-roll="${rollNumber}"]`);
    const remarkInput = document.querySelector(`.result-remark[data-roll="${rollNumber}"]`);
    
    if (input.value && gradeSelect.value) {
      resultsData.push({
        rollNumber,
        marks: parseInt(input.value),
        grade: gradeSelect.value,
        remark: remarkInput ? remarkInput.value : '',
        class: classSelect.value,
        semester: semesterInput.value || 'Current Semester'
      });
    }
  });
  
  if (resultsData.length === 0) {
    showToast('Please enter marks and grades for at least one student', 'error');
    return;
  }
  
  // In real app, send to API
  console.log('Results data:', resultsData);
  showToast('Results submitted successfully!', 'success');
  
  // Reset form
  document.getElementById('resultsStudents').style.display = 'none';
  classSelect.value = '';
  semesterInput.value = '';
}

// ========== LOAD NOTIFICATIONS ==========
async function loadNotifications() {
  try {
    // Mock notifications for demo
    const mockNotifications = [
      {
        id: 1,
        message: 'New semester timetable has been published',
        date: '2024-01-15',
        read: false
      },
      {
        id: 2,
        message: 'Faculty meeting scheduled for tomorrow at 2 PM',
        date: '2024-01-14',
        read: true
      },
      {
        id: 3,
        message: 'Please submit course completion reports by end of week',
        date: '2024-01-10',
        read: false
      }
    ];
    
    const notificationsList = document.getElementById('notificationsList');
    notificationsList.innerHTML = mockNotifications.map(notif => `
      <div style="background:var(--bg-white);padding:1rem;border-radius:8px;margin-bottom:0.5rem;border-left:4px solid ${notif.read ? 'var(--text-light)' : 'var(--primary)'};">
        <p style="margin:0 0 0.5rem 0;font-weight:${notif.read ? 'normal' : '600'};">${notif.message}</p>
        <small style="color:var(--text-light);">${new Date(notif.date).toLocaleDateString()}</small>
        ${!notif.read ? '<span style="background:var(--primary);color:white;padding:2px 6px;border-radius:10px;font-size:0.75rem;margin-left:0.5rem;">New</span>' : ''}
      </div>
    `).join('');
  } catch (err) {
    document.getElementById('notificationsList').innerHTML = 
      '<p style="text-align:center;color:var(--text-light);padding:2rem;">Error loading notifications</p>';
  }
}

// ========== LOAD PROFILE ==========
async function loadProfile() {
  try {
    const session = getSession();
    const profileContent = document.getElementById('profileContent');
    
    profileContent.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;margin-bottom:1.5rem;">
        <div>
          <label style="display:block;font-weight:600;margin-bottom:0.5rem;">Name</label>
          <p style="padding:0.5rem;background:var(--bg-light);border-radius:4px;">${session.user?.name || 'N/A'}</p>
        </div>
        <div>
          <label style="display:block;font-weight:600;margin-bottom:0.5rem;">Email</label>
          <p style="padding:0.5rem;background:var(--bg-light);border-radius:4px;">${session.user?.email || 'N/A'}</p>
        </div>
        <div>
          <label style="display:block;font-weight:600;margin-bottom:0.5rem;">Employee ID</label>
          <p style="padding:0.5rem;background:var(--bg-light);border-radius:4px;">${session.user?.empId || 'N/A'}</p>
        </div>
        <div>
          <label style="display:block;font-weight:600;margin-bottom:0.5rem;">Department</label>
          <p style="padding:0.5rem;background:var(--bg-light);border-radius:4px;">${session.user?.department || 'N/A'}</p>
        </div>
        <div>
          <label style="display:block;font-weight:600;margin-bottom:0.5rem;">Designation</label>
          <p style="padding:0.5rem;background:var(--bg-light);border-radius:4px;">${session.user?.designation || 'N/A'}</p>
        </div>
        <div>
          <label style="display:block;font-weight:600;margin-bottom:0.5rem;">Joining Date</label>
          <p style="padding:0.5rem;background:var(--bg-light);border-radius:4px;">${session.user?.joiningDate ? new Date(session.user.joiningDate).toLocaleDateString() : 'N/A'}</p>
        </div>
      </div>
      <div style="text-align:center;margin-top:2rem;">
        <button class="btn btn-primary" onclick="alert('Edit profile form would appear here')">Edit Profile</button>
      </div>
    `;
  } catch (err) {
    document.getElementById('profileContent').innerHTML = 
      '<p style="text-align:center;color:var(--text-light);padding:2rem;">Error loading profile</p>';
  }
}
