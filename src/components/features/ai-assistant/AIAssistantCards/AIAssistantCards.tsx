import React, { ChangeEvent } from 'react';
import AICheckCard from '../AICheckCard/AICheckCard';
import AIRecommendationCard from '../AIRecommendationCard/AIRecommendationCard';
import { CardsContainer } from '../../../../pages/AIAssistantPage.styles';

interface AIAssistantCardsProps {
  // AI Check props
  imageLink: string;
  onImageLinkChange: (value: string) => void;
  onFileUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onCheckItem: () => Promise<void>;
  onOpenWishlistModal: () => void;
  isCheckLoading: boolean;
  errorType: string;
  itemCheckResponse: string | null;
  isFileUpload: boolean;
  uploadedFile: File | null;
  onProcessedImageChange: (base64Image: string) => void;
  selectedWishlistItem: any;

  // AI Recommendation props
  selectedSeason: string;
  onSeasonChange: (season: string) => void;
  selectedScenario: string;
  onScenarioChange: (scenario: string) => void;
  scenarioOptions: string[];
  isRecommendationLoading: boolean;
  onGetRecommendation: () => Promise<string | null>;
  recommendationError: string;
}

const AIAssistantCards: React.FC<AIAssistantCardsProps> = ({
  // AI Check props
  imageLink,
  onImageLinkChange,
  onFileUpload,
  onCheckItem,
  onOpenWishlistModal,
  isCheckLoading,
  errorType,
  itemCheckResponse,
  isFileUpload,
  uploadedFile,
  onProcessedImageChange,
  selectedWishlistItem,

  // AI Recommendation props
  selectedSeason,
  onSeasonChange,
  selectedScenario,
  onScenarioChange,
  scenarioOptions,
  isRecommendationLoading,
  onGetRecommendation,
  recommendationError,
}) => {
  return (
    <CardsContainer>
      <AICheckCard
        imageLink={imageLink}
        onImageLinkChange={onImageLinkChange}
        onFileUpload={onFileUpload}
        onCheckItem={onCheckItem}
        onOpenWishlistModal={onOpenWishlistModal}
        isLoading={isCheckLoading}
        error={errorType}
        itemCheckResponse={itemCheckResponse}
        isFileUpload={isFileUpload}
        uploadedFile={uploadedFile}
        onProcessedImageChange={onProcessedImageChange}
        isWishlistItem={!!selectedWishlistItem}
      />
      <AIRecommendationCard
        selectedSeason={selectedSeason}
        onSeasonChange={onSeasonChange}
        selectedScenario={selectedScenario}
        onScenarioChange={onScenarioChange}
        scenarioOptions={scenarioOptions}
        loadingScenarios={isRecommendationLoading}
        onGetRecommendation={onGetRecommendation}
        isLoading={isRecommendationLoading}
        error={recommendationError}
      />
    </CardsContainer>
  );
};

export default AIAssistantCards;
