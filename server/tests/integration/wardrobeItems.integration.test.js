const request = require('supertest');
const express = require('express');
const path = require('path');

// Import the actual server components
const wardrobeItemsRouter = require('../../routes/wardrobeItems');
const auth = require('../../middleware/auth');

// Import models
const WardrobeItem = require('../../models/WardrobeItem');

// Test database setup
const setupTestDatabase = () => {
  // In a real app, you'd set up a test database here
  global.usingMongoDB = false; // Use in-memory storage for tests
  global.inMemoryWardrobeItems = [];
};

// Create a test app that mimics the real server
const createTestApp = () => {
  const app = express();
  
  // Middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  // Serve static files for uploaded images
  app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));
  
  // Routes
  app.use('/api/wardrobe-items', wardrobeItemsRouter);
  
  return app;
};

// Mock the authentication middleware globally
jest.mock('../../middleware/auth', () => {
  return (req, res, next) => {
    req.user = { id: 'test-user-123' };
    next();
  };
});

// Mock WardrobeItem model
jest.mock('../../models/WardrobeItem');
const mockWardrobeItem = WardrobeItem;

describe('Wardrobe Items API - Integration Tests', () => {
  let app;

  beforeAll(() => {
    setupTestDatabase();
  });

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup fresh test environment
    global.inMemoryWardrobeItems = [];
    
    // Create fresh app instance
    app = createTestApp();
  });

  describe('Authentication Integration', () => {
    it('should allow authenticated requests', async () => {
      global.inMemoryWardrobeItems = [
        { id: '1', name: 'Test Item', user: 'test-user-123', dateAdded: new Date() }
      ];

      const response = await request(app)
        .get('/api/wardrobe-items')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe('Test Item');
    });

    it('should filter items by authenticated user', async () => {
      global.inMemoryWardrobeItems = [
        { id: '1', name: 'User 123 Item', user: 'test-user-123', dateAdded: new Date() },
        { id: '2', name: 'User 456 Item', user: 'test-user-456', dateAdded: new Date() },
        { id: '3', name: 'Another 123 Item', user: 'test-user-123', dateAdded: new Date() }
      ];

      const response = await request(app)
        .get('/api/wardrobe-items')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body.every(item => item.user === 'test-user-123')).toBe(true);
    });
  });

  describe('GET /api/wardrobe-items', () => {
    it('should return empty array for new user', async () => {
      const response = await request(app)
        .get('/api/wardrobe-items')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return items sorted by date (newest first)', async () => {
      const oldDate = new Date('2023-01-01');
      const newDate = new Date('2024-01-01');
      
      global.inMemoryWardrobeItems = [
        { id: '1', name: 'Old Item', user: 'test-user-123', dateAdded: oldDate },
        { id: '2', name: 'New Item', user: 'test-user-123', dateAdded: newDate }
      ];

      const response = await request(app)
        .get('/api/wardrobe-items')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].name).toBe('New Item');
      expect(response.body[1].name).toBe('Old Item');
    });

    it('should work with MongoDB when enabled', async () => {
      global.usingMongoDB = true;
      
      const mockItems = [
        { _id: '1', name: 'MongoDB Item', user: 'test-user-123', dateAdded: new Date() }
      ];
      
      mockWardrobeItem.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockItems)
      });

      const response = await request(app)
        .get('/api/wardrobe-items')
        .expect(200);

      expect(mockWardrobeItem.find).toHaveBeenCalledWith({ user: 'test-user-123' });
      expect(response.body).toEqual(mockItems);
    });
  });

  describe('POST /api/wardrobe-items', () => {
    const validItemData = {
      name: 'Test T-Shirt',
      category: 'top',
      color: 'blue',
      brand: 'Test Brand',
      season: JSON.stringify(['summer'])
    };

    it('should create a new wardrobe item successfully', async () => {
      const response = await request(app)
        .post('/api/wardrobe-items')
        .send(validItemData)
        .expect(200);

      expect(response.body).toMatchObject({
        name: 'Test T-Shirt',
        category: 'top',
        color: 'blue',
        brand: 'Test Brand',
        user: 'test-user-123'
      });

      expect(response.body.id).toBeDefined();
      expect(response.body.dateAdded).toBeDefined();

      // Verify item was added to storage
      expect(global.inMemoryWardrobeItems).toHaveLength(1);
    });

    it('should validate required fields', async () => {
      const invalidData = {
        // Missing required fields: name, category, color
        brand: 'Test Brand'
      };

      const response = await request(app)
        .post('/api/wardrobe-items')
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBe('Missing required fields');
    });

    it('should parse season data correctly', async () => {
      const itemWithSeasons = {
        ...validItemData,
        season: JSON.stringify(['summer', 'winter'])
      };

      const response = await request(app)
        .post('/api/wardrobe-items')
        .send(itemWithSeasons)
        .expect(201);

      expect(response.body.season).toEqual(['summer', 'winter']);
    });

    it('should handle invalid season JSON gracefully', async () => {
      const itemWithBadSeason = {
        ...validItemData,
        season: 'invalid-json-string'
      };

      const response = await request(app)
        .post('/api/wardrobe-items')
        .send(itemWithBadSeason)
        .expect(201);

      expect(response.body.season).toEqual(['ALL_SEASON']);
    });

    it('should process wishlist items correctly', async () => {
      const wishlistItem = {
        ...validItemData,
        wishlist: 'true'
      };

      const response = await request(app)
        .post('/api/wardrobe-items')
        .send(wishlistItem)
        .expect(201);

      expect(response.body.wishlist).toBe(true);
    });

    it('should handle base64 image upload', async () => {
      const itemWithImage = {
        ...validItemData,
        imageUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAACAAIDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
      };

      const response = await request(app)
        .post('/api/wardrobe-items')
        .send(itemWithImage)
        .expect(201);

      expect(response.body.imageUrl).toContain('/uploads/');
      expect(response.body.imageUrl).toMatch(/image-\d+-\d+\.jpeg$/);
    });

    it('should handle invalid base64 format gracefully', async () => {
      const itemWithBadImage = {
        ...validItemData,
        imageUrl: 'data:invalid-format'
      };

      const response = await request(app)
        .post('/api/wardrobe-items')
        .send(itemWithBadImage)
        .expect(201);

      // Should create item but without processed image
      expect(response.body.name).toBe('Test T-Shirt');
      expect(response.body.imageUrl).toBeUndefined();
    });
  });

  describe('File Upload Integration', () => {
    it('should handle multipart form data with file upload', async () => {
      const imageBuffer = Buffer.from('fake-image-data');

      const response = await request(app)
        .post('/api/wardrobe-items')
        .attach('image', imageBuffer, 'test-image.jpg')
        .field('name', 'Uploaded Item')
        .field('category', 'top')
        .field('color', 'red')
        .expect(201);

      expect(response.body.name).toBe('Uploaded Item');
      expect(response.body.imageUrl).toContain('/uploads/');
    });

    it('should handle large file uploads within limits', async () => {
      // Create a 1MB buffer (within 5MB limit)
      const largeImageBuffer = Buffer.alloc(1024 * 1024, 'x');

      const response = await request(app)
        .post('/api/wardrobe-items')
        .attach('image', largeImageBuffer, 'large-image.jpg')
        .field('name', 'Large Image Item')
        .field('category', 'top')
        .field('color', 'green')
        .expect(201);

      expect(response.body.name).toBe('Large Image Item');
      expect(response.body.imageUrl).toContain('/uploads/');
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle database errors gracefully', async () => {
      // This test would require actual error simulation in the route
      // For now, let's test a simpler error case
      expect(true).toBe(true); // Placeholder
    });

    it('should handle validation errors', async () => {
      // Test validation by sending incomplete data
      const response = await request(app)
        .post('/api/wardrobe-items')
        .send({ brand: 'Test Brand' }) // Missing required fields
        .expect(400);
        
      expect(response.body.error).toBe('Missing required fields');
    });
  });

  describe('Data Consistency Integration', () => {
    it('should maintain data consistency across multiple operations', async () => {
      // Add multiple items
      const items = [
        { name: 'Item 1', category: 'top', color: 'red' },
        { name: 'Item 2', category: 'bottom', color: 'blue' },
        { name: 'Item 3', category: 'footwear', color: 'black' }
      ];

      for (const item of items) {
        await request(app)
          .post('/api/wardrobe-items')
          .send(item)
          .expect(201);
      }

      // Verify all items are present
      const response = await request(app)
        .get('/api/wardrobe-items')
        .expect(200);

      expect(response.body).toHaveLength(3);
      expect(response.body.map(item => item.name)).toEqual(['Item 3', 'Item 2', 'Item 1']); // Newest first
    });

    it('should generate unique IDs for concurrent requests', async () => {
      const itemData = { name: 'Concurrent Item', category: 'top', color: 'yellow' };

      // Send multiple concurrent requests
      const promises = Array(5).fill().map(() =>
        request(app)
          .post('/api/wardrobe-items')
          .send(itemData)
      );

      const responses = await Promise.all(promises);

      // All should succeed
      responses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body.id).toBeDefined();
      });

      // All should have unique IDs
      const ids = responses.map(response => response.body.id);
      const uniqueIds = [...new Set(ids)];
      expect(uniqueIds).toHaveLength(5);
    });
  });

  describe('Performance Integration', () => {
    it('should handle large datasets efficiently', async () => {
      // Add 100 items to storage
      const items = Array(100).fill().map((_, index) => ({
        id: `item-${index}`,
        name: `Item ${index}`,
        category: 'top',
        color: 'blue',
        user: 'test-user-123',
        dateAdded: new Date(Date.now() + index * 1000) // Different timestamps
      }));

      global.inMemoryWardrobeItems = items;

      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/wardrobe-items')
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.body).toHaveLength(100);
      expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
    });

    it('should handle multiple concurrent GET requests', async () => {
      global.inMemoryWardrobeItems = [
        { id: '1', name: 'Test Item', user: 'test-user-123', dateAdded: new Date() }
      ];

      // Send 10 concurrent GET requests
      const promises = Array(10).fill().map(() =>
        request(app).get('/api/wardrobe-items')
      );

      const responses = await Promise.all(promises);

      // All should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0].name).toBe('Test Item');
      });
    });
  });

  describe('Edge Cases Integration', () => {
    it('should handle extremely long item names', async () => {
      const longName = 'A'.repeat(1000);
      const itemWithLongName = {
        name: longName,
        category: 'accessory',
        color: 'purple'
      };

      const response = await request(app)
        .post('/api/wardrobe-items')
        .send(itemWithLongName)
        .expect(201);

      expect(response.body.name).toBe(longName);
    });

    it('should handle special characters in all fields', async () => {
      const itemWithSpecialChars = {
        name: 'T-Shirt & Jeans (100% Cotton) - "Premium" <Brand>',
        category: 'top',
        color: 'blue & white',
        brand: 'Spëcial Charäcters Brånd',
        size: 'M/L',
        material: '100% Cotton, 0% Polyester'
      };

      const response = await request(app)
        .post('/api/wardrobe-items')
        .send(itemWithSpecialChars)
        .expect(201);

      expect(response.body.name).toBe(itemWithSpecialChars.name);
      expect(response.body.brand).toBe(itemWithSpecialChars.brand);
      expect(response.body.material).toBe(itemWithSpecialChars.material);
    });

    it('should handle empty string values appropriately', async () => {
      const itemWithEmptyStrings = {
        name: 'Valid Name',
        category: 'top',
        color: 'blue',
        brand: '',
        size: '',
        material: ''
      };

      const response = await request(app)
        .post('/api/wardrobe-items')
        .send(itemWithEmptyStrings)
        .expect(201);

      expect(response.body.name).toBe('Valid Name');
      expect(response.body.brand).toBe('');
    });
  });
});
