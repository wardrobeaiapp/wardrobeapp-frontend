const mongoose = require('mongoose');

const wardrobeItemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['TOP', 'BOTTOM', 'DRESS', 'OUTERWEAR', 'SHOES', 'ACCESSORY']
  },
  color: {
    type: String,
    required: true
  },
  season: {
    type: [String],
    enum: ['SPRING', 'SUMMER', 'FALL', 'WINTER', 'ALL_SEASON'],
    default: ['ALL_SEASON']
  },
  imageUrl: {
    type: String
  },
  dateAdded: {
    type: Date,
    default: Date.now
  },
  timesWorn: {
    type: Number,
    default: 0
  },
  lastWorn: {
    type: Date
  },
  wishlist: {
    type: Boolean,
    default: false
  }
});

// Create index for faster queries
wardrobeItemSchema.index({ user: 1 });

const WardrobeItem = mongoose.model('WardrobeItem', wardrobeItemSchema);

module.exports = WardrobeItem;
