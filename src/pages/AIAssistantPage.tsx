import React, { ChangeEvent, useState } from 'react';
import { useWardrobe } from '../context/WardrobeContext';
import { supabase } from '../services/core';
import { mockDataHelpers } from '../types/aiAnalysisMocks';
import Header from '../components/layout/Header/Header';
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
import AIHistoryDashboard from '../components/features/ai-assistant/AIHistoryDashboard/AIHistoryDashboard';
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
      // Get authenticated user from Supabase
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      console.log('💾 Saving analysis as mock for item:', selectedWishlistItem.id, 'user:', user.id);
      
      // Extract optimized fields using helper function
      const optimizedFields = mockDataHelpers.extractOptimizedFields(mockData);
      
      // Save with optimized structure to Supabase
      const { data, error } = await supabase
        .from('ai_analysis_mocks')
        .upsert({
          wardrobe_item_id: selectedWishlistItem.id,
          ...optimizedFields,
          // Metadata
          created_from_real_analysis: true,
          created_by: user.id,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'wardrobe_item_id'
        });

      if (error) {
        console.error('Supabase error saving mock:', error);
        throw new Error(error.message || 'Failed to save mock data');
      }

      console.log('✅ Mock data saved successfully via Supabase:', data);
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

  // AI History hook - simplified for recent activity only
  const {
    // State
    historyItems,
    selectedHistoryItem,
    isHistoryDetailModalOpen,

    // Handlers
    handleHistoryItemClick,
    handleCloseHistoryDetailModal,
    handleMoveToWishlist,
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
          onHistoryItemClick={(item: AIHistoryItem) => handleHistoryItemClick(item.id)}
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

      {/* History Detail Modal - Use rich AICheckResultModal for visual format */}
      {isHistoryDetailModalOpen && selectedHistoryItem && selectedHistoryItem.richData && (
        <AICheckResultModal
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
          recommendationText={selectedHistoryItem.richData.recommendationText || selectedHistoryItem.description}
          status={selectedHistoryItem.status as any}
          hideActions={false}
          onAddToWishlist={() => handleMoveToWishlist(selectedHistoryItem.id)}
          onSkip={() => handleDismissHistoryItem(selectedHistoryItem.id)}
        />
      )}
    </>
  );
};

export default AIAssistantPage;
