import styled from 'styled-components';

export const TestContainer = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  font-family: sans-serif;
`;

export const TestSection = styled.div`
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
`;

export const TestTitle = styled.h2`
  margin-top: 0;
  color: #333;
`;

export const TestButton = styled.button`
  background-color: #4CAF50;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;
  
  &:hover {
    background-color: #45a049;
  }
`;

export const ResultContainer = styled.div`
  margin-top: 15px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
  overflow-x: auto;
`;

export const ResultPre = styled.pre`
  margin: 0;
  white-space: pre-wrap;
`;

export const SuccessText = styled.span`
  color: #4CAF50;
  font-weight: bold;
`;

export const ErrorText = styled.span`
  color: #f44336;
  font-weight: bold;
`;

export const InfoText = styled.span`
  color: #2196F3;
  font-weight: bold;
`;
