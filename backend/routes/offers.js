import express from 'express';
import { getPersonalizedOffers } from '../services/personalisation.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// Get targeted offers
router.get('/', authenticateUser, async (req, res) => {
  const { sessionId } = req.query;
  const userId = req.user ? req.user.id : null;

  if (!sessionId) {
    return res.status(400).json({ message: 'sessionId is required' });
  }

  try {
    const targetedOffers = await getPersonalizedOffers(sessionId, userId);
    res.json(targetedOffers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching targeted offers', error: error.message });
  }
});

export default router;
