// app.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';

import AppError from './src/utils/AppError.js';
import globalErrorHandler from './src/middlewares/errorMiddleware.js';

const app = express();



app.use(helmet()); 
app.use(cors());   
app.use(express.json({ limit: '10kb' })); 
app.use(mongoSanitize()); 
app.use(xss()); 
app.use(hpp()); 

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); 
}



app.get('/', (req, res) => {
  res.status(200).json({ message: 'EventLoop API is running 🚀' });
});



app.all(/(.*)/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});



app.use(globalErrorHandler);

export default app;