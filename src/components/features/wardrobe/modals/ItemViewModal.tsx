import React from 'react';
import { WardrobeItem, Season, WishlistStatus } from '../../../../types';
import { useWardrobe } from '../../../../context/WardrobeContext';
import Button from '../../../common/Button';
import { Modal, ModalAction } from '../../../common/Modal';
import {
  ItemImageContainer,
  ItemImage,
  PlaceholderImage,
  ItemDetails,
  DetailRow,
  DetailLabel,
  DetailValue,
  TagsContainer,
  Tag,
  ButtonsContainer
} from './ItemViewModal.styles';



interface ItemViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: WardrobeItem | undefined;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const ItemViewModal: React.FC<ItemViewModalProps> = ({ isOpen, onClose, item, onEdit, onDelete }) => {
  const { updateItem } = useWardrobe();
  if (!item) return null;
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };
  
  const handleEdit = () => {
    onEdit(item.id);
    onClose();
  };
  
  const handleDelete = () => {
    onDelete(item.id);
    onClose();
  };
  
  const handleRunAICheck = () => {
    // Simulate AI check by randomly setting status to either APPROVED or POTENTIAL_ISSUE
    const randomStatus = Math.random() > 0.5 ? WishlistStatus.APPROVED : WishlistStatus.POTENTIAL_ISSUE;
    updateItem(item.id, { wishlistStatus: randomStatus });
    // Could add a toast notification here to inform the user
    onClose();
  };
  
  const handleMoveToWardrobe = () => {
    // Update the item to move it from wishlist to wardrobe
    updateItem(item.id, { wishlist: false });
    onClose();
  };
  
  // Function to get the full image URL (prepend API_URL for relative paths)
  const getFullImageUrl = (url?: string) => {
    if (!url) return '';
    
    // Handle data URLs (base64 images)
    if (url.startsWith('data:image/')) {
      return url;
    }
    
    // Handle absolute URLs with protocol
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Handle relative URLs from the server
    if (url.startsWith('/uploads/') || url.includes('/uploads/')) {
      const normalizedUrl = url.startsWith('/') ? url : `/${url}`;
      const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const baseUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
      return `${baseUrl}${normalizedUrl}`;
    }
    
    // Handle URLs that might be missing the protocol
    if (!url.startsWith('http') && !url.startsWith('/')) {
      return `http://${url}`;
    }
    
    return url;
  };
  
  const imageUrl = item.imageUrl ? getFullImageUrl(item.imageUrl) : '';
  
  // Build modal actions
  const actions: ModalAction[] = [
    {
      label: 'Edit',
      onClick: handleEdit,
      variant: 'primary',
      fullWidth: true
    },
    {
      label: 'Delete',
      onClick: handleDelete,
      variant: 'danger',
      fullWidth: true
    }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={item.name}
      actions={actions}
      size='md'
    >
        
        <ItemImageContainer>
          {imageUrl ? (
            <ItemImage src={imageUrl} alt={item.name} />
          ) : (
            <PlaceholderImage>No Image</PlaceholderImage>
          )}
        </ItemImageContainer>
        
        {item.wishlist ? (
          <ButtonsContainer style={{ marginTop: '10px', marginBottom: '20px' }}>
            {item.wishlistStatus === WishlistStatus.NOT_REVIEWED ? (
              <Button variant="primary" onClick={handleRunAICheck}>Run AI Check</Button>
            ) : null}
            <Button variant="primary" onClick={handleMoveToWardrobe}>Move to Wardrobe</Button>
          </ButtonsContainer>
        ) : null}
        
        <ItemDetails>
          <DetailRow>
            <DetailLabel>Category</DetailLabel>
            <DetailValue>{item.category ? item.category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ') : ''}</DetailValue>
          </DetailRow>
          
          {item.subcategory && item.subcategory !== item.category ? (
            <DetailRow>
              <DetailLabel>Subcategory</DetailLabel>
              <DetailValue>{item.subcategory.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}</DetailValue>
            </DetailRow>
          ) : null}
          
          <DetailRow>
            <DetailLabel>Color</DetailLabel>
            <DetailValue>{item.color}</DetailValue>
          </DetailRow>
          
          <DetailRow>
            <DetailLabel>Season</DetailLabel>
            <DetailValue>
              {item.season.includes(Season.ALL_SEASON) && item.season.length === 1 
                ? 'All Season'
                : item.season.filter(season => season !== Season.ALL_SEASON).join(', ')}
            </DetailValue>
          </DetailRow>
          
          {item.brand && item.brand !== '0' ? (
            <DetailRow>
              <DetailLabel>Brand</DetailLabel>
              <DetailValue>{item.brand}</DetailValue>
            </DetailRow>
          ) : null}
          
          {item.size && item.size !== '0' ? (
            <DetailRow>
              <DetailLabel>Size</DetailLabel>
              <DetailValue>{item.size}</DetailValue>
            </DetailRow>
          ) : null}
          
          {item.material && item.material !== '0' ? (
            <DetailRow>
              <DetailLabel>Material</DetailLabel>
              <DetailValue>{item.material}</DetailValue>
            </DetailRow>
          ) : null}
          
          {item.price && item.price > 0 ? (
            <DetailRow>
              <DetailLabel>Price</DetailLabel>
              <DetailValue>${item.price}</DetailValue>
            </DetailRow>
          ) : null}
          
          <DetailRow>
            <DetailLabel>Added</DetailLabel>
            <DetailValue>{formatDate(item.dateAdded)}</DetailValue>
          </DetailRow>
          

          
          {item.wishlist ? (
            <>
              <DetailRow>
                <DetailLabel>Wishlist</DetailLabel>
                <DetailValue>Yes</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>Status</DetailLabel>
                <DetailValue>
                  {item.wishlistStatus === WishlistStatus.APPROVED ? 'Approved' : 
                   item.wishlistStatus === WishlistStatus.POTENTIAL_ISSUE ? 'Potential Issue' : 'Not Reviewed'}
                </DetailValue>
              </DetailRow>
            </>
          ) : null}
        </ItemDetails>
        
        {item.tags && item.tags.length > 0 ? (
          <>
            <h3>Tags</h3>
            <TagsContainer>
              {item.tags.map((tag, index) => (
                <Tag key={index}>{tag}</Tag>
              ))}
            </TagsContainer>
          </>
        ) : null}
    </Modal>
  );
};

export default ItemViewModal;
