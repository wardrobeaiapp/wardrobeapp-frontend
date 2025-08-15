import styled from 'styled-components';

/**
 * Centralized PageContainer for main application pages
 * Used across: AIAssistant, Home, Calendar, Profile pages
 * Provides consistent max-width, centering, and responsive padding
 */
export const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;

  /* Responsive padding adjustments */
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

export default PageContainer;
