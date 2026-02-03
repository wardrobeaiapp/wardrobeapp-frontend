import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header/Header';
import { useAIHistory, type ActivityType, type CheckStatus } from '../hooks/ai';
import AIHistoryDashboard from '../components/features/ai-assistant/AIHistoryDashboard/AIHistoryDashboard';
import AICheckResultModal from '../components/features/ai-assistant/modals/AICheckResultModal/AICheckResultModal';
import { PageContainer } from '../components/layout/PageContainer';

const AIHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  
  // AI History hook
  const {
    // State
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
    handleOpenHistoryDetailModal,
    handleCloseHistoryDetailModal,
    handleMoveToWishlist,
    handleMarkAsPurchased,
    handleRemoveFromWishlist,
    handleDismissHistoryItem,
  } = useAIHistory();

  const handleBackToMain = () => {
    navigate('/ai-assistant');
  };

  return (
    <>
      <Header />
      <PageContainer>
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
          onHistoryItemClick={handleOpenHistoryDetailModal}
        />
      </PageContainer>

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
            const derivedAction = selectedHistoryItem.status ? getRecommendationActionFromStatus(selectedHistoryItem.status) : 'RECOMMEND';
            return derivedAction;
          })()}
          recommendationText={selectedHistoryItem.richData.recommendationText || selectedHistoryItem.description || selectedHistoryItem.summary}
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

export default AIHistoryPage;
