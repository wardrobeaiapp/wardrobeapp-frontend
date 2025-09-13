import React, { useState } from 'react';
import { useAuthUser } from './hooks/useAuthUser';
import { useTagProcessing } from './hooks/useTagProcessing';
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
  const [isImageFromUrl, setIsImageFromUrl] = useState(false);
  const { userId } = useAuthUser();
  const { processDetectedTags } = useTagProcessing();
  
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
    handleUrlLoad,
    isDownloadingImage,
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
    onSetIsImageFromUrl: (isFromUrl) => {
      setIsImageFromUrl(isFromUrl);
    },
    onBackgroundRemovalReset: () => {
      backgroundRemoval.resetProcessedState();
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
   * Creates a wardrobe item object from form data
   */
  const createWardrobeItem = (formData: ReturnType<typeof formState.getFormData>, finalImageUrl: string) => {
    // Use the detected tags from useImageHandling hook
    const currentDetectedTags = detectedTags || {};
    
    // Process tags to exclude ones that were used in form fields
    const tags = processDetectedTags(currentDetectedTags, formData);
    
    return {
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
      imageUrl: finalImageUrl, // Add image URL to the item
      scenarios: formData.scenarios, // Add scenarios field
      season: formData.seasons, // Make sure seasons are also included
      tags: tags // Save as JSON object
    } as WardrobeItem;
  };

  /**
   * Determines how to handle the image file based on the image URL
   */
  const determineImageToSubmit = (imageUrl: string) => {
    // If image is already a Supabase URL, we don't need to upload it again
    const isSupabaseUrl = imageUrl && imageUrl.includes('supabase.co');
    
    // If image is a data URL or from a file, we need to pass the file for upload
    // If image is a regular URL but not from Supabase, we should pass it for server-side processing
    return isSupabaseUrl ? undefined : selectedFile || undefined;
  };

  /**
   * Logs submission details for debugging
   */
  const logSubmissionDetails = (item: WardrobeItem, finalImageUrl: string, fileToSubmit: File | undefined) => {
    console.log('[WardrobeItemForm] Submitting with:', {
      hasFile: !!fileToSubmit,
      hasImageUrl: !!finalImageUrl,
      isSupabaseUrl: finalImageUrl && finalImageUrl.includes('supabase.co'),
      imageUrlPrefix: finalImageUrl ? finalImageUrl.substring(0, 30) + '...' : 'none',
      imageUrlType: finalImageUrl ? (
        finalImageUrl.startsWith('data:') ? 'DATA_URL' : 
        finalImageUrl.includes('supabase.co') ? 'SUPABASE_URL' : 
        finalImageUrl.startsWith('http') ? 'EXTERNAL_URL' : 'OTHER'
      ) : 'NONE',
      userId: userId,
      scenarios: item.scenarios,
      scenariosCount: item.scenarios ? item.scenarios.length : 0
    });
  };

  /**
   * Main form submission handler
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formState.validateForm()) {
      const formData = formState.getFormData();
      
      // Debug logging for neckline data flow
      console.log('[WardrobeItemForm] handleSubmit - Form data:', {
        neckline: formData.neckline,
        category: formData.category,
        subcategory: formData.subcategory
      });
      
      const finalImageUrl = formData.imageUrl || previewImage || '';
      const item = createWardrobeItem(formData, finalImageUrl);
      const fileToSubmit = determineImageToSubmit(finalImageUrl);
      
      logSubmissionDetails(item, finalImageUrl, fileToSubmit);
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
          onUrlLoad={(url: string) => handleUrlLoad(url, formState.setImageUrl)}
          onRemoveBackground={handleRemoveBackground}
          isProcessingBackground={backgroundRemoval.isProcessing}
          isUsingProcessedImage={backgroundRemoval.isUsingProcessedImage}
          isLoadingUrl={isDownloadingImage}
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
          isDownloadingImage={isDownloadingImage}
        />
      </form>
    </FormContainer>
  );
};

export default WardrobeItemForm;
