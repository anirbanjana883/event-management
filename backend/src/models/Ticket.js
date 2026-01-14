import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    /* ================= QR ================= */
    qrCode: {
      type: String,
      select: false // do not expose unless explicitly asked
    },

    qrSignature: {
      type: String,
      select: false
    },

    /* ================= PAYMENT ================= */
    paymentId: {
      type: String,
      required: true,
      index: true
    },

    amountPaid: {
      type: Number,
      required: true
    },

    /* ================= STATUS ================= */
    status: {
      type: String,
      enum: ['confirmed', 'cancelled', 'used'],
      default: 'confirmed'
    },

    /* ================= CHECK-IN ================= */
    checkInStatus: {
      isCheckedIn: {
        type: Boolean,
        default: false
      },
      checkInTime: Date,
      checkedInBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate ticket per payment
ticketSchema.index({ paymentId: 1, user: 1 });

const Ticket = mongoose.model('Ticket', ticketSchema);
export default Ticket;
