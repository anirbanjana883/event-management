import Event from '../models/Event.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';



export const getAllEvents = catchAsync(async (req, res, next) => {
  const events = await Event.find().sort({ date: 1 }); 

  res.status(200).json({
    status: 'success',
    results: events.length,
    data: { events }
  });
});



export const getEvent = catchAsync(async (req, res, next) => {
  const event = await Event.findById(req.params.id).populate('organizer', 'name email');

  if (!event) {
    return next(new AppError('No event found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { event }
  });
});



export const createEvent = catchAsync(async (req, res, next) => {
  const newEvent = await Event.create({
    ...req.body,
    organizer: req.user.id 
  });

  res.status(201).json({
    status: 'success',
    data: { event: newEvent }
  });
});