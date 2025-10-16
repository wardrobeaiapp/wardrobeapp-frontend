import React, { ChangeEvent, useState } from 'react';
import { useWardrobe } from '../context/WardrobeContext';
import {
  useAICheck,
  useAIRecommendation,
  useAIHistory,
  useAIModals,
  type ActivityType,
  type CheckStatus
} from '../hooks/ai';
import type { AIHistoryItem } from '../types/ai';
import type { WardrobeItem } from '../types';
import PageHeader from '../components/layout/Header/Header';
import AIHistoryDashboard from '../components/features/ai-assistant/AIHistoryDashboard/AIHistoryDashboard';
import AICheckCard from '../components/features/ai-assistant/AICheckCard/AICheckCard';
import AIRecommendationCard from '../components/features/ai-assistant/AIRecommendationCard/AIRecommendationCard';
import AIHistorySection from '../components/features/ai-assistant/AIHistorySection/AIHistorySection';
import WishlistSelectionModal from '../components/features/ai-assistant/modals/WishlistSelectionModal/WishlistSelectionModal';
import AICheckResultModal from '../components/features/ai-assistant/modals/AICheckResultModal/AICheckResultModal';
import AICheckModal from '../components/features/ai-assistant/modals/AICheckModal/AICheckModal';
import RecommendationModal from '../components/features/ai-assistant/modals/RecommendationModal/RecommendationModal';
import HistoryDetailModal from '../components/features/ai-assistant/modals/HistoryDetailModal/HistoryDetailModal';
import { PageContainer } from '../components/layout/PageContainer';
import { CardsContainer } from './AIAssistantPage.styles';

const AIAssistantPage: React.FC = () => {
  const { items } = useWardrobe();
  const [isAICheckModalOpen, setIsAICheckModalOpen] = useState(false);
  const [selectedWishlistItem, setSelectedWishlistItem] = useState<WardrobeItem | null>(null);

  // Modal hooks - Must be declared before they're used in other handlers
  const {
    // Modal states
    isWishlistModalOpen,
    isCheckResultModalOpen,
    isRecommendationModalOpen,

    // Handlers
    handleOpenWishlistModal,
    handleCloseWishlistModal,
    handleSelectWishlistItem,
    handleOpenCheckResultModal,
    handleCloseCheckResultModal,
    handleCloseRecommendationModal,
    handleSaveRecommendation,
    handleSkipRecommendation,
  } = useAIModals({
    onItemSelect: (imageUrl, selectedItem) => {
      // Update image link when an item is selected from wishlist
      setImageLink(imageUrl);
      // Store the selected wishlist item data
      setSelectedWishlistItem(selectedItem || null);
    }
  });

  // AI Check hook
  const {
    // State
    imageLink,
    isFileUpload,
    uploadedFile,
    isLoading: isCheckLoading,
    itemCheckResponse,
    itemCheckScore,
    itemCheckStatus,
    extractedTags,
    recommendationAction,
    recommendationText,
    suitableScenarios,
    compatibleItems,
    outfitCombinations,
    seasonScenarioCombinations,
    coverageGapsWithNoOutfits,
    itemSubcategory,
    errorType,
    errorDetails,

    // Handlers
    setImageLink,
    handleFileUpload: handleFileUploadRaw,
    handleProcessedImageChange,
    checkItem: handleCheckItemRaw,
    resetCheck: handleResetCheck,
    fetchTags,
  } = useAICheck();

  // Handlers for the AI Check feature
  const handleCheckItem = async () => {
    // If we have a selected wishlist item, skip the modal and use the item's data directly
    if (selectedWishlistItem && (imageLink || uploadedFile)) {
      console.log('Processing wishlist item with pre-filled data:', selectedWishlistItem);
      
      // Create form data from the wishlist item
      const formData = {
        category: selectedWishlistItem.category as string,
        subcategory: selectedWishlistItem.subcategory || '',
        seasons: (selectedWishlistItem.season || []).map(s => s as string)
      };
      
      console.log('Bypassing AI Check Settings modal for wishlist item. Using data:', formData);
      
      // Call the AI check directly with the wishlist item data
      const result = await handleCheckItemRaw(formData, selectedWishlistItem);
      if (result) {
        // Open the result modal if analysis was successful
        handleOpenCheckResultModal();
      }
    } else if (imageLink || uploadedFile) {
      // For regular uploads/URLs, show the settings modal
      setIsAICheckModalOpen(true);
    } else {
      // No image provided
      const result = await handleCheckItemRaw();
      if (result) {
        // Open the result modal if analysis was successful
        handleOpenCheckResultModal();
      }
    }
  };

  const handleApplyAICheck = async (data: { category: string; subcategory: string; seasons: string[] }) => {
    setIsAICheckModalOpen(false);
    // Clear selected wishlist item since we're using manual form data
    setSelectedWishlistItem(null);
    // Pass the form data to the AI check function
    const result = await handleCheckItemRaw(data);
    if (result) {
      // Open the result modal if analysis was successful
      handleOpenCheckResultModal();
    }
  };

  // Wrap file upload handler to handle ChangeEvent
  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      handleFileUploadRaw(event.target.files[0]);
      // Clear selected wishlist item when user uploads a new file
      setSelectedWishlistItem(null);
    }
  };

  // Handler for saving analysis result as mock data
  const handleSaveMock = async (mockData: any) => {
    if (!selectedWishlistItem) {
      console.error('Cannot save mock: no wardrobe item selected');
      throw new Error('No wardrobe item selected');
    }

    try {
      const response = await fetch('/api/ai-analysis-mocks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wardrobe_item_id: selectedWishlistItem.id,
          analysis_data: mockData,
          user_id: selectedWishlistItem.userId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to save mock data');
      }

      const result = await response.json();
      console.log('Mock data saved successfully:', result);
    } catch (error) {
      console.error('Error saving mock data:', error);
      throw error; // Re-throw to trigger error state in modal
    }
  };

  // AI Recommendation hook
  const {
    // State
    selectedSeason,
    selectedScenario,
    scenarioOptions,
    isLoading: isRecommendationLoading,
    error: recommendationError,

    // Handlers
    setSelectedSeason,
    setSelectedScenario,
    getRecommendation: handleGetRecommendation,
    // resetRecommendation is currently unused but may be needed in the future
  } = useAIRecommendation();

  // AI History hook
  const {
    // State
    historyItems,
    showFullHistory,
    activityFilter,
    checkStatusFilter,
    userActionFilter,
    filteredHistoryItems,
    selectedHistoryItem,
    isHistoryDetailModalOpen,

    // Handlers
    setActivityFilter,
    setCheckStatusFilter,
    setUserActionFilter,
    handleViewAllHistory,
    handleBackToMain,
    handleHistoryItemClick,
    handleCloseHistoryDetailModal,
    handleMoveToWishlist,
    handleDismissHistoryItem,
  } = useAIHistory();

  return (
    <>
      <PageHeader title="AI Assistant" />
      <PageContainer>
        {showFullHistory ? (
          <AIHistoryDashboard
            activityFilter={activityFilter}
            onFilterChange={(filter: string) => {
              // Type assertion is safe here because we control the filter values
              setActivityFilter(filter as ActivityType);
            }}
            checkStatusFilter={checkStatusFilter}
            onCheckStatusFilterChange={(filter: string) => {
              // Type assertion is safe here because we control the filter values
              setCheckStatusFilter(filter as CheckStatus);
            }}
            userActionFilter={userActionFilter}
            onUserActionFilterChange={setUserActionFilter}
            filteredHistoryItems={filteredHistoryItems}
            onBackToMain={handleBackToMain}
            onHistoryItemClick={handleHistoryItemClick}
          />
        ) : (
          <>
            {/* Main View - Show AI cards and limited history */}
            <CardsContainer>
              <AICheckCard
                imageLink={imageLink}
                onImageLinkChange={(value) => {
                  setImageLink(value);
                  // Clear selected wishlist item when user manually enters a URL
                  setSelectedWishlistItem(null);
                }}
                onFileUpload={handleFileUpload}
                onCheckItem={handleCheckItem}
                onOpenWishlistModal={handleOpenWishlistModal}
                isLoading={isCheckLoading}
                error={errorType}
                itemCheckResponse={itemCheckResponse}
                isFileUpload={isFileUpload}
                uploadedFile={uploadedFile}
                onProcessedImageChange={handleProcessedImageChange}
                isWishlistItem={!!selectedWishlistItem}
              />
              <AICheckModal
                isOpen={isAICheckModalOpen}
                onClose={() => setIsAICheckModalOpen(false)}
                onApply={handleApplyAICheck}
                imageUrl={imageLink}
                onFetchTags={fetchTags}
              />

              <AIRecommendationCard
                selectedSeason={selectedSeason}
                onSeasonChange={setSelectedSeason}
                selectedScenario={selectedScenario}
                onScenarioChange={setSelectedScenario}
                scenarioOptions={scenarioOptions}
                loadingScenarios={isRecommendationLoading}
                onGetRecommendation={handleGetRecommendation}
                isLoading={isRecommendationLoading}
                error={recommendationError}
              />
            </CardsContainer>

            {/* History Section - Limited Items */}
            <AIHistorySection
              historyItems={historyItems}
              onViewAllHistory={handleViewAllHistory}
              onHistoryItemClick={(item: AIHistoryItem) => handleHistoryItemClick(item.id)}
            />
          </>
        )}
      </PageContainer>

      {/* Wishlist Selection Modal - Only render when open */}
      {isWishlistModalOpen && (
        <WishlistSelectionModal
          isOpen={true}
          onClose={handleCloseWishlistModal}
          items={items}
          onSelectItem={handleSelectWishlistItem}
        />
      )}

      {/* AI Check Result Modal - Only render when needed */}
      {isCheckResultModalOpen && itemCheckResponse && (
        <AICheckResultModal
          isOpen={true}
          onClose={handleCloseCheckResultModal}
          analysisResult={itemCheckResponse}
          suitableScenarios={suitableScenarios}
          compatibleItems={compatibleItems}
          outfitCombinations={outfitCombinations}
          seasonScenarioCombinations={seasonScenarioCombinations}
          coverageGapsWithNoOutfits={coverageGapsWithNoOutfits}
          itemSubcategory={itemSubcategory}
          score={itemCheckScore}
          status={itemCheckStatus}
          imageUrl={imageLink}
          extractedTags={extractedTags}
          recommendationAction={recommendationAction}
          recommendationText={recommendationText}
          onAddToWishlist={handleOpenWishlistModal}
          error={errorType}
          errorDetails={errorDetails}
          onSkip={handleResetCheck}
          onDecideLater={handleCloseCheckResultModal}
          // New props for save as mock functionality
          selectedWishlistItem={selectedWishlistItem}
          showSaveMock={true}
          onSaveMock={handleSaveMock}
        />
      )}

      {/* Recommendation Modal - Only render when open */}
      {isRecommendationModalOpen && recommendationText && (
        <RecommendationModal
          isOpen={true}
          onClose={handleCloseRecommendationModal}
          recommendation={recommendationText}
          onSave={handleSaveRecommendation}
          onSkip={handleSkipRecommendation}
        />
      )}

      {/* History Detail Modal - Only render when there's a selected item and modal is open */}
      {isHistoryDetailModalOpen && selectedHistoryItem && (
        <HistoryDetailModal
          isOpen={true}
          onClose={handleCloseHistoryDetailModal}
          item={selectedHistoryItem}
          onMoveToWishlist={() => handleMoveToWishlist(selectedHistoryItem.id)}
          onDismiss={() => handleDismissHistoryItem(selectedHistoryItem.id)}
        />
      )}
    </>
  );
};

export default AIAssistantPage;
