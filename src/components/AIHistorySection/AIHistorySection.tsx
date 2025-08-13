import React from 'react';
import { AIHistoryItem as AIHistoryItemType } from '../../types';
import AIHistoryItem from '../AIHistoryItem/AIHistoryItem';
import {
  HistorySection,
  HistoryHeader,
  HistoryTitle,
  ViewAllButton,
  HistoryList,
} from '../../pages/AIAssistantPage.styles';

interface AIHistorySectionProps {
  historyItems: AIHistoryItemType[];
  onViewAllHistory: () => void;
  onHistoryItemClick?: (item: AIHistoryItemType) => void;
}

const AIHistorySection: React.FC<AIHistorySectionProps> = ({
  historyItems,
  onViewAllHistory,
  onHistoryItemClick,
}) => {
  // Limit history items to first 3 for preview
  const limitedHistoryItems = historyItems.slice(0, 3);

  return (
    <HistorySection>
      <HistoryHeader>
        <HistoryTitle>Recent Activity</HistoryTitle>
        <ViewAllButton onClick={onViewAllHistory}>View All →</ViewAllButton>
      </HistoryHeader>
      
      <HistoryList>
        {limitedHistoryItems.map((item) => (
          <AIHistoryItem 
            key={item.id} 
            item={item} 
            onClick={onHistoryItemClick}
          />
        ))}
      </HistoryList>
    </HistorySection>
  );
};

export default AIHistorySection;
