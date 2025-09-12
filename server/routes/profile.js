const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   GET /api/profile
// @desc    Get user profile data
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      profileCompleted: user.profileCompleted,
      onboardingCompleted: user.onboardingCompleted,
      preferences: user.preferences || {}
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/profile
// @desc    Update user profile data
// @access  Private
router.put('/', auth, async (req, res) => {
  try {
    const { name, preferences } = req.body;
    
    // Build profile object
    const profileFields = {};
    if (name) profileFields.name = name;
    
    // If preferences are provided, update them
    if (preferences) {
      profileFields.preferences = preferences;
      profileFields.profileCompleted = true;
    }
    
    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: profileFields },
      { new: true }
    ).select('-password');
    
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      profileCompleted: user.profileCompleted,
      onboardingCompleted: user.onboardingCompleted,
      preferences: user.preferences || {}
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/profile/onboarding
// @desc    Complete onboarding process
// @access  Private
router.put('/onboarding', auth, async (req, res) => {
  try {
    const { preferences } = req.body;
    
    // Build profile object
    const profileFields = {
      onboardingCompleted: true
    };
    
    // If preferences are provided, update them
    if (preferences) {
      profileFields.preferences = preferences;
      profileFields.profileCompleted = true;
    }
    
    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: profileFields },
      { new: true }
    ).select('-password');
    
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      profileCompleted: user.profileCompleted,
      onboardingCompleted: user.onboardingCompleted,
      preferences: user.preferences || {}
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/profile/style
// @desc    Update style profile data
// @access  Private
router.put('/style', auth, async (req, res) => {
  try {
    const { styleProfile } = req.body;
    
    // Get current user
    let user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update style profile fields
    const preferences = user.preferences || {};
    
    // Update each field from styleProfile
    if (styleProfile.dailyActivities) preferences.dailyActivities = styleProfile.dailyActivities;
    if (styleProfile.officeDressCode) preferences.officeDressCode = styleProfile.officeDressCode;
    if (styleProfile.remoteWorkPriority) preferences.remoteWorkPriority = styleProfile.remoteWorkPriority;
    if (styleProfile.creativeMobility) preferences.creativeMobility = styleProfile.creativeMobility;
    if (styleProfile.preferredStyles) preferences.preferredStyles = styleProfile.preferredStyles;
    if (styleProfile.stylePreferences) preferences.stylePreferences = styleProfile.stylePreferences;
    if (styleProfile.localClimate) preferences.localClimate = styleProfile.localClimate;
    if (styleProfile.leisureActivities) preferences.leisureActivities = styleProfile.leisureActivities;
    if (styleProfile.outdoorFrequency) preferences.outdoorFrequency = styleProfile.outdoorFrequency;
    if (styleProfile.socialFrequency) preferences.socialFrequency = styleProfile.socialFrequency;
    if (styleProfile.formalEventsFrequency) preferences.formalEventsFrequency = styleProfile.formalEventsFrequency;
    if (styleProfile.travelFrequency) preferences.travelFrequency = styleProfile.travelFrequency;
    if (styleProfile.wardrobeGoals) preferences.wardrobeGoals = styleProfile.wardrobeGoals;
    if (styleProfile.otherWardrobeGoal) preferences.otherWardrobeGoal = styleProfile.otherWardrobeGoal;
    
    // Update user
    user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        $set: { 
          preferences,
          profileCompleted: true
        } 
      },
      { new: true }
    ).select('-password');
    
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      profileCompleted: user.profileCompleted,
      onboardingCompleted: user.onboardingCompleted,
      preferences: user.preferences || {}
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/profile/budget
// @desc    Update budget settings
// @access  Private
router.put('/budget', auth, async (req, res) => {
  try {
    const { shoppingLimit, clothingBudget } = req.body;
    
    // Get current user
    let user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update budget fields
    const preferences = user.preferences || {};
    
    if (shoppingLimit) preferences.shoppingLimit = shoppingLimit;
    if (clothingBudget) preferences.clothingBudget = clothingBudget;
    
    // Update user
    user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { preferences } },
      { new: true }
    ).select('-password');
    
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      profileCompleted: user.profileCompleted,
      onboardingCompleted: user.onboardingCompleted,
      preferences: user.preferences || {}
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/profile/scenarios
// @desc    Update user scenarios
// @access  Private
router.put('/scenarios', auth, async (req, res) => {
  try {
    const { scenarios } = req.body;
    
    if (!scenarios || !Array.isArray(scenarios)) {
      return res.status(400).json({ message: 'Scenarios data is required and must be an array' });
    }
    
    // Get current user
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Initialize preferences if it doesn't exist
    if (!user.preferences) {
      user.preferences = {};
    }
    
    // Update scenarios
    user.preferences.scenarios = scenarios;
    
    // Save user
    await user.save();
    
    res.json({
      message: 'Scenarios updated successfully',
      scenarios: user.preferences.scenarios
    });
  } catch (err) {
    console.error('Error updating scenarios:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
