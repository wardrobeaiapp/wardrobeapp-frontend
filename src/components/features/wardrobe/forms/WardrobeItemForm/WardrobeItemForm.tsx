import React, { useState, Suspense, lazy } from 'react';
import { useTagProcessing } from './hooks/useTagProcessing';
import { WardrobeItem } from '../../../../../types';
import { useWardrobeItemForm } from './hooks/useWardrobeItemForm';
import { useImageHandling } from './hooks/useImageHandling';
import { useBackgroundRemoval } from './hooks/useBackgroundRemoval';
import { FormContainer } from '../../shared/styles/form.styles';
import { LoadingSpinner, FormSectionLoading } from './WardrobeItemForm.styles';

// Lazy load heavy form components to prevent blocking modal opening
const ImageUploadSection = lazy(() => import('./components/ImageUploadSection').then(module => ({ default: module.ImageUploadSection })));
const BasicInfoFields = lazy(() => import('./components/BasicInfoFields').then(module => ({ default: module.BasicInfoFields })));
const DetailsFields = lazy(() => import('./components/DetailsFields').then(module => ({ default: module.DetailsFields })));
const BackgroundRemovalPreview = lazy(() => import('./components/BackgroundRemovalPreview').then(module => ({ default: module.BackgroundRemovalPreview })));
const FormActions = lazy(() => import('./components/FormActions').then(module => ({ default: module.FormActions })));

interface WardrobeItemFormProps {
  initialItem?: WardrobeItem & { historyItemId?: string };
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
  const [loadedComponents, setLoadedComponents] = useState<Set<string>>(new Set());
  
  // Progressive loading: load components one by one after initial render
  React.useEffect(() => {
    const loadComponents = async () => {
      // Load image upload first
      await new Promise(resolve => setTimeout(resolve, 50));
      setLoadedComponents(prev => new Set([...prev, 'image']));
      
      // Then basic info
      await new Promise(resolve => setTimeout(resolve, 50));
      setLoadedComponents(prev => new Set([...prev, 'basic']));
      
      // Then details
      await new Promise(resolve => setTimeout(resolve, 50));
      setLoadedComponents(prev => new Set([...prev, 'details']));
      
      // Finally actions
      await new Promise(resolve => setTimeout(resolve, 50));
      setLoadedComponents(prev => new Set([...prev, 'actions']));
    };
    
    loadComponents();
  }, []);
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
    setSelectedFile,
    clearImage,
    cleanupUploadedImages,
    markImageAsSaved,
    trackUploadedImage,
    uploadedImageUrls
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
    },
    onSetIsImageFromUrl: (isFromUrl) => {
      setIsImageFromUrl(isFromUrl);
    },
    onBackgroundRemovalReset: () => {
      backgroundRemoval.resetProcessedState();
    }
  });

  const handleRemoveBackground = () => {
    if (selectedFile && previewImage) {
      // Get the actual uploaded Supabase URL from the tracking array (last uploaded image)
      const actualUploadedUrl = uploadedImageUrls[uploadedImageUrls.length - 1];
      console.log('[WardrobeItemForm] Passing actual uploaded Supabase URL for deletion:', actualUploadedUrl);
      backgroundRemoval.processImage(selectedFile, previewImage, actualUploadedUrl);
    }
  };

  const handleUseProcessed = async () => {
    await backgroundRemoval.applyProcessedImage(
      setPreviewImage,
      formState.setImageUrl,
      setSelectedFile,
      formState.imageUrl, // current image URL for deletion
      trackUploadedImage  // tracking callback for cleanup
    );
  };

  const handleUseOriginal = () => {
    // Use the original image URL from when background removal started
    const originalImageUrl = backgroundRemoval.originalImage || formState.imageUrl;
    backgroundRemoval.useOriginal(
      setPreviewImage,
      formState.setImageUrl,
      originalImageUrl
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
      silhouette: formData.silhouette,
      length: formData.length,
      sleeves: formData.sleeves,
      style: formData.style,
      neckline: formData.neckline,
      heelHeight: formData.heelHeight,
      bootHeight: formData.bootHeight,
      type: formData.type,
      closure: formData.closure, // THE MISSING CLOSURE FIELD!
      details: formData.details,
      rise: formData.rise,
      imageUrl: finalImageUrl, // Add image URL to the item
      scenarios: formData.scenarios, // Add scenarios field
      season: formData.seasons, // Make sure seasons are also included
      wishlist: formData.isWishlistItem, // Map isWishlistItem to wishlist for server compatibility
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

  // Removed expensive debug logging for performance

  /**
   * Handle form cancellation with image cleanup
   */
  const handleCancel = async () => {
    console.log('[WardrobeItemForm] ===== FORM CANCELLATION STARTED =====');
    console.log('[WardrobeItemForm] Uploaded images to cleanup:', uploadedImageUrls);
    console.log('[WardrobeItemForm] Total images to cleanup:', uploadedImageUrls.length);
    
    if (uploadedImageUrls.length > 0) {
      console.log('[WardrobeItemForm] Starting cleanup process...');
      await cleanupUploadedImages();
      console.log('[WardrobeItemForm] Cleanup process completed');
    } else {
      console.log('[WardrobeItemForm] No uploaded images to cleanup');
    }
    
    console.log('[WardrobeItemForm] ===== CALLING onCancel() =====');
    onCancel();
  };

  /**
   * Main form submission handler
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formState.validateForm()) {
      const formData = formState.getFormData();
      
      const finalImageUrl = formData.imageUrl || previewImage || '';
      const item = createWardrobeItem(formData, finalImageUrl);
      const fileToSubmit = determineImageToSubmit(finalImageUrl);
      
      // Mark the final image as saved (remove from cleanup list)
      if (finalImageUrl) {
        markImageAsSaved(finalImageUrl);
        console.log('[WardrobeItemForm] Marked image as saved:', finalImageUrl);
      }
      
      onSubmit(item, fileToSubmit);
    }
  };

  // Helper to render placeholder for components that haven't loaded yet
  const renderPlaceholder = (text: string) => (
    <FormSectionLoading>
      <LoadingSpinner />
      {text}
    </FormSectionLoading>
  );

  return (
    <FormContainer>
      <form onSubmit={handleSubmit} data-testid="wardrobe-item-form">
        {loadedComponents.has('image') ? (
          <Suspense fallback={<FormSectionLoading><LoadingSpinner />Loading image upload...</FormSectionLoading>}>
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
            onClearImage={() => clearImage(formState.setImageUrl)}
            isEditing={!!initialItem}
            />
          </Suspense>
        ) : renderPlaceholder('Loading image upload...')}

        <Suspense fallback={<FormSectionLoading><LoadingSpinner />Loading background removal...</FormSectionLoading>}>
          <BackgroundRemovalPreview
            isOpen={backgroundRemoval.showPreview}
            originalImage={backgroundRemoval.originalImage || ''}
            processedImage={backgroundRemoval.processedImage || ''}
            onUseOriginal={handleUseOriginal}
            onUseProcessed={handleUseProcessed}
            onClose={backgroundRemoval.closePreview}
            isProcessing={backgroundRemoval.isProcessing}
          />
        </Suspense>

        {loadedComponents.has('basic') ? (
          <Suspense fallback={<FormSectionLoading><LoadingSpinner />Loading basic info...</FormSectionLoading>}>
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
          </Suspense>
        ) : renderPlaceholder('Loading basic info...')}

        {loadedComponents.has('details') ? (
          <Suspense fallback={<FormSectionLoading><LoadingSpinner />Loading details...</FormSectionLoading>}>
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
            closure={formState.closure}
            onClosureChange={formState.setClosure}
            details={formState.details}
            onDetailsChange={formState.setDetails}
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
          </Suspense>
        ) : renderPlaceholder('Loading details...')}

        {loadedComponents.has('actions') ? (
          <Suspense fallback={<FormSectionLoading><LoadingSpinner />Loading actions...</FormSectionLoading>}>
            <FormActions
              onCancel={handleCancel}
              isSubmitting={formState.isSubmitting}
              isDownloadingImage={isDownloadingImage}
            />
          </Suspense>
        ) : renderPlaceholder('Loading actions...')}
      </form>
    </FormContainer>
  );
};

export default WardrobeItemForm;
