import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    comment: { type: String, required: true, trim: true, maxlength: 1000 },
    rating: { type: Number, min: 1, max: 5, required: true },
  },
  { timestamps: true }
);

// O singură recenzie per utilizator per produs.
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Recalculează media pe produs. Rulează după fiecare scriere, astfel încât
// Product.ratingAverage să nu poată rămâne desincronizat.
ReviewSchema.statics.syncProductRating = async function (productId) {
  const [stats] = await this.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(String(productId)) } },
    {
      $group: {
        _id: '$product',
        ratingAverage: { $avg: '$rating' },
        ratingCount: { $sum: 1 },
      },
    },
  ]);

  await mongoose.model('Product').findByIdAndUpdate(productId, {
    ratingAverage: stats ? Math.round(stats.ratingAverage * 10) / 10 : 0,
    ratingCount: stats ? stats.ratingCount : 0,
  });
};

ReviewSchema.post('save', function () {
  this.constructor.syncProductRating(this.product);
});

ReviewSchema.post('findOneAndDelete', function (doc) {
  if (doc) doc.constructor.syncProductRating(doc.product);
});

const Review = mongoose.model('Review', ReviewSchema);

export default Review;
