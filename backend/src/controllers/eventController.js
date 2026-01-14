import Event from '../models/Event.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

/* ================= CREATE EVENT ================= */
/* ================= CREATE EVENT ================= */
export const createEvent = catchAsync(async (req, res, next) => {
  const {
    title,
    description,
    date,
    location,
    price,
    totalSeats,
    image
  } = req.body;

  const event = await Event.create({
    title,
    description,
    date,
    location,
    price,
    totalSeats,
    availableSeats: totalSeats, // Start with full availability
    image,
    organizer: req.user.id
    // NOTE: 'isActive' is not listed here, so it defaults to true (from Model)
  });

  res.status(201).json({
    status: 'success',
    data: {
      event
    }
  });
});

/* ================= GET ALL EVENTS (PUBLIC) ================= */
export const getAllEvents = catchAsync(async (req, res, next) => {
  const events = await Event.find({ isActive: true }) 
    .sort({ date: 1 })
    .populate('organizer', 'name');

  res.status(200).json({
    status: 'success',
    results: events.length,
    data: {
      events
    }
  });
});

/* ================= GET SINGLE EVENT ================= */
export const getEvent = catchAsync(async (req, res, next) => {
  const event = await Event.findById(req.params.id).populate(
    'organizer',
    'name email'
  );

  if (!event || !event.isActive) {
    return next(new AppError('Event not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      event
    }
  });
});

/* ================= UPDATE EVENT ================= */
export const updateEvent = catchAsync(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return next(new AppError('Event not found', 404));
  }

  // Only organizer or admin
  if (
    event.organizer.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return next(new AppError('Not authorized', 403));
  }

  Object.assign(event, req.body);
  await event.save();

  res.status(200).json({
    status: 'success',
    data: {
      event
    }
  });
});

/* ================= DELETE EVENT (SOFT) ================= */
export const deleteEvent = catchAsync(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return next(new AppError('Event not found', 404));
  }

  if (
    event.organizer.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return next(new AppError('Not authorized', 403));
  }

  event.isActive = false;
  await event.save();

  res.status(204).json({
    status: 'success',
    data: null
  });
});
