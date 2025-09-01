import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { PageHeader } from '../components/common/Typography/PageHeader';
import { saveImageFromUrl, isValidImageUrl } from '../services/core/imageService';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;


const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 600px;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
  width: 100%;
  
  &:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: background-color 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background-color: #4338ca;
  }
  
  &:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
    opacity: 0.7;
  }
  
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

const TestImageUpload = () => {
  useEffect(() => {
    console.log('TestImageUpload component mounted');
    
    // Check if the button exists in the DOM
    const button = document.querySelector('button[type="button"]');
    console.log('Button found in DOM:', !!button);
    
    if (button) {
      // Check for any global styles that might be affecting the button
      const buttonStyles = window.getComputedStyle(button);
      console.log('Button styles:', {
        display: buttonStyles.display,
        visibility: buttonStyles.visibility,
        opacity: buttonStyles.opacity,
        pointerEvents: buttonStyles.pointerEvents,
        cursor: buttonStyles.cursor,
      });
      
      // Add a direct event listener to test if clicks are being captured
      const handleClick = (e: Event) => {
        console.log('Direct click event captured on button', e);
        e.stopPropagation();
      };
      
      button.addEventListener('click', handleClick, true); // Use capture phase
      
      return () => {
        button.removeEventListener('click', handleClick, true);
      };
    }
  }, []);
  const [imageUrl, setImageUrl] = useState('');
  const [preview, setPreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [savedUrl, setSavedUrl] = useState<string>('');

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value.trim();
    setImageUrl(url);
    
    // Clear previous state
    setError('');
    setSavedUrl('');
    
    // Set preview if URL is valid
    if (isValidImageUrl(url)) {
      setPreview(url);
    } else if (preview) {
      setPreview('');
    }
  };

  const handleSaveImage = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Save button clicked');
    
    if (!imageUrl) {
      const errorMsg = 'Please enter an image URL';
      console.error(errorMsg);
      setError(errorMsg);
      return;
    }
    
    if (!isValidImageUrl(imageUrl)) {
      const errorMsg = 'Please enter a valid image URL (must start with http:// or https://)';
      console.error(errorMsg);
      setError(errorMsg);
      return;
    }

    console.log('Starting image save process...');
    setIsLoading(true);
    setError('');
    setSavedUrl('');
    setPreview(imageUrl); // Set preview immediately

    try {
      console.log('Calling saveImageFromUrl...');
      const publicUrl = await saveImageFromUrl(imageUrl);
      
      if (!publicUrl) {
        throw new Error('No URL returned from image upload');
      }
      
      console.log('Image saved successfully:', publicUrl);
      setSavedUrl(publicUrl);
      
      // Verify the URL is accessible
      try {
        console.log('Verifying image URL...');
        const verifyResponse = await fetch(publicUrl, { method: 'HEAD' });
        if (!verifyResponse.ok) {
          console.warn('Warning: Image URL verification failed:', verifyResponse.status);
        }
      } catch (verifyError) {
        console.warn('Warning: Could not verify image URL:', verifyError);
      }
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to save image';
      console.error('Error in handleSaveImage:', errorMsg, err);
      setError(`Error: ${errorMsg}. Check console for details.`);
    } finally {
      console.log('Save process completed');
      setIsLoading(false);
    }
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Save button clicked - handleSaveClick', {
      target: e.target,
      currentTarget: e.currentTarget,
      eventPhase: e.eventPhase,
      bubbles: e.bubbles,
      defaultPrevented: e.defaultPrevented,
    });
    handleSaveImage(e);
  };

  const handleTestClick = () => {
    console.log('Test button clicked!');
    alert('Test button works!');
  };

  return (
    <Container>
      <PageHeader title="Test Image URL Saver" />
      
      {/* Test button outside the form */}
      <div style={{ marginBottom: '20px' }}>
        <Button 
          type="button" 
          onClick={handleTestClick}
          style={{ backgroundColor: '#10b981' }}
        >
          Test Button (Check Console)
        </Button>
      </div>
      
      <Form>
        <div>
          <label htmlFor="imageUrl" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
            Image URL
          </label>
          <Input
            id="imageUrl"
            type="url"
            value={imageUrl}
            onChange={handleUrlChange}
            placeholder="https://example.com/image.jpg"
            disabled={isLoading}
            onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
          />
        </div>
        
        <div>
          <div style={{ 
            padding: '20px', 
            border: '2px solid red',
            margin: '10px 0',
            position: 'relative',
            zIndex: 1000
          }}>
            <div style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255,0,0,0.1)',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'red',
              fontWeight: 'bold'
            }}>
              Click Test Area
            </div>
            <Button 
              type="button" 
              onClick={handleSaveClick}
              onMouseDown={e => console.log('Button mouse down', e)}
              onMouseUp={e => console.log('Button mouse up', e)}
              disabled={isLoading || !imageUrl}
              style={{ 
                marginTop: '1rem',
                position: 'relative',
                zIndex: 1001,
                pointerEvents: 'auto'
              }}
            >
              {isLoading ? 'Saving...' : 'Save Image to Storage'}
            </Button>
          </div>
        </div>
        
        {error && <div style={{ color: '#ef4444', marginTop: '0.5rem' }}>Error: {error}</div>}
        {savedUrl && (
          <div style={{ marginTop: '1rem' }}>
            <div style={{ color: '#10b981', marginBottom: '0.5rem' }}>
              Image saved successfully!
            </div>
            <div style={{ wordBreak: 'break-all', fontSize: '0.875rem', color: '#4b5563' }}>
              Public URL: <a href={savedUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>
                {savedUrl}
              </a>
            </div>
          </div>
        )}
        
        {preview && (
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Preview:</h3>
            <ImagePreview>
              <img 
                src={preview} 
                alt="Preview" 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '100%',
                  objectFit: 'contain'
                }} 
              />
            </ImagePreview>
          </div>
        )}
      </Form>
    </Container>
  );
};

export default TestImageUpload;
