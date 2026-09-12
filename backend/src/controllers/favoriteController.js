import { z } from 'zod';
import Favorite from '../models/Favorite.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { loadCart } from './cartController.js';

export const favoriteSchema = z.object({
  productId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product id'),
});

export const getFavorites = asyncHandler(async (req, res) => {
  const favorites = await Favorite.find({ user: req.user._id })
    .populate('product')
    .sort({ createdAt: -1 });

  res.json(favorites.filter((f) => f.product));
});

export const addProductToFavorite = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  const product = await Product.findById(productId).select('_id');
  if (!product) throw ApiError.notFound('Product not found');

  // Upsert: a doua adăugare e idempotentă, nu o eroare.
  const favorite = await Favorite.findOneAndUpdate(
    { user: req.user._id, product: productId },
    { $setOnInsert: { user: req.user._id, product: productId } },
    { upsert: true, new: true }
  ).populate('product');

  res.status(201).json(favorite);
});

export const addProductFromFavToCart = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  const product = await Product.findById(productId).select('_id');
  if (!product) throw ApiError.notFound('Product not found');

  const existing = await Cart.findOne({ user: req.user._id, product: productId });
  await Cart.findOneAndUpdate(
    { user: req.user._id, product: productId },
    { $set: { quantity: Math.min(99, (existing?.quantity ?? 0) + 1) } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.status(201).json(await loadCart(req.user._id));
});

export const deleteProductFromFavorite = asyncHandler(async (req, res) => {
  const deleted = await Favorite.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!deleted) throw ApiError.notFound('Favorite not found');
  res.json({ _id: deleted._id });
});
