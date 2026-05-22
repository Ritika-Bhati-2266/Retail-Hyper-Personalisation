import mongoose from 'mongoose';
import { createModelProxy } from '../config/modelProxy.js';

const offerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  discountCode: { type: String, required: true },
  targetSegment: { 
    type: String, 
    enum: ['all', 'electronics_lovers', 'fashion_lovers', 'new_users', 'bargain_hunters'],
    default: 'all' 
  },
  bannerImage: { type: String, required: true },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const MongoOffer = mongoose.model('Offer', offerSchema);

export const Offer = createModelProxy('offers', MongoOffer);
