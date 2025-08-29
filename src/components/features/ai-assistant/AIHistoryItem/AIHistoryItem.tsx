import React from 'react';
import { FaSearch, FaMagic, FaClipboardList, FaStar } from 'react-icons/fa';
import { AIHistoryItem as AIHistoryItemType } from '../../../../types/ai';
import {
  CardIcon,
  HistoryContent,
  HistoryItemTitle,
  HistoryItemDescription,
  HistoryTime,
  StatusBadge,
  DashboardHistoryItem,
  HistoryItemMeta,
  TagsContainer,
  ScenarioTag,
  SeasonTag,
  ScoreContainer,
  ScoreDisplay,
  ScoreText,
} from '../../../../pages/AIAssistantPage.styles';

interface AIHistoryItemProps {
  item: AIHistoryItemType;
  onClick?: (item: AIHistoryItemType) => void;
}

// Helper function to format date into readable date string
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};



const AIHistoryItem: React.FC<AIHistoryItemProps> = ({ 
  item, 
  onClick 
}) => {
  // Get history icon based on type
  const getHistoryIcon = (type: string) => {
    switch (type) {
      case 'check':
        return <FaSearch size={16} />;
      case 'recommendation':
        return <FaMagic size={16} />;
      default:
        return <FaClipboardList size={16} />;
    }
  };

  // Always use dashboard implementation for consistency

  const handleClick = () => {
    if (onClick) {
      onClick(item);
    }
  };

  return (
    <DashboardHistoryItem 
      onClick={handleClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <CardIcon className={item.type}>{getHistoryIcon(item.type)}</CardIcon>
      <HistoryContent>
        <HistoryItemTitle>
          {item.title}
          {item.type === 'check' && item.status && (
            <StatusBadge $status={item.status}>
              {item.status.replace('_', ' ')}
            </StatusBadge>
          )}
          {item.userActionStatus && (
            <StatusBadge $status={item.userActionStatus === 'saved' ? 'approved' : 
                                   item.userActionStatus === 'dismissed' ? 'potential_issue' : 'not_reviewed'}>
              {item.userActionStatus === 'saved' ? '💾 Saved' :
               item.userActionStatus === 'dismissed' ? '❌ Dismissed' : '⏳ Pending'}
            </StatusBadge>
          )}
        </HistoryItemTitle>
        {/* Show summary for check items, styled tags for recommendations */}
        {item.type === 'check' ? (
          <HistoryItemDescription>{item.summary}</HistoryItemDescription>
        ) : (
          <TagsContainer>
            {item.scenario && (
              <ScenarioTag>
                {item.scenario}
              </ScenarioTag>
            )}
            {item.season && (
              <SeasonTag>
                {item.season}
              </SeasonTag>
            )}
          </TagsContainer>
        )}
        {item.type === 'check' && item.score && (
          <ScoreContainer>
            <ScoreDisplay>
              <FaStar size={14} color="#f59e0b" />
              <ScoreText>
                {item.score}/10
              </ScoreText>
            </ScoreDisplay>
          </ScoreContainer>
        )}
      </HistoryContent>
      <HistoryItemMeta>
        <HistoryTime>{formatDate(item.date)}</HistoryTime>
      </HistoryItemMeta>
    </DashboardHistoryItem>
  );
};

export default AIHistoryItem;
