import React, { useState } from 'react';
import styled from 'styled-components';
import { PageHeader } from '../components/common/Typography/PageHeader';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
`;


const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    background-color: #4338ca;
  }
  
  &:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }
`;

const ImagePreview = styled.div`
  width: 100%;
  max-width: 400px;
  height: 300px;
  background-color: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  border-radius: 0.5rem;
  overflow: hidden;
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ResultContainer = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  background-color: #f3f4f6;
  border-radius: 0.5rem;
  white-space: pre-wrap;
`;

const TestImageUpload: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [displayedImage, setDisplayedImage] = useState<string | null>(null);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          setSelectedImage(event.target.result);
        }
      };
      
      reader.readAsDataURL(e.target.files[0]);
    }
  };
  
  const handleUpload = async () => {
    if (!selectedImage) return;
    
    setLoading(true);
    try {
      console.log(`Sending image data to test endpoint (length: ${selectedImage.length} chars)`);
      const response = await fetch(`${API_URL}/wardrobe-items/test-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: selectedImage
        })
      });
      
      const result = await response.json();
      setUploadResult(result);
      
      if (result.success && result.fullUrl) {
        setDisplayedImage(result.fullUrl);
        // Log the image URL from server, but truncate if it's a base64 string
        const truncatedUrl = result.fullUrl.startsWith('data:image/') 
          ? `${result.fullUrl.split(';')[0]}... (${result.fullUrl.length} chars)` 
          : result.fullUrl;
        console.log('Image URL from server:', truncatedUrl);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadResult({ error: 'Failed to upload image' });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container>
      <PageHeader 
        title="Image Upload Test" 
        style={{ marginBottom: '2rem' }}
      />
      
      <Form>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleImageChange} 
          disabled={loading}
        />
        
        {selectedImage && (
          <ImagePreview>
            <PreviewImage src={selectedImage} alt="Selected" />
          </ImagePreview>
        )}
        
        <Button 
          onClick={handleUpload} 
          disabled={!selectedImage || loading}
        >
          {loading ? 'Uploading...' : 'Test Upload'}
        </Button>
      </Form>
      
      {uploadResult && (
        <ResultContainer>
          <h3>Upload Result:</h3>
          <pre>{JSON.stringify(uploadResult, null, 2)}</pre>
        </ResultContainer>
      )}
      
      {displayedImage && (
        <>
          <h3>Displayed Image from Server URL:</h3>
          <ImagePreview>
            <PreviewImage 
              src={displayedImage} 
              alt="From Server" 
              onError={() => console.error('Error loading image from server URL')}
            />
          </ImagePreview>
          <p>Image URL: {displayedImage.startsWith('data:image/') 
            ? `${displayedImage.split(';')[0]}... (${displayedImage.length} chars)` 
            : displayedImage}</p>
        </>
      )}
    </Container>
  );
};

export default TestImageUpload;
