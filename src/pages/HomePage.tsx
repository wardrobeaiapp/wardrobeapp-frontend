import React, { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header/Header';
import TabContent from '../components/features/wardrobe/header/TabContent';
import HomePageModals from '../components/features/wardrobe/modals/HomePageModals';
import { useHomePageData } from '../hooks/home/useHomePageData';
import { useTabActions } from '../hooks/home/useTabActions';
import { useInitialDataLoading } from '../hooks/core/useInitialDataLoading';
import { useTabState, TabType } from '../hooks/home/useTabState';
import { useModalState } from '../hooks/home/useModalState';
import { useWardrobeItemsData } from '../hooks/wardrobe/items/useWardrobeItemsData';
import { useOutfitsData } from '../hooks/wardrobe/outfits/useOutfitsData';
import { useCapsulesData } from '../hooks/wardrobe/capsules/useCapsulesData';
import { useItemFiltering } from '../hooks/home/useItemFiltering';
import { useOutfitFiltering } from '../hooks/home/useOutfitFiltering';
import { useCapsuleFiltering } from '../hooks/home/useCapsuleFiltering';
import WardrobeTabs from '../components/features/wardrobe/header/WardrobeTabs';
import HeaderActions from '../components/features/wardrobe/header/HeaderActions';
import { PageHeader as CommonPageHeader } from '../components/common/Typography/PageHeader';
import { PageHeader, HeaderContent } from './HomePage.styles';
import PageContainer from '../components/layout/PageContainer';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  
  // State for AI history data pre-filling
  const [aiHistoryInitialItem, setAiHistoryInitialItem] = useState<any>(null);
  
  // Tab and filter state management (needed early)
  const { 
    activeTab, 
    setActiveTab,
    filters: {
      category: categoryFilter,
      season: seasonFilter,
      status: statusFilter,
      searchQuery,
      scenario: scenarioFilter
    },
    setCategoryFilter,
    setSeasonFilter,
    setStatusFilter,
    setSearchQuery,
    setScenarioFilter
  } = useTabState(TabType.ITEMS);

  // Get modal state - lifted up to share with both TabActions and HomePageModals
  const modalState = useModalState();
  
  // Check for AI history data on component mount
  useEffect(() => {
    const aiHistoryData = sessionStorage.getItem('aiHistoryAddItem');
    
    if (aiHistoryData) {
      try {
        const { fromAIHistory, itemData } = JSON.parse(aiHistoryData);
        
        if (fromAIHistory && itemData) {
          // Switch to items tab (not wishlist)
          setActiveTab(TabType.ITEMS);
          
          // Store AI history data for pre-filling
          const initialItem = {
            ...itemData,
            wishlist: true
          };
          setAiHistoryInitialItem(initialItem);
          
          // Open Add Item modal with pre-filled data after a short delay
          setTimeout(() => {
            modalState.setIsAddModalOpen(true);
            sessionStorage.removeItem('aiHistoryAddItem');
          }, 500);
        }
      } catch (error) {
        console.error('Error parsing AI history data:', error);
        sessionStorage.removeItem('aiHistoryAddItem');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, setActiveTab, modalState.setIsAddModalOpen]);

  // Data loading hooks with proper null handling  
  const { items: itemsData = null, isLoading: isLoadingItems, error: itemsError } = useWardrobeItemsData();
  // PERFORMANCE: Only load outfits when outfits tab is active to prevent main thread blocking
  const { outfits: outfitsData = null, isLoading: isLoadingOutfits, error: outfitsError } = 
    useOutfitsData(activeTab === TabType.OUTFITS);
  const { capsules: capsulesData = null, isLoading: isLoadingCapsules, error: capsulesError } = useCapsulesData();
  
  // Provide default empty arrays for null data
  const allItems = itemsData || [];
  const outfits = outfitsData || [];
  const capsules = capsulesData || [];
  
  // Memoize filter options to prevent unnecessary recalculations
  const itemFilterOptions = useMemo(() => ({
    category: categoryFilter,
    season: seasonFilter,
    searchQuery,
    wishlistStatus: statusFilter,
    isWishlist: activeTab === TabType.WISHLIST
  }), [categoryFilter, seasonFilter, searchQuery, statusFilter, activeTab]);

  // Defer heavy filtering operations until data is actually loaded
  const { filteredItems, itemCount } = useItemFiltering(
    isLoadingItems ? [] : allItems, 
    itemFilterOptions
  );

  // Only filter outfits when data is loaded and tab is active (reduces initial blocking)
  const { filteredOutfits: filteredOutfitsList, outfitCount } = useOutfitFiltering(
    (isLoadingOutfits || activeTab !== TabType.OUTFITS) ? [] : outfits, 
    {
      season: seasonFilter,
      scenario: scenarioFilter,
      searchQuery: activeTab === TabType.OUTFITS ? searchQuery : ''
    }
  );

  // Only filter capsules when data is loaded and tab is active (reduces initial blocking)
  const { filteredCapsules: filteredCapsulesList, capsuleCount } = useCapsuleFiltering(
    (isLoadingCapsules || activeTab !== TabType.CAPSULES) ? [] : capsules, 
    {
      season: seasonFilter,
      scenario: scenarioFilter,
      searchQuery: activeTab === TabType.CAPSULES ? searchQuery : ''
    }
  );
  
  // Get data handlers from useHomePageData and tab actions from useTabActions
  // Moved above conditional return to follow React's Rules of Hooks
  // Pass modalState to useHomePageData first
  const homePageData = useHomePageData(modalState);
  
  // Then pass both modalState and homePageData to useTabActions to break the circular dependency
  const tabActions = useTabActions(modalState, homePageData);

  // Handle error objects by converting them to strings
  const getErrorMessage = (error: unknown): string | null => {
    if (!error) return null;
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    try {
      return JSON.stringify(error);
    } catch {
      return 'An unknown error occurred';
    }
  };

  // Track overall loading state and handle initial load
  const { 
    error, 
    initialLoadComplete 
  } = useInitialDataLoading(
    isLoadingItems,
    isLoadingOutfits,
    isLoadingCapsules,
    itemsError ? getErrorMessage(itemsError) : null,
    outfitsError ? getErrorMessage(outfitsError) : null,
    capsulesError ? getErrorMessage(capsulesError) : null
  );

  // Get modal state directly from useModalState - moved above conditional return
  
  // Get the appropriate list based on active tab - optimized with early returns for loading states
  const currentItems = useMemo(() => {
    // Return empty array during loading to prevent unnecessary processing
    if (isLoadingItems && (activeTab === TabType.ITEMS || activeTab === TabType.WISHLIST)) return [];
    if (isLoadingOutfits && activeTab === TabType.OUTFITS) return [];
    if (isLoadingCapsules && activeTab === TabType.CAPSULES) return [];
    
    switch (activeTab) {
      case TabType.ITEMS:
        return filteredItems;
      case TabType.OUTFITS:
        return filteredOutfitsList;
      case TabType.CAPSULES:
        return filteredCapsulesList;
      case TabType.WISHLIST:
        return filteredItems; // Already filtered by useItemFiltering with isWishlist: true
      default:
        return [];
    }
  }, [activeTab, filteredItems, filteredOutfitsList, filteredCapsulesList, isLoadingItems, isLoadingOutfits, isLoadingCapsules]);

  // Show loading state while initial data is being loaded
  if (!initialLoadComplete) {
    return (
      <PageContainer>
        <div>Loading wardrobe data...</div>
      </PageContainer>
    );
  }
  
  const {
    setCurrentOutfitId,
    setSelectedCapsule,
    setSelectedOutfit,
  } = homePageData;

  // Main component render

  return (
    <>
      <Header />
      <PageContainer>
        
        <PageHeader>
          <HeaderContent>
            <CommonPageHeader 
              title="My Wardrobe"
              description="Organize and optimize your wardrobe collection"
              titleSize="lg"
            />
          </HeaderContent>
          <HeaderActions 
            activeTab={activeTab}
            onAddItem={tabActions.onAddItem}
            onAddOutfit={tabActions.onAddOutfit}
            onAddCapsule={tabActions.onAddCapsule}
            onMarkComplete={() => {}}
          />
        </PageHeader>
        
        <WardrobeTabs 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
        
        <TabContent
          activeTab={activeTab}
          items={allItems}
          currentItems={currentItems}
          filteredItems={filteredItems}
          filteredOutfits={filteredOutfitsList}
          filteredCapsules={filteredCapsulesList}
          isLoading={isLoadingItems || isLoadingOutfits || isLoadingCapsules}
          error={error}
          itemCount={activeTab === TabType.OUTFITS ? outfitCount : 
                   activeTab === TabType.CAPSULES ? capsuleCount : 
                   itemCount}
          // Filters from useTabState
          categoryFilter={categoryFilter}
          seasonFilter={seasonFilter}
          statusFilter={statusFilter}
          searchQuery={searchQuery}
          scenarioFilter={scenarioFilter}
          // Filter handlers from useTabState
          setCategoryFilter={setCategoryFilter}
          setSeasonFilter={setSeasonFilter}
          setStatusFilter={setStatusFilter}
          setSearchQuery={setSearchQuery}
          setScenarioFilter={setScenarioFilter}
          // Action handlers from useTabActions
          onAddItem={tabActions.onAddItem}
          onEditItem={tabActions.onEditItem}
          onDeleteItem={tabActions.onDeleteItem}
          onViewItem={tabActions.onViewItem}
          onViewOutfit={tabActions.onViewOutfit}
          onDeleteOutfit={tabActions.onDeleteOutfit}
          onViewCapsule={tabActions.onViewCapsule}
          onDeleteCapsule={tabActions.onDeleteCapsule}
        />
        
        {/* All modals */}
        <HomePageModals
          // Modal state
          modalState={modalState}
          // Items
          items={allItems}
          currentItem={homePageData.currentItem}
          selectedItem={homePageData.selectedItem}
          itemToDelete={homePageData.itemToDelete}
          initialItem={aiHistoryInitialItem} // Pass AI history data for pre-filling
          activeTab={activeTab}
          
          // Outfits
          currentOutfit={homePageData.currentOutfit}
          selectedOutfit={homePageData.selectedOutfit}
          
          // Capsules
          selectedCapsule={homePageData.selectedCapsule}
          
          // Delete confirmation modal state
          isDeleteConfirmModalOpen={homePageData.isDeleteConfirmModalOpen}
          setIsDeleteConfirmModalOpen={homePageData.setIsDeleteConfirmModalOpen}
          
          // Action handlers
          handleSubmitAdd={homePageData.handleSubmitAdd}
          handleSubmitEdit={homePageData.handleSubmitEdit}
          handleAddOutfit={homePageData.handleAddOutfit}
          handleEditOutfitSubmit={homePageData.handleEditOutfitSubmit}
          handleAddCapsule={homePageData.handleAddCapsule}
          handleEditCapsuleSubmit={homePageData.handleEditCapsuleSubmit}
          confirmDeleteItem={tabActions.confirmDeleteItem}
          
          // Item handlers
          handleEditItem={tabActions.onEditItem}
          handleDeleteItem={tabActions.onDeleteItem}
          
          // Outfit handlers
          handleEditOutfit={tabActions.onEditOutfit}
          handleDeleteOutfit={tabActions.onDeleteOutfit}
          setCurrentOutfitId={setCurrentOutfitId}
          
          // Capsule handlers
          handleEditCapsule={tabActions.onEditCapsule}
          handleDeleteCapsule={tabActions.onDeleteCapsule}
          setSelectedCapsule={setSelectedCapsule}
          setSelectedOutfit={setSelectedOutfit}
        />  
        
        {/* Removed duplicate code */}

    </PageContainer>
    </>
  );
};

export default HomePage;
