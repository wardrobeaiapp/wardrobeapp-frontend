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
    handleHistoryItemClick,
    handleCloseHistoryDetailModal,
    handleMoveToWishlist,
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
          onHistoryItemClick={handleHistoryItemClick}
        />
      </PageContainer>

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

export default AIHistoryPage;
