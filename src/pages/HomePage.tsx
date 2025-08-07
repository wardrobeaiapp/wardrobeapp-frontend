import React from 'react';
import Header from '../components/Header/Header';
import Button from '../components/Button';
import { ItemsTab, OutfitsTab, CapsulesTab } from '../components/HomePage';
import WishlistTab from '../components/HomePage/WishlistTab';
import HomePageModals from '../components/HomePage/HomePageModals';
import { useHomePageData, TabType } from '../hooks/useHomePageData';

import {
  PageContainer,
  PageHeader,
  Title,
  TabsContainer,
  Tab
} from './HomePage.styles';



const HomePage: React.FC = () => {
  // Use our custom hook to get all the data and handlers
  const {
    // Data
    items,
    filteredItems,
    outfits,
    capsules,
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
    outfitSeasonFilter,
    setOutfitSeasonFilter,
    outfitScenarioFilter,
    setOutfitScenarioFilter,
    capsuleSeasonFilter,
    setCapsuleSeasonFilter,
    capsuleScenarioFilter,
    setCapsuleScenarioFilter,
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
    // AI generation functionality is now integrated into the forms
    isGenerateCapsuleWithAIModalOpen,
    setIsGenerateCapsuleWithAIModalOpen,
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
    handleGenerateOutfitWithAI,
    handleGenerateCapsuleWithAI
  } = useHomePageData();

  // Main component render

  return (
    <>
      <Header />
      <PageContainer>
        
        <PageHeader>
          <Title>My Wardrobe</Title>
          {activeTab === TabType.ITEMS && (
            <Button primary onClick={handleAddItem}>
              Add Item
            </Button>
          )}
          {activeTab === TabType.OUTFITS && (
            <Button primary onClick={() => setIsAddOutfitModalOpen(true)}>
              Add Outfit
            </Button>
          )}
          {activeTab === TabType.CAPSULES && (
            <Button primary onClick={() => setIsAddCapsuleModalOpen(true)}>
              Add Capsule
            </Button>
          )}
          {activeTab === TabType.WISHLIST && (
            <Button primary onClick={handleAddItem}>
              Add Item
            </Button>
          )}
        </PageHeader>
        
        <TabsContainer>
          <Tab 
            $active={activeTab === TabType.ITEMS} 
            onClick={() => setActiveTab(TabType.ITEMS)}
          >
            Items
          </Tab>
          <Tab 
            $active={activeTab === TabType.OUTFITS} 
            onClick={() => setActiveTab(TabType.OUTFITS)}
          >
            Outfits
          </Tab>
          <Tab 
            $active={activeTab === TabType.CAPSULES} 
            onClick={() => setActiveTab(TabType.CAPSULES)}
          >
            Capsules
          </Tab>
          <Tab 
            $active={activeTab === TabType.WISHLIST} 
            onClick={() => setActiveTab(TabType.WISHLIST)}
          >
            Wishlist
          </Tab>
        </TabsContainer>
        
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
            onViewItem={handleViewItem}
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItem}
          />
        )}
        
        {activeTab === TabType.OUTFITS && (
          <OutfitsTab
            outfits={outfits}
            isLoading={isLoading}
            error={error}
            seasonFilter={outfitSeasonFilter}
            setSeasonFilter={setOutfitSeasonFilter}
            scenarioFilter={outfitScenarioFilter}
            setScenarioFilter={setOutfitScenarioFilter}
            onViewOutfit={handleViewOutfit}
            onDeleteOutfit={handleDeleteOutfit}
          />
        )}
        
        {activeTab === TabType.CAPSULES && (
          <CapsulesTab
            capsules={capsules}
            isLoading={isLoading}
            error={error}
            seasonFilter={capsuleSeasonFilter}
            setSeasonFilter={setCapsuleSeasonFilter}
            scenarioFilter={capsuleScenarioFilter}
            setScenarioFilter={setCapsuleScenarioFilter}
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
          // AI generation functionality is now integrated into the forms
          isGenerateCapsuleWithAIModalOpen={isGenerateCapsuleWithAIModalOpen}
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
          // AI generation functionality is now integrated into the forms
          setIsGenerateCapsuleWithAIModalOpen={setIsGenerateCapsuleWithAIModalOpen}
          setIsAddCapsuleModalOpen={setIsAddCapsuleModalOpen}
          setIsViewItemModalOpen={setIsViewItemModalOpen}
          
          // Action handlers
          handleSubmitAdd={handleSubmitAdd}
          handleSubmitEdit={handleSubmitEdit}
          handleAddOutfit={handleAddOutfit}
          handleEditOutfitSubmit={handleEditOutfitSubmit}
          handleAddCapsule={handleAddCapsule}
          handleEditCapsuleSubmit={handleEditCapsuleSubmit}
          handleGenerateOutfitWithAI={handleGenerateOutfitWithAI}
          handleGenerateCapsuleWithAI={handleGenerateCapsuleWithAI}
          confirmDeleteItem={confirmDeleteItem}
          
          // Item handlers
          handleEditItem={handleEditItem}
          
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
