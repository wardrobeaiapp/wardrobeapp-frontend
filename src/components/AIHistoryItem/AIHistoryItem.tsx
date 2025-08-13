import React from 'react';
import { FaSearch, FaMagic, FaClipboardList, FaStar } from 'react-icons/fa';
import { WishlistStatus, UserActionStatus } from '../../types';
import {
  HistoryItem,
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
} from '../../pages/AIAssistantPage.styles';

interface HistoryItemData {
  id: string;
  type: 'check' | 'recommendation';
  title: string;
  description: string;
  date: Date;
  status?: WishlistStatus;
  userActionStatus?: UserActionStatus;
  score?: number;
  season?: string;
  scenario?: string;
}

interface AIHistoryItemProps {
  item: HistoryItemData;
  variant?: 'section' | 'dashboard';
  onClick?: (item: HistoryItemData) => void;
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
  variant = 'section',
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

  const ItemWrapper = variant === 'dashboard' ? DashboardHistoryItem : HistoryItem;
  const TimeWrapper = variant === 'dashboard' ? HistoryItemMeta : React.Fragment;

  const handleClick = () => {
    if (onClick) {
      onClick(item);
    }
  };

  return (
    <ItemWrapper 
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
        <HistoryItemDescription>{item.description}</HistoryItemDescription>
        {item.type === 'check' && item.score && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <FaStar size={14} color="#f59e0b" />
              <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                {item.score}/10
              </span>
            </div>
          </div>
        )}
        {item.type === 'recommendation' && variant === 'dashboard' && (item.scenario || item.season) && (
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
      </HistoryContent>
      <TimeWrapper>
        <HistoryTime>{formatDate(item.date)}</HistoryTime>
      </TimeWrapper>
    </ItemWrapper>
  );
};

export default AIHistoryItem;
