import User from '../models/User.js';
import Event from '../models/Event.js';
import Ticket from '../models/Ticket.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';


export const getSystemStats = catchAsync(async (req, res, next) => {
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



export const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find().select('-password').sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: { users }
  });
});


export const deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});