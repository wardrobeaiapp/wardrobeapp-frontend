import React from 'react';
import { ItemCategory } from '../../types';
import Button from '../Button';
import {
  FormScreen,
  ScreenTitle,
  FormGroup,
  NavigationButtons
} from '../WardrobeItemForm.styles';

interface CategoryScreenProps {
  category: ItemCategory;
  setCategory: (category: ItemCategory) => void;
  setCurrentScreen: React.Dispatch<React.SetStateAction<'image' | 'category' | 'subcategory' | 'color' | 'details'>>;
}

const CategoryScreen: React.FC<CategoryScreenProps> = ({
  category,
  setCategory,
  setCurrentScreen
}) => {
  return (
    <FormScreen>
      <ScreenTitle>Select Category</ScreenTitle>
      
      <FormGroup>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
          {Object.values(ItemCategory).map(cat => (
            <div 
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
                borderRadius: '8px',
                border: `2px solid ${category === cat ? '#6366f1' : '#e0e0e0'}`,
                backgroundColor: category === cat ? 'rgba(99, 102, 241, 0.1)' : 'white',
                color: category === cat ? '#6366f1' : '#333',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{ fontWeight: 500 }}>
                {cat.split('_')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ')}
              </span>
            </div>
          ))}
        </div>
      </FormGroup>
      
      <NavigationButtons>
        <Button type="button" outlined onClick={() => setCurrentScreen('image')}>
          Back
        </Button>
        <Button type="button" primary onClick={() => setCurrentScreen('subcategory')}>
          Next
        </Button>
      </NavigationButtons>
    </FormScreen>
  );
};

export default CategoryScreen;
