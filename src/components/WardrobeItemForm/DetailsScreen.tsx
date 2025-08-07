import React from 'react';
import { Season } from '../../types';
import Button from '../Button';
import {
  FormScreen,
  ScreenTitle,
  FormGroup,
  Label,
  Input,
  CheckboxGroup,
  CheckboxLabel,
  NavigationButtons,
  ErrorMessage
} from '../WardrobeItemForm.styles';

interface DetailsScreenProps {
  size: string;
  setSize: (size: string) => void;
  material: string;
  setMaterial: (material: string) => void;
  brand: string;
  setBrand: (brand: string) => void;
  seasons: Season[];
  setSeasons: (seasons: Season[]) => void;
  wishlist?: boolean;
  setWishlist?: (wishlist: boolean) => void;
  setCurrentScreen: React.Dispatch<React.SetStateAction<'image' | 'category' | 'subcategory' | 'color' | 'details'>>;
  errors: Record<string, string>;
  handleSubmit: (e?: React.FormEvent) => void;
}

const DetailsScreen: React.FC<DetailsScreenProps> = ({
  size,
  setSize,
  material,
  setMaterial,
  brand,
  setBrand,
  seasons,
  setSeasons,
  wishlist = false,
  setWishlist = () => {},
  setCurrentScreen,
  errors,
  handleSubmit
}) => {
  const handleSeasonChange = (season: Season) => {
    if (seasons.includes(season)) {
      setSeasons(seasons.filter(s => s !== season));
    } else {
      setSeasons([...seasons, season]);
    }
  };

  return (
    <FormScreen>
      <ScreenTitle>Item Details</ScreenTitle>
      
      <FormGroup>
        <Label htmlFor="size">Size</Label>
        <Input
          id="size"
          type="text"
          value={size}
          onChange={e => setSize(e.target.value)}
          placeholder="e.g., S, M, L, XL, 32, 10"
        />
        {errors.size && <ErrorMessage>{errors.size}</ErrorMessage>}
      </FormGroup>
      
      <FormGroup>
        <Label htmlFor="material">Material</Label>
        <Input
          id="material"
          type="text"
          value={material}
          onChange={e => setMaterial(e.target.value)}
          placeholder="e.g., Cotton, Polyester, Wool"
        />
        {errors.material && <ErrorMessage>{errors.material}</ErrorMessage>}
      </FormGroup>
      
      <FormGroup>
        <Label htmlFor="brand">Brand</Label>
        <Input
          id="brand"
          type="text"
          value={brand}
          onChange={e => setBrand(e.target.value)}
          placeholder="e.g., Nike, Zara, H&M"
        />
      </FormGroup>
      
      <FormGroup>
        <Label>Season *</Label>
        <CheckboxGroup>
          {Object.values(Season)
            .filter(season => season !== Season.ALL_SEASON)
            .map(season => (
              <CheckboxLabel key={season}>
                <input
                  type="checkbox"
                  checked={seasons.includes(season)}
                  onChange={() => handleSeasonChange(season)}
                />
                {season.charAt(0).toUpperCase() + season.slice(1)}
              </CheckboxLabel>
            ))}

        </CheckboxGroup>
        {errors.seasons && <ErrorMessage>{errors.seasons}</ErrorMessage>}
      </FormGroup>
      
      <FormGroup>
        <CheckboxLabel>
          <input
            type="checkbox"
            checked={wishlist}
            onChange={() => setWishlist(!wishlist)}
          />
          Add to Wishlist
        </CheckboxLabel>
      </FormGroup>
      
      <NavigationButtons>
        <Button type="button" outlined onClick={() => setCurrentScreen('color')}>
          Back
        </Button>
        <Button type="submit" primary>
          Save
        </Button>
      </NavigationButtons>
    </FormScreen>
  );
};

export default DetailsScreen;
