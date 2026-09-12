import { z } from 'zod';
import Product from '../models/Product.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listQuerySchema = z.object({
  q: z.string().trim().min(1).max(80).optional(),
  brand: z.string().trim().optional(),
  category: z.string().trim().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minSize: z.coerce.number().min(0).optional(),
  maxSize: z.coerce.number().min(0).optional(),
  sort: z
    .enum(['relevance', 'newest', 'priceAsc', 'priceDesc', 'rating'])
    .default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(12),
});

// Un singur endpoint acoperă listare, căutare, filtrare, sortare și paginare —
// clientul nu mai descarcă tot catalogul ca să filtreze în browser.
export const getProducts = asyncHandler(async (req, res) => {
  const { q, brand, category, minPrice, maxPrice, minSize, maxSize, sort, page, limit } =
    req.validatedQuery;

  const filter = {};
  if (q) filter.$text = { $search: q };
  if (brand) filter.brand = { $in: brand.split(',').map((b) => b.trim()) };
  if (category) filter.category = category;
  if (minPrice != null || maxPrice != null) {
    filter.price = {};
    if (minPrice != null) filter.price.$gte = minPrice;
    if (maxPrice != null) filter.price.$lte = maxPrice;
  }
  if (minSize != null || maxSize != null) {
    filter.screenSize = {};
    if (minSize != null) filter.screenSize.$gte = minSize;
    if (maxSize != null) filter.screenSize.$lte = maxSize;
  }

  const sortMap = {
    newest: { createdAt: -1 },
    priceAsc: { price: 1 },
    priceDesc: { price: -1 },
    rating: { ratingAverage: -1, ratingCount: -1 },
    relevance: q ? { score: { $meta: 'textScore' } } : { createdAt: -1 },
  };

  const projection = q && sort === 'relevance' ? { score: { $meta: 'textScore' } } : {};

  const [items, total] = await Promise.all([
    Product.find(filter, projection)
      .sort(sortMap[sort])
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  res.json({
    items,
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  });
});

// Alimentează bara laterală de filtre cu valorile care chiar există în catalog.
export const getFacets = asyncHandler(async (_req, res) => {
  const [brands, sizes, range] = await Promise.all([
    Product.aggregate([
      { $group: { _id: '$brand', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, brand: '$_id', count: 1 } },
    ]),
    Product.distinct('screenSize'),
    Product.aggregate([
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
    ]),
  ]);

  res.json({
    brands,
    sizes: sizes.filter(Boolean).sort((a, b) => a - b),
    priceRange: range[0]
      ? { min: Math.floor(range[0].minPrice), max: Math.ceil(range[0].maxPrice) }
      : { min: 0, max: 0 },
  });
});

export const getProductsByBrand = asyncHandler(async (req, res) => {
  const products = await Product.find({
    brand: new RegExp(`^${escapeRegex(req.params.brand)}$`, 'i'),
  })
    .sort({ price: 1 })
    .lean();
  res.json(products);
});

export const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  // Acceptă atât ObjectId cât și slug, ca URL-urile să poată deveni lizibile.
  const product = await Product.findOne(
    /^[0-9a-fA-F]{24}$/.test(id) ? { _id: id } : { slug: id.toLowerCase() }
  ).lean();

  if (!product) throw ApiError.notFound('Product not found');
  res.json(product);
});

// Produse din același brand, apropiate ca preț — sub fișa produsului.
export const getRelatedProducts = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).lean();
  if (!product) throw ApiError.notFound('Product not found');

  const related = await Product.find({
    _id: { $ne: product._id },
    $or: [{ brand: product.brand }, { category: product.category }],
  })
    .sort({ ratingAverage: -1 })
    .limit(4)
    .lean();

  res.json(related);
});

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
