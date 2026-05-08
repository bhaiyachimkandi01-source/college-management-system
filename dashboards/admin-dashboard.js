// ========== ADMIN DASHBOARD JS ==========

document.addEventListener('DOMContentLoaded', () => {
  const session = getSession();
  
  // Redirect if not authenticated
  if (!session.token || session.role !== 'admin') {
    window.location.href = '../index.html';
    return;
  }
  
  // Set user info
  document.getElementById('adminUserName').textContent = session.user?.name || session.user?.email || 'Admin';
  if (session.user?.name) {
    document.getElementById('adminAvatar').textContent = session.user.name.charAt(0).toUpperCase();
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
        document.getElementById('adminPageTitle').textContent = 
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
      case 'students':
        await loadStudents();
        break;
      case 'faculty':
        await loadFaculty();
        break;
      case 'attendance':
        await loadAttendance();
        break;
      case 'results':
        await loadResults();
        break;
      case 'fees':
        await loadFees();
        break;
      case 'notifications':
        await loadNotifications();
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
    const data = await api.admin.stats();
    
    document.getElementById('totalStudents').textContent = data.totalStudents || 0;
    document.getElementById('totalFaculty').textContent = data.totalFaculty || 0;
    document.getElementById('feeCollection').textContent = `₹${(data.feeCollection || 0).toLocaleString()}`;
    document.getElementById('pendingFees').textContent = `₹${(data.pendingFees || 0).toLocaleString()}`;
  } catch (err) {
    console.error('Error loading stats:', err);
  }
}

// ========== LOAD STUDENTS ==========
async function loadStudents() {
  try {
    const data = await api.admin.students();
    const tbody = document.getElementById('studentsTableBody');
    
    if (!data.students || data.students.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;">No students found</td></tr>';
      return;
    }
    
    tbody.innerHTML = data.students.map(student => `
      <tr>
        <td><strong>${student.rollNumber}</strong></td>
        <td>${student.name}</td>
        <td>${student.email}</td>
        <td>${student.department || 'N/A'}</td>
        <td><span style="background:#22C55E;color:white;padding:4px 8px;border-radius:4px;font-size:0.85rem;">Active</span></td>
        <td>
          <button class="btn" style="background:#4F46E5;color:white;padding:5px 10px;font-size:0.85rem;border-radius:4px;border:none;cursor:pointer;">Edit</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    document.getElementById('studentsTableBody').innerHTML = 
      `<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--text-light);">Error loading students</td></tr>`;
  }
}

// ========== LOAD FACULTY ==========
async function loadFaculty() {
  try {
    const data = await api.admin.faculty();
    const tbody = document.getElementById('facultyTableBody');
    
    if (!data.faculty || data.faculty.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;">No faculty found</td></tr>';
      return;
    }
    
    tbody.innerHTML = data.faculty.map(faculty => `
      <tr>
        <td><strong>${faculty.empId}</strong></td>
        <td>${faculty.name}</td>
        <td>${faculty.email}</td>
        <td>${faculty.department || 'N/A'}</td>
        <td><span style="background:#22C55E;color:white;padding:4px 8px;border-radius:4px;font-size:0.85rem;">Active</span></td>
        <td>
          <button class="btn" style="background:#4F46E5;color:white;padding:5px 10px;font-size:0.85rem;border-radius:4px;border:none;cursor:pointer;">Edit</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    document.getElementById('facultyTableBody').innerHTML = 
      `<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--text-light);">Error loading faculty</td></tr>`;
  }
}

// ========== LOAD ATTENDANCE ==========
async function loadAttendance() {
  try {
    const data = await api.admin.attendance();
    const tbody = document.getElementById('attendanceTableBody');
    
    if (!data.attendance || data.attendance.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:2rem;">No attendance records found</td></tr>';
      return;
    }
    
    tbody.innerHTML = data.attendance.slice(0, 10).map(record => `
      <tr>
        <td>${record.studentName}</td>
        <td>${record.subject}</td>
        <td>${new Date(record.date).toLocaleDateString()}</td>
        <td><span style="background:${record.status === 'Present' ? '#22C55E' : '#EF4444'};color:white;padding:4px 8px;border-radius:4px;font-size:0.85rem;">${record.status}</span></td>
      </tr>
    `).join('');
  } catch (err) {
    document.getElementById('attendanceTableBody').innerHTML = 
      `<tr><td colspan="4" style="text-align:center;padding:2rem;color:var(--text-light);">Error loading attendance</td></tr>`;
  }
}

// ========== LOAD RESULTS ==========
async function loadResults() {
  try {
    const data = await api.admin.results();
    const tbody = document.getElementById('resultsTableBody');
    
    if (!data.results || data.results.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem;">No results found</td></tr>';
      return;
    }
    
    tbody.innerHTML = data.results.slice(0, 10).map(result => `
      <tr>
        <td>${result.studentName}</td>
        <td>${result.subject}</td>
        <td>${result.marks}</td>
        <td>${result.grade}</td>
        <td>${result.sgpa?.toFixed(2) || 'N/A'}</td>
      </tr>
    `).join('');
  } catch (err) {
    document.getElementById('resultsTableBody').innerHTML = 
      `<tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--text-light);">Error loading results</td></tr>`;
  }
}

// ========== LOAD FEES ==========
async function loadFees() {
  try {
    const data = await api.admin.fees();
    const tbody = document.getElementById('feesTableBody');
    
    if (!data.fees || data.fees.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem;">No fee records found</td></tr>';
      return;
    }
    
    tbody.innerHTML = data.fees.slice(0, 10).map(fee => `
      <tr>
        <td>${fee.studentName}</td>
        <td>₹${fee.totalFee?.toLocaleString() || 0}</td>
        <td>₹${fee.paidAmount?.toLocaleString() || 0}</td>
        <td>₹${(fee.totalFee - fee.paidAmount)?.toLocaleString() || 0}</td>
        <td><span style="background:${fee.paidAmount >= fee.totalFee ? '#22C55E' : '#F59E0B'};color:white;padding:4px 8px;border-radius:4px;font-size:0.85rem;">${fee.paidAmount >= fee.totalFee ? 'Paid' : 'Pending'}</span></td>
      </tr>
    `).join('');
  } catch (err) {
    document.getElementById('feesTableBody').innerHTML = 
      `<tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--text-light);">Error loading fees</td></tr>`;
  }
}

// ========== LOAD NOTIFICATIONS ==========
async function loadNotifications() {
  try {
    const data = await api.admin.notifications();
    const tbody = document.getElementById('notificationsTableBody');
    
    if (!data.notifications || data.notifications.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:2rem;">No notifications found</td></tr>';
      return;
    }
    
    tbody.innerHTML = data.notifications.slice(0, 10).map(notif => `
      <tr>
        <td>${notif.message}</td>
        <td>${notif.recipientCount || 0} users</td>
        <td>${new Date(notif.createdAt).toLocaleDateString()}</td>
        <td><span style="background:#22C55E;color:white;padding:4px 8px;border-radius:4px;font-size:0.85rem;">Sent</span></td>
      </tr>
    `).join('');
  } catch (err) {
    document.getElementById('notificationsTableBody').innerHTML = 
      `<tr><td colspan="4" style="text-align:center;padding:2rem;color:var(--text-light);">Error loading notifications</td></tr>`;
  }
}
