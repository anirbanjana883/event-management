import express from 'express';
import { 
    bookTicket, 
    verifyPayment, 
    getMyTickets, 
    scanTicket, 
    getTicketDetails, 
    cancelBooking,
    cancelTicket
} from '../controllers/bookingController.js';

import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const bookingRouter = express.Router();

bookingRouter.use(protect);


bookingRouter.post('/checkout', bookTicket);
bookingRouter.post('/verify', verifyPayment);
bookingRouter.post('/cancel', cancelBooking);       
bookingRouter.post('/cancel-ticket', cancelTicket);  

bookingRouter.get('/my-tickets', getMyTickets);


bookingRouter.get('/ticket/:ticketId', getTicketDetails); 

bookingRouter.post('/scan', restrictTo('admin', 'organizer'), scanTicket);

export default bookingRouter;