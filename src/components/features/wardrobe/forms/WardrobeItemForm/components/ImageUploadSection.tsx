import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { MdCloudUpload, MdLink } from 'react-icons/md';
import { FiScissors } from 'react-icons/fi';
import {
  PhotoUploadArea,
  PhotoUploadContent,
  UploadIcon,
  UploadText,
  BrowseButton,
  FileInfo
} from '../WardrobeItemForm.styles';

const ImagePreviewContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const RemoveBackgroundButton = styled.button`
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

const InputModeToggle = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  padding: 4px;
  background: ${props => props.theme.colors.background};
`;

const ToggleButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  
  background: ${props => props.$active ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.$active ? 'white' : props.theme.colors.textSecondary};
  
  &:hover {
    background: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.background};
    color: ${props => props.$active ? 'white' : props.theme.colors.textPrimary};
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const UrlInputContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
`;

const UrlInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.textSecondary};
  }
`;

const LoadUrlButton = styled.button`
  padding: 12px 20px;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    background: ${props => props.theme.colors.primaryDark};
  }
  
  &:disabled {
    background: ${props => props.theme.colors.textSecondary};
    cursor: not-allowed;
  }
`;

interface ImageUploadSectionProps {
  selectedFile: File | null;
  previewImage: string | null;
  onFileSelect: (file: File) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onRemoveBackground?: () => void;
  isProcessingBackground?: boolean;
  isUsingProcessedImage?: boolean;
  onUrlLoad?: (url: string) => void;
  isLoadingUrl?: boolean;
  isImageFromUrl?: boolean;
  error?: string;
}

export const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({
  previewImage,
  selectedFile,
  onDrop,
  onDragOver,
  onFileSelect,
  onUrlLoad,
  onRemoveBackground,
  isProcessingBackground = false,
  isUsingProcessedImage = false,
  isLoadingUrl = false,
  isImageFromUrl = false,
  error
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [inputMode, setInputMode] = useState<'file' | 'url'>('file');
  const [imageUrl, setImageUrl] = useState('');

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleUrlSubmit = () => {
    if (imageUrl.trim() && onUrlLoad) {
      onUrlLoad(imageUrl.trim());
    }
  };

  const handleUrlInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value);
  };

  return (
    <>
      <InputModeToggle>
        <ToggleButton 
          type="button"
          $active={inputMode === 'file'}
          onClick={() => setInputMode('file')}
        >
          <MdCloudUpload />
          Upload File
        </ToggleButton>
        <ToggleButton 
          type="button"
          $active={inputMode === 'url'}
          onClick={() => setInputMode('url')}
        >
          <MdLink />
          From URL
        </ToggleButton>
      </InputModeToggle>

      {inputMode === 'url' && (
        <UrlInputContainer>
          <UrlInput
            type="url"
            placeholder="Paste image URL here..."
            value={imageUrl}
            onChange={handleUrlInputChange}
            disabled={isLoadingUrl}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleUrlSubmit();
              }
            }}
          />
          <LoadUrlButton 
            type="button" 
            disabled={!imageUrl.trim() || isLoadingUrl}
            onClick={handleUrlSubmit}
          >
            {isLoadingUrl ? 'Loading...' : 'Load Image'}
          </LoadUrlButton>
        </UrlInputContainer>
      )}

      <PhotoUploadArea
        onDrop={inputMode === 'file' ? onDrop : undefined}
        onDragOver={inputMode === 'file' ? onDragOver : undefined}
        style={{ 
          opacity: previewImage ? 1 : (inputMode === 'file' ? 1 : 0.5),
          pointerEvents: inputMode === 'file' ? 'auto' : 'none'
        }}
      >
        {previewImage ? (
          <ImagePreviewContainer>
            <img
              src={previewImage}
              alt="Preview"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '8px'
              }}
            />
            {selectedFile && onRemoveBackground && !isUsingProcessedImage && !isImageFromUrl && inputMode !== 'url' && (
              <RemoveBackgroundButton
                type="button"
                onClick={onRemoveBackground}
                disabled={isProcessingBackground}
                title="Remove background from image"
              >
                <FiScissors />
                {isProcessingBackground ? 'Processing...' : 'Remove BG'}
              </RemoveBackgroundButton>
            )}
          </ImagePreviewContainer>
        ) : (
          <PhotoUploadContent>
            <UploadIcon>
              <MdCloudUpload />
            </UploadIcon>
            <UploadText>
              {inputMode === 'file' 
                ? 'Drag and drop an image here' 
                : 'Select "Upload File" to use drag & drop'
              }
            </UploadText>
            {inputMode === 'file' && (
              <>
                <BrowseButton type="button" onClick={handleBrowseClick}>
                  Browse Files
                </BrowseButton>
                <FileInfo>Supports: JPEG, PNG, WebP (Max: 10MB)</FileInfo>
              </>
            )}
          </PhotoUploadContent>
        )}
        
        {inputMode === 'file' && (
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            aria-label="Upload wardrobe item image"
          />
        )}
      </PhotoUploadArea>
      
      {error && (
        <div style={{ color: 'red', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}
    </>
  );
};
