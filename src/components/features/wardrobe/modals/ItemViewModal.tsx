import React, { useState, useEffect } from 'react';
import { WardrobeItem, Season } from '../../../../types';
import { useWardrobe } from '../../../../context/WardrobeContext';
import { Modal, ModalAction } from '../../../common/Modal';
import { supabase } from '../../../../services/core';
// Import shared modal styles
import {
  DetailRow,
  DetailLabel,
  DetailValue,
  ItemImage,
  ItemImageContainer,
  PlaceholderImage
} from './modalCommon.styles';

// Import component-specific styles
import {
  ItemDetails,
} from './ItemViewModal.styles';

// ScenarioDisplay component to show scenario names for the given scenario IDs
interface ScenarioDisplayProps {
  scenarios: string[];
}

const ScenarioDisplay: React.FC<ScenarioDisplayProps> = ({ scenarios }) => {
  const [scenarioNames, setScenarioNames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchScenarioNames = async () => {
      if (!scenarios || scenarios.length === 0) {
        setScenarioNames([]);
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Fetch scenarios by their IDs
        const { data, error } = await supabase
          .from('scenarios')
          .select('name')
          .in('id', scenarios);
          
        if (error) {
          console.error('[ScenarioDisplay] Error fetching scenario names:', error);
          setIsLoading(false);
          return;
        }
        
        if (data) {
          // Extract names from the data
          const names = data.map(scenario => scenario.name as string);
          setScenarioNames(names);
        }
      } catch (error) {
        console.error('[ScenarioDisplay] Unexpected error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchScenarioNames();
  }, [scenarios]);
  
  if (isLoading) {
    return <span>Loading...</span>;
  }
  
  if (scenarioNames.length === 0) {
    return <span>None</span>;
  }
  
  return <span>{scenarioNames.join(', ')}</span>;
};

interface ItemViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: WardrobeItem | undefined;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const ItemViewModal: React.FC<ItemViewModalProps> = ({ isOpen, onClose, item, onEdit, onDelete }) => {
  console.log('[ItemViewModal] Rendering with props:', { isOpen, item: item ? `${item.id} (${item.name})` : 'undefined' });
  const { updateItem } = useWardrobe();
  
  // If no item is provided, don't render anything
  if (!item) {
    console.log('[ItemViewModal] Not rendering - item is undefined');
    return null;
  }
  
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
      // Use relative path for API URLs to leverage proxy in development
      // and absolute paths in production
      const apiBaseUrl = process.env.REACT_APP_API_URL || '';
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
  const wishlistAction = item.wishlist ? [{
    label: 'Move to Wardrobe',
    onClick: handleMoveToWardrobe,
    variant: 'secondary' as const,
    fullWidth: true,
  } as ModalAction] : [];
  
  const actions: ModalAction[] = [
    {
      label: 'Edit',
      onClick: handleEdit,
      variant: 'primary' as const,
      fullWidth: true
    },
    ...wishlistAction,
    {
      label: 'Delete',
      onClick: handleDelete,
      variant: 'secondary' as const,
      fullWidth: true,
      outlined: true
    },
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
          
          {/* Display scenarios if they exist */}
          {item.scenarios && item.scenarios.length > 0 && (
            <DetailRow>
              <DetailLabel>Occasions</DetailLabel>
              <DetailValue>
                <ScenarioDisplay scenarios={item.scenarios} />
              </DetailValue>
            </DetailRow>
          )}
          
          {!item.wishlist ? null : (
            <DetailRow>
              <DetailLabel>Wishlist</DetailLabel>
              <DetailValue>Yes</DetailValue>
            </DetailRow>
          )}
        </ItemDetails>
    </Modal>
  );
};

export default ItemViewModal;
