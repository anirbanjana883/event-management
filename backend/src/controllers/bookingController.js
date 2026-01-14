import Razorpay from 'razorpay';
import crypto from 'crypto';
import mongoose from 'mongoose';
import QRCode from 'qrcode';

import Event from '../models/Event.js';
import Ticket from '../models/Ticket.js';
import PendingBooking from '../models/PendingBooking.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

/* ================= CONFIG CHECK ================= */
// Prevents "undefined" errors during payment
if (!process.env.QR_SECRET) {
  throw new Error('FATAL ERROR: QR_SECRET is not defined in .env');
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

/* ================= HELPER: GENERATE TICKET DATA ================= */
// Generates the ticket object with QR code (runs in parallel)
const generateTicketData = async (booking, paymentId) => {
  const ticketId = new mongoose.Types.ObjectId();
  
  const payload = {
    ticketId,
    eventId: booking.event,
    userId: booking.user,
    issuedAt: Date.now()
  };

  const signature = crypto
    .createHmac('sha256', process.env.QR_SECRET)
    .update(JSON.stringify(payload))
    .digest('hex');

  const qrCode = await QRCode.toDataURL(
    JSON.stringify({ payload, signature })
  );

  return {
    _id: ticketId,
    event: booking.event,
    user: booking.user,
    qrCode,
    qrSignature: signature,
    paymentId,
    amountPaid: booking.amount / booking.quantity / 100,
    status: 'confirmed'
  };
};

/* ================= 1. CREATE ORDER ================= */
export const bookTicket = catchAsync(async (req, res, next) => {
  const { eventId, quantity = 1 } = req.body;

  // 1. Check Event Availability
  const event = await Event.findById(eventId);
  if (!event || !event.isActive) {
    return next(new AppError('Event not available', 404));
  }
  if (event.availableSeats < quantity) {
    return next(new AppError('Not enough seats available', 400));
  }

  // 2. Create Razorpay Order
  const order = await razorpay.orders.create({
    amount: event.price * quantity * 100,
    currency: 'INR'
  });

  // 3. Create Pending Booking
  await PendingBooking.create({
    orderId: order.id,
    event: eventId,
    user: req.user.id,
    quantity,
    amount: order.amount
  });

  res.status(200).json({
    status: 'success',
    data: { order, key: process.env.RAZORPAY_KEY_ID }
  });
});

/* ================= 2. VERIFY PAYMENT (OPTIMIZED) ================= */
export const verifyPayment = catchAsync(async (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  // 1. Verify Crypto Signature
  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (generatedSignature !== razorpay_signature) {
    return next(new AppError('Invalid payment signature', 400));
  }

  // 2. Idempotency Check (Ticket already exists?)
  const existingTicket = await Ticket.findOne({ paymentId: razorpay_payment_id });
  if (existingTicket) {
    return res.status(200).json({
      status: 'success',
      message: 'Ticket already processed',
      data: existingTicket // Logic simplified to return basic info
    });
  }

  // 3. Find Pending Booking
  const booking = await PendingBooking.findOne({
    orderId: razorpay_order_id,
    status: 'pending'
  });
  if (!booking) return next(new AppError('Booking not found or expired', 404));

  // 4. Start Transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // A. Deduct Seats
    const event = await Event.findOneAndUpdate(
      { _id: booking.event, availableSeats: { $gte: booking.quantity } },
      { $inc: { availableSeats: -booking.quantity } },
      { new: true, session }
    );

    if (!event) throw new Error('Seats unavailable');

    // B. Generate All Tickets in Parallel (Much Faster) 🚀
    const ticketPromises = Array.from({ length: booking.quantity }).map(() => 
      generateTicketData(booking, razorpay_payment_id)
    );
    const ticketsData = await Promise.all(ticketPromises);

    // C. Save Data
    const createdTickets = await Ticket.insertMany(ticketsData, { session });
    
    booking.status = 'paid';
    await booking.save({ session });

    await session.commitTransaction();

    // D. Return First Ticket with QR
    const ticketWithQR = await Ticket.findById(createdTickets[0]._id).select('+qrCode');
    
    res.status(200).json({
      status: 'success',
      data: ticketWithQR
    });

  } catch (err) {
    await session.abortTransaction();
    return next(new AppError(err.message || 'Payment processing failed', 400));
  } finally {
    session.endSession();
  }
});

/* ================= 3. GET USER TICKETS ================= */
export const getMyTickets = catchAsync(async (req, res, next) => {
  const tickets = await Ticket.find({ user: req.user.id, status: 'confirmed' })
    .populate('event', 'title date location image')
    .select('+qrCode')
    .sort('-createdAt'); // Show newest first

  res.status(200).json({
    status: 'success',
    results: tickets.length,
    data: { tickets }
  });
});

/* ================= 4. CANCEL TICKET ================= */
export const cancelTicket = catchAsync(async (req, res, next) => {
  const { ticketId } = req.body;

  const ticket = await Ticket.findOneAndUpdate(
    { _id: ticketId, user: req.user.id, status: 'confirmed' },
    { status: 'cancelled' },
    { new: true }
  );

  if (!ticket) return next(new AppError('Ticket not found or already cancelled', 404));

  // Release Seat
  await Event.findByIdAndUpdate(ticket.event, { $inc: { availableSeats: 1 } });

  res.status(200).json({
    status: 'success',
    message: 'Ticket cancelled successfully'
  });
});