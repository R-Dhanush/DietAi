const express = require('express');
const auth = require('../middleware/auth');
const { calculateCurrentStreak } = require('../services/streakService');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const streak = await calculateCurrentStreak(req.userId);
    res.json({ streak });
  } catch (error) {
    res.status(500).json({ message: 'Error calculating streak' });
  }
});

module.exports = router;