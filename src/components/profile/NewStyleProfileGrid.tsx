import React from 'react';
import styled from 'styled-components';

// Icons
import { FaBriefcase } from 'react-icons/fa'; // Daily Activities
import { FaUmbrellaBeach } from 'react-icons/fa'; // Leisure Activities
import { FaTshirt } from 'react-icons/fa'; // Style Preferences
import { FaCloudSun } from 'react-icons/fa'; // Climate
import { FaBullseye } from 'react-icons/fa'; // Wardrobe Goals
import { FaShoppingCart } from 'react-icons/fa'; // Shopping Limit
import { FaDollarSign } from 'react-icons/fa'; // Clothing Budget

// Styled Components
const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 20px;
`;

const GridItem = styled.div`
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

const DailyActivitiesItem = styled(GridItem)`
  background-color: #f0f4ff;
`;

const LeisureActivitiesItem = styled(GridItem)`
  background-color: #f0fff4;
`;

const StylePreferencesItem = styled(GridItem)`
  background-color: #f8f0ff;
`;

const ClimateItem = styled(GridItem)`
  background-color: #fff8f0;
`;

const WardrobeGoalsItem = styled(GridItem)`
  background-color: #f0fffc;
`;

const ShoppingLimitItem = styled(GridItem)`
  background-color: #fff0f8;
`;

const ClothingBudgetItem = styled(GridItem)`
  background-color: #f8fff0;
`;

const ItemTitle = styled.h3`
  font-size: 18px;
  margin-bottom: 8px;
  font-weight: 600;
`;

const ItemDescription = styled.p`
  font-size: 14px;
  color: #555;
  margin-bottom: 0;
`;

const IconContainer = styled.div`
  font-size: 24px;
  margin-bottom: 16px;
  color: #333;
`;

const ChevronRight = styled.div`
  position: absolute;
  top: 50%;
  right: 16px;
  transform: translateY(-50%);
  font-size: 20px;
  color: #999;
`;

interface StyleProfileGridProps {
  onSectionSelect: (section: string) => void;
}

const NewStyleProfileGrid: React.FC<StyleProfileGridProps> = ({ onSectionSelect }) => {
  return (
    <GridContainer>
      <DailyActivitiesItem onClick={() => onSectionSelect('dailyActivities')}>
        <IconContainer>
          <FaBriefcase />
        </IconContainer>
        <ItemTitle>Daily Activities</ItemTitle>
        <ItemDescription>Define your work environment and daily routine</ItemDescription>
        <ChevronRight>›</ChevronRight>
      </DailyActivitiesItem>
      
      <LeisureActivitiesItem onClick={() => onSectionSelect('leisureActivities')}>
        <IconContainer>
          <FaUmbrellaBeach />
        </IconContainer>
        <ItemTitle>Leisure Activities</ItemTitle>
        <ItemDescription>Tell us about your free time and social events</ItemDescription>
        <ChevronRight>›</ChevronRight>
      </LeisureActivitiesItem>
      
      <StylePreferencesItem onClick={() => onSectionSelect('stylePreferences')}>
        <IconContainer>
          <FaTshirt />
        </IconContainer>
        <ItemTitle>Style Preferences</ItemTitle>
        <ItemDescription>Share your personal style and fashion preferences</ItemDescription>
        <ChevronRight>›</ChevronRight>
      </StylePreferencesItem>
      
      <ClimateItem onClick={() => onSectionSelect('climate')}>
        <IconContainer>
          <FaCloudSun />
        </IconContainer>
        <ItemTitle>Climate</ItemTitle>
        <ItemDescription>Set your local climate for better recommendations</ItemDescription>
        <ChevronRight>›</ChevronRight>
      </ClimateItem>
      
      <WardrobeGoalsItem onClick={() => onSectionSelect('wardrobeGoals')}>
        <IconContainer>
          <FaBullseye />
        </IconContainer>
        <ItemTitle>Wardrobe Goals</ItemTitle>
        <ItemDescription>Define your wardrobe objectives and priorities</ItemDescription>
        <ChevronRight>›</ChevronRight>
      </WardrobeGoalsItem>
      
      <ShoppingLimitItem onClick={() => onSectionSelect('shoppingLimit')}>
        <IconContainer>
          <FaShoppingCart />
        </IconContainer>
        <ItemTitle>Shopping Limit</ItemTitle>
        <ItemDescription>Set your shopping frequency and preferences</ItemDescription>
        <ChevronRight>›</ChevronRight>
      </ShoppingLimitItem>
      
      <ClothingBudgetItem onClick={() => onSectionSelect('clothingBudget')}>
        <IconContainer>
          <FaDollarSign />
        </IconContainer>
        <ItemTitle>Clothing Budget</ItemTitle>
        <ItemDescription>Configure your monthly clothing budget</ItemDescription>
        <ChevronRight>›</ChevronRight>
      </ClothingBudgetItem>
    </GridContainer>
  );
};

export default NewStyleProfileGrid;
