import User from '../models/User.js';
import Event from '../models/Event.js';
import Ticket from '../models/Ticket.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

/* ===================================================== */
/* 1. GET SYSTEM STATS (GOD MODE) */
/* ===================================================== */
export const getSystemStats = catchAsync(async (req, res, next) => {
  // Parallel execution for speed
  const [userCount, eventCount, ticketStats] = await Promise.all([
    User.countDocuments(),
    Event.countDocuments(),
    Ticket.aggregate([
      { $match: { status: 'confirmed' } },
      {
        $group: {
          _id: null,
          totalTickets: { $sum: 1 },
          totalRevenue: { $sum: "$amountPaid" }
        }
      }
    ])
  ]);

  const stats = {
    totalUsers: userCount,
    totalEvents: eventCount,
    totalTicketsSold: ticketStats[0]?.totalTickets || 0,
    totalRevenue: ticketStats[0]?.totalRevenue || 0
  };

  res.status(200).json({
    status: 'success',
    data: stats
  });
});

/* ===================================================== */
/* 2. GET ALL USERS */
/* ===================================================== */
export const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find().select('-password').sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: { users }
  });
});

/* ===================================================== */
/* 3. DELETE USER (BAN HAMMER) */
/* ===================================================== */
export const deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Optional: Also delete their events? For now, keep it simple.

  res.status(204).json({
    status: 'success',
    data: null
  });
});