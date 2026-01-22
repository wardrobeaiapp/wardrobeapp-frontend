import React, { useState, useEffect } from 'react';
import { FaTrash, FaSearch, FaMagic, FaTshirt, FaSpinner } from 'react-icons/fa';
import { UserActionStatus } from '../../../../types';
import { AIHistoryItem } from '../../../../types/ai';
import { aiCheckHistoryService } from '../../../../services/ai/aiCheckHistoryService';
import AIHistoryItemComponent from '../AIHistoryItem/AIHistoryItem';
import Button from '../../../common/Button';
import { PageHeader } from '../../../../components/common/Typography/PageHeader';
import { FormField, FormSelect } from '../../../common/Form';
import { type ActivityType, type CheckStatus } from '../../../../hooks/ai';
import {
  DashboardContainer,
  DashboardTopBar,
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
  activityFilter: ActivityType;
  onFilterChange: (value: ActivityType) => void;
  checkStatusFilter: CheckStatus;
  onCheckStatusFilterChange: (value: CheckStatus) => void;
  userActionFilter: string;
  onUserActionFilterChange: (value: string) => void;
  filteredHistoryItems: AIHistoryItem[];
  onBackToMain: () => void;
  onHistoryItemClick?: (item: AIHistoryItem) => void;
}

interface HistoryStats {
  totalCount: number;
  avgScore: number;
  byCategory: Record<string, number>;
  byStatus: Record<string, number>;
  recentCount: number;
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
  const [stats, setStats] = useState<HistoryStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const ITEMS_PER_PAGE = 10;

  // Load AI Check history stats on component mount
  useEffect(() => {
    const loadHistoryStats = async () => {
      try {
        setStatsLoading(true);
        const result = await aiCheckHistoryService.getHistoryStats();
        
        if (result.success && result.data) {
          setStats(result.data);
        } else {
          console.error('Failed to load AI Check history stats:', result.error);
        }
      } catch (error) {
        console.error('Error loading AI Check history stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    loadHistoryStats();
    // Use filteredHistoryItems passed from parent (same as Recent Activity)
  }, []);

  // Reset visible items when any filter changes
  useEffect(() => {
    setVisibleItemsCount(ITEMS_PER_PAGE);
  }, [activityFilter, checkStatusFilter, userActionFilter]);

  const handleLoadMore = () => {
    setVisibleItemsCount(prev => prev + ITEMS_PER_PAGE);
  };

  // Use the same filtered data as Recent Activity (already includes richData)
  const filteredData = filteredHistoryItems;

  const visibleItems = filteredData.slice(0, visibleItemsCount);
  const hasMoreItems = filteredData.length > visibleItemsCount;

  return (
    <DashboardContainer>
      <div style={{ marginBottom: '1rem' }}>
        <Button variant="link" onClick={onBackToMain} style={{ textDecoration: 'none' }}>← Back</Button>
      </div>
      
      <DashboardTopBar>
        <div>
          <PageHeader 
            title="AI History" 
            description="Track your AI styling journey and insights."
            titleSize="lg"
          />
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-end' }}>
          <FormField label="Activity Type" htmlFor="activity-filter" style={{ minWidth: '200px' }}>
            <FormSelect
              id="activity-filter"
              value={activityFilter}
              onChange={(e) => onFilterChange(e.target.value as ActivityType)}
              aria-label="Filter by activity type"
            >
              <option value="all">All Activities</option>
              <option value="check">AI Checks</option>
              <option value="recommendation">Recommendations</option>
            </FormSelect>
          </FormField>
          
          <FormField label="Status" htmlFor="status-filter" style={{ minWidth: '200px' }}>
            <FormSelect
              id="status-filter"
              value={checkStatusFilter}
              onChange={(e) => onCheckStatusFilterChange(e.target.value as CheckStatus)}
              aria-label="Filter by check status"
            >
              <option value="all">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="potential_issue">Potential Issues</option>
              <option value="not_recommended">Not Recommended</option>
            </FormSelect>
          </FormField>
          
          <FormField label="Actions" htmlFor="action-filter" style={{ minWidth: '200px' }}>
            <FormSelect
              id="action-filter"
              value={userActionFilter}
              onChange={(e) => onUserActionFilterChange(e.target.value)}
              size="medium"
            >
              <option value="all">All Actions</option>
              <option value={UserActionStatus.SAVED}>Saved</option>
              <option value={UserActionStatus.DISMISSED}>Dismissed</option>
              <option value={UserActionStatus.PENDING}>Pending</option>
              <option value={UserActionStatus.APPLIED}>Applied</option>
            </FormSelect>
          </FormField>
        </div>
      </DashboardTopBar>

      <StatsGrid>
        <StatCard>
          <StatContent>
            <StatValue>
              {statsLoading ? <FaSpinner className="fa-spin" size={16} /> : stats?.totalCount || 0}
            </StatValue>
            <StatLabel>Total AI Checks</StatLabel>
          </StatContent>
          <StatIcon className="check">
            <FaSearch size={20} />
          </StatIcon>
        </StatCard>
        
        <StatCard>
          <StatContent>
            <StatValue>
              {statsLoading ? <FaSpinner className="fa-spin" size={16} /> : stats?.avgScore?.toFixed(1) || '0.0'}
            </StatValue>
            <StatLabel>Average Score</StatLabel>
          </StatContent>
          <StatIcon className="recommendation">
            <FaMagic size={20} />
          </StatIcon>
        </StatCard>
        
        <StatCard className="wishlist">
          <StatContent>
            <StatValue>
              {statsLoading ? <FaSpinner className="fa-spin" size={16} /> : stats?.byStatus?.applied || 0}
            </StatValue>
            <StatLabel>Applied Suggestions</StatLabel>
          </StatContent>
          <StatIcon className="wishlist">
            <FaTshirt size={20} />
          </StatIcon>
        </StatCard>
        
        <StatCard>
          <StatContent>
            <StatValue>
              {statsLoading ? <FaSpinner className="fa-spin" size={16} /> : stats?.recentCount || 0}
            </StatValue>
            <StatLabel>Recent Checks (30d)</StatLabel>
          </StatContent>
          <StatIcon className="discarded">
            <FaTrash size={20} />
          </StatIcon>
        </StatCard>
      </StatsGrid>

      <ActivitySection>
        <ActivityHeader>
          <ActivityTitle>AI Check History</ActivityTitle>
        </ActivityHeader>
        
        {/* AI Check history items - same data source as Recent Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
              {filteredHistoryItems.length === 0 ? 
                'No AI Check history found. Try checking some wishlist items!' :
                `No activities found with current filters.`
              }
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
