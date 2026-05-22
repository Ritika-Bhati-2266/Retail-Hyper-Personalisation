import mongoose from 'mongoose';
import { createModelProxy } from '../config/modelProxy.js';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true },
  tags: { type: [String], default: [] },
  discountPercent: { type: Number, default: 0 },
  stock: { type: Number, default: 10 },
  createdAt: { type: Date, default: Date.now }
});

const MongoProduct = mongoose.model('Product', productSchema);

export const Product = createModelProxy('products', MongoProduct);
