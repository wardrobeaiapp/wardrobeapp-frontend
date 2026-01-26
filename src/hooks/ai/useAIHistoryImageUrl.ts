import { useState, useEffect, useRef, useCallback } from 'react';
import { generateAIHistorySignedUrl } from '../../services/ai/aiHistoryImageService';

const RENEWAL_BUFFER_MS = 24 * 60 * 60 * 1000; // 1 day before expiration
const MAX_RETRIES = 3;

interface UseAIHistoryImageUrlResult {
  imageUrl: string | null;
  isLoading: boolean;
  error: string | null;
  onImageError: () => void;
}

export const useAIHistoryImageUrl = (imageFilePath: string | null, initialImageUrl?: string | null): UseAIHistoryImageUrlResult => {
  const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl || null);
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

  // Generate fresh signed URL
  const generateFreshUrl = useCallback(async (isRetry: boolean = false) => {
    if (!imageFilePath) {
      console.log('[useAIHistoryImageUrl] No file path provided');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(`[useAIHistoryImageUrl] Generating fresh URL for: ${imageFilePath}`);
      const freshUrl = await generateAIHistorySignedUrl(imageFilePath);
      
      setImageUrl(freshUrl);
      console.log('[useAIHistoryImageUrl] Generated fresh URL successfully');
      
      // Reset retry count on success
      retryCountRef.current = 0;
      
      // Set up renewal timer
      clearRenewalTimer();
      renewalTimerRef.current = setTimeout(() => {
        console.log('[useAIHistoryImageUrl] URL expiring soon, renewing...');
        generateFreshUrl();
      }, 3600000 - RENEWAL_BUFFER_MS); // Renew 1 hour before expiration
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('[useAIHistoryImageUrl] Failed to generate fresh URL:', errorMessage);
      
      if (isRetry && retryCountRef.current >= MAX_RETRIES) {
        setError(`Failed to load image after ${MAX_RETRIES} attempts: ${errorMessage}`);
        console.log('[useAIHistoryImageUrl] Max retries reached, giving up');
      } else {
        retryCountRef.current += 1;
        console.log(`[useAIHistoryImageUrl] Retry ${retryCountRef.current}/${MAX_RETRIES} in 2 seconds...`);
        setTimeout(() => generateFreshUrl(true), 2000);
      }
    } finally {
      setIsLoading(false);
    }
  }, [imageFilePath, clearRenewalTimer]);

  // Store the function in ref for access in error handler
  generateFreshUrlRef.current = generateFreshUrl;

  // Handle image load errors
  const onImageError = useCallback(() => {
    console.log('[useAIHistoryImageUrl] Image load error, generating fresh URL...');
    if (generateFreshUrlRef.current) {
      generateFreshUrlRef.current(true);
    }
  }, []);

  // Initialize URL generation
  useEffect(() => {
    if (imageFilePath && !initialImageUrl) {
      generateFreshUrl();
    }

    return () => {
      clearRenewalTimer();
    };
  }, [imageFilePath, initialImageUrl, generateFreshUrl, clearRenewalTimer]);

  return {
    imageUrl,
    isLoading,
    error,
    onImageError
  };
};
