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
    
    for (const b of behaviors) {
      if (b.details && b.details.productId) {
        const prodId = b.details.productId.toString();
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

    // Get search keywords from user's behavior logs
    const userBehaviors = await BehaviorLog.find(query);
    const searchLogs = userBehaviors
      .filter(b => b.eventType === 'search' && b.details && b.details.queryText)
      .sort((a, b) => new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt));

    const searchKeywords = [];
    for (const log of searchLogs) {
      const kw = log.details.queryText.toLowerCase().trim();
      if (kw && !searchKeywords.includes(kw)) {
        searchKeywords.push(kw);
      }
    }

    // Blend in keywords from profile just in case
    const profileKeywords = profile ? (profile.searchKeywords || []) : [];
    for (const kw of profileKeywords) {
      const cleanKw = kw.toLowerCase().trim();
      if (cleanKw && !searchKeywords.includes(cleanKw)) {
        searchKeywords.push(cleanKw);
      }
    }

    // Extract last 10 unique viewed products
    const last10ViewedIds = recentlyViewed.slice(0, 10);
    const last10ViewedProducts = allProducts.filter(p => last10ViewedIds.includes(p._id.toString()));

    // Max values for normalization
    const maxAffinity = Math.max(...Object.values(affinity), 0);
    const maxClickFreq = Math.max(...Object.values(clickFreq), 0);
    const maxTrending = Math.max(...Object.values(trendingScores), 0);

    // Compute raw recent view scores
    const rawRecentScores = {};
    for (const prod of allProducts) {
      const prodId = prod._id.toString();
      let rawScore = 0;
      for (const rProd of last10ViewedProducts) {
        if (rProd._id.toString() === prodId) continue;
        
        let catMatch = prod.category === rProd.category ? 1.0 : 0.0;
        
        let tagMatch = 0;
        if (prod.tags && rProd.tags && prod.tags.length > 0 && rProd.tags.length > 0) {
          const common = prod.tags.filter(t => rProd.tags.includes(t)).length;
          const union = new Set([...prod.tags, ...rProd.tags]).size;
          tagMatch = common / union;
        }
        
        rawScore += (catMatch * 0.5) + (tagMatch * 0.5);
      }
      rawRecentScores[prodId] = rawScore;
    }
    const maxRecent = Math.max(...Object.values(rawRecentScores), 0);

    // Compute raw search scores
    const rawSearchScores = {};
    for (const prod of allProducts) {
      const prodId = prod._id.toString();
      let rawScore = 0;
      
      const prodName = (prod.name || '').toLowerCase();
      const prodDesc = (prod.description || '').toLowerCase();
      const prodCategory = (prod.category || '').toLowerCase();
      const prodTags = (prod.tags || []).map(t => t.toLowerCase());

      searchKeywords.slice(0, 10).forEach((keyword, idx) => {
        const kw = keyword.toLowerCase().trim();
        if (!kw) return;
        
        let titleMatch = prodName.includes(kw) ? 1.0 : 0.0;
        let categoryMatch = prodCategory.includes(kw) ? 1.0 : 0.0;
        let tagMatch = prodTags.some(t => t.includes(kw) || kw.includes(t)) ? 1.0 : 0.0;
        let descMatch = prodDesc.includes(kw) ? 1.0 : 0.0;

        if (titleMatch || categoryMatch || tagMatch || descMatch) {
          const decay = Math.max(0.2, 1 - idx * 0.1);
          rawScore += (titleMatch * 10 + categoryMatch * 8 + tagMatch * 5 + descMatch * 2) * decay;
        }
      });
      rawSearchScores[prodId] = rawScore;
    }
    const maxSearch = Math.max(...Object.values(rawSearchScores), 0);

    // Score all products
    const scoredProducts = allProducts.map(prod => {
      const prodId = prod._id.toString();

      // 1. Category Affinity
      const categoryScore = maxAffinity > 0 ? ((affinity[prod.category] || 0) / maxAffinity) * 100 : 0;

      // 2. Recent View Similarity
      const recentViewScore = maxRecent > 0 ? (rawRecentScores[prodId] / maxRecent) * 100 : 0;

      // 3. Search Keyword match
      const searchScore = maxSearch > 0 ? (rawSearchScores[prodId] / maxSearch) * 100 : 0;

      // 4. Click Frequency
      const clickScore = maxClickFreq > 0 ? ((clickFreq[prodId] || 0) / maxClickFreq) * 100 : 0;

      // 5. Global Trending Score
      const trendingScore = maxTrending > 0 ? ((trendingScores[prodId] || 0) / maxTrending) * 100 : 0;

      // Weighted Combination Formula:
      // finalScore = (categoryScore * 0.30) + (recentViewScore * 0.25) + (searchScore * 0.20) + (clickScore * 0.15) + (trendingScore * 0.10)
      let finalScore = 
        (categoryScore * 0.30) +
        (recentViewScore * 0.25) +
        (searchScore * 0.20) +
        (clickScore * 0.15) +
        (trendingScore * 0.10);

      // Determine recommendationReason
      let reason = "Trending Now";
      let maxContribution = 0;

      const weightedCategory = categoryScore * 0.30;
      const weightedRecent = recentViewScore * 0.25;
      const weightedSearch = searchScore * 0.20;
      const weightedClick = clickScore * 0.15;
      const weightedTrending = trendingScore * 0.10;

      if (weightedCategory > maxContribution) {
        maxContribution = weightedCategory;
        reason = "Based on category interest";
      }
      if (weightedRecent > maxContribution) {
        maxContribution = weightedRecent;
        reason = "Similar to recently viewed";
      }
      if (weightedSearch > maxContribution) {
        maxContribution = weightedSearch;
        reason = "Matches your search";
      }
      if (weightedClick > maxContribution) {
        maxContribution = weightedClick;
        reason = "Frequently viewed";
      }
      if (weightedTrending > maxContribution || maxContribution === 0) {
        maxContribution = weightedTrending;
        reason = "Trending Now";
      }

      // Add slight randomness/diversity to avoid repetitive recommendations
      finalScore += Math.random() * 5.0;

      // Convert to plain object
      const prodObj = typeof prod.toObject === 'function' ? prod.toObject() : JSON.parse(JSON.stringify(prod));
      prodObj.recommendationReason = reason;
      
      prodObj.personalizationScores = {
        categoryScore,
        recentViewScore,
        searchScore,
        clickScore,
        trendingScore,
        finalScore
      };

      return { product: prodObj, score: finalScore };
    });

    const hasHistory = maxAffinity > 0 || maxRecent > 0 || maxSearch > 0 || maxClickFreq > 0;

    let finalRecommendations = [];
    if (!hasHistory) {
      finalRecommendations = scoredProducts
        .sort((a, b) => {
          const trendB = trendingScores[b.product._id.toString()] || 0;
          const trendA = trendingScores[a.product._id.toString()] || 0;
          if (trendB !== trendA) return trendB - trendA;
          return (b.product.discountPercent || 0) - (a.product.discountPercent || 0);
        })
        .map(item => {
          item.product.recommendationReason = "Trending Now";
          return item.product;
        });
    } else {
      finalRecommendations = scoredProducts
        .sort((a, b) => b.score - a.score)
        .map(item => item.product);
    }

    return finalRecommendations.slice(0, limit);

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
    const allProducts = await Product.find({});
    const behaviors = await BehaviorLog.find(query);

    const segment = getSegmentFromProfile(profile);

    const affinity = profile ? (profile.categoryAffinity instanceof Map
      ? Object.fromEntries(profile.categoryAffinity)
      : (profile.categoryAffinity || {})) : {};

    const recentlyViewed = profile ? (profile.recentlyViewed || []) : [];

    const clickFreq = profile ? (profile.clickFrequency instanceof Map
      ? Object.fromEntries(profile.clickFrequency)
      : (profile.clickFrequency || {})) : {};

    const searchKeywords = profile ? (profile.searchKeywords || []) : [];

    // Get active standard offers
    const standardOffers = await Offer.find({ active: true });
    
    // Score standard offers
    const scoredOffers = standardOffers.map(offer => {
      let score = 0;
      
      // Base segment match
      if (offer.targetSegment === segment) {
        score += 100;
      } else if (offer.targetSegment === 'all') {
        score += 50;
      }
      
      // Category deduction
      let offerCategory = null;
      if (offer.title.toLowerCase().includes('tech') || offer.description.toLowerCase().includes('electronics')) {
        offerCategory = 'Electronics';
      } else if (offer.title.toLowerCase().includes('style') || offer.title.toLowerCase().includes('fashion') || offer.description.toLowerCase().includes('apparel')) {
        offerCategory = 'Fashion';
      } else if (offer.title.toLowerCase().includes('fit') || offer.description.toLowerCase().includes('gym')) {
        offerCategory = 'Fitness';
      } else if (offer.title.toLowerCase().includes('home') || offer.description.toLowerCase().includes('decor')) {
        offerCategory = 'Home';
      }

      if (offerCategory) {
        // Boost based on category affinity
        score += (affinity[offerCategory] || 0) * 15;
        
        // Boost based on recent views in this category
        if (recentlyViewed.length > 0) {
          const recentMatches = recentlyViewed.filter(id => {
            const prod = allProducts.find(p => p._id.toString() === id);
            return prod && prod.category === offerCategory;
          }).length;
          score += recentMatches * 20;
        }

        // Boost based on search keyword matches
        if (searchKeywords.length > 0) {
          const matchesKeyword = searchKeywords.some(kw => 
            kw.includes(offerCategory.toLowerCase()) || offerCategory.toLowerCase().includes(kw)
          );
          if (matchesKeyword) score += 30;
        }
      }

      // Convert mongoose model to plain object
      const offerObj = typeof offer.toObject === 'function' ? offer.toObject() : JSON.parse(JSON.stringify(offer));
      offerObj.score = score;
      offerObj.personalizationReason = offer.targetSegment === segment 
        ? `Top recommendation for your segment`
        : offerCategory && (affinity[offerCategory] > 0)
          ? `Based on your interest in ${offerCategory}`
          : `Recommended for you`;
          
      return offerObj;
    });

    // Generate Dynamic Offers on the fly
    const dynamicOffers = [];

    // 1. CART RECOVERY TRIGGER
    const cartEvents = behaviors.filter(b => b.eventType === 'cart');
    const purchaseEvents = behaviors.filter(b => b.eventType === 'purchase');
    
    if (cartEvents.length > purchaseEvents.length && cartEvents.length > 0) {
      const lastCartEvent = cartEvents.sort((a, b) => new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt))[0];
      const prodId = lastCartEvent.details.productId;
      const product = allProducts.find(p => p._id.toString() === prodId);
      
      if (product) {
        dynamicOffers.push({
          _id: `dyn_cart_${prodId}`,
          title: "Finish Your Order!",
          description: `We noticed you're considering the "${product.name}". Complete your purchase now and get an extra 10% off!`,
          discountCode: "FINISH10",
          targetSegment: segment,
          bannerImage: product.image,
          active: true,
          isDynamic: true,
          score: 180,
          personalizationReason: "Cart Recovery Voucher"
        });
      }
    }

    // 2. FREQUENT VISITS / INTERACTION TRIGGER
    let topClickedProductId = null;
    let maxClicks = 0;
    for (const [prodId, clicks] of Object.entries(clickFreq)) {
      if (clicks >= 3 && clicks > maxClicks) {
        maxClicks = clicks;
        topClickedProductId = prodId;
      }
    }

    if (topClickedProductId) {
      const product = allProducts.find(p => p._id.toString() === topClickedProductId);
      if (product) {
        dynamicOffers.push({
          _id: `dyn_visit_${topClickedProductId}`,
          title: `Exclusive Price Drop!`,
          description: `You've kept an eye on "${product.name}". Here is an exclusive 15% off coupon just for you!`,
          discountCode: "LOYAL15",
          targetSegment: segment,
          bannerImage: product.image,
          active: true,
          isDynamic: true,
          score: 160,
          personalizationReason: `Frequently Visited (${maxClicks} views)`
        });
      }
    }

    // 3. CATEGORY EXPLORER TRIGGER
    const topAffinityCategory = Object.entries(affinity)
      .sort((a, b) => b[1] - a[1])
      .filter(([cat, weight]) => weight >= 5)[0]?.[0];

    if (topAffinityCategory) {
      const hasPurchasedInCat = purchaseEvents.some(b => b.details.category === topAffinityCategory);
      if (!hasPurchasedInCat) {
        dynamicOffers.push({
          _id: `dyn_explore_${topAffinityCategory}`,
          title: `${topAffinityCategory} Explorer Offer`,
          description: `Ready to dive in? Get 12% off your first purchase in our ${topAffinityCategory} collection today.`,
          discountCode: `EXPLORE${topAffinityCategory.substring(0, 3).toUpperCase()}`,
          targetSegment: segment,
          bannerImage: topAffinityCategory === 'Electronics' 
            ? "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1000&auto=format&fit=crop&q=80"
            : topAffinityCategory === 'Fashion'
              ? "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1000&auto=format&fit=crop&q=80"
              : "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=1000&auto=format&fit=crop&q=80",
          active: true,
          isDynamic: true,
          score: 140,
          personalizationReason: `Personal interest in ${topAffinityCategory}`
        });
      }
    }

    const allOffers = [...dynamicOffers, ...scoredOffers];
    return allOffers.sort((a, b) => b.score - a.score);

  } catch (error) {
    console.error('Error fetching personalized offers:', error);
    return [];
  }
}
