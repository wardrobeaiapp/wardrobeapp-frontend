import React, { useEffect, useState } from 'react';
import { WardrobeItem, Outfit, Capsule } from '../../../../types';
import { Modal, ModalAction } from '../../../common/Modal';
import styled from 'styled-components';
import { outfitItemsService, outfitsService, capsuleItemsService } from '../../../../services/wardrobe';
import { fetchCapsules } from '../../../../services/api';

interface DeleteItemConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  item?: WardrobeItem;
}

const capitalizeFirstLetter = (str: string): string => {
  if (!str || typeof str !== 'string') return str || '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const WarningText = styled.p`
  color: #d9534f;
  font-weight: bold;
  margin-bottom: 16px;
  font-size: 16px;
`;

const MessageText = styled.p`
  margin-bottom: 16px;
  font-size: 14px;
  line-height: 1.5;
`;

const AssociationsList = styled.ul`
  margin-bottom: 16px;
  padding-left: 20px;
  max-height: 150px;
  overflow-y: auto;
  border-left: 2px solid #f0f0f0;
`;

const AssociationItem = styled.li`
  margin-bottom: 8px;
  padding: 4px 0;
  font-size: 14px;
`;


const DeleteItemConfirmModal: React.FC<DeleteItemConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  item
}) => {
  const [associatedOutfits, setAssociatedOutfits] = useState<Outfit[]>([]);
  const [associatedCapsules, setAssociatedCapsules] = useState<Capsule[]>([]);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAssociations = async () => {
      if (item?.id) {
        setIsLoading(true);
        try {
          // Get outfit IDs that contain this item
          const outfitIds = await outfitItemsService.getItemOutfits(item.id);
          
          // Get the full outfit objects for these IDs
          const outfits = await outfitsService.getOutfits();
          const associatedOutfits = outfits.filter(outfit => outfitIds.includes(outfit.id));
          
          // Get capsule IDs that contain this item
          const capsuleIds = await capsuleItemsService.getItemCapsules(item.id);
          
          // Get the full capsule objects for these IDs
          const capsules = await fetchCapsules();
          const associatedCapsules = capsules.filter(capsule => capsuleIds.includes(capsule.id));
          
          // Check if the item is in the wishlist
          const isInWishlist = item.wishlist || false;
          
          setAssociatedOutfits(associatedOutfits);
          setAssociatedCapsules(associatedCapsules);
          setIsInWishlist(isInWishlist);
          
          console.log('Associated capsules:', associatedCapsules);
        } catch (error) {
          console.error('Error fetching item associations:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (isOpen && item) {
      fetchAssociations();
    } else {
      setAssociatedOutfits([]);
      setAssociatedCapsules([]);
      setIsInWishlist(false);
    }
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  const hasOutfitAssociations = associatedOutfits.length > 0;
  const hasCapsuleAssociations = associatedCapsules.length > 0;
  const hasAssociations = hasOutfitAssociations || hasCapsuleAssociations || isInWishlist;

  const actions: ModalAction[] = [
    {
      label: 'Cancel',
      onClick: onClose,
      variant: 'secondary',
      fullWidth: true
    },
    {
      label: 'Delete',
      onClick: onConfirm,
      variant: 'danger',
      fullWidth: true
    }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Delete"
      actions={actions}
      size="md"
    >
          <MessageText>
            Are you sure you want to delete the item "{item.name}"?
          </MessageText>
          
          {isLoading ? (
            <MessageText>Checking item associations...</MessageText>
          ) : (
            <>
              {hasAssociations && (
                <WarningText>
                  This item has the following associations:
                </WarningText>
              )}
              
              {hasOutfitAssociations && (
                <>
                  <MessageText>
                    This item is used in the following outfits:
                  </MessageText>
                  <AssociationsList>
                    {associatedOutfits.map(outfit => (
                      <AssociationItem key={outfit.id}>
                        {outfit.name || `Outfit ${outfit.id}`}
                      </AssociationItem>
                    ))}
                  </AssociationsList>
                  <MessageText>
                    Deleting this item will remove it from these outfits.
                  </MessageText>
                </>
              )}
              
              {hasCapsuleAssociations && (
                <>
                  <MessageText>
                    This item is used in the following capsules:
                  </MessageText>
                  <AssociationsList>
                    {associatedCapsules.map(capsule => (
                      <AssociationItem key={capsule.id}>
                        {capitalizeFirstLetter(capsule.name || `Capsule ${capsule.id}`)}
                      </AssociationItem>
                    ))}
                  </AssociationsList>
                  <MessageText>
                    Deleting this item will remove it from these capsules.
                  </MessageText>
                </>
              )}
              
              {isInWishlist && (
                <>
                  <MessageText>
                    This item is in your wishlist.
                  </MessageText>
                  <MessageText>
                    Deleting this item will remove it from your wishlist.
                  </MessageText>
                </>
              )}
            </>
          )}
    </Modal>
  );
};

export default DeleteItemConfirmModal;
