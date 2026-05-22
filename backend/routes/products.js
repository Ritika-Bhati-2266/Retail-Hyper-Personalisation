import express from 'express';
import { Product } from '../models/product.js';
import { getRecommendations } from '../services/personalisation.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// List all products (with optional category filter)
router.get('/', async (req, res) => {
  const { category } = req.query;
  try {
    const filter = category ? { category } : {};
    const products = await Product.find(filter);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving products', error: error.message });
  }
});

// Search products by name, description, tags, or category
router.get('/search', async (req, res) => {
  const { q } = req.query;
  try {
    if (!q) {
      const products = await Product.find({});
      return res.json(products);
    }

    const query = q.toString().toLowerCase().trim();
    const allProducts = await Product.find({});
    
    // Perform manual filtering for compatibility with both MongoDB regex queries and Mock JSON data
    const matchedProducts = allProducts.filter(product => {
      const nameMatch = product.name?.toLowerCase().includes(query);
      const descMatch = product.description?.toLowerCase().includes(query);
      const categoryMatch = product.category?.toLowerCase().includes(query);
      const tagMatch = product.tags?.some(tag => tag.toLowerCase().includes(query));
      return nameMatch || descMatch || categoryMatch || tagMatch;
    });

    res.json(matchedProducts);
  } catch (error) {
    res.status(500).json({ message: 'Error searching products', error: error.message });
  }
});

// Get personalized recommendations
router.get('/recommendations', authenticateUser, async (req, res) => {
  const { sessionId } = req.query;
  const userId = req.user ? req.user.id : null;

  if (!sessionId) {
    return res.status(400).json({ message: 'sessionId query parameter is required' });
  }

  try {
    const recommendations = await getRecommendations(sessionId, userId, 8);
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recommendations', error: error.message });
  }
});

// Get single product details
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
});

export default router;
