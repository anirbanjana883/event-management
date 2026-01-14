import express from 'express';
import {
  bookTicket,
  verifyPayment,
  getMyTickets,
  cancelTicket
} from '../controllers/bookingController.js';

import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/book', protect, bookTicket);
router.post('/verify', protect, verifyPayment);
router.get('/my-tickets', protect, getMyTickets);
router.post('/cancel-ticket', protect, cancelTicket);

export default router;
