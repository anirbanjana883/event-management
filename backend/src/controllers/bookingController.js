import Razorpay from 'razorpay';
import crypto from 'crypto';
import QRCode from 'qrcode'; // Import the QR code library
import { v4 as uuidv4 } from 'uuid';
import Event from '../models/Event.js';
import Ticket from '../models/Ticket.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import mongoose from 'mongoose';

const getRazorpayInstance = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
};

// 1. INITIATE CHECKOUT (Reserve Seats Only)
export const bookTicket = catchAsync(async (req, res, next) => {
  const { eventId, quantity = 1 } = req.body;
  const userId = req.user.id;

  const event = await Event.findOneAndUpdate(
    { _id: eventId, availableSeats: { $gte: quantity } },
    { $inc: { availableSeats: -quantity } },
    { new: true }
  );

  if (!event) {
    return next(new AppError('Not enough seats available!', 400));
  }

  const razorpay = getRazorpayInstance();
  const options = {
    amount: event.price * quantity * 100, 
    currency: "INR",
    receipt: `receipt_${uuidv4().slice(0, 8)}`,
    notes: { 
        eventId: event._id.toString(), 
        userId: userId.toString(),
        quantity: quantity.toString() 
    }
  };

  try {
    const order = await razorpay.orders.create(options);

    res.status(200).json({
      status: 'success',
      data: {
        order,
        key_id: process.env.RAZORPAY_KEY_ID
      }
    });

  } catch (err) {
    // Rollback seats if order creation fails
    await Event.findByIdAndUpdate(eventId, { $inc: { availableSeats: quantity } });
    return next(new AppError('Payment initiation failed', 500));
  }
});

// 2. VERIFY PAYMENT (Create Tickets Now)
export const verifyPayment = catchAsync(async (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  // A. Verify Signature
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
     return next(new AppError('Invalid Payment Signature', 400));
  }

  // B. Fetch Order Details to get the Metadata (Notes)
  // We need to know which Event and User this payment belongs to
  const razorpay = getRazorpayInstance();
  const order = await razorpay.orders.fetch(razorpay_order_id);
  
  const { eventId, userId, quantity } = order.notes;
  const qty = parseInt(quantity);

  // C. Generate and Save Tickets
  const ticketsToCreate = [];
  
  for (let i = 0; i < qty; i++) {
     // Generate QR for each ticket
     // We generate a temporary ID for the QR logic or use a placeholder
     const ticketId = new mongoose.Types.ObjectId(); 
     
     const qrPayload = JSON.stringify({
        ticketId: ticketId,
        eventId: eventId,
        userId: userId,
        valid: true
     });
     
     const qrCodeImage = await QRCode.toDataURL(qrPayload);

     ticketsToCreate.push({
        _id: ticketId, // Manually setting ID to match QR
        event: eventId,
        user: userId,
        status: 'confirmed',
        paymentId: razorpay_payment_id,
        amountPaid: (order.amount / 100) / qty, // Price per ticket
        qrCode: qrCodeImage,
        qrCodeSignature: razorpay_signature
     });
  }

  await Ticket.insertMany(ticketsToCreate);

  res.status(200).json({
    status: 'success',
    message: 'Payment Verified & Tickets Created',
  });
});

// 3. ROLLBACK (User closed popup without paying) - THIS IS THE CODE YOU PASTED
export const cancelBooking = catchAsync(async (req, res, next) => {
  const { orderId } = req.body;
  
  if (!orderId) return next(new AppError('Order ID required', 400));

  try {
      const razorpay = getRazorpayInstance();
      const order = await razorpay.orders.fetch(orderId);

      if (order.status === 'paid') {
          return res.status(200).json({ message: "Order already paid, cannot rollback." });
      }

      const { eventId, quantity } = order.notes;

      await Event.findByIdAndUpdate(eventId, { $inc: { availableSeats: parseInt(quantity) } });
      
      console.log(`Rolled back ${quantity} seats for Event ${eventId}`);
      res.status(200).json({ status: 'success', message: 'Seats released' });

  } catch (err) {
      console.error("Rollback Error:", err);
      return next(new AppError('Failed to cancel booking', 500));
  }
});

// 4. CANCEL CONFIRMED TICKET (User cancels from Dashboard) - NEW FUNCTION
export const cancelTicket = catchAsync(async (req, res, next) => {
  const { ticketId } = req.body;
  const userId = req.user.id;

  const ticket = await Ticket.findOne({ _id: ticketId, user: userId });

  if (!ticket) return next(new AppError('Ticket not found', 404));
  if (ticket.status === 'cancelled') return next(new AppError('Already cancelled', 400));

  // Mark as cancelled
  ticket.status = 'cancelled';
  ticket.qrCode = null; // Remove QR so it can't be used
  await ticket.save();

  // Give seat back
  await Event.findByIdAndUpdate(ticket.event, { $inc: { availableSeats: 1 } });

  res.status(200).json({ status: 'success', message: 'Ticket cancelled' });
});

// 3. Get My Tickets
export const getMyTickets = catchAsync(async (req, res, next) => {
  // Only fetch confirmed tickets to avoid showing failed attempts
  const tickets = await Ticket.find({ user: req.user.id, status: 'confirmed' })
    .populate('event', 'title date location price image');

  res.status(200).json({
    status: 'success',
    results: tickets.length,
    data: { tickets }
  });
});

// scan ticket by organiser
export const scanTicket = catchAsync(async (req, res, next) => {
  const { ticketId } = req.body;
  
  const ticket = await Ticket.findById(ticketId)
    .populate({
      path: 'event',
      select: 'title date organizer' 
    })
    .populate('user', 'name email');

  if (!ticket) return next(new AppError('Invalid Ticket', 404));

  // Check Authorization
  if (req.user.role !== 'admin' && ticket.event.organizer.toString() !== req.user.id) {
    return next(new AppError('You are not authorized to scan tickets for this event.', 403));
  }

  if (ticket.status !== 'confirmed') {
    return next(new AppError(`Ticket is ${ticket.status}`, 400));
  }

  // --- FIX START: Access nested 'checkInStatus' ---
  if (ticket.checkInStatus.isCheckedIn) {
    return next(new AppError(`ALREADY SCANNED at ${new Date(ticket.checkInStatus.checkInTime).toLocaleTimeString()}`, 409));
  }

  // Update Nested Fields
  ticket.checkInStatus.isCheckedIn = true;
  ticket.checkInStatus.checkInTime = Date.now();
  ticket.checkInStatus.checkedInBy = req.user.id; // Optional: Track who scanned it
  // --- FIX END ---

  await ticket.save();

  res.status(200).json({
    status: 'success',
    data: {
      attendee: ticket.user.name,
      event: ticket.event.title,
      timestamp: ticket.checkInStatus.checkInTime
    }
  });
});


export const getTicketDetails = catchAsync(async (req, res, next) => {
  const ticket = await Ticket.findById(req.params.ticketId)
    .populate('event')
    .populate('user')
    .select('+qrCode'); 

  if (!ticket) {
    return next(new AppError('Ticket not found', 404));
  }

  if (ticket.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
     return next(new AppError('You do not have permission to view this ticket', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      ticket
    }
  });
});