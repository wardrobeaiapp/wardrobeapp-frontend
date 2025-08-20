import React, { useState } from 'react';
import { WardrobeItem } from '../../../../../types';
import { useWardrobeItemForm } from './hooks/useWardrobeItemForm';
import { useImageHandling } from './hooks/useImageHandling';
import { useBackgroundRemoval } from './hooks/useBackgroundRemoval';
import { ImageUploadSection } from './components/ImageUploadSection';
import { BasicInfoFields } from './components/BasicInfoFields';
import { DetailsFields } from './components/DetailsFields';
import { FormActions } from './components/FormActions';
import { BackgroundRemovalPreview } from './components/BackgroundRemovalPreview';
import { FormContainer } from '../../shared/styles/form.styles';

interface WardrobeItemFormProps {
  initialItem?: WardrobeItem;
  defaultWishlist?: boolean;
  onSubmit: (item: WardrobeItem, file?: File) => void;
  onCancel: () => void;
}

const WardrobeItemForm: React.FC<WardrobeItemFormProps> = ({
  initialItem,
  defaultWishlist = false,
  onSubmit,
  onCancel
}) => {
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [isImageFromUrl, setIsImageFromUrl] = useState(false);
  const [isCurrentlyLoadingFromUrl, setIsCurrentlyLoadingFromUrl] = useState(false);
  
  const formState = useWardrobeItemForm({
    initialItem,
    defaultWishlist
  });

  const backgroundRemoval = useBackgroundRemoval({
    onError: (message) => {
      formState.setErrors(prev => ({ ...prev, imageUrl: message || 'Background removal error' }));
    },
    onSuccess: () => {
      formState.setErrors(prev => ({ ...prev, imageUrl: '' }));
    }
  });

  const {
    previewImage,
    selectedFile,
    handleDrop,
    handleDragOver,
    handleFileSelect,
    setPreviewImage,
    setSelectedFile
  } = useImageHandling({
    initialImageUrl: initialItem?.imageUrl,
    onImageError: (message) => {
      formState.setErrors(prev => ({ ...prev, imageUrl: message || 'Image error' }));
    },
    onImageSuccess: () => {
      formState.setErrors(prev => ({ ...prev, imageUrl: '' }));
    },
    onNewImageSelected: () => {
      backgroundRemoval.resetProcessedState();
      if (!isCurrentlyLoadingFromUrl) {
        setIsImageFromUrl(false);
      }
    }
  });

  const handleRemoveBackground = () => {
    if (selectedFile && previewImage) {
      backgroundRemoval.processImage(selectedFile, previewImage);
    }
  };

  const handleUseProcessed = async () => {
    await backgroundRemoval.useProcessed(
      setPreviewImage,
      formState.setImageUrl,
      setSelectedFile
    );
  };

  const handleUrlLoad = async (url: string) => {
    setIsLoadingUrl(true);
    setIsCurrentlyLoadingFromUrl(true);
    formState.setErrors(prev => ({ ...prev, imageUrl: '' }));
    
    try {
      // Import the image proxy service
      const { fetchImageViaProxy } = await import('../../../../../services/imageProxyService');
      
      // Fetch the image via proxy to get a blob and extension
      const { blob, fileExt } = await fetchImageViaProxy(url);
      
      // Convert blob to File object
      const fileName = `image-from-url.${fileExt}`;
      const file = new File([blob], fileName, { type: blob.type });
      
      // Use the existing file selection logic
      handleFileSelect(file, formState.setImageUrl);
      
      // Reset processed state when new image is loaded
      backgroundRemoval.resetProcessedState();
      
      // Store the original URL
      formState.setImageUrl(url);
      
      // Mark that this image came from URL AFTER everything else
      setTimeout(() => {
        setIsImageFromUrl(true);
        console.log('Set isImageFromUrl to true for URL image');
      }, 100);
    } catch (error) {
      console.error('Failed to load image from URL:', error);
      formState.setErrors(prev => ({ 
        ...prev, 
        imageUrl: 'Failed to load image from URL. Please check the URL and try again.' 
      }));
      setIsImageFromUrl(false);
    } finally {
      setIsLoadingUrl(false);
      setIsCurrentlyLoadingFromUrl(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formState.validateForm()) {
      const formData = formState.getFormData();
      const finalImageUrl = formData.imageUrl || previewImage || '';
      
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
        imageUrl: finalImageUrl,
        dateAdded: initialItem?.dateAdded || new Date().toISOString(),
        timesWorn: initialItem?.timesWorn || 0
      } as WardrobeItem;
      
      // If we have a Supabase storage URL (processed image), don't pass the file
      const isSupabaseUrl = finalImageUrl && finalImageUrl.includes('supabase');
      const fileToSubmit = isSupabaseUrl ? undefined : selectedFile || undefined;
      
      console.log('[WardrobeItemForm] Submitting with:', {
        hasFile: !!fileToSubmit,
        hasImageUrl: !!finalImageUrl,
        isSupabaseUrl,
        imageUrl: finalImageUrl
      });
      
      onSubmit(item, fileToSubmit);
    }
  };

  return (
    <FormContainer>
      <form onSubmit={handleSubmit}>
        <ImageUploadSection
          previewImage={previewImage}
          selectedFile={selectedFile}
          onDrop={(e: React.DragEvent) => handleDrop(e, formState.setImageUrl)}
          onDragOver={handleDragOver}
          onFileSelect={(file: File) => handleFileSelect(file, formState.setImageUrl)}
          onUrlLoad={handleUrlLoad}
          onRemoveBackground={handleRemoveBackground}
          isProcessingBackground={backgroundRemoval.isProcessing}
          isUsingProcessedImage={backgroundRemoval.isUsingProcessedImage}
          isLoadingUrl={isLoadingUrl}
          isImageFromUrl={isImageFromUrl}
          error={formState.errors.imageUrl || ''}
        />

        <BackgroundRemovalPreview
          isOpen={backgroundRemoval.showPreview}
          originalImage={backgroundRemoval.originalImage || ''}
          processedImage={backgroundRemoval.processedImage || ''}
          onUseOriginal={backgroundRemoval.useOriginal}
          onUseProcessed={handleUseProcessed}
          onClose={backgroundRemoval.closePreview}
          isProcessing={backgroundRemoval.isProcessing}
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
