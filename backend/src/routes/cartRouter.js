import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import {
  getCart,
  addProductToCart,
  updateCartItemQuantity,
  deleteProductFromCart,
  clearCart,
  addToCartSchema,
  updateQuantitySchema,
} from '../controllers/cartController.js';

const router = express.Router();

router.use(protect);

router.get('/', getCart);
router.post('/', validate(addToCartSchema), addProductToCart);
router.patch('/:id', validate(updateQuantitySchema), updateCartItemQuantity);
router.delete('/:id', deleteProductFromCart);
router.delete('/', clearCart);

export default router;
