import styled from 'styled-components';

export const StyleOptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  margin: 24px 0;
`;

export const StyleChip = styled.div<{ $selected: boolean }>`
  display: flex;
  flex-direction: row;
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

export const ChipIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  margin-right: 16px;
  font-size: 24px;
  flex-shrink: 0;
`;

export const ChipTextContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

export const ChipLabel = styled.div`
  font-weight: 600;
  font-size: 16px;
  color: #333;
  margin-bottom: 4px;
  text-align: left;
`;

export const ChipDescription = styled.div`
  font-size: 14px;
  color: #666;
  text-align: left;
  line-height: 1.4;
`;

export const SliderSection = styled.div`
  margin-top: 32px;
`;

export const SliderContainer = styled.div`
  margin-bottom: 24px;
`;

export const SliderTitle = styled.div`
  font-weight: 600;
  font-size: 16px;
  color: #333;
  margin-bottom: 12px;
`;

export const SliderTrack = styled.div`
  position: relative;
  height: 6px;
  background-color: #e0e0e0;
  border-radius: 3px;
  margin: 0 8px;
`;

export const SliderInput = styled.input`
  width: 100%;
  -webkit-appearance: none;
  height: 6px;
  background: transparent;
  outline: none;
  margin: 16px 0;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #6c5ce7;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #6c5ce7;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

export const SliderLabels = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
`;

export const SliderLabel = styled.div`
  font-size: 14px;
  color: #666;
  flex: 1;
  
  &:first-child {
    text-align: left;
  }
  
  &:nth-child(2) {
    text-align: center;
  }
  
  &:last-child {
    text-align: right;
  }
`;

export const TextAreaContainer = styled.div`
  margin-top: 32px;
`;

export const StyledTextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  font-size: 15px;
  line-height: 1.5;
  color: #333;
  resize: vertical;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #6c5ce7;
    box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.15);
  }
  
  &::placeholder {
    color: #aaa;
  }
`;
