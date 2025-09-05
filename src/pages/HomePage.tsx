import React, { useMemo } from 'react';
import Header from '../components/layout/Header/Header';
import TabContent from '../components/features/wardrobe/header/TabContent';
import HomePageModals from '../components/features/wardrobe/modals/HomePageModals';
import { useHomePageData } from '../hooks/home/useHomePageData';
import { useTabActions } from '../hooks/home/useTabActions';
import { useInitialDataLoading } from '../hooks/core/useInitialDataLoading';
import { useTabState, TabType } from '../hooks/home/useTabState';
import { useModalState } from '../hooks/home/useModalState';
import { useWardrobeItems } from '../hooks/wardrobe/useWardrobeItems';
import { useOutfitsData } from '../hooks/wardrobe/useOutfitsData';
import { useCapsulesData } from '../hooks/wardrobe/useCapsulesData';
import { useItemFiltering } from '../hooks/home/useItemFiltering';
import { useOutfitFiltering } from '../hooks/home/useOutfitFiltering';
import { useCapsuleFiltering } from '../hooks/home/useCapsuleFiltering';
import WardrobeTabs from '../components/features/wardrobe/header/WardrobeTabs';
import HeaderActions from '../components/features/wardrobe/header/HeaderActions';
import { PageHeader as CommonPageHeader } from '../components/common/Typography/PageHeader';
import { PageHeader, HeaderContent } from './HomePage.styles';
import PageContainer from '../components/layout/PageContainer';

const HomePage: React.FC = () => {
  // Data loading hooks with proper null handling
  const { items: itemsData = null, isLoading: isLoadingItems, error: itemsError } = useWardrobeItems();
  const { outfits: outfitsData = null, isLoading: isLoadingOutfits, error: outfitsError } = useOutfitsData();
  const { capsules: capsulesData = null, isLoading: isLoadingCapsules, error: capsulesError } = useCapsulesData();
  
  // Provide default empty arrays for null data
  const allItems = itemsData || [];
  const outfits = outfitsData || [];
  const capsules = capsulesData || [];
  
  // Tab and filter state management
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
  
  // Get filtered items using the useItemFiltering hook
  const { filteredItems, itemCount } = useItemFiltering(allItems, {
    category: categoryFilter,
    season: seasonFilter,
    searchQuery,
    wishlistStatus: statusFilter,
    isWishlist: activeTab === TabType.WISHLIST
  });

  // Get filtered outfits using the useOutfitFiltering hook
  const { filteredOutfits: filteredOutfitsList, outfitCount } = useOutfitFiltering(outfits, {
    season: seasonFilter,
    scenario: scenarioFilter,
    searchQuery: activeTab === TabType.OUTFITS ? searchQuery : ''
  });

  // Get filtered capsules using the useCapsuleFiltering hook
  const { filteredCapsules: filteredCapsulesList, capsuleCount } = useCapsuleFiltering(capsules, {
    season: seasonFilter,
    scenario: scenarioFilter,
    searchQuery: activeTab === TabType.CAPSULES ? searchQuery : ''
  });
  
  // Get modal state - lifted up to share with both TabActions and HomePageModals
  const modalState = useModalState();
  
  // Debug logging for modal state
  React.useEffect(() => {
    console.log('[HomePage] Modal state:', {
      isAddModalOpen: modalState.isAddModalOpen,
      isViewItemModalOpen: modalState.isViewItemModalOpen,
      isViewOutfitModalOpen: modalState.isViewOutfitModalOpen,
      isViewCapsuleModalOpen: modalState.isViewCapsuleModalOpen,
    });
  }, [modalState.isAddModalOpen, modalState.isViewItemModalOpen, modalState.isViewOutfitModalOpen, modalState.isViewCapsuleModalOpen]);
  
  // Get data handlers from useHomePageData and tab actions from useTabActions
  // Moved above the conditional return to follow React's Rules of Hooks
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
  
  // Get the appropriate list based on active tab
  const currentItems = useMemo(() => {
    switch (activeTab) {
      case TabType.ITEMS:
        return filteredItems;
      case TabType.OUTFITS:
        return filteredOutfitsList;
      case TabType.CAPSULES:
        return filteredCapsulesList;
      case TabType.WISHLIST:
        return filteredItems.filter(item => item.wishlist);
      default:
        return [];
    }
  }, [activeTab, filteredItems, filteredOutfitsList, filteredCapsulesList]);

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
