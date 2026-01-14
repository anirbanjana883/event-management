import crypto from 'crypto';
import Ticket from '../models/Ticket.js';
import Event from '../models/Event.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

/* ===================================================== */
/* 1. EVENT DASHBOARD (STATS + ATTENDEES) */
/* ===================================================== */
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

/* ===================================================== */
/* 2. QR SCAN CHECK-IN (PRIMARY METHOD) */
/* ===================================================== */
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
    .populate('event')
    .populate('user', 'name email');

  if (!ticket) {
    return next(new AppError('Invalid ticket', 404));
  }

  if (
    req.user.role !== 'admin' &&
    ticket.event.organizer.toString() !== req.user.id
  ) {
    return next(new AppError('Unauthorized', 403));
  }

  if (ticket.checkInStatus.isCheckedIn) {
    return next(new AppError('Ticket already used', 409));
  }

  ticket.checkInStatus.isCheckedIn = true;
  ticket.checkInStatus.checkInTime = Date.now();
  ticket.checkInStatus.checkedInBy = req.user.id;
  ticket.status = 'used';

  await ticket.save();

  res.status(200).json({
    status: 'success',
    data: {
      attendee: ticket.user.name,
      checkedInAt: ticket.checkInStatus.checkInTime
    }
  });
});

/* ===================================================== */
/* 3. MANUAL CHECK-IN (FALLBACK) */
/* ===================================================== */
export const manualCheckIn = catchAsync(async (req, res, next) => {
  const { ticketId } = req.body;

  const ticket = await Ticket.findById(ticketId).populate('event');

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
    return next(new AppError('Ticket already used', 400));
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
      checkedInAt: ticket.checkInStatus.checkInTime
    }
  });
});


/* ===================================================== */
/* 4. GET EVENT ANALYTICS (CHART DATA) */
/* ===================================================== */
export const getEventAnalytics = catchAsync(async (req, res, next) => {
  const { eventId } = req.params;

  // 1. Verify Ownership
  const event = await Event.findOne({
    _id: eventId,
    organizer: req.user.id
  });

  if (!event && req.user.role !== 'admin') {
    return next(new AppError('Event not found or unauthorized', 403));
  }

  // 2. Aggregate Sales by Date (Last 30 Days)
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
    { $sort: { _id: 1 } } // Sort by date ascending
  ]);

  // 3. Fill in missing dates (Zero sales days)
  // This logic is usually better handled on frontend, 
  // but sending raw data is fine for now.

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});