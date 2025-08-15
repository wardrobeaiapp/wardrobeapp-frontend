import styled from 'styled-components';
import FormStyles from '../components/forms/styles';
import { theme } from '../styles/theme';
import { PageContainer as BasePageContainer } from '../components/layout/PageContainer';

// Consistent width wrapper for all profile sections - acts as a layout container only
export const SectionWrapper = styled.div`
  width: 100%;
  max-width: 900px;
  margin: 0 auto 2rem;
  box-sizing: border-box;
  display: block;
  /* No border, padding, or shadow here - only layout properties */
`;

// Inner content container with styling for profile sections
export const SectionContent = styled.div`
  padding: 1.5rem;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 0; /* No additional margin needed as SectionWrapper already has margin-bottom */
`;

// Styled fieldset with no border for accessibility
export const StyledFieldset = styled.fieldset`
  border: none;
  padding: 0;
  margin: 0;
  min-width: 0;
  
  legend {
    padding: 0;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #374151;
    font-size: 0.875rem;
  }
`;

// ProfilePage uses fixed width instead of responsive max-width
export const PageContainer = styled(BasePageContainer)`
  width: 1200px;
  
  @media (max-width: 1240px) {
    width: 100%;
    max-width: 1200px;
  }
`;

export const SectionHeader = styled.header`
  margin-bottom: 2rem;
`;

export const Title = styled.h1`
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 1rem;
`;

export const Description = styled.p`
  color: #4b5563;
  margin: 0;
`;

export const ProfileLayout = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const Sidebar = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  width: 100%;
  box-sizing: border-box;
`;

export const CategoryList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const CategoryItem = styled.li<{ $active?: boolean }>`
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: ${props => props.$active ? '600' : '400'};
  background-color: ${props => props.$active ? '#f3f4f6' : 'transparent'};
  color: ${props => props.$active ? theme.colors.primary : theme.colors.gray[600]};
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #f9fafb;
  }
`;

export const ContentPanel = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  width: 100%;
  min-width: 0; /* Ensures the panel doesn't overflow its container */
  box-sizing: border-box; /* Ensures padding is included in width calculation */
  max-width: 900px; /* Set a maximum width to ensure consistency */
  justify-self: start; /* Align to the start of the grid cell */
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

export const ContentHeader = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
`;

export const FormGroup = styled(FormStyles.FormGroup)`
  /* Any additional custom styles can be added here */
`;

export const Label = styled(FormStyles.FormLabel)`
  /* Any additional custom styles can be added here */
`;

export const Input = styled(FormStyles.FormInput)`
  /* Any additional custom styles can be added here */
  padding: 0.625rem;
  font-size: 1rem;
`;

export const Select = styled(FormStyles.FormSelect)`
  /* Any additional custom styles can be added here */
  padding: 0.625rem;
  font-size: 1rem;
  position: relative;
  z-index: 50; /* Higher base z-index */
  cursor: pointer;
  pointer-events: auto !important;
  appearance: auto !important;
  -webkit-appearance: auto !important;
  -moz-appearance: auto !important;
  background-color: white;
  
  &:focus,
  &:hover,
  &:active {
    z-index: 1000; /* Higher z-index when focused/active */
    pointer-events: auto !important;
  }
`;

export const Textarea = styled(FormStyles.FormTextarea)`
  /* Any additional custom styles can be added here */
  padding: 0.625rem;
  font-size: 1rem;
`;

export const CheckboxGroup = styled(FormStyles.FormCheckboxGroup)`
  /* Any additional custom styles can be added here */
  margin-bottom: 1rem;
`;

export const Checkbox = styled(FormStyles.FormCheckbox)`
  /* Any additional custom styles can be added here */
`;

export const CheckboxLabel = styled(FormStyles.FormCheckboxLabel)`
  /* Any additional custom styles can be added here */
  color: #4b5563;
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
`;

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
`;

export const Card = styled.div`
  background-color: #f9fafb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  width: 100%;
  box-sizing: border-box;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  /* Removed max-width as it's now handled by SectionWrapper */
  display: block;
`;

export const CardTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem;
`;

export const CardDescription = styled.p`
  color: #4b5563;
  margin: 0 0 1rem;
`;

export const Badge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background-color: #e0f2fe;
  color: #0369a1;
  border-radius: 9999px;
`;

export const PremiumBadge = styled(Badge)`
  background-color: #fef3c7;
  color: #92400e;
`;

export const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
  
  input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: .4s;
    border-radius: 34px;
  }
  
  span:before {
    position: absolute;
    content: "";
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
  }
  
  input:checked + span {
    background-color: ${theme.colors.primary};
  }
  
  input:checked + span:before {
    transform: translateX(26px);
  }
`;

export const ToggleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

export const ToggleLabel = styled.span`
  font-weight: 500;
  color: #374151;
`;

export const RangeSlider = styled.input.attrs({ type: 'range' })`
  width: 100%;
  height: 8px;
  -webkit-appearance: none;
  background: #e5e7eb;
  outline: none;
  border-radius: 4px;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: ${theme.colors.primary};
    cursor: pointer;
  }
  
  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: ${theme.colors.primary};
    cursor: pointer;
    border: none;
  }
`;

export const SliderContainer = styled.div`
  width: 100%;
  margin: 1rem 0;
`;

export const SliderLabels = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
`;

export const SliderLabel = styled.span`
  font-size: 0.875rem;
  color: #6b7280;
`;

export const SectionDivider = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
`;

// Style preferences styled components
export const StyleOptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin: 16px 0;
`;

export const StyleOptionCard = styled.div<{ $selected?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background-color: ${props => props.$selected ? '#f0eaff' : 'white'};
  border: 1px solid ${props => props.$selected ? '#6c5ce7' : '#eaeaea'};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${props => props.$selected ? '0 4px 8px rgba(108, 92, 231, 0.15)' : '0 2px 4px rgba(0, 0, 0, 0.05)'};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-color: ${props => props.$selected ? '#6c5ce7' : '#d0d0d0'};
  }
`;

export const StyleOptionIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  margin-bottom: 12px;
  font-size: 24px;
`;

export const StyleOptionLabel = styled.span`
  font-weight: 500;
  text-align: center;
`;
