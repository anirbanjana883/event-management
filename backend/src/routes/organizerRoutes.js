import express from 'express';
import {
  scanTicket,
  manualCheckIn,
  getEventAnalytics,
  getCheckedInUsers
} from '../controllers/organizerController.js';

import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();


router.use(protect); 
router.use(restrictTo('organizer', 'admin'));


router.post('/scan', scanTicket);

router.post('/manual-checkin', manualCheckIn);

router.get('/events/:eventId/attendees', getCheckedInUsers);

router.get('/events/:eventId/analytics', getEventAnalytics);

export default router;