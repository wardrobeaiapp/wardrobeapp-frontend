import styled from 'styled-components';

// Styled Components for Grid Layout
export const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 20px;
  width: 100%;
  box-sizing: border-box;
  padding: 0;
  background: transparent;
  border: none;
`;

export const GridItem = styled.div`
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  position: relative;
  border: none;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  margin: 0;
  display: flex;
  flex-direction: column;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

export const StylePreferencesItem = styled(GridItem)`
  background-color: #f8f0ff;
`;

export const ClimateItem = styled(GridItem)`
  background-color: #fff8f0;
`;

export const WardrobeGoalsItem = styled(GridItem)`
  background-color: #f0fffc;
`;

export const ShoppingLimitItem = styled(GridItem)`
  background-color: #fff0f8;
`;

export const ClothingBudgetItem = styled(GridItem)`
  background-color: #f9f9f9;
`;

export const ItemTitle = styled.h3`
  font-size: 18px;
  margin-bottom: 8px;
  font-weight: 600;
`;

export const ItemDescription = styled.p`
  font-size: 14px;
  color: #555;
  margin-bottom: 0;
`;

export const IconContainer = styled.div`
  font-size: 24px;
  margin-bottom: 16px;
  color: #333;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const SaveMessage = styled.span`
  color: #34A853;
  font-size: 14px;
  margin-left: 10px;
`;

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  gap: 10px;
`;
