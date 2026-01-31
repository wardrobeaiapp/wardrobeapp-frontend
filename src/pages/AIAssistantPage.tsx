import React from 'react';
import { useWardrobe } from '../context/WardrobeContext';
import Header from '../components/layout/Header/Header';
import {
  useAICheck,
  useAICheckHandlers,
  useAIRecommendation,
  useAIHistory,
  useAIHistoryActions,
  useAIAssistantModals
} from '../hooks/ai';
import type { AIHistoryItem } from '../types/ai';
import AIHistorySection from '../components/features/ai-assistant/AIHistorySection/AIHistorySection';
import AIAssistantModals from '../components/features/ai-assistant/AIAssistantModals';
import AIAssistantCards from '../components/features/ai-assistant/AIAssistantCards';
import { PageContainer } from '../components/layout/PageContainer';

/**
 * AI Assistant Page - Main orchestrator for AI-powered wardrobe analysis
 * 
 * This component has been refactored to follow clean architecture principles:
 * - Business logic extracted to custom hooks
 * - UI components extracted to focused, reusable components  
 * - Services handle external data operations
 * - Main component focuses on orchestration and data flow
 */
const AIAssistantPage: React.FC = () => {
  const { items } = useWardrobe();

  // ===== HOOK DECLARATIONS =====
  
  // 1. Core AI Check functionality
  const {
    imageLink, isFileUpload, uploadedFile, isLoading: isCheckLoading,
    itemCheckResponse, itemCheckScore, itemCheckStatus, extractedTags,
    recommendationAction, recommendationText, suitableScenarios,
    compatibleItems, outfitCombinations, seasonScenarioCombinations,
    coverageGapsWithNoOutfits, itemSubcategory, historyRecordId,
    errorType, errorDetails, setImageLink, handleFileUpload: handleFileUploadRaw,
    handleProcessedImageChange, checkItem: handleCheckItemRaw,
    resetCheck: handleResetCheck, fetchTags,
  } = useAICheck();

  // 2. Modal state management
  const {
    isAICheckModalOpen, isWishlistModalOpen, isCheckResultModalOpen,
    isRecommendationModalOpen, selectedWishlistItem, setIsAICheckModalOpen,
    handleOpenWishlistModal, handleCloseWishlistModal, handleSelectWishlistItem,
    clearSelectedWishlistItem, handleOpenCheckResultModal, handleCloseCheckResultModal,
    handleCloseRecommendationModal, handleSaveRecommendation, handleSkipRecommendation,
  } = useAIAssistantModals({
    onImageLinkChange: setImageLink,
    onWishlistItemSelect: () => { /* Additional logic can be added here if needed */ }
  });

  // 3. AI Check business logic handlers
  const { handleCheckItem, handleApplyAICheck, handleFileUpload, handleSaveMock } = useAICheckHandlers({
    imageLink, uploadedFile, handleCheckItemRaw, handleFileUploadRaw,
    selectedWishlistItem, setIsAICheckModalOpen, clearSelectedWishlistItem, handleOpenCheckResultModal
  });

  // 4. AI Recommendation functionality
  const {
    selectedSeason, selectedScenario, scenarioOptions,
    isLoading: isRecommendationLoading, error: recommendationError,
    setSelectedSeason, setSelectedScenario, getRecommendation: handleGetRecommendation,
  } = useAIRecommendation();

  // 5. AI History management
  const {
    historyItems, selectedHistoryItem, isHistoryDetailModalOpen,
    handleOpenHistoryDetailModal, handleCloseHistoryDetailModal,
    handleMoveToWishlist, handleMarkAsPurchased, handleRemoveFromWishlist, handleDismissHistoryItem,
  } = useAIHistory();

  // 6. History-specific actions
  const { handleApproveForPurchase } = useAIHistoryActions({
    historyRecordId, selectedWishlistItem
  });

  return (
    <>
      <Header />
      <PageContainer>
        {/* Main View - Show AI cards and limited history */}
        <AIAssistantCards
          // AI Check props
          imageLink={imageLink}
          onImageLinkChange={(value: string) => {
            setImageLink(value);
            // Clear selected wishlist item when user manually enters a URL
            clearSelectedWishlistItem();
          }}
          onFileUpload={handleFileUpload}
          onCheckItem={handleCheckItem}
          onOpenWishlistModal={handleOpenWishlistModal}
          isCheckLoading={isCheckLoading}
          errorType={errorType}
          itemCheckResponse={itemCheckResponse}
          isFileUpload={isFileUpload}
          uploadedFile={uploadedFile}
          onProcessedImageChange={handleProcessedImageChange}
          selectedWishlistItem={selectedWishlistItem}

          // AI Recommendation props
          selectedSeason={selectedSeason}
          onSeasonChange={setSelectedSeason}
          selectedScenario={selectedScenario}
          onScenarioChange={setSelectedScenario}
          scenarioOptions={scenarioOptions}
          isRecommendationLoading={isRecommendationLoading}
          onGetRecommendation={handleGetRecommendation}
          recommendationError={recommendationError}
        />

        {/* History Section - Limited Items */}
        <AIHistorySection
          historyItems={historyItems}
          onHistoryItemClick={(item: AIHistoryItem) => handleOpenHistoryDetailModal(item.id)}
        />
      </PageContainer>

      {/* All Modals - Extracted to separate component */}
      <AIAssistantModals
        // Modal states
        isAICheckModalOpen={isAICheckModalOpen}
        isWishlistModalOpen={isWishlistModalOpen}
        isCheckResultModalOpen={isCheckResultModalOpen}
        isRecommendationModalOpen={isRecommendationModalOpen}
        isHistoryDetailModalOpen={isHistoryDetailModalOpen}

        // Modal handlers
        setIsAICheckModalOpen={setIsAICheckModalOpen}
        handleCloseWishlistModal={handleCloseWishlistModal}
        handleSelectWishlistItem={handleSelectWishlistItem}
        handleCloseCheckResultModal={handleCloseCheckResultModal}
        handleCloseRecommendationModal={handleCloseRecommendationModal}
        handleSaveRecommendation={handleSaveRecommendation}
        handleSkipRecommendation={handleSkipRecommendation}
        handleCloseHistoryDetailModal={handleCloseHistoryDetailModal}

        // AI Check handlers
        handleApplyAICheck={handleApplyAICheck}
        handleSaveMock={handleSaveMock}
        fetchTags={fetchTags}

        // History handlers
        handleMoveToWishlist={handleMoveToWishlist}
        handleMarkAsPurchased={handleMarkAsPurchased}
        handleRemoveFromWishlist={handleRemoveFromWishlist}
        handleDismissHistoryItem={handleDismissHistoryItem}
        handleApproveForPurchase={handleApproveForPurchase}
        handleResetCheck={handleResetCheck}
        handleOpenWishlistModal={handleOpenWishlistModal}

        // Data props
        items={items}
        selectedWishlistItem={selectedWishlistItem}
        selectedHistoryItem={selectedHistoryItem}
        historyRecordId={historyRecordId}

        // AI Check data
        itemCheckResponse={itemCheckResponse}
        suitableScenarios={suitableScenarios}
        compatibleItems={compatibleItems}
        outfitCombinations={outfitCombinations}
        seasonScenarioCombinations={seasonScenarioCombinations}
        coverageGapsWithNoOutfits={coverageGapsWithNoOutfits}
        itemSubcategory={itemSubcategory}
        itemCheckScore={itemCheckScore}
        itemCheckStatus={itemCheckStatus}
        imageLink={imageLink}
        extractedTags={extractedTags}
        recommendationAction={recommendationAction}
        recommendationText={recommendationText}
        errorType={errorType}
        errorDetails={errorDetails}
      />
    </>
  );
};

export default AIAssistantPage;
