import React, { useState, useEffect } from 'react';
import { useWardrobe } from '../context/WardrobeContext';
import { claudeService } from '../services/claudeService';
import { ClaudeResponse, Season } from '../types';
import { getScenarioNamesForFilters } from '../utils/scenarioUtils';
import PageHeader from '../components/Header/Header';
import {
  PageContainer,
  CardsContainer,
  AICard,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardIcon,
  HistorySection,
  HistoryHeader,
  HistoryTitle,
  ViewAllButton,
  HistoryList,
  HistoryItem,
  HistoryContent,
  HistoryItemTitle,
  HistoryItemDescription,
  HistoryTime,
  // AI History Dashboard Components
  DashboardContainer,
  DashboardHeader,
  DashboardTitle,
  DashboardSubtitle,
  DashboardTopBar,
  FilterDropdown,
  ExportButton,
  StatsGrid,
  StatCard,
  StatIcon,
  StatContent,
  StatValue,
  StatLabel,
  ActivitySection,
  ActivityHeader,
  ActivityTitle,
  DashboardHistoryItem,
  HistoryItemMeta,
  LoadMoreButton,
  // Existing components we can use
  AICheckContent,
  UploadArea,
  UploadIcon,
  UploadText,
  ControlsArea,
  InputSection,
  InputLabel,
  TextInput,
  Select,
  DropdownContainer,
  ButtonGroup,
  PrimaryButton,
  SecondaryButton,
} from './AIAssistantPage.styles';

const AIAssistantPage: React.FC = () => {
  const { items, addOutfit } = useWardrobe();
  
  // State for AI Check
  const [imageLink, setImageLink] = useState('');
  const [itemToCheck, setItemToCheck] = useState('');
  const [itemCheckResponse, setItemCheckResponse] = useState<string | null>(null);
  
  // State for AI Recommendation
  // Removed unused state variables: occasion, season, preferences
  const [recommendationResponse, setRecommendationResponse] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Season and Scenario state for AI Recommendation
  const [selectedSeason, setSelectedSeason] = useState<string>('all');
  const [selectedScenario, setSelectedScenario] = useState<string>('all');
  const [scenarioOptions, setScenarioOptions] = useState<string[]>([]);
  const [loadingScenarios, setLoadingScenarios] = useState(false);
  const [errorScenarios, setErrorScenarios] = useState<string | null>(null);
  
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
        setErrorScenarios('Failed to load scenarios');
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
      description: 'AI Score: 8.5/10 - "Great color harmony!"',
      time: '2 hours ago'
    },
    {
      id: '2',
      type: 'recommendation' as const,
      title: 'Recommendation: Weekend Getaway',
      description: '3 outfits suggested',
      time: 'Yesterday'
    },
    {
      id: '3',
      type: 'check' as const,
      title: 'Outfit Check: Formal Event',
      description: 'AI Score: 9.2/10 - "Perfect for the occasion."',
      time: '3 days ago'
    }
  ]);

  const handleCheckItem = async () => {
    if (!itemToCheck.trim()) {
      setError('Please describe the item you want to check.');
      return;
    }

    setIsLoading(true);
    setError('');
    setItemCheckResponse(null);

    try {
      // This would be a real API call to Claude
      // const result = await claudeService.checkItem(itemToCheck);
      // Mock response for now
      setTimeout(() => {
        setItemCheckResponse(
          `This ${itemToCheck} appears to be a versatile piece that would work well in your wardrobe. It can be paired with several items you already own and would be suitable for both casual and semi-formal occasions. The quality seems good based on your description, and it should last for multiple seasons with proper care.`
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
    setRecommendationResponse(null); // Clear previous response
    
    try {
      // Use existing wardrobe items and user preferences for recommendation
      const response = await claudeService.getOutfitSuggestions(
        items,
        'general', // Default occasion
        undefined, // season
        undefined  // preferences
      );
      
      setRecommendationResponse(response);
    } catch (error) {
      console.error('Error getting recommendation:', error);
      setError('Failed to get recommendation. Please try again.');
      setRecommendationResponse(null); // Ensure response is cleared on error
    } finally {
      setIsLoading(false);
    }
  };

  // handleGenerateCapsule function removed to fix ESLint warning

  const handleSaveOutfit = () => {
    if (recommendationResponse && recommendationResponse.outfitSuggestion) {
      addOutfit({
        ...recommendationResponse.outfitSuggestion,
        favorite: false,
      });
      alert('Outfit saved to your collection!');
    }
  };

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

  // Get history icon based on type
  const getHistoryIcon = (type: string) => {
    switch (type) {
      case 'check':
        return '🔍';
      case 'recommendation':
        return '🪄';
      default:
        return '📋';
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
  
  // Get limited history items for main view (3 most recent)
  const limitedHistoryItems = historyItems.slice(0, 3);
  
  // Get filtered history items for dashboard view
  const filteredHistoryItems = getFilteredHistoryItems(historyItems);



  return (
    <>
      <PageHeader title="AI Wardrobe Assistant" />
      <PageContainer>
        {showFullHistory ? (
          // AI History Dashboard View
          <DashboardContainer>
            <div style={{ marginBottom: '1rem' }}>
              <ViewAllButton onClick={handleBackToMain}>← Back</ViewAllButton>
            </div>
            
            <DashboardTopBar>
              <div>
                <DashboardTitle>AI History</DashboardTitle>
                <DashboardSubtitle>Track your AI styling journey and insights.</DashboardSubtitle>
              </div>
              <FilterDropdown 
                value={activityFilter} 
                onChange={(e) => setActivityFilter(e.target.value)}
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
                <StatIcon className="check">🔍</StatIcon>
              </StatCard>
              
              <StatCard>
                <StatContent>
                  <StatValue>23</StatValue>
                  <StatLabel>Recommendations</StatLabel>
                </StatContent>
                <StatIcon className="recommendation">🪄</StatIcon>
              </StatCard>
              
              <StatCard className="wishlist">
                <StatContent>
                  <StatValue>15</StatValue>
                  <StatLabel>Added to Wishlist</StatLabel>
                </StatContent>
                <StatIcon className="wishlist">💖</StatIcon>
              </StatCard>
              
              <StatCard>
                <StatContent>
                  <StatValue>8</StatValue>
                  <StatLabel>Discarded</StatLabel>
                </StatContent>
                <StatIcon className="discarded">🗑️</StatIcon>
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
                    <DashboardHistoryItem key={item.id}>
                      <CardIcon className={item.type}>
                        {item.type === 'check' ? '🔍' : '🪄'}
                      </CardIcon>
                      <HistoryContent>
                        <HistoryItemTitle>{item.title}</HistoryItemTitle>
                        <HistoryItemDescription>{item.description}</HistoryItemDescription>
                        {item.type === 'check' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                            <span style={{ fontSize: '0.875rem', color: '#f59e0b' }}>⭐ AI Score</span>
                            <span style={{ fontSize: '0.75rem', background: '#dcfce7', color: '#16a34a', padding: '0.125rem 0.5rem', borderRadius: '0.25rem' }}>Great</span>
                          </div>
                        )}
                        {item.type === 'recommendation' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                            <span style={{ fontSize: '0.75rem', background: '#dbeafe', color: '#2563eb', padding: '0.125rem 0.5rem', borderRadius: '0.25rem' }}>Suggestion</span>
                          </div>
                        )}
                      </HistoryContent>
                      <HistoryItemMeta>
                        <HistoryTime>{item.time}</HistoryTime>
                      </HistoryItemMeta>
                    </DashboardHistoryItem>
                  ))
                )}
              </div>

              <LoadMoreButton>Load More History</LoadMoreButton>
            </ActivitySection>
          </DashboardContainer>
        ) : (
          <>
            {/* Main View - Show AI cards and limited history */}
            <CardsContainer>
          {/* AI Check Card */}
          <AICard>
            <CardContent>
              <CardHeader>
                <CardIcon className="check">🔍</CardIcon>
                <div>
                  <CardTitle>AI Check</CardTitle>
                  <CardDescription>
                    Get instant feedback on the clothing item you want to buy
                  </CardDescription>
                </div>
              </CardHeader>
            
            {/* 2-Column Layout */}
            <AICheckContent>
              {/* Left Column - Upload Area */}
              <UploadArea>
                <UploadIcon>☁️</UploadIcon>
                <UploadText>Upload a photo</UploadText>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  id="photo-upload"
                />
                <label htmlFor="photo-upload" style={{ cursor: 'pointer', position: 'absolute', width: '100%', height: '100%', top: 0, left: 0 }} />
              </UploadArea>
              
              {/* Right Column - Controls */}
              <ControlsArea>
                {/* Image Link Input */}
                <InputSection>
                  <InputLabel>Or paste image link:</InputLabel>
                  <TextInput
                    value={imageLink}
                    onChange={(e) => setImageLink(e.target.value)}
                    placeholder="https://example.com/your-image.jpg"
                  />
                </InputSection>
                
                {/* Action Buttons */}
                <ButtonGroup>
                  <SecondaryButton>
                    ❤️ Select from Wishlist
                  </SecondaryButton>
                  <PrimaryButton
                    onClick={handleCheckItem}
                    disabled={isLoading || (!imageLink.trim())}
                  >
                    {isLoading ? 'Analyzing...' : '📷 Start AI Check'}
                  </PrimaryButton>
                </ButtonGroup>
              </ControlsArea>
            </AICheckContent>
            
            {/* Error Message */}
            {error && (
              <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '1rem' }}>
                {error}
              </div>
            )}
            
            {/* Check Response */}
            {itemCheckResponse && (
              <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
                <h4 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem' }}>AI Analysis</h4>
                <p style={{ color: '#4b5563', lineHeight: '1.6' }}>{itemCheckResponse}</p>
              </div>
            )}
            </CardContent>
          </AICard>
          
          {/* AI Recommendation Card */}
          <AICard>
            <CardContent>
              <CardHeader>
                <CardIcon className="recommendation">🪄</CardIcon>
                <div>
                  <CardTitle>AI Recommendation</CardTitle>
                  <CardDescription>
                    Discover new looks you'll love.
                  </CardDescription>
                </div>
              </CardHeader>

            {/* Descriptive Text */}
            <CardDescription style={{ marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: '1.6' }}>
              AI analyzes your wardrobe and lifestyle to recommend items worth adding.
            </CardDescription>

            {/* Season and Scenario Dropdowns */}
            <DropdownContainer>
              <InputSection>
                <InputLabel>Season</InputLabel>
                <Select
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(e.target.value)}
                >
                  <option value="all">All Seasons</option>
                  <option value={Season.SPRING}>Spring</option>
                  <option value={Season.SUMMER}>Summer</option>
                  <option value={Season.FALL}>Fall</option>
                  <option value={Season.WINTER}>Winter</option>
                </Select>
              </InputSection>
              
              <InputSection>
                <InputLabel>Scenario</InputLabel>
                <Select
                  value={selectedScenario}
                  onChange={(e) => setSelectedScenario(e.target.value)}
                >
                  <option value="all">All Scenarios</option>
                  {loadingScenarios ? (
                    <option disabled>Loading scenarios...</option>
                  ) : (
                    scenarioOptions.map(scenario => (
                      <option key={scenario} value={scenario}>
                        {scenario}
                      </option>
                    ))
                  )}
                </Select>
              </InputSection>
            </DropdownContainer>
            
            {/* Error Message */}
            {error && (
              <div style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '1rem' }}>
                {error}
              </div>
            )}
            

            
            {/* Single Green Button - Moved to Bottom */}
            <ButtonGroup>
              <PrimaryButton
                onClick={handleGetRecommendation}
                disabled={isLoading}
                style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
              >
                {isLoading ? 'Generating...' : '📍 Get a Recommendation'}
              </PrimaryButton>
            </ButtonGroup>
            </CardContent>
          </AICard>
        </CardsContainer>
        
            {/* History Section - Limited Items */}
            <HistorySection>
              <HistoryHeader>
                <HistoryTitle>AI History</HistoryTitle>
                <ViewAllButton onClick={handleViewAllHistory}>View all</ViewAllButton>
              </HistoryHeader>
              <HistoryList>
                {limitedHistoryItems.map((item) => (
                  <HistoryItem key={item.id}>
                    <CardIcon className={item.type}>{getHistoryIcon(item.type)}</CardIcon>
                    <HistoryContent>
                      <HistoryItemTitle>{item.title}</HistoryItemTitle>
                      <HistoryItemDescription>{item.description}</HistoryItemDescription>
                    </HistoryContent>
                    <HistoryTime>{item.time}</HistoryTime>
                  </HistoryItem>
                ))}
              </HistoryList>
            </HistorySection>
          </>
        )}
      </PageContainer>
    </>
  );
};

export default AIAssistantPage;
