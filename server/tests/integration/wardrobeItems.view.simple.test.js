const request = require('supertest');
const express = require('express');

// Mock the authentication middleware globally
jest.mock('../../middleware/auth', () => {
  return (req, res, next) => {
    req.user = { id: '123e4567-e89b-12d3-a456-426614174000' };
    next();
  };
});

// Mock the WardrobeItem model to work with in-memory storage
jest.mock('../../models/WardrobeItem', () => ({
  findById: jest.fn((id) => {
    const item = global.inMemoryWardrobeItems.find(item => item.id === id);
    return Promise.resolve(item || null);
  }),
  findByIdAndUpdate: jest.fn((id, update, options) => {
    const itemIndex = global.inMemoryWardrobeItems.findIndex(item => item.id === id);
    if (itemIndex === -1) return Promise.resolve(null);
    
    global.inMemoryWardrobeItems[itemIndex] = {
      ...global.inMemoryWardrobeItems[itemIndex],
      ...update.$set || update
    };
    return Promise.resolve(global.inMemoryWardrobeItems[itemIndex]);
  })
}));

// Import the actual route after mocking
const wardrobeItemsRouter = require('../../routes/wardrobeItems');

// Create a test app
const createTestApp = () => {
  const app = express();
  
  // Middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  // Routes
  app.use('/api/wardrobe-items', wardrobeItemsRouter);
  
  return app;
};

describe('Wardrobe Items View API - Integration Tests', () => {
  let app;

  beforeEach(() => {
    // Setup fresh test environment (using MongoDB = true to trigger the GET endpoint)
    global.usingMongoDB = true;
    global.inMemoryWardrobeItems = [];
    jest.clearAllMocks();
    
    // Create fresh app instance
    app = createTestApp();
  });

  describe('GET /api/wardrobe-items/:id - View Single Item', () => {
    it('should return a specific wardrobe item for the authenticated user', async () => {
      // Add test item to storage
      const testItem = {
        id: 'test-item-123',
        name: 'Test View Item',
        category: 'top',
        color: 'blue',
        brand: 'Test Brand',
        user: '123e4567-e89b-12d3-a456-426614174000',
        dateAdded: new Date(),
        season: ['summer']
      };
      
      global.inMemoryWardrobeItems = [testItem];

      const response = await request(app)
        .get('/api/wardrobe-items/test-item-123');

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Test View Item');
      expect(response.body.category).toBe('top');
      expect(response.body.color).toBe('blue');
      expect(response.body.brand).toBe('Test Brand');
      expect(response.body.id).toBe('test-item-123');
    });

    it('should return 404 for non-existent item', async () => {
      const response = await request(app)
        .get('/api/wardrobe-items/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Item not found');
    });

    it('should return 401 when trying to view another user\'s item', async () => {
      // Add item belonging to different user
      const otherUserItem = {
        id: 'other-user-item',
        name: 'Other User Item',
        category: 'top',
        color: 'red',
        user: 'other-user-456', // Different user
        dateAdded: new Date()
      };
      
      global.inMemoryWardrobeItems = [otherUserItem];

      const response = await request(app)
        .get('/api/wardrobe-items/other-user-item');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Not authorized');
    });

    it('should return complete item data with all fields', async () => {
      const fullItem = {
        id: 'full-item-123',
        name: 'Complete Item',
        category: 'dress',
        subcategory: 'casual-dress',
        color: 'navy blue',
        pattern: 'solid',
        size: 'M',
        material: '100% Cotton',
        brand: 'Premium Brand',
        price: 89.99,
        silhouette: 'A-line',
        length: 'knee-length',
        sleeves: 'short',
        style: 'casual',
        neckline: 'round',
        season: ['spring/fall', 'summer'],
        imageUrl: 'https://example.com/image.jpg',
        user: '123e4567-e89b-12d3-a456-426614174000',
        dateAdded: new Date(),
        wishlist: false,
        tags: { occasion: 'casual', formality: 'relaxed' }
      };
      
      global.inMemoryWardrobeItems = [fullItem];

      const response = await request(app)
        .get('/api/wardrobe-items/full-item-123');

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Complete Item');
      expect(response.body.subcategory).toBe('casual-dress');
      expect(response.body.price).toBe(89.99);
      expect(response.body.material).toBe('100% Cotton');
      expect(response.body.season).toEqual(['spring/fall', 'summer']);
      expect(response.body.tags).toEqual({ occasion: 'casual', formality: 'relaxed' });
    });
  });

  describe('User Access Control', () => {
    it('should enforce strict user isolation', async () => {
      // Add items for multiple users
      const items = [
        { id: 'user123-item1', name: 'User 123 Item 1', user: '123e4567-e89b-12d3-a456-426614174000', category: 'top', color: 'blue', dateAdded: new Date() },
        { id: 'user123-item2', name: 'User 123 Item 2', user: '123e4567-e89b-12d3-a456-426614174000', category: 'bottom', color: 'red', dateAdded: new Date() },
        { id: 'user456-item1', name: 'User 456 Item 1', user: 'other-user-456', category: 'top', color: 'green', dateAdded: new Date() },
        { id: 'user789-item1', name: 'User 789 Item 1', user: 'another-user-789', category: 'footwear', color: 'black', dateAdded: new Date() }
      ];
      
      global.inMemoryWardrobeItems = items;

      // Test access to own items vs others' items
      const responses = await Promise.all([
        request(app).get('/api/wardrobe-items/user123-item1'), // ✅ Should succeed - own item
        request(app).get('/api/wardrobe-items/user123-item2'), // ✅ Should succeed - own item  
        request(app).get('/api/wardrobe-items/user456-item1'), // ❌ Should fail - other's item
        request(app).get('/api/wardrobe-items/user789-item1'), // ❌ Should fail - other's item
      ]);

      expect(responses[0].status).toBe(200);
      expect(responses[0].body.name).toBe('User 123 Item 1');
      
      expect(responses[1].status).toBe(200);
      expect(responses[1].body.name).toBe('User 123 Item 2');
      
      expect(responses[2].status).toBe(401);
      expect(responses[2].body.message).toBe('Not authorized');
      
      expect(responses[3].status).toBe(401);
      expect(responses[3].body.message).toBe('Not authorized');
    });
  });

  describe('View Item Performance', () => {
    it('should handle viewing items from large collections efficiently', async () => {
      // Create a large collection of items
      const items = Array(100).fill().map((_, index) => ({
        id: `item-${index}`,
        name: `Item ${index}`,
        category: index % 2 === 0 ? 'top' : 'bottom',
        color: ['blue', 'red', 'green', 'black'][index % 4],
        user: index % 3 === 0 ? 'other-user' : '123e4567-e89b-12d3-a456-426614174000', // Mix of users
        dateAdded: new Date(Date.now() + index * 1000),
        brand: `Brand ${index % 10}`
      }));
      
      global.inMemoryWardrobeItems = items;

      // Test viewing a specific item from the large collection
      const startTime = Date.now();
      const response = await request(app)
        .get('/api/wardrobe-items/item-50');
      const endTime = Date.now();

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Item 50');
      expect(endTime - startTime).toBeLessThan(100); // Should be very fast
    });

    it('should handle concurrent view requests efficiently', async () => {
      // Add test items
      const items = [
        { id: 'concurrent-1', name: 'Concurrent Item 1', user: '123e4567-e89b-12d3-a456-426614174000', category: 'top', color: 'blue', dateAdded: new Date() },
        { id: 'concurrent-2', name: 'Concurrent Item 2', user: '123e4567-e89b-12d3-a456-426614174000', category: 'bottom', color: 'red', dateAdded: new Date() },
        { id: 'concurrent-3', name: 'Concurrent Item 3', user: '123e4567-e89b-12d3-a456-426614174000', category: 'footwear', color: 'black', dateAdded: new Date() }
      ];
      
      global.inMemoryWardrobeItems = items;

      // Send multiple concurrent requests
      const promises = [
        request(app).get('/api/wardrobe-items/concurrent-1'),
        request(app).get('/api/wardrobe-items/concurrent-2'),
        request(app).get('/api/wardrobe-items/concurrent-3'),
        request(app).get('/api/wardrobe-items/concurrent-1'), // Same item again
        request(app).get('/api/wardrobe-items/concurrent-2')  // Same item again
      ];

      const responses = await Promise.all(promises);

      // All should succeed and return correct data
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.user).toBe('123e4567-e89b-12d3-a456-426614174000');
        expect(response.body.name).toMatch(/^Concurrent Item \d$/);
      });

      // Verify specific responses
      expect(responses[0].body.name).toBe('Concurrent Item 1');
      expect(responses[1].body.name).toBe('Concurrent Item 2');
      expect(responses[2].body.name).toBe('Concurrent Item 3');
      expect(responses[3].body.name).toBe('Concurrent Item 1'); // Duplicate request
      expect(responses[4].body.name).toBe('Concurrent Item 2'); // Duplicate request
    });
  });

  describe('Data Consistency in Views', () => {
    it('should return consistent data when item is viewed after creation', async () => {
      // First create an item using the POST endpoint
      const createData = {
        name: 'Consistency Test Item',
        category: 'top',
        color: 'purple',
        brand: 'Consistency Brand',
        size: 'L',
        material: 'Cotton blend'
      };

      // Set to in-memory mode for creation
      global.usingMongoDB = false;
      const createResponse = await request(app)
        .post('/api/wardrobe-items')
        .send(createData);

      expect(createResponse.status).toBe(201);
      const createdItemId = createResponse.body.id;

      // Add the created item to our mock storage (simulating database persistence)
      const createdItem = {
        ...createResponse.body,
        id: createdItemId
      };
      global.inMemoryWardrobeItems = [createdItem];

      // Switch back to MongoDB mode for viewing
      global.usingMongoDB = true;

      // Now view the item
      const viewResponse = await request(app)
        .get(`/api/wardrobe-items/${createdItemId}`);

      expect(viewResponse.status).toBe(200);
      expect(viewResponse.body.name).toBe('Consistency Test Item');
      expect(viewResponse.body.category).toBe('top');
      expect(viewResponse.body.color).toBe('purple');
      expect(viewResponse.body.brand).toBe('Consistency Brand');
      expect(viewResponse.body.size).toBe('L');
      expect(viewResponse.body.material).toBe('Cotton blend');
      expect(viewResponse.body.user).toBe('123e4567-e89b-12d3-a456-426614174000');
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed item IDs gracefully', async () => {
      // Test with various invalid ID formats
      // Note: Empty string is excluded as it would route to /api/wardrobe-items/ (list endpoint)
      const invalidIds = [
        'invalid-id-format',
        '12345', // too short
        'a'.repeat(100), // too long
        'special-chars-!@#$%',
        'null', // This would be in URL as 'null'
        'undefined' // This would be in URL as 'undefined'
      ];

      for (const invalidId of invalidIds) {
        const response = await request(app)
          .get(`/api/wardrobe-items/${invalidId}`);

        // Should return 404 for all invalid IDs  
        if (response.status !== 404) {
          console.log(`❌ ID "${invalidId}" returned ${response.status} instead of 404`);
          console.log('Response body:', response.body);
          console.log('Response text:', response.text);
        }
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Item not found');
      }
    });

    // Note: Database error test removed since we cleaned up MongoDB legacy code
  });

  describe('Item Data Integrity', () => {
    it('should preserve all item properties when viewing', async () => {
      const complexItem = {
        id: 'complex-item-123',
        name: 'Complex Test Item',
        category: 'dress',
        subcategory: 'maxi-dress',
        color: 'burgundy',
        pattern: 'floral',
        size: 'M',
        material: '100% Silk',
        brand: 'Premium Designer',
        price: 299.99,
        silhouette: 'A-line',
        length: 'ankle-length',
        sleeves: 'long',
        style: 'boho',
        neckline: 'v-neck',
        season: ['spring/fall'],
        imageUrl: 'https://example.com/complex-dress.jpg',
        imageExpiry: '2024-12-31T23:59:59.000Z',
        user: '123e4567-e89b-12d3-a456-426614174000',
        dateAdded: '2024-01-15T10:30:00.000Z',
        wishlist: true,
        wishlistStatus: 'approved',
        tags: {
          occasion: ['formal', 'date-night'],
          formality: 'dressy',
          season_tags: ['spring', 'fall'],
          care: 'dry-clean-only',
          fit: 'regular'
        }
      };
      
      global.inMemoryWardrobeItems = [complexItem];

      const response = await request(app)
        .get('/api/wardrobe-items/complex-item-123');

      expect(response.status).toBe(200);
      
      // Verify all properties are preserved
      expect(response.body.name).toBe('Complex Test Item');
      expect(response.body.subcategory).toBe('maxi-dress');
      expect(response.body.price).toBe(299.99);
      expect(response.body.pattern).toBe('floral');
      expect(response.body.silhouette).toBe('A-line');
      expect(response.body.wishlist).toBe(true);
      expect(response.body.wishlistStatus).toBe('approved');
      expect(response.body.tags).toEqual({
        occasion: ['formal', 'date-night'],
        formality: 'dressy', 
        season_tags: ['spring', 'fall'],
        care: 'dry-clean-only',
        fit: 'regular'
      });
    });
  });
});
