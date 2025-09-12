const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  profileCompleted: {
    type: Boolean,
    default: false
  },
  onboardingCompleted: {
    type: Boolean,
    default: false
  },
  preferences: {
    // Daily activities
    dailyActivities: [String],
    officeDressCode: String,
    remoteWorkPriority: String,
    creativeMobility: String,
    
    // Style preferences
    preferredStyles: [String],
    stylePreferences: {
      comfortVsStyle: Number,
      trendiness: Number,
      basicsVsStatements: Number,
      additionalNotes: String
    },
    
    // Local climate
    localClimate: String,
    
    // Leisure activities
    leisureActivities: [String],
    outdoorFrequency: {
      frequency: Number,
      period: String
    },
    socialFrequency: {
      frequency: Number,
      period: String
    },
    formalEventsFrequency: {
      frequency: Number,
      period: String
    },
    travelFrequency: String,
    
    // Wardrobe goals
    wardrobeGoals: [String],
    otherWardrobeGoal: String,
    
    // Shopping limits and budget
    shoppingLimit: {
      frequency: String,
      amount: Number
    },
    clothingBudget: {
      amount: Number,
      currency: String,
      frequency: String
    },
    
    // Scenarios with frequencies
    scenarios: [
      {
        id: String,
        name: String,
        frequency: String
      }
    ],
    
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it's modified or new
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
