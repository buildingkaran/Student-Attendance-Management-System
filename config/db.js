const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

let isConnected = false;

/**
 * Connects to MongoDB Atlas using Mongoose.
 * Uses environment variable MONGODB_URI.
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.trim() === '') {
    console.warn('\n⚠️ [Database Warning] MONGODB_URI is not set in your .env file.');
    console.warn('👉 The system will operate in Local Persistence Fallback Mode.');
    console.warn('👉 To connect to MongoDB Atlas, add your connection string in .env:');
    console.warn('   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/attendance_db\n');
    isConnected = false;
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000 // Timeout after 5 seconds instead of hanging
    });
    isConnected = true;
    console.log(`\n✅ [MongoDB Atlas Connected] Host: ${conn.connection.host}`);
    console.log(`📦 Database Name: ${conn.connection.name}\n`);
    return true;
  } catch (error) {
    console.error('\n❌ [MongoDB Connection Error]:', error.message);
    console.warn('👉 Falling back to Local Persistence Mode so the app remains fully functional.\n');
    isConnected = false;
    return false;
  }
}

function getStatus() {
  return {
    connected: mongoose.connection.readyState === 1,
    state: ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'][mongoose.connection.readyState] || 'Disconnected',
    host: mongoose.connection.host || 'Local Storage Fallback',
    database: mongoose.connection.name || 'attendance_local'
  };
}

module.exports = {
  connectDB,
  getStatus
};
