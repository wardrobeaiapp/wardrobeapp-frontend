import React, { useRef } from 'react';
import { MdCloudUpload } from 'react-icons/md';
import { FiScissors } from 'react-icons/fi';
import {
  PhotoUploadArea,
  PhotoUploadContent,
  UploadIcon,
  UploadText,
  BrowseButton,
  FileInfo
} from '../WardrobeItemForm.styles';
import styled from 'styled-components';

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

interface ImageUploadSectionProps {
  previewImage: string | null;
  selectedFile: File | null;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onFileSelect: (file: File) => void;
  onRemoveBackground?: () => void;
  isProcessingBackground?: boolean;
  error?: string;
}

export const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({
  previewImage,
  selectedFile,
  onDrop,
  onDragOver,
  onFileSelect,
  onRemoveBackground,
  isProcessingBackground = false,
  error
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <>
      <PhotoUploadArea
        onDrop={onDrop}
        onDragOver={onDragOver}
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
            {selectedFile && onRemoveBackground && (
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
            <UploadText>Drag and drop an image here</UploadText>
            <BrowseButton type="button" onClick={handleBrowseClick}>
              Browse Files
            </BrowseButton>
            <FileInfo>Supports: JPEG, PNG, WebP (Max: 10MB)</FileInfo>
          </PhotoUploadContent>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          aria-label="Upload wardrobe item image"
        />
      </PhotoUploadArea>
      
      {error && (
        <div style={{ color: 'red', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}
    </>
  );
};
