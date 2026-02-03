import React from 'react';
import WishlistSelectionModal from '../modals/WishlistSelectionModal/WishlistSelectionModal';
import AICheckResultModal from '../modals/AICheckResultModal/AICheckResultModal';
import AICheckModal from '../modals/AICheckModal/AICheckModal';
import RecommendationModal from '../modals/RecommendationModal/RecommendationModal';
import type { WardrobeItem, WishlistStatus } from '../../../../types';
import type { AIHistoryItem } from '../../../../types/ai';

interface AIAssistantModalsProps {
  // Modal states
  isAICheckModalOpen: boolean;
  isWishlistModalOpen: boolean;
  isCheckResultModalOpen: boolean;
  isRecommendationModalOpen: boolean;
  isHistoryDetailModalOpen: boolean;

  // Modal handlers
  setIsAICheckModalOpen: (open: boolean) => void;
  handleCloseWishlistModal: () => void;
  handleSelectWishlistItem: (item: WardrobeItem) => void;
  handleCloseCheckResultModal: () => void;
  handleCloseRecommendationModal: () => void;
  handleSaveRecommendation: () => void;
  handleSkipRecommendation: () => void;
  handleCloseHistoryDetailModal: () => void;

  // AI Check handlers
  handleApplyAICheck: (data: { category: string; subcategory: string; seasons: string[] }) => Promise<void>;
  handleSaveMock: (mockData: any) => Promise<void>;
  fetchTags: (imageUrl: string) => Promise<any>;

  // History handlers
  handleMoveToWishlist: (id: string) => Promise<void>;
  handleMarkAsPurchased: (id: string) => Promise<void>;
  handleRemoveFromWishlist: (id: string) => Promise<boolean>;
  handleDismissHistoryItem: (id: string) => Promise<void>;
  handleApproveForPurchase: () => Promise<void>;
  handleResetCheck: () => void;
  handleOpenWishlistModal: () => void;

  // Data props
  items: WardrobeItem[];
  selectedWishlistItem: WardrobeItem | null;
  selectedHistoryItem: AIHistoryItem | null;
  historyRecordId: string | null;

  // AI Check data
  itemCheckResponse: string | null;
  suitableScenarios: string[];
  compatibleItems: { [category: string]: any[] };
  outfitCombinations: any[];
  seasonScenarioCombinations: any[];
  coverageGapsWithNoOutfits: any[];
  itemSubcategory: string;
  itemCheckScore: number | undefined;
  itemCheckStatus: WishlistStatus | undefined;
  imageLink: string;
  extractedTags: any;
  recommendationAction: string;
  recommendationText: string;
  errorType: string;
  errorDetails: string;
}

const AIAssistantModals: React.FC<AIAssistantModalsProps> = ({
  // Modal states
  isAICheckModalOpen,
  isWishlistModalOpen,
  isCheckResultModalOpen,
  isRecommendationModalOpen,
  isHistoryDetailModalOpen,

  // Modal handlers
  setIsAICheckModalOpen,
  handleCloseWishlistModal,
  handleSelectWishlistItem,
  handleCloseCheckResultModal,
  handleCloseRecommendationModal,
  handleSaveRecommendation,
  handleSkipRecommendation,
  handleCloseHistoryDetailModal,

  // AI Check handlers
  handleApplyAICheck,
  handleSaveMock,
  fetchTags,

  // History handlers
  handleMoveToWishlist,
  handleMarkAsPurchased,
  handleRemoveFromWishlist,
  handleDismissHistoryItem,
  handleApproveForPurchase,
  handleResetCheck,
  handleOpenWishlistModal,

  // Data props
  items,
  selectedWishlistItem,
  selectedHistoryItem,
  historyRecordId,

  // AI Check data
  itemCheckResponse,
  suitableScenarios,
  compatibleItems,
  outfitCombinations,
  seasonScenarioCombinations,
  coverageGapsWithNoOutfits,
  itemSubcategory,
  itemCheckScore,
  itemCheckStatus,
  imageLink,
  extractedTags,
  recommendationAction,
  recommendationText,
  errorType,
  errorDetails,
}) => {
  return (
    <>
      {/* AI Check Settings Modal */}
      <AICheckModal
        isOpen={isAICheckModalOpen}
        onClose={() => setIsAICheckModalOpen(false)}
        onApply={handleApplyAICheck}
        imageUrl={imageLink}
        onFetchTags={fetchTags}
      />

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
      {isHistoryDetailModalOpen && selectedHistoryItem && (selectedHistoryItem as any).richData && (
        <AICheckResultModal
          key={`${selectedHistoryItem.id}-${(selectedHistoryItem as any).userActionStatus}`}
          isOpen={true}
          onClose={handleCloseHistoryDetailModal}
          analysisResult={(selectedHistoryItem as any).richData.analysis || (selectedHistoryItem as any).richData.rawAnalysis || ''}
          suitableScenarios={(selectedHistoryItem as any).richData.suitableScenarios || []}
          compatibleItems={(selectedHistoryItem as any).richData.compatibleItems || {}}
          outfitCombinations={(selectedHistoryItem as any).richData.outfitCombinations || []}
          seasonScenarioCombinations={(selectedHistoryItem as any).richData.seasonScenarioCombinations || []}
          coverageGapsWithNoOutfits={(selectedHistoryItem as any).richData.coverageGapsWithNoOutfits || []}
          score={(selectedHistoryItem as any).score}
          imageUrl={(selectedHistoryItem as any).richData.itemDetails?.imageUrl || (selectedHistoryItem as any).image}
          recommendationAction={(() => {
            const getRecommendationActionFromStatus = (status: string) => {
              switch (status?.toLowerCase()) {
                case 'approved':
                  return 'RECOMMEND';
                case 'potential_issue':
                  return 'MAYBE';
                case 'not_recommended':
                  return 'SKIP';
                case 'not_reviewed':
                  return 'RECOMMEND';
                default:
                  return 'RECOMMEND';
              }
            };
            const derivedAction = (selectedHistoryItem as any).status ? getRecommendationActionFromStatus((selectedHistoryItem as any).status) : 'RECOMMEND';
            return derivedAction;
          })()}
          recommendationText={(selectedHistoryItem as any).richData.recommendationText || (selectedHistoryItem as any).description || (selectedHistoryItem as any).summary}
          status={(selectedHistoryItem as any).status}
          userActionStatus={(selectedHistoryItem as any).userActionStatus}
          hideActions={false}
          isHistoryItem={true}
          selectedWishlistItem={(selectedHistoryItem as any).richData.itemDetails?.id ? (selectedHistoryItem as any).richData.itemDetails as any : null}
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

export default AIAssistantModals;
