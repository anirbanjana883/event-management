import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import AppError from './src/utils/AppError.js';
import globalErrorHandler from './src/middlewares/errorMiddleware.js';

/* ================= ROUTES ================= */
import authRoutes from './src/routes/authRoutes.js';
import eventRoutes from './src/routes/eventRoutes.js';
import bookingRoutes from './src/routes/bookingRoutes.js';
import organizerRoutes from './src/routes/organizerRoutes.js';
import webhookRoutes from './src/routes/webhookRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';

const app = express();

/* ===================================================== */
/* 1. WEBHOOK MUST COME FIRST (RAW BODY) */
/* ===================================================== */
app.use('/api/v1/webhooks', webhookRoutes);

/* ===================================================== */
/* 2. SECURITY MIDDLEWARE */
/* ===================================================== */
app.use(helmet());

app.use(
  cors({
    origin: true,
    credentials: true
  })
);

/* ===================================================== */
/* 3. BODY PARSERS */
/* ===================================================== */
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

/* ===================================================== */
/* 4. LOGGING */
/* ===================================================== */
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

/* ===================================================== */
/* 5. API ROUTES */
/* ===================================================== */
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/tickets', bookingRoutes);
app.use('/api/v1/organizer', organizerRoutes);
app.use('/api/v1/admin', adminRoutes);

/* ===================================================== */
/* 6. UNHANDLED ROUTES */
/* ===================================================== */
app.all(/(.*)/, (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl}`, 404));
});

/* ===================================================== */
/* 7. GLOBAL ERROR HANDLER */
/* ===================================================== */
app.use(globalErrorHandler);

export default app;
