import React from 'react';
import {
  RecommendationBox,
  RecommendationLabel,
  RecommendationText,
  RecommendationSubText,
} from './AICheckResultModal.styles';

interface RecommendationSectionProps {
  recommendationAction?: string;
  recommendationText?: string;
  score?: number;
}

const RecommendationSection: React.FC<RecommendationSectionProps> = ({
  recommendationAction,
  recommendationText,
  score
}) => {
  if (!recommendationAction) {
    return null;
  }

  const recommendation = recommendationAction.toLowerCase();
  const isRecommend = recommendation.startsWith('recommend');
  const isMediumScore = score !== undefined && score >= 4 && score <= 8 && !isRecommend;
  
  return (
    <RecommendationBox
      $isRecommend={isRecommend}
      $isMediumScore={isMediumScore}
    >
      <RecommendationLabel>
        Final Recommendation
      </RecommendationLabel>
      <RecommendationText>
        {recommendationAction}
      </RecommendationText>
      {recommendationText && (
        <RecommendationSubText>
          {recommendationText}
        </RecommendationSubText>
      )}
    </RecommendationBox>
  );
};

export default RecommendationSection;
