import { addWardrobeItem, getWardrobeItem, getWardrobeItems, updateWardrobeItem, deleteWardrobeItem } from '../../services/wardrobe/items/itemCrudService';
import { WardrobeItem, Season, WishlistStatus, ItemCategory } from '../../types';
import { supabase } from '../../services/core';
import * as itemBaseService from '../../services/wardrobe/items/itemBaseService';

// Mock supabase - we'll set it up properly in beforeEach
jest.mock('../../services/core', () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      getUser: jest.fn(() => Promise.resolve({
        data: { user: { id: 'user123' } },
        error: null
      }))
    }
  }
}));

// Mock the coverage trigger functions
jest.mock('../../services/wardrobe/scenarioCoverage', () => ({
  triggerItemAddedCoverage: jest.fn(),
  triggerItemUpdatedCoverage: jest.fn(),
  triggerItemDeletedCoverage: jest.fn()
}));

// Mock the scenario relations service
jest.mock('../../services/wardrobe/items/itemRelationsService', () => ({
  replaceItemScenarios: jest.fn(),
  getItemScenarios: jest.fn(() => Promise.resolve([])),
  getBatchItemScenarios: jest.fn(() => Promise.resolve(new Map()))
}));

// Mock the itemBaseService (for getCurrentUserId)
jest.mock('../../services/wardrobe/items/itemBaseService', () => ({
  getCurrentUserId: jest.fn().mockResolvedValue('user123'),
  snakeToCamelCase: jest.fn((obj) => obj),
  camelToSnakeCase: jest.fn((obj) => obj),
  handleSupabaseError: jest.fn(),
  convertToWardrobeItem: jest.fn((dbItem) => {
    if (!dbItem) return null;
    // Convert from snake_case database format to camelCase
    return { 
      id: dbItem.id || '1',
      name: dbItem.name || 'Test Item',
      category: dbItem.category || 'top',
      subcategory: dbItem.subcategory || 'test',
      color: dbItem.color,
      brand: dbItem.brand,
      userId: dbItem.user_id || 'user123',
      dateAdded: dbItem.created_at || '2024-01-01T00:00:00Z',
      isActive: dbItem.is_active !== false,
      wishlist: dbItem.wishlist || false,
      wishlistStatus: dbItem.wishlist_status || 'not_reviewed',
      scenarios: [] // Will be populated later
    };
  }),
  convertToWardrobeItems: jest.fn((dbItems) => {
    if (!dbItems || !Array.isArray(dbItems)) return [];
    return dbItems.map(dbItem => ({
      id: dbItem.id || '1',
      name: dbItem.name || 'Test Item',
      category: dbItem.category || 'top',
      subcategory: dbItem.subcategory || 'test',
      color: dbItem.color,
      brand: dbItem.brand,
      season: dbItem.season || ['summer'],
      userId: dbItem.user_id || 'user123',
      dateAdded: dbItem.created_at || '2024-01-01T00:00:00Z',
      isActive: dbItem.is_active !== false,
      wishlist: dbItem.wishlist || false,
      wishlistStatus: dbItem.wishlist_status || 'not_reviewed',
      scenarios: []
    }));
  }),
  TABLE_NAME: 'wardrobe_items',
  WARDROBE_ITEM_SCENARIOS_TABLE: 'wardrobe_item_scenarios'
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('itemCrudService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock getCurrentUserId to return a test user ID
    jest.spyOn(itemBaseService, 'getCurrentUserId').mockResolvedValue('user123');
    
    // Mock convertToWardrobeItem
    jest.spyOn(itemBaseService, 'convertToWardrobeItem').mockImplementation((dbItem) => {
      if (!dbItem) return null;
      return {
        id: dbItem.id || '1',
        name: dbItem.name || 'Test Item',
        category: dbItem.category || 'top',
        subcategory: dbItem.subcategory || 'test',
        color: dbItem.color,
        brand: dbItem.brand,
        season: dbItem.season || ['summer'],
        userId: dbItem.user_id || 'user123',
        dateAdded: dbItem.created_at || '2024-01-01T00:00:00Z',
        isActive: dbItem.is_active !== false,
        wishlist: dbItem.wishlist || false,
        wishlistStatus: dbItem.wishlist_status || 'not_reviewed',
        scenarios: []
      };
    });
    
    // Mock convertToWardrobeItems (for arrays)
    jest.spyOn(itemBaseService, 'convertToWardrobeItems').mockImplementation((dbItems) => {
      if (!dbItems || !Array.isArray(dbItems)) return [];
      return dbItems.map(dbItem => ({
        id: dbItem.id || '1',
        name: dbItem.name || 'Test Item',
        category: dbItem.category || 'top',
        subcategory: dbItem.subcategory || 'test',
        color: dbItem.color,
        brand: dbItem.brand,
        season: dbItem.season || ['summer'],
        userId: dbItem.user_id || 'user123',
        dateAdded: dbItem.created_at || '2024-01-01T00:00:00Z',
        isActive: dbItem.is_active !== false,
        wishlist: dbItem.wishlist || false,
        wishlistStatus: dbItem.wishlist_status || 'not_reviewed',
        scenarios: []
      }));
    });
    
    // Mock getBatchItemScenarios to return a proper Map
    const { getBatchItemScenarios } = require('../../services/wardrobe/items/itemRelationsService');
    (getBatchItemScenarios as jest.Mock).mockResolvedValue(new Map());
    
    // Reset and reconfigure the supabase mock completely
    (mockSupabase.from as jest.Mock).mockClear();
    (mockSupabase.from as jest.Mock).mockImplementation(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => Promise.resolve({ 
          data: [{ 
            id: '1', name: 'Test Item', category: 'top', 
            user_id: 'user123', created_at: '2024-01-01T00:00:00Z'
          }], 
          error: null 
        }))
      })),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ 
            data: { id: '1', name: 'Test Item', category: 'top' }, 
            error: null 
          }))
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => Promise.resolve({ 
            data: [{ id: '1', name: 'Updated Item', category: 'top' }], 
            error: null 
          }))
        }))
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: [], error: null }))
      }))
    }));
  });

  describe('addWardrobeItem', () => {
    const mockItemData: Partial<WardrobeItem> = {
      name: 'Test Item',
      category: ItemCategory.TOP,
      subcategory: 'T-shirt',
      color: 'blue',
      brand: 'Test Brand'
    };

    it('should add a wardrobe item successfully', async () => {
      const mockCreatedItem = {
        id: '123',
        name: 'Test Item',
        category: 'top',
        subcategory: 't-shirt',
        color: 'blue',
        brand: 'Test Brand',
        user_id: 'user123',
        season: ['summer', 'winter', 'spring/fall'],
        wishlist: false,
        date_added: '2024-01-01T00:00:00.000Z'
      };

      (mockSupabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: [mockCreatedItem],
            error: null
          })
        })
      });

      const result = await addWardrobeItem(mockItemData);

      expect(result).toBeDefined();
      expect(result?.name).toBe('Test Item');
      expect(result?.category).toBe('top');
      expect(mockSupabase.from).toHaveBeenCalledWith('wardrobe_items');
    });

    it('should set default seasons when none provided', async () => {
      const itemWithoutSeasons: Partial<WardrobeItem> = {
        ...mockItemData,
        season: []
      };

      const mockCreatedItem = {
        id: '123',
        name: 'Test Item',
        user_id: 'user123',
        season: ['summer', 'winter', 'spring/fall']
      };

      (mockSupabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: [mockCreatedItem],
            error: null
          })
        })
      });

      await addWardrobeItem(itemWithoutSeasons);

      const insertCall = (mockSupabase.from as jest.Mock).mock.results[0].value.insert.mock.calls[0][0][0];
      expect(insertCall.season).toEqual(['summer', 'winter', 'spring/fall']);
    });

    it('should set wishlist status for wishlist items', async () => {
      const wishlistItem: Partial<WardrobeItem> = {
        ...mockItemData,
        wishlist: true
      };

      const mockCreatedItem = {
        id: '123',
        wishlist: true,
        wishlist_status: 'not_reviewed',
        user_id: 'user123'
      };

      (mockSupabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: [mockCreatedItem],
            error: null
          })
        })
      });

      const result = await addWardrobeItem(wishlistItem);

      expect(result?.wishlist).toBe(true);
      expect(result?.wishlistStatus).toBe(WishlistStatus.NOT_REVIEWED);
    });

    it('should handle database errors gracefully', async () => {
      (mockSupabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error' }
          })
        })
      });

      await expect(addWardrobeItem(mockItemData)).rejects.toThrow();
    });

    it('should handle authentication errors', async () => {
      // Mock getCurrentUserId to return null (no authenticated user)
      jest.spyOn(itemBaseService, 'getCurrentUserId').mockResolvedValue(null);

      await expect(addWardrobeItem(mockItemData)).rejects.toThrow('Authentication required to add wardrobe item');
    });
  });

  describe('getWardrobeItem', () => {
    it('should fetch a single wardrobe item', async () => {
      const mockItem = {
        id: '123',
        name: 'Test Item',
        category: 'top',
        user_id: 'user123'
      };

      (mockSupabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockItem,
              error: null
            })
          })
        })
      });

      const result = await getWardrobeItem('123');

      expect(result).toBeDefined();
      expect(result?.id).toBe('123');
      expect(result?.name).toBe('Test Item');
    });

    it('should return null when item not found', async () => {
      (mockSupabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' } // Not found error
            })
          })
        })
      });

      const result = await getWardrobeItem('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getWardrobeItems', () => {
    it('should fetch all items for a user', async () => {
      const mockItems = [
        { id: '1', name: 'Item 1', user_id: 'user123' },
        { id: '2', name: 'Item 2', user_id: 'user123' }
      ];

      (mockSupabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: mockItems,
            error: null
          })
        })
      });

      const result = await getWardrobeItems('user123');

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Item 1');
      expect(result[1].name).toBe('Item 2');
    });

    it('should filter active items only when requested', async () => {
      (mockSupabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: [],
              error: null
            })
          })
        })
      });

      await getWardrobeItems('user123', true);

      // Should have called eq twice: once for user_id, once for active status
      const selectChain = (mockSupabase.from as jest.Mock).mock.results[0].value
        .select.mock.results[0].value
        .eq.mock.results[0].value;
      
      expect(selectChain.eq).toHaveBeenCalled();
    });
  });

  describe('updateWardrobeItem', () => {
    it('should update an item successfully', async () => {
      const mockUpdatedItem = {
        id: '123',
        name: 'Updated Item',
        user_id: 'user123'
      };

      (mockSupabase.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue({
              data: [mockUpdatedItem],
              error: null
            })
          })
        })
      });

      const result = await updateWardrobeItem('123', { name: 'Updated Item' });

      expect(result).toBeDefined();
      expect(result?.name).toBe('Updated Item');
    });
  });

  describe('deleteWardrobeItem', () => {
    it('should delete an item successfully', async () => {
      (mockSupabase.from as jest.Mock).mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [],
            error: null
          })
        })
      });

      const result = await deleteWardrobeItem('123');

      expect(result).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith('wardrobe_items');
    });

    it('should handle delete errors', async () => {
      (mockSupabase.from as jest.Mock).mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Delete failed' }
          })
        })
      });

      await expect(deleteWardrobeItem('123')).rejects.toThrow();
    });
  });

  describe('Edge cases and validation', () => {
    it('should handle malformed season data', async () => {
      const itemWithBadSeason: Partial<WardrobeItem> = {
        name: 'Test Item',
        category: ItemCategory.TOP,
        color: 'blue',
        season: ['invalid-season'] as any
      };

      (mockSupabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: [{ id: '123', user_id: 'user123' }],
            error: null
          })
        })
      });

      await addWardrobeItem(itemWithBadSeason);

      // Should still default to all seasons
      const insertCall = (mockSupabase.from as jest.Mock).mock.results[0].value.insert.mock.calls[0][0][0];
      expect(insertCall.season).toEqual(['summer', 'winter', 'spring/fall']);
    });

    it('should handle items with scenarios', async () => {
      const itemWithScenarios: Partial<WardrobeItem> = {
        name: 'Test Item',
        category: ItemCategory.TOP,
        color: 'blue',
        scenarios: ['Office Work', 'Social Outings']
      };

      (mockSupabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: [{ id: '123', user_id: 'user123' }],
            error: null
          })
        })
      });

      const result = await addWardrobeItem(itemWithScenarios);

      expect(result?.scenarios).toHaveLength(2);
      expect(result?.scenarios?.[0]).toBe('Office Work');
    });
  });
});
