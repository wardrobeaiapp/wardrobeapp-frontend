const request = require('supertest');
const express = require('express');

// Mock the authentication middleware globally
jest.mock('../../middleware/auth', () => {
  return (req, res, next) => {
    req.user = { id: '123e4567-e89b-12d3-a456-426614174000' }; // Valid UUID format for Supabase
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

describe('Wardrobe Items API - View & CRUD Integration', () => {
  let app;

  beforeEach(() => {
    // Setup fresh test environment
    global.usingMongoDB = false;
    global.inMemoryWardrobeItems = [];
    
    // Create fresh app instance
    app = createTestApp();
  });

  describe('GET /api/wardrobe-items/:id - View Single Item', () => {
    it('should return a specific wardrobe item', async () => {
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

    it('should handle viewing items with all optional fields', async () => {
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

  describe('PUT /api/wardrobe-items/:id - Update Item', () => {
    it('should update an existing wardrobe item', async () => {
      // Add test item
      const originalItem = {
        id: 'update-test-item',
        name: 'Original Name',
        category: 'top',
        color: 'blue',
        brand: 'Original Brand',
        user: '123e4567-e89b-12d3-a456-426614174000',
        dateAdded: new Date()
      };
      
      global.inMemoryWardrobeItems = [originalItem];

      const updateData = {
        name: 'Updated Name',
        color: 'red',
        brand: 'New Brand',
        size: 'L'
      };

      const response = await request(app)
        .put('/api/wardrobe-items/update-test-item')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Name');
      expect(response.body.color).toBe('red');
      expect(response.body.brand).toBe('New Brand');
      expect(response.body.size).toBe('L');
      expect(response.body.category).toBe('top'); // Should preserve unchanged fields
      expect(response.body.id).toBe('update-test-item'); // ID should not change
    });

    it('should return 404 when updating non-existent item', async () => {
      const updateData = { name: 'Updated Name' };

      const response = await request(app)
        .put('/api/wardrobe-items/non-existent')
        .send(updateData);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Item not found');
    });

    it('should return 401 when trying to update another user\'s item', async () => {
      const otherUserItem = {
        id: 'other-item',
        name: 'Other Item',
        user: 'other-user-456',
        category: 'top',
        color: 'blue',
        dateAdded: new Date()
      };
      
      global.inMemoryWardrobeItems = [otherUserItem];

      const response = await request(app)
        .put('/api/wardrobe-items/other-item')
        .send({ name: 'Hacked Name' });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Not authorized');
    });

    it('should handle partial updates correctly', async () => {
      const item = {
        id: 'partial-update-item',
        name: 'Original Name',
        category: 'top',
        color: 'blue',
        brand: 'Original Brand',
        size: 'M',
        material: 'Cotton',
        user: '123e4567-e89b-12d3-a456-426614174000',
        dateAdded: new Date()
      };
      
      global.inMemoryWardrobeItems = [item];

      // Only update color
      const response = await request(app)
        .put('/api/wardrobe-items/partial-update-item')
        .send({ color: 'green' });

      expect(response.status).toBe(200);
      expect(response.body.color).toBe('green');
      expect(response.body.name).toBe('Original Name'); // Should be unchanged
      expect(response.body.brand).toBe('Original Brand'); // Should be unchanged
      expect(response.body.material).toBe('Cotton'); // Should be unchanged
    });

    it('should update complex data structures', async () => {
      const item = {
        id: 'complex-update-item',
        name: 'Complex Item',
        category: 'top',
        color: 'blue',
        season: ['summer'],
        tags: { style: 'casual' },
        user: '123e4567-e89b-12d3-a456-426614174000',
        dateAdded: new Date()
      };
      
      global.inMemoryWardrobeItems = [item];

      const updateData = {
        season: ['winter', 'spring/fall'],
        tags: { style: 'formal', occasion: 'work' },
        wishlist: true
      };

      const response = await request(app)
        .put('/api/wardrobe-items/complex-update-item')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.season).toEqual(['winter', 'spring/fall']);
      expect(response.body.tags).toEqual({ style: 'formal', occasion: 'work' });
      expect(response.body.wishlist).toBe(true);
    });
  });

  describe('DELETE /api/wardrobe-items/:id - Delete Item', () => {
    it('should delete an existing wardrobe item', async () => {
      const testItem = {
        id: 'delete-test-item',
        name: 'Item to Delete',
        category: 'top',
        color: 'blue',
        user: '123e4567-e89b-12d3-a456-426614174000',
        dateAdded: new Date()
      };
      
      global.inMemoryWardrobeItems = [testItem];

      const response = await request(app)
        .delete('/api/wardrobe-items/delete-test-item');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Item removed');
      
      // Verify item was actually deleted
      expect(global.inMemoryWardrobeItems).toHaveLength(0);
    });

    it('should return 404 when deleting non-existent item', async () => {
      const response = await request(app)
        .delete('/api/wardrobe-items/non-existent');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Item not found');
    });

    it('should return 401 when trying to delete another user\'s item', async () => {
      const otherUserItem = {
        id: 'other-delete-item',
        name: 'Other User Item',
        user: 'other-user-456',
        category: 'top',
        color: 'blue',
        dateAdded: new Date()
      };
      
      global.inMemoryWardrobeItems = [otherUserItem];

      const response = await request(app)
        .delete('/api/wardrobe-items/other-delete-item');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Not authorized');
      
      // Verify item was NOT deleted
      expect(global.inMemoryWardrobeItems).toHaveLength(1);
    });

    it('should handle deletion from multiple items correctly', async () => {
      const items = [
        {
          id: 'item-1',
          name: 'Keep Item 1',
          user: '123e4567-e89b-12d3-a456-426614174000',
          category: 'top',
          color: 'blue',
          dateAdded: new Date()
        },
        {
          id: 'item-2',
          name: 'Delete This Item',
          user: '123e4567-e89b-12d3-a456-426614174000',
          category: 'bottom',
          color: 'red',
          dateAdded: new Date()
        },
        {
          id: 'item-3',
          name: 'Keep Item 3',
          user: '123e4567-e89b-12d3-a456-426614174000',
          category: 'footwear',
          color: 'black',
          dateAdded: new Date()
        }
      ];
      
      global.inMemoryWardrobeItems = items;

      const response = await request(app)
        .delete('/api/wardrobe-items/item-2');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Item removed');
      
      // Verify correct item was deleted and others remain
      expect(global.inMemoryWardrobeItems).toHaveLength(2);
      expect(global.inMemoryWardrobeItems.find(item => item.id === 'item-1')).toBeTruthy();
      expect(global.inMemoryWardrobeItems.find(item => item.id === 'item-2')).toBeFalsy();
      expect(global.inMemoryWardrobeItems.find(item => item.id === 'item-3')).toBeTruthy();
    });
  });

  describe('Complete CRUD Workflow', () => {
    it('should handle complete Create → Read → Update → Delete workflow', async () => {
      // 1. CREATE - Add a new item
      const createData = {
        name: 'CRUD Workflow Item',
        category: 'top',
        color: 'blue',
        brand: 'Test Brand'
      };

      const createResponse = await request(app)
        .post('/api/wardrobe-items')
        .send(createData);

      expect(createResponse.status).toBe(201);
      expect(createResponse.body.name).toBe('CRUD Workflow Item');
      
      const itemId = createResponse.body.id;
      expect(itemId).toBeTruthy();

      // 2. READ - View the created item
      const readResponse = await request(app)
        .get(`/api/wardrobe-items/${itemId}`);

      expect(readResponse.status).toBe(200);
      expect(readResponse.body.name).toBe('CRUD Workflow Item');
      expect(readResponse.body.color).toBe('blue');

      // 3. UPDATE - Modify the item
      const updateData = {
        name: 'Updated CRUD Item',
        color: 'red',
        size: 'L'
      };

      const updateResponse = await request(app)
        .put(`/api/wardrobe-items/${itemId}`)
        .send(updateData);

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.name).toBe('Updated CRUD Item');
      expect(updateResponse.body.color).toBe('red');
      expect(updateResponse.body.size).toBe('L');
      expect(updateResponse.body.brand).toBe('Test Brand'); // Should preserve

      // 4. READ again - Verify update
      const readAfterUpdateResponse = await request(app)
        .get(`/api/wardrobe-items/${itemId}`);

      expect(readAfterUpdateResponse.status).toBe(200);
      expect(readAfterUpdateResponse.body.name).toBe('Updated CRUD Item');
      expect(readAfterUpdateResponse.body.color).toBe('red');

      // 5. DELETE - Remove the item
      const deleteResponse = await request(app)
        .delete(`/api/wardrobe-items/${itemId}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.message).toBe('Item removed');

      // 6. READ after delete - Should return 404
      const readAfterDeleteResponse = await request(app)
        .get(`/api/wardrobe-items/${itemId}`);

      expect(readAfterDeleteResponse.status).toBe(404);
      expect(readAfterDeleteResponse.body.message).toBe('Item not found');
    });
  });

  describe('Data Integrity & Security', () => {
    it('should maintain data integrity during concurrent operations', async () => {
      // Add initial items
      const items = [
        {
          id: 'concurrent-1',
          name: 'Concurrent Item 1',
          user: '123e4567-e89b-12d3-a456-426614174000',
          category: 'top',
          color: 'blue',
          dateAdded: new Date()
        },
        {
          id: 'concurrent-2', 
          name: 'Concurrent Item 2',
          user: '123e4567-e89b-12d3-a456-426614174000',
          category: 'bottom',
          color: 'red',
          dateAdded: new Date()
        }
      ];
      
      global.inMemoryWardrobeItems = items;

      // Perform concurrent operations
      const promises = [
        request(app).get('/api/wardrobe-items/concurrent-1'),
        request(app).put('/api/wardrobe-items/concurrent-2').send({ color: 'green' }),
        request(app).get('/api/wardrobe-items/concurrent-2'),
        request(app).get('/api/wardrobe-items') // Get all items
      ];

      const responses = await Promise.all(promises);

      // All operations should succeed
      expect(responses[0].status).toBe(200); // GET item 1
      expect(responses[1].status).toBe(200); // PUT item 2
      expect(responses[2].status).toBe(200); // GET item 2
      expect(responses[3].status).toBe(200); // GET all items

      // Verify data consistency
      expect(responses[0].body.name).toBe('Concurrent Item 1');
      expect(responses[1].body.color).toBe('green'); // Updated
      expect(responses[2].body.color).toBe('green'); // Reflects update
      expect(responses[3].body).toHaveLength(2); // Both items present
    });

    it('should enforce user isolation across all operations', async () => {
      // Add items for different users
      const multiUserItems = [
        { id: 'user123-item', name: 'User 123 Item', user: '123e4567-e89b-12d3-a456-426614174000', category: 'top', color: 'blue', dateAdded: new Date() },
        { id: 'user456-item', name: 'User 456 Item', user: 'other-user-456', category: 'top', color: 'red', dateAdded: new Date() }
      ];
      
      global.inMemoryWardrobeItems = multiUserItems;

      // Test all operations with proper user isolation
      const responses = await Promise.all([
        request(app).get('/api/wardrobe-items/user123-item'),     // ✅ Should succeed
        request(app).get('/api/wardrobe-items/user456-item'),     // ❌ Should fail (401)
        request(app).put('/api/wardrobe-items/user456-item').send({ color: 'black' }), // ❌ Should fail (401)
        request(app).delete('/api/wardrobe-items/user456-item')   // ❌ Should fail (401)
      ]);

      expect(responses[0].status).toBe(200); // Own item - success
      expect(responses[1].status).toBe(401); // Other's item - unauthorized
      expect(responses[2].status).toBe(401); // Can't update other's item
      expect(responses[3].status).toBe(401); // Can't delete other's item

      // Verify other user's item is still intact
      const otherUserItem = global.inMemoryWardrobeItems.find(item => item.id === 'user456-item');
      expect(otherUserItem).toBeTruthy();
      expect(otherUserItem.color).toBe('red'); // Should be unchanged
    });
  });
});
