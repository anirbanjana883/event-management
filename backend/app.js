// app.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import hpp from 'hpp';

import AppError from './src/utils/AppError.js';
import globalErrorHandler from './src/middlewares/errorMiddleware.js';
import authRouter from './src/routes/authRoutes.js';
import eventRouter from './src/routes/eventRoutes.js';

const app = express();



app.use(helmet()); 
app.use(cors());   
app.use(express.json({ limit: '10kb' })); 
app.use(hpp()); 

// Routes

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/events',eventRouter)

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); 
}



app.get('/', (req, res) => {
  res.status(200).json({ message: 'EventLoop API is running ' });
});



app.all(/(.*)/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});



app.use(globalErrorHandler);

export default app;