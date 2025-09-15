import styled from 'styled-components';

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
