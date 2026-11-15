const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    studentRollNo: {
      type: String,
      required: [true, 'Student roll number is required'],
      trim: true
    },
    studentName: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true
    },
    date: {
      type: String, // Stored as YYYY-MM-DD
      required: [true, 'Attendance date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD']
    },
    status: {
      type: String,
      required: [true, 'Attendance status is required'],
      enum: {
        values: ['Present', 'Absent'],
        message: 'Status must be either Present or Absent'
      }
    },
    markedBy: {
      type: String,
      default: 'FAC101',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Compound unique index to prevent duplicate attendance on the same date for the same subject
attendanceSchema.index({ studentRollNo: 1, subject: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
