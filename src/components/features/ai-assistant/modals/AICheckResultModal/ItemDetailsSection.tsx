import React from 'react';
import { FaStar } from 'react-icons/fa';
import { WishlistStatus } from '../../../../../types';
import {
  ItemDetails,
} from '../../../wardrobe/modals/ItemViewModal.styles';
import { 
  ErrorLabel,
  ErrorValue,
  ErrorDetails,
  ScoreValue,
  StatusValue
} from './AICheckResultModal.styles';
import { DetailLabel, DetailRow } from '../../../wardrobe/modals/modalCommon.styles';

interface ItemDetailsSectionProps {
  error?: string;
  errorDetails?: string;
  score?: number;
  status?: WishlistStatus;
}

const ItemDetailsSection: React.FC<ItemDetailsSectionProps> = ({
  error,
  errorDetails,
  score,
  status
}) => {
  // Don't render if no details to show
  if (!error && !errorDetails && score === undefined && !status) {
    return null;
  }

  return (
    <ItemDetails>
      {/* Show error information if present */}
      {error && (
        <DetailRow>
          <ErrorLabel>Error:</ErrorLabel>
          <ErrorValue>
            {error.replace(/_/g, ' ')}
          </ErrorValue>
        </DetailRow>
      )}
      
      {/* Show error details if present */}
      {errorDetails && (
        <DetailRow>
          <ErrorLabel>Details:</ErrorLabel>
          <ErrorDetails>
            {errorDetails}
          </ErrorDetails>
        </DetailRow>
      )}
      
      {score !== undefined && (
        <DetailRow>
          <DetailLabel>Score:</DetailLabel>
          <ScoreValue>
            <FaStar size={14} color="#f59e0b" />
            {score}/10
          </ScoreValue>
        </DetailRow>
      )}
      
      {status && (
        <DetailRow>
          <DetailLabel>Status:</DetailLabel>
          <StatusValue $status={status}>
            {status.replace('_', ' ')}
          </StatusValue>
        </DetailRow>
      )}
    </ItemDetails>
  );
};

export default ItemDetailsSection;
