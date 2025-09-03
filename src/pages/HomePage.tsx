import React from 'react';
import Header from '../components/layout/Header/Header';
import { ItemsTab, OutfitsTab, CapsulesTab } from '../components/features/wardrobe/tabs';
import WishlistTab from '../components/features/wardrobe/tabs/WishlistTab';
import HomePageModals from '../components/features/wardrobe/modals/HomePageModals';
import { useHomePageData, TabType } from '../hooks/home';
import { MdCheckroom, MdOutlineStyle, MdOutlineWorkspaces, MdFavoriteBorder, MdAdd } from 'react-icons/md';

import { PageHeader as CommonPageHeader } from '../components/common/Typography/PageHeader';
import { theme } from '../styles/theme';
import {
  PageHeader,
  TabsContainer,
  Tab,
} from './HomePage.styles';
import Button from '../components/common/Button';
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
          <div style={{ marginBottom: '0' }}>
            <CommonPageHeader 
              title="My Wardrobe"
              description="Organize and optimize your wardrobe collection"
              titleSize="lg"
            />
          </div>
          {activeTab === TabType.ITEMS && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button 
                size="lg" 
                onClick={handleAddItem} 
                style={{ 
                  height: '40px',
                }}
              >
                <MdAdd />
                Add Item
              </Button>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: '4px',
                height: '100%',
                justifyContent: 'flex-start'
              }}>
                <Button 
                  size="lg" 
                  variant="secondary" 
                  outlined
                  onClick={() => {}}
                >
                  Mark Wardrobe Complete
                </Button>
                <span style={{ 
                  fontSize: '0.75rem',
                  color: theme.colors.gray[500],
                  textAlign: 'center',
                  maxWidth: '200px',
                  lineHeight: '1.2'
                }}>
                  Mark your wardrobe as complete to start tracking new purchases
                </span>
              </div>
            </div>
          )}
          {activeTab === TabType.OUTFITS && (
            <Button size="lg" onClick={() => setIsAddOutfitModalOpen(true)}>
              <MdAdd />
              Add Outfit
            </Button>
          )}
          {activeTab === TabType.CAPSULES && (
            <Button size="lg" onClick={() => setIsAddCapsuleModalOpen(true)}>
              <MdAdd />
              Add Capsule
            </Button>
          )}
          {activeTab === TabType.WISHLIST && (
            <Button size="lg" onClick={handleAddItem}>
              <MdAdd />
              Add Item
            </Button>
          )}
        </PageHeader>
        
        <TabsContainer>
          <Tab 
            $active={activeTab === TabType.ITEMS} 
            onClick={() => setActiveTab(TabType.ITEMS)}
            style={{
              display: 'inline-flex !important',
              alignItems: 'center !important',
              gap: '8px !important',
              padding: '12px 24px !important',
              borderRadius: '25px !important',
              border: 'none !important',
              background: activeTab === TabType.ITEMS ? '#8B5CF6 !important' : 'transparent !important',
              color: activeTab === TabType.ITEMS ? '#FFFFFF !important' : '#6B7280 !important',
              fontWeight: '500 !important',
              fontSize: '14px !important',
              cursor: 'pointer !important',
              transition: 'all 0.2s ease !important'
            }}
          >
            <MdCheckroom style={{ marginRight: '8px', fontSize: '16px' }} />
            Wardrobe Items
          </Tab>
          <Tab 
            $active={activeTab === TabType.OUTFITS} 
            onClick={() => setActiveTab(TabType.OUTFITS)}
            style={{
              display: 'inline-flex !important',
              alignItems: 'center !important',
              gap: '8px !important',
              padding: '12px 24px !important',
              borderRadius: '25px !important',
              border: 'none !important',
              background: activeTab === TabType.OUTFITS ? '#8B5CF6 !important' : 'transparent !important',
              color: activeTab === TabType.OUTFITS ? '#FFFFFF !important' : '#6B7280 !important',
              fontWeight: '500 !important',
              fontSize: '14px !important',
              cursor: 'pointer !important',
              transition: 'all 0.2s ease !important'
            }}
          >
            <MdOutlineStyle style={{ marginRight: '8px', fontSize: '16px' }} />
            Outfits
          </Tab>
          <Tab 
            $active={activeTab === TabType.CAPSULES} 
            onClick={() => setActiveTab(TabType.CAPSULES)}
            style={{
              display: 'inline-flex !important',
              alignItems: 'center !important',
              gap: '8px !important',
              padding: '12px 24px !important',
              borderRadius: '25px !important',
              border: 'none !important',
              background: activeTab === TabType.CAPSULES ? '#8B5CF6 !important' : 'transparent !important',
              color: activeTab === TabType.CAPSULES ? '#FFFFFF !important' : '#6B7280 !important',
              fontWeight: '500 !important',
              fontSize: '14px !important',
              cursor: 'pointer !important',
              transition: 'all 0.2s ease !important'
            }}
          >
            <MdOutlineWorkspaces style={{ marginRight: '8px', fontSize: '16px' }} />
            Capsules
          </Tab>
          <Tab 
            $active={activeTab === TabType.WISHLIST} 
            onClick={() => setActiveTab(TabType.WISHLIST)}
            style={{
              display: 'inline-flex !important',
              alignItems: 'center !important',
              gap: '8px !important',
              padding: '12px 24px !important',
              borderRadius: '25px !important',
              border: 'none !important',
              background: activeTab === TabType.WISHLIST ? '#8B5CF6 !important' : 'transparent !important',
              color: activeTab === TabType.WISHLIST ? '#FFFFFF !important' : '#6B7280 !important',
              fontWeight: '500 !important',
              fontSize: '14px !important',
              cursor: 'pointer !important',
              transition: 'all 0.2s ease !important'
            }}
          >
            <MdFavoriteBorder style={{ marginRight: '8px', fontSize: '16px' }} />
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
