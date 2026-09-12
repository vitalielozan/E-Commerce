import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  createOrderSchema,
} from '../controllers/orderController.js';

const router = express.Router();

router.use(protect);

router.post('/', validate(createOrderSchema), createOrder);
router.get('/', getMyOrders);
router.get('/:id', getOrderById);

export default router;
