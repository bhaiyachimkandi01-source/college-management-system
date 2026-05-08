// ========== STUDENT DASHBOARD JS ==========

document.addEventListener('DOMContentLoaded', () => {
  const session = getSession();
  
  // Redirect if not authenticated
  if (!session.token || session.role !== 'student') {
    window.location.href = '../index.html';
    return;
  }
  
  // Set user info
  document.getElementById('studentUserName').textContent = session.user?.name || session.user?.email || 'Student';
  if (session.user?.name) {
    document.getElementById('studentAvatar').textContent = session.user.name.charAt(0).toUpperCase();
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
        document.getElementById('studentPageTitle').textContent = 
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
        await loadAttendance();
        break;
      case 'results':
        await loadResults();
        break;
      case 'fees':
        // Fees data is static for demo
        break;
      case 'timetable':
        // Timetable data is static for demo
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
    // Mock data for demo
    document.getElementById('attendancePercent').textContent = '85%';
    document.getElementById('currentCgpa').textContent = '8.5';
    document.getElementById('feeStatus').textContent = 'Partial';
    document.getElementById('feeStatus').style.color = '#F59E0B';
    document.getElementById('unreadNotifications').textContent = '2';
    
    // Load recent attendance
    const recentAttendance = document.getElementById('recentAttendance');
    recentAttendance.innerHTML = `
      <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem;">
        <span>Computer Science 101</span>
        <span style="color:#22C55E;font-weight:600;">Present</span>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem;">
        <span>Mathematics 101</span>
        <span style="color:#22C55E;font-weight:600;">Present</span>
      </div>
      <div style="display:flex;justify-content:space-between;">
        <span>Physics 101</span>
        <span style="color:#EF4444;font-weight:600;">Absent</span>
      </div>
    `;
    
    // Load latest results
    const latestResults = document.getElementById('latestResults');
    latestResults.innerHTML = `
      <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem;">
        <span>CS101</span>
        <span style="font-weight:600;">A (95%)</span>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem;">
        <span>MATH101</span>
        <span style="font-weight:600;">B+ (87%)</span>
      </div>
      <div style="display:flex;justify-content:space-between;">
        <span>PHY101</span>
        <span style="font-weight:600;">A- (92%)</span>
      </div>
    `;
  } catch (err) {
    console.error('Error loading stats:', err);
  }
}

// ========== LOAD ATTENDANCE ==========
async function loadAttendance() {
  try {
    // Mock attendance data
    const mockAttendance = [
      { subject: 'Computer Science 101', present: 18, total: 20, percentage: 90 },
      { subject: 'Mathematics 101', present: 16, total: 20, percentage: 80 },
      { subject: 'Physics 101', present: 17, total: 20, percentage: 85 },
      { subject: 'Chemistry 101', present: 19, total: 20, percentage: 95 },
      { subject: 'English 101', present: 15, total: 20, percentage: 75 }
    ];
    
    const tbody = document.getElementById('attendanceTableBody');
    tbody.innerHTML = mockAttendance.map(att => `
      <tr>
        <td><strong>${att.subject}</strong></td>
        <td>${att.present}</td>
        <td>${att.total}</td>
        <td>${att.percentage}%</td>
        <td>
          <span style="background:${att.percentage >= 75 ? '#22C55E' : att.percentage >= 60 ? '#F59E0B' : '#EF4444'};color:white;padding:4px 8px;border-radius:4px;font-size:0.85rem;">
            ${att.percentage >= 75 ? 'Good' : att.percentage >= 60 ? 'Average' : 'Poor'}
          </span>
        </td>
      </tr>
    `).join('');
    
    // Update overall attendance
    const totalPresent = mockAttendance.reduce((sum, att) => sum + att.present, 0);
    const totalClasses = mockAttendance.reduce((sum, att) => sum + att.total, 0);
    const overallPercent = Math.round((totalPresent / totalClasses) * 100);
    
    document.getElementById('overallAttendance').textContent = `${overallPercent}%`;
    document.getElementById('attendanceBar').style.width = `${overallPercent}%`;
  } catch (err) {
    document.getElementById('attendanceTableBody').innerHTML = 
      `<tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--text-light);">Error loading attendance</td></tr>`;
  }
}

// ========== LOAD RESULTS ==========
async function loadResults() {
  try {
    // Mock results data
    const mockResults = [
      { semester: 'Fall 2023', subject: 'Computer Science 101', marks: 95, grade: 'A', sgpa: 9.5, credits: 4 },
      { semester: 'Fall 2023', subject: 'Mathematics 101', marks: 87, grade: 'B+', sgpa: 8.7, credits: 4 },
      { semester: 'Fall 2023', subject: 'Physics 101', marks: 92, grade: 'A-', sgpa: 9.2, credits: 3 },
      { semester: 'Spring 2024', subject: 'Chemistry 101', marks: 89, grade: 'B+', sgpa: 8.9, credits: 4 },
      { semester: 'Spring 2024', subject: 'English 101', marks: 91, grade: 'A-', sgpa: 9.1, credits: 3 }
    ];
    
    const tbody = document.getElementById('resultsTableBody');
    tbody.innerHTML = mockResults.map(result => `
      <tr>
        <td>${result.semester}</td>
        <td><strong>${result.subject}</strong></td>
        <td>${result.marks}</td>
        <td><span style="font-weight:600;">${result.grade}</span></td>
        <td>${result.sgpa}</td>
        <td>${result.credits}</td>
      </tr>
    `).join('');
    
    // Calculate CGPA
    const totalCredits = mockResults.reduce((sum, r) => sum + r.credits, 0);
    const weightedSum = mockResults.reduce((sum, r) => sum + (r.sgpa * r.credits), 0);
    const cgpa = (weightedSum / totalCredits).toFixed(2);
    
    document.getElementById('resultsCgpa').textContent = cgpa;
  } catch (err) {
    document.getElementById('resultsTableBody').innerHTML = 
      `<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--text-light);">Error loading results</td></tr>`;
  }
}

// ========== LOAD NOTIFICATIONS ==========
async function loadNotifications() {
  try {
    // Mock notifications for demo
    const mockNotifications = [
      {
        id: 1,
        message: 'Your fee payment of ₹25,000 has been received',
        date: '2024-01-15',
        read: false
      },
      {
        id: 2,
        message: 'New semester timetable has been published',
        date: '2024-01-14',
        read: true
      },
      {
        id: 3,
        message: 'Mid-term examination schedule released',
        date: '2024-01-10',
        read: false
      },
      {
        id: 4,
        message: 'Library books due date reminder',
        date: '2024-01-08',
        read: true
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
          <label style="display:block;font-weight:600;margin-bottom:0.5rem;">Roll Number</label>
          <p style="padding:0.5rem;background:var(--bg-light);border-radius:4px;">${session.user?.rollNumber || 'N/A'}</p>
        </div>
        <div>
          <label style="display:block;font-weight:600;margin-bottom:0.5rem;">Email</label>
          <p style="padding:0.5rem;background:var(--bg-light);border-radius:4px;">${session.user?.email || 'N/A'}</p>
        </div>
        <div>
          <label style="display:block;font-weight:600;margin-bottom:0.5rem;">Department</label>
          <p style="padding:0.5rem;background:var(--bg-light);border-radius:4px;">${session.user?.department || 'N/A'}</p>
        </div>
        <div>
          <label style="display:block;font-weight:600;margin-bottom:0.5rem;">Course</label>
          <p style="padding:0.5rem;background:var(--bg-light);border-radius:4px;">${session.user?.course || 'N/A'}</p>
        </div>
        <div>
          <label style="display:block;font-weight:600;margin-bottom:0.5rem;">Semester</label>
          <p style="padding:0.5rem;background:var(--bg-light);border-radius:4px;">${session.user?.semester || 'N/A'}</p>
        </div>
        <div>
          <label style="display:block;font-weight:600;margin-bottom:0.5rem;">Phone</label>
          <p style="padding:0.5rem;background:var(--bg-light);border-radius:4px;">${session.user?.phone || 'N/A'}</p>
        </div>
        <div>
          <label style="display:block;font-weight:600;margin-bottom:0.5rem;">Date of Birth</label>
          <p style="padding:0.5rem;background:var(--bg-light);border-radius:4px;">${session.user?.dob ? new Date(session.user.dob).toLocaleDateString() : 'N/A'}</p>
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
