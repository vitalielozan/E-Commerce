import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    brand: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    title: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    // Preț de listă folosit pentru a afișa o reducere; opțional.
    compareAtPrice: { type: Number, min: 0, default: null },
    image: { type: String, required: true },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 8,
        message: 'Cel mult 8 imagini pe produs',
      },
    },
    shortDesc: { type: String, trim: true },
    description: { type: String, trim: true },
    category: { type: String, trim: true, index: true },
    // Diagonala în inch — folosită de filtre.
    screenSize: { type: Number, min: 0, index: true },
    // Pereche cheie/valoare afișată în tabelul de specificații.
    specs: {
      type: Map,
      of: String,
      default: () => new Map(),
    },
    stock: { type: Number, default: 0, min: 0 },
    // Denormalizate din colecția Review; recalculate de Review.syncProductRating.
    ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Căutarea pe server se bazează pe acest index; ponderea mai mare pe titlu
// face ca potrivirile din denumire să iasă înaintea celor din descriere.
ProductSchema.index(
  { title: 'text', shortDesc: 'text', description: 'text', brand: 'text' },
  { weights: { title: 10, brand: 5, shortDesc: 2, description: 1 } }
);
ProductSchema.index({ price: 1 });
ProductSchema.index({ brand: 1, price: 1 });

ProductSchema.virtual('inStock').get(function () {
  return this.stock > 0;
});

const Product = mongoose.model('Product', ProductSchema);

export default Product;
