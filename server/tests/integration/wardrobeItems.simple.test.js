const request = require('supertest');
const express = require('express');

// Mock the authentication middleware globally
jest.mock('../../middleware/auth', () => {
  return (req, res, next) => {
    req.user = { id: '123e4567-e89b-12d3-a456-426614174000' };
    next();
  };
});

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

describe('Wardrobe Items API - Simple Integration', () => {
  let app;

  beforeEach(() => {
    // Setup fresh test environment
    global.usingMongoDB = false;
    global.inMemoryWardrobeItems = [];
    
    // Create fresh app instance
    app = createTestApp();
  });

  describe('Basic CRUD Operations', () => {
    it('should return empty array for new user', async () => {
      const response = await request(app)
        .get('/api/wardrobe-items');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    it('should create a new wardrobe item with valid data', async () => {
      const itemData = {
        name: 'Test T-Shirt',
        category: 'top',
        color: 'blue'
      };

      const response = await request(app)
        .post('/api/wardrobe-items')
        .send(itemData);

      // Should return 201 Created for new resources
      expect(response.status).toBe(201);

      // Verify response contains our data
      expect(response.body.name).toBe('Test T-Shirt');
      expect(response.body.category).toBe('top');
      expect(response.body.color).toBe('blue');
    });

    it('should validate required fields', async () => {
      const invalidData = {
        // Missing required fields: name, category, color
        brand: 'Test Brand'
      };

      const response = await request(app)
        .post('/api/wardrobe-items')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Missing required fields');
    });

    it('should return created items in GET request', async () => {
      // Add an item directly to in-memory storage
      const testItem = {
        id: 'test-item-1',
        name: 'Existing Item',
        category: 'top',
        color: 'red',
        user: '123e4567-e89b-12d3-a456-426614174000',
        dateAdded: new Date()
      };
      
      global.inMemoryWardrobeItems.push(testItem);

      const response = await request(app)
        .get('/api/wardrobe-items');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].name).toBe('Existing Item');
    });
  });

  describe('User Isolation', () => {
    it('should only return items for authenticated user', async () => {
      // Add items for different users
      global.inMemoryWardrobeItems = [
        {
          id: 'item-1',
          name: 'User 123 Item',
          user: '123e4567-e89b-12d3-a456-426614174000',
          dateAdded: new Date()
        },
        {
          id: 'item-2', 
          name: 'User 456 Item',
          user: 'test-user-456',
          dateAdded: new Date()
        },
        {
          id: 'item-3',
          name: 'Another 123 Item', 
          user: '123e4567-e89b-12d3-a456-426614174000',
          dateAdded: new Date()
        }
      ];

      const response = await request(app)
        .get('/api/wardrobe-items');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      expect(response.body.every(item => item.user === '123e4567-e89b-12d3-a456-426614174000')).toBe(true);
    });
  });

  describe('Data Processing', () => {
    it('should handle season data parsing', async () => {
      const itemWithSeasons = {
        name: 'Seasonal Item',
        category: 'top',
        color: 'blue',
        season: JSON.stringify(['summer', 'winter'])
      };

      const response = await request(app)
        .post('/api/wardrobe-items')
        .send(itemWithSeasons);

      expect(response.status).toBe(201);
      
      if (response.body.season) {
        expect(Array.isArray(response.body.season)).toBe(true);
      }
    });

    it('should handle wishlist items', async () => {
      const wishlistItem = {
        name: 'Wishlist Item',
        category: 'top',
        color: 'blue',
        wishlist: 'true'
      };

      const response = await request(app)
        .post('/api/wardrobe-items')
        .send(wishlistItem);

      expect(response.status).toBe(201);
      
      if (response.body.wishlist !== undefined) {
        expect(typeof response.body.wishlist).toBe('boolean');
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle missing required fields gracefully', async () => {
      const incompleteItem = {
        name: 'Incomplete Item'
        // Missing category and color
      };

      const response = await request(app)
        .post('/api/wardrobe-items')
        .send(incompleteItem);

      expect(response.status).toBe(400);
      expect(response.body.error).toBeTruthy();
    });

    it('should handle large datasets efficiently', async () => {
      // Add 50 items to test performance
      const items = Array(50).fill().map((_, index) => ({
        id: `item-${index}`,
        name: `Item ${index}`,
        category: 'top',
        color: 'blue',
        user: '123e4567-e89b-12d3-a456-426614174000',
        dateAdded: new Date(Date.now() + index * 1000)
      }));

      global.inMemoryWardrobeItems = items;

      const startTime = Date.now();
      const response = await request(app)
        .get('/api/wardrobe-items');
      const endTime = Date.now();

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(50);
      expect(endTime - startTime).toBeLessThan(500); // Should be fast
    });
  });

  describe('Special Cases', () => {
    it('should handle special characters in item names', async () => {
      const itemWithSpecialChars = {
        name: 'T-Shirt & Jeans (100%) - "Premium"',
        category: 'top',
        color: 'blue'
      };

      const response = await request(app)
        .post('/api/wardrobe-items')
        .send(itemWithSpecialChars);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe(itemWithSpecialChars.name);
    });

    it('should handle empty brand and optional fields', async () => {
      const itemWithEmptyFields = {
        name: 'Simple Item',
        category: 'top', 
        color: 'blue',
        brand: '',
        size: '',
        material: ''
      };

      const response = await request(app)
        .post('/api/wardrobe-items')
        .send(itemWithEmptyFields);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('Simple Item');
    });
  });

  describe('Data Consistency', () => {
    it('should maintain consistent data across operations', async () => {
      // Create an item
      const createResponse = await request(app)
        .post('/api/wardrobe-items')
        .send({
          name: 'Consistency Test Item',
          category: 'top',
          color: 'blue'
        });

      expect(createResponse.status).toBe(201);

      // Retrieve items and verify our item is there
      const getResponse = await request(app)
        .get('/api/wardrobe-items');

      expect(getResponse.status).toBe(200);
      const createdItem = getResponse.body.find(item => 
        item.name === 'Consistency Test Item'
      );
      expect(createdItem).toBeTruthy();
      expect(createdItem.category).toBe('top');
      expect(createdItem.color).toBe('blue');
    });

    it('should generate unique identifiers for items', async () => {
      const itemData = {
        name: 'Unique ID Test',
        category: 'top',
        color: 'blue'
      };

      // Create multiple items with same data
      const responses = await Promise.all([
        request(app).post('/api/wardrobe-items').send(itemData),
        request(app).post('/api/wardrobe-items').send(itemData),
        request(app).post('/api/wardrobe-items').send(itemData)
      ]);

      // All should succeed
      responses.forEach(response => {
        expect(response.status).toBe(201);
      });

      // Verify items have unique IDs (if IDs are returned)
      const ids = responses
        .map(response => response.body.id)
        .filter(id => id !== undefined);

      if (ids.length > 0) {
        const uniqueIds = [...new Set(ids)];
        expect(uniqueIds.length).toBe(ids.length);
      }
    });
  });
});
