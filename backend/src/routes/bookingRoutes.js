import express from 'express';
import { bookTicket, verifyPayment, getMyTickets, scanTicket, getTicketDetails } from '../controllers/bookingController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const bookingRouter = express.Router();

bookingRouter.use(protect);

// initialise payment
bookingRouter.post('/checkout', bookTicket);

// Verify Payment (Confirm Ticket)
bookingRouter.post('/verify', verifyPayment);


bookingRouter.get('/my-tickets', getMyTickets);

bookingRouter.get('/:ticketId', getTicketDetails); // with qr

bookingRouter.post('/scan', restrictTo('admin', 'organizer'), scanTicket);

export default bookingRouter;