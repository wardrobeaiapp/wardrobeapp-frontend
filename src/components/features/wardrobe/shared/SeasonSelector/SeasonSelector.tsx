import React from 'react';
import { Season } from '../../../../../types';
import {
  FormGroup,
  SeasonCheckboxes,
  CheckboxItem as StyledCheckboxItem,
  CheckboxLabel as StyledCheckboxLabel,
} from '../../forms/OutfitForm/OutfitForm.styles';

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
  const seasons = Object.values(Season).filter(
    season => showAllSeasons || season !== Season.ALL_SEASON
  );

  return (
    <FormGroup>
      <fieldset style={{ border: 'none', margin: 0, padding: 0 }}>
        <legend style={{ 
          fontSize: '14px', 
          fontWeight: '600', 
          color: '#374151', 
          marginBottom: '0.25rem', 
          padding: 0, 
          display: 'block' 
        }}>
          {label}
        </legend>
        <SeasonCheckboxes>
          {seasons.map(season => (
            <StyledCheckboxItem key={season}>
              <input
                type="checkbox"
                id={`${namespace}-${season}`}
                checked={selectedSeasons.includes(season)}
                onChange={() => onSeasonChange(season)}
              />
              <StyledCheckboxLabel htmlFor={`${namespace}-${season}`}>
                {season.charAt(0).toUpperCase() + season.slice(1).toLowerCase()}
              </StyledCheckboxLabel>
            </StyledCheckboxItem>
          ))}
        </SeasonCheckboxes>
      </fieldset>
    </FormGroup>
  );
};

export default SeasonSelector;
