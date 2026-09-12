import mongoose from 'mongoose';

const CartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: { type: Number, required: true, default: 1, min: 1, max: 99 },
  },
  { timestamps: true }
);

// Garanția reală că un produs apare o singură dată în coșul unui utilizator:
// un findOne() înainte de insert lasă o fereastră de race condition.
CartSchema.index({ user: 1, product: 1 }, { unique: true });

const Cart = mongoose.model('Cart', CartSchema);

export default Cart;
