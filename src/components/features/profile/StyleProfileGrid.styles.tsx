import styled from 'styled-components';

export const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 20px;
`;

export const GridItem = styled.div`
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  position: relative;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  }
`;

export const DailyActivitiesItem = styled(GridItem)`
  background-color: #f0f4ff;
`;

export const LeisureActivitiesItem = styled(GridItem)`
  background-color: #f0fff4;
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
  background-color: #f8fff0;
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
`;

export const ChevronRight = styled.div`
  position: absolute;
  top: 50%;
  right: 16px;
  transform: translateY(-50%);
  font-size: 20px;
  color: #999;
`;
