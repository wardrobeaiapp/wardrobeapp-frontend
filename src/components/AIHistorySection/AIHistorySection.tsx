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
  date: Date;
  status?: WishlistStatus;
  score?: number;
  season?: string;
  scenario?: string;
}

interface AIHistorySectionProps {
  historyItems: HistoryItemType[];
  onViewAllHistory: () => void;
  onHistoryItemClick?: (item: HistoryItemType) => void;
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
            variant="section" 
            onClick={onHistoryItemClick}
          />
        ))}
      </HistoryList>
    </HistorySection>
  );
};

export default AIHistorySection;
