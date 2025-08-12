import React from 'react';
import { WishlistStatus } from '../../types';
import AIHistoryItem from '../AIHistoryItem/AIHistoryItem';
import {
  HistorySection,
  HistoryHeader,
  HistoryTitle,
  ViewAllButton,
  HistoryList,
} from '../../pages/AIAssistantPage.styles';

interface HistoryItemType {
  id: string;
  type: 'check' | 'recommendation';
  title: string;
  description: string;
  time: string;
  status?: WishlistStatus;
  score?: number;
}

interface AIHistorySectionProps {
  historyItems: HistoryItemType[];
  onViewAllHistory: () => void;
}

const AIHistorySection: React.FC<AIHistorySectionProps> = ({
  historyItems,
  onViewAllHistory,
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
          <AIHistoryItem key={item.id} item={item} variant="section" />
        ))}
      </HistoryList>
    </HistorySection>
  );
};

export default AIHistorySection;
