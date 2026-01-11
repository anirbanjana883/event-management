import express from 'express';
import { bookTicket, verifyPayment, getMyTickets } from '../controllers/bookingController.js';
import { protect } from '../middlewares/authMiddleware.js';

const bookingRouter = express.Router();

bookingRouter.use(protect);

// initialise payment
bookingRouter.post('/checkout', bookTicket);

// Verify Payment (Confirm Ticket)
bookingRouter.post('/verify', verifyPayment);


bookingRouter.get('/my-tickets', getMyTickets);

export default bookingRouter;