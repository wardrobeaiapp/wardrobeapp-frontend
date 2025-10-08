import styled from 'styled-components';
import { DetailLabel, DetailValue } from '../../../wardrobe/modals/modalCommon.styles';

export const AnalysisText = styled.div`
  color: #4b5563;
  line-height: 1.6;
  font-size: 1rem;
  margin: 0 0 1.5rem 0;
  white-space: pre-line;
  
  /* Style for bold section headers */
  strong {
    font-weight: 600;
    color: #1f2937;
    display: block;
    margin: 1rem 0 0.5rem 0;
    
    &:first-child {
      margin-top: 0;
    }
  }
  
  /* Style for bullet points */
  & > * {
    margin: 0;
  }
`;

export const ScoreDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const RecommendationBox = styled.div<{
  $isRecommend?: boolean;
  $isMediumScore?: boolean;
}>`
  width: 100%;
  padding: 16px;
  margin: 16px 0;
  border-radius: 8px;
  border: 2px solid;
  text-align: center;
  
  /* Conditional styling based on recommendation type */
  ${({ $isRecommend, $isMediumScore }) => {
    if ($isRecommend) {
      return `
        background-color: #ecfdf5;
        border-color: #d1fae5;
        color: #059669;
      `;
    } else if ($isMediumScore) {
      return `
        background-color: #fefce8;
        border-color: #fde68a;
        color: #d97706;
      `;
    } else {
      return `
        background-color: #fef2f2;
        border-color: #fecaca;
        color: #dc2626;
      `;
    }
  }}
`;

export const RecommendationLabel = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 4px;
`;

export const RecommendationText = styled.div`
  font-size: 1rem;
  font-weight: bold;
  line-height: 1.4;
`;

export const RecommendationSubText = styled(RecommendationText)`
  margin-top: 8px;
  font-size: 0.9em;
  opacity: 0.9;
`;

export const ImageContainer = styled.div`
  margin-bottom: 16px;
  text-align: center;
  padding: 8px;
`;

export const PreviewImage = styled.img`
  max-width: 100%;
  max-height: 240px;
  object-fit: contain;
  border-radius: 8px;
`;

export const ErrorLabel = styled(DetailLabel)`
  color: #e11d48;
`;

export const ErrorValue = styled(DetailValue)`
  color: #e11d48;
`;

export const ErrorDetails = styled(DetailValue)`
  color: #e11d48;
  font-size: 0.9rem;
`;

export const ScoreValue = styled(DetailValue)`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

/* Outfit Analysis Styles */
export const OutfitAnalysisContainer = styled.div`
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
`;

export const OutfitAnalysisHeader = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
`;

export const OutfitScenarioContainer = styled.div`
  margin-bottom: 1.5rem;
`;

export const OutfitScenarioHeader = styled.div`
  font-weight: 700;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 1rem;
`;

export const OutfitList = styled.div`
  margin-left: 2rem;
`;

export const OutfitItem = styled.div`
  padding: 0.25rem 0;
  color: #6b7280;
  font-size: 0.9rem;
`;

export const IncompleteScenarios = styled.div`
  font-weight: 700;
  margin-bottom: 0.5rem;
  font-size: 1rem;
`;

export const IncompleteScenarioItem = styled.div`
  span {
    font-weight: 400;
    color: #6b7280;
    font-size: 0.9rem;
  }
`;

/* Compatible Items Styles */
export const CompatibleItemsContainer = styled.div`
  margin-bottom: 16px;
`;

export const CompatibleItemsHeader = styled.h4`
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #374151;
`;

export const CompatibleCategoryContainer = styled.div`
  margin-bottom: 12px;
`;

export const CompatibleCategoryTitle = styled.h5`
  margin: 0 0 6px 0;
  font-size: 14px;
  color: #6b7280;
  text-transform: capitalize;
`;

export const CompatibleCategoryContent = styled.div`
  padding-left: 12px;
`;

export const CompatibleItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.75rem;
  margin-top: 8px;
`;

export const CompatibleItemText = styled.div`
  font-size: 14px;
  color: #374151;
  margin-bottom: 4px;
`;
