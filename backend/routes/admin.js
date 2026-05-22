import express from 'express';
import { User } from '../models/user.js';
import { Product } from '../models/product.js';
import { Offer } from '../models/offer.js';
import { BehaviorLog } from '../models/behavior.js';
import { UserPreferenceProfile } from '../models/preference.js';
import { authenticateUser, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET Admin Dashboard Analytics
router.get('/analytics', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const totalUsers = (await User.find({})).length;
    const totalProducts = (await Product.find({})).length;
    const totalOffers = (await Offer.find({})).length;
    const behaviorLogs = await BehaviorLog.find({});
    
    // Sort logs descending for feed
    const recentLogs = [...behaviorLogs]
      .sort((a, b) => new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt))
      .slice(0, 15);

    // Aggregate category clicks
    const categoryClicks = {};
    const searchTermsCount = {};

    behaviorLogs.forEach(log => {
      // Category clicks aggregation
      if (log.eventType === 'click' && log.details?.category) {
        const cat = log.details.category;
        categoryClicks[cat] = (categoryClicks[cat] || 0) + 1;
      }
      
      // Cart / purchases counts
      if (log.eventType === 'cart' && log.details?.category) {
        const cat = log.details.category;
        categoryClicks[cat] = (categoryClicks[cat] || 0) + 3;
      }
      if (log.eventType === 'purchase' && log.details?.category) {
        const cat = log.details.category;
        categoryClicks[cat] = (categoryClicks[cat] || 0) + 5;
      }

      // Search term popularity
      if (log.eventType === 'search' && log.details?.queryText) {
        const term = log.details.queryText.toLowerCase().trim();
        if (term) {
          searchTermsCount[term] = (searchTermsCount[term] || 0) + 1;
        }
      }
    });

    const popularSearches = Object.entries(searchTermsCount)
      .map(([term, count]) => ({ term, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const categoryDistribution = Object.entries(categoryClicks)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Segment stats based on all preference profiles
    const profiles = await UserPreferenceProfile.find({});
    const segments = {
      electronics_lovers: 0,
      fashion_lovers: 0,
      bargain_hunters: 0,
      new_users: 0
    };

    profiles.forEach(prof => {
      const affinities = prof.categoryAffinity instanceof Map
        ? Object.fromEntries(prof.categoryAffinity)
        : (prof.categoryAffinity || {});
      const entries = Object.entries(affinities);
      
      if (entries.length === 0) {
        segments.new_users++;
      } else {
        const top = entries.sort((a, b) => b[1] - a[1])[0];
        if (top[1] < 2) {
          segments.new_users++;
        } else if (top[0] === 'Electronics') {
          segments.electronics_lovers++;
        } else if (top[0] === 'Fashion' || top[0] === 'Apparel') {
          segments.fashion_lovers++;
        } else {
          segments.bargain_hunters++;
        }
      }
    });

    res.json({
      summary: {
        totalUsers,
        totalProducts,
        totalOffers,
        totalEvents: behaviorLogs.length
      },
      categoryDistribution,
      popularSearches,
      segmentDistribution: Object.entries(segments).map(([name, value]) => ({ name, value })),
      recentLogs
    });

  } catch (error) {
    res.status(500).json({ message: 'Error retrieving analytics data', error: error.message });
  }
});

// POST Add New Product (Admin only)
router.post('/products', authenticateUser, requireAdmin, async (req, res) => {
  const { name, description, price, category, image, tags, discountPercent, stock } = req.body;
  
  if (!name || !description || !price || !category || !image) {
    return res.status(400).json({ message: 'Required fields missing: name, description, price, category, image' });
  }

  try {
    const product = await Product.create({
      name,
      description,
      price: Number(price),
      category,
      image,
      tags: Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()),
      discountPercent: Number(discountPercent || 0),
      stock: Number(stock || 10)
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
});

// POST Add New Dynamic Offer (Admin only)
router.post('/offers', authenticateUser, requireAdmin, async (req, res) => {
  const { title, description, discountCode, targetSegment, bannerImage } = req.body;

  if (!title || !description || !discountCode || !targetSegment || !bannerImage) {
    return res.status(400).json({ message: 'Required fields missing: title, description, discountCode, targetSegment, bannerImage' });
  }

  try {
    const offer = await Offer.create({
      title,
      description,
      discountCode,
      targetSegment,
      bannerImage,
      active: true
    });
    res.status(201).json(offer);
  } catch (error) {
    res.status(500).json({ message: 'Error creating offer', error: error.message });
  }
});

// DELETE Reset behaviors for demo (Admin only)
router.delete('/behaviors/clear', authenticateUser, requireAdmin, async (req, res) => {
  try {
    await BehaviorLog.deleteMany({});
    await UserPreferenceProfile.deleteMany({});
    res.json({ success: true, message: 'Behavior data and profiles cleared successfully. Session personalization reset.' });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing behavior log', error: error.message });
  }
});

export default router;
