import React from 'react';
import { WardrobeItem } from '../../types';
import {
  ResponseContainer,
  ResponseTitle,
  StyleAdvice,
  StyleAdviceTitle,
  StyleAdviceText
} from '../../pages/AIAssistantPage.styles';

interface CapsuleResponseProps {
  capsuleResponse: {
    message?: string;
    items?: WardrobeItem[];
    styleAdvice?: string;
  };
}

const CapsuleResponse: React.FC<CapsuleResponseProps> = ({ capsuleResponse }) => {
  return (
    <ResponseContainer>
      <ResponseTitle>Your Capsule Wardrobe</ResponseTitle>
      
      {capsuleResponse.message && (
        <p>{capsuleResponse.message}</p>
      )}
      
      {capsuleResponse.items && (
        <div>
          <h3>Capsule Items ({capsuleResponse.items.length})</h3>
          <ul>
            {capsuleResponse.items.map((item) => (
              <li key={item.id}>{item.name} - {item.category}</li>
            ))}
          </ul>
        </div>
      )}
      
      {capsuleResponse.styleAdvice && (
        <StyleAdvice>
          <StyleAdviceTitle>Style Advice</StyleAdviceTitle>
          <StyleAdviceText>{capsuleResponse.styleAdvice}</StyleAdviceText>
        </StyleAdvice>
      )}
    </ResponseContainer>
  );
};

export default CapsuleResponse;
