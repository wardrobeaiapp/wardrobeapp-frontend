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

  // Custom hooks for different features
  const {
    // State
    imageLink,
    isFileUpload,
    uploadedFile,
    isLoading: isCheckLoading,
    error: checkError,
    itemCheckResponse,
    itemCheckScore,
    itemCheckStatus,
    extractedTags,
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

  const handleCheckItem = () => {
    if (imageLink || uploadedFile) {
      setIsAICheckModalOpen(true);
    } else {
      handleCheckItemRaw();
    }
  };

  const handleApplyAICheck = (data: { category: string; subcategory: string; seasons: string[] }) => {
    setIsAICheckModalOpen(false);
    // TODO: Pass the selected options to the AI check when the API is ready
    handleCheckItemRaw();
  };

  // Wrap file upload handler to handle ChangeEvent
  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      handleFileUploadRaw(event.target.files[0]);
    }
  };

  const {
    // State
    selectedSeason,
    selectedScenario,
    scenarioOptions,
    isLoading: isRecommendationLoading,
    error: recommendationError,
    recommendationText,

    // Handlers
    setSelectedSeason,
    setSelectedScenario,
    getRecommendation: handleGetRecommendation,
    // resetRecommendation is currently unused but may be needed in the future
  } = useAIRecommendation();

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

  const {
    // Modal states
    isWishlistModalOpen,
    isCheckResultModalOpen,
    isRecommendationModalOpen,

    // Handlers
    handleOpenWishlistModal,
    handleCloseWishlistModal,
    handleSelectWishlistItem,
    handleCloseCheckResultModal,
    handleCloseRecommendationModal,
    handleSaveRecommendation,
    handleSkipRecommendation,
  } = useAIModals();

  // History view state is now managed by useAIHistory hook

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
                onImageLinkChange={setImageLink}
                onFileUpload={handleFileUpload}
                onCheckItem={handleCheckItem}
                onOpenWishlistModal={handleOpenWishlistModal}
                isLoading={isCheckLoading}
                error={checkError}
                itemCheckResponse={itemCheckResponse}
                isFileUpload={isFileUpload}
                uploadedFile={uploadedFile}
                onProcessedImageChange={handleProcessedImageChange}
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

      {/* Wishlist Selection Modal */}
      <WishlistSelectionModal
        isOpen={isWishlistModalOpen}
        onClose={handleCloseWishlistModal}
        items={items}
        onSelectItem={handleSelectWishlistItem}
      />

      {/* AI Check Result Modal - Only render when needed */}
      {(isCheckResultModalOpen || itemCheckResponse) && (
        <AICheckResultModal
          isOpen={isCheckResultModalOpen}
          onClose={handleCloseCheckResultModal}
          analysisResult={itemCheckResponse || ''}
          score={itemCheckScore}
          status={itemCheckStatus}
          imageUrl={imageLink}
          extractedTags={extractedTags}
          onAddToWishlist={handleOpenWishlistModal}
          error={errorType}
          errorDetails={errorDetails}
          onSkip={handleResetCheck}
          onDecideLater={handleCloseCheckResultModal}
        />
      )}

      {/* Recommendation Modal */}
      <RecommendationModal
        isOpen={isRecommendationModalOpen}
        onClose={handleCloseRecommendationModal}
        recommendation={recommendationText}
        onSave={handleSaveRecommendation}
        onSkip={handleSkipRecommendation}
      />

      {/* History Detail Modal */}
      {selectedHistoryItem && (
        <HistoryDetailModal
          isOpen={isHistoryDetailModalOpen}
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
