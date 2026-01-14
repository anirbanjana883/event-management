// 1. THIS MUST BE THE FIRST LINE
import 'dotenv/config'; 

import mongoose from 'mongoose';
import app from './app.js';
import connectDB from './src/config/db.js';

// 👇 IMPORT TICKET MODEL FOR THE FIX
import Ticket from './src/models/Ticket.js';

/* ===================================================== */
/* 1. CONNECT DATABASE */
/* ===================================================== */
connectDB();

// 👇 TEMPORARY FIX: DELETE THE RESTRICTION ON CONNECT
mongoose.connection.once('open', async () => {
  try {
    console.log('🔍 Checking for old unique index...');
    // Attempt to drop the specific index that is blocking you
    await Ticket.collection.dropIndex('event_1_user_1');
    console.log('✅ FIXED: Dropped the "One Ticket Per User" restriction.');
  } catch (error) {
    // If the index is already gone, MongoDB throws an error. We ignore it.
    console.log('ℹ️ Index not found (Already fixed or never existed). You are good to go!');
  }
});

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