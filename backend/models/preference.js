import mongoose from 'mongoose';
import { createModelProxy } from '../config/modelProxy.js';

const preferenceSchema = new mongoose.Schema({
  userId: { type: String, default: null },
  sessionId: { type: String, required: true },
  categoryAffinity: { type: Map, of: Number, default: {} },
  searchKeywords: { type: [String], default: [] },
  recentlyViewed: { type: [String], default: [] },
  clickFrequency: { type: Map, of: Number, default: {} },
  lastActive: { type: Date, default: Date.now }
});

const MongoPreference = mongoose.model('UserPreferenceProfile', preferenceSchema);

export const UserPreferenceProfile = createModelProxy('preferences', MongoPreference);
