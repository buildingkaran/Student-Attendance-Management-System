const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema(
  {
    facultyId: {
      type: String,
      required: [true, 'Faculty ID is required'],
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Faculty name is required'],
      trim: true
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true
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

module.exports = mongoose.model('Faculty', facultySchema);
