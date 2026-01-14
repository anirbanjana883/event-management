import express from 'express';
import {
  scanTicket,
  manualCheckIn,
  getEventDashboardData,
  getEventAnalytics,
  getCheckedInUsers
} from '../controllers/organizerController.js';

import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get(
  '/dashboard/:eventId',
  protect,
  restrictTo('organizer', 'admin'),
  getEventDashboardData
);

router.post(
  '/scan',
  protect,
  restrictTo('organizer', 'admin'),
  scanTicket
);

router.post(
  '/manual-checkin',
  protect,
  restrictTo('organizer', 'admin'),
  manualCheckIn
);

router.get(
  '/analytics/:eventId',
  protect,
  restrictTo('organizer', 'admin'),
  getEventAnalytics
);

router.get(
  '/events/:eventId/attendees',
  protect,
  restrictTo('organizer', 'admin'),
  getCheckedInUsers
);
export default router;
