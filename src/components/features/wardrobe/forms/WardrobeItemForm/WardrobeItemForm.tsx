import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../../services/core/supabase';
import { WardrobeItem } from '../../../../../types';
import { useWardrobeItemForm } from './hooks/useWardrobeItemForm';
import { useImageHandling } from './hooks/useImageHandling';
import { useBackgroundRemoval } from './hooks/useBackgroundRemoval';
import { ImageUploadSection } from './components/ImageUploadSection';
import { BasicInfoFields } from './components/BasicInfoFields';
import { DetailsFields } from './components/DetailsFields';
import { BackgroundRemovalPreview } from './components/BackgroundRemovalPreview';
import { FormActions } from './components/FormActions';
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
  const [userId, setUserId] = useState<string | null>(null);
  
  // Get the current authenticated user ID on component mount
  useEffect(() => {
    const getUserId = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error getting authenticated user:', error);
        return;
      }
      if (data?.user) {
        setUserId(data.user.id);
      }
    };
    
    getUserId();
  }, []);
  
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
        try {
          console.log('[WardrobeItemForm] Starting auto-population with tags:', tags);
          const { FormAutoPopulationService } = await import('../../../../../services/ai/formAutoPopulation');
          console.log('[WardrobeItemForm] FormAutoPopulationService imported successfully');
          
          await FormAutoPopulationService.autoPopulateFromTags(
            tags,
            {
              setCategory: formState.setCategory,
              setSubcategory: formState.setSubcategory,
              setColor: formState.setColor,
              setPattern: formState.setPattern,
              setMaterial: formState.setMaterial,
              setBrand: formState.setBrand,
              setSilhouette: formState.setSilhouette,
              setLength: formState.setLength,
              setSleeves: formState.setSleeves,
              setStyle: formState.setStyle,
              setRise: formState.setRise,
              setNeckline: formState.setNeckline,
              setHeelHeight: formState.setHeelHeight,
              setBootHeight: formState.setBootHeight,
              setType: formState.setType,
              setName: formState.setName,
              toggleSeason: formState.toggleSeason,
            },
            {
              overwriteExisting: false,
              skipFields: [],
              debug: true,
            }
          );
          console.log('[WardrobeItemForm] Auto-population completed successfully');
        } catch (error) {
          console.error('[WardrobeItemForm] Auto-population failed:', error);
        }
      }
    }
  });

  const handleRemoveBackground = () => {
    if (selectedFile && previewImage) {
      backgroundRemoval.processImage(selectedFile, previewImage);
    }
  };

  const handleUseProcessed = async () => {
    await backgroundRemoval.applyProcessedImage(
      setPreviewImage,
      formState.setImageUrl,
      setSelectedFile
    );
  };

  /**
   * Handles retail site images that can't be directly loaded due to CORS restrictions
   * @param imageUrl URL of the retail site image
   */
  const handleRetailSiteImage = (imageUrl: string) => {
    // Clear any previous errors
    formState.setErrors(prev => ({ ...prev, imageUrl: '' }));
    
    setIsLoadingUrl(false);
    
    // Set a user-friendly error message with guidance
    formState.setErrors(prev => ({ 
      ...prev, 
      imageUrl: 'This retailer restricts direct image access. Please save the image to your device first, then upload it directly.'
    }));
    
    // Optionally open the image in a new tab to help the user download it
    window.open(imageUrl, '_blank');
  };

  const handleUrlLoad = async (url: string) => {
    setIsLoadingUrl(true);
    formState.setErrors(prev => ({ ...prev, imageUrl: '' }));
    
    try {
      // Import the image proxy service
      const { fetchImageViaProxy } = await import('../../../../../services/core');
      
      // Fetch the image via proxy to get a blob and extension
      // Note: Tag detection will happen automatically in handleFileSelect
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
      
      // Check for special retail site errors
      if (error instanceof Error && error.message.includes('RETAIL_SITE_MANUAL_DOWNLOAD_NEEDED')) {
        const imageUrl = error.message.split('RETAIL_SITE_MANUAL_DOWNLOAD_NEEDED:')[1];
        handleRetailSiteImage(imageUrl);
        return;
      }
      
      // Handle other errors
      let errorMessage = 'Failed to load image from URL. Please check the URL and try again.';
      
      // More descriptive error for specific cases
      if (error instanceof Error) {
        if (error.message.includes('403') || error.message.includes('Forbidden')) {
          errorMessage = 'This retailer blocks image access. Try downloading the image and uploading it directly.';
        } else if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
          errorMessage = 'Too many requests to our image service. Please try again in a few minutes.';
        } else if (error.message.includes('Proxy fetch failed')) {
          errorMessage = 'Image proxy service is currently unavailable. Try downloading and uploading the image.';
        }
      }
      
      formState.setErrors(prev => ({ 
        ...prev, 
        imageUrl: errorMessage 
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
      
      // Debug logging for neckline data flow
      console.log('[WardrobeItemForm] handleSubmit - Form data:', {
        neckline: formData.neckline,
        category: formData.category,
        subcategory: formData.subcategory
      });
      
      // Use the detected tags from useImageHandling hook
      const currentDetectedTags = detectedTags || {};
      
      // Create tags object with all detected tags plus any form field overrides
      const tags: Record<string, string> = {};
      
      // Only save tags that weren't used to populate form fields
      // Create a set of form field names that got populated
      const populatedFormFields = new Set<string>();
      if (formData.category) populatedFormFields.add('category');
      if (formData.color) populatedFormFields.add('color');  
      if (formData.pattern) populatedFormFields.add('pattern');
      if (formData.material) populatedFormFields.add('material');
      if (formData.brand) populatedFormFields.add('brand');
      if (formData.subcategory) populatedFormFields.add('subcategory');
      if (formData.silhouette) populatedFormFields.add('silhouette');
      if (formData.length) populatedFormFields.add('length');
      if (formData.sleeves) populatedFormFields.add('sleeves');
      if (formData.style) populatedFormFields.add('style');
      if (formData.rise) populatedFormFields.add('rise');
      if (formData.neckline) populatedFormFields.add('neckline');
      if (formData.heelHeight) populatedFormFields.add('heelheight');
      if (formData.bootHeight) populatedFormFields.add('bootheight');
      if (formData.type) populatedFormFields.add('type');
      
      // Add only unused detected tags to the tags object
      Object.entries(currentDetectedTags).forEach(([key, value]) => {
        if (value) {
          const normalizedKey = key.toLowerCase();
          // Only include if this tag wasn't used to populate a form field
          if (!populatedFormFields.has(normalizedKey)) {
            tags[normalizedKey] = value;
          }
        }
      });
      
      const item: WardrobeItem = {
        ...(initialItem?.id && { id: initialItem.id }), // Only include id if editing existing item
        name: formData.name,
        category: formData.category as any,
        subcategory: formData.subcategory,
        color: formData.color,
        pattern: formData.pattern,
        material: formData.material,
        brand: formData.brand,
        length: formData.length,
        neckline: formData.neckline,
        heelHeight: formData.heelHeight,
        bootHeight: formData.bootHeight,
        type: formData.type,
        rise: formData.rise,
        tags: tags // Save as JSON object
      } as WardrobeItem;
      
      // If we have a Supabase storage URL (processed image), don't pass the file
      const isSupabaseUrl = finalImageUrl && finalImageUrl.includes('supabase');
      const fileToSubmit = isSupabaseUrl ? undefined : selectedFile || undefined;
      
      console.log('[WardrobeItemForm] Submitting with:', {
        hasFile: !!fileToSubmit,
        hasImageUrl: !!finalImageUrl,
        isSupabaseUrl,
        imageUrl: finalImageUrl,
        userId: userId
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
          price={formState.price}
          onPriceChange={formState.setPrice}
          pattern={formState.pattern}
          onPatternChange={formState.setPattern}
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
          heelHeight={formState.heelHeight}
          onHeelHeightChange={formState.setHeelHeight}
          bootHeight={formState.bootHeight}
          onBootHeightChange={formState.setBootHeight}
          type={formState.type}
          onTypeChange={formState.setType}
          scenarios={formState.scenarios}
          onScenarioToggle={formState.toggleScenario}
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
          isDownloadingImage={isLoadingUrl}
        />
      </form>
    </FormContainer>
  );
};

export default WardrobeItemForm;
