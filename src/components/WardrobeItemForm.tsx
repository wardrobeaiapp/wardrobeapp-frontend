import React, { useState, useRef, useEffect } from 'react';
import { WardrobeItem, ItemCategory, Season } from '../types';
import {
  ImageScreen,
  CategoryScreen,
  SubcategoryScreen,
  ColorScreen,
  DetailsScreen
} from './WardrobeItemForm/index';
import { FormContainer } from './WardrobeItemForm.styles';

// Subcategory options, color options, and season handling are now in their respective screen components

interface WardrobeItemFormProps {
  initialItem?: Partial<WardrobeItem>;
  onSubmit: (item: Omit<WardrobeItem, 'id' | 'dateAdded' | 'timesWorn'>) => void;
  onCancel: () => void;
}

const WardrobeItemForm: React.FC<WardrobeItemFormProps> = ({
  initialItem = {},
  onSubmit,
  onCancel,
}) => {
  // Track if component is mounted to prevent state updates after unmount
  const [isMounted, setIsMounted] = useState(true);
  
  useEffect(() => {
    // Set up component mount state
    setIsMounted(true);
    
    // Clean up function to run when component unmounts
    return () => {
      setIsMounted(false);
    };
  }, []);
  
  const [currentScreen, setCurrentScreen] = useState<'image' | 'category' | 'subcategory' | 'color' | 'details'>('image');
  // Name state removed as the field has been removed
  const [category, setCategory] = useState<ItemCategory>(
    initialItem?.category || ItemCategory.TOP
  );
  const [subcategory, setSubcategory] = useState(initialItem?.subcategory || '');
  const [color, setColor] = useState(initialItem?.color || '');
  const [size, setSize] = useState(initialItem?.size || '');
  const [material, setMaterial] = useState(initialItem?.material || '');
  const [brand, setBrand] = useState(initialItem?.brand || '');
  const [seasons, setSeasons] = useState<Season[]>(initialItem?.season || []);
  const [imageUrl, setImageUrl] = useState(initialItem?.imageUrl || '');
  const [previewImage, setPreviewImage] = useState<string | null>(initialItem?.imageUrl || null);
  const [wishlist, setWishlist] = useState<boolean>(initialItem?.wishlist || false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Description field removed as requested
  // Tags field removed as requested
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!subcategory) {
      newErrors.subcategory = 'Subcategory is required';
    }
    
    if (!color.trim()) {
      newErrors.color = 'Color is required';
    }
    
    // Size and material are now optional fields
    // Validation removed as requested
    
    if (seasons.length === 0) {
      newErrors.seasons = 'At least one season is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const compressImage = async (file: File) => {
    try {
      console.log('Original image size:', file.size / 1024 / 1024, 'MB');
      
      // Create a canvas element for manual image resizing and compression
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }
      
      // Create an image element to load the file
      const img = new Image();
      
      // Create a promise to handle the async image loading
      return new Promise<string>((resolve, reject) => {
        img.onload = () => {
          // Calculate new dimensions (max 600px width/height)
          const MAX_SIZE = 600;
          let width = img.width;
          let height = img.height;
          
          if (width > height && width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          } else if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
          
          // Set canvas size to the new dimensions
          canvas.width = width;
          canvas.height = height;
          
          // Draw the resized image on the canvas
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to medium-quality JPEG (0.7 = 70% quality)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          
          // Log the compressed size
          const base64Data = dataUrl.split(',')[1];
          const compressedSize = (base64Data.length * 3) / 4 / (1024 * 1024);
          console.log('Manually compressed image size:', compressedSize, 'MB');
          
          // If still too large, compress further with moderate settings
          if (compressedSize > 1.0) { // Threshold increased to 1MB
            // Try with slightly smaller dimensions and medium quality
            const SMALLER_SIZE = 450; // Increased from 300px
            
            canvas.width = SMALLER_SIZE;
            canvas.height = SMALLER_SIZE;
            
            // Draw the image maintaining aspect ratio but centered in the square
            const aspectRatio = img.width / img.height;
            let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
            
            if (aspectRatio > 1) {
              // Landscape image
              drawWidth = SMALLER_SIZE;
              drawHeight = SMALLER_SIZE / aspectRatio;
              offsetY = (SMALLER_SIZE - drawHeight) / 2;
            } else {
              // Portrait image
              drawHeight = SMALLER_SIZE;
              drawWidth = SMALLER_SIZE * aspectRatio;
              offsetX = (SMALLER_SIZE - drawWidth) / 2;
            }
            
            ctx.clearRect(0, 0, SMALLER_SIZE, SMALLER_SIZE);
            ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
            
            // Use medium-low quality (0.5 = 50% quality)
            const smallerDataUrl = canvas.toDataURL('image/jpeg', 0.5);
            
            const smallerBase64Data = smallerDataUrl.split(',')[1];
            const smallerSize = (smallerBase64Data.length * 3) / 4 / (1024 * 1024);
            console.log('Further compressed image size:', smallerSize, 'MB');
            
            // If still too large, make a final attempt with smaller dimensions
            if (smallerSize > 0.5) { // If still larger than 500KB
              const TINY_SIZE = 350; // Increased from 200px
              canvas.width = TINY_SIZE;
              canvas.height = TINY_SIZE;
              
              // Simple centered scaling
              if (aspectRatio > 1) {
                drawWidth = TINY_SIZE;
                drawHeight = TINY_SIZE / aspectRatio;
                offsetY = (TINY_SIZE - drawHeight) / 2;
              } else {
                drawHeight = TINY_SIZE;
                drawWidth = TINY_SIZE * aspectRatio;
                offsetX = (TINY_SIZE - drawWidth) / 2;
              }
              
              ctx.clearRect(0, 0, TINY_SIZE, TINY_SIZE);
              ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
              
              // Low but acceptable quality
              const tinyDataUrl = canvas.toDataURL('image/jpeg', 0.3);
              
              const tinyBase64Data = tinyDataUrl.split(',')[1];
              const tinySize = (tinyBase64Data.length * 3) / 4 / (1024 * 1024);
              console.log('Final tiny compressed image size:', tinySize, 'MB');
              
              resolve(tinyDataUrl);
            } else {
              resolve(smallerDataUrl);
            }
          } else {
            resolve(dataUrl);
          }
        };
        
        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
        
        // Load the image from the file
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            img.src = e.target.result as string;
          } else {
            reject(new Error('Failed to read file'));
          }
        };
        reader.onerror = () => {
          reject(new Error('Failed to read file'));
        };
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error('Error compressing image:', error);
      throw new Error('Image is too large to process. Please try a smaller image.');
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        console.log('[WardrobeItemForm] Processing image file:', file.name, 'Size:', file.size, 'bytes');
        
        // Show loading state if needed
        const compressedImageData = await compressImage(file);
        console.log('[WardrobeItemForm] Image compressed successfully');
        console.log('[WardrobeItemForm] Compressed image data length:', compressedImageData.length);
        console.log('[WardrobeItemForm] Compressed image starts with:', compressedImageData.substring(0, 30));
        
        // Only update state if component is still mounted
        if (isMounted) {
          setPreviewImage(compressedImageData);
          setImageUrl(compressedImageData); // Store the compressed base64 image data
          console.log('[WardrobeItemForm] Image preview and URL state updated');
        } else {
          console.log('[WardrobeItemForm] Component unmounted, skipping state update');
        }
      } catch (error) {
        console.error('[WardrobeItemForm] Error processing image:', error);
        if (isMounted) {
          setErrors({ ...errors, image: 'Failed to process image' });
        }
      }
    } else {
      console.log('[WardrobeItemForm] No file selected in file input');
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    // Check if component is still mounted before proceeding
    if (!isMounted) {
      console.log('[WardrobeItemForm] Component unmounted, skipping form submission');
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    // Add debugging logs for wishlist property
    console.log('[WardrobeItemForm] handleSubmit - wishlist property:', wishlist);
    
    // Enhanced logging for image data before submission
    console.log('[WardrobeItemForm] Submitting form with image URL:', imageUrl ? 'YES (length: ' + imageUrl.length + ')' : 'NO');
    if (imageUrl) {
      console.log('[WardrobeItemForm] Image URL starts with:', imageUrl.substring(0, 30));
      console.log('[WardrobeItemForm] Image URL type:', imageUrl.startsWith('data:image/') ? 'BASE64' : 'URL');
    }
    
    // Make sure the image URL is properly set in the item data
    // If we have a preview image but no imageUrl, use the preview image
    const finalImageUrl = imageUrl || previewImage || undefined;
    
    console.log('[WardrobeItemForm] Final image URL used:', finalImageUrl ? 'YES' : 'NO');
    if (finalImageUrl) {
      console.log('[WardrobeItemForm] Final image URL type:', finalImageUrl.startsWith('data:image/') ? 'BASE64' : 'URL');
      console.log('[WardrobeItemForm] Final image URL length:', finalImageUrl.length);
    }
    
    // Generate a default name based on color and category if name field is removed
    // If subcategory is 'other' (case-insensitive), use the category name instead
    const nameCategory = subcategory?.toLowerCase() === 'other' ? category : (subcategory || category);
    const generatedName = `${color} ${nameCategory}`;
    console.log('[WardrobeItemForm] Generated name:', generatedName);
    
    // Validate that category is a valid ItemCategory enum value
    console.log('[WardrobeItemForm] Category before submission:', category);
    console.log('[WardrobeItemForm] Category type:', typeof category);
    console.log('[WardrobeItemForm] Valid categories:', Object.values(ItemCategory));
    
    // Ensure category is a valid enum value
    const validCategory = Object.values(ItemCategory).includes(category) 
      ? category 
      : ItemCategory.TOP; // Fallback to TOP if invalid
    
    if (validCategory !== category) {
      console.warn(`[WardrobeItemForm] Invalid category detected: ${category}, using fallback: ${validCategory}`);
    }
    
    // Create the item object to submit
    const itemToSubmit = {
      name: generatedName, // Use generated name instead of user input
      category: validCategory, // Use validated category
      subcategory,
      color,
      size,
      material,
      brand: brand.trim() || undefined, // Brand is optional
      season: seasons,
      imageUrl: finalImageUrl,
      description: undefined, // Description field removed as requested
      // Tags field removed as requested
      wishlist, // Include wishlist status
    };
    
    console.log('[WardrobeItemForm] itemToSubmit with wishlist:', itemToSubmit);
    
    console.log('[WardrobeItemForm] Submitting item with image?', !!itemToSubmit.imageUrl);
    if (itemToSubmit.imageUrl && itemToSubmit.imageUrl.startsWith('data:image/')) {
      console.log('[WardrobeItemForm] Image is BASE64 with length:', itemToSubmit.imageUrl.length);
    }
    
    console.log('[WardrobeItemForm] Calling onSubmit with wishlist:', itemToSubmit.wishlist);
    // Only call onSubmit if component is still mounted
    if (isMounted) {
      onSubmit(itemToSubmit);
    } else {
      console.log('[WardrobeItemForm] Component unmounted, skipping onSubmit call');
    }
  };

  // Screen rendering is now handled by separate components

  return (
    <FormContainer onSubmit={(e) => {
      e.preventDefault();
      if (currentScreen === 'details') {
        handleSubmit(e);
      }
    }}>
      {currentScreen === 'image' && (
        <ImageScreen
          imageUrl={imageUrl}
          setImageUrl={setImageUrl}
          previewImage={previewImage}
          onCancel={onCancel}
          setCurrentScreen={setCurrentScreen}
          handleImageChange={handleImageChange}
          fileInputRef={fileInputRef}
        />
      )}
      {currentScreen === 'category' && (
        <CategoryScreen
          category={category}
          setCategory={setCategory}
          setCurrentScreen={setCurrentScreen}
        />
      )}
      {currentScreen === 'subcategory' && (
        <SubcategoryScreen
          category={category}
          subcategory={subcategory}
          setSubcategory={setSubcategory}
          setCurrentScreen={setCurrentScreen}
          errors={errors}
          setErrors={setErrors}
        />
      )}
      {currentScreen === 'color' && (
        <ColorScreen
          color={color}
          setColor={setColor}
          setCurrentScreen={setCurrentScreen}
          errors={errors}
          setErrors={setErrors}
        />
      )}
      {currentScreen === 'details' && (
        <DetailsScreen
          size={size}
          setSize={setSize}
          material={material}
          setMaterial={setMaterial}
          brand={brand}
          setBrand={setBrand}
          seasons={seasons}
          setSeasons={setSeasons}
          wishlist={wishlist}
          setWishlist={setWishlist}
          setCurrentScreen={setCurrentScreen}
          errors={errors}
          handleSubmit={handleSubmit}
        />
      )}
    </FormContainer>
  );
};

export default WardrobeItemForm;
