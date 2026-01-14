import express from 'express';
import {
  createEvent,
  getAllEvents,
  getEvent,
  updateEvent,
  deleteEvent
} from '../controllers/eventController.js';

import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public
router.get('/', getAllEvents);
router.get('/:id', getEvent);

// Organizer / Admin
router.post('/', protect, restrictTo('organizer', 'admin'), createEvent);
router.patch('/:id', protect, restrictTo('organizer', 'admin'), updateEvent);
router.delete('/:id', protect, restrictTo('organizer', 'admin'), deleteEvent);

export default router;
