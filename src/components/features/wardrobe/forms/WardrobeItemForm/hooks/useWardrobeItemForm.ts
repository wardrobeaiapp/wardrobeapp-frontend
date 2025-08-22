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
  silhouette: string;
  length?: string;
  sleeves?: string;
  style?: string;
  rise?: string;
  seasons: Season[];
  isWishlistItem: boolean;
  imageUrl: string;
  detectedTags?: Record<string, string>;
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
  const [silhouette, setSilhouette] = useState(initialItem?.silhouette || '');
  const [length, setLength] = useState(initialItem?.length || '');
  
  // Debug wrapper for setLength
  const setLengthWithDebug = (value: string) => {
    console.log('[DEBUG] setLength called with:', value);
    console.log('[DEBUG] Current length before update:', length);
    setLength(value);
    console.log('[DEBUG] Length setter executed');
  };
  const [sleeves, setSleeves] = useState(initialItem?.sleeves || '');
  const [style, setStyle] = useState(initialItem?.style || '');
  const [rise, setRise] = useState(initialItem?.rise || '');
  const [seasons, setSeasons] = useState<Season[]>(initialItem?.season || []);
  const [isWishlistItem, setIsWishlistItem] = useState(initialItem?.wishlist ?? defaultWishlist);
  const [imageUrl, setImageUrl] = useState(initialItem?.imageUrl || '');
  const [detectedTags, setDetectedTags] = useState<Record<string, string>>({});
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
    
    if (color && (subcategory || category)) {
      const capitalizedColor = color.charAt(0).toUpperCase() + color.slice(1);
      
      // Use subcategory if available and not "other", otherwise use category
      if (subcategory && subcategory.toLowerCase() !== 'other') {
        const formattedSubcategory = subcategory.charAt(0).toUpperCase() + subcategory.slice(1);
        return `${capitalizedColor} ${formattedSubcategory}`;
      } else {
        const formattedCategory = formatCategoryName(category as ItemCategory);
        return `${capitalizedColor} ${formattedCategory}`;
      }
    }
    
    return '';
  };

  // Get form data
  const getFormData = (): WardrobeItemFormData => {
    console.log('[DEBUG] getFormData - Current form values:', {
      sleeves,
      style,
      rise,
      length,
      silhouette
    });
    
    const formData = {
      name: name.trim() || generateAutoName(),
      category,
      subcategory,
      color,
      material,
      brand,
      size,
      price,
      silhouette,
      sleeves: (category === ItemCategory.ONE_PIECE || 
        (category === ItemCategory.TOP && 
         subcategory && 
         ['t-shirt', 'shirt', 'blouse', 'sweater', 'cardigan'].includes(subcategory.toLowerCase()))) 
        ? sleeves || undefined : undefined,
      length: (category === ItemCategory.BOTTOM) ? length || undefined : undefined,
      rise: (category === ItemCategory.BOTTOM) ? rise || undefined : undefined,
      style: (category !== ItemCategory.ACCESSORY && category !== ItemCategory.OTHER) 
        ? style || undefined : undefined,
      seasons,
      isWishlistItem,
      imageUrl,
      detectedTags
    };
    
    // Debug logging
    console.log('[useWardrobeItemForm] Form data collected:', {
      sleeves: formData.sleeves,
      style: formData.style,
      silhouette: formData.silhouette,
      length: formData.length,
      rise: formData.rise
    });
    
    return formData;
  };

  // Reset form
  const resetForm = () => {
    setName('');
    setCategory('');
    setSubcategory('');
    setColor('');
    setMaterial('');
    setBrand('');
    setSize('');
    setPrice('');
    setSilhouette('');
    setLength('');
    setStyle('');
    setSleeves('');
    setRise('');
    setSeasons([]);
    setIsWishlistItem(false);
    setImageUrl('');
    setDetectedTags({});
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
    silhouette,
    setSilhouette,
    length,
    setLength: setLengthWithDebug,
    sleeves,
    setSleeves,
    style,
    setStyle,
    rise,
    setRise,
    seasons,
    toggleSeason,
    isWishlistItem,
    setIsWishlistItem,
    imageUrl,
    setImageUrl,
    setDetectedTags,
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
