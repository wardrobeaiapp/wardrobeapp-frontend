import React from 'react';
import Button from '../Button';
import {
  FormScreen,
  ScreenTitle,
  FormGroup,
  ImageUploadButtons,
  FileInputLabel,
  FileInput,
  ImagePreviewContainer,
  ImagePreview,
  Input,
  NavigationButtons
} from '../WardrobeItemForm.styles';

interface ImageScreenProps {
  imageUrl: string;
  setImageUrl: (url: string) => void;
  previewImage: string | null;
  onCancel: () => void;
  setCurrentScreen: React.Dispatch<React.SetStateAction<'image' | 'category' | 'subcategory' | 'color' | 'details'>>;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

const ImageScreen: React.FC<ImageScreenProps> = ({
  imageUrl,
  setImageUrl,
  previewImage,
  onCancel,
  setCurrentScreen,
  handleImageChange,
  fileInputRef
}) => {

  return (
    <FormScreen>
      <ScreenTitle>Add Item Image</ScreenTitle>
      <FormGroup>
        <ImageUploadButtons>
          <FileInputLabel htmlFor="image-upload">
            Upload from Gallery
            <FileInput
              id="image-upload"
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
            />
          </FileInputLabel>
        </ImageUploadButtons>
        
        {previewImage && (
          <ImagePreviewContainer>
            <ImagePreview src={previewImage} alt="Item preview" />
          </ImagePreviewContainer>
        )}
        
        <Input
          id="imageUrl"
          type="text"
          value={imageUrl}
          onChange={e => setImageUrl(e.target.value)}
          placeholder="Or enter an image URL"
          style={{ marginTop: '0.5rem' }}
        />
      </FormGroup>
      
      <NavigationButtons>
        <Button type="button" outlined onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" primary onClick={() => setCurrentScreen('category')}>
          Next
        </Button>
      </NavigationButtons>
    </FormScreen>
  );
};

export default ImageScreen;
