import { useState } from 'react';
import { AIHistoryItem } from '../../../types/ai';
import { ActivityType, CheckStatus } from './types';

export const useAIHistoryState = () => {
  // Core data state
  const [historyItems, setHistoryItems] = useState<AIHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // UI state
  const [showFullHistory, setShowFullHistory] = useState(false);
  
  // Filter state
  const [activityFilter, setActivityFilter] = useState<ActivityType>('all');
  const [checkStatusFilter, setCheckStatusFilter] = useState<CheckStatus>('all');
  const [userActionFilter, setUserActionFilter] = useState<string>('all');

  // Modal state
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any>(null);
  const [isHistoryDetailModalOpen, setIsHistoryDetailModalOpen] = useState(false);

  return {
    // State
    historyItems,
    isLoadingHistory,
    showFullHistory,
    activityFilter,
    checkStatusFilter,
    userActionFilter,
    selectedHistoryItem,
    isHistoryDetailModalOpen,

    // State setters
    setHistoryItems,
    setIsLoadingHistory,
    setShowFullHistory,
    setActivityFilter,
    setCheckStatusFilter,
    setUserActionFilter,
    setSelectedHistoryItem,
    setIsHistoryDetailModalOpen,
  };
};
