import { useState } from 'react';
import { WardrobeItem, ItemCategory, Season } from '../../../../../../types';

interface FormErrors {
  [key: string]: string;
}

export interface WardrobeItemFormData {
  name: string;
  category: ItemCategory | '';
  subcategory: string;
  color: string;
  material: string;
  brand: string;
  size: string;
  price: string;
  seasons: Season[];
  isWishlistItem: boolean;
  imageUrl: string;
}

interface UseWardrobeItemFormProps {
  initialItem?: Partial<WardrobeItem>;
  defaultWishlist?: boolean;
}

export const useWardrobeItemForm = ({ initialItem, defaultWishlist = false }: UseWardrobeItemFormProps = {}) => {
  // Form state
  const [name, setName] = useState(initialItem?.name || '');
  const [category, setCategory] = useState<ItemCategory | ''>(initialItem?.category || '');
  const [subcategory, setSubcategory] = useState(initialItem?.subcategory || '');
  const [color, setColor] = useState(initialItem?.color || '');
  const [material, setMaterial] = useState(initialItem?.material || '');
  const [brand, setBrand] = useState(initialItem?.brand || '');
  const [size, setSize] = useState(initialItem?.size || '');
  const [price, setPrice] = useState(initialItem?.price?.toString() || '');
  const [seasons, setSeasons] = useState<Season[]>(initialItem?.season || []);
  const [isWishlistItem, setIsWishlistItem] = useState(initialItem?.wishlist ?? defaultWishlist);
  const [imageUrl, setImageUrl] = useState(initialItem?.imageUrl || '');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Season toggle handler
  const toggleSeason = (season: Season) => {
    setSeasons(prev => 
      prev.includes(season) 
        ? prev.filter(s => s !== season)
        : [...prev, season]
    );
  };

  // Validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!category) {
      newErrors.category = 'Category is required';
    }

    if (!color.trim()) {
      newErrors.color = 'Color is required';
    }



    if (seasons.length === 0) {
      newErrors.seasons = 'At least one season must be selected';
    }

    if (!imageUrl && !initialItem?.imageUrl) {
      newErrors.image = 'An image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Auto-generate name if empty
  const generateAutoName = (): string => {
    if (name.trim()) return name.trim();
    
    if (color && category) {
      const capitalizedColor = color.charAt(0).toUpperCase() + color.slice(1);
      const formattedCategory = formatCategoryName(category as ItemCategory);
      return `${capitalizedColor} ${formattedCategory}`;
    }
    
    return '';
  };

  // Get form data
  const getFormData = (): WardrobeItemFormData => {
    return {
      name: name.trim() || generateAutoName(),
      category,
      subcategory,
      color,
      material,
      brand,
      size,
      price,
      seasons,
      isWishlistItem,
      imageUrl
    };
  };

  // Reset form
  const resetForm = () => {
    setName('');
    setCategory('');
    setSubcategory('');
    setColor('');
    setMaterial('');
    setSeasons([]);
    setIsWishlistItem(false);
    setImageUrl('');
    setErrors({});
    setIsSubmitting(false);
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Submit form logic here
    }
  };

  return {
    name,
    setName,
    category,
    setCategory,
    subcategory,
    setSubcategory,
    color,
    setColor,
    material,
    setMaterial,
    brand,
    setBrand,
    size,
    setSize,
    price,
    setPrice,
    seasons,
    toggleSeason,
    isWishlistItem,
    setIsWishlistItem,
    imageUrl,
    setImageUrl,
    errors,
    setErrors,
    isSubmitting,
    setIsSubmitting,
    handleSubmit,
    getFormData,
    validateForm,
    resetForm
  };
};

// Helper function to format category names for display
const formatCategoryName = (category: ItemCategory): string => {
  switch (category) {
    case ItemCategory.TOP:
      return 'Top';
    case ItemCategory.BOTTOM:
      return 'Bottom';
    case ItemCategory.ONE_PIECE:
      return 'One Piece';
    case ItemCategory.OUTERWEAR:
      return 'Outerwear';
    case ItemCategory.FOOTWEAR:
      return 'Footwear';
    case ItemCategory.ACCESSORY:
      return 'Accessory';
    case ItemCategory.OTHER:
      return 'Other';
    default:
      return 'Other';
  }
};
