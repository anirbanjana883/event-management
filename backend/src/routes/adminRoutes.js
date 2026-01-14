import express from 'express';
import {
  getSystemStats,
  getAllUsers,
  deleteUser
} from '../controllers/adminController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Protect ALL routes for Admin only
router.use(protect, restrictTo('admin'));

router.get('/stats', getSystemStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);

export default router;