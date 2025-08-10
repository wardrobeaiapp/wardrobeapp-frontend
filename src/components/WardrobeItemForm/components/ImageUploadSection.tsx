import React, { useRef } from 'react';
import { MdCloudUpload } from 'react-icons/md';
import {
  PhotoUploadArea,
  PhotoUploadContent,
  UploadIcon,
  UploadText,
  BrowseButton,
  FileInfo
} from '../../../components/WardrobeItemForm.styles';

interface ImageUploadSectionProps {
  previewImage: string | null;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onFileSelect: (file: File) => void;
  error?: string;
}

export const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({
  previewImage,
  onDrop,
  onDragOver,
  onFileSelect,
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
