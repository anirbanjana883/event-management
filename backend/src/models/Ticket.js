import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.ObjectId,
    ref: 'Event',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  qrCode: {
    type: String,
    select: false 
  },
  qrCodeSignature: {
    type: String,
    select: false,
    unique: false, // Explicitly false to prevent "Duplicate Key" errors
    sparse: true   // Safety for older data or manual entries
  },
  
  // Payment Details
  paymentId: {
    type: String,
    required: true, // NEW: Mandatory because we only save after payment
    index: true     // NEW: Makes searching by Order ID faster (for Cancellation)
  },
  amountPaid: {
    type: Number,
    required: true
  },
  
  // Status (Default is now CONFIRMED)
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'used'], // Removed 'pending' as it's no longer used in DB
    default: 'confirmed'
  },
  
  // Check-In Logic
  checkInStatus: {
    isCheckedIn: { type: Boolean, default: false },
    checkInTime: Date,
    checkedInBy: { type: mongoose.Schema.ObjectId, ref: 'User' } 
  }
}, {
  timestamps: true
});

// Compound Indexes for frequent queries
ticketSchema.index({ event: 1, user: 1 }); // "Has this user bought this event?"
ticketSchema.index({ paymentId: 1 });      // "Find tickets by Razorpay Order ID"

const Ticket = mongoose.model('Ticket', ticketSchema);
export default Ticket;