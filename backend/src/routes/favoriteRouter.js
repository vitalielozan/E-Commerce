import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import {
  getFavorites,
  addProductToFavorite,
  addProductFromFavToCart,
  deleteProductFromFavorite,
  favoriteSchema,
} from '../controllers/favoriteController.js';

const router = express.Router();

router.use(protect);

router.get('/', getFavorites);
router.post('/', validate(favoriteSchema), addProductToFavorite);
router.post('/to-cart', validate(favoriteSchema), addProductFromFavToCart);
router.delete('/:id', deleteProductFromFavorite);

export default router;
