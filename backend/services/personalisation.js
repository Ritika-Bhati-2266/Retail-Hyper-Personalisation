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
        // Track keywords
        if (!profile.searchKeywords.includes(queryText)) {
          // If mongoose Map or normal array
          if (Array.isArray(profile.searchKeywords)) {
            profile.searchKeywords.push(queryText);
          } else {
            profile.searchKeywords = [queryText];
          }
        }
        
        // Scan categories to see if query matches a category name
        const categories = ['electronics', 'fashion', 'fitness', 'home', 'apparel', 'sports', 'books'];
        const matchedCategory = categories.find(cat => queryText.includes(cat));
        if (matchedCategory) {
          const catKey = matchedCategory.charAt(0).toUpperCase() + matchedCategory.slice(1);
          affinity[catKey] = (affinity[catKey] || 0) + 2;
        }
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

    // Fallback: If no preference profile or affinities, return top discounted and newest products
    const affinity = profile ? (profile.categoryAffinity instanceof Map
      ? Object.fromEntries(profile.categoryAffinity)
      : (profile.categoryAffinity || {})) : {};

    const entries = Object.entries(affinity);
    
    if (!profile || entries.length === 0) {
      // Popular / Trending: sort by discountPercent desc, stock desc
      return allProducts
        .sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0))
        .slice(0, limit);
    }

    // Sort categories by user interest weight
    const categoryWeights = new Map(entries);

    // Score products: weight = (categoryAffinity * 2) + (discountPercent / 10) + (tagMatches * 3)
    const scoredProducts = allProducts.map(prod => {
      const catWeight = categoryWeights.get(prod.category) || 0;
      let score = catWeight * 5; // Heavily weight category matches
      
      // Add discount weight
      score += (prod.discountPercent || 0) * 0.5;

      // Tag matching
      if (profile.searchKeywords && profile.searchKeywords.length > 0 && prod.tags) {
        const tagMatches = prod.tags.filter(tag => 
          profile.searchKeywords.some(keyword => keyword.includes(tag.toLowerCase()) || tag.toLowerCase().includes(keyword))
        ).length;
        score += tagMatches * 10;
      }
      
      return { product: prod, score };
    });

    // Sort by score desc and return products
    return scoredProducts
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
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
