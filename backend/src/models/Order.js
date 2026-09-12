import mongoose from 'mongoose';

// Linia de comandă copiază titlul și prețul în momentul cumpărării: o comandă
// trebuie să rămână corectă chiar dacă produsul e ulterior redenumit sau scump
const OrderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    title: { type: String, required: true },
    image: { type: String },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Număr lizibil, arătat clientului în locul unui ObjectId.
    reference: { type: String, required: true, unique: true },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'Comanda trebuie să conțină cel puțin un produs',
      },
    },
    billingAddress: { type: String, required: true },
    shippingAddress: { type: String, required: true },
    // Doar ultimele 4 cifre ajung vreodată în baza de date.
    cardLast4: { type: String, required: true, maxlength: 4 },
    subtotal: { type: Number, required: true, min: 0 },
    shippingCost: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'],
      default: 'paid',
    },
  },
  { timestamps: true }
);

OrderSchema.index({ user: 1, createdAt: -1 });

const Order = mongoose.model('Order', OrderSchema);

export default Order;
