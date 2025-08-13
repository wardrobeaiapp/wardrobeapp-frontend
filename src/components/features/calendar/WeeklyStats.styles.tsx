import styled from 'styled-components';

export const StatsCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

export const StatsTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem;
`;

export const StatsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const StatLabel = styled.span`
  color: #4b5563;
  font-size: 1rem;
`;

export const StatValue = styled.span<{ color?: string }>`
  font-weight: 600;
  font-size: 1rem;
  color: ${props => props.color || '#1f2937'};
`;
