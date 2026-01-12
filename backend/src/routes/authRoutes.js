import express from 'express';
import { signup, login, getMe } from '../controllers/authController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const authRouter = express.Router();

authRouter.post('/signup', signup);
authRouter.post('/login', login);


authRouter.use(protect); 

authRouter.get('/me', getMe);

export default authRouter;