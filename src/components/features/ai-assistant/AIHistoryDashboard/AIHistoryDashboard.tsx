import React, { useState, useEffect } from 'react';
import { FaTrash, FaSearch, FaMagic, FaTshirt } from 'react-icons/fa';
import { AIHistoryItem, WishlistStatus, UserActionStatus } from '../../../../types';
import AIHistoryItemComponent from '../AIHistoryItem/AIHistoryItem';
import Button from '../../../common/Button';
import {
  DashboardContainer,
  DashboardTopBar,
  DashboardTitle,
  DashboardSubtitle,
  FilterDropdown,
  StatsGrid,
  StatCard,
  StatIcon,
  StatContent,
  StatValue,
  StatLabel,
  ActivitySection,
  ActivityHeader,
  ActivityTitle,
} from '../../../../pages/AIAssistantPage.styles';

interface AIHistoryDashboardProps {
  activityFilter: string;
  onFilterChange: (value: string) => void;
  checkStatusFilter: string;
  onCheckStatusFilterChange: (value: string) => void;
  userActionFilter: string;
  onUserActionFilterChange: (value: string) => void;
  filteredHistoryItems: AIHistoryItem[];
  onBackToMain: () => void;
  onHistoryItemClick?: (item: AIHistoryItem) => void;
}

const AIHistoryDashboard: React.FC<AIHistoryDashboardProps> = ({
  activityFilter,
  onFilterChange,
  checkStatusFilter,
  onCheckStatusFilterChange,
  userActionFilter,
  onUserActionFilterChange,
  filteredHistoryItems,
  onBackToMain,
  onHistoryItemClick,
}) => {
  const [visibleItemsCount, setVisibleItemsCount] = useState(10);
  const ITEMS_PER_PAGE = 10;

  // Reset visible items when any filter changes
  useEffect(() => {
    setVisibleItemsCount(ITEMS_PER_PAGE);
  }, [activityFilter, checkStatusFilter, userActionFilter]);

  const handleLoadMore = () => {
    setVisibleItemsCount(prev => prev + ITEMS_PER_PAGE);
  };

  const visibleItems = filteredHistoryItems.slice(0, visibleItemsCount);
  const hasMoreItems = filteredHistoryItems.length > visibleItemsCount;

  return (
    <DashboardContainer>
      <div style={{ marginBottom: '1rem' }}>
        <Button variant="link" onClick={onBackToMain} style={{ textDecoration: 'none' }}>← Back</Button>
      </div>
      
      <DashboardTopBar>
        <div>
          <DashboardTitle>AI History</DashboardTitle>
          <DashboardSubtitle>Track your AI styling journey and insights.</DashboardSubtitle>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <FilterDropdown 
            value={activityFilter} 
            onChange={(e) => onFilterChange(e.target.value)}
          >
            <option value="all">Show All</option>
            <option value="check">AI Checks</option>
            <option value="recommendation">AI Recommendations</option>
          </FilterDropdown>
          <FilterDropdown 
            value={checkStatusFilter} 
            onChange={(e) => onCheckStatusFilterChange(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value={WishlistStatus.APPROVED}>Approved</option>
            <option value={WishlistStatus.POTENTIAL_ISSUE}>Potential Issue</option>
            <option value={WishlistStatus.NOT_REVIEWED}>Not Reviewed</option>
          </FilterDropdown>
          <FilterDropdown 
            value={userActionFilter} 
            onChange={(e) => onUserActionFilterChange(e.target.value)}
          >
            <option value="all">All Actions</option>
            <option value={UserActionStatus.SAVED}>Saved</option>
            <option value={UserActionStatus.DISMISSED}>Dismissed</option>
            <option value={UserActionStatus.PENDING}>Pending</option>
            <option value={UserActionStatus.APPLIED}>Applied</option>
          </FilterDropdown>
        </div>
      </DashboardTopBar>

      <StatsGrid>
        <StatCard>
          <StatContent>
            <StatValue>47</StatValue>
            <StatLabel>Total AI Checks</StatLabel>
          </StatContent>
          <StatIcon className="check">
            <FaSearch size={20} />
          </StatIcon>
        </StatCard>
        
        <StatCard>
          <StatContent>
            <StatValue>23</StatValue>
            <StatLabel>Recommendations</StatLabel>
          </StatContent>
          <StatIcon className="recommendation">
            <FaMagic size={20} />
          </StatIcon>
        </StatCard>
        
        <StatCard className="wishlist">
          <StatContent>
            <StatValue>15</StatValue>
            <StatLabel>Added to Wardrobe</StatLabel>
          </StatContent>
          <StatIcon className="wishlist">
            <FaTshirt size={20} />
          </StatIcon>
        </StatCard>
        
        <StatCard>
          <StatContent>
            <StatValue>8</StatValue>
            <StatLabel>Dismissed Items</StatLabel>
          </StatContent>
          <StatIcon className="discarded">
            <FaTrash size={20} />
          </StatIcon>
        </StatCard>
      </StatsGrid>

      <ActivitySection>
        <ActivityHeader>
          <ActivityTitle>Recent Activity</ActivityTitle>
        </ActivityHeader>
        
        {/* Dynamic filtered history items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredHistoryItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
              No {activityFilter === 'all' ? '' : activityFilter === 'check' ? 'AI Check' : 'Recommendation'} activities found.
            </div>
          ) : (
            visibleItems.map((item) => (
              <AIHistoryItemComponent 
                key={item.id} 
                item={item} 
                onClick={onHistoryItemClick}
              />
            ))
          )}
        </div>

        {hasMoreItems && (
          <Button 
            variant="secondary" 
            outlined={true} 
            fullWidth={true} 
            onClick={handleLoadMore}
            style={{ marginTop: '1rem' }}
          >
            Load More History
          </Button>
        )}
      </ActivitySection>
    </DashboardContainer>
  );
};

export default AIHistoryDashboard;
