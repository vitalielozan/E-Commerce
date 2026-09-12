import express from 'express';
import rateLimit from 'express-rate-limit';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import {
  registerUser,
  loginUser,
  getUserInfo,
  updateCheckoutPrefs,
  registerSchema,
  loginSchema,
  checkoutPrefsSchema,
} from '../controllers/authController.js';

// Fără asta, endpointul de login e brute-forcabil la viteza rețelei.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many attempts, please try again in 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

const router = express.Router();

router.post('/register', authLimiter, validate(registerSchema), registerUser);
router.post('/login', authLimiter, validate(loginSchema), loginUser);
router.get('/me', protect, getUserInfo);
router.patch(
  '/checkout-prefs',
  protect,
  validate(checkoutPrefsSchema),
  updateCheckoutPrefs
);

export default router;
