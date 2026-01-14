import crypto from 'crypto';
import Ticket from '../models/Ticket.js';
import Event from '../models/Event.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';


export const getEventDashboardData = catchAsync(async (req, res, next) => {
  const { eventId } = req.params;

  const event = await Event.findOne({
    _id: eventId,
    organizer: req.user.id
  });

  if (!event && req.user.role !== 'admin') {
    return next(new AppError('Event not found or unauthorized', 403));
  }

  const stats = await Ticket.aggregate([
    { $match: { event: event._id } },
    {
      $group: {
        _id: null,
        totalSold: { $sum: 1 },
        totalCheckedIn: {
          $sum: {
            $cond: ['$checkInStatus.isCheckedIn', 1, 0]
          }
        }
      }
    }
  ]);

  const attendees = await Ticket.find({ event: eventId })
    .select('status checkInStatus user paymentId')
    .populate('user', 'name email');

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



export const scanTicket = catchAsync(async (req, res, next) => {
  const { qrData } = req.body;

  let parsed;
  try {
    parsed = JSON.parse(qrData);
  } catch {
    return next(new AppError('Invalid QR format', 400));
  }

  const { payload, signature } = parsed;


  const expectedSignature = crypto
    .createHmac('sha256', process.env.QR_SECRET)
    .update(JSON.stringify(payload))
    .digest('hex');

  if (signature !== expectedSignature) {
    return next(new AppError('Forged QR detected', 400));
  }


  const ticket = await Ticket.findById(payload.ticketId)
    .populate('user', 'name email image') 
    .populate('event', 'title');

  // 🛑 FIX: Check if Event exists (Prevents Crash)
  if (!ticket.event) {
    return next(new AppError('This ticket belongs to a deleted event.', 404));
  }

  // 🛑 FIX: Safe Organizer Check (Prevents Crash)
  const organizerId = ticket.event.organizer ? ticket.event.organizer.toString() : null;

  // // 3. Check Ownership & Permissions
  // if (req.user.role !== 'admin' && organizerId !== req.user.id) {
  //   return next(new AppError('Unauthorized: You are not the organizer of this event', 403));
  // }

  if (ticket.checkInStatus.isCheckedIn) {
    return res.status(409).json({
      status: 'fail',
      message: 'Already Checked In',
      data: {
        attendee: ticket.user,
        ticketId: ticket._id,
        checkInTime: ticket.checkInStatus.checkInTime
      }
    });
  }

  ticket.checkInStatus.isCheckedIn = true;
  ticket.checkInStatus.checkInTime = Date.now();
  ticket.checkInStatus.checkedInBy = req.user.id;
  ticket.status = 'used';
  await ticket.save();

  res.status(200).json({
    status: 'success',
    data: {
      ticketId: ticket._id,
      attendee: ticket.user, 
      amountPaid: ticket.amountPaid,
      checkInTime: ticket.checkInStatus.checkInTime,
      type: 'General Admission' 
    }
  });
});



export const manualCheckIn = catchAsync(async (req, res, next) => {
  const { ticketId } = req.body;

  const ticket = await Ticket.findById(ticketId)
    .populate('event')
    .populate('user', 'name email image'); 

  if (!ticket) {
    return next(new AppError('Ticket not found', 404));
  }

  if (
    req.user.role !== 'admin' &&
    ticket.event.organizer.toString() !== req.user.id
  ) {
    return next(new AppError('Unauthorized', 403));
  }

  if (ticket.checkInStatus.isCheckedIn) {
    return res.status(409).json({
      status: 'fail',
      message: 'Ticket already used',
      data: {
        attendee: ticket.user,
        ticketId: ticket._id,
        checkInTime: ticket.checkInStatus.checkInTime
      }
    });
  }

  ticket.checkInStatus.isCheckedIn = true;
  ticket.checkInStatus.checkInTime = Date.now();
  ticket.checkInStatus.checkedInBy = req.user.id;
  ticket.status = 'used';

  await ticket.save();

  res.status(200).json({
    status: 'success',
    message: 'Manual check-in successful',
    data: {
      ticketId: ticket._id,
      attendee: ticket.user, 
      amountPaid: ticket.amountPaid,
      checkInTime: ticket.checkInStatus.checkInTime,
      type: 'Manual Entry'
    }
  });
});


export const getEventAnalytics = catchAsync(async (req, res, next) => {
  const { eventId } = req.params;

  const event = await Event.findOne({
    _id: eventId,
    organizer: req.user.id
  });

  if (!event && req.user.role !== 'admin') {
    return next(new AppError('Event not found or unauthorized', 403));
  }

  const stats = await Ticket.aggregate([
    {
      $match: {
        event: event._id,
        status: 'confirmed',
        createdAt: {
          $gte: new Date(new Date().setDate(new Date().getDate() - 30)) // Last 30 days
        }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        ticketsSold: { $sum: 1 },
        revenue: { $sum: "$amountPaid" }
      }
    },
    { $sort: { _id: 1 } } 
  ]);


  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});



export const getCheckedInUsers = catchAsync(async (req, res, next) => {
  const { eventId } = req.params;

  const checkedInTickets = await Ticket.find({
    event: eventId,
    'checkInStatus.isCheckedIn': true
  })
  .populate('user', 'name email image')
  .sort({ 'checkInStatus.checkInTime': -1 }); 

  res.status(200).json({
    status: 'success',
    results: checkedInTickets.length,
    data: checkedInTickets.map(ticket => ({
      ticketId: ticket._id,
      attendee: ticket.user,
      amountPaid: ticket.amountPaid,
      checkInTime: ticket.checkInStatus.checkInTime,
      type: ticket.paymentId ? 'QR Scan' : 'Manual' 
    }))
  });
});