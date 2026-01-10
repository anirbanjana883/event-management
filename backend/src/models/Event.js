import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event must have a title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Event must have a description']
  },
  date: {
    type: Date,
    required: [true, 'Event must have a date']
  },
  location: {
    type: String,
    required: [true, 'Event must have a location']
  },
  organizer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  totalSeats: {
    type: Number,
    required: true
  },
  availableSeats: {
    type: Number,
    required: true,
    min: [0, 'Seats cannot be negative'] 
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true,
  optimisticConcurrency: true 
});


eventSchema.index({ date: 1, price: 1 }); 

const Event = mongoose.model('Event', eventSchema);
export default Event;