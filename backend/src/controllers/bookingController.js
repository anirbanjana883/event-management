import Razorpay from 'razorpay';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import Event from '../models/Event.js';
import Ticket from '../models/Ticket.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';


const getRazorpayInstance = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
};

// initiate checkout
export const bookTicket = catchAsync(async (req, res, next) => {
  const { eventId } = req.body;
  const userId = req.user.id;

  const event = await Event.findOneAndUpdate(
    { _id: eventId, availableSeats: { $gt: 0 } },
    { $inc: { availableSeats: -1 } },
    { new: true }
  );

  if (!event) {
    return next(new AppError('Sold Out! No seats available.', 400));
  }

  const razorpay = getRazorpayInstance(); 

  const options = {
    amount: event.price * 100,
    currency: "INR",
    receipt: `receipt_${uuidv4().slice(0, 8)}`,
    notes: {
      projectId: "EventLoop_v1", 
      eventId: event._id.toString(),
      userId: userId.toString()
    }
  };

  try {
    const order = await razorpay.orders.create(options);

    await Ticket.create({
      event: event._id,
      user: userId,
      status: 'pending',
      paymentId: order.id 
    });

    res.status(200).json({
      status: 'success',
      data: {
        order,
        key_id: process.env.RAZORPAY_KEY_ID
      }
    });

  } catch (err) {
    console.error("Razorpay Error:", err); 
    await Event.findByIdAndUpdate(eventId, { $inc: { availableSeats: 1 } });
    return next(new AppError('Payment initiation failed', 500));
  }
});

// payment verifications
export const verifyPayment = catchAsync(async (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  if (expectedSignature === razorpay_signature) {
    await Ticket.findOneAndUpdate(
      { paymentId: razorpay_order_id },
      { 
        status: 'confirmed', 
        paymentId: razorpay_payment_id,
        qrCodeSignature: `VALID-${razorpay_payment_id}` 
      }
    );

    res.status(200).json({
      status: 'success',
      message: 'Payment verified and Ticket Confirmed'
    });
  } else {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid Signature'
    });
  }
});

// get tickets
export const getMyTickets = catchAsync(async (req, res, next) => {
  const tickets = await Ticket.find({ user: req.user.id })
    .populate('event', 'title date location price');

  res.status(200).json({
    status: 'success',
    results: tickets.length,
    data: { tickets }
  });
});