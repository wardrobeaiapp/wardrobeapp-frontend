import React from 'react';
import { WardrobeItem } from '../../../../../types';
import { useImageUrl } from '../../../../../hooks/core';

interface ItemImageProps {
  item: WardrobeItem;
  alt: string;
  className?: string;
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

/**
 * Item image component that automatically handles URL renewal for expired Supabase signed URLs
 * This prevents gray placeholders in modals and other components
 */
const ItemImage: React.FC<ItemImageProps> = ({ 
  item, 
  alt, 
  className,
  onError 
}) => {
  // Handle base64 images directly, use renewal hook for Supabase URLs
  const isBase64Image = item.imageUrl?.startsWith('data:image/');
  const { imageUrl, isLoading, error, onImageError } = useImageUrl(isBase64Image ? null : item);
  
  // For base64 images, use them directly; otherwise use the renewed URL
  const finalImageUrl = isBase64Image ? item.imageUrl : imageUrl;
  
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    // Try URL renewal first if available
    if (onImageError && !isBase64Image) {
      onImageError();
    }
    
    // Call custom error handler if provided
    if (onError) {
      onError(e);
    } else {
      // Default fallback - hide broken image
      (e.target as HTMLImageElement).style.display = 'none';
    }
  };

  if (!finalImageUrl && !isLoading) {
    return null; // No image available
  }

  if (error) {
    return null; // Failed to load image after renewal attempts
  }

  return (
    <img
      src={finalImageUrl}
      alt={alt}
      className={className}
      onError={handleImageError}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        opacity: isLoading ? 0.5 : 1,
        transition: 'opacity 0.2s ease'
      }}
    />
  );
};

export default ItemImage;
