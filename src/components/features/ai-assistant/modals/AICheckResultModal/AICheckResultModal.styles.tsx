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
