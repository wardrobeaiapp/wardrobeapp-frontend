import React, { useState, useRef, useEffect } from 'react';
import {
  FormGroup,
  Label,
  SectionDivider
} from '../../../pages/ProfilePage.styles';
import styled from 'styled-components';
import { SectionProps } from './types';
import { ClimateData } from '../../../types';
import { climateOptionsWithDetails, climatePreferenceStepContent } from '../../../data/onboardingOptions';

// Define a more specific props interface using ClimateData
interface ClimateSectionProps extends Omit<SectionProps, 'profileData'> {
  profileData: Partial<ClimateData>;
}

// Custom styled components for the dropdown
const SelectWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const StyledSelect = styled.div`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: #111827;
  background-color: white;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  &:focus, &:hover {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
  }
`;

const DropdownList = styled.ul<{ $isOpen: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: white;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  margin-top: 4px;
  padding: 0;
  list-style: none;
  max-height: 200px;
  overflow-y: auto;
  display: ${props => props.$isOpen ? 'block' : 'none'};
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
`;

const DropdownItem = styled.li`
  padding: 0.75rem;
  cursor: pointer;
  
  &:hover {
    background-color: #f3f4f6;
  }
`;

const ArrowIcon = styled.div`
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid #111827;
  margin-left: 8px;
`;

const ClimateSection: React.FC<ClimateSectionProps> = ({
  profileData,
  handleNestedChange
}) => {
  // State for custom dropdown
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string>(profileData.localClimate || '');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update selectedOption when profileData changes
  useEffect(() => {
    setSelectedOption(profileData.localClimate || '');
  }, [profileData.localClimate]);

  // Handle option selection
  const handleOptionSelect = (optionId: string) => {
    console.log('DEBUG - ClimateSection - Selected climate option:', optionId);
    setSelectedOption(optionId);
    setIsOpen(false);
    
    // Use handleNestedChange to update the localClimate field directly
    if (handleNestedChange) {
      // Update localClimate directly as a top-level field
      handleNestedChange('localClimate', '', optionId);
      console.log('DEBUG - ClimateSection - Updated profile data with localClimate using handleNestedChange:', optionId);
    }
  };

  // Find the selected option label
  const selectedOptionLabel = selectedOption 
    ? climateOptionsWithDetails.find(option => option.id === selectedOption)?.label || 'Select climate'
    : 'Select climate';

  return (
    <>
      <SectionDivider>{climatePreferenceStepContent.profileSection.title}</SectionDivider>
      <FormGroup>
        <Label htmlFor="localClimate">{climatePreferenceStepContent.profileSection.localClimateLabel}</Label>
        <SelectWrapper ref={dropdownRef}>
          <StyledSelect 
            id="localClimate"
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-controls="climate-options-listbox"
            aria-labelledby="climate-label"
            tabIndex={0}
            onClick={() => setIsOpen(!isOpen)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsOpen(!isOpen);
              } else if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
              }
            }}
          >
            {selectedOptionLabel}
            <ArrowIcon />
          </StyledSelect>
          <DropdownList 
            id="climate-options-listbox"
            role="listbox"
            aria-labelledby="climate-label"
            $isOpen={isOpen}
          >
            {climateOptionsWithDetails.map(option => (
              <DropdownItem 
                key={option.id} 
                id={`climate-option-${option.id}`}
                role="option"
                aria-selected={selectedOption === option.id}
                tabIndex={isOpen ? 0 : -1}
                onClick={() => handleOptionSelect(option.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleOptionSelect(option.id);
                  }
                }}
              >
                {option.label}
              </DropdownItem>
            ))}
          </DropdownList>
        </SelectWrapper>
      </FormGroup>
    </>
  );
};

export default ClimateSection;
