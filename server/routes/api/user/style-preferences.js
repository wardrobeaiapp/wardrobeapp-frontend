const express = require('express');
const router = express.Router();
const auth = require('../../../middleware/auth');

// @route   GET /api/user/style-preferences
// @desc    Get user style preferences
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Find user preferences
    const userPreferences = global.inMemoryUserPreferences.find(
      pref => pref.userId === req.user.id
    );

    if (!userPreferences) {
      return res.json({
        preferred_styles: [],
        comfort_vs_style: 50,
        basics_vs_statements: 50,
        style_additional_notes: ''
      });
    }

    res.json(userPreferences);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/user/style-preferences
// @desc    Update user style preferences
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { preferred_styles, comfort_vs_style, basics_vs_statements, style_additional_notes } = req.body;
    
    // Create preference object
    const updatedPreferences = {
      userId: req.user.id,
      preferred_styles: preferred_styles || [],
      comfort_vs_style: comfort_vs_style || 50,
      basics_vs_statements: basics_vs_statements || 50,
      style_additional_notes: style_additional_notes || ''
    };

    // Find existing preference index
    const prefIndex = global.inMemoryUserPreferences.findIndex(
      pref => pref.userId === req.user.id
    );

    if (prefIndex === -1) {
      // Create new preferences
      global.inMemoryUserPreferences.push(updatedPreferences);
    } else {
      // Update existing preferences
      global.inMemoryUserPreferences[prefIndex] = updatedPreferences;
    }
    
    console.log('User style preferences updated for user:', req.user.id);
    res.json(updatedPreferences);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
