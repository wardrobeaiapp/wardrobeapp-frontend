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
    isGenerateWithAIModalOpen,
    isGenerateCapsuleWithAIModalOpen,
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
    setIsGenerateWithAIModalOpen,
    setIsGenerateCapsuleWithAIModalOpen,
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
  
  // Selected item states
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);
  const [selectedCapsule, setSelectedCapsule] = useState<Capsule | undefined>(undefined);
  const [currentOutfitId, setCurrentOutfitId] = useState<string | null>(null);
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<WardrobeItem | undefined>(undefined);
  
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
  
  // Event handlers
  const handleAddItem = useCallback(() => {
    setIsAddModalOpen(true);
  }, []);
  
  const handleViewItem = useCallback((item: WardrobeItem) => {
    setSelectedItem(item);
    setIsViewItemModalOpen(true);
  }, []);
  
  const handleEditItem = useCallback((id: string) => {
    // If we're coming from the view modal, close it
    if (isViewItemModalOpen) {
      setIsViewItemModalOpen(false);
    }
    setCurrentItemId(id);
    setIsEditModalOpen(true);
  }, [isViewItemModalOpen]);
  
  // State for delete confirmation modal
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<WardrobeItem | undefined>(undefined);

  const handleDeleteItem = useCallback((id: string) => {
    // Find the item to delete
    const itemToDelete = items.find(item => item.id === id);
    setItemToDelete(itemToDelete);
    setIsDeleteConfirmModalOpen(true);
  }, [items]);
  
  const confirmDeleteItem = useCallback(() => {
    if (itemToDelete?.id) {
      deleteItem(itemToDelete.id);
      setIsDeleteConfirmModalOpen(false);
      setItemToDelete(undefined);
    }
  }, [deleteItem, itemToDelete]);
  
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
  
  const handleSubmitAdd = useCallback(async (item: Omit<WardrobeItem, 'id' | 'dateCreated'>, file?: File) => {
    try {
      console.log('[useHomePageData] Adding item with file:', !!file);
      console.log('[useHomePageData] Item data received:', {
        neckline: item.neckline,
        sleeves: item.sleeves,
        style: item.style,
        rise: item.rise
      });
      
      await addItem(item, file);
      setIsAddModalOpen(false);
      
      // If the item is a wishlist item, switch to the wishlist tab
      if (item.wishlist) {
        setActiveTab(TabType.WISHLIST);
      }
    } catch (error) {
      console.error('Failed to add item:', error);
      // Consider adding error state to show in UI
    }
  }, [addItem, setActiveTab]);
  
  const handleSubmitEdit = useCallback(async (updates: Partial<WardrobeItem>) => {
    if (!currentItemId) {
      console.error('No item selected for editing');
      return;
    }
    
    try {
      await updateItem(currentItemId, updates);
      
      // If the view modal is open for this item, update the selectedItem with new data
      if (selectedItem?.id === currentItemId) {
        setSelectedItem({ ...selectedItem, ...updates });
      }
      
      setIsEditModalOpen(false);
      setCurrentItemId(null);
    } catch (error) {
      console.error('Failed to update item:', error);
      // Consider adding error state to show in UI
    }
  }, [currentItemId, updateItem, selectedItem]);
  
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
        favorite: outfitData.favorite || false,
        season: outfitData.season || [],
        scenarios: outfitData.scenarios || [],
        occasion: outfitData.occasion || '',
        description: outfitData.description || '',
        lastWorn: outfitData.lastWorn,
        weather: [],
        tags: [],
        dateCreated: new Date().toISOString(),
        scenarioNames: []
      };
      
      // If we have scenario IDs but no names, try to fetch them
      if (newOutfit.scenarios.length > 0 && user) {
        try {
          const allScenarios = await fetchScenarios(user.id);
          newOutfit.scenarioNames = newOutfit.scenarios
            .map(scenarioId => {
              const scenario = allScenarios.find(s => s.id === scenarioId);
              return scenario?.name || '';
            })
            .filter(Boolean);
        } catch (error) {
          console.error('Failed to fetch scenarios for name mapping:', error);
          // Continue without scenario names if we can't fetch them
        }
      }
      
      // Ensure the occasion field is set for backward compatibility
      if (!newOutfit.occasion && newOutfit.scenarioNames?.[0]) {
        newOutfit.occasion = newOutfit.scenarioNames[0];
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
      
      // If we have scenarios but no names, try to fetch them
      if (safeUpdates.scenarios && safeUpdates.scenarios.length > 0 && 
          (!safeUpdates.scenarioNames || safeUpdates.scenarioNames.length === 0) &&
          user) {
        try {
          const allScenarios = await fetchScenarios(user.id);
          safeUpdates.scenarioNames = safeUpdates.scenarios
            .map((scenarioId: string) => {
              const scenario = allScenarios.find((s: { id: string }) => s.id === scenarioId);
              return scenario?.name || '';
            })
            .filter(Boolean) as string[];
        } catch (error) {
          console.error('Failed to fetch scenarios for name mapping:', error);
          // Continue without scenario names if we can't fetch them
        }
      }
      
      // Ensure the occasion field is set for backward compatibility
      if (!safeUpdates.occasion && safeUpdates.scenarioNames?.[0]) {
        safeUpdates.occasion = safeUpdates.scenarioNames[0];
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
  
  const handleGenerateOutfitWithAI = useCallback(async (data: any) => {
    try {
      // Here you would call your AI generation service
      
      // For now, create a simple outfit based on the selected data
      const newOutfit: Omit<OutfitExtended, 'id'> = {
        name: data.name || `${data.scenario || 'New'} Outfit`,
        description: data.description || '',
        items: data.includedItems?.length > 0 
          ? data.includedItems 
          : items
              .filter(item => item.season?.some(s => data.seasons?.includes(s)))
              .slice(0, Math.min(5, items.length))
              .map(item => item.id),
        season: data.seasons || [],
        scenarios: data.scenario ? [data.scenario] : [],
        favorite: false,
        userId: 'guest',
        dateCreated: new Date().toISOString(),
        occasion: data.scenario,
        lastWorn: undefined,
        weather: [],
        tags: []
      };
      
      addOutfit(newOutfit);
      setIsGenerateWithAIModalOpen(false);
    } catch (error) {
      alert('Failed to generate outfit. Please try again.');
    }
  }, [items, addOutfit]);
  
  const handleGenerateCapsuleWithAI = useCallback(async (data: any) => {
    try {
      // Here you would call your AI generation service for capsules
      
      // For now, just show an alert that this feature is coming soon
      alert('AI capsule generation is coming soon! Your preferences have been saved.');
      
      setIsGenerateCapsuleWithAIModalOpen(false);
    } catch (error) {
      alert('There was an error generating the capsule. Please try again.');
    }
  }, []);
  
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
    confirmDeleteItem,
    
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
    isGenerateWithAIModalOpen,
    setIsGenerateWithAIModalOpen,
    isGenerateCapsuleWithAIModalOpen,
    setIsGenerateCapsuleWithAIModalOpen,
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
    handleAddItem,
    handleViewItem,
    handleEditItem,
    handleDeleteItem,
    handleViewOutfit,
    handleEditOutfit,
    handleDeleteOutfit,
    handleViewCapsule,
    handleEditCapsule,
    handleEditCapsuleSubmit,
    handleDeleteCapsule,
    handleSubmitAdd,
    handleSubmitEdit,
    handleAddOutfit,
    handleEditOutfitSubmit,
    handleAddCapsule,
    handleGenerateOutfitWithAI,
    handleGenerateCapsuleWithAI
  };
};
