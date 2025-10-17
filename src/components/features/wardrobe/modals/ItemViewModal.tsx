import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { WardrobeItem } from '../../../../types';
import { useWardrobe } from '../../../../context/WardrobeContext';
import { Modal, ModalAction } from '../../../common/Modal';
import { supabase } from '../../../../services/core';
import { useSupabaseAuth } from '../../../../context/SupabaseAuthContext';
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
  const { user, isAuthenticated } = useSupabaseAuth();
  
  useEffect(() => {
    const fetchScenarioNames = async () => {
      if (!scenarios || scenarios.length === 0) {
        setScenarioNames([]);
        setIsLoading(false);
        return;
      }
      
      // 🔒 SECURITY CHECK: Ensure user is authenticated before fetching scenario names
      if (!isAuthenticated || !user?.id) {
        console.warn('[ScenarioDisplay] No authenticated user - cannot fetch scenario names');
        setScenarioNames([]);
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // 🔒 SECURITY FIX: Fetch scenarios by their IDs AND filter by user_id to prevent data leakage
        const { data, error } = await supabase
          .from('scenarios')
          .select('name')
          .in('id', scenarios)
          .eq('user_id', user.id); // 🚨 CRITICAL FIX: Ensure scenarios belong to current user
          
        if (error) {
          console.error('[ScenarioDisplay] Error fetching scenario names:', error);
          setScenarioNames([]);
          setIsLoading(false);
          return;
        }
        
        if (data) {
          // Extract names from the data
          const names = data.map(scenario => scenario.name as string);
          console.log(`[ScenarioDisplay] Successfully fetched ${names.length} scenario names for user ${user.id}`);
          setScenarioNames(names);
        }
      } catch (error) {
        console.error('[ScenarioDisplay] Unexpected error:', error);
        setScenarioNames([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchScenarioNames();
  }, [scenarios, isAuthenticated, user?.id]); // Re-fetch when scenarios or auth state changes
  
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
  const { updateItem } = useWardrobe();
  
  // Memoize the image URL processing
  const getFullImageUrl = useCallback((url?: string): string => {
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
      const apiBaseUrl = process.env.REACT_APP_API_URL || '';
      const baseUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
      return `${baseUrl}${normalizedUrl}`;
    }
    
    // Handle URLs that might be missing the protocol
    if (!url.startsWith('http') && !url.startsWith('/')) {
      return `http://${url}`;
    }
    
    return url;
  }, []);
  
  // Memoize the image URL to prevent recalculation on every render
  const imageUrl = useMemo(() => 
    item?.imageUrl ? getFullImageUrl(item.imageUrl) : ''
  , [item?.imageUrl, getFullImageUrl]);
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };
  
  const handleEdit = useCallback(() => {
    if (!item) return;
    onEdit(item.id);
  }, [item, onEdit]);
  
  const handleDelete = useCallback(() => {
    if (!item) return;
    onDelete(item.id);
    onClose();
  }, [item, onDelete, onClose]);
  
  const handleMoveToWardrobe = useCallback(() => {
    if (!item) return;
    // Update the item to move it from wishlist to wardrobe
    updateItem(item.id, { wishlist: false });
    onClose();
  }, [item, updateItem, onClose]);
  
  // Memoize actions to prevent recreation on every render
  const actions = useMemo(() => {
    if (!item) return [];
    
    const baseActions: ModalAction[] = [
      {
        label: 'Edit',
        onClick: handleEdit,
        variant: 'primary' as const,
        fullWidth: true
      }
    ];
    
    if (item.wishlist) {
      baseActions.push({
        label: 'Move to Wardrobe',
        onClick: handleMoveToWardrobe,
        variant: 'secondary' as const,
        fullWidth: true,
      });
    }
    
    baseActions.push({
      label: 'Delete',
      onClick: handleDelete,
      variant: 'secondary' as const,
      fullWidth: true,
      outlined: true
    });
    
    return baseActions;
  }, [item, handleEdit, handleDelete, handleMoveToWardrobe]);
  
  // If no item is provided, don't render anything
  if (!item) {
    return null;
  }
  

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
              {item.season.join(', ')}
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
              <DetailLabel>Scenarios</DetailLabel>
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
