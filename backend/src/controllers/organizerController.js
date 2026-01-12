import Ticket from '../models/Ticket.js';
import Event from '../models/Event.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';

// 1. Get Command Center Stats (Attendees list + Counts)
export const getEventDashboardData = catchAsync(async (req, res, next) => {
  const { eventId } = req.params;

  // Security: Ensure logged-in user owns this event
  const event = await Event.findOne({ _id: eventId, organizer: req.user.id });
  if (!event) {
    return next(new AppError('Event not found or unauthorized', 403));
  }

  // Aggregate Data for Performance
  const stats = await Ticket.aggregate([
    { $match: { event: event._id, status: 'confirmed' } },
    {
      $group: {
        _id: null,
        totalSold: { $sum: 1 },
        totalCheckedIn: { 
          $sum: { $cond: ["$checkInStatus.isCheckedIn", 1, 0] } 
        }
      }
    }
  ]);

  // Fetch actual attendee list (sorted by name)
  const attendees = await Ticket.find({ event: eventId, status: 'confirmed' })
    .select('checkInStatus user paymentId') // Select only what we need
    .populate('user', 'name email mobile');

  res.status(200).json({
    status: 'success',
    data: {
      eventTitle: event.title,
      totalSeats: event.totalSeats,
      sold: stats[0]?.totalSold || 0,
      checkedIn: stats[0]?.totalCheckedIn || 0,
      attendees
    }
  });
});

// 2. Manual Check-in (Fallback for broken phones/cameras)
export const manualCheckIn = catchAsync(async (req, res, next) => {
  const { ticketId } = req.body;

  const ticket = await Ticket.findById(ticketId).populate('event');

  if (!ticket) return next(new AppError('Ticket not found', 404));

  // Security check
  if (ticket.event.organizer.toString() !== req.user.id) {
    return next(new AppError('Unauthorized', 403));
  }

  if (ticket.checkInStatus.isCheckedIn) {
    return next(new AppError('User already checked in!', 400));
  }

  // Update Status
  ticket.checkInStatus.isCheckedIn = true;
  ticket.checkInStatus.checkInTime = Date.now();
  ticket.checkInStatus.checkedInBy = req.user.id; // Audit log
  
  await ticket.save();

  res.status(200).json({
    status: 'success',
    message: 'Manual check-in successful',
    data: { 
      checkInTime: ticket.checkInStatus.checkInTime 
    }
  });
});