import 'dotenv/config'; 

import mongoose from 'mongoose';
import app from './app.js';
import connectDB from './src/config/db.js';

//  IMPORT TICKET MODEL FOR THE FIX
// import Ticket from './src/models/Ticket.js';


connectDB();

//  TEMPORARY FIX: DELETE THE RESTRICTION ON CONNECT
// mongoose.connection.once('open', async () => {
//   try {
//     console.log(' Checking for old unique index...');
//     // Attempt to drop the specific index that is blocking you
//     await Ticket.collection.dropIndex('event_1_user_1');
//     console.log(' FIXED: Dropped the "One Ticket Per User" restriction.');
//   } catch (error) {
//     // If the index is already gone, MongoDB throws an error. We ignore it.
//     console.log('ℹIndex not found (Already fixed or never existed). You are good to go!');
//   }
// });


const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});



process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);

  server.close(() => {
    process.exit(1);
  });
});



process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);

  process.exit(1);
});