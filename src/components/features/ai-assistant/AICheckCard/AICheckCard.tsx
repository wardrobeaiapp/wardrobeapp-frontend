import React, { useState } from 'react';
import { FaSearch, FaCloudUploadAlt, FaLink } from 'react-icons/fa';
import { FiScissors } from 'react-icons/fi';
import {
  AICard,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardIcon,
  AICheckContent,
  UploadArea,
  UploadIcon,
  UploadText,
  ControlsArea,
  ButtonGroup,
} from '../../../../pages/AIAssistantPage.styles';
import Button from '../../../common/Button';
import { FormField, FormInput } from '../../../common/Form';
import { useBackgroundRemoval } from '../../../features/wardrobe/forms/WardrobeItemForm/hooks/useBackgroundRemoval';
import { BackgroundRemovalPreview } from '../../../features/wardrobe/forms/WardrobeItemForm/components/BackgroundRemovalPreview';
import styled from 'styled-components';

const RemoveBgButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 20px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 2;
  
  &:hover {
    background: ${props => props.theme.colors.primaryDark};
    transform: translateY(-1px);
  }
  
  &:disabled {
    background: ${props => props.theme.colors.textSecondary};
    cursor: not-allowed;
    transform: none;
  }
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

interface AICheckCardProps {
  imageLink: string;
  onImageLinkChange: (value: string) => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCheckItem: () => void;
  onOpenWishlistModal: () => void;
  isLoading: boolean;
  error: string;
  itemCheckResponse: string | null;
  isFileUpload?: boolean;
  uploadedFile?: File | null;
  onProcessedImageChange?: (processedImageUrl: string, processedImageBlob: Blob) => void;
}

const AICheckCard: React.FC<AICheckCardProps> = ({
  imageLink,
  onImageLinkChange,
  onFileUpload,
  onCheckItem,
  onOpenWishlistModal,
  isLoading,
  error,
  itemCheckResponse,
  isFileUpload = false,
  uploadedFile = null,
  onProcessedImageChange
}) => {
  // Use the background removal hook
  const {
    isProcessing,
    processedImage,
    originalImage,
    showPreview,
    isUsingProcessedImage,
    processImage,
    useOriginal,
    useProcessed,
    closePreview,
    resetProcessedState
  } = useBackgroundRemoval({
    onError: (errorMessage) => {
      console.error('Background removal error:', errorMessage);
    },
    onSuccess: () => {
      console.log('Background removed successfully');
    }
  });

  const handleRemoveBackground = async () => {
    if (!uploadedFile || !imageLink) return;
    await processImage(uploadedFile, imageLink);
  };

  // Handle using processed image
  const handleUseProcessed = async () => {
    try {
      if (processedImage && onProcessedImageChange) {
        // We need to create setPreviewImage and setImageUrl functions for useProcessed
        const setPreviewImage = (url: string) => {
          // This would normally update the form's preview image
          console.log('Setting preview image:', url);
        };
        
        const setImageUrl = (url: string) => {
          // This would normally update the form's image URL
          console.log('Setting image URL:', url);
        };
        
        // Call useProcessed with required functions
        await useProcessed(setPreviewImage, setImageUrl);
        
        // Get the processed image as a blob for the parent component
        const blob = await fetch(processedImage).then(res => res.blob());
        if (blob) {
          onProcessedImageChange(processedImage, blob);
        }
      }
    } catch (error) {
      console.error('Error using processed image:', error);
    }
  };

  return (
    <>
      {/* Background Removal Preview Modal */}
      {showPreview && processedImage && originalImage && (
        <BackgroundRemovalPreview
          isOpen={showPreview}
          originalImage={originalImage}
          processedImage={processedImage}
          onUseOriginal={useOriginal}
          onUseProcessed={handleUseProcessed}
          onClose={closePreview}
          isProcessing={isProcessing}
        />
      )}
      
      <AICard>
        <CardContent>
          <CardHeader>
            <CardIcon className="check">
              <FaSearch size={20} />
            </CardIcon>
            <div>
              <CardTitle>AI Check</CardTitle>
              <CardDescription>
              Get instant feedback on the clothing item you want to buy
            </CardDescription>
          </div>
        </CardHeader>
      
        {/* 2-Column Layout */}
        <AICheckContent>
          {/* Left Column - Upload Area */}
          <UploadArea>
            {imageLink ? (
              <>
                <img
                  src={isUsingProcessedImage && processedImage ? processedImage : imageLink}
                  alt="Preview"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={onFileUpload}
                  style={{ display: 'none' }}
                  id="photo-upload"
                />
                <label 
                  htmlFor="photo-upload" 
                  style={{ 
                    cursor: 'pointer', 
                    position: 'absolute', 
                    width: '100%', 
                    height: '100%', 
                    top: 0, 
                    left: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    borderRadius: '8px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                >
                  <span style={{ color: 'white', fontSize: '14px', fontWeight: '500' }}>
                    Change Image
                  </span>
                </label>
                
                {/* Show Remove BG button only for file uploads, not URL images or wishlist items */}
                {isFileUpload && uploadedFile && !isUsingProcessedImage && (
                  <RemoveBgButton 
                    onClick={handleRemoveBackground} 
                    disabled={isProcessing}
                    title="Remove background from image"
                  >
                    <FiScissors />
                    {isProcessing ? 'Processing...' : 'Remove BG'}
                  </RemoveBgButton>
                )}
              </>
            ) : (
              <>
                <UploadIcon>
                  <FaCloudUploadAlt size={24} />
                </UploadIcon>
                <UploadText>Upload a photo</UploadText>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onFileUpload}
                  style={{ display: 'none' }}
                  id="photo-upload"
                />
                <label htmlFor="photo-upload" style={{ cursor: 'pointer', position: 'absolute', width: '100%', height: '100%', top: 0, left: 0 }} />
              </>
            )}
          </UploadArea>
          
          {/* Right Column - Controls */}
          <ControlsArea>
            {/* Image Link Input */}
            <FormField label="Or paste image link">
              <FormInput
                value={imageLink}
                onChange={(e) => onImageLinkChange(e.target.value)}
                placeholder="https://example.com/your-image.jpg"
                leftIcon={<FaLink size={14} />}
                size="medium"
                variant="outline"
                isFullWidth
              />
            </FormField>
            
            {/* Action Buttons */}
            <ButtonGroup>
              <Button variant="secondary" outlined onClick={onOpenWishlistModal}>Select from Wishlist</Button>
              <Button variant="primary" onClick={onCheckItem}
                disabled={isLoading || (!imageLink.trim())}>
                {isLoading ? 'Analyzing...' : 'Start AI Check'}</Button>
            </ButtonGroup>
          </ControlsArea>
        </AICheckContent>

      </CardContent>
    </AICard>
    </>
  );
};

export default AICheckCard;
