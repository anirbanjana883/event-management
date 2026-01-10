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
  qrCodeSignature: {
    type: String, 
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  paymentId: String
}, {
  timestamps: true
});

ticketSchema.index({ event: 1, user: 1 }, { unique: true });

const Ticket = mongoose.model('Ticket', ticketSchema);
export default Ticket;