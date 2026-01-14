import express from 'express';
import {
  scanTicket,
  manualCheckIn,
  getEventDashboardData,
  getEventAnalytics
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
export default router;
