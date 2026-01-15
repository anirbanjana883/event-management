import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';


const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};


export const register = catchAsync(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // 🛑 FIX: Trim hidden spaces from mobile keyboards
  const cleanEmail = email ? email.toLowerCase().trim() : '';

  const existingUser = await User.findOne({ email: cleanEmail });
  if (existingUser) {
    return next(new AppError('Email already in use', 400));
  }

  const newUser = await User.create({
    name,
    email: cleanEmail, // Save the clean version
    password,
    role 
  });

  createSendToken(newUser, 201, res);
});


export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // 🛑 FIX: Trim hidden spaces here too
  const cleanEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: cleanEmail }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  createSendToken(user, 200, res);
});


export const getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});
