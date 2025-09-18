import React from 'react';
import { Season } from '../../../../../types';
import { SelectFilter } from './SelectFilter';

type SeasonFilterProps = {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  className?: string;
  includeAllOption?: boolean;
  allOptionLabel?: string;
};

export const SeasonFilter: React.FC<SeasonFilterProps> = ({
  value,
  onChange,
  id = 'season-filter',
  className,
  includeAllOption = true,
  allOptionLabel = 'All Seasons',
}) => {
  const seasonOptions = Object.values(Season).map(season => ({
    value: season,
    label: formatSeasonForDisplay(season),
  }));

  // Handle the case when 'all' is selected
  const handleChange = (value: string) => {
    // Convert empty string from SelectFilter to 'all' for the parent component
    onChange(value === '' ? 'all' : value);
  };

  // Convert 'all' to empty string for the select element
  const displayValue = value === 'all' ? '' : value;

  return (
    <SelectFilter
      value={displayValue}
      onChange={handleChange}
      label="Season"
      id={id}
      options={seasonOptions}
      className={className}
      // Let SelectFilter handle the 'All' option
      includeAllOption={includeAllOption}
      allOptionLabel={allOptionLabel}
    />
  );
};

function formatSeasonForDisplay(season: string): string {
  // Handle special case for 'spring/fall' - capitalize both words
  if (season === 'spring/fall') {
    return 'Spring/Fall';
  }
  // Handle other seasons normally
  return season.charAt(0).toUpperCase() + season.slice(1).toLowerCase();
}
