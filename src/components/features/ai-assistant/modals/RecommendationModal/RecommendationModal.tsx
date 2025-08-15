import React from 'react';
import { UserActionStatus } from '../../../../../types';
import { Modal, ModalAction, ModalBody } from '../../../../common/Modal';
import styled from 'styled-components';

const RecommendationText = styled.div`
  font-size: 1rem;
  color: #374151;
  line-height: 1.6;
`;

interface RecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendation: string;
  userActionStatus?: UserActionStatus;
  onSave: () => void;
  onSkip: () => void;
  onApply?: () => void;
}

const RecommendationModal: React.FC<RecommendationModalProps> = ({
  isOpen,
  onClose,
  recommendation,
  userActionStatus,
  onSave,
  onSkip,
  onApply
}) => {
  const handleSave = () => {
    onSave();
    onClose();
  };

  const handleSkip = () => {
    onSkip();
    onClose();
  };

  const handleApply = () => {
    onApply?.();
    onClose();
  };

  const isSavedRecommendation = userActionStatus === UserActionStatus.SAVED;

  const actions: ModalAction[] = isSavedRecommendation ? [
    {
      label: 'Applied',
      onClick: handleApply,
      variant: 'primary',
      fullWidth: true
    },
    {
      label: 'Dismiss',
      onClick: handleSkip,
      variant: 'secondary',
      fullWidth: true
    }
  ] : [
    {
      label: 'Save',
      onClick: handleSave,
      variant: 'primary',
      fullWidth: true
    },
    {
      label: 'Dismiss',
      onClick: handleSkip,
      variant: 'secondary',
      fullWidth: true
    }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🎯 AI Recommendation"
      actions={actions}
      size="md"
    >
      <ModalBody>
        <RecommendationText>
          {recommendation}
        </RecommendationText>
      </ModalBody>
    </Modal>
  );
};

export default RecommendationModal;
