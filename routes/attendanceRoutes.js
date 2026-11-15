const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

// POST /api/attendance - Mark attendance
router.post('/', attendanceController.markAttendance);

// GET /api/attendance - Get attendance records (with optional query filters)
router.get('/', attendanceController.getAttendanceRecords);

// GET /api/attendance/summary - Get calculated attendance percentage for all students
router.get('/summary', attendanceController.getAttendanceSummary);

// GET /api/attendance/logs - Get fs audit log entries
router.get('/logs', attendanceController.getAuditLogs);

// GET /api/attendance/student/:rollNo - Get student-specific attendance history
router.get('/student/:rollNo', attendanceController.getStudentAttendanceHistory);

// DELETE /api/attendance/:id - Delete an attendance record
router.delete('/:id', attendanceController.deleteAttendanceRecord);

module.exports = router;
