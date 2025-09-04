import React from 'react';
import Header from '../components/layout/Header/Header';
import TabContent from '../components/features/wardrobe/header/TabContent';
import HomePageModals from '../components/features/wardrobe/modals/HomePageModals';
import { useHomePageData } from '../hooks/home/useHomePageData';
import { useInitialDataLoading } from '../hooks/core/useInitialDataLoading';
import { useTabState, TabType } from '../hooks/home/useTabState';
import { useWardrobeItems } from '../hooks/wardrobe/useWardrobeItems';
import { useOutfitsData } from '../hooks/wardrobe/useOutfitsData';
import { useCapsulesData } from '../hooks/wardrobe/useCapsulesData';
import useItemFiltering from '../hooks/home/useItemFiltering';
import { WardrobeItem } from '../types';
import WardrobeTabs from '../components/features/wardrobe/header/WardrobeTabs';
import HeaderActions from '../components/features/wardrobe/header/HeaderActions';

import { PageHeader as CommonPageHeader } from '../components/common/Typography/PageHeader';
import {
  PageHeader,
  HeaderContent,
} from './HomePage.styles';
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
    isItemsTab,
    isOutfitsTab,
    isCapsulesTab,
    isWishlistTab,
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
  
  // Use our custom hook to get all the data and handlers
  const homePageData = useHomePageData({
    activeTab,
    setActiveTab,
    categoryFilter,
    seasonFilter,
    statusFilter,
    searchQuery,
    scenarioFilter,
    setCategoryFilter,
    setSeasonFilter,
    setStatusFilter,
    setSearchQuery,
    setScenarioFilter
  });
  
  // Apply filters to items with proper type assertion
  const filteredItemsResult = useItemFiltering(allItems || [], {
    category: categoryFilter,
    season: seasonFilter,
    searchQuery: searchQuery
  });
  
  // Ensure we always have an array of filtered items
  const filteredItems = (Array.isArray(filteredItemsResult) 
    ? filteredItemsResult 
    : filteredItemsResult?.filteredItems || []) as WardrobeItem[];

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
    filteredOutfits = [],
    filteredCapsules = [],
    
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
    handleEditItem,
    handleDeleteItem,
    handleEditOutfit,
    handleDeleteOutfit,
    handleEditCapsule,
    handleEditCapsuleSubmit,
    handleDeleteCapsule,
    handleSubmitAdd,
    handleSubmitEdit,
    handleAddOutfit,
    handleEditOutfitSubmit,
    handleAddCapsule,
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
          filteredItems={filteredItems}
          filteredOutfits={outfits}
          filteredCapsules={capsules}
          isLoading={isLoadingItems || isLoadingOutfits || isLoadingCapsules}
          error={error}
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
          activeTab={homePageData.activeTab}
          
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
