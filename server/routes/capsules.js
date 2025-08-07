const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Capsule = require('../models/Capsule');
const { check, validationResult } = require('express-validator');

// @route   GET api/capsules
// @desc    Get all user's capsules
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const capsules = await Capsule.find({ user: req.user.id }).sort({ dateCreated: -1 });
    res.json(capsules);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/capsules
// @desc    Create a capsule
// @access  Private
router.post('/', [
  auth,
  [
    check('name', 'Name is required').not().isEmpty(),
    check('selectedItems', 'At least one item is required').isArray({ min: 1 })
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, description, scenario, seasons, style, selectedItems } = req.body;

    const newCapsule = new Capsule({
      name,
      description,
      scenario,
      seasons,
      style,
      selectedItems,
      user: req.user.id
    });

    const capsule = await newCapsule.save();
    res.json(capsule);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/capsules/:id
// @desc    Update a capsule
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    let capsule = await Capsule.findById(req.params.id);

    if (!capsule) {
      return res.status(404).json({ msg: 'Capsule not found' });
    }

    // Make sure user owns the capsule
    if (capsule.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const { name, description, scenario, seasons, style, selectedItems } = req.body;

    // Build capsule object
    const capsuleFields = {};
    if (name) capsuleFields.name = name;
    if (description !== undefined) capsuleFields.description = description;
    if (scenario !== undefined) capsuleFields.scenario = scenario;
    if (seasons) capsuleFields.seasons = seasons;
    if (style !== undefined) capsuleFields.style = style;
    if (selectedItems) capsuleFields.selectedItems = selectedItems;

    capsule = await Capsule.findByIdAndUpdate(
      req.params.id,
      { $set: capsuleFields },
      { new: true }
    );

    res.json(capsule);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/capsules/:id
// @desc    Delete a capsule
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    let capsule = await Capsule.findById(req.params.id);

    if (!capsule) {
      return res.status(404).json({ msg: 'Capsule not found' });
    }

    // Make sure user owns the capsule
    if (capsule.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await Capsule.findByIdAndRemove(req.params.id);

    res.json({ msg: 'Capsule removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
