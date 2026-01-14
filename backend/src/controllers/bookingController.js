import Razorpay from 'razorpay';
import crypto from 'crypto';
import mongoose from 'mongoose';
import QRCode from 'qrcode';

import Event from '../models/Event.js';
import Ticket from '../models/Ticket.js';
import PendingBooking from '../models/PendingBooking.js';

import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

/* ================= RAZORPAY INSTANCE ================= */

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

/* ===================================================== */
/* 1. CREATE ORDER (NO SEATS DEDUCTED HERE) */
/* ===================================================== */
export const bookTicket = catchAsync(async (req, res, next) => {
  const { eventId, quantity = 1 } = req.body;

  const event = await Event.findById(eventId);
  if (!event || !event.isActive) {
    return next(new AppError('Event not available', 404));
  }

  if (event.availableSeats < quantity) {
    return next(new AppError('Not enough seats available', 400));
  }

  const order = await razorpay.orders.create({
    amount: event.price * quantity * 100,
    currency: 'INR'
  });

  await PendingBooking.create({
    orderId: order.id,
    event: eventId,
    user: req.user.id,
    quantity,
    amount: order.amount
  });

  res.status(200).json({
    status: 'success',
    data: {
      order,
      key: process.env.RAZORPAY_KEY_ID
    }
  });
});

/* ===================================================== */
/* 2. VERIFY PAYMENT (ATOMIC + SAFE) */
/* ===================================================== */
export const verifyPayment = catchAsync(async (req, res, next) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  } = req.body;

  /* ---------- A. VERIFY SIGNATURE ---------- */
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return next(new AppError('Invalid payment signature', 400));
  }

  /* ---------- B. IDEMPOTENCY ---------- */
  const existingTicket = await Ticket.findOne({
    paymentId: razorpay_payment_id
  });

  if (existingTicket) {
    const ticketWithQR = await Ticket.findById(existingTicket._id)
      .select('+qrCode');
    return res.status(200).json({
      status: 'success',
      data: ticketWithQR
    });
  }

  /* ---------- C. FETCH BOOKING ---------- */
  const booking = await PendingBooking.findOne({
    orderId: razorpay_order_id,
    status: 'pending'
  });

  if (!booking) {
    return next(new AppError('Booking not found or expired', 404));
  }

  /* ---------- D. VERIFY PAYMENT STATUS ---------- */
  const payment = await razorpay.payments.fetch(razorpay_payment_id);
  if (payment.status !== 'captured') {
    return next(new AppError('Payment not captured', 400));
  }

  /* ---------- E. TRANSACTION START ---------- */
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    /* Deduct seats */
    const event = await Event.findOneAndUpdate(
      {
        _id: booking.event,
        availableSeats: { $gte: booking.quantity }
      },
      {
        $inc: { availableSeats: -booking.quantity }
      },
      { new: true, session }
    );

    if (!event) {
      throw new Error('Seats unavailable');
    }

    /* Create tickets */
    const tickets = [];

    for (let i = 0; i < booking.quantity; i++) {
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

      tickets.push({
        _id: ticketId,
        event: booking.event,
        user: booking.user,
        qrCode,
        qrSignature: signature,
        paymentId: razorpay_payment_id,
        amountPaid: booking.amount / booking.quantity / 100,
        status: 'confirmed'
      });
    }

    const createdTickets = await Ticket.insertMany(tickets, { session });

    booking.status = 'paid';
    await booking.save({ session });

    await session.commitTransaction();
    session.endSession();

    const ticketWithQR = await Ticket.findById(createdTickets[0]._id)
      .select('+qrCode');

    res.status(200).json({
      status: 'success',
      data: ticketWithQR
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return next(new AppError(err.message, 400));
  }
});

/* ===================================================== */
/* 3. GET MY TICKETS */
/* ===================================================== */
export const getMyTickets = catchAsync(async (req, res, next) => {
  const tickets = await Ticket.find({
    user: req.user.id,
    status: 'confirmed'
  })
    .populate('event', 'title date location image')
    .select('+qrCode');

  res.status(200).json({
    status: 'success',
    results: tickets.length,
    data: {
      tickets
    }
  });
});


/* ===================================================== */
/* 4. CANxeCEL TICKET (USER) */
/* ===================================================== */
export const cancelTicket = catchAsync(async (req, res, next) => {
  const { ticketId } = req.body;

  const ticket = await Ticket.findOne({
    _id: ticketId,
    user: req.user.id
  });

  if (!ticket) {
    return next(new AppError('Ticket not found', 404));
  }

  if (ticket.status === 'cancelled') {
    return next(new AppError('Ticket already cancelled', 400));
  }

  // Logic: Mark as cancelled. (Optional: Initiate Refund via Razorpay API here)
  ticket.status = 'cancelled';
  await ticket.save();

  // Increase available seats back
  await Event.findByIdAndUpdate(ticket.event, {
    $inc: { availableSeats: 1 }
  });

  res.status(200).json({
    status: 'success',
    message: 'Ticket cancelled successfully'
  });
});