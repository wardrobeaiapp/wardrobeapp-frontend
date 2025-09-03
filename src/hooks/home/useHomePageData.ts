import { useState, useCallback, useMemo, useEffect } from 'react';
import { Outfit, Capsule, WardrobeItem, WishlistStatus } from '../../types';
import { OutfitExtended } from '../../context/WardrobeContext';
import { useWardrobe } from '../../context/WardrobeContext';
import { useOutfits } from '../wardrobe/outfits/useOutfits';
import { useCapsules } from '../wardrobe/capsules/useCapsules';
import { useSupabaseAuth } from '../../context/SupabaseAuthContext';
import { CapsuleFormData } from '../../components/features/wardrobe/forms/CapsuleForm';
import { getScenariosForUser as fetchScenarios } from '../../services/scenarios/scenariosService';
import { useTabState, TabType } from './useTabState';
import { useItemFiltering } from './useItemFiltering';
import { useOutfitFiltering } from './useOutfitFiltering';
import { useCapsuleFiltering } from './useCapsuleFiltering';
import { useWishlistFiltering } from './useWishlistFiltering';
import { useModalState } from './useModalState';
import { useItemManagement } from './useItemManagement';
import useDataLoading from '../core/useDataLoading';

export const useHomePageData = () => {
  const { 
    items, 
    outfits, 
    addItem, 
    updateItem, 
    deleteItem, 
    addOutfit, 
    updateOutfit, 
    deleteOutfit,
    isLoading: itemsLoading, 
    error: itemsError 
  } = useWardrobe();
  
  const { user } = useSupabaseAuth();
  
  const { isLoading: outfitsLoading, error: outfitsError } = useOutfits([]);
  
  // Use our new useCapsules hook for better capsule-items relationship management
  const {
    capsules,
    loading: capsulesLoading,
    error: capsulesError,
    addCapsule,
    updateCapsuleById,
    deleteCapsuleById
  } = useCapsules();
  
  // Combine loading and error states with debouncing to prevent UI blinking
  // Only consider the app loading during initial load, not during subsequent data fetches
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  // Use a more stable loading state that doesn't flicker
  const isLoading = useMemo(() => {
    // After initial load is complete, don't show loader for minor data updates
    if (initialLoadComplete) {
      return false;
    }
    return itemsLoading || outfitsLoading || capsulesLoading;
  }, [itemsLoading, outfitsLoading, capsulesLoading, initialLoadComplete]);
  
  // Set initial load complete after all data sources finish loading
  useEffect(() => {
    if (!itemsLoading && !outfitsLoading && !capsulesLoading && !initialLoadComplete) {
      // Small timeout to ensure UI is stable before marking load complete
      const timer = setTimeout(() => {
        setInitialLoadComplete(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [itemsLoading, outfitsLoading, capsulesLoading, initialLoadComplete]);
  
  const error = itemsError || outfitsError || capsulesError;
  
  // Tab state
  const { 
    activeTab, 
    setActiveTab,
  } = useTabState(TabType.ITEMS);
  
  // Scenarios state with useDataLoading
  const [scenariosState, scenariosActions] = useDataLoading<Array<{id: string, name: string}>>([]);
  const { loadData: loadScenarios, setData: setScenarios } = scenariosActions;
  
  // Fetch scenarios when user is available
  useEffect(() => {
    if (!user?.id) return;
    
    loadScenarios(
      fetchScenarios(user.id)
        .then(data => {
          return data;
        })
    ).catch(error => {
      console.error('Error loading scenarios:', error);
    });
  }, [user?.id, loadScenarios]);
  
  // Filter states
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [seasonFilter, setSeasonFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [outfitSeasonFilter, setOutfitSeasonFilter] = useState<string>('all');
  const [outfitScenarioFilter, setOutfitScenarioFilter] = useState<string>('all');
  const [outfitSearchQuery, setOutfitSearchQuery] = useState<string>('');
  const [capsuleSeasonFilter, setCapsuleSeasonFilter] = useState<string>('all');
  const [capsuleScenarioFilter, setCapsuleScenarioFilter] = useState<string>('all');
  const [capsuleSearchQuery, setCapsuleSearchQuery] = useState<string>('');
  const [wishlistSearchQuery, setWishlistSearchQuery] = useState<string>('');
  const [wishlistStatusFilter, setWishlistStatusFilter] = useState<WishlistStatus | 'all'>('all');
  
  // Modal states and handlers
  const {
    // Modal states
    isAddModalOpen,
    isEditModalOpen,
    isAddOutfitModalOpen,
    isEditOutfitModalOpen,
    isViewOutfitModalOpen,
    isViewCapsuleModalOpen,
    isEditCapsuleModalOpen,
    isAddCapsuleModalOpen,
    isViewItemModalOpen,
    
    // Modal state setters
    setIsAddModalOpen,
    setIsEditModalOpen,
    setIsAddOutfitModalOpen,
    setIsEditOutfitModalOpen,
    setIsViewOutfitModalOpen,
    setIsViewCapsuleModalOpen,
    setIsEditCapsuleModalOpen,
    setIsAddCapsuleModalOpen,
    setIsViewItemModalOpen,
    
    // Modal handlers
    openEditOutfitModal,
    openViewOutfitModal,
    openViewCapsuleModal,
    openEditCapsuleModal,
    
    // Close handlers
    closeViewOutfitModal,
    closeViewCapsuleModal,
  } = useModalState();
  
  // Item management
  const {
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
    handleDeleteItem: handleDeleteItemInternal,
    confirmDeleteItem,
    handleSubmitAdd,
    handleSubmitEdit,
  } = useItemManagement({
    addItem,
    updateItem,
    deleteItem,
    setActiveTab,
  });
  
  // Outfit and capsule states
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);
  const [selectedCapsule, setSelectedCapsule] = useState<Capsule | undefined>(undefined);
  const [currentOutfitId, setCurrentOutfitId] = useState<string | null>(null);
  
  // Derived states
  const currentOutfit = useMemo(() => {
    if (!currentOutfitId) return undefined;
    return outfits.find(outfit => outfit.id === currentOutfitId) || undefined;
  }, [outfits, currentOutfitId]);
  
  const currentItem = useMemo(() => 
    currentItemId ? items.find(item => item.id === currentItemId) : undefined
  , [items, currentItemId]);
  
  // Filter items using the useItemFiltering hook
  const { filteredItems } = useItemFiltering(items, {
    category: categoryFilter,
    season: seasonFilter,
    searchQuery,
    isWishlist: false
  });
  
  // Filter outfits using the useOutfitFiltering hook
  const { filteredOutfits } = useOutfitFiltering(outfits, {
    season: outfitSeasonFilter,
    scenario: outfitScenarioFilter,
    searchQuery: outfitSearchQuery
  });

  // Filter capsules using the useCapsuleFiltering hook
  const { filteredCapsules } = useCapsuleFiltering(capsules, {
    season: capsuleSeasonFilter,
    scenario: capsuleScenarioFilter,
    searchQuery: capsuleSearchQuery
  });

  // Filter wishlist items using the useWishlistFiltering hook
  const { filteredItems: filteredWishlistItems, itemCount: wishlistItemCount } = useWishlistFiltering(
    items,
    {
      category: categoryFilter,
      season: seasonFilter,
      searchQuery: wishlistSearchQuery,
      wishlistStatus: wishlistStatusFilter
    }
  );
  
  // Keep wishlistItems for backward compatibility
  const wishlistItems = useMemo(() => 
    items.filter(item => item.wishlist === true)
  , [items]);
  
  // Handle item deletion with items context
  const handleDeleteItem = useCallback((id: string) => {
    handleDeleteItemInternal(items, id);
  }, [handleDeleteItemInternal, items]);
  
  // Additional modal state management
  const handleViewItemWithModal = useCallback((item: WardrobeItem) => {
    handleViewItem(item);
    setIsViewItemModalOpen(true);
  }, [handleViewItem]);
  
  const handleEditItemWithModal = useCallback((id: string) => {
    if (isViewItemModalOpen) {
      setIsViewItemModalOpen(false);
    }
    handleEditItem(id);
    setIsEditModalOpen(true);
  }, [handleEditItem, isViewItemModalOpen]);
  
  const handleViewOutfit = useCallback((outfit: Outfit) => {
    setSelectedOutfit(outfit);
    openViewOutfitModal();
  }, [openViewOutfitModal]);
  
  const handleEditOutfit = useCallback((outfit: Outfit) => {
    setCurrentOutfitId(outfit.id);
    closeViewOutfitModal();
    openEditOutfitModal();
  }, [closeViewOutfitModal, openEditOutfitModal]);
  
  const handleDeleteOutfit = useCallback((id: string) => {
    deleteOutfit(id);
    closeViewOutfitModal();
    setSelectedOutfit(null);
  }, [deleteOutfit, closeViewOutfitModal, setSelectedOutfit]);
  
  const handleViewCapsule = useCallback((capsule: Capsule) => {
    setSelectedCapsule(capsule);
    openViewCapsuleModal();
  }, [openViewCapsuleModal]);
  
  const handleEditCapsule = useCallback((capsule: Capsule) => {
    setSelectedCapsule(capsule);
    closeViewCapsuleModal();
    openEditCapsuleModal();
  }, [closeViewCapsuleModal, openEditCapsuleModal]);
  
  const handleEditCapsuleSubmit = useCallback(async (id: string, data: CapsuleFormData) => {
    const capsuleData = {
      name: data.name,
      description: data.description || '',
      scenario: data.scenario,
      seasons: data.seasons,
      selectedItems: data.selectedItems,
      mainItemId: data.mainItemId || ''
    };
    
    await updateCapsuleById(id, capsuleData);
    setIsEditCapsuleModalOpen(false);
  }, [updateCapsuleById]);
  
  const handleDeleteCapsule = useCallback((id: string) => {
    deleteCapsuleById(id);
    setIsViewCapsuleModalOpen(false);
    setSelectedCapsule(undefined);
  }, [deleteCapsuleById]);
  
  // Wrappers for submit handlers to handle modal state
  const handleSubmitAddWithModal = useCallback(async (item: Omit<WardrobeItem, 'id' | 'dateCreated'>, file?: File) => {
    try {
      await handleSubmitAdd(item, file);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error in handleSubmitAddWithModal:', error);
      throw error;
    }
  }, [handleSubmitAdd, setIsAddModalOpen]);
  
  const handleSubmitEditWithModal = useCallback(async (updates: Partial<WardrobeItem>) => {
    try {
      await handleSubmitEdit(updates);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error in handleSubmitEditWithModal:', error);
      throw error;
    }
  }, [handleSubmitEdit, setIsEditModalOpen]);
  
  const handleAddOutfit = useCallback(async (outfitData: Omit<Outfit, 'id' | 'dateCreated' | 'userId' | 'scenarios'> & { 
    scenarios?: string[];
    description?: string;
  }) => {
    try {
      // Create a new outfit with all required fields
      const newOutfit: Omit<OutfitExtended, 'id'> = {
        ...outfitData,
        userId: 'current-user-id', // TODO: Get from auth context
        items: outfitData.items || [],
        season: outfitData.season || [],
        scenarios: outfitData.scenarios || [],
        description: outfitData.description || '',
        weather: [],
        tags: [],
        dateCreated: new Date().toISOString(),
        scenarioNames: []
      };
      
      // If we have scenario IDs but no names, use the already loaded scenarios
      if (newOutfit.scenarios.length > 0 && scenariosState.data) {
        newOutfit.scenarioNames = newOutfit.scenarios
          .map(scenarioId => {
            const scenario = scenariosState.data?.find(s => s.id === scenarioId);
            return scenario?.name || '';
          })
          .filter(Boolean);
      }
      
      await addOutfit(newOutfit);
      setIsAddOutfitModalOpen(false);
    } catch (error) {
      console.error('Failed to add outfit:', error);
      // Consider adding error state to show in UI
    }
  }, [addOutfit, user]);
  
  const handleEditOutfitSubmit = useCallback(async (outfitData: Partial<Outfit> & { id?: string }) => {
    if (!currentOutfitId) {
      console.error('No outfit selected for editing');
      return;
    }
    
    try {
      // Create a safe updates object with only the fields we want to update
      const { id, dateCreated, scenarioNames, ...updates } = outfitData;
      
      // Ensure required fields are not accidentally removed
      const safeUpdates: Partial<Outfit> = {
        ...updates,
        items: updates.items || [],
        season: updates.season || [],
        scenarios: updates.scenarios || [],
        scenarioNames: scenarioNames || []
      };
      
      // If we have scenarios but no names, use the already loaded scenarios
      if (safeUpdates.scenarios && safeUpdates.scenarios.length > 0 && 
          (!safeUpdates.scenarioNames || safeUpdates.scenarioNames.length === 0) &&
          scenariosState.data) {
        safeUpdates.scenarioNames = safeUpdates.scenarios
          .map((scenarioId: string) => {
            const scenario = scenariosState.data?.find(s => s.id === scenarioId);
            return scenario?.name || '';
          })
          .filter(Boolean) as string[];
      }
      
      await updateOutfit(currentOutfitId, safeUpdates);
      setIsEditOutfitModalOpen(false);
      setCurrentOutfitId(null);
    } catch (error) {
      console.error('Failed to update outfit:', error);
      // Consider adding error state to show in UI
    }
  }, [currentOutfitId, updateOutfit, user]);
  
  const handleAddCapsule = useCallback(async (id: string, data: CapsuleFormData) => {
    try {
      // For new capsules, we ignore the id parameter (it will be 'new')
      const capsuleData = {
        name: data.name,
        description: data.description || '',
        style: '', // Default empty style since it's required by the Capsule type
        scenario: data.scenarios?.[0] || '', // Use first scenario or empty string
        scenarios: data.scenarios || [],
        seasons: data.seasons,
        selectedItems: data.selectedItems || [],
        mainItemId: data.mainItemId || ''
      };
      
      // Add the capsule and wait for it to complete
      const newCapsule = await addCapsule({
        ...capsuleData,
        // Make sure the selectedItems are correctly passed through the entire flow
        selectedItems: data.selectedItems || []
      });
      
      if (!newCapsule) {
        throw new Error('Failed to create capsule');
      }
      
      // Close the modal
      setIsAddCapsuleModalOpen(false);
      
      // No need to dispatch refreshCapsules event here
      // The addCapsule function already dispatches this event
      // Dispatching it twice can cause a race condition where the second fetch
      // happens before the capsule-items relationships are fully established
      
      return newCapsule;
    } catch (error) {
      console.error('Error adding capsule:', error);
      throw error; // Re-throw to handle in the component
    }
  }, [addCapsule]);
  
  return {
    // Data
    items,
    filteredItems,
    outfits,
    filteredOutfits,
    capsules,
    filteredCapsules,
    filteredWishlistItems,
    isLoading,
    error,
    
    // Scenarios
    scenarios: scenariosState.data || [],
    isLoadingScenarios: scenariosState.isLoading,
    scenariosError: scenariosState.error,
    
    // Tab state
    activeTab,
    setActiveTab,
    
    // Filter states
    categoryFilter,
    setCategoryFilter,
    seasonFilter,
    setSeasonFilter,
    searchQuery,
    setSearchQuery,
    outfitSeasonFilter,
    setOutfitSeasonFilter,
    outfitScenarioFilter,
    setOutfitScenarioFilter,
    outfitSearchQuery,
    setOutfitSearchQuery,
    capsuleSeasonFilter,
    setCapsuleSeasonFilter,
    capsuleScenarioFilter,
    setCapsuleScenarioFilter,
    capsuleSearchQuery,
    setCapsuleSearchQuery,
    wishlistSearchQuery,
    setWishlistSearchQuery,
    wishlistStatusFilter,
    setWishlistStatusFilter,
    
    // Delete confirmation modal
    isDeleteConfirmModalOpen,
    setIsDeleteConfirmModalOpen,
    itemToDelete,
    
    // Modal states
    isAddModalOpen,
    setIsAddModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isAddOutfitModalOpen,
    setIsAddOutfitModalOpen,
    isEditOutfitModalOpen,
    setIsEditOutfitModalOpen,
    isViewOutfitModalOpen,
    setIsViewOutfitModalOpen,
    isViewCapsuleModalOpen,
    setIsViewCapsuleModalOpen,
    isEditCapsuleModalOpen,
    setIsEditCapsuleModalOpen,
    isAddCapsuleModalOpen,
    setIsAddCapsuleModalOpen,
    isViewItemModalOpen,
    setIsViewItemModalOpen,
    
    // Selected items
    selectedOutfit,
    setSelectedOutfit,
    selectedCapsule,
    setSelectedCapsule,
    currentOutfit,
    currentItem,
    selectedItem,
    setCurrentOutfitId,
    
    // Event handlers
    handleAddItem: () => {
      handleAddItem();
      setIsAddModalOpen(true);
    },
    handleViewItem: handleViewItemWithModal,
    handleEditItem: handleEditItemWithModal,
    handleDeleteItem,
    confirmDeleteItem,
    handleViewOutfit,
    handleEditOutfit,
    handleDeleteOutfit,
    handleViewCapsule,
    handleEditCapsule,
    handleEditCapsuleSubmit,
    handleDeleteCapsule,
    handleSubmitAdd: handleSubmitAddWithModal,
    handleSubmitEdit: handleSubmitEditWithModal,
    handleAddOutfit,
    handleEditOutfitSubmit,
    handleAddCapsule,
  };
};
