const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '..', 'logs');
const logFilePath = path.join(logDir, 'attendance.log');

// Ensure log directory exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

/**
 * Appends an attendance marking event to logs/attendance.log asynchronously.
 * 
 * @param {Object} data - Attendance log payload
 * @param {string} data.rollNo - Student Roll Number
 * @param {string} [data.studentName] - Student Name
 * @param {string} data.subject - Subject Name / Code
 * @param {string} data.date - Attendance Date (YYYY-MM-DD)
 * @param {string} data.status - 'Present' or 'Absent'
 * @param {string} [data.markedBy] - Faculty ID or user identifier
 * @returns {Promise<string>} - Resolves with the log entry string
 */
function logAttendance({ rollNo, studentName, subject, date, status, markedBy }) {
  return new Promise((resolve, reject) => {
    const timestamp = new Date().toISOString();
    const namePart = studentName ? ` | NAME: ${studentName}` : '';
    const datePart = date ? ` | DATE: ${date}` : '';
    const byPart = markedBy ? ` | MARKED_BY: ${markedBy}` : ' | MARKED_BY: System/Faculty';
    const logEntry = `[${timestamp}] ROLL: ${rollNo}${namePart} | SUBJECT: ${subject}${datePart} | STATUS: ${status}${byPart}\n`;

    fs.appendFile(logFilePath, logEntry, 'utf8', (err) => {
      if (err) {
        console.error('Failed to write to attendance.log:', err);
        return reject(err);
      }
      console.log(`[Audit Log] ${logEntry.trim()}`);
      resolve(logEntry);
    });
  });
}

/**
 * Reads recent entries from logs/attendance.log.
 * 
 * @param {number} limit - Maximum number of recent log lines to retrieve
 * @returns {Array<string>} - Array of log line strings
 */
function getRecentLogs(limit = 50) {
  try {
    if (!fs.existsSync(logFilePath)) {
      return [];
    }
    const content = fs.readFileSync(logFilePath, 'utf8');
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    return lines.slice(-limit).reverse();
  } catch (err) {
    console.error('Error reading attendance.log:', err);
    return [];
  }
}

module.exports = {
  logAttendance,
  getRecentLogs,
  logFilePath
};
