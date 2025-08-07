import React from 'react';
import { ItemCategory } from '../../types';
import Button from '../Button';
import {
  FormScreen,
  ScreenTitle,
  FormGroup,
  NavigationButtons,
  ErrorMessage
} from '../WardrobeItemForm.styles';

interface SubcategoryScreenProps {
  category: ItemCategory;
  subcategory: string;
  setSubcategory: (subcategory: string) => void;
  setCurrentScreen: React.Dispatch<React.SetStateAction<'image' | 'category' | 'subcategory' | 'color' | 'details'>>;
  errors: Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
}

// Define subcategory options
const subcategoryOptions = {
  [ItemCategory.TOP]: [
    'T-shirt',
    'Blouse',
    'Shirt',
    'Tank top',
    'Sweater',
    'Hoodie',
    'Cardigan',
    'Crop top',
    'Other'
  ],
  [ItemCategory.BOTTOM]: [
    'Jeans',
    'Trousers',
    'Shorts',
    'Skirt',
    'Leggings',
    'Other'
  ],
  [ItemCategory.FOOTWEAR]: [
    'Sneakers',
    'Boots',
    'Flats',
    'Sandals',
    'Heels',
    'Other'
  ],
  [ItemCategory.OUTERWEAR]: [
    'Jacket',
    'Coat',
    'Trench coat',
    'Blazer',
    'Raincoat',
    'Other'
  ],
  [ItemCategory.ONE_PIECE]: [
    'Dress',
    'Jumpsuit',
    'Romper',
    'Other'
  ],
  [ItemCategory.ACCESSORY]: [
    'Jewelry',
    'Bag',
    'Hat',
    'Scarf',
    'Belt',
    'Other'
  ],
  [ItemCategory.OTHER]: [
    'Other'
  ]
};

const SubcategoryScreen: React.FC<SubcategoryScreenProps> = ({
  category,
  subcategory,
  setSubcategory,
  setCurrentScreen,
  errors,
  setErrors
}) => {
  return (
    <FormScreen>
      <ScreenTitle>Select Subcategory</ScreenTitle>
      
      <FormGroup>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
          {subcategoryOptions[category].map(subcat => (
            <div 
              key={subcat}
              onClick={() => {
                setSubcategory(subcat);
                // Clear any subcategory error when a selection is made
                if (errors.subcategory) {
                  setErrors({ ...errors, subcategory: '' });
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
                borderRadius: '8px',
                border: `2px solid ${subcategory === subcat ? '#6366f1' : '#e0e0e0'}`,
                backgroundColor: subcategory === subcat ? 'rgba(99, 102, 241, 0.1)' : 'white',
                color: subcategory === subcat ? '#6366f1' : '#333',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{ fontWeight: 500 }}>
                {subcat}
              </span>
            </div>
          ))}
        </div>
        {errors.subcategory && <ErrorMessage>{errors.subcategory}</ErrorMessage>}
      </FormGroup>
      
      <NavigationButtons>
        <Button type="button" outlined onClick={() => setCurrentScreen('category')}>
          Back
        </Button>
        <Button 
          type="button" 
          primary 
          onClick={() => {
            // Validate subcategory before proceeding
            if (!subcategory) {
              setErrors({ ...errors, subcategory: 'Subcategory is required' });
            } else {
              setCurrentScreen('color');
            }
          }}
        >
          Next
        </Button>
      </NavigationButtons>
    </FormScreen>
  );
};

export default SubcategoryScreen;
