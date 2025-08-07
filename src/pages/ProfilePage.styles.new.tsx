import styled from 'styled-components';
import * as FormStyles from '../components/Form/Form.styles';
import { FaChevronRight, FaPalette, FaCrown, FaChartLine, FaBell, FaCog } from 'react-icons/fa';
import { FaCalendarDays } from 'react-icons/fa6';

// Keep existing styled components
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

export const PageContainer = styled.div`
  max-width: 1200px;
  width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
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
  grid-template-columns: 1fr 3fr;
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

// New styled components for the redesigned menu
export const Sidebar = styled.div`
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 1rem;
  overflow: hidden;
`;

export const CategoryList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const CategoryItem = styled.li<{ $active?: boolean }>`
  position: relative;
  padding: 0.875rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
  background-color: ${props => props.$active ? '#f0f5ff' : 'transparent'};
  color: ${props => props.$active ? '#3b82f6' : '#4b5563'};
  border-left: ${props => props.$active ? '3px solid #3b82f6' : '3px solid transparent'};
  
  &:hover {
    background-color: ${props => props.$active ? '#f0f5ff' : '#f9fafb'};
  }

  /* Icon container for the category item */
  & > span:first-child {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    margin-right: 0.75rem;
    border-radius: 0.375rem;
    background-color: ${props => props.$active ? '#e0e7ff' : '#f3f4f6'};
    color: ${props => props.$active ? '#3b82f6' : '#6b7280'};
  }

  /* Label for the category item */
  & > span:nth-child(2) {
    flex: 1;
  }

  /* Chevron icon for the category item */
  & > svg {
    opacity: ${props => props.$active ? '1' : '0'};
    color: #3b82f6;
    transition: opacity 0.2s ease;
  }

  &:hover > svg {
    opacity: 1;
  }
`;

export const CategoryIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
`;

export const CategoryLabel = styled.span`
  flex: 1;
`;

export const ContentPanel = styled.div`
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 1.5rem;
`;

export const ContentHeader = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
`;

// Keep existing form styled components
export const FormGroup = styled(FormStyles.FormGroup)`
  /* Any additional custom styles can be added here */
`;

export const Label = styled(FormStyles.FormLabel)`
  /* Any additional custom styles can be added here */
`;

export const Input = styled(FormStyles.FormInput)`
  /* Any additional custom styles can be added here */
`;

export const Select = styled(FormStyles.FormSelect)`
  /* Any additional custom styles can be added here */
`;

export const Button = styled(FormStyles.FormButton)`
  /* Any additional custom styles can be added here */
`;

export const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

export const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f9fafb;
  }
  
  input {
    margin-right: 0.5rem;
  }
`;

export const SectionDivider = styled.div`
  margin: 2rem 0;
  border-top: 1px solid #e5e7eb;
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
