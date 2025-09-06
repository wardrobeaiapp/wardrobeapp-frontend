import { useState, useEffect } from 'react';
import { generateSignedUrl } from '../../services/wardrobe/items';
import { updateItemImageUrl } from '../../services/wardrobe/items/updateItemImageUrl';
import { WardrobeItem } from '../../types';

interface UseImageUrlResult {
  imageUrl: string;
  isLoading: boolean;
  error: string | null;
  onImageError?: () => void;
}

// Helper function to check if a URL is from a retail site with CORS issues
const isRetailSiteUrl = (url: string): boolean => {
  try {
    const retailDomains = [
      'reserved.com',
      'static.reserved.com',
      'shop.mango.com',
      'mango.com',
      'zara.com',
      'hm.com',
      'asos.com',
      'nordstrom.com'
    ];
    
    const domain = new URL(url).hostname;
    return retailDomains.some(retailDomain => domain.includes(retailDomain));
  } catch (e) {
    return false;
  }
};

export const useImageUrl = (item: WardrobeItem | null): UseImageUrlResult => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Function to handle retail site images with CORS issues by proxying through our backend
  const handleRetailSiteImage = async (url: string) => {
    try {
      setIsLoading(true);
      console.log('[useImageUrl] Retail site image detected, proxying:', url);
      
      // Import the imageService to save the image to our backend
      const { saveImageFromUrl } = await import('../../services/core/imageService');
      
      // Save the image to our storage
      const savedImageUrl = await saveImageFromUrl(url, 'retail-images');
      console.log('[useImageUrl] Image saved to backend:', savedImageUrl);
      
      // Update the state
      setImageUrl(savedImageUrl);
      setError(null);
    } catch (err) {
      console.error('[useImageUrl] Error handling retail site image:', err);
      setError('Failed to load retail site image');
      
      // Fallback to original URL and let the browser handle CORS error
      setImageUrl(url);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!item?.imageUrl) {
      setIsLoading(false);
      return;
    }

    // Check if it's a retail site URL that might have CORS issues
    const isRetailUrl = isRetailSiteUrl(item.imageUrl);
    if (isRetailUrl) {
      handleRetailSiteImage(item.imageUrl);
      return;
    }

    // Check if stored URL is still valid (backwards compatibility)
    const isUrlExpired = item.imageExpiry ? new Date(item.imageExpiry) <= new Date() : false;
    
    if (!isUrlExpired) {
      // URL is still valid - use it instantly!
      setImageUrl(item.imageUrl);
      setError(null);
      setIsLoading(false);
      return;
    }

    // URL is expired - need to regenerate (this should be rare)
    console.log('[useImageUrl] URL expired, regenerating for item:', item.id);
    generateFreshUrl();
  }, [item?.id, item?.imageUrl, item?.imageExpiry]);

  const generateFreshUrl = async () => {
    if (!item?.imageUrl) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Extract file path from expired URL or use stored path
      let filePath = item.imageUrl;
      
      // If it's a signed URL, extract the file path
      if (filePath.includes('/storage/v1/object/sign/')) {
        const pathMatch = filePath.match(/\/wardrobe-images\/([^?]+)/);
        if (pathMatch) {
          filePath = pathMatch[1];
        }
      }
      
      const freshUrl = await generateSignedUrl(filePath, 604800); // 7 days for production
      setImageUrl(freshUrl);
      
      // Update database with fresh URL and new 7-day expiry
      const newExpiry = new Date(Date.now() + (604800 * 1000)); // 7 days from now
      await updateItemImageUrl(item.id, freshUrl, newExpiry);
      console.log('[useImageUrl] Generated and cached fresh URL for expired image');
      
    } catch (err) {
      setError('Failed to refresh image URL');
      console.error('Fresh URL generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageError = () => {
    // This will be called when image fails to load (expired URL)
    console.log('[useImageUrl] Image failed to load, regenerating URL');
    generateFreshUrl();
  };

  return { imageUrl, isLoading, error, onImageError: handleImageError };
};
