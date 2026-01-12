import express from 'express';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import { getEventDashboardData, manualCheckIn } from '../controllers/organizerController.js';
import { scanTicket } from '../controllers/bookingController.js';

const organiserRouter = express.Router();

organiserRouter.use(protect);

organiserRouter.use(restrictTo('organizer', 'admin'));

organiserRouter.get('/dashboard/:eventId', getEventDashboardData); 
organiserRouter.post('/manual-check-in', manualCheckIn); 
organiserRouter.post('/scan', scanTicket); 

export default organiserRouter;