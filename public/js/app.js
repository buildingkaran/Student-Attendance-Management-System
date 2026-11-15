/**
 * app.js - Full Stack Student Attendance Management System Frontend
 * Vanilla JavaScript (No React/Angular)
 * Student: Karan Kumar | Roll: 24107030 | Exam: 24020107011
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize App
  initClock();
  initNavigation();
  initTabs();
  initModals();
  initForms();
  initFilters();

  // Load Initial Data
  loadAllData();
});

// Cache for dropdowns and records
let cachedStudents = [];
let cachedFaculty = [];
let cachedAttendanceRecords = [];

// ================= CLOCK & STATUS =================
function initClock() {
  const clockEl = document.getElementById('clock-display');
  function updateTime() {
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString('en-US', { hour12: false });
  }
  updateTime();
  setInterval(updateTime, 1000);
}

// ================= NAVIGATION =================
function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const viewSections = document.querySelectorAll('.view-section');
  const pageTitle = document.getElementById('page-title');
  const mobileToggle = document.getElementById('mobile-toggle');
  const sidebar = document.getElementById('sidebar');

  const titles = {
    'dashboard-view': 'Dashboard Overview',
    'students-view': 'Student Management',
    'faculty-view': 'Faculty Directory',
    'mark-attendance-view': 'Mark Daily Attendance',
    'records-view': 'Attendance Records & Summary',
    'logs-view': 'Audit Logs (File System fs)',
    'devops-view': 'DevOps & System Architecture'
  };

  window.navigateView = function(targetViewId) {
    viewSections.forEach(section => {
      section.classList.toggle('active', section.id === targetViewId);
    });

    navItems.forEach(item => {
      const target = item.getAttribute('data-target');
      item.classList.toggle('active', target === targetViewId);
    });

    pageTitle.textContent = titles[targetViewId] || 'Attendance Portal';

    // Close mobile sidebar if open
    if (sidebar.classList.contains('mobile-open')) {
      sidebar.classList.remove('mobile-open');
    }

    // Refresh specific view data on navigate
    if (targetViewId === 'dashboard-view') loadDashboardStats();
    if (targetViewId === 'students-view') loadStudents();
    if (targetViewId === 'faculty-view') loadFaculty();
    if (targetViewId === 'mark-attendance-view') prepareMarkAttendanceForm();
    if (targetViewId === 'records-view') {
      loadAttendanceSummary();
      loadAttendanceRecords();
    }
    if (targetViewId === 'logs-view') loadAuditLogs();
  };

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetView = item.getAttribute('data-target');
      window.navigateView(targetView);
    });
  });

  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
    });
  }
}

// ================= TABS =================
function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetTab = btn.getAttribute('data-tab');
      const content = document.getElementById(targetTab);
      if (content) content.classList.add('active');
    });
  });
}

// ================= MODALS =================
function initModals() {
  window.openModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('open');
  };

  window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('open');
  };

  // Close when clicking on backdrop
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        backdrop.classList.remove('open');
      }
    });
  });
}

// ================= TOAST NOTIFICATIONS =================
window.showToast = function(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-text">${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
};

// ================= DATA LOADING =================
async function loadAllData() {
  await Promise.all([
    loadDashboardStats(),
    loadStudents(),
    loadFaculty(),
    loadAttendanceSummary(),
    loadAttendanceRecords(),
    loadAuditLogs()
  ]);
}

// 1. Dashboard Stats
window.loadDashboardStats = async function() {
  try {
    const res = await fetch('/api/dashboard/stats');
    const json = await res.json();
    if (!json.success) throw new Error(json.message);

    const d = json.data;
    document.getElementById('stat-total-students').textContent = d.totalStudents;
    document.getElementById('stat-total-faculty').textContent = d.totalFaculty;
    document.getElementById('stat-total-records').textContent = d.totalAttendance;
    document.getElementById('stat-overall-percentage').textContent = `${d.overallPercentage}%`;
    document.getElementById('stat-attendance-breakdown').textContent = `${d.totalPresent} Present / ${d.totalAbsent} Absent`;

    // Database connection status pill
    const pill = document.getElementById('db-status-pill');
    const label = document.getElementById('db-status-label');
    if (d.database && d.database.connected) {
      pill.classList.remove('offline');
      label.textContent = `MongoDB Atlas: Connected (${d.database.database})`;
    } else {
      pill.classList.add('offline');
      label.textContent = 'Local Persisted Storage (Ready)';
    }

    // Populate Recent Activity Table
    const tbody = document.getElementById('recent-attendance-tbody');
    tbody.innerHTML = '';
    if (!d.recentAttendance || d.recentAttendance.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4">No recent attendance records logged yet.</td></tr>';
    } else {
      d.recentAttendance.forEach(r => {
        const tr = document.createElement('tr');
        const badgeClass = r.status === 'Present' ? 'badge-present' : 'badge-absent';
        tr.innerHTML = `
          <td><strong>${r.date}</strong></td>
          <td>${r.studentName}</td>
          <td><code>${r.studentRollNo}</code></td>
          <td>${r.subject}</td>
          <td><span class="badge ${badgeClass}"><span class="badge-dot"></span>${r.status}</span></td>
        `;
        tbody.appendChild(tr);
      });
    }

  } catch (err) {
    console.error('Error loading dashboard stats:', err);
  }
};

// 2. Students List
window.loadStudents = async function(search = '') {
  try {
    const url = search ? `/api/students?search=${encodeURIComponent(search)}` : '/api/students';
    const res = await fetch(url);
    const json = await res.json();
    if (!json.success) throw new Error(json.message);

    cachedStudents = json.data;
    renderStudentsTable(cachedStudents);
    populateStudentSelect(cachedStudents);
  } catch (err) {
    console.error('Error loading students:', err);
    window.showToast('Failed to load students directory', 'error');
  }
};

function renderStudentsTable(students) {
  const tbody = document.getElementById('students-table-body');
  tbody.innerHTML = '';

  if (students.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4">No students found matching your criteria.</td></tr>';
    return;
  }

  students.forEach(s => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${s.rollNo}</strong></td>
      <td>${s.name}</td>
      <td>${s.course}</td>
      <td>Semester ${s.semester}</td>
      <td><a href="mailto:${s.email}" class="text-primary">${s.email}</a></td>
      <td>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-sm btn-info-outline" onclick="window.viewStudentHistory('${s.rollNo}')">
            History
          </button>
          <button class="btn btn-sm btn-danger-outline" onclick="window.deleteStudent('${s._id || s.rollNo}')">
            Delete
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function populateStudentSelect(students) {
  const select = document.getElementById('att-student-select');
  select.innerHTML = '<option value="">-- Choose Student from Directory --</option>';
  students.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.rollNo;
    opt.textContent = `${s.name} (${s.rollNo}) - Sem ${s.semester}`;
    select.appendChild(opt);
  });
}

// 3. Faculty List
window.loadFaculty = async function() {
  try {
    const res = await fetch('/api/faculty');
    const json = await res.json();
    if (!json.success) throw new Error(json.message);

    cachedFaculty = json.data;
    renderFacultyTable(cachedFaculty);
    populateFacultySelect(cachedFaculty);
  } catch (err) {
    console.error('Error loading faculty:', err);
  }
};

function renderFacultyTable(faculty) {
  const tbody = document.getElementById('faculty-table-body');
  tbody.innerHTML = '';

  if (faculty.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4">No faculty members found.</td></tr>';
    return;
  }

  faculty.forEach(f => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${f.facultyId}</strong></td>
      <td>${f.name}</td>
      <td>${f.department}</td>
      <td><a href="mailto:${f.email}" class="text-primary">${f.email}</a></td>
      <td>
        <button class="btn btn-sm btn-danger-outline" onclick="window.deleteFaculty('${f._id || f.facultyId}')">
          Delete
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function populateFacultySelect(faculty) {
  const select = document.getElementById('att-faculty-select');
  if (faculty.length > 0) {
    select.innerHTML = '';
    faculty.forEach(f => {
      const opt = document.createElement('option');
      opt.value = f.facultyId;
      opt.textContent = `${f.name} (${f.facultyId})`;
      select.appendChild(opt);
    });
  }
}

// 4. Attendance Summary
window.loadAttendanceSummary = async function() {
  try {
    const res = await fetch('/api/attendance/summary');
    const json = await res.json();
    if (!json.success) throw new Error(json.message);

    const summary = json.data;
    const tbody = document.getElementById('summary-table-body');
    const spotlight = document.getElementById('eligibility-spotlight-list');

    tbody.innerHTML = '';
    spotlight.innerHTML = '';

    if (summary.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" class="text-center py-4">No students enrolled yet.</td></tr>';
      spotlight.innerHTML = '<p class="text-center text-muted">No attendance metrics recorded.</p>';
      return;
    }

    summary.forEach(s => {
      const isEligible = s.percentage >= 75;
      const badgeClass = isEligible ? 'badge-eligible' : s.totalClasses === 0 ? 'badge-neutral' : 'badge-shortage';
      const fillClass = isEligible ? 'high' : 'low';

      // Table Row
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${s.rollNo}</strong></td>
        <td>${s.name}</td>
        <td>${s.course} (Sem ${s.semester})</td>
        <td>${s.totalClasses}</td>
        <td><strong class="text-success">${s.presentClasses}</strong></td>
        <td><strong class="text-danger">${s.absentClasses}</strong></td>
        <td>
          <div class="progress-bar-container">
            <div class="progress-track">
              <div class="progress-fill ${fillClass}" style="width: ${s.percentage}%"></div>
            </div>
            <span class="progress-text">${s.percentage}%</span>
          </div>
        </td>
        <td><span class="badge ${badgeClass}"><span class="badge-dot"></span>${s.eligibility}</span></td>
        <td>
          <button class="btn btn-sm btn-info-outline" onclick="window.viewStudentHistory('${s.rollNo}')">
            View Details
          </button>
        </td>
      `;
      tbody.appendChild(tr);

      // Spotlight items on Dashboard (show first 4)
      if (spotlight.children.length < 4) {
        const item = document.createElement('div');
        item.className = 'spotlight-item';
        item.innerHTML = `
          <div class="spotlight-info">
            <h4>${s.name} (${s.rollNo})</h4>
            <p>${s.presentClasses} of ${s.totalClasses} classes attended (${s.percentage}%)</p>
          </div>
          <span class="badge ${badgeClass}"><span class="badge-dot"></span>${s.eligibility}</span>
        `;
        spotlight.appendChild(item);
      }
    });

  } catch (err) {
    console.error('Error loading attendance summary:', err);
  }
};

// 5. Attendance Records (History)
window.loadAttendanceRecords = async function() {
  try {
    const subjectFilter = document.getElementById('filter-subject').value;
    const dateFilter = document.getElementById('filter-date').value;

    let queryParams = new URLSearchParams();
    if (subjectFilter) queryParams.append('subject', subjectFilter);
    if (dateFilter) queryParams.append('date', dateFilter);

    const url = `/api/attendance?${queryParams.toString()}`;
    const res = await fetch(url);
    const json = await res.json();
    if (!json.success) throw new Error(json.message);

    cachedAttendanceRecords = json.data;
    renderAttendanceRecordsTable(cachedAttendanceRecords);
    populateSubjectFilter(cachedAttendanceRecords);
  } catch (err) {
    console.error('Error loading attendance records:', err);
  }
};

function renderAttendanceRecordsTable(records) {
  const tbody = document.getElementById('attendance-records-tbody');
  tbody.innerHTML = '';

  if (records.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4">No attendance records found matching filters.</td></tr>';
    return;
  }

  records.forEach(r => {
    const tr = document.createElement('tr');
    const badgeClass = r.status === 'Present' ? 'badge-present' : 'badge-absent';
    tr.innerHTML = `
      <td><strong>${r.date}</strong></td>
      <td><code>${r.studentRollNo}</code></td>
      <td>${r.studentName}</td>
      <td>${r.subject}</td>
      <td><span class="badge ${badgeClass}"><span class="badge-dot"></span>${r.status}</span></td>
      <td><span class="text-muted">${r.markedBy || 'FAC101'}</span></td>
      <td>
        <button class="btn btn-sm btn-danger-outline" onclick="window.deleteAttendance('${r._id}')">
          Remove
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function populateSubjectFilter(records) {
  const subjectSelect = document.getElementById('filter-subject');
  const currentVal = subjectSelect.value;
  const subjects = new Set();
  records.forEach(r => subjects.add(r.subject));

  // Default common subjects
  subjects.add('Full Stack Web Development - II');
  subjects.add('Cloud Computing & DevOps');
  subjects.add('Mobile Application Development');

  subjectSelect.innerHTML = '<option value="">All Subjects</option>';
  subjects.forEach(sub => {
    const opt = document.createElement('option');
    opt.value = sub;
    opt.textContent = sub;
    if (sub === currentVal) opt.selected = true;
    subjectSelect.appendChild(opt);
  });
}

// 6. Audit Logs (File System fs)
window.loadAuditLogs = async function() {
  const terminal = document.getElementById('audit-log-terminal');
  try {
    terminal.textContent = 'Reading logs/attendance.log from disk...';
    const res = await fetch('/api/attendance/logs?limit=100');
    const json = await res.json();
    if (!json.success) throw new Error(json.message);

    if (!json.data || json.data.length === 0) {
      terminal.textContent = '// Attendance log file is currently empty.\n// Operations marked via web interface or CLI will be appended here in real-time.';
    } else {
      terminal.textContent = json.data.join('\n');
    }
  } catch (err) {
    terminal.textContent = `// Error reading audit logs: ${err.message}`;
  }
};

window.copyAuditLogs = function() {
  const text = document.getElementById('audit-log-terminal').textContent;
  navigator.clipboard.writeText(text).then(() => {
    window.showToast('Audit logs copied to clipboard!', 'success');
  }).catch(() => {
    window.showToast('Could not copy to clipboard', 'warning');
  });
};

// ================= FORM SUBMISSIONS & ACTIONS =================
function initForms() {
  // Mark Attendance Form
  const markForm = document.getElementById('mark-attendance-form');
  const markAlert = document.getElementById('mark-alert');
  const btnSubmit = document.getElementById('btn-submit-attendance');

  markForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    markAlert.className = 'alert-box d-none';
    markAlert.textContent = '';
    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Marking Attendance...';

    const studentRollNo = document.getElementById('att-student-select').value;
    const subject = document.getElementById('att-subject-select').value;
    const date = document.getElementById('att-date-input').value;
    const faculty = document.getElementById('att-faculty-select').value;
    const statusRadio = document.querySelector('input[name="attendanceStatus"]:checked');
    const status = statusRadio ? statusRadio.value : 'Present';

    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentRollNo,
          subject,
          date,
          status,
          markedBy: faculty
        })
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        // Show error or duplicate warning banner
        markAlert.className = 'alert-box alert-danger';
        markAlert.innerHTML = `<strong>⚠️ ${json.message || 'Failed to mark attendance'}</strong>`;
        window.showToast(json.message, 'error');
        return;
      }

      // Success
      markAlert.className = 'alert-box alert-success';
      markAlert.innerHTML = `<strong>✅ Success:</strong> ${json.message}`;
      window.showToast(json.message, 'success');

      // Refresh app data
      loadDashboardStats();
      loadAttendanceSummary();
      loadAttendanceRecords();
      loadAuditLogs();

    } catch (err) {
      markAlert.className = 'alert-box alert-danger';
      markAlert.textContent = `Error: ${err.message}`;
      window.showToast(err.message, 'error');
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
        Confirm & Mark Attendance
      `;
    }
  });

  // Add Student Form
  const addStudentForm = document.getElementById('add-student-form');
  addStudentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const rollNo = document.getElementById('std-roll').value;
    const name = document.getElementById('std-name').value;
    const course = document.getElementById('std-course').value;
    const semester = document.getElementById('std-semester').value;
    const email = document.getElementById('std-email').value;

    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rollNo, name, course, semester, email })
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        window.showToast(json.message, 'error');
        return;
      }

      window.showToast(`Student ${name} (${rollNo}) registered successfully!`, 'success');
      window.closeModal('add-student-modal');
      addStudentForm.reset();
      document.getElementById('std-course').value = 'B.Voc Software Development';
      document.getElementById('std-semester').value = '5';

      loadStudents();
      loadDashboardStats();
      loadAttendanceSummary();
    } catch (err) {
      window.showToast(err.message, 'error');
    }
  });

  // Add Faculty Form
  const addFacultyForm = document.getElementById('add-faculty-form');
  addFacultyForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const facultyId = document.getElementById('fac-id').value;
    const name = document.getElementById('fac-name').value;
    const department = document.getElementById('fac-dept').value;
    const email = document.getElementById('fac-email').value;

    try {
      const res = await fetch('/api/faculty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facultyId, name, department, email })
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        window.showToast(json.message, 'error');
        return;
      }

      window.showToast(`Faculty ${name} registered successfully!`, 'success');
      window.closeModal('add-faculty-modal');
      addFacultyForm.reset();
      document.getElementById('fac-dept').value = 'Department of Vocation (Software Development)';

      loadFaculty();
      loadDashboardStats();
    } catch (err) {
      window.showToast(err.message, 'error');
    }
  });
}

// Prepare mark attendance form defaults
function prepareMarkAttendanceForm() {
  const dateInput = document.getElementById('att-date-input');
  if (!dateInput.value) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
  }
}

// ================= FILTERS & SEARCH =================
function initFilters() {
  // Student search input
  const searchInput = document.getElementById('student-search-input');
  let debounceTimeout;
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      window.loadStudents(searchInput.value.trim());
    }, 300);
  });

  // Attendance history filters
  document.getElementById('filter-subject').addEventListener('change', () => {
    window.loadAttendanceRecords();
  });

  document.getElementById('filter-date').addEventListener('change', () => {
    window.loadAttendanceRecords();
  });

  window.clearAttendanceFilters = function() {
    document.getElementById('filter-subject').value = '';
    document.getElementById('filter-date').value = '';
    window.loadAttendanceRecords();
  };
}

// ================= DELETE & DETAIL ACTIONS =================
window.deleteStudent = async function(idOrRoll) {
  if (!confirm(`Are you sure you want to delete student "${idOrRoll}"? This will also remove all associated attendance logs.`)) {
    return;
  }

  try {
    const res = await fetch(`/api/students/${idOrRoll}`, { method: 'DELETE' });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);

    window.showToast(json.message, 'success');
    loadStudents();
    loadDashboardStats();
    loadAttendanceSummary();
    loadAttendanceRecords();
  } catch (err) {
    window.showToast(err.message, 'error');
  }
};

window.deleteFaculty = async function(idOrFacultyId) {
  if (!confirm(`Are you sure you want to delete faculty member "${idOrFacultyId}"?`)) {
    return;
  }

  try {
    const res = await fetch(`/api/faculty/${idOrFacultyId}`, { method: 'DELETE' });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);

    window.showToast(json.message, 'success');
    loadFaculty();
    loadDashboardStats();
  } catch (err) {
    window.showToast(err.message, 'error');
  }
};

window.deleteAttendance = async function(id) {
  if (!confirm('Are you sure you want to delete this attendance record?')) {
    return;
  }

  try {
    const res = await fetch(`/api/attendance/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);

    window.showToast('Attendance record removed.', 'success');
    loadDashboardStats();
    loadAttendanceSummary();
    loadAttendanceRecords();
  } catch (err) {
    window.showToast(err.message, 'error');
  }
};

window.viewStudentHistory = async function(rollNo) {
  try {
    const res = await fetch(`/api/attendance/student/${rollNo}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message);

    const s = json.student;
    const stats = json.stats;
    const records = json.records;

    document.getElementById('history-modal-student-name').textContent = `${s.name} (${s.rollNo})`;
    document.getElementById('history-modal-student-meta').textContent = `${s.course} • Semester ${s.semester} • ${s.email}`;
    document.getElementById('hist-total').textContent = stats.totalClasses;
    document.getElementById('hist-present').textContent = stats.presentClasses;
    document.getElementById('hist-absent').textContent = stats.absentClasses;
    document.getElementById('hist-percent').textContent = stats.percentage;
    document.getElementById('hist-eligibility').textContent = stats.isEligible ? 'Eligible (>= 75%)' : 'Attendance Shortage';
    document.getElementById('hist-eligibility').className = `val ${stats.isEligible ? 'text-success' : 'text-danger'}`;

    const tbody = document.getElementById('hist-records-tbody');
    tbody.innerHTML = '';
    if (records.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4">No attendance classes recorded for this student yet.</td></tr>';
    } else {
      records.forEach(r => {
        const tr = document.createElement('tr');
        const badgeClass = r.status === 'Present' ? 'badge-present' : 'badge-absent';
        tr.innerHTML = `
          <td><strong>${r.date}</strong></td>
          <td>${r.subject}</td>
          <td><span class="badge ${badgeClass}"><span class="badge-dot"></span>${r.status}</span></td>
          <td><span class="text-muted">${r.markedBy || 'FAC101'}</span></td>
        `;
        tbody.appendChild(tr);
      });
    }

    window.openModal('student-history-modal');
  } catch (err) {
    window.showToast(err.message, 'error');
  }
};
