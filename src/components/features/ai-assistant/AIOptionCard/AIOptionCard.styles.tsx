import styled from 'styled-components';

export const Card = styled.div<{ $active: boolean }>`
  background-color: ${props => props.$active ? '#8b5cf611' : '#f9fafb'};
  border: 2px solid ${props => props.$active ? '#8b5cf6' : '#e5e7eb'};
  border-radius: 0.5rem;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #8b5cf6;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);
  }
`;

export const Title = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem;
`;

export const Description = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
`;
