import React from 'react';
import { WardrobeItem, ItemCategory } from '../../types';
import { useSupabaseWardrobeItems } from '../../hooks/useSupabaseWardrobeItems';
import { useWardrobeItemForm } from './hooks/useWardrobeItemForm';
import { useImageHandling } from './hooks/useImageHandling';
import { ImageUploadSection } from './components/ImageUploadSection';
import { BasicInfoFields } from './components/BasicInfoFields';
import { DetailsFields } from './components/DetailsFields';
import { FormActions } from './components/FormActions';
import { FormContainer } from '../WardrobeItemForm.styles';

interface WardrobeItemFormProps {
  initialItem?: Partial<WardrobeItem>;
  onSubmit: (item: Omit<WardrobeItem, 'id' | 'dateAdded' | 'timesWorn'>) => void;
  onCancel: () => void;
  defaultWishlist?: boolean;
}

const WardrobeItemForm: React.FC<WardrobeItemFormProps> = ({
  initialItem,
  onSubmit,
  onCancel,
  defaultWishlist = false
}) => {
  // Custom hooks for form management
  const {
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
    validateForm,
    getFormData
  } = useWardrobeItemForm({ initialItem, defaultWishlist });

  // Image handling hook
  const {
    previewImage,
    isDownloadingImage,
    handleFileSelect,
    handleDrop,
    handleDragOver,
    handleUrlChange
  } = useImageHandling({
    initialImageUrl: initialItem?.imageUrl,
    onImageError: (error) => setErrors(prev => ({ ...prev, image: error })),
    onImageSuccess: () => setErrors(prev => ({ ...prev, image: '' }))
  });

  // Handle form submission
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!validateForm() || isSubmitting || isDownloadingImage) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = getFormData();
      
      // TODO: Re-implement automatic image download when server-side endpoint is fixed
      // For now, just use the imageUrl as-is (works fine for file uploads)
      // External URLs will be saved directly (not ideal but functional)
      
      const itemData = {
        name: formData.name,
        category: formData.category as ItemCategory, // Safe cast since validation ensures it's valid
        subcategory: formData.subcategory,
        color: formData.color,
        material: formData.material,
        season: formData.seasons, // Interface expects 'season' not 'seasons'
        wishlist: formData.isWishlistItem, // Interface expects 'wishlist' not 'isWishlistItem'
        imageUrl: formData.imageUrl,
        tags: []
      };

      onSubmit(itemData);
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors(prev => ({ ...prev, submit: 'Failed to save item. Please try again.' }));
      setIsSubmitting(false);
    }
  };

  return (
    <FormContainer onClick={(e) => e.stopPropagation()}>
      <form onSubmit={handleSubmit}>
        {/* Image Upload Section */}
        <ImageUploadSection
          previewImage={previewImage}
          onDrop={(e) => handleDrop(e, setImageUrl)}
          onDragOver={handleDragOver}
          onFileSelect={(file) => handleFileSelect(file, setImageUrl)}
          error={errors.image}
        />

        {/* TODO: Re-enable URL input after server-side image download is fixed
        <Input
          type="text"
          value={imageUrl}
          onChange={(e) => handleUrlChange(e.target.value, setImageUrl)}
          placeholder="Or enter an image URL"
          style={{ marginTop: '0.5rem', marginBottom: '1rem' }}
        />
        */}

        {/* Basic Info Fields */}
        <div style={{ marginTop: '2rem' }}>
          <BasicInfoFields
            name={name}
            onNameChange={setName}
            category={category}
            onCategoryChange={setCategory}
            subcategory={subcategory}
            onSubcategoryChange={setSubcategory}
            errors={errors}
          />
        </div>
        
        {/* Details Fields */}
        <div style={{ marginTop: '2rem' }}>
          <DetailsFields
            color={color}
            onColorChange={setColor}
            material={material}
            onMaterialChange={setMaterial}
            brand={brand}
            onBrandChange={setBrand}
            size={size}
            onSizeChange={setSize}
            price={price}
            onPriceChange={setPrice}
            seasons={seasons}
            onToggleSeason={toggleSeason}
            isWishlistItem={isWishlistItem}
            onWishlistToggle={setIsWishlistItem}
            errors={errors}
          />
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div style={{ color: 'red', fontSize: '0.875rem', marginBottom: '1rem' }}>
            {errors.submit}
          </div>
        )}

        {/* Form Actions */}
        <div style={{ marginTop: '2rem' }}>
          <FormActions
            onSubmit={handleSubmit}
            onCancel={onCancel}
            isSubmitting={isSubmitting}
            isDownloadingImage={isDownloadingImage}
          />
        </div>
      </form>
    </FormContainer>
  );
};

export default WardrobeItemForm;
