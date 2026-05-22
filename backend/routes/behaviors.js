import express from 'express';
import { logEvent, getSegmentFromProfile } from '../services/personalisation.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// Log behavioral event
router.post('/log', authenticateUser, async (req, res) => {
  const { sessionId, eventType, details } = req.body;
  const userId = req.user ? req.user.id : null;

  if (!sessionId || !eventType) {
    return res.status(400).json({ message: 'sessionId and eventType are required' });
  }

  try {
    const profile = await logEvent(sessionId, userId, eventType, details);
    const segment = getSegmentFromProfile(profile);

    res.json({
      success: true,
      message: 'Event logged successfully',
      segment,
      affinity: profile ? (profile.categoryAffinity instanceof Map ? Object.fromEntries(profile.categoryAffinity) : profile.categoryAffinity) : {}
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging behavior event', error: error.message });
  }
});

export default router;
