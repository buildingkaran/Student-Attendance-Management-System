const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Attendance = require('../models/Attendance');

const dataDir = path.join(__dirname, '..', 'data');
const localDbPath = path.join(dataDir, 'local_db.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initial seed data for immediate demonstration if MongoDB Atlas is not yet connected
const defaultSeedData = {
  students: [
    {
      _id: 'seed_std_1',
      rollNo: '24107030',
      name: 'Karan Kumar',
      course: 'B.Voc Software Development',
      semester: 5,
      email: 'karan.kumar@college.edu',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'seed_std_2',
      rollNo: '24107031',
      name: 'Priya Sharma',
      course: 'B.Voc Software Development',
      semester: 5,
      email: 'priya.sharma@college.edu',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'seed_std_3',
      rollNo: '24107032',
      name: 'Rahul Verma',
      course: 'B.Voc Software Development',
      semester: 5,
      email: 'rahul.verma@college.edu',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'seed_std_4',
      rollNo: '24107033',
      name: 'Ananya Gupta',
      course: 'B.Voc Software Development',
      semester: 5,
      email: 'ananya.gupta@college.edu',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'seed_std_5',
      rollNo: '24107034',
      name: 'Amit Singh',
      course: 'B.Voc Software Development',
      semester: 5,
      email: 'amit.singh@college.edu',
      createdAt: new Date().toISOString()
    }
  ],
  faculty: [
    {
      _id: 'seed_fac_1',
      facultyId: 'FAC101',
      name: 'Dr. Rajesh Khanna',
      department: 'Department of Vocation (Software Development)',
      email: 'r.khanna@college.edu',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'seed_fac_2',
      facultyId: 'FAC102',
      name: 'Prof. Sunita Rao',
      department: 'Computer Applications',
      email: 's.rao@college.edu',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'seed_fac_3',
      facultyId: 'FAC103',
      name: 'Dr. Vikram Seth',
      department: 'Information Technology',
      email: 'v.seth@college.edu',
      createdAt: new Date().toISOString()
    }
  ],
  attendance: [
    {
      _id: 'seed_att_1',
      studentRollNo: '24107030',
      studentName: 'Karan Kumar',
      subject: 'Full Stack Web Development - II',
      date: '2026-11-10',
      status: 'Present',
      markedBy: 'FAC101',
      createdAt: new Date('2026-11-10T10:00:00Z').toISOString()
    },
    {
      _id: 'seed_att_2',
      studentRollNo: '24107030',
      studentName: 'Karan Kumar',
      subject: 'Full Stack Web Development - II',
      date: '2026-11-11',
      status: 'Present',
      markedBy: 'FAC101',
      createdAt: new Date('2026-11-11T10:00:00Z').toISOString()
    },
    {
      _id: 'seed_att_3',
      studentRollNo: '24107030',
      studentName: 'Karan Kumar',
      subject: 'Full Stack Web Development - II',
      date: '2026-11-12',
      status: 'Present',
      markedBy: 'FAC101',
      createdAt: new Date('2026-11-12T10:00:00Z').toISOString()
    },
    {
      _id: 'seed_att_4',
      studentRollNo: '24107030',
      studentName: 'Karan Kumar',
      subject: 'Cloud Computing & DevOps',
      date: '2026-11-13',
      status: 'Present',
      markedBy: 'FAC102',
      createdAt: new Date('2026-11-13T10:00:00Z').toISOString()
    },
    {
      _id: 'seed_att_5',
      studentRollNo: '24107031',
      studentName: 'Priya Sharma',
      subject: 'Full Stack Web Development - II',
      date: '2026-11-10',
      status: 'Present',
      markedBy: 'FAC101',
      createdAt: new Date('2026-11-10T10:00:00Z').toISOString()
    },
    {
      _id: 'seed_att_6',
      studentRollNo: '24107031',
      studentName: 'Priya Sharma',
      subject: 'Full Stack Web Development - II',
      date: '2026-11-11',
      status: 'Absent',
      markedBy: 'FAC101',
      createdAt: new Date('2026-11-11T10:00:00Z').toISOString()
    },
    {
      _id: 'seed_att_7',
      studentRollNo: '24107032',
      studentName: 'Rahul Verma',
      subject: 'Full Stack Web Development - II',
      date: '2026-11-10',
      status: 'Absent',
      markedBy: 'FAC101',
      createdAt: new Date('2026-11-10T10:00:00Z').toISOString()
    },
    {
      _id: 'seed_att_8',
      studentRollNo: '24107033',
      studentName: 'Ananya Gupta',
      subject: 'Full Stack Web Development - II',
      date: '2026-11-10',
      status: 'Present',
      markedBy: 'FAC101',
      createdAt: new Date('2026-11-10T10:00:00Z').toISOString()
    }
  ]
};

// Initialize local DB file if not exists
function readLocalDb() {
  try {
    if (!fs.existsSync(localDbPath)) {
      fs.writeFileSync(localDbPath, JSON.stringify(defaultSeedData, null, 2), 'utf8');
      return JSON.parse(JSON.stringify(defaultSeedData));
    }
    const raw = fs.readFileSync(localDbPath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading local DB:', err);
    return JSON.parse(JSON.stringify(defaultSeedData));
  }
}

function writeLocalDb(data) {
  try {
    fs.writeFileSync(localDbPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing to local DB:', err);
  }
}

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

// ----------------- STUDENT OPERATIONS -----------------

async function getAllStudents(searchQuery = '') {
  if (isDbConnected()) {
    let filter = {};
    if (searchQuery) {
      const regex = new RegExp(searchQuery, 'i');
      filter = {
        $or: [{ name: regex }, { rollNo: regex }, { course: regex }, { email: regex }]
      };
    }
    return await Student.find(filter).sort({ rollNo: 1 });
  }

  const db = readLocalDb();
  let students = db.students || [];
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    students = students.filter(
      s =>
        s.name.toLowerCase().includes(q) ||
        s.rollNo.toLowerCase().includes(q) ||
        s.course.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)
    );
  }
  return students.sort((a, b) => a.rollNo.localeCompare(b.rollNo));
}

async function findStudentByRoll(rollNo) {
  if (isDbConnected()) {
    return await Student.findOne({ rollNo: rollNo.trim() });
  }
  const db = readLocalDb();
  return (db.students || []).find(s => s.rollNo.toLowerCase() === rollNo.trim().toLowerCase());
}

async function createStudent(data) {
  const { rollNo, name, course, semester, email } = data;

  if (isDbConnected()) {
    const existing = await Student.findOne({ rollNo: rollNo.trim() });
    if (existing) {
      const err = new Error(`Student with Roll Number ${rollNo} already exists.`);
      err.statusCode = 409;
      throw err;
    }
    const student = new Student({
      rollNo: rollNo.trim(),
      name: name.trim(),
      course: course.trim(),
      semester: Number(semester),
      email: email.trim().toLowerCase()
    });
    return await student.save();
  }

  const db = readLocalDb();
  const existing = (db.students || []).find(s => s.rollNo.toLowerCase() === rollNo.trim().toLowerCase());
  if (existing) {
    const err = new Error(`Student with Roll Number ${rollNo} already exists.`);
    err.statusCode = 409;
    throw err;
  }

  const newStudent = {
    _id: 'std_' + Date.now(),
    rollNo: rollNo.trim(),
    name: name.trim(),
    course: course.trim(),
    semester: Number(semester),
    email: email.trim().toLowerCase(),
    createdAt: new Date().toISOString()
  };

  db.students = db.students || [];
  db.students.push(newStudent);
  writeLocalDb(db);
  return newStudent;
}

async function deleteStudent(idOrRoll) {
  if (isDbConnected()) {
    let deleted;
    if (mongoose.Types.ObjectId.isValid(idOrRoll)) {
      deleted = await Student.findByIdAndDelete(idOrRoll);
    }
    if (!deleted) {
      deleted = await Student.findOneAndDelete({ rollNo: idOrRoll });
    }
    if (deleted) {
      // Also cascade delete attendance records for this student
      await Attendance.deleteMany({ studentRollNo: deleted.rollNo });
    }
    return deleted;
  }

  const db = readLocalDb();
  const index = (db.students || []).findIndex(
    s => s._id === idOrRoll || s.rollNo === idOrRoll
  );
  if (index === -1) return null;

  const [removed] = db.students.splice(index, 1);
  // Remove attendance records too
  db.attendance = (db.attendance || []).filter(a => a.studentRollNo !== removed.rollNo);
  writeLocalDb(db);
  return removed;
}

// ----------------- FACULTY OPERATIONS -----------------

async function getAllFaculty() {
  if (isDbConnected()) {
    return await Faculty.find().sort({ facultyId: 1 });
  }
  const db = readLocalDb();
  return (db.faculty || []).sort((a, b) => a.facultyId.localeCompare(b.facultyId));
}

async function createFaculty(data) {
  const { facultyId, name, department, email } = data;

  if (isDbConnected()) {
    const existing = await Faculty.findOne({ facultyId: facultyId.trim() });
    if (existing) {
      const err = new Error(`Faculty with ID ${facultyId} already exists.`);
      err.statusCode = 409;
      throw err;
    }
    const faculty = new Faculty({
      facultyId: facultyId.trim(),
      name: name.trim(),
      department: department.trim(),
      email: email.trim().toLowerCase()
    });
    return await faculty.save();
  }

  const db = readLocalDb();
  const existing = (db.faculty || []).find(f => f.facultyId.toLowerCase() === facultyId.trim().toLowerCase());
  if (existing) {
    const err = new Error(`Faculty with ID ${facultyId} already exists.`);
    err.statusCode = 409;
    throw err;
  }

  const newFaculty = {
    _id: 'fac_' + Date.now(),
    facultyId: facultyId.trim(),
    name: name.trim(),
    department: department.trim(),
    email: email.trim().toLowerCase(),
    createdAt: new Date().toISOString()
  };

  db.faculty = db.faculty || [];
  db.faculty.push(newFaculty);
  writeLocalDb(db);
  return newFaculty;
}

async function deleteFaculty(idOrFacultyId) {
  if (isDbConnected()) {
    let deleted;
    if (mongoose.Types.ObjectId.isValid(idOrFacultyId)) {
      deleted = await Faculty.findByIdAndDelete(idOrFacultyId);
    }
    if (!deleted) {
      deleted = await Faculty.findOneAndDelete({ facultyId: idOrFacultyId });
    }
    return deleted;
  }

  const db = readLocalDb();
  const index = (db.faculty || []).findIndex(
    f => f._id === idOrFacultyId || f.facultyId === idOrFacultyId
  );
  if (index === -1) return null;

  const [removed] = db.faculty.splice(index, 1);
  writeLocalDb(db);
  return removed;
}

// ----------------- ATTENDANCE OPERATIONS -----------------

async function markAttendance(data) {
  const { studentRollNo, subject, date, status, markedBy } = data;

  // 1. Verify student exists
  const student = await findStudentByRoll(studentRollNo);
  if (!student) {
    const err = new Error(`Student with Roll Number ${studentRollNo} does not exist. Please register the student first.`);
    err.statusCode = 404;
    throw err;
  }

  // 2. Prevent duplicate attendance for same student, subject and date
  if (isDbConnected()) {
    const duplicate = await Attendance.findOne({
      studentRollNo: student.rollNo,
      subject: subject.trim(),
      date: date.trim()
    });

    if (duplicate) {
      const err = new Error(
        `Duplicate Attendance: Attendance for student ${student.name} (${student.rollNo}) in subject "${subject}" on ${date} has already been marked as "${duplicate.status}".`
      );
      err.statusCode = 409;
      throw err;
    }

    const attendanceRecord = new Attendance({
      studentRollNo: student.rollNo,
      studentName: student.name,
      subject: subject.trim(),
      date: date.trim(),
      status: status.trim(),
      markedBy: markedBy ? markedBy.trim() : 'FAC101'
    });

    return await attendanceRecord.save();
  }

  const db = readLocalDb();
  const duplicate = (db.attendance || []).find(
    a =>
      a.studentRollNo.toLowerCase() === student.rollNo.toLowerCase() &&
      a.subject.toLowerCase() === subject.trim().toLowerCase() &&
      a.date === date.trim()
  );

  if (duplicate) {
    const err = new Error(
      `Duplicate Attendance: Attendance for student ${student.name} (${student.rollNo}) in subject "${subject}" on ${date} has already been marked as "${duplicate.status}".`
    );
    err.statusCode = 409;
    throw err;
  }

  const newRecord = {
    _id: 'att_' + Date.now(),
    studentRollNo: student.rollNo,
    studentName: student.name,
    subject: subject.trim(),
    date: date.trim(),
    status: status.trim(),
    markedBy: markedBy ? markedBy.trim() : 'FAC101',
    createdAt: new Date().toISOString()
  };

  db.attendance = db.attendance || [];
  db.attendance.push(newRecord);
  writeLocalDb(db);
  return newRecord;
}

async function getAttendanceRecords(filters = {}) {
  const { rollNo, subject, date } = filters;

  if (isDbConnected()) {
    const query = {};
    if (rollNo) query.studentRollNo = rollNo.trim();
    if (subject) query.subject = subject.trim();
    if (date) query.date = date.trim();
    return await Attendance.find(query).sort({ date: -1, createdAt: -1 });
  }

  const db = readLocalDb();
  let records = db.attendance || [];
  if (rollNo) {
    records = records.filter(r => r.studentRollNo.toLowerCase() === rollNo.trim().toLowerCase());
  }
  if (subject) {
    records = records.filter(r => r.subject.toLowerCase() === subject.trim().toLowerCase());
  }
  if (date) {
    records = records.filter(r => r.date === date.trim());
  }
  return records.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
}

async function deleteAttendanceRecord(id) {
  if (isDbConnected()) {
    if (mongoose.Types.ObjectId.isValid(id)) {
      return await Attendance.findByIdAndDelete(id);
    }
    return null;
  }

  const db = readLocalDb();
  const index = (db.attendance || []).findIndex(a => a._id === id);
  if (index === -1) return null;

  const [removed] = db.attendance.splice(index, 1);
  writeLocalDb(db);
  return removed;
}

// ----------------- CALCULATIONS & AGGREGATION -----------------

/**
 * Calculates attendance statistics for each student:
 * Total classes, attended classes, attendance percentage, and status.
 */
async function getAttendanceSummary() {
  const allStudents = await getAllStudents();

  if (isDbConnected()) {
    // MongoDB Aggregation Pipeline demonstration
    const aggregationResults = await Attendance.aggregate([
      {
        $group: {
          _id: '$studentRollNo',
          totalClasses: { $sum: 1 },
          presentClasses: {
            $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] }
          },
          absentClasses: {
            $sum: { $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0] }
          }
        }
      }
    ]);

    const statsMap = {};
    aggregationResults.forEach(r => {
      statsMap[r._id] = r;
    });

    return allStudents.map(student => {
      const stats = statsMap[student.rollNo] || { totalClasses: 0, presentClasses: 0, absentClasses: 0 };
      const percentage = stats.totalClasses > 0
        ? Number(((stats.presentClasses / stats.totalClasses) * 100).toFixed(2))
        : 0;

      return {
        rollNo: student.rollNo,
        name: student.name,
        course: student.course,
        semester: student.semester,
        email: student.email,
        totalClasses: stats.totalClasses,
        presentClasses: stats.presentClasses,
        absentClasses: stats.absentClasses,
        percentage,
        eligibility: percentage >= 75 ? 'Eligible' : stats.totalClasses === 0 ? 'No Classes' : 'Shortage'
      };
    });
  }

  // Fallback memory calculation
  const db = readLocalDb();
  const attendance = db.attendance || [];

  return allStudents.map(student => {
    const studentRecords = attendance.filter(
      a => a.studentRollNo.toLowerCase() === student.rollNo.toLowerCase()
    );
    const totalClasses = studentRecords.length;
    const presentClasses = studentRecords.filter(a => a.status === 'Present').length;
    const absentClasses = totalClasses - presentClasses;
    const percentage = totalClasses > 0
      ? Number(((presentClasses / totalClasses) * 100).toFixed(2))
      : 0;

    return {
      rollNo: student.rollNo,
      name: student.name,
      course: student.course,
      semester: student.semester,
      email: student.email,
      totalClasses,
      presentClasses,
      absentClasses,
      percentage,
      eligibility: percentage >= 75 ? 'Eligible' : totalClasses === 0 ? 'No Classes' : 'Shortage'
    };
  });
}

/**
 * Returns overall dashboard statistics:
 * Total students, total faculty, total attendance records, overall attendance rate.
 */
async function getDashboardStats() {
  const students = await getAllStudents();
  const faculty = await getAllFaculty();
  const attendance = await getAttendanceRecords();

  const totalStudents = students.length;
  const totalFaculty = faculty.length;
  const totalAttendance = attendance.length;

  const totalPresent = attendance.filter(a => a.status === 'Present').length;
  const totalAbsent = totalAttendance - totalPresent;
  const overallPercentage = totalAttendance > 0
    ? Number(((totalPresent / totalAttendance) * 100).toFixed(1))
    : 0;

  // Recent attendance records (last 5)
  const recentAttendance = attendance.slice(0, 5);

  return {
    totalStudents,
    totalFaculty,
    totalAttendance,
    totalPresent,
    totalAbsent,
    overallPercentage,
    recentAttendance
  };
}

/**
 * Seeds initial demo data to MongoDB Atlas if collections are currently empty.
 */
async function seedDatabaseIfEmpty() {
  if (!isDbConnected()) return;
  try {
    const studentCount = await Student.countDocuments();
    if (studentCount === 0) {
      console.log('🌱 [MongoDB Atlas] Seeding initial student records...');
      const cleanStudents = defaultSeedData.students.map(({ _id, ...s }) => s);
      await Student.insertMany(cleanStudents);
    }

    const facultyCount = await Faculty.countDocuments();
    if (facultyCount === 0) {
      console.log('🌱 [MongoDB Atlas] Seeding initial faculty records...');
      const cleanFaculty = defaultSeedData.faculty.map(({ _id, ...f }) => f);
      await Faculty.insertMany(cleanFaculty);
    }

    const attendanceCount = await Attendance.countDocuments();
    if (attendanceCount === 0) {
      console.log('🌱 [MongoDB Atlas] Seeding initial attendance records...');
      const cleanAttendance = defaultSeedData.attendance.map(({ _id, ...a }) => a);
      await Attendance.insertMany(cleanAttendance);
    }
  } catch (err) {
    console.error('Error seeding initial data to MongoDB Atlas:', err.message);
  }
}

module.exports = {
  getAllStudents,
  findStudentByRoll,
  createStudent,
  deleteStudent,
  getAllFaculty,
  createFaculty,
  deleteFaculty,
  markAttendance,
  getAttendanceRecords,
  deleteAttendanceRecord,
  getAttendanceSummary,
  getDashboardStats,
  seedDatabaseIfEmpty,
  readLocalDb
};
