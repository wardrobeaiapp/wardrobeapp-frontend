/**
 * In-memory storage utilities
 */

// Initialize in-memory stores
const initializeInMemoryStores = () => {
  // Create global object stores if they don't exist
  global.inMemoryUsers = global.inMemoryUsers || [];
  global.inMemoryProfiles = global.inMemoryProfiles || [];
  global.inMemoryWardrobeItems = global.inMemoryWardrobeItems || [];
  global.inMemoryOutfits = global.inMemoryOutfits || [];
  global.inMemoryUserPreferences = global.inMemoryUserPreferences || [];

  console.log('In-memory stores initialized');
};

// Mock User model for in-memory operations
const setupMockModels = () => {
  global.User = {
    findOne(query) {
      return Promise.resolve(global.inMemoryUsers.find(user => user.email === query.email));
    },
    findById(id) {
      return Promise.resolve(global.inMemoryUsers.find(user => user.id === id));
    },
    findByIdAndUpdate(id, update, options) {
      const userIndex = global.inMemoryUsers.findIndex(user => user.id === id);
      if (userIndex === -1) return Promise.resolve(null);
      
      const updatedUser = { ...global.inMemoryUsers[userIndex], ...update };
      global.inMemoryUsers[userIndex] = updatedUser;
      
      if (options && options.new) {
        return Promise.resolve(updatedUser);
      }
      
      return Promise.resolve(global.inMemoryUsers[userIndex]);
    }
  };
};

module.exports = {
  initializeInMemoryStores,
  setupMockModels
};
