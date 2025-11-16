const request = require('supertest');
const express = require('express');

// Mock the authentication middleware
jest.mock('../../middleware/auth', () => {
  return (req, res, next) => {
    req.user = { id: '123e4567-e89b-12d3-a456-426614174000' }; // Valid UUID format for Supabase
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

describe('Wardrobe Items - All Fields Persistence Tests', () => {
  let app;

  // Complete wardrobe item data with ALL possible fields
  const COMPLETE_WARDROBE_ITEM = {
    name: 'Complete Test Item',
    category: 'top',
    subcategory: 't-shirt',
    color: 'navy',
    pattern: 'solid',
    material: 'cotton',
    brand: 'Test Brand',
    silhouette: 'relaxed',
    length: 'regular',
    sleeves: 'short sleeves',
    style: 'casual',
    rise: undefined, // Not applicable for tops
    neckline: 'crew neck',
    heelHeight: undefined, // Not applicable for tops
    bootHeight: undefined, // Not applicable for tops  
    type: undefined, // Not applicable for tops
    season: ['summer', 'spring/fall'],
    scenarios: ['staying_at_home', 'light_outdoor_activities'],
    wishlist: false,
    imageUrl: 'https://example.com/test-image.jpg',
    tags: { fit: 'relaxed', occasion: 'casual', detected: 'true' }
  };

  const COMPLETE_BOTTOM_ITEM = {
    name: 'Complete Bottom Item',
    category: 'bottom',
    subcategory: 'jeans',
    color: 'dark blue',
    pattern: 'solid',
    material: 'denim',
    brand: 'Denim Co',
    silhouette: 'slim',
    length: 'regular',
    sleeves: undefined, // Not applicable for bottoms
    style: 'casual',
    rise: 'mid rise',
    neckline: undefined, // Not applicable for bottoms
    heelHeight: undefined, // Not applicable for bottoms
    bootHeight: undefined, // Not applicable for bottoms
    type: undefined, // Not applicable for jeans
    season: ['winter', 'spring/fall'],
    scenarios: ['office_work', 'social_outings'],
    wishlist: false,
    imageUrl: 'https://example.com/jeans.jpg',
    tags: { wash: 'dark', fit: 'slim' }
  };

  const COMPLETE_FOOTWEAR_ITEM = {
    name: 'Complete Footwear Item',
    category: 'footwear',
    subcategory: 'boots',
    color: 'black',
    pattern: 'solid',
    material: 'leather',
    brand: 'Boot Brand',
    silhouette: 'ankle',
    length: undefined, // Not applicable for footwear
    sleeves: undefined, // Not applicable for footwear
    style: 'elegant',
    rise: undefined, // Not applicable for footwear
    neckline: undefined, // Not applicable for footwear
    heelHeight: 'low heel',
    bootHeight: 'ankle',
    type: 'dress boots',
    season: ['winter', 'spring/fall'],
    scenarios: ['office_work', 'social_outings'],
    wishlist: true,
    imageUrl: 'https://example.com/boots.jpg',
    tags: { heel: 'low', style: 'dressy' }
  };

  beforeEach(() => {
    global.usingMongoDB = false;
    global.inMemoryWardrobeItems = [];
    app = createTestApp();
  });

  describe('POST /api/wardrobe-items - Complete Field Creation', () => {
    it('should save ALL fields when creating a TOP item', async () => {
      const response = await request(app)
        .post('/api/wardrobe-items')
        .send(COMPLETE_WARDROBE_ITEM);

      expect(response.status).toBe(200);
      
      // Verify EVERY field is saved correctly
      expect(response.body.name).toBe(COMPLETE_WARDROBE_ITEM.name);
      expect(response.body.category).toBe(COMPLETE_WARDROBE_ITEM.category);
      expect(response.body.subcategory).toBe(COMPLETE_WARDROBE_ITEM.subcategory);
      expect(response.body.color).toBe(COMPLETE_WARDROBE_ITEM.color);
      expect(response.body.pattern).toBe(COMPLETE_WARDROBE_ITEM.pattern);
      expect(response.body.material).toBe(COMPLETE_WARDROBE_ITEM.material);
      expect(response.body.brand).toBe(COMPLETE_WARDROBE_ITEM.brand);
      expect(response.body.silhouette).toBe(COMPLETE_WARDROBE_ITEM.silhouette);
      expect(response.body.length).toBe(COMPLETE_WARDROBE_ITEM.length);
      
      // 🔴 CRITICAL: These fields were missing in createWardrobeItem function
      expect(response.body.sleeves).toBe(COMPLETE_WARDROBE_ITEM.sleeves);
      expect(response.body.style).toBe(COMPLETE_WARDROBE_ITEM.style);
      
      expect(response.body.rise).toBe(COMPLETE_WARDROBE_ITEM.rise);
      expect(response.body.neckline).toBe(COMPLETE_WARDROBE_ITEM.neckline);
      expect(response.body.heelHeight).toBe(COMPLETE_WARDROBE_ITEM.heelHeight);
      expect(response.body.bootHeight).toBe(COMPLETE_WARDROBE_ITEM.bootHeight);
      expect(response.body.type).toBe(COMPLETE_WARDROBE_ITEM.type);
      expect(response.body.season).toEqual(COMPLETE_WARDROBE_ITEM.season);
      expect(response.body.scenarios).toEqual(COMPLETE_WARDROBE_ITEM.scenarios);
      expect(response.body.wishlist).toBe(COMPLETE_WARDROBE_ITEM.wishlist);
      expect(response.body.imageUrl).toBe(COMPLETE_WARDROBE_ITEM.imageUrl);
      expect(response.body.tags).toEqual(COMPLETE_WARDROBE_ITEM.tags);
      
      // Verify auto-generated fields
      expect(response.body.id).toBeDefined();
      expect(response.body.userId).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(response.body.dateAdded).toBeDefined();
    });

    it('should save ALL fields when creating a BOTTOM item', async () => {
      const response = await request(app)
        .post('/api/wardrobe-items')
        .send(COMPLETE_BOTTOM_ITEM);

      expect(response.status).toBe(200);
      
      // Test category-specific fields
      expect(response.body.category).toBe('bottom');
      expect(response.body.rise).toBe(COMPLETE_BOTTOM_ITEM.rise); // Important for bottoms
      expect(response.body.sleeves).toBe(COMPLETE_BOTTOM_ITEM.sleeves); // Should be undefined for bottoms
      expect(response.body.style).toBe(COMPLETE_BOTTOM_ITEM.style);
    });

    it('should save ALL fields when creating a FOOTWEAR item', async () => {
      const response = await request(app)
        .post('/api/wardrobe-items')
        .send(COMPLETE_FOOTWEAR_ITEM);

      expect(response.status).toBe(200);
      
      // Test footwear-specific fields
      expect(response.body.category).toBe('footwear');
      expect(response.body.heelHeight).toBe(COMPLETE_FOOTWEAR_ITEM.heelHeight);
      expect(response.body.bootHeight).toBe(COMPLETE_FOOTWEAR_ITEM.bootHeight);
      expect(response.body.type).toBe(COMPLETE_FOOTWEAR_ITEM.type);
      expect(response.body.style).toBe(COMPLETE_FOOTWEAR_ITEM.style);
      expect(response.body.sleeves).toBe(COMPLETE_FOOTWEAR_ITEM.sleeves); // Should be undefined
    });

    it('should handle undefined/null fields correctly', async () => {
      const itemWithNulls = {
        ...COMPLETE_WARDROBE_ITEM,
        pattern: undefined,
        material: null,
        brand: '',
        rise: undefined,
        heelHeight: undefined
      };

      const response = await request(app)
        .post('/api/wardrobe-items')
        .send(itemWithNulls);

      expect(response.status).toBe(200);
      expect(response.body.pattern).toBeUndefined();
      expect(response.body.material).toBeNull();
      expect(response.body.brand).toBe('');
      expect(response.body.rise).toBeUndefined();
      expect(response.body.heelHeight).toBeUndefined();
      
      // Critical fields should still be saved
      expect(response.body.sleeves).toBe(COMPLETE_WARDROBE_ITEM.sleeves);
      expect(response.body.style).toBe(COMPLETE_WARDROBE_ITEM.style);
    });
  });

  describe('PUT /api/wardrobe-items/:id - Complete Field Updates', () => {
    it('should update ALL fields in a TOP item', async () => {
      // First create an item
      const createResponse = await request(app)
        .post('/api/wardrobe-items')
        .send(COMPLETE_WARDROBE_ITEM);
      
      const itemId = createResponse.body.id;

      // Update with ALL fields changed
      const updatedData = {
        name: 'Updated Complete Item',
        category: 'top', // Keep same category
        subcategory: 'blouse',
        color: 'burgundy',
        pattern: 'floral',
        material: 'silk',
        brand: 'New Brand',
        silhouette: 'fitted',
        length: 'cropped',
        sleeves: 'long sleeves', // 🔴 CRITICAL: This was missing in PUT route
        style: 'elegant',       // 🔴 CRITICAL: This was missing in PUT route
        neckline: 'v-neck',
        season: ['winter'],
        scenarios: ['office_work'],
        wishlist: true,
        imageUrl: 'https://example.com/updated-image.jpg',
        tags: { updated: 'true', fit: 'fitted' }
      };

      const response = await request(app)
        .put(`/api/wardrobe-items/${itemId}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      
      // Verify EVERY field was updated correctly
      expect(response.body.name).toBe(updatedData.name);
      expect(response.body.subcategory).toBe(updatedData.subcategory);
      expect(response.body.color).toBe(updatedData.color);
      expect(response.body.pattern).toBe(updatedData.pattern);
      expect(response.body.material).toBe(updatedData.material);
      expect(response.body.brand).toBe(updatedData.brand);
      expect(response.body.silhouette).toBe(updatedData.silhouette);
      expect(response.body.length).toBe(updatedData.length);
      
      // 🔴 THESE WERE THE MISSING FIELDS - CRITICAL TEST
      expect(response.body.sleeves).toBe(updatedData.sleeves);
      expect(response.body.style).toBe(updatedData.style);
      
      expect(response.body.neckline).toBe(updatedData.neckline);
      expect(response.body.season).toEqual(updatedData.season);
      expect(response.body.scenarios).toEqual(updatedData.scenarios);
      expect(response.body.wishlist).toBe(updatedData.wishlist);
      expect(response.body.imageUrl).toBe(updatedData.imageUrl);
      expect(response.body.tags).toEqual(updatedData.tags);
      
      // ID and userId should remain unchanged
      expect(response.body.id).toBe(itemId);
      expect(response.body.userId).toBe('123e4567-e89b-12d3-a456-426614174000');
    });

    it('should update only specified fields and preserve others', async () => {
      // Create initial item
      const createResponse = await request(app)
        .post('/api/wardrobe-items')
        .send(COMPLETE_WARDROBE_ITEM);
      
      const itemId = createResponse.body.id;

      // Update only sleeves and style (the problematic fields)
      const partialUpdate = {
        sleeves: 'long sleeves',
        style: 'elegant'
      };

      const response = await request(app)
        .put(`/api/wardrobe-items/${itemId}`)
        .send(partialUpdate);

      expect(response.status).toBe(200);
      
      // Updated fields
      expect(response.body.sleeves).toBe('long sleeves');
      expect(response.body.style).toBe('elegant');
      
      // Preserved fields
      expect(response.body.name).toBe(COMPLETE_WARDROBE_ITEM.name);
      expect(response.body.color).toBe(COMPLETE_WARDROBE_ITEM.color);
      expect(response.body.category).toBe(COMPLETE_WARDROBE_ITEM.category);
      expect(response.body.subcategory).toBe(COMPLETE_WARDROBE_ITEM.subcategory);
      expect(response.body.neckline).toBe(COMPLETE_WARDROBE_ITEM.neckline);
    });

    it('should handle mixed undefined/defined field updates', async () => {
      // Create initial item
      const createResponse = await request(app)
        .post('/api/wardrobe-items')
        .send(COMPLETE_WARDROBE_ITEM);
      
      const itemId = createResponse.body.id;

      // Update with mix of defined and undefined values
      const mixedUpdate = {
        sleeves: undefined, // Clear this field
        style: 'sport',     // Update this field
        color: 'red',       // Update this field
        pattern: undefined  // Clear this field
      };

      const response = await request(app)
        .put(`/api/wardrobe-items/${itemId}`)
        .send(mixedUpdate);

      expect(response.status).toBe(200);
      
      // Updated fields
      expect(response.body.style).toBe('sport');
      expect(response.body.color).toBe('red');
      
      // Fields sent as undefined should preserve original values (current API behavior)
      expect(response.body.sleeves).toBe(COMPLETE_WARDROBE_ITEM.sleeves);
      expect(response.body.pattern).toBe(COMPLETE_WARDROBE_ITEM.pattern);
      
      // Preserved fields
      expect(response.body.name).toBe(COMPLETE_WARDROBE_ITEM.name);
      expect(response.body.neckline).toBe(COMPLETE_WARDROBE_ITEM.neckline);
    });
  });

  describe('Field Regression Prevention', () => {
    it('should fail if createWardrobeItem function drops fields', async () => {
      // This test will catch if someone accidentally removes fields from createWardrobeItem
      const response = await request(app)
        .post('/api/wardrobe-items')
        .send(COMPLETE_WARDROBE_ITEM);

      expect(response.status).toBe(200);
      
      // Get all expected field names from our test data
      const expectedFields = Object.keys(COMPLETE_WARDROBE_ITEM);
      const actualFields = Object.keys(response.body);
      
      // Check that critical fields that should always be present exist in response
      const alwaysPresentFields = ['sleeves', 'style', 'neckline', 'pattern', 'silhouette', 'length'];
      const categorySpecificFields = ['rise', 'heelHeight', 'bootHeight', 'type']; // These may be undefined for some categories
      
      alwaysPresentFields.forEach(field => {
        expect(actualFields).toContain(field);
      });
      
      // Category-specific fields may not be present in JSON response if they were undefined
      // This is normal behavior - JSON.stringify removes undefined values
      // The important thing is that the always-present fields are there
      
      // The response should have AT LEAST the defined fields we sent, plus auto-generated ones
      const autoGeneratedFields = ['id', 'userId', 'dateAdded'];
      
      // Only check for fields that were not undefined in our test data
      const definedFields = expectedFields.filter(field => COMPLETE_WARDROBE_ITEM[field] !== undefined);
      const minExpectedFields = [...definedFields, ...autoGeneratedFields];
      
      minExpectedFields.forEach(field => {
        expect(response.body).toHaveProperty(field);
      });
    });

    it('should fail if PUT route drops field handling', async () => {
      // Create item first
      const createResponse = await request(app)
        .post('/api/wardrobe-items')
        .send(COMPLETE_WARDROBE_ITEM);
      
      const itemId = createResponse.body.id;

      // Try to update all updateable fields
      const allFieldUpdate = {
        name: 'All Fields Updated',
        subcategory: 'updated-subcategory',
        color: 'updated-color',
        pattern: 'updated-pattern',
        material: 'updated-material',
        brand: 'updated-brand',
        silhouette: 'updated-silhouette',
        length: 'updated-length',
        sleeves: 'updated-sleeves',
        style: 'updated-style',
        rise: 'updated-rise',
        neckline: 'updated-neckline',
        heelHeight: 'updated-heel',
        bootHeight: 'updated-boot',
        type: 'updated-type',
        season: ['updated-season'],
        scenarios: ['updated-scenario'],
        wishlist: true,
        imageUrl: 'updated-url',
        tags: { updated: 'all-fields' }
      };

      const response = await request(app)
        .put(`/api/wardrobe-items/${itemId}`)
        .send(allFieldUpdate);

      expect(response.status).toBe(200);
      
      // Every field we tried to update should be reflected in the response
      Object.keys(allFieldUpdate).forEach(field => {
        expect(response.body[field]).toEqual(allFieldUpdate[field]);
      });
    });
  });

  describe('Category-Specific Field Tests', () => {
    const testCases = [
      {
        category: 'top',
        requiredFields: ['sleeves', 'style', 'neckline'],
        optionalFields: ['length', 'silhouette'],
        inapplicableFields: ['rise', 'heelHeight', 'bootHeight']
      },
      {
        category: 'bottom', 
        requiredFields: ['style', 'rise'],
        optionalFields: ['length', 'silhouette'],
        inapplicableFields: ['sleeves', 'neckline', 'heelHeight', 'bootHeight']
      },
      {
        category: 'footwear',
        requiredFields: ['style', 'type'],
        optionalFields: ['heelHeight', 'bootHeight'],
        inapplicableFields: ['sleeves', 'neckline', 'rise', 'length']
      }
    ];

    testCases.forEach(({ category, requiredFields, optionalFields, inapplicableFields }) => {
      it(`should handle ${category.toUpperCase()} category fields correctly`, async () => {
        const categoryItem = {
          name: `Test ${category}`,
          category,
          subcategory: 'test-sub',
          color: 'test-color',
          season: ['summer'],
          // Add all possible fields
          sleeves: 'short sleeves',
          style: 'casual',
          neckline: 'crew neck',
          rise: 'mid rise',
          heelHeight: 'low heel',
          bootHeight: 'ankle',
          type: 'test-type',
          length: 'regular',
          silhouette: 'fitted'
        };

        const response = await request(app)
          .post('/api/wardrobe-items')
          .send(categoryItem);

        expect(response.status).toBe(200);
        expect(response.body.category).toBe(category);
        
        // All fields should be saved regardless of applicability
        // (Frontend logic determines what to show, backend stores everything)
        requiredFields.forEach(field => {
          expect(response.body[field]).toBe(categoryItem[field]);
        });
        
        optionalFields.forEach(field => {
          expect(response.body[field]).toBe(categoryItem[field]);
        });
        
        // Even "inapplicable" fields should be stored if sent
        inapplicableFields.forEach(field => {
          expect(response.body[field]).toBe(categoryItem[field]);
        });
      });
    });
  });
});
