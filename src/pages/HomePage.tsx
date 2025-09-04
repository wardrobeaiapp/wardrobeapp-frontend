import React from 'react';
import Header from '../components/layout/Header/Header';
import { ItemsTab, OutfitsTab, CapsulesTab } from '../components/features/wardrobe/tabs';
import WishlistTab from '../components/features/wardrobe/tabs/WishlistTab';
import HomePageModals from '../components/features/wardrobe/modals/HomePageModals';
import { useHomePageData, TabType } from '../hooks/home';
import WardrobeTabs from '../components/features/wardrobe/header/WardrobeTabs';
import HeaderActions from '../components/features/wardrobe/header/HeaderActions';

import { PageHeader as CommonPageHeader } from '../components/common/Typography/PageHeader';
import {
  PageHeader,
  HeaderContent,
} from './HomePage.styles';
import PageContainer from '../components/layout/PageContainer';



const HomePage: React.FC = () => {
  // Use our custom hook to get all the data and handlers

  const {
    // Data
    items,
    filteredItems,
    filteredOutfits,
    filteredCapsules,
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
  } = useHomePageData();

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
        
        {/* Tab content will be rendered below */}
        
        {/* Tab Content */}
        {activeTab === TabType.ITEMS && (
          <ItemsTab
            items={filteredItems}
            isLoading={isLoading}
            error={error}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            seasonFilter={seasonFilter}
            setSeasonFilter={setSeasonFilter}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onViewItem={handleViewItem}
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItem}
          />
        )}
        
        {activeTab === TabType.OUTFITS && (
          <OutfitsTab
            outfits={filteredOutfits}
            wardrobeItems={items}
            isLoading={isLoading}
            error={error}
            seasonFilter={outfitSeasonFilter}
            setSeasonFilter={setOutfitSeasonFilter}
            scenarioFilter={outfitScenarioFilter}
            setScenarioFilter={setOutfitScenarioFilter}
            searchQuery={outfitSearchQuery}
            setSearchQuery={setOutfitSearchQuery}
            onViewOutfit={handleViewOutfit}
            onDeleteOutfit={handleDeleteOutfit}
          />
        )}
        
        {activeTab === TabType.CAPSULES && (
          <CapsulesTab
            capsules={filteredCapsules}
            wardrobeItems={items}
            isLoading={isLoading}
            error={error}
            seasonFilter={capsuleSeasonFilter}
            setSeasonFilter={setCapsuleSeasonFilter}
            scenarioFilter={capsuleScenarioFilter}
            setScenarioFilter={setCapsuleScenarioFilter}
            searchQuery={capsuleSearchQuery}
            setSearchQuery={setCapsuleSearchQuery}
            onViewCapsule={handleViewCapsule}
            onDeleteCapsule={handleDeleteCapsule}
          />
        )}
        
        {activeTab === TabType.WISHLIST && (
          <WishlistTab
            items={items}
            isLoading={isLoading}
            error={error}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            seasonFilter={seasonFilter}
            setSeasonFilter={setSeasonFilter}
            statusFilter={wishlistStatusFilter}
            setStatusFilter={setWishlistStatusFilter}
            searchQuery={wishlistSearchQuery}
            setSearchQuery={setWishlistSearchQuery}
            onViewItem={handleViewItem}
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItem}
            onAddItem={handleAddItem}
          />
        )}
        
        {/* All modals */}
        <HomePageModals
          // Items
          items={items}
          currentItem={currentItem}
          selectedItem={selectedItem}
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
          isDeleteConfirmModalOpen={isDeleteConfirmModalOpen}
          itemToDelete={itemToDelete}
          isAddCapsuleModalOpen={isAddCapsuleModalOpen}
          isViewItemModalOpen={isViewItemModalOpen}
          
          // Modal close handlers
          setIsAddModalOpen={setIsAddModalOpen}
          setIsEditModalOpen={setIsEditModalOpen}
          setIsAddOutfitModalOpen={setIsAddOutfitModalOpen}
          setIsEditOutfitModalOpen={setIsEditOutfitModalOpen}
          setIsViewOutfitModalOpen={setIsViewOutfitModalOpen}
          setIsViewCapsuleModalOpen={setIsViewCapsuleModalOpen}
          setIsEditCapsuleModalOpen={setIsEditCapsuleModalOpen}
          setIsDeleteConfirmModalOpen={setIsDeleteConfirmModalOpen}
          setIsAddCapsuleModalOpen={setIsAddCapsuleModalOpen}
          setIsViewItemModalOpen={setIsViewItemModalOpen}
          
          // Action handlers
          handleSubmitAdd={handleSubmitAdd}
          handleSubmitEdit={handleSubmitEdit}
          handleAddOutfit={handleAddOutfit}
          handleEditOutfitSubmit={handleEditOutfitSubmit}
          handleAddCapsule={handleAddCapsule}
          handleEditCapsuleSubmit={handleEditCapsuleSubmit}
          confirmDeleteItem={confirmDeleteItem}
          
          // Item handlers
          handleEditItem={handleEditItem}
          handleDeleteItem={handleDeleteItem}
          
          // Outfit handlers
          handleEditOutfit={handleEditOutfit}
          handleDeleteOutfit={handleDeleteOutfit}
          setCurrentOutfitId={setCurrentOutfitId}
          
          // Capsule handlers
          handleEditCapsule={handleEditCapsule}
          handleDeleteCapsule={handleDeleteCapsule}
          setSelectedCapsule={setSelectedCapsule}
          setSelectedOutfit={setSelectedOutfit}
        />

    </PageContainer>
    </>
  );
};

export default HomePage;
