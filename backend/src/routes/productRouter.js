import express from 'express';
import { validate } from '../middleware/validate.js';
import {
  getProducts,
  getFacets,
  getProductsByBrand,
  getProductById,
  getRelatedProducts,
  listQuerySchema,
} from '../controllers/productController.js';

const router = express.Router();

router.get('/', validate(listQuerySchema, 'query'), getProducts);
router.get('/facets', getFacets);
router.get('/brand/:brand', getProductsByBrand);
router.get('/:id/related', getRelatedProducts);
router.get('/:id', getProductById);

export default router;
