// Unit tests for wardrobe item business logic
// Testing validation, data processing, and core functionality

describe('Wardrobe Item Processing Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Data Validation', () => {
    it('should validate required fields', () => {
      const validateWardrobeItem = (item) => {
        const required = ['name', 'category', 'color'];
        const missing = required.filter(field => !item[field]);
        return { isValid: missing.length === 0, missing };
      };

      const validItem = { name: 'T-Shirt', category: 'top', color: 'blue' };
      const invalidItem = { name: 'T-Shirt', color: 'blue' }; // missing category

      expect(validateWardrobeItem(validItem).isValid).toBe(true);
      expect(validateWardrobeItem(invalidItem).isValid).toBe(false);
      expect(validateWardrobeItem(invalidItem).missing).toContain('category');
    });

    it('should handle season data parsing', () => {
      const parseSeasonData = (seasonInput) => {
        if (!seasonInput) return ['ALL_SEASON'];
        
        if (typeof seasonInput === 'string') {
          try {
            return JSON.parse(seasonInput);
          } catch (err) {
            return ['ALL_SEASON'];
          }
        }
        
        return Array.isArray(seasonInput) ? seasonInput : ['ALL_SEASON'];
      };

      expect(parseSeasonData('["summer", "winter"]')).toEqual(['summer', 'winter']);
      expect(parseSeasonData('invalid-json')).toEqual(['ALL_SEASON']);
      expect(parseSeasonData(['spring'])).toEqual(['spring']);
      expect(parseSeasonData(null)).toEqual(['ALL_SEASON']);
    });

    it('should process wishlist status correctly', () => {
      const processWishlistStatus = (wishlist) => {
        if (typeof wishlist === 'string') {
          return wishlist.toLowerCase() === 'true';
        }
        return Boolean(wishlist);
      };

      expect(processWishlistStatus('true')).toBe(true);
      expect(processWishlistStatus('false')).toBe(false);
      expect(processWishlistStatus(true)).toBe(true);
      expect(processWishlistStatus(false)).toBe(false);
      expect(processWishlistStatus('')).toBe(false);
    });
  });

  describe('Image Processing', () => {
    it('should detect base64 image format', () => {
      const isBase64Image = (imageUrl) => {
        return imageUrl ? imageUrl.startsWith('data:image') : false;
      };

      expect(isBase64Image('data:image/jpeg;base64,/9j/4AAQ...')).toBe(true);
      expect(isBase64Image('http://example.com/image.jpg')).toBe(false);
      expect(isBase64Image(null)).toBe(false);
    });

    it('should extract base64 image data', () => {
      const extractBase64Data = (dataUrl) => {
        const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
          return null;
        }
        return {
          contentType: matches[1],
          base64Data: matches[2]
        };
      };

      const validDataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD';
      const result = extractBase64Data(validDataUrl);
      
      expect(result).toBeTruthy();
      expect(result.contentType).toBe('image/jpeg');
      expect(result.base64Data).toBe('/9j/4AAQSkZJRgABAQEASABIAAD');

      expect(extractBase64Data('invalid-format')).toBeNull();
    });

    it('should generate unique filenames', () => {
      const generateFilename = (contentType) => {
        const timestamp = Date.now();
        const random = Math.round(Math.random() * 1E9);
        const extension = contentType ? contentType.split('/')[1] || 'jpg' : 'jpg';
        return `image-${timestamp}-${random}.${extension}`;
      };

      const filename1 = generateFilename('image/jpeg');
      const filename2 = generateFilename('image/png');
      const filename3 = generateFilename('image/jpeg');

      expect(filename1).toMatch(/^image-\d+-\d+\.jpeg$/);
      expect(filename2).toMatch(/^image-\d+-\d+\.png$/);
      expect(filename1).not.toBe(filename3); // Should be unique
    });
  });

  describe('User Filtering', () => {
    it('should filter items by user in memory storage', () => {
      const items = [
        { id: '1', name: 'Item 1', user: 'user123' },
        { id: '2', name: 'Item 2', user: 'user456' },
        { id: '3', name: 'Item 3', user: 'user123' }
      ];

      const filterByUser = (items, userId) => {
        return items.filter(item => item.user === userId);
      };

      const user123Items = filterByUser(items, 'user123');
      expect(user123Items).toHaveLength(2);
      expect(user123Items.every(item => item.user === 'user123')).toBe(true);
    });

    it('should sort items by date added', () => {
      const items = [
        { id: '1', name: 'Old Item', dateAdded: new Date('2023-01-01') },
        { id: '2', name: 'New Item', dateAdded: new Date('2024-01-01') },
        { id: '3', name: 'Middle Item', dateAdded: new Date('2023-06-01') }
      ];

      const sortByDateAdded = (items, descending = true) => {
        return items.sort((a, b) => {
          const dateA = new Date(a.dateAdded);
          const dateB = new Date(b.dateAdded);
          return descending ? dateB - dateA : dateA - dateB;
        });
      };

      const sorted = sortByDateAdded([...items]);
      expect(sorted[0].name).toBe('New Item');
      expect(sorted[2].name).toBe('Old Item');
    });
  });

  describe('Data Sanitization', () => {
    it('should handle special characters in item names', () => {
      const sanitizeName = (name) => {
        // In a real app, you might want to sanitize or validate
        // For now, just trim whitespace
        return name ? name.trim() : '';
      };

      expect(sanitizeName('  T-Shirt & Jeans (100%)  ')).toBe('T-Shirt & Jeans (100%)');
      expect(sanitizeName('')).toBe('');
      expect(sanitizeName(null)).toBe('');
    });

    it('should handle very long names', () => {
      const validateNameLength = (name, maxLength = 200) => {
        return {
          isValid: name && name.length <= maxLength,
          truncated: name ? name.substring(0, maxLength) : ''
        };
      };

      const longName = 'A'.repeat(300);
      const result = validateNameLength(longName, 200);
      
      expect(result.isValid).toBe(false);
      expect(result.truncated).toHaveLength(200);
    });
  });

  describe('Item Creation Flow', () => {
    it('should process complete item data correctly', () => {
      const createItemData = (input) => {
        const processed = {
          name: input.name?.trim() || '',
          category: input.category || '',
          color: input.color || '',
          season: input.season || ['ALL_SEASON'],
          wishlist: input.wishlist ? Boolean(input.wishlist) : false,
          user: input.user || '',
          dateAdded: new Date().toISOString()
        };

        // Parse season if it's a string
        if (typeof processed.season === 'string') {
          try {
            processed.season = JSON.parse(processed.season);
          } catch (err) {
            processed.season = ['ALL_SEASON'];
          }
        }

        return processed;
      };

      const input = {
        name: '  Test T-Shirt  ',
        category: 'top',
        color: 'blue',
        season: '["summer", "spring/fall"]',
        wishlist: 'true',
        user: 'user123'
      };

      const result = createItemData(input);
      
      expect(result.name).toBe('Test T-Shirt');
      expect(result.category).toBe('top');
      expect(result.season).toEqual(['summer', 'spring/fall']);
      expect(result.wishlist).toBe(true);
      expect(result.user).toBe('user123');
      expect(result.dateAdded).toBeTruthy();
    });
  });
});
