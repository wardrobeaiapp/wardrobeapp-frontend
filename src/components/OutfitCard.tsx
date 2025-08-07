import React from 'react';
import { Outfit } from '../types';
import {
  Card,
  OutfitName,
  OutfitDetail,
  ButtonsContainer,
  EditButton,
  DeleteButton,
  SeasonTag,
  TagsContainer,
  OccasionTag
} from './OutfitCard.styles';

interface OutfitCardProps {
  outfit: Outfit;
  onView: (outfit: Outfit) => void;
  onDelete: (id: string) => void;
}

const formatSeasonName = (season: string): string => {
  if (season === 'ALL_SEASON') return 'All Seasons';
  return season.charAt(0).toUpperCase() + season.slice(1).toLowerCase();
};

const OutfitCard: React.FC<OutfitCardProps> = ({ outfit, onView, onDelete }) => {
  return (
    <Card>
      <OutfitName>{outfit.name}</OutfitName>
      
      <TagsContainer>
        {outfit.season.map((season) => (
          <SeasonTag key={season}>{formatSeasonName(season)}</SeasonTag>
        ))}
      </TagsContainer>
      
      {outfit.occasion && (
        <OccasionTag>{outfit.occasion}</OccasionTag>
      )}
      
      <OutfitDetail>Items: {outfit.items.length}</OutfitDetail>
      
      <ButtonsContainer>
        <EditButton onClick={() => onView(outfit)}>View</EditButton>
        <DeleteButton onClick={() => onDelete(outfit.id)}>Delete</DeleteButton>
      </ButtonsContainer>
    </Card>
  );
};

export default OutfitCard;
