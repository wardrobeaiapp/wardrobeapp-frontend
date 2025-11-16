const request = require('supertest');
const express = require('express');

// Mock the authentication middleware globally
jest.mock('../../middleware/auth', () => {
  return (req, res, next) => {
    req.user = { id: '123e4567-e89b-12d3-a456-426614174000' }; // Valid UUID format for Supabase
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

describe('Wardrobe Items Edit API - Integration Tests', () => {
  let app;

  beforeEach(() => {
    global.usingMongoDB = false;
    global.inMemoryWardrobeItems = [];
    app = createTestApp();
  });

  describe('PUT /api/wardrobe-items/:id - Core Edit Functionality', () => {
    it('should update an existing item successfully', async () => {
      const originalItem = {
        id: 'edit-test-1',
        name: 'Original Item',
        category: 'top',
        color: 'blue',
        brand: 'Original Brand',
        size: 'M',
        user: '123e4567-e89b-12d3-a456-426614174000',
        dateAdded: new Date().toISOString()
      };
      
      global.inMemoryWardrobeItems = [originalItem];

      const updateData = {
        name: 'Updated Item',
        color: 'red',
        brand: 'New Brand',
        size: 'L'
      };

      const response = await request(app)
        .put('/api/wardrobe-items/edit-test-1')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Item');
      expect(response.body.color).toBe('red');
      expect(response.body.brand).toBe('New Brand');
      expect(response.body.size).toBe('L');
      
      // Unchanged fields should be preserved
      expect(response.body.category).toBe('top');
      expect(response.body.user).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(response.body.id).toBe('edit-test-1'); // ID never changes
    });

    it('should handle partial updates correctly', async () => {
      const originalItem = {
        id: 'partial-test',
        name: 'Partial Test Item',
        category: 'bottom',
        color: 'black',
        brand: 'Original Brand',
        size: 'M',
        material: 'Denim',
        price: 59.99,
        user: '123e4567-e89b-12d3-a456-426614174000',
        dateAdded: new Date().toISOString()
      };
      
      global.inMemoryWardrobeItems = [originalItem];

      // Only update price and size
      const partialUpdate = {
        price: 75.00,
        size: 'L'
      };

      const response = await request(app)
        .put('/api/wardrobe-items/partial-test')
        .send(partialUpdate);

      expect(response.status).toBe(200);
      expect(response.body.price).toBe(75.00);
      expect(response.body.size).toBe('L');
      
      // All other fields preserved
      expect(response.body.name).toBe('Partial Test Item');
      expect(response.body.category).toBe('bottom');
      expect(response.body.color).toBe('black');
      expect(response.body.brand).toBe('Original Brand');
      expect(response.body.material).toBe('Denim');
    });

    it('should update complex data structures', async () => {
      const originalItem = {
        id: 'complex-test',
        name: 'Complex Item',
        category: 'dress',
        color: 'navy',
        season: ['summer'],
        tags: { style: 'casual' },
        wishlist: false,
        user: '123e4567-e89b-12d3-a456-426614174000',
        dateAdded: new Date().toISOString()
      };
      
      global.inMemoryWardrobeItems = [originalItem];

      const complexUpdate = {
        season: ['winter', 'spring/fall'],
        tags: { style: 'formal', occasion: 'work' },
        wishlist: true
      };

      const response = await request(app)
        .put('/api/wardrobe-items/complex-test')
        .send(complexUpdate);

      expect(response.status).toBe(200);
      expect(response.body.season).toEqual(['winter', 'spring/fall']);
      expect(response.body.tags).toEqual({ style: 'formal', occasion: 'work' });
      expect(response.body.wishlist).toBe(true);
      
      // Unchanged fields preserved
      expect(response.body.name).toBe('Complex Item');
      expect(response.body.color).toBe('navy');
    });
  });

  describe('Edit Security & Authorization', () => {
    it('should return 404 for non-existent items', async () => {
      const response = await request(app)
        .put('/api/wardrobe-items/non-existent-id')
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Item not found');
    });

    it('should return 401 when updating another user\'s item', async () => {
      const otherUserItem = {
        id: 'other-user-item',
        name: 'Other User Item',
        category: 'top',
        color: 'green',
        user: 'other-user-456',
        dateAdded: new Date().toISOString()
      };
      
      global.inMemoryWardrobeItems = [otherUserItem];

      const response = await request(app)
        .put('/api/wardrobe-items/other-user-item')
        .send({ name: 'Hacked Name' });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Not authorized');
      
      // Verify item was not modified
      const unchanged = global.inMemoryWardrobeItems.find(item => item.id === 'other-user-item');
      expect(unchanged.name).toBe('Other User Item');
    });

    it('should enforce user isolation across multiple items', async () => {
      const items = [
        { id: 'user123-item1', name: 'My Item 1', user: '123e4567-e89b-12d3-a456-426614174000', category: 'top', color: 'blue', dateAdded: new Date().toISOString() },
        { id: 'user123-item2', name: 'My Item 2', user: '123e4567-e89b-12d3-a456-426614174000', category: 'bottom', color: 'black', dateAdded: new Date().toISOString() },
        { id: 'user456-item', name: 'Not My Item', user: 'other-user-456', category: 'accessory', color: 'red', dateAdded: new Date().toISOString() }
      ];
      
      global.inMemoryWardrobeItems = items;

      // Can update own items
      const ownResponse1 = await request(app)
        .put('/api/wardrobe-items/user123-item1')
        .send({ name: 'Updated My Item 1' });
      expect(ownResponse1.status).toBe(200);

      const ownResponse2 = await request(app)
        .put('/api/wardrobe-items/user123-item2')
        .send({ color: 'navy' });
      expect(ownResponse2.status).toBe(200);

      // Cannot update other user's item
      const otherResponse = await request(app)
        .put('/api/wardrobe-items/user456-item')
        .send({ name: 'Hacked' });
      expect(otherResponse.status).toBe(401);
    });
  });

  describe('Data Persistence & Edge Cases', () => {
    it('should persist changes across requests', async () => {
      const item = {
        id: 'persistence-test',
        name: 'Initial Name',
        category: 'footwear',
        color: 'brown',
        user: '123e4567-e89b-12d3-a456-426614174000',
        dateAdded: new Date().toISOString()
      };
      
      global.inMemoryWardrobeItems = [item];

      // Update
      await request(app)
        .put('/api/wardrobe-items/persistence-test')
        .send({ name: 'Persistent Name', color: 'black' });

      // Verify persistence via GET
      const getResponse = await request(app)
        .get('/api/wardrobe-items/persistence-test');

      expect(getResponse.status).toBe(200);
      expect(getResponse.body.name).toBe('Persistent Name');
      expect(getResponse.body.color).toBe('black');
    });

    it('should handle empty updates gracefully', async () => {
      const item = {
        id: 'empty-test',
        name: 'Empty Test',
        category: 'accessory',
        color: 'gold',
        user: '123e4567-e89b-12d3-a456-426614174000',
        dateAdded: new Date().toISOString()
      };
      
      global.inMemoryWardrobeItems = [item];

      const response = await request(app)
        .put('/api/wardrobe-items/empty-test')
        .send({});

      expect(response.status).toBe(200);
      // Should return unchanged
      expect(response.body.name).toBe('Empty Test');
      expect(response.body.color).toBe('gold');
    });

    it('should handle multiple consecutive edits', async () => {
      const item = {
        id: 'multi-edit',
        name: 'Multi Edit',
        category: 'top',
        color: 'white',
        price: 30,
        user: '123e4567-e89b-12d3-a456-426614174000',
        dateAdded: new Date().toISOString()
      };
      
      global.inMemoryWardrobeItems = [item];

      // First edit
      const edit1 = await request(app)
        .put('/api/wardrobe-items/multi-edit')
        .send({ color: 'blue', price: 35 });
      expect(edit1.status).toBe(200);

      // Second edit
      const edit2 = await request(app)
        .put('/api/wardrobe-items/multi-edit')
        .send({ name: 'Updated Multi Edit' });
      expect(edit2.status).toBe(200);

      // Final verification
      expect(edit2.body.name).toBe('Updated Multi Edit');
      expect(edit2.body.color).toBe('blue');
      expect(edit2.body.price).toBe(35);
    });
  });

  describe('Complete Edit Workflows', () => {
    it('should handle Create → Edit → View workflow', async () => {
      // CREATE
      const createResponse = await request(app)
        .post('/api/wardrobe-items')
        .send({
          name: 'Workflow Item',
          category: 'top',
          color: 'green'
        });

      expect(createResponse.status).toBe(201);
      const itemId = createResponse.body.id;

      // EDIT
      const editResponse = await request(app)
        .put(`/api/wardrobe-items/${itemId}`)
        .send({
          name: 'Edited Workflow Item',
          color: 'purple',
          brand: 'New Brand'
        });

      expect(editResponse.status).toBe(200);
      expect(editResponse.body.name).toBe('Edited Workflow Item');
      expect(editResponse.body.color).toBe('purple');
      expect(editResponse.body.brand).toBe('New Brand');

      // VIEW - Verify changes persisted
      const viewResponse = await request(app)
        .get(`/api/wardrobe-items/${itemId}`);

      expect(viewResponse.status).toBe(200);
      expect(viewResponse.body.name).toBe('Edited Workflow Item');
      expect(viewResponse.body.color).toBe('purple');
      expect(viewResponse.body.brand).toBe('New Brand');
      expect(viewResponse.body.category).toBe('top');
    });

    it('should preserve data integrity in concurrent scenarios', async () => {
      const items = [
        { id: 'item-1', name: 'Item 1', user: '123e4567-e89b-12d3-a456-426614174000', category: 'top', color: 'red', dateAdded: new Date().toISOString() },
        { id: 'item-2', name: 'Item 2', user: '123e4567-e89b-12d3-a456-426614174000', category: 'bottom', color: 'blue', dateAdded: new Date().toISOString() }
      ];
      
      global.inMemoryWardrobeItems = items;

      // Update different items concurrently
      const promises = [
        request(app).put('/api/wardrobe-items/item-1').send({ color: 'crimson' }),
        request(app).put('/api/wardrobe-items/item-2').send({ color: 'navy' })
      ];

      const responses = await Promise.all(promises);

      // Both updates should succeed
      expect(responses[0].status).toBe(200);
      expect(responses[1].status).toBe(200);
      
      expect(responses[0].body.color).toBe('crimson');
      expect(responses[1].body.color).toBe('navy');
      
      // Names should be preserved
      expect(responses[0].body.name).toBe('Item 1');
      expect(responses[1].body.name).toBe('Item 2');
    });
  });
});
