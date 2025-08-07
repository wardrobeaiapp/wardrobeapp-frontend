const mongoose = require('mongoose');

const outfitSchema = new mongoose.Schema({
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
  items: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WardrobeItem',
    required: true
  }],
  occasion: {
    type: String,
    trim: true
  },
  season: {
    type: [String],
    enum: ['SPRING', 'SUMMER', 'FALL', 'WINTER', 'ALL_SEASON'],
    default: ['ALL_SEASON']
  },
  favorite: {
    type: Boolean,
    default: false
  },
  tags: {
    type: [String],
    default: []
  },
  notes: {
    type: String
  },
  imageUrl: {
    type: String
  },
  dateCreated: {
    type: Date,
    default: Date.now
  },
  lastWorn: {
    type: Date
  },
  timesWorn: {
    type: Number,
    default: 0
  }
});

// Create index for faster queries
outfitSchema.index({ user: 1 });

const Outfit = mongoose.model('Outfit', outfitSchema);

module.exports = Outfit;
