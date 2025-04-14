const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();

// Get user goals
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.json(user.goals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching goals' });
  }
});

// Update goal progress
router.put('/:id', auth, async (req, res) => {
  try {
    const { currentValue } = req.body;
    const user = await User.findOneAndUpdate(
      { 
        _id: req.userId,
        'goals._id': req.params.id 
      },
      { 
        $set: { 
          'goals.$.currentValue': currentValue 
        } 
      },
      { new: true }
    );
    res.json(user.goals.id(req.params.id));
  } catch (error) {
    res.status(400).json({ message: 'Error updating goal' });
  }
});

module.exports = router;