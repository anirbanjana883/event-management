// 1. THIS MUST BE THE FIRST LINE
// This syntax loads and runs dotenv immediately, before any other imports
import 'dotenv/config'; 

import mongoose from 'mongoose';
import app from './app.js';
import connectDB from './src/config/db.js';

/* ===================================================== */
/* 1. CONNECT DATABASE */
/* ===================================================== */
connectDB();

/* ===================================================== */
/* 2. START SERVER */
/* ===================================================== */
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

/* ===================================================== */
/* 3. HANDLE UNHANDLED PROMISE REJECTIONS */
/* ===================================================== */
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);

  server.close(() => {
    process.exit(1);
  });
});

/* ===================================================== */
/* 4. HANDLE UNCAUGHT EXCEPTIONS */
/* ===================================================== */
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);

  process.exit(1);
});