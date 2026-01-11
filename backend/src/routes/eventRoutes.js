import express from 'express';
import { getAllEvents, createEvent, getEvent } from '../controllers/eventController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const eventRouter = express.Router();


eventRouter.get('/', getAllEvents);
eventRouter.get('/:id', getEvent);

// Protected Routes (Organizer/Admin only)
eventRouter.post(
  '/', 
  protect, 
  restrictTo('organizer', 'admin'), 
  createEvent
);

export default eventRouter;