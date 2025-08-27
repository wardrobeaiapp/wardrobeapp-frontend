import React, { useState, useEffect } from 'react';
import { WishlistStatus, WardrobeItem, UserActionStatus } from '../types';
import { useWardrobe } from '../context/WardrobeContext';
import { getScenarioNamesForFilters } from '../utils/scenarioUtils';
import PageHeader from '../components/layout/Header/Header';
import AIHistoryDashboard from '../components/features/ai-assistant/AIHistoryDashboard/AIHistoryDashboard';
import AICheckCard from '../components/features/ai-assistant/AICheckCard/AICheckCard';
import AIRecommendationCard from '../components/features/ai-assistant/AIRecommendationCard/AIRecommendationCard';
import AIHistorySection from '../components/features/ai-assistant/AIHistorySection/AIHistorySection';
import WishlistSelectionModal from '../components/features/ai-assistant/modals/WishlistSelectionModal/WishlistSelectionModal';
import AICheckResultModal from '../components/features/ai-assistant/modals/AICheckResultModal/AICheckResultModal';
import RecommendationModal from '../components/features/ai-assistant/modals/RecommendationModal/RecommendationModal';
import HistoryDetailModal from '../components/features/ai-assistant/modals/HistoryDetailModal/HistoryDetailModal';
import { PageContainer } from '../components/layout/PageContainer';
import {
  CardsContainer,
} from './AIAssistantPage.styles';

const AIAssistantPage: React.FC = () => {
  const { items, addItem } = useWardrobe();
  
  // State for AI Check
  const [imageLink, setImageLink] = useState('');
  const [itemCheckResponse, setItemCheckResponse] = useState<string | null>(null);
  const [isFileUpload, setIsFileUpload] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // State for Wishlist Selection Modal
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
  
  // State for AI Check Result Modal
  const [isCheckResultModalOpen, setIsCheckResultModalOpen] = useState(false);
  const [itemCheckScore, setItemCheckScore] = useState<number | undefined>(undefined);
  const [itemCheckStatus, setItemCheckStatus] = useState<WishlistStatus | undefined>(undefined);
  
  // State for Recommendation Modal
  const [isRecommendationModalOpen, setIsRecommendationModalOpen] = useState(false);
  const [recommendationText, setRecommendationText] = useState('');
  
  // State for History Detail Modal
  const [isHistoryDetailModalOpen, setIsHistoryDetailModalOpen] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any>(null);
  
  // State for AI Recommendation
  // Removed unused state variables: occasion, season, preferences
  const [error, setError] = useState<string>('');
  const [isCheckLoading, setIsCheckLoading] = useState<boolean>(false);
  const [isRecommendationLoading, setIsRecommendationLoading] = useState<boolean>(false);
  
  // Season and Scenario state for AI Recommendation
  const [selectedSeason, setSelectedSeason] = useState<string>('all');
  const [selectedScenario, setSelectedScenario] = useState<string>('all');
  const [scenarioOptions, setScenarioOptions] = useState<string[]>([]);
  const [loadingScenarios, setLoadingScenarios] = useState(false);
  
  // History view state
  const [showFullHistory, setShowFullHistory] = useState(false);
  
  // State for filtering activities
  const [activityFilter, setActivityFilter] = useState('all');
  const [checkStatusFilter, setCheckStatusFilter] = useState('all');
  const [userActionFilter, setUserActionFilter] = useState('all');
  
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
  const [historyItems, setHistoryItems] = useState([
    {
      id: '1',
      type: 'check' as const,
      title: 'Outfit Check: Casual Friday',
      description: '"Great color harmony!"',
      summary: 'Score: 8.5/10',
      score: 8.5,
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
      date: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: WishlistStatus.APPROVED,
      userActionStatus: UserActionStatus.SAVED
    },
    {
      id: '2',
      type: 'recommendation' as const,
      title: 'Recommendation: Weekend Getaway',
      description: '3 outfits suggested',
      summary: 'Spring • Casual',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000),
      season: 'Spring',
      scenario: 'Casual',
      userActionStatus: UserActionStatus.SAVED
    },
    {
      id: '3',
      type: 'check' as const,
      title: 'Outfit Check: Formal Event',
      description: '"Perfect for the occasion."',
      summary: 'Score: 9.2/10',
      score: 9.2,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      status: WishlistStatus.POTENTIAL_ISSUE,
      userActionStatus: UserActionStatus.DISMISSED
    },
    {
      id: '4',
      type: 'recommendation' as const,
      title: 'AI Recommendation: Winter Formal',
      description: '2 elegant outfit options for formal winter events',
      summary: 'Winter • Formal',
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      season: 'Winter',
      scenario: 'Formal',
      userActionStatus: UserActionStatus.DISMISSED
    },
    {
      id: '5',
      type: 'recommendation' as const,
      title: 'AI Recommendation: Summer Vacation',
      description: '5 outfits for summer beach activities',
      summary: 'Summer • Vacation',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      season: 'Summer',
      scenario: 'Vacation',
      userActionStatus: UserActionStatus.SAVED
    },
    {
      id: '6',
      type: 'check' as const,
      title: 'Outfit Check: Formal Event',
      description: '"Perfect for the occasion."',
      summary: 'Score: 9.2/10',
      score: 9.2,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      status: WishlistStatus.POTENTIAL_ISSUE,
      userActionStatus: UserActionStatus.PENDING
    },
    {
      id: '7',
      type: 'recommendation' as const,
      title: 'AI Recommendation: Spring Wedding',
      description: '4 elegant outfit options for spring wedding season',
      summary: 'Spring • Formal',
      date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      season: 'Spring',
      scenario: 'Formal',
      userActionStatus: UserActionStatus.APPLIED
    },
    {
      id: '8',
      type: 'check' as const,
      title: 'Outfit Check: Business Meeting',
      description: '"Professional and polished look"',
      summary: 'Score: 8.8/10',
      score: 8.8,
      image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400',
      date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      status: WishlistStatus.APPROVED,
      userActionStatus: UserActionStatus.SAVED
    },
    {
      id: '9',
      type: 'recommendation' as const,
      title: 'AI Recommendation: Fall Layers',
      description: '6 layering combinations for autumn weather',
      summary: 'Fall • Casual',
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      season: 'Fall',
      scenario: 'Casual',
      userActionStatus: UserActionStatus.DISMISSED
    },
    {
      id: '10',
      type: 'check' as const,
      title: 'Outfit Check: Date Night',
      description: '"Romantic and stylish combination"',
      summary: 'Score: 9.0/10',
      score: 9.0,
      image: 'https://images.unsplash.com/photo-1494790108755-2616c-b6e?w=400',
      date: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
      status: WishlistStatus.APPROVED,
      userActionStatus: UserActionStatus.APPLIED
    },
    {
      id: '11',
      type: 'recommendation' as const,
      title: 'AI Recommendation: Weekend Brunch',
      description: '3 comfortable yet chic outfits for brunch dates',
      summary: 'Spring • Casual',
      date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      season: 'Spring',
      scenario: 'Casual',
      userActionStatus: UserActionStatus.SAVED
    },
    {
      id: '12',
      type: 'check' as const,
      title: 'Outfit Check: Job Interview',
      description: '"Confident and professional appearance"',
      summary: 'Score: 9.5/10',
      score: 9.5,
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
      date: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000),
      status: WishlistStatus.APPROVED,
      userActionStatus: UserActionStatus.DISMISSED
    },
    {
      id: '13',
      type: 'recommendation' as const,
      title: 'AI Recommendation: Holiday Party',
      description: '5 festive outfit ideas for holiday celebrations',
      summary: 'Winter • Party',
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      season: 'Winter',
      scenario: 'Party',
      userActionStatus: UserActionStatus.PENDING
    },
    {
      id: '14',
      type: 'check' as const,
      title: 'Outfit Check: Gym Session',
      description: '"Great activewear coordination"',
      summary: 'Score: 7.5/10',
      score: 7.5,
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      status: WishlistStatus.POTENTIAL_ISSUE,
      userActionStatus: UserActionStatus.SAVED
    },
    {
      id: '15',
      type: 'recommendation' as const,
      title: 'AI Recommendation: Travel Outfits',
      description: '8 versatile outfits for your upcoming trip',
      summary: 'Summer • Travel',
      date: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000),
      season: 'Summer',
      scenario: 'Travel',
      userActionStatus: UserActionStatus.APPLIED
    },
    {
      id: '16',
      type: 'check' as const,
      title: 'Outfit Check: Concert Night',
      description: '"Perfect for the music festival vibe"',
      summary: 'Score: 8.2/10',
      score: 8.2,
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400',
      date: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000),
      status: WishlistStatus.APPROVED,
      userActionStatus: UserActionStatus.PENDING
    },
    {
      id: '17',
      type: 'recommendation' as const,
      title: 'AI Recommendation: Office Casual',
      description: '4 smart casual looks for flexible work days',
      summary: 'Fall • Business',
      date: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
      season: 'Fall',
      scenario: 'Business',
      userActionStatus: UserActionStatus.SAVED
    },
    {
      id: '18',
      type: 'check' as const,
      title: 'Outfit Check: Garden Party',
      description: '"Elegant and garden-appropriate styling"',
      summary: 'Score: 8.9/10',
      score: 8.9,
      image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400',
      date: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000),
      status: WishlistStatus.APPROVED,
      userActionStatus: UserActionStatus.APPLIED
    },
  ]);

  const handleCheckItem = async () => {
    if (!imageLink.trim()) {
      setError('Please provide an image link to check.');
      return;
    }

    setIsCheckLoading(true);
    setError('');
    setItemCheckResponse(null);
    setItemCheckScore(undefined);
    setItemCheckStatus(undefined);

    try {
      // This would be a real API call to Claude
      // const result = await claudeService.checkItem(imageLink);
      // Mock response for now
      setTimeout(() => {
        const analysisResult = `This item appears to be a versatile piece that would work well in your wardrobe. It can be paired with several items you already own and would be suitable for both casual and semi-formal occasions. The quality seems good based on the image, and it should last for multiple seasons with proper care.`;
        
        // Generate realistic score (6-10 range for positive items)
        const mockScore = Math.floor(Math.random() * 5) + 6; // 6-10
        
        // Generate realistic status based on score
        let mockStatus: WishlistStatus;
        if (mockScore >= 8) {
          mockStatus = WishlistStatus.APPROVED;
        } else if (mockScore >= 7) {
          mockStatus = Math.random() > 0.5 ? WishlistStatus.APPROVED : WishlistStatus.POTENTIAL_ISSUE;
        } else {
          mockStatus = WishlistStatus.POTENTIAL_ISSUE;
        }
        
        setItemCheckResponse(analysisResult);
        setItemCheckScore(mockScore);
        setItemCheckStatus(mockStatus);
        setIsCheckLoading(false);
        setIsCheckResultModalOpen(true);
      }, 1500);
    } catch (err) {
      setError('An error occurred while checking this item. Please try again.');
      console.error('Error checking item:', err);
      setIsCheckLoading(false);
    }
  };

  const handleGetRecommendation = async () => {
    if (!items || items.length === 0) {
      setError('You need to add some items to your wardrobe first!');
      return;
    }

    setError('');
    setIsRecommendationLoading(true);
    
    // Simulate API delay for realistic loading behavior
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate a mock recommendation
    const mockRecommendations = [
      "For a casual day out, try pairing your navy blue jeans with the white cotton t-shirt and layer with the denim jacket. Complete the look with white sneakers for a relaxed, comfortable style.",
      "Create an elegant evening look by combining your black dress with the leather jacket. Add heeled boots and minimal jewelry for a sophisticated yet edgy appearance.",
      "For a professional setting, pair your tailored blazer with dark trousers and a crisp white shirt. Add leather loafers and a classic watch to complete this polished business look.",
      "Weekend vibes call for your favorite sweater with comfortable joggers. Layer with a casual cardigan and finish with your go-to sneakers for the perfect cozy-chic ensemble.",
      "Make a statement with your printed midi dress paired with ankle boots and a structured handbag. Add a light scarf for both style and versatility."
    ];
    
    const randomRecommendation = mockRecommendations[Math.floor(Math.random() * mockRecommendations.length)];
    setRecommendationText(randomRecommendation);
    setIsRecommendationLoading(false);
    setIsRecommendationModalOpen(true);
  };

  // handleGenerateCapsule function removed to fix ESLint warning

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('File uploaded:', file.name);
      // Create a local URL for preview
      const url = URL.createObjectURL(file);
      setImageLink(url);
      setIsFileUpload(true);
      setUploadedFile(file);
    }
  };

  // Handle processed image from background removal
  const handleProcessedImageChange = (processedImageUrl: string, processedImageBlob: Blob) => {
    console.log('Processed image received from background removal');
    // Update the image link to the processed image URL
    setImageLink(processedImageUrl);
    
    // Create a new File object from the blob for potential API uploads
    if (uploadedFile) {
      const processedFile = new File([processedImageBlob], uploadedFile.name, {
        type: processedImageBlob.type || uploadedFile.type
      });
      setUploadedFile(processedFile);
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
    let filtered = items;
    
    // Filter by activity type
    if (activityFilter !== 'all') {
      filtered = filtered.filter(item => item.type === activityFilter);
    }
    
    // Filter by check status (only applies to check items)
    if (checkStatusFilter !== 'all') {
      filtered = filtered.filter(item => {
        // Only show check items with matching status
        if (item.type === 'check') {
          return item.status === checkStatusFilter;
        }
        // Hide recommendation items when check status filter is active
        return false;
      });
    }
    
    // Filter by user action status (applies to all items)
    if (userActionFilter !== 'all') {
      filtered = filtered.filter(item => item.userActionStatus === userActionFilter);
    }
    
    return filtered;
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

  const handleCloseCheckResultModal = () => {
    setIsCheckResultModalOpen(false);
  };

  // AI Check Result Modal Action Handlers
  const handleAddToWishlist = () => {
    if (!itemCheckResponse || !itemCheckScore || !itemCheckStatus) {
      console.error('Missing check result data');
      return;
    }
    
    // Create a temporary item from the analysis
    const tempItem: WardrobeItem = {
      id: `temp-${Date.now()}`,
      name: 'AI Analyzed Item',
      category: 'other' as any,
      color: 'Unknown',
      season: ['ALL_SEASON'] as any,
      imageUrl: imageLink,
      dateAdded: new Date().toISOString(),
      timesWorn: 0,
      wishlist: true,
      wishlistStatus: itemCheckStatus || WishlistStatus.NOT_REVIEWED
    };
    
    // Add to wardrobe as wishlist item
    addItem(tempItem);
    
    // Add history entry with user action status
    addHistoryEntry('Added to wishlist', UserActionStatus.SAVED);
    console.log('Added item to wishlist:', tempItem);
  };

  const handleSkipItem = () => {
    // Add history entry with user action status
    addHistoryEntry('Skipped item', UserActionStatus.DISMISSED);
    console.log('User skipped the item');
  };

  const handleDecideLater = () => {
    // Add history entry with user action status
    addHistoryEntry('Will decide later', UserActionStatus.PENDING);
    console.log('User decided to decide later');
  };

  // Helper function to add history entries with user action status
  const addHistoryEntry = (description: string, userActionStatus: UserActionStatus) => {
    if (!itemCheckResponse || !itemCheckScore || !itemCheckStatus) return;

    const newHistoryItem = {
      id: `check-${Date.now()}`,
      type: 'check' as const,
      title: 'Outfit Check: Current Analysis',
      description: `"${itemCheckResponse}"`,
      summary: `Score: ${itemCheckScore}/10`,
      score: itemCheckScore,
      image: imageLink || undefined,
      date: new Date(),
      status: itemCheckStatus,
      userActionStatus: userActionStatus
    };

    setHistoryItems(prev => [newHistoryItem, ...prev]);
  };

  // Recommendation Modal Handlers
  const handleCloseRecommendationModal = () => {
    setIsRecommendationModalOpen(false);
  };

  const handleSaveRecommendation = () => {
    console.log('User saved the recommendation:', recommendationText);
    
    // Add history entry with user action status
    addRecommendationHistoryEntry('Saved recommendation', UserActionStatus.SAVED);
  };

  const handleSkipRecommendation = () => {
    console.log('User skipped the recommendation');
    
    // Add history entry with user action status
    addRecommendationHistoryEntry('Dismissed recommendation', UserActionStatus.DISMISSED);
  };

  // Helper function to add recommendation history entries with user action status
  const addRecommendationHistoryEntry = (description: string, userActionStatus: UserActionStatus) => {
    const newHistoryItem = {
      id: `recommendation-${Date.now()}`,
      type: 'recommendation' as const,
      title: 'AI Recommendation: Current Suggestion',
      description: description,
      summary: 'All Season • General',
      date: new Date(),
      season: 'All Season',
      scenario: 'General',
      userActionStatus: userActionStatus
    };

    setHistoryItems(prev => [newHistoryItem, ...prev]);
  };

  // History Detail Modal Handlers
  const handleHistoryItemClick = (item: any) => {
    setSelectedHistoryItem(item);
    setIsHistoryDetailModalOpen(true);
  };

  const handleCloseHistoryDetailModal = () => {
    setIsHistoryDetailModalOpen(false);
    setSelectedHistoryItem(null);
  };

  const handleMoveToWishlist = (item: any) => {
    console.log('Moving item to wishlist:', item);
    
    // Update the history item's user action status to SAVED
    setHistoryItems(prev => 
      prev.map(historyItem => 
        historyItem.id === item.id 
          ? { ...historyItem, userActionStatus: UserActionStatus.SAVED }
          : historyItem
      )
    );
    
    // Close the modal
    handleCloseHistoryDetailModal();
  };

  const handleDismissHistoryItem = (item: any) => {
    console.log('Dismissing history item:', item);
    
    // Update the history item's user action status to DISMISSED
    setHistoryItems(prev => 
      prev.map(historyItem => 
        historyItem.id === item.id 
          ? { ...historyItem, userActionStatus: UserActionStatus.DISMISSED }
          : historyItem
      )
    );
    
    // Close the modal
    handleCloseHistoryDetailModal();
  };

  return (
    <>
      <PageHeader title="AI Wardrobe Assistant" />
      <PageContainer>
        {showFullHistory ? (
          <AIHistoryDashboard
            activityFilter={activityFilter}
            onFilterChange={setActivityFilter}
            checkStatusFilter={checkStatusFilter}
            onCheckStatusFilterChange={setCheckStatusFilter}
            userActionFilter={userActionFilter}
            onUserActionFilterChange={setUserActionFilter}
            filteredHistoryItems={filteredHistoryItems}
            onBackToMain={handleBackToMain}
            onHistoryItemClick={handleHistoryItemClick}
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
                isLoading={isCheckLoading}
                error={error}
                itemCheckResponse={itemCheckResponse}
                isFileUpload={isFileUpload}
                uploadedFile={uploadedFile}
                onProcessedImageChange={handleProcessedImageChange}
              />
              
              <AIRecommendationCard
                selectedSeason={selectedSeason}
                onSeasonChange={setSelectedSeason}
                selectedScenario={selectedScenario}
                onScenarioChange={setSelectedScenario}
                scenarioOptions={scenarioOptions}
                loadingScenarios={loadingScenarios}
                onGetRecommendation={handleGetRecommendation}
                isLoading={isRecommendationLoading}
                error={error}
              />
        </CardsContainer>
        
            {/* History Section - Limited Items */}
            <AIHistorySection
              historyItems={historyItems}
              onViewAllHistory={handleViewAllHistory}
              onHistoryItemClick={handleHistoryItemClick}
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

      {/* AI Check Result Modal - Only render when needed */}
      {(isCheckResultModalOpen || itemCheckResponse) && (
        <AICheckResultModal
          isOpen={isCheckResultModalOpen}
          onClose={handleCloseCheckResultModal}
          analysisResult={itemCheckResponse || ''}
          score={itemCheckScore}
          status={itemCheckStatus}
          imageUrl={imageLink}
          onAddToWishlist={handleAddToWishlist}
          onSkip={handleSkipItem}
          onDecideLater={handleDecideLater}
        />
      )}

      {/* Recommendation Modal */}
      <RecommendationModal
        isOpen={isRecommendationModalOpen}
        onClose={handleCloseRecommendationModal}
        recommendation={recommendationText}
        onSave={handleSaveRecommendation}
        onSkip={handleSkipRecommendation}
      />

      {/* History Detail Modal */}
      <HistoryDetailModal
        isOpen={isHistoryDetailModalOpen}
        onClose={handleCloseHistoryDetailModal}
        item={selectedHistoryItem}
        onMoveToWishlist={handleMoveToWishlist}
        onDismiss={handleDismissHistoryItem}
      />
    </>
  );
};

export default AIAssistantPage;
