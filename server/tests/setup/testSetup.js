// Global test setup for both unit and integration tests

// Mock console methods to reduce test output noise (optional)
const originalConsole = global.console;

// Mock file system operations for tests
jest.mock('fs', () => ({
  existsSync: jest.fn(() => true),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
  readFileSync: jest.fn(() => Buffer.from('fake-file-content')),
  unlinkSync: jest.fn()
}));

// Mock path operations
jest.mock('path', () => ({
  ...jest.requireActual('path'),
  join: jest.fn((...args) => args.join('/')),
  extname: jest.fn((filename) => {
    const parts = filename.split('.');
    return parts.length > 1 ? '.' + parts[parts.length - 1] : '';
  })
}));

// Global test utilities
global.testUtils = {
  // Create a mock user for tests
  createMockUser: (id = 'test-user-123') => ({
    id,
    email: `${id}@test.com`,
    name: `Test User ${id}`
  }),

  // Create mock wardrobe item
  createMockWardrobeItem: (overrides = {}) => ({
    id: `item-${Date.now()}`,
    name: 'Test Item',
    category: 'top',
    color: 'blue',
    user: 'test-user-123',
    dateAdded: new Date(),
    season: ['summer'],
    wishlist: false,
    ...overrides
  }),

  // Create mock request object
  createMockRequest: (overrides = {}) => ({
    user: global.testUtils.createMockUser(),
    body: {},
    params: {},
    query: {},
    file: null,
    ...overrides
  }),

  // Create mock response object
  createMockResponse: () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
  },

  // Wait for async operations in tests
  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // Generate unique test data
  generateUniqueId: () => `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,

  // Clean up test data
  cleanup: () => {
    if (global.inMemoryWardrobeItems) {
      global.inMemoryWardrobeItems.length = 0;
    }
    if (global.inMemoryUsers) {
      global.inMemoryUsers.length = 0;
    }
  }
};

// Set up test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';

// Initialize global test state
beforeEach(() => {
  // Reset global state for each test
  global.usingMongoDB = false;
  global.inMemoryWardrobeItems = [];
  global.inMemoryUsers = [];
  
  // Clear all mocks
  jest.clearAllMocks();
});

afterEach(() => {
  // Clean up after each test
  global.testUtils.cleanup();
});

// Handle unhandled promise rejections in tests
process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process in tests, but log the error
});

console.log('Test setup completed: Environment configured for testing');
