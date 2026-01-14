import crypto from 'crypto';
import mongoose from 'mongoose';
import Razorpay from 'razorpay';

import Event from '../models/Event.js';
import Ticket from '../models/Ticket.js';
import PendingBooking from '../models/PendingBooking.js';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});



export const razorpayWebhook = async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  const signature = crypto
    .createHmac('sha256', secret)
    .update(req.body)
    .digest('hex');

  if (signature !== req.headers['x-razorpay-signature']) {
    return res.status(400).send('Invalid webhook signature');
  }

  const event = JSON.parse(req.body.toString());

  if (event.event !== 'payment.captured') {
    return res.status(200).json({ received: true });
  }

  const payment = event.payload.payment.entity;
  const orderId = payment.order_id;
  const paymentId = payment.id;

  const booking = await PendingBooking.findOne({
    orderId,
    status: 'pending'
  });

  if (!booking) {
    return res.status(200).json({ received: true });
  }


  const existing = await Ticket.findOne({ paymentId });
  if (existing) {
    return res.status(200).json({ received: true });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const eventDoc = await Event.findOneAndUpdate(
      {
        _id: booking.event,
        availableSeats: { $gte: booking.quantity }
      },
      {
        $inc: { availableSeats: -booking.quantity }
      },
      { session, new: true }
    );

    if (!eventDoc) {
      throw new Error('Seats unavailable');
    }

    const tickets = [];

    for (let i = 0; i < booking.quantity; i++) {
      const ticketId = new mongoose.Types.ObjectId();

      const payload = {
        ticketId,
        eventId: booking.event,
        userId: booking.user,
        issuedAt: Date.now()
      };

      const qrSignature = crypto
        .createHmac('sha256', process.env.QR_SECRET)
        .update(JSON.stringify(payload))
        .digest('hex');

      tickets.push({
        _id: ticketId,
        event: booking.event,
        user: booking.user,
        qrSignature,
        paymentId,
        amountPaid: booking.amount / booking.quantity / 100,
        status: 'confirmed'
      });
    }

    await Ticket.insertMany(tickets, { session });

    booking.status = 'paid';
    await booking.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({ received: true });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ error: err.message });
  }
};
