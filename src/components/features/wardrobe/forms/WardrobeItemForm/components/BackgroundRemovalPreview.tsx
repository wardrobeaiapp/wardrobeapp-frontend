import React from 'react';
import styled from 'styled-components';
import Modal from '../../../../../common/Modal/Modal';

const PreviewContainer = styled.div`
  display: flex;
  gap: 20px;
  margin: 20px 0;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
  }
`;

const ImagePreview = styled.div`
  flex: 1;
  text-align: center;
`;

const ImageLabel = styled.h4`
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.theme.colors.textPrimary};
`;

const PreviewImage = styled.img`
  width: 100%;
  max-width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.backgroundSecondary};
  
  /* Checkerboard pattern for transparent backgrounds */
  background-image: 
    linear-gradient(45deg, #ccc 25%, transparent 25%),
    linear-gradient(-45deg, #ccc 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #ccc 75%),
    linear-gradient(-45deg, transparent 75%, #ccc 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
`;

const InfoText = styled.p`
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 13px;
  margin: 10px 0 0 0;
  line-height: 1.4;
`;

interface BackgroundRemovalPreviewProps {
  isOpen: boolean;
  originalImage: string;
  processedImage: string;
  onUseOriginal: () => void;
  onUseProcessed: () => Promise<void>;
  onClose: () => void;
  isProcessing?: boolean;
}

export const BackgroundRemovalPreview: React.FC<BackgroundRemovalPreviewProps> = ({
  isOpen,
  originalImage,
  processedImage,
  onUseOriginal,
  onUseProcessed,
  onClose,
  isProcessing = false
}) => {
  const [isUsingProcessed, setIsUsingProcessed] = React.useState(false);
  
  const handleUseProcessed = async () => {
    setIsUsingProcessed(true);
    try {
      await onUseProcessed();
    } catch (error) {
      console.error('Error using processed image:', error);
    } finally {
      setIsUsingProcessed(false);
    }
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Background Removal Preview"
      size="lg"
      actions={[
        {
          label: 'Use Original',
          onClick: onUseOriginal,
          variant: 'secondary',
          disabled: isUsingProcessed
        },
        {
          label: isUsingProcessed ? 'Saving...' : 'Use Processed',
          onClick: handleUseProcessed,
          variant: 'primary',
          disabled: isUsingProcessed
        }
      ]}
    >
      <PreviewContainer>
        <ImagePreview>
          <ImageLabel>Original</ImageLabel>
          <PreviewImage src={originalImage} alt="Original image" />
        </ImagePreview>
        
        <ImagePreview>
          <ImageLabel>Background Removed</ImageLabel>
          <PreviewImage src={processedImage} alt="Processed image" />
        </ImagePreview>
      </PreviewContainer>
      
      <InfoText>
        Compare the original and processed images above. The processed image will have a transparent background that you can see as the checkerboard pattern.
      </InfoText>
    </Modal>
  );
};
