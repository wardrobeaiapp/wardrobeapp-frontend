import React from 'react';
import { SeasonTag as Styled } from './SeasonTag.styles';

interface SeasonTagProps {
  season: string;
  className?: string;
}

const normalizeSeason = (season: string): string => {
  return season.toLowerCase();
};

const SeasonTag: React.FC<SeasonTagProps> = ({ season, className }) => {
  const normalizedSeason = normalizeSeason(season);
  
  return (
    <Styled 
      className={className}
      data-season={normalizedSeason}
    >
      {normalizedSeason}
    </Styled>
  );
};

export default SeasonTag;
