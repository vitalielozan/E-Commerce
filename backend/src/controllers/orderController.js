import crypto from 'crypto';
import { z } from 'zod';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Clientul trimite DOAR ultimele 4 cifre. Numărul complet al cardului e
// validat în browser (Luhn) și nu părăsește niciodată dispozitivul — un demo
// nu are niciun motiv să atingă date de card.
export const createOrderSchema = z.object({
  billingAddress: z.string().trim().min(5, 'Address is too short').max(200),
  shippingAddress: z.string().trim().min(5, 'Address is too short').max(200),
  cardLast4: z.string().regex(/^\d{4}$/, 'Expected the last 4 digits'),
  saveDetails: z.boolean().default(true),
});

const FREE_SHIPPING_THRESHOLD = 500;
const SHIPPING_COST = 19.99;

const buildReference = () => {
  const day = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `TVM-${day}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
};

const round = (n) => Math.round(n * 100) / 100;

export const createOrder = asyncHandler(async (req, res) => {
  const { billingAddress, shippingAddress, cardLast4, saveDetails } = req.body;

  const cartItems = await Cart.find({ user: req.user._id }).populate('product');
  const usable = cartItems.filter((i) => i.product);

  if (usable.length === 0) throw ApiError.badRequest('Your cart is empty');

  // Prețurile sunt recitite din catalog. Dacă totalul ar veni de la client,
  // oricine ar putea comanda un televizor de 2000 $ cu 1 $.
  const items = usable.map((item) => ({
    product: item.product._id,
    title: item.product.title,
    image: item.product.image,
    unitPrice: item.product.price,
    quantity: item.quantity,
  }));

  const subtotal = round(
    items.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0)
  );
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;

  const order = await Order.create({
    user: req.user._id,
    reference: buildReference(),
    items,
    billingAddress,
    shippingAddress,
    cardLast4,
    subtotal,
    shippingCost,
    total: round(subtotal + shippingCost),
    status: 'paid',
  });

  // Scade stocul doar acolo unde e urmărit (stock > 0).
  await Promise.all(
    items.map((i) =>
      Product.updateOne(
        { _id: i.product, stock: { $gte: i.quantity } },
        { $inc: { stock: -i.quantity } }
      )
    )
  );

  await Cart.deleteMany({ user: req.user._id });

  if (saveDetails) {
    await User.findByIdAndUpdate(req.user._id, {
      $set: {
        lastCheckout: { billingAddress, shippingAddress, cardLast4, date: new Date() },
      },
    });
  }

  res.status(201).json(order);
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .lean();

  res.json(orders);
});

export const getOrderById = asyncHandler(async (req, res) => {
  const filter =
    req.user.role === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, user: req.user._id };

  const order = await Order.findOne(filter).lean();
  if (!order) throw ApiError.notFound('Order not found');

  res.json(order);
});
