import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import WardrobeItemForm from '../../components/features/wardrobe/forms/WardrobeItemForm/WardrobeItemForm';
import { ItemCategory, Season } from '../../types';

// Mock the heavy components that are lazy loaded
jest.mock('../../components/features/wardrobe/forms/WardrobeItemForm/components/ImageUploadSection', () => ({
  ImageUploadSection: () => <div data-testid="image-upload">Image Upload</div>
}));

jest.mock('../../components/features/wardrobe/forms/WardrobeItemForm/components/BasicInfoFields', () => ({
  BasicInfoFields: () => <div data-testid="basic-info">Basic Info</div>
}));

jest.mock('../../components/features/wardrobe/forms/WardrobeItemForm/components/DetailsFields', () => ({
  DetailsFields: () => <div data-testid="details-fields">Details Fields</div>
}));

jest.mock('../../components/features/wardrobe/forms/WardrobeItemForm/components/BackgroundRemovalPreview', () => ({
  BackgroundRemovalPreview: () => <div data-testid="bg-removal">Background Removal</div>
}));

jest.mock('../../components/features/wardrobe/forms/WardrobeItemForm/components/FormActions', () => ({
  FormActions: () => <div data-testid="form-actions">Form Actions</div>
}));

// Mock the hooks
jest.mock('../../components/features/wardrobe/forms/WardrobeItemForm/hooks/useTagProcessing', () => ({
  useTagProcessing: () => ({
    processDetectedTags: jest.fn().mockReturnValue({})
  })
}));

jest.mock('../../components/features/wardrobe/forms/WardrobeItemForm/hooks/useImageHandling', () => ({
  useImageHandling: () => ({
    previewImage: 'mock-preview.jpg',
    selectedFile: null,
    detectedTags: {},
    handleDrop: jest.fn(),
    handleDragOver: jest.fn(),
    handleFileSelect: jest.fn(),
    handleUrlLoad: jest.fn(),
    isDownloadingImage: false,
    setPreviewImage: jest.fn(),
    setSelectedFile: jest.fn()
  })
}));

jest.mock('../../components/features/wardrobe/forms/WardrobeItemForm/hooks/useBackgroundRemoval', () => ({
  useBackgroundRemoval: () => ({
    isProcessing: false,
    isUsingProcessedImage: false,
    showPreview: false,
    originalImage: '',
    processedImage: '',
    resetProcessedState: jest.fn(),
    processImage: jest.fn(),
    applyProcessedImage: jest.fn(),
    useOriginal: jest.fn(),
    closePreview: jest.fn()
  })
}));

// Mock the form hook with real implementation but controllable state
const mockFormState = {
  name: 'Test Item',
  category: ItemCategory.TOP,
  subcategory: 't-shirt',
  color: 'navy',
  pattern: 'solid',
  material: 'cotton',
  brand: 'Test Brand',
  price: '25',
  silhouette: 'relaxed',
  length: 'regular',
  sleeves: 'short sleeves',
  style: 'casual',
  rise: '',
  neckline: 'crew neck',
  heelHeight: '',
  bootHeight: '',
  type: '',
  seasons: [Season.SUMMER],
  scenarios: ['staying_at_home'],
  isWishlistItem: false,
  imageUrl: 'test-image.jpg',
  errors: {},
  isSubmitting: false,
  setName: jest.fn(),
  setCategory: jest.fn(),
  setSubcategory: jest.fn(),
  setColor: jest.fn(),
  setPattern: jest.fn(),
  setMaterial: jest.fn(),
  setBrand: jest.fn(),
  setPrice: jest.fn(),
  setSilhouette: jest.fn(),
  setLength: jest.fn(),
  setSleeves: jest.fn(),
  setStyle: jest.fn(),
  setRise: jest.fn(),
  setNeckline: jest.fn(),
  setHeelHeight: jest.fn(),
  setBootHeight: jest.fn(),
  setType: jest.fn(),
  toggleSeason: jest.fn(),
  toggleScenario: jest.fn(),
  setIsWishlistItem: jest.fn(),
  setImageUrl: jest.fn(),
  setDetectedTags: jest.fn(),
  setErrors: jest.fn(),
  validateForm: jest.fn().mockReturnValue(true),
  getFormData: jest.fn()
};

jest.mock('../../components/features/wardrobe/forms/WardrobeItemForm/hooks/useWardrobeItemForm', () => ({
  useWardrobeItemForm: () => mockFormState
}));

describe('WardrobeItemForm - Complete Field Testing', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  const COMPLETE_FORM_DATA = {
    name: 'Complete Test Item',
    category: ItemCategory.TOP,
    subcategory: 't-shirt',
    color: 'navy',
    pattern: 'solid',
    material: 'cotton',
    brand: 'Test Brand',
    price: '25',
    silhouette: 'relaxed',
    length: 'regular',
    sleeves: 'short sleeves',
    style: 'casual',
    rise: undefined,
    neckline: 'crew neck',
    heelHeight: undefined,
    bootHeight: undefined,
    type: undefined,
    seasons: [Season.SUMMER],
    scenarios: ['staying_at_home'],
    isWishlistItem: false,
    imageUrl: 'test-image.jpg'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFormState.getFormData.mockReturnValue(COMPLETE_FORM_DATA);
  });

  describe('createWardrobeItem Function - Field Inclusion Tests', () => {
    it('should include ALL fields in created wardrobe item object', async () => {
      render(
        <WardrobeItemForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // Wait for components to load
      await waitFor(() => {
        expect(screen.getByTestId('form-actions')).toBeInTheDocument();
      });

      // Simulate form submission
      const form = screen.getByRole('form');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });

      const submittedItem = mockOnSubmit.mock.calls[0][0];

      // 🔴 CRITICAL: Verify all fields are included in the created item
      expect(submittedItem).toHaveProperty('name', COMPLETE_FORM_DATA.name);
      expect(submittedItem).toHaveProperty('category', COMPLETE_FORM_DATA.category);
      expect(submittedItem).toHaveProperty('subcategory', COMPLETE_FORM_DATA.subcategory);
      expect(submittedItem).toHaveProperty('color', COMPLETE_FORM_DATA.color);
      expect(submittedItem).toHaveProperty('pattern', COMPLETE_FORM_DATA.pattern);
      expect(submittedItem).toHaveProperty('material', COMPLETE_FORM_DATA.material);
      expect(submittedItem).toHaveProperty('brand', COMPLETE_FORM_DATA.brand);
      expect(submittedItem).toHaveProperty('silhouette', COMPLETE_FORM_DATA.silhouette);
      expect(submittedItem).toHaveProperty('length', COMPLETE_FORM_DATA.length);
      
      // 🔴 THE CRITICAL FIELDS THAT WERE MISSING
      expect(submittedItem).toHaveProperty('sleeves', COMPLETE_FORM_DATA.sleeves);
      expect(submittedItem).toHaveProperty('style', COMPLETE_FORM_DATA.style);
      
      expect(submittedItem).toHaveProperty('rise', COMPLETE_FORM_DATA.rise);
      expect(submittedItem).toHaveProperty('neckline', COMPLETE_FORM_DATA.neckline);
      expect(submittedItem).toHaveProperty('heelHeight', COMPLETE_FORM_DATA.heelHeight);
      expect(submittedItem).toHaveProperty('bootHeight', COMPLETE_FORM_DATA.bootHeight);
      expect(submittedItem).toHaveProperty('type', COMPLETE_FORM_DATA.type);
      expect(submittedItem).toHaveProperty('season', COMPLETE_FORM_DATA.seasons);
      expect(submittedItem).toHaveProperty('scenarios', COMPLETE_FORM_DATA.scenarios);
      expect(submittedItem).toHaveProperty('wishlist', COMPLETE_FORM_DATA.isWishlistItem);
      expect(submittedItem).toHaveProperty('imageUrl');
      expect(submittedItem).toHaveProperty('tags');
    });

    it('should handle editing existing item with all fields preserved', async () => {
      const existingItem = {
        id: 'existing-123',
        name: 'Existing Item',
        category: ItemCategory.TOP,
        subcategory: 'blouse',
        color: 'burgundy',
        pattern: 'floral',
        material: 'silk',
        brand: 'Existing Brand',
        silhouette: 'fitted',
        length: 'cropped',
        sleeves: 'long sleeves',
        style: 'elegant',
        neckline: 'v-neck',
        season: [Season.WINTER],
        scenarios: ['office_work'],
        wishlist: true,
        imageUrl: 'existing-image.jpg',
        tags: { existing: 'true' },
        dateAdded: new Date().toISOString()
      };

      render(
        <WardrobeItemForm
          initialItem={existingItem}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('form-actions')).toBeInTheDocument();
      });

      const form = screen.getByRole('form');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });

      const submittedItem = mockOnSubmit.mock.calls[0][0];

      // Should preserve the ID when editing
      expect(submittedItem).toHaveProperty('id', existingItem.id);
      
      // Should include all fields from form data
      expect(submittedItem).toHaveProperty('sleeves');
      expect(submittedItem).toHaveProperty('style');
    });

    it('should handle undefined/null fields correctly', async () => {
      const formDataWithNulls = {
        ...COMPLETE_FORM_DATA,
        pattern: undefined,
        material: null,
        rise: undefined,
        heelHeight: undefined,
        bootHeight: undefined,
        type: undefined
      };

      mockFormState.getFormData.mockReturnValue(formDataWithNulls);

      render(
        <WardrobeItemForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('form-actions')).toBeInTheDocument();
      });

      const form = screen.getByRole('form');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });

      const submittedItem = mockOnSubmit.mock.calls[0][0];

      // Should still have all properties, even if undefined/null
      expect(submittedItem).toHaveProperty('pattern');
      expect(submittedItem).toHaveProperty('material');
      expect(submittedItem).toHaveProperty('rise');
      expect(submittedItem).toHaveProperty('heelHeight');
      expect(submittedItem).toHaveProperty('bootHeight');
      expect(submittedItem).toHaveProperty('type');
      
      // Critical fields should still be present
      expect(submittedItem).toHaveProperty('sleeves');
      expect(submittedItem).toHaveProperty('style');
      
      // Values should match what was in form data
      expect(submittedItem.pattern).toBeUndefined();
      expect(submittedItem.material).toBeNull();
      expect(submittedItem.sleeves).toBe(formDataWithNulls.sleeves);
      expect(submittedItem.style).toBe(formDataWithNulls.style);
    });
  });

  describe('Field Regression Prevention Tests', () => {
    it('should fail if createWardrobeItem function drops critical fields', async () => {
      render(
        <WardrobeItemForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('form-actions')).toBeInTheDocument();
      });

      const form = screen.getByRole('form');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });

      const submittedItem = mockOnSubmit.mock.calls[0][0];
      
      // Define fields that MUST be present to prevent regression
      const criticalFields = [
        'name', 'category', 'subcategory', 'color', 
        'pattern', 'material', 'brand', 'silhouette', 'length',
        'sleeves', 'style', // These were the missing ones!
        'rise', 'neckline', 'heelHeight', 'bootHeight', 'type',
        'season', 'scenarios', 'wishlist', 'imageUrl', 'tags'
      ];

      criticalFields.forEach(field => {
        expect(submittedItem).toHaveProperty(field);
      });
    });

    it('should maintain field count over time', async () => {
      render(
        <WardrobeItemForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('form-actions')).toBeInTheDocument();
      });

      const form = screen.getByRole('form');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });

      const submittedItem = mockOnSubmit.mock.calls[0][0];
      const fieldCount = Object.keys(submittedItem).length;
      
      // Should have at least 21 fields (all the wardrobe item properties)
      // This will catch if someone accidentally removes field mappings
      expect(fieldCount).toBeGreaterThanOrEqual(21);
    });

    it('should preserve field types correctly', async () => {
      render(
        <WardrobeItemForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('form-actions')).toBeInTheDocument();
      });

      const form = screen.getByRole('form');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });

      const submittedItem = mockOnSubmit.mock.calls[0][0];

      // Verify field types are preserved
      expect(typeof submittedItem.name).toBe('string');
      expect(typeof submittedItem.category).toBe('string');
      expect(typeof submittedItem.sleeves).toBe('string');
      expect(typeof submittedItem.style).toBe('string');
      expect(Array.isArray(submittedItem.season)).toBe(true);
      expect(Array.isArray(submittedItem.scenarios)).toBe(true);
      expect(typeof submittedItem.wishlist).toBe('boolean');
      expect(typeof submittedItem.tags).toBe('object');
    });
  });

  describe('Conditional Fields Logic Tests', () => {
    // Add specific test cases for edge cases to improve mocked test coverage
    it('should test outerwear type field inclusion in mocked scenario', async () => {
      // Update mock to return outerwear-specific form data
      const outerwearFormData = {
        ...COMPLETE_FORM_DATA,
        category: ItemCategory.OUTERWEAR,
        subcategory: 'jacket',
        type: 'blazer', // This was the bug - would be undefined in real hook
        seasons: [Season.WINTER]
      };
      
      mockFormState.getFormData.mockReturnValue(outerwearFormData);

      render(
        <WardrobeItemForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('form-actions')).toBeInTheDocument();
      });

      const form = screen.getByRole('form');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });

      const submittedItem = mockOnSubmit.mock.calls[0][0];
      
      // Critical regression test - this should NOT be undefined for outerwear jackets
      expect(submittedItem.type).toBe('blazer');
      expect(submittedItem.category).toBe(ItemCategory.OUTERWEAR);
      expect(submittedItem.subcategory).toBe('jacket');
    });

    it('should verify ALL conditional field scenarios in mocked tests', async () => {
      const conditionalTestCases = [
        {
          name: 'outerwear jacket with type',
          formData: {
            ...COMPLETE_FORM_DATA,
            category: ItemCategory.OUTERWEAR,
            subcategory: 'jacket',
            type: 'blazer',
            length: 'regular'
          },
          expectedFields: { type: 'blazer', length: 'regular' }
        },
        {
          name: 'outerwear coat with type',
          formData: {
            ...COMPLETE_FORM_DATA,
            category: ItemCategory.OUTERWEAR,
            subcategory: 'coat', 
            type: 'trench',
            length: 'long'
          },
          expectedFields: { type: 'trench', length: 'long' }
        },
        {
          name: 'footwear boots with all fields',
          formData: {
            ...COMPLETE_FORM_DATA,
            category: ItemCategory.FOOTWEAR,
            subcategory: 'boots',
            type: 'ankle boots',
            heelHeight: 'medium',
            bootHeight: 'ankle'
          },
          expectedFields: { type: 'ankle boots', heelHeight: 'medium', bootHeight: 'ankle' }
        },
        {
          name: 'accessory bag with type',
          formData: {
            ...COMPLETE_FORM_DATA,
            category: ItemCategory.ACCESSORY,
            subcategory: 'bag',
            type: 'tote',
            style: undefined // Should be undefined for accessories
          },
          expectedFields: { type: 'tote', style: undefined }
        }
      ];

      for (const testCase of conditionalTestCases) {
        mockFormState.getFormData.mockReturnValue(testCase.formData);

        render(
          <WardrobeItemForm
            onSubmit={mockOnSubmit}
            onCancel={mockOnCancel}
          />
        );

        await waitFor(() => {
          expect(screen.getByTestId('form-actions')).toBeInTheDocument();
        });

        const form = screen.getByRole('form');
        fireEvent.submit(form);

        await waitFor(() => {
          expect(mockOnSubmit).toHaveBeenCalled();
        });

        const submittedItem = mockOnSubmit.mock.calls[0][0];
        
        // Verify expected fields for this test case
        Object.entries(testCase.expectedFields).forEach(([field, expectedValue]) => {
          expect(submittedItem[field]).toBe(expectedValue);
        });

        jest.clearAllMocks();
      }
    });
  });

  describe('Category-Specific Field Tests', () => {
    const categoryTestCases = [
      {
        category: ItemCategory.TOP,
        expectedFields: ['sleeves', 'style', 'neckline', 'length'],
        formData: {
          ...COMPLETE_FORM_DATA,
          category: ItemCategory.TOP,
          sleeves: 'long sleeves',
          style: 'elegant',
          neckline: 'v-neck'
        }
      },
      {
        category: ItemCategory.BOTTOM,
        expectedFields: ['style', 'rise', 'length'],
        formData: {
          ...COMPLETE_FORM_DATA,
          category: ItemCategory.BOTTOM,
          style: 'casual',
          rise: 'high rise',
          sleeves: undefined
        }
      },
      {
        category: ItemCategory.FOOTWEAR,
        expectedFields: ['style', 'heelHeight', 'bootHeight', 'type'],
        formData: {
          ...COMPLETE_FORM_DATA,
          category: ItemCategory.FOOTWEAR,
          style: 'elegant',
          heelHeight: 'high heel',
          bootHeight: 'knee high',
          type: 'dress boots',
          sleeves: undefined
        }
      }
    ];

    categoryTestCases.forEach(({ category, expectedFields, formData }) => {
      it(`should handle ${category} category fields correctly`, async () => {
        mockFormState.getFormData.mockReturnValue(formData);

        render(
          <WardrobeItemForm
            onSubmit={mockOnSubmit}
            onCancel={mockOnCancel}
          />
        );

        await waitFor(() => {
          expect(screen.getByTestId('form-actions')).toBeInTheDocument();
        });

        const form = screen.getByRole('form');
        fireEvent.submit(form);

        await waitFor(() => {
          expect(mockOnSubmit).toHaveBeenCalled();
        });

        const submittedItem = mockOnSubmit.mock.calls[0][0];

        // Should have the category
        expect(submittedItem.category).toBe(category);
        
        // Should include all expected fields for this category
        expectedFields.forEach(field => {
          expect(submittedItem).toHaveProperty(field);
        });

        // Critical fields should always be present regardless of category
        expect(submittedItem).toHaveProperty('style');
      });
    });
  });
});
