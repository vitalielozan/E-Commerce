import jwt from 'jsonwebtoken';
import { z } from 'zod';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Aceleași reguli ca în frontend, dar aplicate aici: validarea din browser e
// pentru confortul utilizatorului, cea de pe server e cea care contează.
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128)
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/\d/, 'Password must contain a digit')
  .regex(/[^A-Za-z0-9]/, 'Password must contain a special character');

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Name is too short').max(80),
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const checkoutPrefsSchema = z.object({
  billingAddress: z.string().trim().min(5).max(200),
  shippingAddress: z.string().trim().min(5).max(200),
  cardLast4: z.string().regex(/^\d{4}$/, 'Expected the last 4 digits'),
});

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// Formă unică a utilizatorului trimis clientului, fără parolă.
const publicUser = (user) => ({
  _id: user._id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  lastCheckout: user.lastCheckout,
  createdAt: user.createdAt,
});

export const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;

  if (await User.exists({ email })) {
    throw ApiError.conflict('Email already in use');
  }

  const user = await User.create({ fullName, email, password });

  res.status(201).json({
    user: publicUser(user),
    token: generateToken(user._id),
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Parola e select:false pe schemă, deci trebuie cerută explicit.
  const user = await User.findOne({ email }).select('+password');

  // Același mesaj pentru email inexistent și parolă greșită: altfel endpointul
  // devine un oracol care confirmă ce adrese sunt înregistrate.
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid credentials');
  }

  res.json({ user: publicUser(user), token: generateToken(user._id) });
});

export const getUserInfo = asyncHandler(async (req, res) => {
  res.json(publicUser(req.user));
});

export const updateCheckoutPrefs = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { lastCheckout: { ...req.body, date: new Date() } } },
    { new: true }
  );

  res.json(publicUser(user));
});
