import React, { useState } from 'react';
import { WardrobeItem, ItemCategory, Season } from '../../../../../../types';

interface FormErrors {
  [key: string]: string;
}

export interface WardrobeItemFormData {
  name: string;
  category: ItemCategory | '';
  subcategory: string;
  color: string;
  pattern?: string;
  material: string;
  brand: string;
  price: string;
  silhouette: string;
  length?: string;
  sleeves?: string;
  style?: string;
  rise?: string;
  neckline?: string;
  heelHeight?: string;
  bootHeight?: string;
  type?: string;
  closure?: string;
  details?: string;
  seasons: Season[];
  scenarios: string[]; // Array of scenario IDs
  isWishlistItem: boolean;
  imageUrl: string;
  detectedTags?: Record<string, string>;
}

interface UseWardrobeItemFormProps {
  initialItem?: Partial<WardrobeItem> & { historyItemId?: string };
  defaultWishlist?: boolean;
}

export const useWardrobeItemForm = ({ initialItem, defaultWishlist = false }: UseWardrobeItemFormProps = {}) => {
  // Log form opening source and history item ID
  React.useEffect(() => {
    // Check if we have AI history data in sessionStorage (indicates redirection)
    const aiHistoryData = sessionStorage.getItem('aiHistoryAddItem');
    const hasHistoryItemId = !!initialItem?.historyItemId && typeof initialItem.historyItemId === 'string' && initialItem.historyItemId.length > 0;
    const hasRegularItemId = !!initialItem?.id && typeof initialItem.id === 'string' && initialItem.id.length > 0;
    
    if (aiHistoryData) {
      try {
        const parsed = JSON.parse(aiHistoryData);
        console.log('🔄 [WardrobeItemForm] Form opened from AI history redirection (sessionStorage still exists)');
        console.log('📝 [WardrobeItemForm] History item ID from sessionStorage:', parsed.historyItemId);
        console.log('🎯 [WardrobeItemForm] Has history item ID in initialItem prop:', hasHistoryItemId);
        console.log('📋 [WardrobeItemForm] Initial item ID (regular):', initialItem?.id);
        console.log('🏷️ [WardrobeItemForm] History item ID from prop:', initialItem?.historyItemId);
      } catch (error) {
        console.error('❌ [WardrobeItemForm] Error parsing AI history data:', error);
      }
    } else if (hasHistoryItemId) {
      console.log('🔄 [WardrobeItemForm] Form opened from AI history redirection (detected via prop)');
      console.log('📝 [WardrobeItemForm] History item ID from initialItem prop:', initialItem?.historyItemId);
      console.log('� [WardrobeItemForm] Has history item ID in initialItem prop:', hasHistoryItemId);
      console.log('📋 [WardrobeItemForm] Initial item ID (regular):', initialItem?.id);
      console.log('🧹 [WardrobeItemForm] SessionStorage already cleared');
    } else {
      console.log('�� [WardrobeItemForm] Form opened directly (no redirection)');
      console.log('🎯 [WardrobeItemForm] Has history item ID in initialItem prop:', hasHistoryItemId);
      console.log('📋 [WardrobeItemForm] Initial item ID (regular):', hasRegularItemId);
      console.log('🏷️ [WardrobeItemForm] History item ID from prop:', initialItem?.historyItemId);
    }
  }, [initialItem?.id, initialItem?.historyItemId]);

  // Form state
  const [name, setName] = useState(initialItem?.name || '');
  const [category, setCategory] = useState<ItemCategory | ''>(initialItem?.category || '');
  const [subcategory, setSubcategory] = useState(initialItem?.subcategory || '');
  const [color, setColor] = useState(initialItem?.color || '');
  const [pattern, setPattern] = useState(initialItem?.pattern || '');
  const [material, setMaterial] = useState(initialItem?.material || '');
  const [brand, setBrand] = useState(initialItem?.brand || '');
  const [price, setPrice] = useState(initialItem?.price?.toString() || '');
  const [silhouette, setSilhouette] = useState(initialItem?.silhouette || '');
  const [length, setLength] = useState(initialItem?.length || '');
  
  // Optimized setLength function
  const setLengthOptimized = (value: string) => {
    setLength(value);
  };
  const [sleeves, setSleeves] = useState(initialItem?.sleeves || '');
  const [style, setStyle] = useState(initialItem?.style || '');
  
  // Optimized setStyle function
  const setStyleOptimized = (value: string) => {
    setStyle(value);
  };
  const [rise, setRise] = useState(initialItem?.rise || '');
  const [neckline, setNeckline] = useState(initialItem?.neckline || '');
  const [heelHeight, setHeelHeight] = useState(initialItem?.heelHeight || '');
  const [bootHeight, setBootHeight] = useState(initialItem?.bootHeight || '');
  const [type, setType] = useState(initialItem?.type || '');
  const [closure, setClosure] = useState(initialItem?.closure || '');
  const [details, setDetails] = useState(initialItem?.details || '');
  const [seasons, setSeasons] = useState<Season[]>(initialItem?.season || []);
  const [isWishlistItem, setIsWishlistItem] = useState(initialItem?.wishlist ?? defaultWishlist);
  const [imageUrl, setImageUrl] = useState(initialItem?.imageUrl || '');
  const [detectedTags, setDetectedTags] = useState<Record<string, string>>({});
  const [scenarios, setScenarios] = useState<string[]>(initialItem?.scenarios || []);
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
  
  // Scenario toggle handler
  const toggleScenario = (scenarioId: string) => {
    setScenarios(prev => 
      prev.includes(scenarioId)
        ? prev.filter(id => id !== scenarioId)
        : [...prev, scenarioId]
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

    // Check if sleeves is required and not set
    const isSleevesRequired = ((category === ItemCategory.ONE_PIECE && 
      subcategory && !['overall'].includes(subcategory.toLowerCase())) || 
      (category === ItemCategory.TOP && 
       subcategory && 
       ['t-shirt', 'shirt', 'blouse', 'sweater', 'cardigan'].includes(subcategory.toLowerCase())));
       
    if (isSleevesRequired && !sleeves) {
      newErrors.sleeves = 'Sleeve type is required for this item';
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
    
    const formData = {
      name: name.trim() || generateAutoName(),
      category,
      subcategory,
      color,
      pattern,
      material,
      brand,
      price,
      silhouette,
      sleeves: ((category === ItemCategory.ONE_PIECE && subcategory && !['overall'].includes(subcategory.toLowerCase())) || 
        (category === ItemCategory.TOP && 
         subcategory && 
         ['t-shirt', 'shirt', 'blouse', 'sweater', 'cardigan'].includes(subcategory.toLowerCase()))) 
        ? (sleeves && ['sleeveless', 'short sleeves', 'long sleeves', '3/4 sleeves', 'one sleeve'].includes(sleeves) 
           ? sleeves 
           : 'short sleeves') // Ensure value matches exactly one of the valid options
        : undefined,
      length: (category === ItemCategory.BOTTOM || 
        category === ItemCategory.ONE_PIECE || 
        category === ItemCategory.OUTERWEAR) ? length || undefined : undefined,
      rise: (category === ItemCategory.BOTTOM) ? rise || undefined : undefined,
      neckline: (subcategory && 
        ['dress', 't-shirt', 'shirt', 'blouse', 'top', 'tank top', 'sweater', 'hoodie', 'sweatshirt', 'cardigan', 'blazer'].includes(subcategory.toLowerCase())) 
        ? neckline || undefined : undefined,
      heelHeight: (category === ItemCategory.FOOTWEAR && 
        subcategory && 
        ['heels', 'boots', 'sandals', 'flats', 'formal shoes'].includes(subcategory.toLowerCase()))
        ? heelHeight || undefined : undefined,
      bootHeight: (category === ItemCategory.FOOTWEAR && 
        subcategory && 
        subcategory.toLowerCase() === 'boots')
        ? bootHeight || undefined : undefined,
      type: ((category === ItemCategory.FOOTWEAR && subcategory && 
        ['boots', 'formal shoes'].includes(subcategory.toLowerCase())) ||
        (category === ItemCategory.ACCESSORY && subcategory && 
        ['bag', 'jewelry'].includes(subcategory.toLowerCase())) ||
        (category === ItemCategory.OUTERWEAR && subcategory && 
        ['jacket', 'coat'].includes(subcategory.toLowerCase())))
        ? type || undefined : undefined,
      closure: (category === ItemCategory.TOP && subcategory && 
        ['cardigan', 'blazer', 'hoodie', 'vest'].includes(subcategory.toLowerCase()))
        ? closure || undefined : undefined,
      details: details || undefined,
      style: (category !== ItemCategory.ACCESSORY && category !== ItemCategory.OTHER) 
        ? style || undefined : undefined,
      seasons,
      scenarios,
      isWishlistItem,
      imageUrl,
      detectedTags
    };
    
    return formData;
  };

  // Reset form
  const resetForm = () => {
    setName('');
    setCategory('');
    setSubcategory('');
    setColor('');
    setPattern('');
    setMaterial('');
    setBrand('');
    setPrice('');
    setSilhouette('');
    setLength('');
    setSleeves('');
    setStyle('');
    setRise('');
    setNeckline('');
    setHeelHeight('');
    setBootHeight('');
    setType('');
    setClosure('');
    setDetails('');
    setSeasons([]);
    setScenarios([]);
    setIsWishlistItem(defaultWishlist);
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
    pattern,
    setPattern,
    material,
    setMaterial,
    brand,
    setBrand,
    price,
    setPrice,
    silhouette,
    setSilhouette,
    length,
    setLength: setLengthOptimized,
    sleeves,
    setSleeves,
    style,
    setStyle: setStyleOptimized,
    rise,
    setRise,
    neckline,
    setNeckline,
    heelHeight,
    setHeelHeight,
    bootHeight,
    setBootHeight,
    type,
    setType,
    closure,
    setClosure,
    details,
    setDetails,
    seasons,
    toggleSeason,
    scenarios,
    toggleScenario,
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
