import React, { useState } from 'react';
import { useWardrobe } from '../context/WardrobeContext';
import { claudeService } from '../services/claudeService';
import { ClaudeResponse } from '../types';
import PageHeader from '../components/Header/Header';
import {
  PageContainer,
  Title,
  Description,
  OptionsContainer,
  ContentContainer
} from './AIAssistantPage.styles';

// Import extracted components
import AIOptionCard from '../components/AIOptionCard';
import CheckItemForm from '../components/ai-assistant/CheckItemForm';
import CheckItemResponse from '../components/ai-assistant/CheckItemResponse';
import RecommendationForm from '../components/ai-assistant/RecommendationForm';
import RecommendationResponse from '../components/ai-assistant/RecommendationResponse';
import AIHistory from '../components/ai-assistant/AIHistory';
import StatusMessages from '../components/ai-assistant/StatusMessages';

// Define the option types
type AIOption = 'check-item' | 'recommendation' | 'history';

const AIAssistantPage: React.FC = () => {
  const { items, addOutfit } = useWardrobe();
  const [selectedOption, setSelectedOption] = useState<AIOption>('check-item');
  
  // Check Item state
  const [itemToCheck, setItemToCheck] = useState('');
  const [itemCheckResponse, setItemCheckResponse] = useState<string | null>(null);
  
  // AI Recommendation state
  const [occasion, setOccasion] = useState('');
  const [season, setSeason] = useState<string>('');
  const [preferences, setPreferences] = useState('');
  const [recommendationResponse, setRecommendationResponse] = useState<ClaudeResponse | null>(null);
  
  // Shared state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Mock history data - this would be stored in your context or fetched from an API
  const [checkHistory] = useState([
    {
      id: '1',
      date: new Date(2025, 6, 1),
      type: 'check-item',
      title: 'Black Leather Jacket',
      description: 'Versatile piece that works well with casual outfits.'
    },
    {
      id: '2',
      date: new Date(2025, 6, 1),
      type: 'recommendation',
      title: 'Summer Party Outfit',
      description: 'Casual summer party outfit with light colors.'
    },
    {
      id: '3',
      date: new Date(2025, 5, 28),
      type: 'capsule',
      title: 'Summer Capsule Wardrobe',
      description: '10 piece capsule wardrobe for summer season.'
    }
  ]);

  const handleCheckItem = async () => {
    if (!itemToCheck.trim()) {
      setError('Please describe the item you want to check.');
      return;
    }

    setIsLoading(true);
    setError(null);
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
    if (items.length === 0) {
      setError('You need to add some items to your wardrobe first!');
      return;
    }

    if (!occasion.trim()) {
      setError('Please specify an occasion for your outfit recommendation.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setRecommendationResponse(null);

    try {
      const result = await claudeService.getOutfitSuggestions(
        items,
        occasion,
        season,
        preferences
      );
      setRecommendationResponse(result);
    } catch (err) {
      setError('An error occurred while getting outfit recommendations. Please try again.');
      console.error('Error getting outfit recommendations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // handleGenerateCapsule function removed to fix ESLint warning

  const handleSaveOutfit = () => {
    if (recommendationResponse?.outfitSuggestion) {
      addOutfit({
        ...recommendationResponse.outfitSuggestion,
        favorite: false,
      });
      alert('Outfit saved to your collection!');
    }
  };

  // Render the content based on the selected option
  const renderSelectedOptionContent = () => {
    switch (selectedOption) {
      case 'check-item':
        return (
          <>
            <Title>Check an Item</Title>
            <Description>
              Get AI feedback on an item you're considering adding to your wardrobe.
            </Description>
            <CheckItemForm
              itemToCheck={itemToCheck}
              setItemToCheck={setItemToCheck}
              handleCheckItem={handleCheckItem}
              isLoading={isLoading}
            />
            
            <StatusMessages
              isLoading={isLoading}
              loadingMessage="Analyzing your item..."
              error={error}
            />
            
            {itemCheckResponse && (
              <CheckItemResponse response={itemCheckResponse} />
            )}
          </>
        );
        
      case 'recommendation':
        return (
          <>
            <Title>AI Outfit Recommendation</Title>
            <Description>
              Get personalized outfit recommendations from AI based on your wardrobe items.
            </Description>
            <RecommendationForm
              occasion={occasion}
              setOccasion={setOccasion}
              season={season}
              setSeason={setSeason}
              preferences={preferences}
              setPreferences={setPreferences}
              handleGetRecommendation={handleGetRecommendation}
              isLoading={isLoading}
            />
            
            <StatusMessages
              isLoading={isLoading}
              loadingMessage="Generating outfit recommendations..."
              error={error}
            />
            
            {recommendationResponse && (
              <RecommendationResponse
                recommendationResponse={recommendationResponse}
                wardrobeItems={items}
                handleSaveOutfit={handleSaveOutfit}
              />
            )}
          </>
        );
        
      
      case 'history':
        return (
          <>
            <Title>AI Check History</Title>
            <Description>
              View your history of AI wardrobe checks, recommendations, and capsule generations.
            </Description>
            <AIHistory historyItems={checkHistory} />
          </>
        );
        
      default:
        return null;
    }
  };

  return (
    <>
      <PageHeader title="AI Wardrobe Assistant" />
      <PageContainer>
      
      <OptionsContainer>
        <AIOptionCard
          title="Check an Item"
          description="Get AI feedback on an item you're considering"
          isActive={selectedOption === 'check-item'}
          onClick={() => setSelectedOption('check-item')}
        />
        
        <AIOptionCard
          title="Outfit Recommendation"
          description="Get AI outfit recommendations from your wardrobe"
          isActive={selectedOption === 'recommendation'}
          onClick={() => setSelectedOption('recommendation')}
        />
        
        
        <AIOptionCard
          title="History"
          description="View your AI check history"
          isActive={selectedOption === 'history'}
          onClick={() => setSelectedOption('history')}
        />
      </OptionsContainer>
      
      <ContentContainer>
        {renderSelectedOptionContent()}
      </ContentContainer>
    </PageContainer>
    </>
  );
};

export default AIAssistantPage;
