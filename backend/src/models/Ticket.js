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

    qrCode: {
      type: String,
      select: false 
    },

    qrSignature: {
      type: String,
      select: false
    },


    paymentId: {
      type: String,
      required: true,
      index: true
    },

    amountPaid: {
      type: Number,
      required: true
    },


    status: {
      type: String,
      enum: ['confirmed', 'cancelled', 'used'],
      default: 'confirmed'
    },


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


ticketSchema.index({ paymentId: 1, user: 1 });

const Ticket = mongoose.model('Ticket', ticketSchema);
export default Ticket;
