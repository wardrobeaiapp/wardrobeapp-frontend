import React from 'react';
import Button from '../Button';
import {
  FormScreen,
  ScreenTitle,
  FormGroup,
  NavigationButtons,
  ErrorMessage
} from '../WardrobeItemForm.styles';

interface ColorScreenProps {
  color: string;
  setColor: (color: string) => void;
  setCurrentScreen: React.Dispatch<React.SetStateAction<'image' | 'category' | 'subcategory' | 'color' | 'details'>>;
  errors: Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
}

// Define color options
const colorOptions = [
  'Black',
  'White',
  'Gray',
  'Navy',
  'Blue',
  'Red',
  'Green',
  'Yellow',
  'Purple',
  'Pink',
  'Brown',
  'Beige',
  'Orange',
  'Teal',
  'Burgundy',
  'Olive',
  'Other'
];

const ColorScreen: React.FC<ColorScreenProps> = ({
  color,
  setColor,
  setCurrentScreen,
  errors,
  setErrors
}) => {
  return (
    <FormScreen>
      <ScreenTitle>Select Color</ScreenTitle>
      
      <FormGroup>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
          {colorOptions.map(colorOption => (
            <div 
              key={colorOption}
              onClick={() => {
                setColor(colorOption);
                // Clear any color error when a selection is made
                if (errors.color) {
                  setErrors({ ...errors, color: '' });
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
                borderRadius: '8px',
                border: `2px solid ${color === colorOption ? '#6366f1' : '#e0e0e0'}`,
                backgroundColor: color === colorOption ? 'rgba(99, 102, 241, 0.1)' : 'white',
                color: color === colorOption ? '#6366f1' : '#333',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{ fontWeight: 500 }}>
                {colorOption}
              </span>
            </div>
          ))}
        </div>
        {errors.color && <ErrorMessage>{errors.color}</ErrorMessage>}
      </FormGroup>
      
      <NavigationButtons>
        <Button type="button" outlined onClick={() => setCurrentScreen('subcategory')}>
          Back
        </Button>
        <Button 
          type="button" 
          primary 
          onClick={() => {
            // Validate color before proceeding
            if (!color) {
              setErrors({ ...errors, color: 'Color is required' });
            } else {
              setCurrentScreen('details');
            }
          }}
        >
          Next
        </Button>
      </NavigationButtons>
    </FormScreen>
  );
};

export default ColorScreen;
