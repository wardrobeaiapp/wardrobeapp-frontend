const mongoose = require('mongoose');

const capsuleSchema = new mongoose.Schema({
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
  description: {
    type: String,
    trim: true
  },
  scenario: {
    type: String,
    trim: true
  },
  seasons: {
    type: [String],
    enum: ['SPRING', 'SUMMER', 'FALL', 'WINTER', 'ALL_SEASON'],
    default: ['ALL_SEASON']
  },
  style: {
    type: String,
    trim: true
  },
  selectedItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WardrobeItem',
    required: true
  }],
  dateCreated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Virtual for formatted date
capsuleSchema.virtual('dateCreatedFormatted').get(function() {
  return this.dateCreated ? this.dateCreated.toISOString() : '';
});

// Set toJSON option to include virtuals
capsuleSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const Capsule = mongoose.model('Capsule', capsuleSchema);

module.exports = Capsule;
