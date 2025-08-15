import React from 'react';
import { FaSearch, FaCloudUploadAlt } from 'react-icons/fa';
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
  InputSection,
  InputLabel,
  TextInput,
  ButtonGroup,
} from '../../../../pages/AIAssistantPage.styles';
import Button from '../../../common/Button';

interface AICheckCardProps {
  imageLink: string;
  onImageLinkChange: (value: string) => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCheckItem: () => void;
  onOpenWishlistModal: () => void;
  isLoading: boolean;
  error: string;
  itemCheckResponse: string | null;
}

const AICheckCard: React.FC<AICheckCardProps> = ({
  imageLink,
  onImageLinkChange,
  onFileUpload,
  onCheckItem,
  onOpenWishlistModal,
  isLoading,
  itemCheckResponse
}) => {
  return (
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
                  src={imageLink}
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
            <InputSection>
              <InputLabel>Or paste image link:</InputLabel>
              <TextInput
                value={imageLink}
                onChange={(e) => onImageLinkChange(e.target.value)}
                placeholder="https://example.com/your-image.jpg"
              />
            </InputSection>
            
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
  );
};

export default AICheckCard;
