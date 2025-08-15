import React from 'react';
import { WardrobeItem } from '../../../../../types';
import { useWardrobeItemForm } from './hooks/useWardrobeItemForm';
import { useImageHandling } from './hooks/useImageHandling';
import { ImageUploadSection } from './components/ImageUploadSection';
import { BasicInfoFields } from './components/BasicInfoFields';
import { DetailsFields } from './components/DetailsFields';
import { FormActions } from './components/FormActions';
import { FormContainer } from './WardrobeItemForm.styles';

interface WardrobeItemFormProps {
  initialItem?: WardrobeItem;
  defaultWishlist?: boolean;
  onSubmit: (item: WardrobeItem) => void;
  onCancel: () => void;
}

const WardrobeItemForm: React.FC<WardrobeItemFormProps> = ({
  initialItem,
  defaultWishlist = false,
  onSubmit,
  onCancel
}) => {
  const formState = useWardrobeItemForm({
    initialItem,
    defaultWishlist
  });

  const { 
    previewImage, 
    handleFileSelect, 
    handleDrop,
    handleDragOver,
  } = useImageHandling({
    initialImageUrl: initialItem?.imageUrl,
    onImageError: (error: string) => formState.setErrors(prev => ({ ...prev, image: error })),
    onImageSuccess: () => formState.setErrors(prev => ({ ...prev, image: '' }))
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formState.validateForm()) {
      const formData = formState.getFormData();
      const item: WardrobeItem = {
        ...(initialItem?.id && { id: initialItem.id }), // Only include id if editing existing item
        name: formData.name,
        category: formData.category as any,
        subcategory: formData.subcategory,
        color: formData.color,
        material: formData.material,
        brand: formData.brand,
        size: formData.size,
        price: parseFloat(formData.price) || 0,
        season: formData.seasons,
        wishlist: formData.isWishlistItem,
        imageUrl: formData.imageUrl || previewImage || '',
        dateAdded: initialItem?.dateAdded || new Date().toISOString(),
        timesWorn: initialItem?.timesWorn || 0
      } as WardrobeItem;
      onSubmit(item);
    }
  };

  return (
    <FormContainer>
      <form onSubmit={handleSubmit}>
        <ImageUploadSection
          previewImage={previewImage}
          onDrop={(e: React.DragEvent) => handleDrop(e, formState.setImageUrl)}
          onDragOver={handleDragOver}
          onFileSelect={(file: File) => handleFileSelect(file, formState.setImageUrl)}
          error={formState.errors.image || ''}
        />

        <BasicInfoFields
          name={formState.name}
          onNameChange={formState.setName}
          category={formState.category}
          onCategoryChange={formState.setCategory}
          subcategory={formState.subcategory}
          onSubcategoryChange={formState.setSubcategory}
          color={formState.color}
          onColorChange={formState.setColor}
          errors={formState.errors}
        />

        <DetailsFields
          material={formState.material}
          onMaterialChange={formState.setMaterial}
          brand={formState.brand}
          onBrandChange={formState.setBrand}
          size={formState.size}
          onSizeChange={formState.setSize}
          price={formState.price}
          onPriceChange={formState.setPrice}
          seasons={formState.seasons}
          onToggleSeason={formState.toggleSeason}
          isWishlistItem={formState.isWishlistItem}
          onWishlistToggle={formState.setIsWishlistItem}
          errors={formState.errors}
        />

        <FormActions
          onCancel={onCancel}
          isSubmitting={formState.isSubmitting}
        />
      </form>
    </FormContainer>
  );
};

export default WardrobeItemForm;
