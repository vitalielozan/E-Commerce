import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import {
  addReview,
  getReviewsForProduct,
  deleteReview,
  reviewSchema,
} from '../controllers/reviewController.js';

const router = express.Router();

router.get('/:productId', getReviewsForProduct);
router.post('/', protect, validate(reviewSchema), addReview);
router.delete('/:reviewId', protect, deleteReview);

export default router;
