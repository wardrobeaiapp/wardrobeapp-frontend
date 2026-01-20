import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AIHistoryItem as AIHistoryItemType } from '../../../../types/ai';
import AIHistoryItem from '../AIHistoryItem/AIHistoryItem';
import Button from '../../../common/Button';
import { MdArrowForward } from 'react-icons/md';
import {
  HistorySection,
  HistoryHeader,
  HistoryTitle,
  HistoryList,
} from '../../../../pages/AIAssistantPage.styles';

interface AIHistorySectionProps {
  historyItems: AIHistoryItemType[];
  onHistoryItemClick?: (item: AIHistoryItemType) => void;
}

const AIHistorySection: React.FC<AIHistorySectionProps> = ({
  historyItems,
  onHistoryItemClick,
}) => {
  const navigate = useNavigate();
  
  // Limit history items to first 3 for preview
  const limitedHistoryItems = historyItems.slice(0, 3);

  const handleViewAllHistory = () => {
    navigate('/ai-history');
  };

  return (
    <HistorySection>
      <HistoryHeader>
        <HistoryTitle>Recent Activity</HistoryTitle>
        <Button 
          variant="link" 
          onClick={handleViewAllHistory}
          style={{ textDecoration: 'none' }}
        >
          View All <MdArrowForward />
        </Button>
      </HistoryHeader>
      
      <HistoryList>
        {limitedHistoryItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
            No recent activity. Start by checking some wishlist items!
          </div>
        ) : (
          limitedHistoryItems.map((item) => (
            <AIHistoryItem 
              key={item.id} 
              item={item} 
              onClick={onHistoryItemClick}
            />
          ))
        )}
      </HistoryList>
    </HistorySection>
  );
};

export default AIHistorySection;
