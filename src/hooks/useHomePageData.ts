import { useState, useCallback, useMemo, useEffect } from 'react';
import { Outfit, Capsule, WardrobeItem, Season, WishlistStatus } from '../types';
import { OutfitExtended } from '../context/WardrobeContext';
import { useWardrobe } from '../context/WardrobeContext';
import { useOutfits } from './wardrobe/outfits/useOutfits';
import useCapsules from './wardrobe/capsules/useCapsules';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import { CapsuleFormData } from '../components/features/wardrobe/forms/CapsuleForm';
import { getScenariosForUser as fetchScenarios } from '../services/scenarios/scenariosService';

export enum TabType {
  ITEMS = 'items',
  OUTFITS = 'outfits',
  CAPSULES = 'capsules',
  WISHLIST = 'wishlist'
}

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
  const [activeTab, setActiveTab] = useState<TabType>(TabType.ITEMS);
  
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
  const [wishlistStatusFilter, setWishlistStatusFilter] = useState<string>('all');
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddOutfitModalOpen, setIsAddOutfitModalOpen] = useState(false);
  const [isEditOutfitModalOpen, setIsEditOutfitModalOpen] = useState(false);
  const [isViewOutfitModalOpen, setIsViewOutfitModalOpen] = useState(false);
  const [isViewCapsuleModalOpen, setIsViewCapsuleModalOpen] = useState(false);
  const [isEditCapsuleModalOpen, setIsEditCapsuleModalOpen] = useState(false);
  const [isGenerateWithAIModalOpen, setIsGenerateWithAIModalOpen] = useState(false);
  const [isGenerateCapsuleWithAIModalOpen, setIsGenerateCapsuleWithAIModalOpen] = useState(false);
  const [isAddCapsuleModalOpen, setIsAddCapsuleModalOpen] = useState(false);
  const [isViewItemModalOpen, setIsViewItemModalOpen] = useState(false);
  
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
  
  // Filter items based on selected filters
  const filteredItems = useMemo(() => items.filter(item => {
    const searchLower = searchQuery.toLowerCase();
    const categoryLower = item.category?.toLowerCase() || '';
    const brandLower = item.brand?.toLowerCase() || '';
    
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesSeason = seasonFilter === 'all' || (item.season || []).includes(seasonFilter as Season);
    const matchesSearch = searchQuery === '' || 
      item.name.toLowerCase().includes(searchLower) ||
      categoryLower.includes(searchLower) ||
      brandLower.includes(searchLower);
    
    return matchesCategory && matchesSeason && matchesSearch && !item.wishlist;
  }), [items, categoryFilter, seasonFilter, searchQuery]);
  
  // Filter outfits based on selected filters
  const filteredOutfits = useMemo(() => outfits.filter(outfit => {
    const searchLower = outfitSearchQuery.toLowerCase();
    const outfitScenarios = outfit.scenarios || [];
    
    const matchesSeason = outfitSeasonFilter === 'all' || 
      (outfit.season || []).includes(outfitSeasonFilter as Season);
      
    const matchesScenario = outfitScenarioFilter === 'all' || 
      outfitScenarios.includes(outfitScenarioFilter);
      
    const matchesSearch = outfitSearchQuery === '' || 
      outfit.name.toLowerCase().includes(searchLower) ||
      outfitScenarios.some(scenario => scenario.toLowerCase().includes(searchLower));
      
    return matchesSeason && matchesScenario && matchesSearch;
  }), [outfits, outfitSeasonFilter, outfitScenarioFilter, outfitSearchQuery]);

  // Filter capsules based on selected filters
  const filteredCapsules = useMemo(() => capsules.filter(capsule => {
    const searchLower = capsuleSearchQuery.toLowerCase();
    const capsuleScenarios = capsule.scenarios || [];
    const capsuleSeasons = capsule.seasons || [];
    
    const matchesSeason = capsuleSeasonFilter === 'all' || 
      capsuleSeasons.includes(capsuleSeasonFilter as Season);
      
    const matchesScenario = capsuleScenarioFilter === 'all' || 
      capsuleScenarios.includes(capsuleScenarioFilter);
      
    const matchesSearch = capsuleSearchQuery === '' || 
      capsule.name.toLowerCase().includes(searchLower) ||
      capsuleScenarios.some(scenario => scenario.toLowerCase().includes(searchLower));
      
    return matchesSeason && matchesScenario && matchesSearch;
  }), [capsules, capsuleSeasonFilter, capsuleScenarioFilter, capsuleSearchQuery]);

  // Memoize wishlist items separately for better performance
  const wishlistItems = useMemo(() => 
    items.filter(item => item.wishlist === true)
  , [items]);

  // Filter wishlist items based on selected filters
  const filteredWishlistItems = useMemo(() => {
    // Apply all filters
    return wishlistItems.filter(item => {
      // Category filter
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      
      // Season filter
      const matchesSeason = seasonFilter === 'all' || 
        (Array.isArray(item.season) 
          ? item.season.includes(seasonFilter as Season)
          : item.season === seasonFilter);
      
      // Status filter - handle null/undefined as 'not_reviewed'
      const itemStatus = item.wishlistStatus || WishlistStatus.NOT_REVIEWED;
      const matchesStatus = wishlistStatusFilter === 'all' || 
        itemStatus === wishlistStatusFilter;
      
      // Search query
      const searchLower = wishlistSearchQuery.toLowerCase();
      const matchesSearch = wishlistSearchQuery === '' || 
        item.name.toLowerCase().includes(searchLower) ||
        (item.category?.toLowerCase() || '').includes(searchLower) ||
        (item.brand?.toLowerCase() || '').includes(searchLower);
      
      return matchesCategory && matchesSeason && matchesStatus && matchesSearch;
    });
  }, [wishlistItems, categoryFilter, seasonFilter, wishlistStatusFilter, wishlistSearchQuery]);
  
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
    setIsViewOutfitModalOpen(true);
  }, []);
  
  const handleEditOutfit = useCallback((outfit: Outfit) => {
    setCurrentOutfitId(outfit.id);
    setIsViewOutfitModalOpen(false);
    setIsEditOutfitModalOpen(true);
  }, []);
  
  const handleDeleteOutfit = useCallback((id: string) => {
    deleteOutfit(id);
    setIsViewOutfitModalOpen(false);
    setSelectedOutfit(null);
  }, [deleteOutfit, setIsViewOutfitModalOpen, setSelectedOutfit]);
  
  const handleViewCapsule = useCallback((capsule: Capsule) => {
    setSelectedCapsule(capsule);
    setIsViewCapsuleModalOpen(true);
  }, []);
  
  const handleEditCapsule = useCallback((capsule: Capsule) => {
    setSelectedCapsule(capsule);
    setIsViewCapsuleModalOpen(false);
    setIsEditCapsuleModalOpen(true);
  }, []);
  
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
  
  const handleAddOutfit = useCallback(async (outfitData: Omit<Outfit, 'id' | 'dateCreated' | 'userId' | 'scenarios'> & { scenarios?: string[] }) => {
    try {
      // Create a new outfit with all required fields
      const newOutfit: Omit<OutfitExtended, 'id'> = {
        ...outfitData,
        userId: 'current-user-id', // TODO: Get from auth context
        items: outfitData.items || [],
        favorite: outfitData.favorite || false,
        season: outfitData.season || [],
        occasion: outfitData.occasion || '',
        lastWorn: outfitData.lastWorn,
        name: outfitData.name || 'New Outfit',
        description: '',
        weather: [],
        tags: [],
        dateCreated: new Date().toISOString(),
        scenarios: outfitData.scenarios || [],
        // Initialize scenarioNames as empty array if not provided
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
        // Preserve scenarioNames if provided, or use empty array
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
