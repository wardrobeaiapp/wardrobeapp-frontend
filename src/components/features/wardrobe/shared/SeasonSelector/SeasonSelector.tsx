import React from 'react';
import styled from 'styled-components';
import { Season } from '../../../../../types';
import { Checkbox, FormField } from '../../../../../components/common/Form';

const SeasonCheckboxes = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 1.5rem;
  margin-top: 0.5rem;
  overflow-x: auto;
  padding-bottom: 4px;
  
  /* Hide scrollbar for Chrome, Safari and Opera */
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  /* Handle */
  &::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 2px;
  }
  
  /* Handle on hover */
  &::-webkit-scrollbar-thumb:hover {
    background: #cbd5e1;
  }
`;

const formatSeason = (season: string): string => {
  return season.charAt(0).toUpperCase() + season.slice(1).toLowerCase();
};

export interface SeasonSelectorProps {
  /** Currently selected seasons */
  selectedSeasons: Season[];
  /** Callback when season selection changes */
  onSeasonChange: (season: Season) => void;
  /** Optional namespace for checkbox IDs to prevent collisions */
  namespace?: string;
  /** Whether to show the "All Seasons" option */
  showAllSeasons?: boolean;
  /** Custom label for the fieldset */
  label?: string;
}

const SeasonSelector: React.FC<SeasonSelectorProps> = ({
  selectedSeasons,
  onSeasonChange,
  namespace = 'season',
  showAllSeasons = false,
  label = 'Seasons',
}) => {
  const seasons = Object.values(Season);

  return (
    <FormField
      label={label}
      labelPosition="top"
    >
      <SeasonCheckboxes>
        {seasons.map(season => (
          <Checkbox
            key={season}
            id={`${namespace}-${season}`}
            checked={selectedSeasons.includes(season)}
            onChange={() => onSeasonChange(season)}
            label={formatSeason(season)}
          />
        ))}
      </SeasonCheckboxes>
    </FormField>
  );
};

export default SeasonSelector;
