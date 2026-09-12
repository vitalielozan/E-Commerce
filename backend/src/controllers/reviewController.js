import { z } from 'zod';
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const reviewSchema = z.object({
  productId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product id'),
  comment: z.string().trim().min(3, 'Comment is too short').max(1000),
  rating: z.coerce.number().int().min(1).max(5),
});

export const addReview = asyncHandler(async (req, res) => {
  const { productId, comment, rating } = req.body;

  if (!(await Product.exists({ _id: productId }))) {
    throw ApiError.notFound('Product not found');
  }

  if (await Review.exists({ user: req.user._id, product: productId })) {
    throw ApiError.conflict('You already reviewed this product');
  }

  const review = await Review.create({
    product: productId,
    user: req.user._id,
    comment,
    rating,
  });

  await review.populate('user', 'fullName');
  res.status(201).json(review);
});

export const getReviewsForProduct = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId })
    .populate('user', 'fullName')
    .sort({ createdAt: -1 })
    .lean();

  res.json(reviews);
});

export const deleteReview = asyncHandler(async (req, res) => {
  // Autorul sau un admin. Proprietarul e parte din filtru pentru utilizatorii
  // obișnuiți, deci nu există fereastră între citire și ștergere.
  const filter =
    req.user.role === 'admin'
      ? { _id: req.params.reviewId }
      : { _id: req.params.reviewId, user: req.user._id };

  const deleted = await Review.findOneAndDelete(filter);
  if (!deleted) throw ApiError.notFound('Review not found');

  res.json({ _id: deleted._id });
});
