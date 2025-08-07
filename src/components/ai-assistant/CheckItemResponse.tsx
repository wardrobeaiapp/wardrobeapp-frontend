import React from 'react';
import {
  ResponseContainer,
  ResponseTitle
} from '../../pages/AIAssistantPage.styles';

interface CheckItemResponseProps {
  response: string;
}

const CheckItemResponse: React.FC<CheckItemResponseProps> = ({ response }) => {
  return (
    <ResponseContainer>
      <ResponseTitle>AI Feedback</ResponseTitle>
      <p>{response}</p>
    </ResponseContainer>
  );
};

export default CheckItemResponse;
