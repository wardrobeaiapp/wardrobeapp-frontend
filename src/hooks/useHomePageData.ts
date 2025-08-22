import { useState, useCallback, useMemo, useEffect } from 'react';
import { Outfit, Capsule, WardrobeItem, Season, WishlistStatus } from '../types';
import { useWardrobe } from '../context/WardrobeContext';
import { useOutfits } from '../hooks/useOutfits';
import useCapsules from '../hooks/useCapsules';
import { CapsuleFormData } from '../components/features/wardrobe/forms/CapsuleForm';

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
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesSeason = seasonFilter === 'all' || item.season.includes(seasonFilter as Season);
    const matchesSearch = searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSeason && matchesSearch && !item.wishlist;
  }), [items, categoryFilter, seasonFilter, searchQuery]);
  
  // Filter outfits based on selected filters
  const filteredOutfits = useMemo(() => outfits.filter(outfit => {
    const matchesSeason = outfitSeasonFilter === 'all' || outfit.season.includes(outfitSeasonFilter as Season);
    const matchesScenario = outfitScenarioFilter === 'all' || (outfit.scenarios && outfit.scenarios.includes(outfitScenarioFilter));
    const matchesSearch = outfitSearchQuery === '' || 
      outfit.name.toLowerCase().includes(outfitSearchQuery.toLowerCase()) ||
      (outfit.scenarios && outfit.scenarios.some(scenario => scenario.toLowerCase().includes(outfitSearchQuery.toLowerCase())));
    return matchesSeason && matchesScenario && matchesSearch;
  }), [outfits, outfitSeasonFilter, outfitScenarioFilter, outfitSearchQuery]);

  // Filter capsules based on selected filters
  const filteredCapsules = useMemo(() => capsules.filter(capsule => {
    const matchesSeason = capsuleSeasonFilter === 'all' || capsule.seasons.includes(capsuleSeasonFilter as Season);
    const matchesScenario = capsuleScenarioFilter === 'all' || (capsule.scenarios && capsule.scenarios.includes(capsuleScenarioFilter));
    const matchesSearch = capsuleSearchQuery === '' || 
      capsule.name.toLowerCase().includes(capsuleSearchQuery.toLowerCase()) ||
      (capsule.scenarios && capsule.scenarios.some(scenario => scenario.toLowerCase().includes(capsuleSearchQuery.toLowerCase())));
    return matchesSeason && matchesScenario && matchesSearch;
  }), [capsules, capsuleSeasonFilter, capsuleScenarioFilter, capsuleSearchQuery]);

  // Filter wishlist items based on selected filters
  const filteredWishlistItems = useMemo(() => {
    console.log('[useHomePageData] Filtering wishlist items');
    console.log('[useHomePageData] Total items:', items.length);
    
    // First filter only wishlist items
    const wishlistItems = items.filter(item => item.wishlist === true);
    console.log('[useHomePageData] Wishlist items count:', wishlistItems.length);
    console.log('[useHomePageData] Status filter value:', wishlistStatusFilter);
    
    // Debug log all wishlist items with their status
    console.log('[useHomePageData] Wishlist items with status:', wishlistItems.map(item => ({
      id: item.id,
      name: item.name,
      wishlist: item.wishlist,
      wishlistStatus: item.wishlistStatus || WishlistStatus.NOT_REVIEWED
    })));
    
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
      
      console.log(`[useHomePageData] Item ${item.name} - status: ${itemStatus}, matches: ${matchesStatus}`);
      
      // Search query
      const searchLower = wishlistSearchQuery.toLowerCase();
      const matchesSearch = wishlistSearchQuery === '' || 
        item.name.toLowerCase().includes(searchLower) ||
        (item.category?.toLowerCase() || '').includes(searchLower) ||
        (item.brand?.toLowerCase() || '').includes(searchLower);
      
      return matchesCategory && matchesSeason && matchesStatus && matchesSearch;
    });
  }, [items, categoryFilter, seasonFilter, wishlistStatusFilter, wishlistSearchQuery]);
  
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
  }, [deleteOutfit]);
  
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
  
  const handleSubmitAdd = useCallback((item: any, file?: File) => {
    console.log('[useHomePageData] Adding item with file:', !!file);
    console.log('[useHomePageData] Item data received:', {
      neckline: item.neckline,
      sleeves: item.sleeves,
      style: item.style,
      rise: item.rise
    });
    addItem(item, file);
    setIsAddModalOpen(false);
    
    // If the item is a wishlist item, switch to the wishlist tab
    if (item.wishlist) {
      setActiveTab(TabType.WISHLIST);
    }
  }, [addItem, setActiveTab]);
  
  const handleSubmitEdit = useCallback((item: any) => {
    if (currentItemId) {
      updateItem(currentItemId, item);
      
      // If the view modal is open for this item, update the selectedItem with new data
      if (selectedItem && selectedItem.id === currentItemId) {
        setSelectedItem({ ...selectedItem, ...item });
      }
      
      setIsEditModalOpen(false);
      setCurrentItemId(null);
    }
  }, [currentItemId, updateItem, selectedItem]);
  
  const handleAddOutfit = useCallback((outfit: any) => {
    addOutfit(outfit);
    setIsAddOutfitModalOpen(false);
  }, [addOutfit]);
  
  const handleEditOutfitSubmit = useCallback((outfitData: any) => {
    if (currentOutfitId) {
      updateOutfit(currentOutfitId, outfitData);
      setIsEditOutfitModalOpen(false);
      setCurrentOutfitId(null);
    }
  }, [currentOutfitId, updateOutfit]);
  
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
      const newCapsule = await addCapsule(capsuleData);
      
      if (!newCapsule) {
        throw new Error('Failed to create capsule');
      }
      
      // Close the modal
      setIsAddCapsuleModalOpen(false);
      
      // Force a refresh of the capsules list
      // This ensures the UI is in sync with the database
      window.dispatchEvent(new CustomEvent('refreshCapsules'));
      
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
      const newOutfit = {
        name: `${data.scenario} Outfit`,
        items: data.includedItems.length > 0 ? 
          data.includedItems : 
          // If no items were specifically selected, include some random items from the wardrobe
          // that match the selected seasons
          items.filter(item => 
            item.season.some(s => data.seasons.includes(s))
          ).slice(0, Math.min(5, items.length)).map(item => item.id),
        season: data.seasons,
        scenarios: [data.scenario], // Store scenario in the scenarios array
        occasion: data.scenario, // Keep for backward compatibility
        favorite: false,
        lastWorn: undefined
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
