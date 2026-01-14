import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true
    },

    description: {
      type: String,
      required: true
    },

    date: {
      type: Date,
      required: true
    },

    location: {
      type: String,
      required: true
    },

    price: {
      type: Number,
      required: true,
      min: 0
    },

    totalSeats: {
      type: Number,
      required: true,
      min: 1
    },

    availableSeats: {
      type: Number,
      required: true,
      min: 0
    },

    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    image: {
      type: String,
      default: ''
    },

    isActive: {
      type: Boolean,
      default: true  
    },
  },
  {
    timestamps: true
  }
);

/* ================= DATA INTEGRITY ================= */

// Ensure availableSeats never exceeds totalSeats
eventSchema.pre('save', function (next) {
  if (this.availableSeats > this.totalSeats) {
    this.availableSeats = this.totalSeats;
  }
  // next();
});

const Event = mongoose.model('Event', eventSchema);
export default Event;
