const storage = require('../utils/storage');
const logger = require('../utils/logger');

/**
 * @route POST /api/attendance
 * @desc Mark attendance for a student (checks duplicate and writes fs log)
 */
async function markAttendance(req, res, next) {
  try {
    const { studentRollNo, subject, date, status, markedBy } = req.body;

    if (!studentRollNo || !subject || !date || !status) {
      return res.status(400).json({
        success: false,
        message: 'studentRollNo, subject, date, and status (Present/Absent) are required.'
      });
    }

    if (!['Present', 'Absent'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "Present" or "Absent".'
      });
    }

    // Attempt to mark attendance (storage method verifies student & rejects duplicates)
    const record = await storage.markAttendance({
      studentRollNo,
      subject,
      date,
      status,
      markedBy: markedBy || 'FAC101'
    });

    // Append to file system audit log (Requirement 6: Node.js fs module)
    await logger.logAttendance({
      rollNo: record.studentRollNo,
      studentName: record.studentName,
      subject: record.subject,
      date: record.date,
      status: record.status,
      markedBy: record.markedBy
    });

    res.status(201).json({
      success: true,
      message: `Attendance marked successfully: ${record.studentName} is marked ${status} for ${subject} on ${date}.`,
      data: record
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @route GET /api/attendance
 * @desc Get attendance records with optional filtering by rollNo, subject, or date
 */
async function getAttendanceRecords(req, res, next) {
  try {
    const { rollNo, subject, date } = req.query;
    const records = await storage.getAttendanceRecords({ rollNo, subject, date });
    res.json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @route GET /api/attendance/summary
 * @desc Get student-wise attendance statistics (total, present, percentage, eligibility)
 */
async function getAttendanceSummary(req, res, next) {
  try {
    const summary = await storage.getAttendanceSummary();
    res.json({
      success: true,
      count: summary.length,
      data: summary
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @route GET /api/attendance/student/:rollNo
 * @desc Get attendance history and percentage for a specific student
 */
async function getStudentAttendanceHistory(req, res, next) {
  try {
    const { rollNo } = req.params;
    const student = await storage.findStudentByRoll(rollNo);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: `Student with roll number "${rollNo}" not found.`
      });
    }

    const records = await storage.getAttendanceRecords({ rollNo });
    const totalClasses = records.length;
    const presentClasses = records.filter(r => r.status === 'Present').length;
    const absentClasses = totalClasses - presentClasses;
    const percentage = totalClasses > 0
      ? Number(((presentClasses / totalClasses) * 100).toFixed(2))
      : 0;

    res.json({
      success: true,
      student,
      stats: {
        totalClasses,
        presentClasses,
        absentClasses,
        percentage: `${percentage}%`,
        isEligible: percentage >= 75
      },
      records
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @route DELETE /api/attendance/:id
 * @desc Delete an attendance record
 */
async function deleteAttendanceRecord(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await storage.deleteAttendanceRecord(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `Attendance record "${id}" not found.`
      });
    }
    res.json({
      success: true,
      message: 'Attendance record deleted successfully.',
      data: deleted
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @route GET /api/attendance/logs
 * @desc Retrieve recent plain-text audit logs from logs/attendance.log
 */
async function getAuditLogs(req, res, next) {
  try {
    const limit = Number(req.query.limit) || 100;
    const logs = logger.getRecentLogs(limit);
    res.json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  markAttendance,
  getAttendanceRecords,
  getAttendanceSummary,
  getStudentAttendanceHistory,
  deleteAttendanceRecord,
  getAuditLogs
};
