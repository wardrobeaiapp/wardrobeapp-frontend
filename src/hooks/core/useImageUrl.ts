import { useState, useEffect, useRef, useCallback } from 'react';
import { generateSignedUrl } from '../../services/wardrobe/items';
import { updateItemImageUrl } from '../../services/wardrobe/items';
import { WardrobeItem } from '../../types';

const RENEWAL_BUFFER_MS = 24 * 60 * 60 * 1000; // 1 day before expiration
const MAX_RETRIES = 3;

interface UseImageUrlResult {
  imageUrl: string | null;
  isLoading: boolean;
  error: string | null;
  onImageError: () => void;
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
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const renewalTimerRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const generateFreshUrlRef = useRef<((isRetry?: boolean) => Promise<void>) | null>(null);
  
  // Clear any pending renewal timer
  const clearRenewalTimer = useCallback(() => {
    if (renewalTimerRef.current) {
      clearTimeout(renewalTimerRef.current);
      renewalTimerRef.current = null;
    }
  }, []);

  // Schedule URL renewal before expiration
  const scheduleRenewal = useCallback((expiryDate: Date) => {
    clearRenewalTimer();
    
    const now = new Date();
    const timeUntilRenewal = expiryDate.getTime() - now.getTime() - RENEWAL_BUFFER_MS;
    
    if (timeUntilRenewal > 0) {
      renewalTimerRef.current = setTimeout(() => {
        console.log('[useImageUrl] Proactively renewing URL before expiration');
        generateFreshUrlRef.current?.();
      }, timeUntilRenewal);
    } else {
      // If we're already within the renewal window, renew immediately
      console.log('[useImageUrl] Within renewal window, renewing URL now');
      generateFreshUrlRef.current?.();
    }
  }, [clearRenewalTimer]);

  // Utility to defer non-critical operations to idle time
  const deferToIdle = useCallback((callback: () => void | Promise<void>) => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(async () => {
        await callback();
      }, { timeout: 2000 });
    } else {
      setTimeout(async () => {
        await callback();
      }, 10);
    }
  }, []);

  // Generate fresh URL with retry logic
  const generateFreshUrl = useCallback(async (isRetry = false): Promise<void> => {
    if (!item?.imageUrl) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Extract file path from expired URL or use stored path
      let filePath = item.imageUrl;
      
      // Defer console logging to idle time to avoid blocking
      deferToIdle(() => {
        console.log('[useImageUrl] Processing URL for renewal:', filePath);
      });
      
      // If it's a Supabase URL (signed or storage), extract the file path
      if (filePath.includes('supabase')) {
        // Try different patterns to extract the path
        let pathMatch = filePath.match(/\/wardrobe-images\/([^?]+)/);
        
        if (!pathMatch) {
          // Try alternative pattern for storage URLs
          pathMatch = filePath.match(/\/storage\/v1\/object\/public\/wardrobe-images\/([^?]+)/);
        }
        
        if (pathMatch) {
          filePath = pathMatch[1];
          deferToIdle(() => {
            console.log('[useImageUrl] Extracted file path:', filePath);
          });
        }
      }
      
      deferToIdle(() => {
        console.log(`[useImageUrl] Generating fresh URL for ${filePath}${isRetry ? ' (retry attempt ' + (retryCountRef.current + 1) + ')' : ''}`);
      });
      
      const freshUrl = await generateSignedUrl(filePath, 604800); // 7 days for production
      
      if (!freshUrl) {
        throw new Error('Empty URL returned from generateSignedUrl');
      }
      
      setImageUrl(freshUrl);
      retryCountRef.current = 0; // Reset retry counter on success
      
      // Defer database update to idle time - non-critical for UI
      const newExpiry = new Date(Date.now() + (604800 * 1000)); // 7 days from now
      deferToIdle(async () => {
        try {
          // Only update database for items with proper UUIDs (not temporary IDs)
          const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(item.id);
          if (isValidUUID) {
            await updateItemImageUrl(item.id, freshUrl, newExpiry);
            console.log('[useImageUrl] Generated and cached fresh URL for image, expires:', newExpiry);
          } else {
            console.log('[useImageUrl] Skipping database update for temporary item ID:', item.id);
          }
        } catch (updateError) {
          console.error('[useImageUrl] Failed to update image URL in database:', updateError);
        }
      });
      
      // Schedule next renewal
      scheduleRenewal(newExpiry);
      
    } catch (err) {
      deferToIdle(() => {
        console.error('Fresh URL generation error:', err);
      });
      
      // Only retry if we haven't exceeded max retries
      if (retryCountRef.current < MAX_RETRIES) {
        retryCountRef.current += 1;
        const retryDelay = Math.min(1000 * Math.pow(2, retryCountRef.current), 30000); // Exponential backoff, max 30s
        deferToIdle(() => {
          console.log(`[useImageUrl] Retry ${retryCountRef.current}/${MAX_RETRIES} in ${retryDelay}ms`);
        });
        
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return generateFreshUrl(true);
      }
      
      setError('Failed to refresh image URL after multiple attempts');
    } finally {
      setIsLoading(false);
    }
  }, [item?.id, item?.imageUrl, scheduleRenewal, deferToIdle]);
  
  // Store the latest version of generateFreshUrl in the ref
  useEffect(() => {
    generateFreshUrlRef.current = generateFreshUrl;
  }, [generateFreshUrl]);

  // Function to handle retail site images with CORS issues by proxying through our backend
  const handleRetailSiteImage = useCallback(async (url: string) => {
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
  }, []);

  const handleImageError = useCallback(() => {
    console.log('[useImageUrl] Image failed to load, attempting to regenerate URL');
    generateFreshUrl();
  }, [generateFreshUrl]);

  // Main effect to handle URL validation and renewal
  useEffect(() => {
    if (!item?.imageUrl) {
      setImageUrl(null);
      setIsLoading(false);
      setError(null);
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
      // URL is still valid - use it instantly and schedule renewal
      setImageUrl(item.imageUrl);
      setError(null);
      setIsLoading(false);
      
      // Schedule renewal before expiration
      if (item.imageExpiry) {
        scheduleRenewal(new Date(item.imageExpiry));
      }
      return;
    }

    // URL is expired - need to regenerate (this should be rare)
    console.log('[useImageUrl] URL expired, regenerating for item:', item.id);
    generateFreshUrl();
  }, [item?.id, item?.imageUrl, item?.imageExpiry, generateFreshUrl, handleRetailSiteImage, scheduleRenewal]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      clearRenewalTimer();
    };
  }, [clearRenewalTimer]);

  return { imageUrl, isLoading, error, onImageError: handleImageError };
};
