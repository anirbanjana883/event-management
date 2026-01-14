import mongoose from 'mongoose';

const pendingBookingSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    quantity: {
      type: Number,
      required: true,
      min: 1
    },

    amount: {
      type: Number,
      required: true
    },

    status: {
      type: String,
      enum: ['pending', 'paid', 'expired'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

// Auto-expire abandoned bookings (15 min)
pendingBookingSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 900 }
);

const PendingBooking = mongoose.model(
  'PendingBooking',
  pendingBookingSchema
);

export default PendingBooking;
