const dns = require('node:dns');
dns.setDefaultResultOrder('ipv4first');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const itemsRouter = require('./routes/items');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lost_and_found_db';

// ==========================================
// Middleware
// ==========================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple request logger for terminal visibility
app.use((req, res, next) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// Serve static frontend files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// API Routes
// ==========================================
app.use('/api/items', itemsRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];
  res.status(200).json({
    status: 'online',
    timestamp: new Date(),
    database: states[dbState] || 'Unknown',
    uptime: process.uptime()
  });
});

// API 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found.`
  });
});

// Fallback to index.html for single-page routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// ==========================================
// Database Connection & Server Initialization
// ==========================================
async function startServer() {
  try {
    console.log('\n==================================================');
    console.log('  🔍 LOST AND FOUND PORTAL - STARTING SERVER...   ');
    console.log('==================================================');
    console.log(`Connecting to MongoDB at: ${MONGODB_URI.replace(/:([^:@]{4})[^:@]*@/, ':$1****@')} ...`);

    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });

    console.log('✅ Successfully connected to MongoDB Database!');

    app.listen(PORT, () => {
      console.log('--------------------------------------------------');
      console.log(`🚀 Server is running live on: http://localhost:${PORT}`);
      console.log(`📡 API Endpoints available at: http://localhost:${PORT}/api/items`);
      console.log(`📊 Health check at:           http://localhost:${PORT}/api/health`);
      console.log('--------------------------------------------------\n');
    });
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.log('\n💡 TROUBLESHOOTING TIPS:');
    console.log('1. For MongoDB Atlas: Ensure your connection string in .env is correct and IP 0.0.0.0/0 is whitelisted in Atlas Network Access.');
    console.log('2. For Local MongoDB: Ensure MongoDB Service is running (run `mongod` or check Windows Services).');
    console.log('3. You can still test server endpoints once MongoDB is running.\n');

    // Still start Express server so frontend can open and notify user gracefully
    app.listen(PORT, () => {
      console.log(`⚠️ Express server started on http://localhost:${PORT} (Waiting for MongoDB connection)`);
    });
  }
}

startServer();

module.exports = app;
