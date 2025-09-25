const request = require('supertest');
const express = require('express');

// Mock the authentication middleware globally
jest.mock('../../middleware/auth', () => {
  return (req, res, next) => {
    req.user = { id: 'test-user-123' };
    next();
  };
});

const wardrobeItemsRouter = require('../../routes/wardrobeItems');

const createTestApp = () => {
  const app = express();
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use('/api/wardrobe-items', wardrobeItemsRouter);
  return app;
};

describe('Wardrobe Items Delete API - Integration Tests', () => {
  let app;

  beforeEach(() => {
    global.inMemoryWardrobeItems = [];
    app = createTestApp();
  });

  describe('DELETE /api/wardrobe-items/:id - Core Delete Functionality', () => {
    it('should delete an existing wardrobe item successfully', async () => {
      const testItem = {
        id: 'delete-test-1',
        name: 'Item to Delete',
        category: 'top',
        color: 'red',
        brand: 'Test Brand',
        user: 'test-user-123',
        dateAdded: new Date().toISOString()
      };
      
      global.inMemoryWardrobeItems = [testItem];

      const response = await request(app)
        .delete('/api/wardrobe-items/delete-test-1');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Item removed');
      
      // Verify item was actually deleted
      expect(global.inMemoryWardrobeItems).toHaveLength(0);
    });

    it('should delete item and preserve other items', async () => {
      const items = [
        { id: 'keep-1', name: 'Keep Item 1', user: 'test-user-123', category: 'top', color: 'blue', dateAdded: new Date().toISOString() },
        { id: 'delete-2', name: 'Delete Item', user: 'test-user-123', category: 'bottom', color: 'black', dateAdded: new Date().toISOString() },
        { id: 'keep-3', name: 'Keep Item 3', user: 'test-user-123', category: 'dress', color: 'green', dateAdded: new Date().toISOString() }
      ];
      
      global.inMemoryWardrobeItems = items;

      const response = await request(app)
        .delete('/api/wardrobe-items/delete-2');

      expect(response.status).toBe(200);
      expect(global.inMemoryWardrobeItems).toHaveLength(2);
      
      // Verify correct item was deleted and others remain
      const remainingItems = global.inMemoryWardrobeItems.map(item => item.id);
      expect(remainingItems).toContain('keep-1');
      expect(remainingItems).toContain('keep-3');
      expect(remainingItems).not.toContain('delete-2');
    });

    it('should delete items with complex data structures', async () => {
      const complexItem = {
        id: 'complex-delete',
        name: 'Complex Item',
        category: 'dress',
        color: 'burgundy',
        season: ['winter', 'spring/fall'],
        tags: { style: 'formal', occasion: 'work' },
        metadata: { source: 'wishlist', aiAnalyzed: true },
        user: 'test-user-123',
        dateAdded: new Date().toISOString()
      };
      
      global.inMemoryWardrobeItems = [complexItem];

      const response = await request(app)
        .delete('/api/wardrobe-items/complex-delete');

      expect(response.status).toBe(200);
      expect(global.inMemoryWardrobeItems).toHaveLength(0);
    });
  });

  describe('Delete Security & Authorization', () => {
    it('should return 404 for non-existent items', async () => {
      const response = await request(app)
        .delete('/api/wardrobe-items/non-existent-item');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Item not found');
    });

    it('should return 401 when trying to delete another user\'s item', async () => {
      const otherUserItem = {
        id: 'other-user-item',
        name: 'Other User Item',
        category: 'top',
        color: 'yellow',
        user: 'other-user-456', // Different user
        dateAdded: new Date().toISOString()
      };
      
      global.inMemoryWardrobeItems = [otherUserItem];

      const response = await request(app)
        .delete('/api/wardrobe-items/other-user-item');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Not authorized');
      
      // Verify item was NOT deleted
      expect(global.inMemoryWardrobeItems).toHaveLength(1);
      expect(global.inMemoryWardrobeItems[0].name).toBe('Other User Item');
    });

    it('should enforce strict user isolation during delete operations', async () => {
      const multiUserItems = [
        { id: 'user123-item1', name: 'My Item 1', user: 'test-user-123', category: 'top', color: 'blue', dateAdded: new Date().toISOString() },
        { id: 'user456-item1', name: 'Other Item 1', user: 'other-user-456', category: 'top', color: 'red', dateAdded: new Date().toISOString() },
        { id: 'user123-item2', name: 'My Item 2', user: 'test-user-123', category: 'bottom', color: 'black', dateAdded: new Date().toISOString() },
        { id: 'user789-item1', name: 'Third User Item', user: 'third-user-789', category: 'dress', color: 'green', dateAdded: new Date().toISOString() }
      ];
      
      global.inMemoryWardrobeItems = multiUserItems;

      // Can delete own item
      const ownDeleteResponse = await request(app)
        .delete('/api/wardrobe-items/user123-item1');
      expect(ownDeleteResponse.status).toBe(200);

      // Cannot delete other users' items
      const otherDeleteResponse1 = await request(app)
        .delete('/api/wardrobe-items/user456-item1');
      expect(otherDeleteResponse1.status).toBe(401);

      const otherDeleteResponse2 = await request(app)
        .delete('/api/wardrobe-items/user789-item1');
      expect(otherDeleteResponse2.status).toBe(401);

      // Verify only own item was deleted
      expect(global.inMemoryWardrobeItems).toHaveLength(3);
      const remainingItemUsers = global.inMemoryWardrobeItems.map(item => item.user);
      expect(remainingItemUsers).toContain('test-user-123'); // My second item remains
      expect(remainingItemUsers).toContain('other-user-456');
      expect(remainingItemUsers).toContain('third-user-789');
    });
  });

  describe('Delete Data Consistency', () => {
    it('should maintain data integrity after deletion', async () => {
      const items = [
        { id: 'item-1', name: 'Item One', user: 'test-user-123', category: 'top', color: 'blue', priority: 1, dateAdded: new Date().toISOString() },
        { id: 'item-2', name: 'Item Two', user: 'test-user-123', category: 'bottom', color: 'black', priority: 2, dateAdded: new Date().toISOString() },
        { id: 'item-3', name: 'Item Three', user: 'test-user-123', category: 'dress', color: 'red', priority: 3, dateAdded: new Date().toISOString() }
      ];
      
      global.inMemoryWardrobeItems = items;

      // Delete middle item
      await request(app).delete('/api/wardrobe-items/item-2');

      // Verify remaining items maintain their data integrity
      const remainingItems = global.inMemoryWardrobeItems;
      expect(remainingItems).toHaveLength(2);
      
      const item1 = remainingItems.find(item => item.id === 'item-1');
      const item3 = remainingItems.find(item => item.id === 'item-3');
      
      expect(item1.priority).toBe(1);
      expect(item3.priority).toBe(3);
      expect(item1.name).toBe('Item One');
      expect(item3.name).toBe('Item Three');
    });

    it('should handle concurrent delete operations safely', async () => {
      const items = [
        { id: 'concurrent-1', name: 'Concurrent Item 1', user: 'test-user-123', category: 'top', color: 'blue', dateAdded: new Date().toISOString() },
        { id: 'concurrent-2', name: 'Concurrent Item 2', user: 'test-user-123', category: 'bottom', color: 'black', dateAdded: new Date().toISOString() },
        { id: 'concurrent-3', name: 'Concurrent Item 3', user: 'test-user-123', category: 'dress', color: 'red', dateAdded: new Date().toISOString() }
      ];
      
      global.inMemoryWardrobeItems = items;

      // Attempt concurrent deletes
      const deletePromises = [
        request(app).delete('/api/wardrobe-items/concurrent-1'),
        request(app).delete('/api/wardrobe-items/concurrent-2')
      ];

      const responses = await Promise.all(deletePromises);

      // Both deletes should succeed
      expect(responses[0].status).toBe(200);
      expect(responses[1].status).toBe(200);

      // Only one item should remain
      expect(global.inMemoryWardrobeItems).toHaveLength(1);
      expect(global.inMemoryWardrobeItems[0].id).toBe('concurrent-3');
    });
  });

  describe('Complete Delete Workflows', () => {
    it('should handle Create → View → Delete workflow', async () => {
      // CREATE
      const createResponse = await request(app)
        .post('/api/wardrobe-items')
        .send({
          name: 'Workflow Delete Item',
          category: 'accessory',
          color: 'silver'
        });

      expect(createResponse.status).toBe(201);
      const itemId = createResponse.body.id;

      // VIEW - Verify item exists
      const viewResponse = await request(app)
        .get(`/api/wardrobe-items/${itemId}`);

      expect(viewResponse.status).toBe(200);
      expect(viewResponse.body.name).toBe('Workflow Delete Item');

      // DELETE
      const deleteResponse = await request(app)
        .delete(`/api/wardrobe-items/${itemId}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.message).toBe('Item removed');

      // VERIFY - Item should be gone
      const verifyResponse = await request(app)
        .get(`/api/wardrobe-items/${itemId}`);

      expect(verifyResponse.status).toBe(404);
    });

    it('should handle bulk delete operations', async () => {
      // Create multiple items
      const items = [
        { id: 'bulk-1', name: 'Bulk Item 1', user: 'test-user-123', category: 'top', color: 'red', dateAdded: new Date().toISOString() },
        { id: 'bulk-2', name: 'Bulk Item 2', user: 'test-user-123', category: 'bottom', color: 'blue', dateAdded: new Date().toISOString() },
        { id: 'bulk-3', name: 'Bulk Item 3', user: 'test-user-123', category: 'dress', color: 'green', dateAdded: new Date().toISOString() },
        { id: 'keep-item', name: 'Keep This Item', user: 'test-user-123', category: 'accessory', color: 'gold', dateAdded: new Date().toISOString() }
      ];
      
      global.inMemoryWardrobeItems = items;

      // Delete multiple items sequentially
      const deletePromises = [
        request(app).delete('/api/wardrobe-items/bulk-1'),
        request(app).delete('/api/wardrobe-items/bulk-2'),
        request(app).delete('/api/wardrobe-items/bulk-3')
      ];

      const responses = await Promise.all(deletePromises);

      // All deletes should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Item removed');
      });

      // Only one item should remain
      expect(global.inMemoryWardrobeItems).toHaveLength(1);
      expect(global.inMemoryWardrobeItems[0].name).toBe('Keep This Item');
    });
  });

  describe('Delete Edge Cases', () => {
    it('should handle deletion with malformed item IDs gracefully', async () => {
      const malformedIds = [
        'null',
        'undefined',
        'a'.repeat(150) // too long
      ];

      for (const malformedId of malformedIds) {
        const response = await request(app)
          .delete(`/api/wardrobe-items/${malformedId}`);

        // Debug which ID is causing issues
        if (!response.body.message) {
          console.log(`❌ ID "${malformedId}" has no message in response body`);
          console.log('Response status:', response.status);
          console.log('Response body:', response.body);
          console.log('Response text:', response.text);
        }
        
        // Should return 404 for all malformed IDs
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Item not found');
      }
    });

    it('should handle deletion from empty storage', async () => {
      // Ensure storage is empty
      global.inMemoryWardrobeItems = [];

      const response = await request(app)
        .delete('/api/wardrobe-items/any-item-id');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Item not found');
    });

    it('should handle deletion of items with null/undefined properties', async () => {
      const itemWithNulls = {
        id: 'null-props-item',
        name: 'Item with Nulls',
        user: 'test-user-123',
        category: 'top',
        color: null,
        brand: undefined,
        size: null,
        dateAdded: new Date().toISOString()
      };
      
      global.inMemoryWardrobeItems = [itemWithNulls];

      const response = await request(app)
        .delete('/api/wardrobe-items/null-props-item');

      expect(response.status).toBe(200);
      expect(global.inMemoryWardrobeItems).toHaveLength(0);
    });
  });
});
