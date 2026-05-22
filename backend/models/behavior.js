import mongoose from 'mongoose';
import { createModelProxy } from '../config/modelProxy.js';

const behaviorSchema = new mongoose.Schema({
  userId: { type: String, default: null },
  sessionId: { type: String, required: true },
  eventType: { type: String, enum: ['click', 'search', 'cart', 'purchase'], required: true },
  details: { type: mongoose.Schema.Types.Mixed, default: {} },
  timestamp: { type: Date, default: Date.now }
});

const MongoBehavior = mongoose.model('BehaviorLog', behaviorSchema);

export const BehaviorLog = createModelProxy('behaviors', MongoBehavior);
