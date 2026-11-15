const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const { connectDB } = require('./config/db');
const { seedDatabaseIfEmpty } = require('./utils/storage');
const errorHandler = require('./middleware/errorHandler');

// Route handlers
const studentRoutes = require('./routes/studentRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/students', studentRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Fallback for Single Page Application
app.get('*', (req, res, next) => {
  // If it's an API route that didn't match, send 404
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      message: `API endpoint ${req.method} ${req.path} not found.`
    });
  }
  // Otherwise serve index.html
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Centralized error handler
app.use(errorHandler);

// Start Server and Connect Database
async function startServer() {
  // Connect to MongoDB Atlas (graceful fallback if credentials missing)
  const connected = await connectDB();
  if (connected) {
    await seedDatabaseIfEmpty();
  }

  const server = app.listen(PORT, () => {
    console.log('================================================================');
    console.log('🎓 STUDENT ATTENDANCE MANAGEMENT SYSTEM');
    console.log('📌 Course: B.Voc (Software Development) - Semester V');
    console.log('👨‍🎓 Student Name: Karan Kumar');
    console.log('🆔 College Roll No: 24107030 | Exam Roll No: 24020107011');
    console.log('----------------------------------------------------------------');
    console.log(`🚀 Server successfully running on: http://localhost:${PORT}`);
    console.log(`🌐 REST API Base URL:             http://localhost:${PORT}/api`);
    console.log('================================================================\n');
  });

  return server;
}

// If executed directly, start the server
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
