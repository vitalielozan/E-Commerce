import { z } from 'zod';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const addToCartSchema = z.object({
  productId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product id'),
  quantity: z.coerce.number().int().min(1).max(99).default(1),
});

export const updateQuantitySchema = z.object({
  quantity: z.coerce.number().int().min(1).max(99),
});

const serialize = (doc) => ({
  _id: doc._id,
  product: doc.product,
  quantity: doc.quantity,
  lineTotal: Math.round(doc.product.price * doc.quantity * 100) / 100,
  createdAt: doc.createdAt,
});

const loadCart = async (userId) => {
  const items = await Cart.find({ user: userId })
    .populate('product')
    .sort({ createdAt: -1 });

  // Un produs șters din catalog nu trebuie să spargă coșul.
  const valid = items.filter((i) => i.product);
  const lines = valid.map(serialize);
  const subtotal = lines.reduce((acc, l) => acc + l.lineTotal, 0);

  return {
    items: lines,
    itemCount: lines.reduce((acc, l) => acc + l.quantity, 0),
    subtotal: Math.round(subtotal * 100) / 100,
  };
};

export const getCart = asyncHandler(async (req, res) => {
  res.json(await loadCart(req.user._id));
});

export const addProductToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  const product = await Product.findById(productId).select('_id stock');
  if (!product) throw ApiError.notFound('Product not found');

  // Re-adăugarea aceluiași produs crește cantitatea în loc să dea eroare.
  const existing = await Cart.findOne({ user: req.user._id, product: productId });
  const nextQty = Math.min(99, (existing?.quantity ?? 0) + quantity);

  if (product.stock > 0 && nextQty > product.stock) {
    throw ApiError.badRequest(`Only ${product.stock} left in stock`);
  }

  await Cart.findOneAndUpdate(
    { user: req.user._id, product: productId },
    { $set: { quantity: nextQty } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.status(201).json(await loadCart(req.user._id));
});

export const updateCartItemQuantity = asyncHandler(async (req, res) => {
  // Filtrul include user: proprietarul e verificat de query, nu după citire.
  const item = await Cart.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { $set: { quantity: req.body.quantity } },
    { new: true }
  );

  if (!item) throw ApiError.notFound('Cart item not found');
  res.json(await loadCart(req.user._id));
});

export const deleteProductFromCart = asyncHandler(async (req, res) => {
  const deleted = await Cart.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!deleted) throw ApiError.notFound('Cart item not found');
  res.json(await loadCart(req.user._id));
});

export const clearCart = asyncHandler(async (req, res) => {
  await Cart.deleteMany({ user: req.user._id });
  res.json(await loadCart(req.user._id));
});

export { loadCart };
