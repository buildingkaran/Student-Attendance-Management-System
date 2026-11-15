const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    rollNo: {
      type: String,
      required: [true, 'Roll number is required'],
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true
    },
    course: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: [1, 'Semester must be at least 1'],
      max: [8, 'Semester cannot exceed 8']
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Student', studentSchema);
