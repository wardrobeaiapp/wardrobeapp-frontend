import styled from 'styled-components';

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
`;

export const ModalTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  display: flex;
  align-items: center;
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f3f4f6;
    color: #374151;
  }
`;

export const ModalBody = styled.div`
  padding: 1.5rem;
`;

export const AnalysisText = styled.p`
  color: #4b5563;
  line-height: 1.6;
  font-size: 1rem;
  margin: 0 0 1.5rem 0;
`;

export const ScoreStatusContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 1rem 0;
  padding: 1rem;
  background-color: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;

export const ScoreDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const ScoreText = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
`;

export const StatusBadge = styled.span<{ $status: string }>`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
  
  ${({ $status }) => {
    switch ($status) {
      case 'approved':
        return `
          background-color: #dcfce7;
          color: #166534;
          border: 1px solid #bbf7d0;
        `;
      case 'potential_issue':
        return `
          background-color: #fef3c7;
          color: #92400e;
          border: 1px solid #fde68a;
        `;
      case 'not_reviewed':
        return `
          background-color: #f1f5f9;
          color: #475569;
          border: 1px solid #e2e8f0;
        `;
      default:
        return `
          background-color: #f1f5f9;
          color: #475569;
          border: 1px solid #e2e8f0;
        `;
    }
  }}
`;

export const ActionButtonsContainer = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
`;
