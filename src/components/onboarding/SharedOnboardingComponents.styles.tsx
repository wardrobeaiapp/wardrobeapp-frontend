import styled from 'styled-components';

// Container for textarea
export const TextAreaContainer = styled.div`
  margin-top: 16px;
  width: 100%;
`;

// Shared styled textarea for all onboarding steps
export const SharedStyledTextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  font-size: 15px;
  line-height: 1.5;
  color: #333;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #6c5ce7;
    box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.15);
  }

  &::placeholder {
    color: #999;
    font-size: 14px;
  }
`;
