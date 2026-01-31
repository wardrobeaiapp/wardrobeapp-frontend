import React from 'react';
import { useWardrobe } from '../context/WardrobeContext';
import { aiCheckHistoryService } from '../services/ai/aiCheckHistoryService';
import Header from '../components/layout/Header/Header';
import {
  useAICheck,
  useAICheckHandlers,
  useAIRecommendation,
  useAIHistory,
  useAIAssistantModals
} from '../hooks/ai';
import type { AIHistoryItem } from '../types/ai';
import AICheckCard from '../components/features/ai-assistant/AICheckCard/AICheckCard';
import AIRecommendationCard from '../components/features/ai-assistant/AIRecommendationCard/AIRecommendationCard';
import AIHistorySection from '../components/features/ai-assistant/AIHistorySection/AIHistorySection';
import WishlistSelectionModal from '../components/features/ai-assistant/modals/WishlistSelectionModal/WishlistSelectionModal';
import AICheckResultModal from '../components/features/ai-assistant/modals/AICheckResultModal/AICheckResultModal';
import AICheckModal from '../components/features/ai-assistant/modals/AICheckModal/AICheckModal';
import RecommendationModal from '../components/features/ai-assistant/modals/RecommendationModal/RecommendationModal';
import { PageContainer } from '../components/layout/PageContainer';
import { CardsContainer } from './AIAssistantPage.styles';

const AIAssistantPage: React.FC = () => {
  const { items } = useWardrobe();

  // AI Check hook - needs to be declared first to get setImageLink
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
    historyRecordId,
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

  // Modal management hook
  const {
    // Modal states
    isAICheckModalOpen,
    isWishlistModalOpen,
    isCheckResultModalOpen,
    isRecommendationModalOpen,
    selectedWishlistItem,

    // Handlers
    setIsAICheckModalOpen,
    handleOpenWishlistModal,
    handleCloseWishlistModal,
    handleSelectWishlistItem,
    clearSelectedWishlistItem,
    handleOpenCheckResultModal,
    handleCloseCheckResultModal,
    handleCloseRecommendationModal,
    handleSaveRecommendation,
    handleSkipRecommendation,
  } = useAIAssistantModals({
    onImageLinkChange: setImageLink,
    onWishlistItemSelect: (item) => {
      // Additional logic can be added here if needed
    }
  });

  // AI Check handlers hook
  const {
    handleCheckItem,
    handleApplyAICheck,
    handleFileUpload,
    handleSaveMock
  } = useAICheckHandlers({
    imageLink,
    uploadedFile,
    handleCheckItemRaw,
    handleFileUploadRaw,
    selectedWishlistItem,
    setIsAICheckModalOpen,
    clearSelectedWishlistItem,
    handleOpenCheckResultModal
  });

  // Handler for "Want to buy" button in AI Check Complete popup
  const handleApproveForPurchase = async () => {
    if (historyRecordId) {
      try {
        const result = await aiCheckHistoryService.updateRecordStatus(historyRecordId, 'saved');
        if (result.success) {
          console.log('History record status updated to saved');
          
          // Get the updated record and dispatch it to trigger the history update listener
          const recordResult = await aiCheckHistoryService.getHistoryRecord(historyRecordId);
          if (recordResult.success && recordResult.record) {
            // Dispatch the updated item using the existing ai-history:created event
            // This will trigger the listener in useAIHistory hook to update the local state
            if (typeof window !== 'undefined') {
              window.dispatchEvent(
                new CustomEvent('ai-history:created', { 
                  detail: { historyRecordId } 
                })
              );
            }
          }
          
          // Trigger wardrobe:changed event to refresh UI
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('wardrobe:changed', { 
                detail: { type: 'updated', id: selectedWishlistItem?.id } 
              })
            );
          }
        } else {
          console.error('Failed to update history record status:', result.error);
        }
      } catch (error) {
        console.error('Error updating history record status:', error);
      }
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

  // AI History hook - simplified for recent activity only
  const {
    // State
    historyItems,
    selectedHistoryItem,
    isHistoryDetailModalOpen,

    // Handlers
    handleOpenHistoryDetailModal,
    handleCloseHistoryDetailModal,
    handleMoveToWishlist,
    handleMarkAsPurchased,
    handleRemoveFromWishlist,
    handleDismissHistoryItem,
  } = useAIHistory();

  return (
    <>
      <Header />
      <PageContainer>
        {/* Main View - Show AI cards and limited history */}
        <CardsContainer>
              <AICheckCard
                imageLink={imageLink}
                onImageLinkChange={(value) => {
                  setImageLink(value);
                  // Clear selected wishlist item when user manually enters a URL
                  clearSelectedWishlistItem();
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
          onHistoryItemClick={(item: AIHistoryItem) => handleOpenHistoryDetailModal(item.id)}
        />
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
          onApproveForPurchase={handleApproveForPurchase}
          error={errorType}
          errorDetails={errorDetails}
          onSkip={handleResetCheck}
          onDecideLater={handleCloseCheckResultModal}
          onRemoveFromWishlist={
            selectedWishlistItem && historyRecordId
              ? async () => {
                  const ok = await handleRemoveFromWishlist(historyRecordId);
                  if (ok) handleCloseCheckResultModal();
                }
              : undefined
          }
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

      {/* History Detail Modal - Use rich AICheckResultModal for visual format */}
      {isHistoryDetailModalOpen && selectedHistoryItem && selectedHistoryItem.richData && (
        <AICheckResultModal
          key={`${selectedHistoryItem.id}-${selectedHistoryItem.userActionStatus}`}
          isOpen={true}
          onClose={handleCloseHistoryDetailModal}
          analysisResult={selectedHistoryItem.richData.analysis || selectedHistoryItem.richData.rawAnalysis || ''}
          suitableScenarios={selectedHistoryItem.richData.suitableScenarios || []}
          compatibleItems={selectedHistoryItem.richData.compatibleItems || {}}
          outfitCombinations={selectedHistoryItem.richData.outfitCombinations || []}
          seasonScenarioCombinations={selectedHistoryItem.richData.seasonScenarioCombinations || []}
          coverageGapsWithNoOutfits={selectedHistoryItem.richData.coverageGapsWithNoOutfits || []}
          score={selectedHistoryItem.score}
          imageUrl={selectedHistoryItem.richData.itemDetails?.imageUrl || selectedHistoryItem.image}
          recommendationAction={selectedHistoryItem.richData.recommendationAction || 'RECOMMEND'}
          recommendationText={selectedHistoryItem.richData.recommendationText || selectedHistoryItem.description}
          status={selectedHistoryItem.status}
          userActionStatus={selectedHistoryItem.userActionStatus}
          hideActions={false}
          isHistoryItem={true}
          selectedWishlistItem={selectedHistoryItem.richData.itemDetails?.id ? selectedHistoryItem.richData.itemDetails as any : null}
          onAddToWishlist={() => handleMoveToWishlist(selectedHistoryItem.id)}
          onApproveForPurchase={() => handleMoveToWishlist(selectedHistoryItem.id)}
          onMarkAsPurchased={() => handleMarkAsPurchased(selectedHistoryItem.id)}
          onRemoveFromWishlist={() => handleRemoveFromWishlist(selectedHistoryItem.id)}
          onSkip={() => handleDismissHistoryItem(selectedHistoryItem.id)}
        />
      )}
    </>
  );
};

export default AIAssistantPage;
