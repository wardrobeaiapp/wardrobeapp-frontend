import styled from 'styled-components';

export const Card = styled.div`
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  position: relative;
`;

export const OutfitName = styled.h3`
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
`;

export const OutfitDetail = styled.p`
  margin: 0.25rem 0;
  font-size: 0.9rem;
  color: #4b5563;
`;

export const ButtonsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

export const ActionButton = styled.button`
  background: none;
  border: 1px solid #e5e7eb;
  border-radius: 0.25rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #f3f4f6;
  }
`;

export const EditButton = styled(ActionButton)`
  color: #4f46e5;
  border-color: #4f46e5;

  &:hover {
    background-color: #eef2ff;
  }
`;

export const DeleteButton = styled(ActionButton)`
  color: #dc2626;
  border-color: #dc2626;

  &:hover {
    background-color: #fee2e2;
  }
`;

export const SeasonTag = styled.span`
  display: inline-block;
  background-color: #f3f4f6;
  border-radius: 9999px;
  padding: 0.2rem 0.5rem;
  font-size: 0.75rem;
  margin-right: 0.25rem;
  margin-bottom: 0.25rem;
`;

export const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
`;

export const OccasionTag = styled(SeasonTag)`
  background-color: #eef2ff;
  color: #4f46e5;
`;
