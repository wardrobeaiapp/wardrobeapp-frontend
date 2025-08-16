import styled from 'styled-components';

export const ItemDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem 1.5rem;
  align-items: start;
  
  @media (max-width: 767px) {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
`;

export const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
`;

export const Tag = styled.span`
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.025em;
  box-shadow: 0 2px 4px rgba(139, 92, 246, 0.3);
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(139, 92, 246, 0.4);
  }
`;
