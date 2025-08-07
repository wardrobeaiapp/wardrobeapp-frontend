import React, { useState } from 'react';
import styled from 'styled-components';
import { WardrobeItem, Season, WishlistStatus } from '../types';
import Button from './Button';

interface WardrobeItemCardProps {
  item: WardrobeItem;
  onView?: (item: WardrobeItem) => void; // New onView prop
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const Card = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  background-color: white;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
  background-color: #f3f4f6;
`;

const StatusIcon = styled.div<{ $status: WishlistStatus }>`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: white;
  background-color: ${props => {
    switch (props.$status) {
      case WishlistStatus.APPROVED:
        return '#4ade80'; // green
      case WishlistStatus.POTENTIAL_ISSUE:
        return '#f59e0b'; // amber
      case WishlistStatus.NOT_REVIEWED:
      default:
        return '#6b7280'; // gray
    }
  }};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 10;
`;



const ItemImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const PlaceholderImage = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 1.5rem;
`;

const CardContent = styled.div`
  padding: 1rem;
`;

const ItemName = styled.h3`
  margin: 0 0 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
`;

const ItemDetails = styled.div`
  margin-bottom: 1rem;
`;

const ItemDetail = styled.div`
  display: flex;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
  color: #4b5563;
  
  span:first-child {
    width: 5rem;
    font-weight: 500;
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const Tag = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  background-color: #e5e7eb;
  color: #4b5563;
  font-size: 0.75rem;
  font-weight: 500;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const WardrobeItemCard: React.FC<WardrobeItemCardProps> = ({ item, onView, onEdit, onDelete }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };
  
  // Function to get the full image URL (prepend API_URL for relative paths)
  const getFullImageUrl = (url?: string) => {
    if (!url) {
      console.log(`[WardrobeItemCard] Cannot get full URL: URL is empty or undefined`);
      return '';
    }
    
    // Handle data URLs (base64 images) - most important case for uploaded images
    if (url.startsWith('data:image/')) {
      console.log(`[WardrobeItemCard] Using data URL as-is (base64 image, length: ${url.length} chars)`);
      return url;
    }
    
    // Handle absolute URLs with protocol
    if (url.startsWith('http://') || url.startsWith('https://')) {
      console.log(`[WardrobeItemCard] URL already absolute with protocol, using as-is`);
      return url;
    }
    
    // Handle relative URLs from the server (both with and without leading slash)
    if (url.startsWith('/uploads/') || url.includes('/uploads/')) {
      // Normalize the URL to ensure it has a leading slash
      const normalizedUrl = url.startsWith('/') ? url : `/${url}`;
      // This is a relative URL from the server, prepend the API base URL
      const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      // Remove trailing slash from apiBaseUrl if present
      const baseUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
      const fullUrl = `${baseUrl}${normalizedUrl}`;
      console.log(`[WardrobeItemCard] Converted relative URL to full URL: ${url} → ${fullUrl}`);
      return fullUrl;
    }
    
    // Handle URLs that might be missing the protocol
    if (!url.startsWith('http') && !url.startsWith('/')) {
      console.log(`[WardrobeItemCard] URL missing protocol, adding http://: ${url}`);
      return `http://${url}`;
    }
    
    console.log(`[WardrobeItemCard] URL format not recognized, using as-is: ${url.substring(0, 30)}...`);
    return url;
  };

  // Function removed to fix ESLint warning
    
  // Add states for tracking image loading status
  const [imageFailed, setImageFailed] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  // Check if the item has a valid image URL
  // This includes checking both item.imageUrl and item.image (for backward compatibility)
  const rawImageUrl = item.imageUrl || (item as any).image || '';
  
  // Always try to load the image if we have a URL
  // For base64 images, use them directly without any processing
  const imageUrlToUse = rawImageUrl ? 
    (rawImageUrl.startsWith('data:image/') ? rawImageUrl : getFullImageUrl(rawImageUrl)) : '';
  
  // Force image refresh by adding a timestamp query parameter
  // This prevents browser caching issues that might cause images not to appear on first load
  // Skip adding timestamp for base64 images
  const imageUrlWithTimestamp = imageUrlToUse ? 
    (imageUrlToUse.startsWith('data:image/') ? imageUrlToUse : `${imageUrlToUse}${imageUrlToUse.includes('?') ? '&' : '?'}t=${Date.now()}`) : '';
  
  // Determine if we should show the image or placeholder
  // Important: For base64 images, we always want to show them even if they're very long
  const shouldShowImage = (!!imageUrlToUse && !imageFailed) || (!!item.imageUrl && item.imageUrl.startsWith('data:image/'));
  
  // Enhanced error handler that tries different URL formats
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // Skip error handling for base64 images - they should always work
    if (item.imageUrl && item.imageUrl.startsWith('data:image/')) {
      console.log(`[WardrobeItemCard] Base64 image failed to load, this should not happen. Length: ${item.imageUrl.length}`);
      return;
    }
    
    console.log(`[WardrobeItemCard] Image failed to load: ${item.imageUrl}`);
    console.log(`[WardrobeItemCard] Full image URL attempted: ${getFullImageUrl(item.imageUrl)}`);
    
    // Log error but don't need to set a separate error state
    // as we already have imageFailed for UI purposes
    
    console.log(`[WardrobeItemCard] Image load error for item ${item.id}, retry count: ${retryCount}`);
    
    if (retryCount < 2 && imageUrlToUse) {
      // Increment retry count
      const newRetryCount = retryCount + 1;
      setRetryCount(newRetryCount);
      console.log(`[WardrobeItemCard] Retry attempt ${newRetryCount} for item ${item.id}`);
      
      // Try different URL formats on each retry
      if (newRetryCount === 1) {
        // First retry: Try adding API base URL prefix
        const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const newUrl = `${apiBaseUrl}${imageUrlToUse.startsWith('/') ? '' : '/'}${imageUrlToUse}?t=${Date.now()}`;
        console.log(`[WardrobeItemCard] Retry with URL: ${newUrl}`);
        (e.target as HTMLImageElement).src = newUrl;
        return; // Don't mark as failed yet
      } else if (newRetryCount === 2 && imageUrlToUse.includes('/uploads/')) {
        // Second retry: Try direct URL to uploads folder
        const pathParts = imageUrlToUse.split('/uploads/');
        if (pathParts.length > 1) {
          const filename = pathParts[1].split('?')[0]; // Remove query params
          const newUrl = `http://localhost:5000/uploads/${filename}?t=${Date.now()}`;
          console.log(`[WardrobeItemCard] Retry with direct URL: ${newUrl}`);
          (e.target as HTMLImageElement).src = newUrl;
          return; // Don't mark as failed yet
        }
      }
    }
    
    // If we've exhausted all retries or no valid URL, mark as failed
    console.log(`[WardrobeItemCard] All retries failed or no valid URL for item ${item.id}`);
    setImageFailed(true);
  };
  
  return (
    <Card>
      <ImageContainer>
        {shouldShowImage ? (
          <ItemImage 
            src={imageUrlWithTimestamp} 
            alt={item.name} 
            onError={handleImageError}
            key={`${item.id}-${retryCount}-${Date.now()}`} // Force React to re-render the image when URL or retry count changes
          />
        ) : (
          <PlaceholderImage>No Image</PlaceholderImage>
        )}
        
        {/* Display status icon for wishlist items */}
        {item.wishlist && (
          <StatusIcon $status={item.wishlistStatus || WishlistStatus.NOT_REVIEWED}>
            {item.wishlistStatus === WishlistStatus.APPROVED ? '✓' : 
             item.wishlistStatus === WishlistStatus.POTENTIAL_ISSUE ? '!' : '?'}
          </StatusIcon>
        )}
      </ImageContainer>
      
      <CardContent>
        <ItemName>{item.name}</ItemName>
        
        <ItemDetails>
          <ItemDetail>
            <span>Category:</span>
            <span>{item.category}</span>
          </ItemDetail>
          
          <ItemDetail>
            <span>Color:</span>
            <span>{item.color.toLowerCase()}</span>
          </ItemDetail>
          
          <ItemDetail>
            <span>Season:</span>
            <span>
              {item.season.includes(Season.ALL_SEASON) && item.season.length === 1 
                ? Season.ALL_SEASON
                : item.season.filter(season => season !== Season.ALL_SEASON).join(', ')}
            </span>
          </ItemDetail>
          
          <ItemDetail>
            <span>Added:</span>
            <span>{formatDate(item.dateAdded)}</span>
          </ItemDetail>
          
          <ItemDetail>
            <span>Last worn:</span>
            <span>{formatDate(item.lastWorn)}</span>
          </ItemDetail>
          
          <ItemDetail>
            <span>Times worn:</span>
            <span>{item.timesWorn}</span>
          </ItemDetail>
          
          {/* Display wishlist status text if it's a wishlist item */}
          {item.wishlist && (
            <ItemDetail>
              <span>Status:</span>
              <span>
                {item.wishlistStatus === WishlistStatus.APPROVED ? 'Approved' : 
                 item.wishlistStatus === WishlistStatus.POTENTIAL_ISSUE ? 'Potential issue' : 
                 'Not reviewed'}
              </span>
            </ItemDetail>
          )}
        </ItemDetails>
        
        {item.tags && item.tags.length > 0 && (
          <TagsContainer>
            {item.tags.map((tag, index) => (
              <Tag key={index}>{tag}</Tag>
            ))}
          </TagsContainer>
        )}
        
        <ButtonContainer>
          {onView ? (
            <>
              <Button small outlined onClick={() => onView(item)}>
                View
              </Button>
              <Button small outlined onClick={() => onDelete(item.id)}>
                Delete
              </Button>
            </>
          ) : (
            <>
              <Button small outlined onClick={() => onEdit(item.id)}>
                Edit
              </Button>
              <Button small outlined onClick={() => onDelete(item.id)}>
                Delete
              </Button>
            </>
          )}
        </ButtonContainer>
      </CardContent>
    </Card>
  );
};

export default WardrobeItemCard;
