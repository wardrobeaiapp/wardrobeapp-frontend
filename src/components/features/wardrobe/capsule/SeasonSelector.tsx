import React from 'react';
import { Season } from '../../../../types';
import {
  FormGroup,
  SeasonCheckboxes,
  CheckboxContainer,
  CheckboxLabel,
  CheckboxInput
} from '../forms/CapsuleForm.styles';

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
            .map((season) => (
              <CheckboxContainer key={season}>
                <CheckboxInput
                  type="checkbox"
                  id={`capsule-season-${season}`}
                  checked={selectedSeasons.includes(season)}
                  onChange={() => onSeasonChange(season)}
                />
                <CheckboxLabel htmlFor={`capsule-season-${season}`}>{season}</CheckboxLabel>
              </CheckboxContainer>
            ))}
        </SeasonCheckboxes>
      </fieldset>
    </FormGroup>
  );
};

export default SeasonSelector;
