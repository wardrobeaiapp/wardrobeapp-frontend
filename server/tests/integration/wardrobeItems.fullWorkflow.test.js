const request = require('supertest');
const express = require('express');

// Mock the authentication middleware
jest.mock('../../middleware/auth', () => {
  return (req, res, next) => {
    req.user = { id: '123e4567-e89b-12d3-a456-426614174000' };
    next();
  };
});

const wardrobeItemsRouter = require('../../routes/api/wardrobe/items');

const createTestApp = () => {
  const app = express();
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use('/api/wardrobe-items', wardrobeItemsRouter);
  return app;
};

describe('Wardrobe Items - Full Workflow Integration Tests', () => {
  let app;

  beforeEach(() => {
    global.usingMongoDB = false;
    global.inMemoryWardrobeItems = [];
    app = createTestApp();
  });

  describe('Complete CRUD Workflow with All Fields', () => {
    it('should handle Create → Read → Update → Read → Delete workflow with all fields', async () => {
      // 1. CREATE: Add a new item with ALL fields
      const newItemData = {
        name: 'Workflow Test Top',
        category: 'top',
        subcategory: 't-shirt',
        color: 'navy blue',
        pattern: 'striped',
        material: '100% cotton',
        brand: 'Workflow Brand',
        silhouette: 'relaxed fit',
        length: 'regular length',
        sleeves: 'short sleeves',
        style: 'casual',
        neckline: 'crew neck',
        season: ['summer', 'spring/fall'],
        scenarios: ['staying_at_home', 'light_outdoor_activities'],
        wishlist: false,
        imageUrl: 'https://example.com/workflow-image.jpg',
        tags: { workflow: 'test', created: 'true' }
      };

      const createResponse = await request(app)
        .post('/api/wardrobe-items')
        .send(newItemData);

      expect(createResponse.status).toBe(200);
      const itemId = createResponse.body.id;
      
      // Verify all fields were saved in creation
      expect(createResponse.body.sleeves).toBe(newItemData.sleeves);
      expect(createResponse.body.style).toBe(newItemData.style);
      expect(createResponse.body.neckline).toBe(newItemData.neckline);
      expect(createResponse.body.pattern).toBe(newItemData.pattern);
      expect(createResponse.body.silhouette).toBe(newItemData.silhouette);

      // 2. READ: Verify item exists with all fields
      const readResponse = await request(app)
        .get('/api/wardrobe-items');

      expect(readResponse.status).toBe(200);
      const createdItem = readResponse.body.find(item => item.id === itemId);
      expect(createdItem).toBeDefined();
      expect(createdItem.sleeves).toBe(newItemData.sleeves);
      expect(createdItem.style).toBe(newItemData.style);

      // 3. UPDATE: Modify multiple fields including critical ones
      const updateData = {
        name: 'Updated Workflow Top',
        color: 'forest green',
        sleeves: 'long sleeves',  // Change the critical field
        style: 'elegant',         // Change the critical field
        pattern: 'solid',
        material: 'organic cotton',
        neckline: 'v-neck',
        season: ['winter', 'spring/fall'],
        scenarios: ['office_work'],
        wishlist: true,
        tags: { workflow: 'test', updated: 'true' }
      };

      const updateResponse = await request(app)
        .put(`/api/wardrobe-items/${itemId}`)
        .send(updateData);

      expect(updateResponse.status).toBe(200);
      
      // Verify all updated fields
      expect(updateResponse.body.name).toBe(updateData.name);
      expect(updateResponse.body.color).toBe(updateData.color);
      expect(updateResponse.body.sleeves).toBe(updateData.sleeves);
      expect(updateResponse.body.style).toBe(updateData.style);
      expect(updateResponse.body.pattern).toBe(updateData.pattern);
      expect(updateResponse.body.neckline).toBe(updateData.neckline);
      expect(updateResponse.body.season).toEqual(updateData.season);
      expect(updateResponse.body.scenarios).toEqual(updateData.scenarios);
      expect(updateResponse.body.wishlist).toBe(updateData.wishlist);
      expect(updateResponse.body.tags).toEqual(updateData.tags);

      // Verify preserved fields
      expect(updateResponse.body.category).toBe(newItemData.category);
      expect(updateResponse.body.subcategory).toBe(newItemData.subcategory);
      expect(updateResponse.body.material).toBe(updateData.material);

      // 4. READ AGAIN: Verify persistence
      const readAfterUpdateResponse = await request(app)
        .get('/api/wardrobe-items');

      expect(readAfterUpdateResponse.status).toBe(200);
      const updatedItem = readAfterUpdateResponse.body.find(item => item.id === itemId);
      expect(updatedItem.sleeves).toBe(updateData.sleeves);
      expect(updatedItem.style).toBe(updateData.style);
      expect(updatedItem.name).toBe(updateData.name);

      // 5. DELETE: Remove the item
      const deleteResponse = await request(app)
        .delete(`/api/wardrobe-items/${itemId}`);

      expect(deleteResponse.status).toBe(200);

      // 6. VERIFY DELETION: Ensure item is gone
      const finalReadResponse = await request(app)
        .get('/api/wardrobe-items');

      expect(finalReadResponse.status).toBe(200);
      const deletedItem = finalReadResponse.body.find(item => item.id === itemId);
      expect(deletedItem).toBeUndefined();
    });
  });

  describe('Field Preservation Across Operations', () => {
    it('should preserve all fields through multiple updates', async () => {
      // Create item with all fields
      const completeItem = {
        name: 'Preservation Test',
        category: 'bottom',
        subcategory: 'jeans',
        color: 'dark blue',
        pattern: 'solid',
        material: 'denim',
        brand: 'Preservation Brand',
        silhouette: 'slim fit',
        length: 'full length',
        sleeves: undefined, // N/A for bottoms
        style: 'casual',
        rise: 'mid rise',
        neckline: undefined, // N/A for bottoms
        heelHeight: undefined,
        bootHeight: undefined,
        type: undefined,
        season: ['winter', 'spring/fall'],
        scenarios: ['office_work', 'social_outings'],
        wishlist: false,
        imageUrl: 'https://example.com/jeans.jpg',
        tags: { fit: 'slim', wash: 'dark' }
      };

      const createResponse = await request(app)
        .post('/api/wardrobe-items')
        .send(completeItem);

      const itemId = createResponse.body.id;

      // Update 1: Change only style
      const update1 = await request(app)
        .put(`/api/wardrobe-items/${itemId}`)
        .send({ style: 'elegant' });

      expect(update1.body.style).toBe('elegant');
      expect(update1.body.rise).toBe(completeItem.rise); // Should be preserved
      expect(update1.body.color).toBe(completeItem.color); // Should be preserved

      // Update 2: Change rise and color
      const update2 = await request(app)
        .put(`/api/wardrobe-items/${itemId}`)
        .send({ rise: 'high rise', color: 'black' });

      expect(update2.body.rise).toBe('high rise');
      expect(update2.body.color).toBe('black');
      expect(update2.body.style).toBe('elegant'); // From previous update
      expect(update2.body.material).toBe(completeItem.material); // Original value

      // Update 3: Change multiple fields
      const update3 = await request(app)
        .put(`/api/wardrobe-items/${itemId}`)
        .send({ 
          name: 'Updated Preservation Test',
          pattern: 'distressed',
          tags: { fit: 'slim', wash: 'black', updated: 'true' }
        });

      expect(update3.body.name).toBe('Updated Preservation Test');
      expect(update3.body.pattern).toBe('distressed');
      expect(update3.body.tags).toEqual({ fit: 'slim', wash: 'black', updated: 'true' });
      
      // All previous changes should be preserved
      expect(update3.body.style).toBe('elegant');
      expect(update3.body.rise).toBe('high rise');
      expect(update3.body.color).toBe('black');
      expect(update3.body.material).toBe(completeItem.material);
    });

    it('should handle edge cases in field updates', async () => {
      // Create basic item
      const basicItem = {
        name: 'Edge Case Test',
        category: 'top',
        subcategory: 'sweater',
        color: 'gray',
        season: ['winter'],
        sleeves: 'long sleeves',
        style: 'casual'
      };

      const createResponse = await request(app)
        .post('/api/wardrobe-items')
        .send(basicItem);

      const itemId = createResponse.body.id;

      // Test 1: Update with null values
      const nullUpdate = await request(app)
        .put(`/api/wardrobe-items/${itemId}`)
        .send({ 
          pattern: null,
          material: null 
        });

      expect(nullUpdate.body.pattern).toBeNull();
      expect(nullUpdate.body.material).toBeNull();
      expect(nullUpdate.body.sleeves).toBe(basicItem.sleeves); // Preserved

      // Test 2: Update with empty strings
      const emptyStringUpdate = await request(app)
        .put(`/api/wardrobe-items/${itemId}`)
        .send({ 
          brand: '',
          silhouette: '' 
        });

      expect(emptyStringUpdate.body.brand).toBe('');
      expect(emptyStringUpdate.body.silhouette).toBe('');
      expect(emptyStringUpdate.body.style).toBe(basicItem.style); // Preserved

      // Test 3: Update with undefined (should preserve existing values)
      const undefinedUpdate = await request(app)
        .put(`/api/wardrobe-items/${itemId}`)
        .send({ 
          sleeves: undefined,
          style: 'elegant' // This should update
        });

      expect(undefinedUpdate.body.sleeves).toBe(basicItem.sleeves); // Should preserve original
      expect(undefinedUpdate.body.style).toBe('elegant'); // Should update
    });
  });

  describe('Concurrent Operations Field Safety', () => {
    it('should handle concurrent updates to different fields safely', async () => {
      // Create base item
      const baseItem = {
        name: 'Concurrent Test',
        category: 'top',
        subcategory: 'blouse',
        color: 'white',
        sleeves: 'short sleeves',
        style: 'elegant',
        season: ['summer']
      };

      const createResponse = await request(app)
        .post('/api/wardrobe-items')
        .send(baseItem);

      const itemId = createResponse.body.id;

      // Simulate concurrent updates to different fields
      const updates = [
        { color: 'cream' },
        { sleeves: 'long sleeves' },
        { style: 'casual' },
        { pattern: 'floral' },
        { material: 'silk' }
      ];

      const updatePromises = updates.map(update => 
        request(app)
          .put(`/api/wardrobe-items/${itemId}`)
          .send(update)
      );

      const results = await Promise.all(updatePromises);

      // All updates should succeed
      results.forEach(result => {
        expect(result.status).toBe(200);
      });

      // Final state should have the last update for each field
      // (Due to the nature of concurrent updates, we can't predict exact final state,
      // but we can verify that no fields are lost)
      const finalRead = await request(app)
        .get('/api/wardrobe-items');

      const finalItem = finalRead.body.find(item => item.id === itemId);
      
      // Essential fields should still exist
      expect(finalItem.name).toBe(baseItem.name);
      expect(finalItem.category).toBe(baseItem.category);
      expect(finalItem.subcategory).toBe(baseItem.subcategory);
      
      // Updated fields should have some value (from one of the concurrent updates)
      expect(finalItem.color).toBeTruthy();
      expect(finalItem.sleeves).toBeTruthy();
      expect(finalItem.style).toBeTruthy();
    });
  });

  describe('Complex Field Scenarios', () => {
    it('should handle items with all field combinations', async () => {
      const complexItems = [
        {
          name: 'Complex Top',
          category: 'top',
          subcategory: 'blouse',
          color: 'burgundy',
          pattern: 'paisley',
          material: 'silk',
          brand: 'Designer Brand',
          silhouette: 'fitted',
          length: 'regular',
          sleeves: '3/4 sleeves',
          style: 'elegant',
          neckline: 'boat neck',
          season: ['spring/fall'],
          scenarios: ['office_work', 'social_outings'],
          wishlist: false,
          imageUrl: 'https://example.com/blouse.jpg',
          tags: { occasion: 'work', color_family: 'red' }
        },
        {
          name: 'Complex Footwear',
          category: 'footwear',
          subcategory: 'boots',
          color: 'brown leather',
          material: 'genuine leather',
          brand: 'Boot Co',
          style: 'casual',
          heelHeight: 'low heel',
          bootHeight: 'ankle',
          type: 'chelsea boots',
          season: ['winter', 'spring/fall'],
          scenarios: ['office_work', 'light_outdoor_activities'],
          wishlist: true,
          imageUrl: 'https://example.com/boots.jpg',
          tags: { material: 'leather', style: 'versatile' }
        }
      ];

      const createdItems = [];

      // Create all complex items
      for (const itemData of complexItems) {
        const createResponse = await request(app)
          .post('/api/wardrobe-items')
          .send(itemData);

        expect(createResponse.status).toBe(200);
        createdItems.push({ id: createResponse.body.id, original: itemData });

        // Verify all fields are present
        Object.keys(itemData).forEach(field => {
          expect(createResponse.body[field]).toEqual(itemData[field]);
        });
      }

      // Update each item with field changes
      for (const { id, original } of createdItems) {
        const updates = {
          color: `updated ${original.color}`,
          style: original.style === 'elegant' ? 'casual' : 'elegant',
          tags: { ...original.tags, updated: 'true' }
        };

        const updateResponse = await request(app)
          .put(`/api/wardrobe-items/${id}`)
          .send(updates);

        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.color).toBe(updates.color);
        expect(updateResponse.body.style).toBe(updates.style);
        expect(updateResponse.body.tags).toEqual(updates.tags);

        // Original fields should be preserved
        expect(updateResponse.body.name).toBe(original.name);
        expect(updateResponse.body.category).toBe(original.category);
        expect(updateResponse.body.material).toBe(original.material);
      }

      // Verify all items still exist with correct data
      const allItemsResponse = await request(app)
        .get('/api/wardrobe-items');

      expect(allItemsResponse.body).toHaveLength(complexItems.length);
      
      createdItems.forEach(({ id }) => {
        const item = allItemsResponse.body.find(item => item.id === id);
        expect(item).toBeDefined();
        expect(item.tags.updated).toBe('true');
      });
    });
  });
});
