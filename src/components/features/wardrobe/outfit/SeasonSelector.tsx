import React from 'react';
import { Season } from '../../../../types';
import {
  FormGroup,
  SeasonCheckboxes,
  CheckboxItem,
  CheckboxLabel
} from '../OutfitForm.styles';

interface SeasonSelectorProps {
  selectedSeasons: Season[];
  onSeasonChange: (season: Season) => void;
}

const SeasonSelector: React.FC<SeasonSelectorProps> = ({
  selectedSeasons,
  onSeasonChange
}) => {
  return (
    <FormGroup>
      <fieldset style={{ border: 'none', margin: 0, padding: 0 }}>
        <legend style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '0.25rem', padding: 0, display: 'block' }}>Seasons</legend>
        <SeasonCheckboxes>
          {Object.values(Season)
            .filter(season => season !== Season.ALL_SEASON)
            .map(season => (
              <CheckboxItem key={season}>
                <input
                  type="checkbox"
                  id={`season-${season}`}
                  checked={selectedSeasons.includes(season)}
                  onChange={() => onSeasonChange(season)}
                />
                <CheckboxLabel htmlFor={`season-${season}`}>
                  {season.charAt(0).toUpperCase() + season.slice(1)}
                </CheckboxLabel>
              </CheckboxItem>
            ))}
        </SeasonCheckboxes>
      </fieldset>
    </FormGroup>
  );
};

export default SeasonSelector;
