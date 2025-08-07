import React from 'react';
import Button from '../Button';
import { WardrobeItem, ClaudeResponse } from '../../types';
import {
  ResponseContainer,
  ResponseTitle,
  OutfitCard,
  OutfitName,
  OutfitItems,
  OutfitItem,
  OutfitDetails,
  OutfitDetail,
  StyleAdvice,
  StyleAdviceTitle,
  StyleAdviceText
} from '../../pages/AIAssistantPage.styles';

interface RecommendationResponseProps {
  recommendationResponse: ClaudeResponse;
  wardrobeItems: WardrobeItem[];
  handleSaveOutfit: () => void;
}

const RecommendationResponse: React.FC<RecommendationResponseProps> = ({
  recommendationResponse,
  wardrobeItems,
  handleSaveOutfit
}) => {
  return (
    <ResponseContainer>
      <ResponseTitle>AI Recommendation</ResponseTitle>
      
      {recommendationResponse.outfitSuggestion && (
        <OutfitCard>
          <OutfitName>{recommendationResponse.outfitSuggestion.name}</OutfitName>
          
          <OutfitItems>
            {recommendationResponse.outfitSuggestion.items.map(itemId => {
              const item = wardrobeItems.find(i => i.id === itemId);
              return (
                <OutfitItem key={itemId}>
                  {item ? item.name : `Unknown item (${itemId})`}
                </OutfitItem>
              );
            })}
          </OutfitItems>
          
          <OutfitDetails>
            {recommendationResponse.outfitSuggestion.occasion && (
              <OutfitDetail>
                <strong>Occasion:</strong> {recommendationResponse.outfitSuggestion.occasion}
              </OutfitDetail>
            )}
            
            {recommendationResponse.outfitSuggestion.season && (
              <OutfitDetail>
                <strong>Season:</strong> {recommendationResponse.outfitSuggestion.season.join(', ')}
              </OutfitDetail>
            )}
          </OutfitDetails>
          
          <Button primary onClick={handleSaveOutfit}>
            Save Outfit
          </Button>
        </OutfitCard>
      )}
      
      {recommendationResponse.styleAdvice && (
        <StyleAdvice>
          <StyleAdviceTitle>Style Advice</StyleAdviceTitle>
          <StyleAdviceText>{recommendationResponse.styleAdvice}</StyleAdviceText>
        </StyleAdvice>
      )}
      
      {recommendationResponse.message && !recommendationResponse.outfitSuggestion && (
        <p>{recommendationResponse.message}</p>
      )}
    </ResponseContainer>
  );
};

export default RecommendationResponse;
