import React from 'react';
import {
  LoadingContainer,
  ErrorContainer
} from '../../pages/AIAssistantPage.styles';

interface StatusMessagesProps {
  isLoading: boolean;
  loadingMessage: string;
  error: string | null;
}

const StatusMessages: React.FC<StatusMessagesProps> = ({ 
  isLoading, 
  loadingMessage, 
  error 
}) => {
  return (
    <>
      {isLoading && (
        <LoadingContainer>
          <p>{loadingMessage}</p>
        </LoadingContainer>
      )}
      
      {error && (
        <ErrorContainer>
          <p>{error}</p>
        </ErrorContainer>
      )}
    </>
  );
};

export default StatusMessages;
