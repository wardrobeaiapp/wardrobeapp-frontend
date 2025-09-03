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

export const useImageUrl = (item: WardrobeItem | null): UseImageUrlResult => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!item?.imageUrl) {
      setIsLoading(false);
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
