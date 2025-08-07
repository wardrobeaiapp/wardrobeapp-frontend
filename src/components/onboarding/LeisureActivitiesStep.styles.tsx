import styled from 'styled-components';

// Frequency controls container
export const FrequencyControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
`;

// Frequency input field
export const FrequencyInput = styled.input`
  width: 60px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
  background-color: #f8f9fa;
  
  &:focus {
    outline: none;
    border-color: #4285f4;
    background-color: white;
  }
`;

// Frequency select dropdown
export const FrequencySelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  background-color: #f8f9fa;
  
  &:focus {
    outline: none;
    border-color: #4285f4;
    background-color: white;
  }
  
  &:hover {
    border-color: #4285f4;
  }
`;
