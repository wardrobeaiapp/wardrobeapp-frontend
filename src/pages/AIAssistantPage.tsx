import React, { useState, useEffect } from 'react';
import { WishlistStatus, WardrobeItem } from '../types';
import { useWardrobe } from '../context/WardrobeContext';
import { claudeService } from '../services/claudeService';
import { getScenarioNamesForFilters } from '../utils/scenarioUtils';
import PageHeader from '../components/Header/Header';
import AIHistoryDashboard from '../components/AIHistoryDashboard/AIHistoryDashboard';
import AICheckCard from '../components/AICheckCard/AICheckCard';
import AIRecommendationCard from '../components/AIRecommendationCard/AIRecommendationCard';
import AIHistorySection from '../components/AIHistorySection/AIHistorySection';
import WishlistSelectionModal from '../components/WishlistSelectionModal/WishlistSelectionModal';
import {
  PageContainer,
  CardsContainer,
} from './AIAssistantPage.styles';

const AIAssistantPage: React.FC = () => {
  const { items } = useWardrobe();
  
  // State for AI Check
  const [imageLink, setImageLink] = useState('');
  const [itemCheckResponse, setItemCheckResponse] = useState<string | null>(null);

  
  // State for Wishlist Selection Modal
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
  
  // State for AI Recommendation
  // Removed unused state variables: occasion, season, preferences
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Season and Scenario state for AI Recommendation
  const [selectedSeason, setSelectedSeason] = useState<string>('all');
  const [selectedScenario, setSelectedScenario] = useState<string>('all');
  const [scenarioOptions, setScenarioOptions] = useState<string[]>([]);
  const [loadingScenarios, setLoadingScenarios] = useState(false);
  
  // History view state
  const [showFullHistory, setShowFullHistory] = useState(false);
  
  // State for filtering activities
  const [activityFilter, setActivityFilter] = useState('all');
  
  // Load scenario options when component mounts
  useEffect(() => {
    const loadScenarioOptions = async () => {
      setLoadingScenarios(true);
      try {
        const options = await getScenarioNamesForFilters();
        setScenarioOptions(options);
      } catch (err) {
        console.error('Error loading scenario options:', err);
      } finally {
        setLoadingScenarios(false);
      }
    };
    
    loadScenarioOptions();
  }, []);
  
  // State for history data
  const [historyItems] = useState([
    {
      id: '1',
      type: 'check' as const,
      title: 'Outfit Check: Casual Friday',
      description: '"Great color harmony!"',
      score: 8.5,
      date: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: WishlistStatus.APPROVED
    },
    {
      id: '2',
      type: 'recommendation' as const,
      title: 'Recommendation: Weekend Getaway',
      description: '3 outfits suggested',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000),
      season: 'Spring',
      scenario: 'Casual'
    },
    {
      id: '3',
      type: 'check' as const,
      title: 'Outfit Check: Formal Event',
      description: '"Perfect for the occasion."',
      score: 9.2,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      status: WishlistStatus.POTENTIAL_ISSUE
    },
    {
      id: '4',
      type: 'recommendation' as const,
      title: 'AI Recommendation: Winter Formal',
      description: '2 elegant outfit options for formal winter events',
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      season: 'Winter',
      scenario: 'Formal'
    },
    {
      id: '5',
      type: 'recommendation' as const,
      title: 'AI Recommendation: Summer Vacation',
      description: '5 outfits for summer beach activities',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      season: 'Summer',
      scenario: 'Vacation'
    }
  ]);

  const handleCheckItem = async () => {
    if (!imageLink.trim()) {
      setError('Please provide an image link to check.');
      return;
    }

    setIsLoading(true);
    setError('');
    setItemCheckResponse(null);

    try {
      // This would be a real API call to Claude
      // const result = await claudeService.checkItem(imageLink);
      // Mock response for now
      setTimeout(() => {
        setItemCheckResponse(
          `This item appears to be a versatile piece that would work well in your wardrobe. It can be paired with several items you already own and would be suitable for both casual and semi-formal occasions. The quality seems good based on the image, and it should last for multiple seasons with proper care.`
        );
        setIsLoading(false);
      }, 1500);
    } catch (err) {
      setError('An error occurred while checking this item. Please try again.');
      console.error('Error checking item:', err);
      setIsLoading(false);
    }
  };

  const handleGetRecommendation = async () => {
    if (!items || items.length === 0) {
      setError('You need to add some items to your wardrobe first!');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // Use existing wardrobe items and user preferences for recommendation
      const response = await claudeService.getOutfitSuggestions(
        items,
        'general', // Default occasion
        undefined, // season
        undefined  // preferences
      );
      
      console.log('Recommendation received:', response);
    } catch (error) {
      console.error('Error getting recommendation:', error);
      setError('Failed to get recommendation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // handleGenerateCapsule function removed to fix ESLint warning

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Handle file upload - placeholder for now
      console.log('File uploaded:', file.name);
      // TODO: Implement actual file upload to server/cloud storage
      // For now, we could create a local URL for preview
      const url = URL.createObjectURL(file);
      setImageLink(url);
    }
  };

  // Handle view all click
  const handleViewAllHistory = () => {
    setShowFullHistory(true);
  };

  // Handle back to main view
  const handleBackToMain = () => {
    setShowFullHistory(false);
  };

  // Filter history items based on selected filter
  const getFilteredHistoryItems = (items: typeof historyItems) => {
    if (activityFilter === 'all') return items;
    return items.filter(item => item.type === activityFilter);
  };
  
  // Get filtered history items for dashboard view
  const filteredHistoryItems = getFilteredHistoryItems(historyItems);

  // Wishlist modal handlers
  const handleOpenWishlistModal = () => {
    setIsWishlistModalOpen(true);
  };

  const handleCloseWishlistModal = () => {
    setIsWishlistModalOpen(false);
  };

  const handleSelectWishlistItem = (item: WardrobeItem) => {
    if (item.imageUrl) {
      setImageLink(item.imageUrl);
    }
    // Clear any previous check response when selecting new item
    setItemCheckResponse(null);
    setError('');
  };

  return (
    <>
      <PageHeader title="AI Wardrobe Assistant" />
      <PageContainer>
        {showFullHistory ? (
          <AIHistoryDashboard
            activityFilter={activityFilter}
            onFilterChange={setActivityFilter}
            filteredHistoryItems={filteredHistoryItems}
            onBackToMain={handleBackToMain}
          />
        ) : (
          <>
            {/* Main View - Show AI cards and limited history */}
            <CardsContainer>
              <AICheckCard
                imageLink={imageLink}
                onImageLinkChange={setImageLink}
                onFileUpload={handleFileUpload}
                onCheckItem={handleCheckItem}
                onOpenWishlistModal={handleOpenWishlistModal}
                isLoading={isLoading}
                error={error}
                itemCheckResponse={itemCheckResponse}
              />
              
              <AIRecommendationCard
                selectedSeason={selectedSeason}
                onSeasonChange={setSelectedSeason}
                selectedScenario={selectedScenario}
                onScenarioChange={setSelectedScenario}
                scenarioOptions={scenarioOptions}
                loadingScenarios={loadingScenarios}
                onGetRecommendation={handleGetRecommendation}
                isLoading={isLoading}
                error={error}
              />
        </CardsContainer>
        
            {/* History Section - Limited Items */}
            <AIHistorySection
              historyItems={historyItems}
              onViewAllHistory={handleViewAllHistory}
            />
          </>
        )}
      </PageContainer>
      
      {/* Wishlist Selection Modal */}
      <WishlistSelectionModal
        isOpen={isWishlistModalOpen}
        onClose={handleCloseWishlistModal}
        items={items}
        onSelectItem={handleSelectWishlistItem}
      />
    </>
  );
};

export default AIAssistantPage;
