import React, { useMemo } from 'react';
import Header from '../components/layout/Header/Header';
import TabContent from '../components/features/wardrobe/header/TabContent';
import HomePageModals from '../components/features/wardrobe/modals/HomePageModals';
import { useHomePageData } from '../hooks/home/useHomePageData';
import { useInitialDataLoading } from '../hooks/core/useInitialDataLoading';
import { useTabState, TabType } from '../hooks/home/useTabState';
import { useWardrobeItems } from '../hooks/wardrobe/useWardrobeItems';
import { useOutfitsData } from '../hooks/wardrobe/useOutfitsData';
import { useCapsulesData } from '../hooks/wardrobe/useCapsulesData';
import { useItemFiltering } from '../hooks/home/useItemFiltering';
import { useOutfitFiltering } from '../hooks/home/useOutfitFiltering';
import { useCapsuleFiltering } from '../hooks/home/useCapsuleFiltering';
import { Season } from '../types';
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
  
  // Use our custom hook to get all the data and handlers
  const homePageData = useHomePageData();

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

  // Type-safe season filter function
  const matchesSeasonFilter = (itemSeasons: Season[] | undefined, filter: string | string[]): boolean => {
    if (filter === 'all') return true;
    if (!itemSeasons || itemSeasons.length === 0) return false;
    
    // Handle both string and array filters
    const filterSeasons = Array.isArray(filter) ? filter : [filter];
    
    return filterSeasons.some(filterSeason => {
      // Handle 'all_season' special case (case-insensitive)
      if (filterSeason.toString().toLowerCase() === 'all_season') {
        return itemSeasons.includes(Season.ALL_SEASON) || 
               itemSeasons.length === Object.values(Season).filter(s => s !== Season.ALL_SEASON).length;
      }
      
      // Convert filter to Season enum value if it's a valid season
      const filterSeasonValue = Object.values(Season).find(
        s => s.toLowerCase() === filterSeason.toString().toLowerCase()
      );
      
      if (!filterSeasonValue) return false;
      
      // Check if any of the item's seasons match the filter
      return itemSeasons.some(season => 
        season === filterSeasonValue || 
        (season === Season.ALL_SEASON && filterSeasonValue !== Season.ALL_SEASON)
      );
    });
  };

  // Track overall loading state and handle initial load
  const { 
    isLoading, 
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
    // Data
    items = [],
    
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
    isAddCapsuleModalOpen,
    setIsAddCapsuleModalOpen,
    isViewItemModalOpen,
    setIsViewItemModalOpen,
    
    // Selected items
    selectedOutfit,
    selectedCapsule,
    currentOutfit,
    currentItem,
    selectedItem,
    setCurrentOutfitId,
    setSelectedCapsule,
    setSelectedOutfit,
    
    // Event handlers
    handleAddItem,
    handleEditCapsuleSubmit,
    handleSubmitAdd,
    handleSubmitEdit,
    handleAddOutfit,
    handleEditOutfitSubmit,
    handleAddCapsule,
  } = homePageData;

  // Filter outfits and capsules based on active tab and filters


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
            onAddItem={handleAddItem}
            onAddOutfit={() => setIsAddOutfitModalOpen(true)}
            onAddCapsule={() => setIsAddCapsuleModalOpen(true)}
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
          // Action handlers from useHomePageData
          onAddItem={homePageData.handleAddItem}
          onEditItem={homePageData.handleEditItem}
          onDeleteItem={homePageData.handleDeleteItem}
          onViewItem={homePageData.handleViewItem}
          onViewOutfit={homePageData.handleViewOutfit}
          onDeleteOutfit={homePageData.handleDeleteOutfit}
          onViewCapsule={homePageData.handleViewCapsule}
          onDeleteCapsule={homePageData.handleDeleteCapsule}
        />
        
        {/* All modals */}
        <HomePageModals
          // Items
          items={allItems}
          currentItem={currentItem}
          selectedItem={selectedItem}
          itemToDelete={itemToDelete}
          activeTab={activeTab}
          
          // Outfits
          currentOutfit={currentOutfit}
          selectedOutfit={selectedOutfit}
          
          // Capsules
          selectedCapsule={selectedCapsule}
          
          // Modal states
          isAddModalOpen={isAddModalOpen}
          isEditModalOpen={isEditModalOpen}
          isAddOutfitModalOpen={isAddOutfitModalOpen}
          isEditOutfitModalOpen={isEditOutfitModalOpen}
          isViewOutfitModalOpen={isViewOutfitModalOpen}
          isViewCapsuleModalOpen={isViewCapsuleModalOpen}
          isEditCapsuleModalOpen={isEditCapsuleModalOpen}
          isAddCapsuleModalOpen={isAddCapsuleModalOpen}
          isViewItemModalOpen={isViewItemModalOpen}
          isDeleteConfirmModalOpen={isDeleteConfirmModalOpen}
          
          // Modal close handlers
          setIsAddModalOpen={setIsAddModalOpen}
          setIsEditModalOpen={setIsEditModalOpen}
          setIsAddOutfitModalOpen={setIsAddOutfitModalOpen}
          setIsEditOutfitModalOpen={setIsEditOutfitModalOpen}
          setIsViewOutfitModalOpen={setIsViewOutfitModalOpen}
          setIsViewCapsuleModalOpen={setIsViewCapsuleModalOpen}
          setIsEditCapsuleModalOpen={setIsEditCapsuleModalOpen}
          setIsAddCapsuleModalOpen={setIsAddCapsuleModalOpen}
          setIsViewItemModalOpen={setIsViewItemModalOpen}
          setIsDeleteConfirmModalOpen={setIsDeleteConfirmModalOpen}
          
          // Action handlers
          handleSubmitAdd={handleSubmitAdd}
          handleSubmitEdit={handleSubmitEdit}
          handleAddOutfit={handleAddOutfit}
          handleEditOutfitSubmit={handleEditOutfitSubmit}
          handleAddCapsule={handleAddCapsule}
          handleEditCapsuleSubmit={handleEditCapsuleSubmit}
          confirmDeleteItem={confirmDeleteItem}
          
          // Item handlers
          handleEditItem={homePageData.handleEditItem}
          handleDeleteItem={homePageData.handleDeleteItem}
          
          // Outfit handlers
          handleEditOutfit={homePageData.handleEditOutfit}
          handleDeleteOutfit={homePageData.handleDeleteOutfit}
          setCurrentOutfitId={setCurrentOutfitId}
          
          // Capsule handlers
          handleEditCapsule={homePageData.handleEditCapsule}
          handleDeleteCapsule={homePageData.handleDeleteCapsule}
          setSelectedCapsule={setSelectedCapsule}
          setSelectedOutfit={setSelectedOutfit}
        />  
        
        {/* Removed duplicate code */}

    </PageContainer>
    </>
  );
};

export default HomePage;
