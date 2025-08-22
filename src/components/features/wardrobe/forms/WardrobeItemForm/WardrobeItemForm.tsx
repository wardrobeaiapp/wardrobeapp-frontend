import React, { useState } from 'react';
import { WardrobeItem } from '../../../../../types';
import { detectImageTags, extractTopTags } from '../../../../../services/ximilarService';
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
    detectedTags,
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
      setIsImageFromUrl(false);
      console.log('Reset isImageFromUrl to false for new file selection');
    },
    onTagsDetected: async (tags) => {
      console.log('[WardrobeItemForm] Received detected tags:', tags);
      formState.setDetectedTags(tags);
      
      // Auto-fill form fields using the dedicated service
      if (tags) {
        const { FormAutoPopulationService } = await import('../../../../../services/formAutoPopulationService');
        
        await FormAutoPopulationService.autoPopulateFromTags(
          tags,
          {
            setCategory: formState.setCategory,
            setSubcategory: formState.setSubcategory,
            setColor: formState.setColor,
            setMaterial: formState.setMaterial,
            setBrand: formState.setBrand,
            setSize: formState.setSize,
            setSilhouette: formState.setSilhouette,
            setLength: formState.setLength,
            setSleeves: formState.setSleeves,
            setStyle: formState.setStyle,
            setRise: formState.setRise,
            setNeckline: formState.setNeckline,
            setName: formState.setName,
            toggleSeason: formState.toggleSeason,
          },
          formState.getFormData(),
          {
            overwriteExisting: false,
            skipFields: [],
          }
        );
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
    formState.setErrors(prev => ({ ...prev, imageUrl: '' }));
    
    try {
      // Import the image proxy service
      const { fetchImageViaProxy } = await import('../../../../../services/imageProxyService');
      
      // First, detect tags from the URL before processing the image
      try {
        console.log('[Ximilar] Detecting tags from URL:', url);
        const response = await detectImageTags(url);
        
        if (!response.records || response.records.length === 0) {
          console.warn('[Ximilar] No records found in response');
          return;
        }
        
        // Log the full response for debugging
        console.log('[Ximilar] Full response:', JSON.stringify(response, null, 2));
        
        // Extract all tags from the response
        const allTags = extractTopTags(response);
        console.log('[Ximilar] All detected tags:', allTags);
        
        // Store all detected tags in form state - auto-population happens via onTagsDetected callback
        formState.setDetectedTags?.(allTags);
      } catch (error: unknown) {
        console.error('[Ximilar] Error detecting tags from URL:', error);
        // Log additional error details if available
        if (error && typeof error === 'object') {
          const err = error as { 
            response?: { data?: any; status?: number };
            request?: any;
            message?: string;
          };
          
          if (err.response) {
            console.error('[Ximilar] Error response data:', err.response.data);
            console.error('[Ximilar] Error status:', err.response.status);
          } else if (err.request) {
            console.error('[Ximilar] No response received:', err.request);
          } else if (err.message) {
            console.error('[Ximilar] Error details:', err.message);
          }
        }
      }
      
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
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formState.validateForm()) {
      const formData = formState.getFormData();
      const finalImageUrl = formData.imageUrl || previewImage || '';
      
      // Use the detected tags from useImageHandling hook
      const currentDetectedTags = detectedTags || {};
      
      // Create tags object with all detected tags plus any form field overrides
      const tags: Record<string, string> = {};
      
      // First add all detected tags in their original format
      Object.entries(currentDetectedTags).forEach(([key, value]) => {
        if (value) {
          // Convert keys to lowercase for consistency
          const normalizedKey = key.toLowerCase();
          tags[normalizedKey] = value;
        }
      });
      
      // Then override with any explicitly set form fields
      if (formData.category) tags.category = formData.category.toLowerCase();
      if (formData.color) tags.color = formData.color.toLowerCase();
      if (formData.material) tags.material = formData.material.toLowerCase();
      if (formData.brand) tags.brand = formData.brand;
      if (formData.subcategory) tags.subcategory = formData.subcategory.toLowerCase();
      
      // Add any additional tags from the form that might not be in detectedTags
      if (formData.size) tags.size = formData.size;
      if (formData.price) tags.price = formData.price;
      
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
        timesWorn: initialItem?.timesWorn || 0,
        // Add new detail fields
        sleeves: formData.sleeves,
        style: formData.style,
        silhouette: formData.silhouette,
        length: formData.length,
        tags: tags // Save as JSON object
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
          silhouette={formState.silhouette}
          onSilhouetteChange={formState.setSilhouette}
          length={formState.length}
          onLengthChange={formState.setLength}
          sleeves={formState.sleeves}
          onSleeveChange={formState.setSleeves}
          style={formState.style}
          onStyleChange={formState.setStyle}
          rise={formState.rise}
          onRiseChange={formState.setRise}
          neckline={formState.neckline}
          onNecklineChange={formState.setNeckline}
          seasons={formState.seasons}
          onToggleSeason={formState.toggleSeason}
          isWishlistItem={formState.isWishlistItem}
          onWishlistToggle={formState.setIsWishlistItem}
          category={formState.category}
          subcategory={formState.subcategory}
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
