import React from 'react';
import { Season } from '../../types';
import {
  FormGroup,
  Label,
  SeasonCheckboxes,
  CheckboxContainer,
  CheckboxLabel
} from '../CapsuleForm.styles';

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
      <Label>Seasons</Label>
      <SeasonCheckboxes>
        {Object.values(Season)
          .filter(season => season !== Season.ALL_SEASON)
          .map((season) => (
            <CheckboxContainer key={season}>
              <input
                type="checkbox"
                id={`season-${season}`}
                checked={selectedSeasons.includes(season)}
                onChange={() => onSeasonChange(season)}
              />
              <CheckboxLabel htmlFor={`season-${season}`}>{season}</CheckboxLabel>
            </CheckboxContainer>
          ))}
      </SeasonCheckboxes>
    </FormGroup>
  );
};

export default SeasonSelector;
