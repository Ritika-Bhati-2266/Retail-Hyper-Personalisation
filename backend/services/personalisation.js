import { BehaviorLog } from '../models/behavior.js';
import { UserPreferenceProfile } from '../models/preference.js';
import { Product } from '../models/product.js';
import { Offer } from '../models/offer.js';

/**
 * Log a behavior event and update the user's preference profile in real-time.
 */
export async function logEvent(sessionId, userId, eventType, details = {}) {
  try {
    // 1. Create behavior log
    await BehaviorLog.create({
      userId,
      sessionId,
      eventType,
      details,
      timestamp: new Date()
    });

    // 2. Fetch or create preference profile
    let query = {};
    if (userId) {
      query = { $or: [{ userId }, { sessionId }] };
    } else {
      query = { sessionId };
    }
    
    let profile = await UserPreferenceProfile.findOne(query);
    if (!profile) {
      profile = await UserPreferenceProfile.create({
        userId,
        sessionId,
        categoryAffinity: {},
        searchKeywords: [],
        lastActive: new Date()
      });
    } else {
      // Keep ids updated if guest logged in
      if (userId && !profile.userId) {
        profile.userId = userId;
      }
      profile.lastActive = new Date();
    }

    // Support Map conversions (Mongo uses Map, Mock uses basic Object)
    const affinity = profile.categoryAffinity instanceof Map 
      ? Object.fromEntries(profile.categoryAffinity) 
      : (profile.categoryAffinity || {});

    // 3. Process event weights
    let category = details.category;
    
    // If product details are present but category is missing, resolve category from product DB
    if (details.productId && !category) {
      const product = await Product.findById(details.productId);
      if (product) {
        category = product.category;
      }
    }

    if (category) {
      let weight = 0;
      if (eventType === 'click') weight = 1;
      if (eventType === 'cart') weight = 5;
      if (eventType === 'purchase') weight = 10;

      affinity[category] = (affinity[category] || 0) + weight;
    }

    if (eventType === 'search' && details.queryText) {
      const queryText = details.queryText.toLowerCase().trim();
      if (queryText) {
        // Track keywords - keep unique, insert at front, limit to 10
        let keywords = Array.isArray(profile.searchKeywords) ? [...profile.searchKeywords] : [];
        keywords = keywords.filter(kw => kw !== queryText);
        keywords.unshift(queryText);
        profile.searchKeywords = keywords.slice(0, 10);
        
        // Scan categories to see if query matches a category name
        const categories = ['electronics', 'fashion', 'fitness', 'home', 'apparel', 'sports', 'books'];
        const matchedCategory = categories.find(cat => queryText.includes(cat));
        if (matchedCategory) {
          const catKey = matchedCategory.charAt(0).toUpperCase() + matchedCategory.slice(1);
          affinity[catKey] = (affinity[catKey] || 0) + 2;
        }
      }
    }

    // 4. Update click frequency and recently viewed products
    if (details.productId) {
      const prodId = details.productId.toString();

      // Click frequency (on click event)
      if (eventType === 'click') {
        const clickFreq = profile.clickFrequency instanceof Map 
          ? Object.fromEntries(profile.clickFrequency) 
          : (profile.clickFrequency || {});
        
        clickFreq[prodId] = (clickFreq[prodId] || 0) + 1;
        
        if (profile.clickFrequency instanceof Map) {
          for (const [k, v] of Object.entries(clickFreq)) {
            profile.clickFrequency.set(k, v);
          }
        } else {
          profile.clickFrequency = clickFreq;
        }
      }

      // Recently viewed (on click event)
      if (eventType === 'click') {
        let recentlyViewed = profile.recentlyViewed || [];
        recentlyViewed = recentlyViewed.filter(id => id !== prodId);
        recentlyViewed.unshift(prodId);
        profile.recentlyViewed = recentlyViewed.slice(0, 15);
      }
    }

    // Update profile affinity map
    if (profile.categoryAffinity instanceof Map) {
      for (const [k, v] of Object.entries(affinity)) {
        profile.categoryAffinity.set(k, v);
      }
    } else {
      profile.categoryAffinity = affinity;
    }

    // Save profile updates
    // In mock database, we update it via findByIdAndUpdate or standard .save()
    if (typeof profile.save === 'function') {
      await profile.save();
    } else {
      await UserPreferenceProfile.findByIdAndUpdate(profile._id, profile);
    }
    
    return profile;
  } catch (error) {
    console.error('Error logging behavioral event:', error);
    return null;
  }
}

/**
 * Map preference profile to market segments
 */
export function getSegmentFromProfile(profile) {
  if (!profile) return 'new_users';

  const affinity = profile.categoryAffinity instanceof Map
    ? Object.fromEntries(profile.categoryAffinity)
    : (profile.categoryAffinity || {});

  const entries = Object.entries(affinity);
  if (entries.length === 0) {
    // If no click history but user has searched, check keywords
    if (profile.searchKeywords && profile.searchKeywords.length > 0) {
      const keywordsStr = profile.searchKeywords.join(' ');
      if (keywordsStr.includes('laptop') || keywordsStr.includes('phone') || keywordsStr.includes('tech') || keywordsStr.includes('watch')) {
        return 'electronics_lovers';
      }
      if (keywordsStr.includes('shirt') || keywordsStr.includes('jacket') || keywordsStr.includes('dress') || keywordsStr.includes('shoe')) {
        return 'fashion_lovers';
      }
      if (keywordsStr.includes('deal') || keywordsStr.includes('discount') || keywordsStr.includes('sale') || keywordsStr.includes('cheap')) {
        return 'bargain_hunters';
      }
    }
    return 'new_users';
  }

  // Find category with highest affinity
  const sorted = entries.sort((a, b) => b[1] - a[1]);
  const [topCategory, topWeight] = sorted[0];

  if (topWeight < 2) return 'new_users'; // Low confidence, treat as new

  if (topCategory === 'Electronics') return 'electronics_lovers';
  if (topCategory === 'Fashion' || topCategory === 'Apparel') return 'fashion_lovers';
  
  // Bargain hunter logic: if user looks at items with large discount percent
  // We check their interest weights or fall back to high discount items
  return 'bargain_hunters';
}

/**
 * Fetch personalized recommendations
 */
export async function getRecommendations(sessionId, userId, limit = 8) {
  try {
    let query = {};
    if (userId) {
      query = { $or: [{ userId }, { sessionId }] };
    } else {
      query = { sessionId };
    }

    const profile = await UserPreferenceProfile.findOne(query);
    const allProducts = await Product.find({});
    
    // Fallback if no products
    if (allProducts.length === 0) return [];

    // Calculate global trending scores from all behavior logs
    const behaviors = await BehaviorLog.find({});
    const trendingScores = {};
    
    // Process behaviors (only recent ones, e.g. within 7 days, or last 500 logs)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentBehaviors = behaviors.filter(b => {
      const timestamp = new Date(b.timestamp || b.createdAt);
      return timestamp >= sevenDaysAgo;
    });

    for (const b of recentBehaviors) {
      if (b.details && b.details.productId) {
        const prodId = b.details.productId;
        let weight = 0;
        if (b.eventType === 'click') weight = 1;
        if (b.eventType === 'cart') weight = 5;
        if (b.eventType === 'purchase') weight = 10;
        
        trendingScores[prodId] = (trendingScores[prodId] || 0) + weight;
      }
    }

    // Extract profile values with fallbacks
    const affinity = profile ? (profile.categoryAffinity instanceof Map
      ? Object.fromEntries(profile.categoryAffinity)
      : (profile.categoryAffinity || {})) : {};

    const recentlyViewed = profile ? (profile.recentlyViewed || []) : [];

    const clickFreq = profile ? (profile.clickFrequency instanceof Map
      ? Object.fromEntries(profile.clickFrequency)
      : (profile.clickFrequency || {})) : {};

    const searchKeywords = profile ? (profile.searchKeywords || []) : [];

    // Score all products
    const scoredProducts = allProducts.map(prod => {
      let score = 0;
      const prodId = prod._id.toString();

      // 1. Category Affinity
      const catWeight = affinity[prod.category] || 0;
      score += catWeight * 6;

      // 2. Click Frequency on this specific product
      const userProductClicks = clickFreq[prodId] || 0;
      score += Math.min(userProductClicks, 5) * 8;

      // 3. Recently Viewed Category & Tag match
      // If product was recently viewed, give a direct boost to keep it recommended
      const recencyIndex = recentlyViewed.indexOf(prodId);
      if (recencyIndex !== -1) {
        // Boost based on recency: first gets more boost
        score += Math.max(0, 15 - recencyIndex * 2);
      }

      // Check similarity with the top 3 recently viewed products
      const topRecentIds = recentlyViewed.slice(0, 3);
      for (const recentId of topRecentIds) {
        const recentProd = allProducts.find(p => p._id.toString() === recentId);
        if (recentProd) {
          if (recentProd.category === prod.category) {
            score += 8; // Category similarity boost
          }
          if (recentProd.tags && prod.tags) {
            const commonTags = prod.tags.filter(t => recentProd.tags.includes(t)).length;
            score += commonTags * 3; // Tag similarity boost
          }
        }
      }

      // 4. Search Keywords match
      let keywordScore = 0;
      if (searchKeywords.length > 0) {
        const productNameLower = (prod.name || '').toLowerCase();
        const productDescLower = (prod.description || '').toLowerCase();
        
        searchKeywords.forEach((keyword, idx) => {
          const kw = keyword.toLowerCase().trim();
          if (!kw) return;
          
          let match = false;
          let matchScore = 0;
          if (productNameLower.includes(kw) || prod.category.toLowerCase().includes(kw)) {
            matchScore += 12;
            match = true;
          }
          if (prod.tags && prod.tags.some(t => t.toLowerCase().includes(kw) || kw.includes(t.toLowerCase()))) {
            matchScore += 8;
            match = true;
          }
          if (productDescLower.includes(kw)) {
            matchScore += 4;
            match = true;
          }
          
          // Apply recency decay: newer keywords have more weight
          if (match) {
            const decay = Math.max(0.2, 1 - idx * 0.15);
            keywordScore += matchScore * decay;
          }
        });
        score += keywordScore;
      }

      // 5. Global Trending Score
      const trendScore = trendingScores[prodId] || 0;
      score += trendScore * 2;

      // 6. Base / Discount Boost
      const discountScore = (prod.discountPercent || 0) * 0.4;
      score += discountScore;

      // Compute Recommendation Reason based on maximum contribution
      let reason = "Recommended for you";
      let maxContribution = 0;

      if (trendScore * 2 > maxContribution && trendScore > 0) {
        maxContribution = trendScore * 2;
        reason = "Trending Now";
      }
      if (catWeight * 6 > maxContribution && catWeight > 0) {
        maxContribution = catWeight * 6;
        reason = `Popular in ${prod.category}`;
      }
      if (userProductClicks * 8 > maxContribution && userProductClicks > 0) {
        maxContribution = userProductClicks * 8;
        reason = "Frequently Visited";
      }
      if (recencyIndex !== -1 && Math.max(0, 15 - recencyIndex * 2) > maxContribution) {
        maxContribution = Math.max(0, 15 - recencyIndex * 2);
        reason = "Recently Viewed";
      }
      if (keywordScore > maxContribution && keywordScore > 0) {
        maxContribution = keywordScore;
        reason = "Based on search";
      }
      if (discountScore > maxContribution && prod.discountPercent > 15) {
        maxContribution = discountScore;
        reason = "Great Deal";
      }

      // Convert to plain object to attach metadata
      const prodObj = typeof prod.toObject === 'function' ? prod.toObject() : JSON.parse(JSON.stringify(prod));
      prodObj.recommendationReason = reason;

      return { product: prodObj, score };
    });

    // Sort by score desc, fallback to discount
    return scoredProducts
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return (b.product.discountPercent || 0) - (a.product.discountPercent || 0);
      })
      .map(item => item.product)
      .slice(0, limit);

  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return [];
  }
}

/**
 * Fetch targeted offers for the current user session
 */
export async function getPersonalizedOffers(sessionId, userId) {
  try {
    let query = {};
    if (userId) {
      query = { $or: [{ userId }, { sessionId }] };
    } else {
      query = { sessionId };
    }

    const profile = await UserPreferenceProfile.findOne(query);
    const segment = getSegmentFromProfile(profile);

    // Retrieve active offers
    const offers = await Offer.find({ active: true });
    
    // Sort offers: matching user segment first, then 'all', then others
    return offers.sort((a, b) => {
      if (a.targetSegment === segment && b.targetSegment !== segment) return -1;
      if (b.targetSegment === segment && a.targetSegment !== segment) return 1;
      if (a.targetSegment === 'all' && b.targetSegment !== 'all') return -1;
      if (b.targetSegment === 'all' && a.targetSegment !== 'all') return 1;
      return 0;
    });
  } catch (error) {
    console.error('Error fetching personalized offers:', error);
    return [];
  }
}
