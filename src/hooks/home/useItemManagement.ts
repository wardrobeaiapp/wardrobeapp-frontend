import { useState, useCallback } from 'react';
import { WardrobeItem } from '../../types';

type UseItemManagementProps = {
  addItem: (item: Omit<WardrobeItem, 'id'>, file?: File) => Promise<WardrobeItem | null>;
  updateItem: (id: string, updates: Partial<WardrobeItem>) => Promise<WardrobeItem | null>;
  deleteItem: (id: string) => Promise<boolean>;
  setActiveTab: (tab: any) => void;
};

type UseItemManagementReturn = {
  // State
  currentItemId: string | null;
  setCurrentItemId: (id: string | null) => void;
  selectedItem: WardrobeItem | undefined;
  setSelectedItem: (item: WardrobeItem | undefined) => void;
  isDeleteConfirmModalOpen: boolean;
  setIsDeleteConfirmModalOpen: (isOpen: boolean) => void;
  itemToDelete: WardrobeItem | undefined;
  setItemToDelete: (item: WardrobeItem | undefined) => void;
  
  // Handlers
  handleAddItem: () => void;
  handleViewItem: (item: WardrobeItem) => void;
  handleEditItem: (id: string) => void;
  handleDeleteItem: (items: WardrobeItem[], id: string) => void;
  confirmDeleteItem: () => Promise<void>;
  handleSubmitAdd: (item: Omit<WardrobeItem, 'id' | 'dateCreated'>, file?: File) => Promise<void>;
  handleSubmitEdit: (updates: Partial<WardrobeItem>, file?: File) => Promise<void>;
};

export const useItemManagement = ({
  addItem,
  updateItem,
  deleteItem,
  setActiveTab,
}: UseItemManagementProps): UseItemManagementReturn => {
  // Item selection state
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<WardrobeItem | undefined>(undefined);
  
  // Delete confirmation state
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<WardrobeItem | undefined>(undefined);

  // Item operation handlers
  const handleAddItem = useCallback(() => {
    setCurrentItemId(null);
  }, []);

  const handleViewItem = useCallback((item: WardrobeItem) => {
    setSelectedItem(item);
  }, []);

  const handleEditItem = useCallback((id: string) => {
    setCurrentItemId(id);
  }, []);

  const handleDeleteItem = useCallback((items: WardrobeItem[], id: string) => {
    const itemToDelete = items.find(item => item.id === id);
    if (itemToDelete) {
      setItemToDelete(itemToDelete);
      setIsDeleteConfirmModalOpen(true);
    }
  }, []);

  const confirmDeleteItem = useCallback(async () => {
    if (itemToDelete?.id) {
      const success = await deleteItem(itemToDelete.id);
      if (success) {
        setIsDeleteConfirmModalOpen(false);
        setItemToDelete(undefined);
      }
    }
  }, [deleteItem, itemToDelete]);

  const handleSubmitAdd = useCallback(async (item: Omit<WardrobeItem, 'id' | 'dateCreated'>, file?: File) => {
    try {
      console.log('[useItemManagement] Adding item with file:', !!file);
      console.log('[useItemManagement] Item data received:', item);
      
      const newItem = await addItem(item, file);
      if (newItem) {
        setActiveTab('items');
      }
    } catch (error) {
      console.error('Error adding item:', error);
      throw error;
    }
  }, [addItem, setActiveTab]);

  const handleSubmitEdit = useCallback(async (updates: Partial<WardrobeItem>) => {
    if (!currentItemId) {
      console.error('No item selected for editing');
      return;
    }

    try {
      await updateItem(currentItemId, updates);
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  }, [currentItemId, updateItem]);

  return {
    // State
    currentItemId,
    setCurrentItemId,
    selectedItem,
    setSelectedItem,
    isDeleteConfirmModalOpen,
    setIsDeleteConfirmModalOpen,
    itemToDelete,
    setItemToDelete,
    
    // Handlers
    handleAddItem,
    handleViewItem,
    handleEditItem,
    handleDeleteItem,
    confirmDeleteItem,
    handleSubmitAdd,
    handleSubmitEdit,
  };
};
