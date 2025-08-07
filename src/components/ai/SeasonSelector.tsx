import React from 'react';
import { Season } from '../../types';
import {
  FormGroup,
  Label,
  SeasonCheckboxes,
  CheckboxItem,
  CheckboxLabel
} from './AIComponents.styles';

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
      <Label>Season</Label>
      <SeasonCheckboxes>
        {Object.values(Season)
          .filter(season => season !== Season.ALL_SEASON)
          .map(season => (
            <CheckboxItem key={season}>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  checked={selectedSeasons.includes(season)}
                  onChange={() => onSeasonChange(season)}
                />
                {season.charAt(0).toUpperCase() + season.slice(1)}
              </CheckboxLabel>
            </CheckboxItem>
          ))}
      </SeasonCheckboxes>
    </FormGroup>
  );
};

export default SeasonSelector;
