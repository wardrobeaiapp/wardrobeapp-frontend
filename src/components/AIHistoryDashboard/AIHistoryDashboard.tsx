import React from 'react';
import { FaHeart, FaTrash, FaSearch, FaMagic } from 'react-icons/fa';
import { WishlistStatus } from '../../types';
import AIHistoryItem from '../AIHistoryItem/AIHistoryItem';
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
  LoadMoreButton,
  ViewAllButton,
} from '../../pages/AIAssistantPage.styles';

interface HistoryItem {
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

interface AIHistoryDashboardProps {
  activityFilter: string;
  onFilterChange: (value: string) => void;
  filteredHistoryItems: HistoryItem[];
  onBackToMain: () => void;
}

const AIHistoryDashboard: React.FC<AIHistoryDashboardProps> = ({
  activityFilter,
  onFilterChange,
  filteredHistoryItems,
  onBackToMain,
}) => {
  return (
    <DashboardContainer>
      <div style={{ marginBottom: '1rem' }}>
        <ViewAllButton onClick={onBackToMain}>← Back</ViewAllButton>
      </div>
      
      <DashboardTopBar>
        <div>
          <DashboardTitle>AI History</DashboardTitle>
          <DashboardSubtitle>Track your AI styling journey and insights.</DashboardSubtitle>
        </div>
        <FilterDropdown 
          value={activityFilter} 
          onChange={(e) => onFilterChange(e.target.value)}
        >
          <option value="all">Show All</option>
          <option value="check">AI Checks</option>
          <option value="recommendation">AI Recommendations</option>
        </FilterDropdown>
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
            <StatLabel>Added to Wishlist</StatLabel>
          </StatContent>
          <StatIcon className="wishlist">
            <FaHeart size={20} />
          </StatIcon>
        </StatCard>
        
        <StatCard>
          <StatContent>
            <StatValue>8</StatValue>
            <StatLabel>Discarded</StatLabel>
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
        <div style={{ marginBottom: '1.5rem' }}>
          {filteredHistoryItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
              No {activityFilter === 'all' ? '' : activityFilter === 'check' ? 'AI Check' : 'Recommendation'} activities found.
            </div>
          ) : (
            filteredHistoryItems.map((item) => (
              <AIHistoryItem key={item.id} item={item} variant="dashboard" />
            ))
          )}
        </div>

        <LoadMoreButton>Load More History</LoadMoreButton>
      </ActivitySection>
    </DashboardContainer>
  );
};

export default AIHistoryDashboard;
