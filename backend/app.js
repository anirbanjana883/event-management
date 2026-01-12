import express from 'express';
import cors from 'cors'; 
import helmet from 'helmet';
import morgan from 'morgan';
import hpp from 'hpp';

import AppError from './src/utils/AppError.js';
import globalErrorHandler from './src/middlewares/errorMiddleware.js';

// Import Routes
import authRouter from './src/routes/authRoutes.js';
import eventRouter from './src/routes/eventRoutes.js';
import bookingRouter from './src/routes/bookingRoutes.js';
import organiserRouter from './src/routes/organizerRoutes.js';

const app = express();

app.use(helmet());

// 1. STRICT CORS CONFIGURATION
app.use(cors({
  origin: 'http://localhost:5173', // Must match your frontend port exactly
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json({ limit: '10kb' }));
app.use(hpp());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 2. MOUNT ROUTES
// Your 'me' endpoint is inside authRouter, so it lives at /api/v1/auth/me
app.use('/api/v1/auth', authRouter); 
app.use('/api/v1/events', eventRouter);
app.use('/api/v1/bookings', bookingRouter);
app.use('/api/v1/organizer', organiserRouter);

app.get('/', (req, res) => {
  res.status(200).json({ message: 'EventLoop API is running' });
});

app.all(/(.*)/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;