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
  PrimaryButton,
  SecondaryButton,
} from '../../pages/AIAssistantPage.styles';

interface AICheckCardProps {
  imageLink: string;
  onImageLinkChange: (value: string) => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCheckItem: () => void;
  isLoading: boolean;
  error: string;
  itemCheckResponse: string | null;
}

const AICheckCard: React.FC<AICheckCardProps> = ({
  imageLink,
  onImageLinkChange,
  onFileUpload,
  onCheckItem,
  isLoading,
  error,
  itemCheckResponse,
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
              <SecondaryButton>
                ❤️ Select from Wishlist
              </SecondaryButton>
              <PrimaryButton
                onClick={onCheckItem}
                disabled={isLoading || (!imageLink.trim())}
              >
                {isLoading ? 'Analyzing...' : '📷 Start AI Check'}
              </PrimaryButton>
            </ButtonGroup>
          </ControlsArea>
        </AICheckContent>
        
        {/* Error Message */}
        {error && (
          <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '1rem' }}>
            {error}
          </div>
        )}
        
        {/* Check Response */}
        {itemCheckResponse && (
          <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
            <h4 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem' }}>AI Analysis</h4>
            <p style={{ color: '#4b5563', lineHeight: '1.6' }}>{itemCheckResponse}</p>
          </div>
        )}
      </CardContent>
    </AICard>
  );
};

export default AICheckCard;
