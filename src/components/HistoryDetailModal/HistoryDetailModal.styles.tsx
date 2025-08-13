import styled from 'styled-components';

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const ModalContainer = styled.div`
  background: white;
  border-radius: 1rem;
  max-width: 600px;
  width: 90vw;
  max-height: 80vh;
  overflow: auto;
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
`;

export const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  gap: 0.75rem;
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  transition: color 0.2s ease;
  
  &:hover {
    color: #1f2937;
  }
`;

export const ModalBody = styled.div`
  padding: 1.5rem;
`;

export const ModalText = styled.p`
  color: #374151;
  line-height: 1.6;
  margin: 0;
  font-size: 1rem;
`;

export const DetailSection = styled.div`
  margin-bottom: 1.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

export const DetailLabel = styled.div`
  font-weight: 600;
  color: #1f2937;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export const DetailValue = styled.div`
  color: #374151;
  font-size: 1rem;
  line-height: 1.5;
`;

export const ScoreContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const StatusContainer = styled.div`
  display: flex;
  align-items: center;
`;

export const StatusBadge = styled.span<{ $status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
  background: ${props => {
    switch (props.$status) {
      case 'approved':
        return '#dcfce7';
      case 'potential_issue':
        return '#fef3c7';
      case 'not_reviewed':
        return '#f3f4f6';
      default:
        return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'approved':
        return '#166534';
      case 'potential_issue':
        return '#92400e';
      case 'not_reviewed':
        return '#374151';
      default:
        return '#374151';
    }
  }};
`;

export const ActionButtonsContainer = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
`;

export const ActionButton = styled.button`
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  flex: 1;
  transition: all 0.2s ease;

  &:hover {
    background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const DismissButton = styled.button`
  background: #f8fafc;
  color: #475569;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  flex: 1;
  transition: all 0.2s ease;

  &:hover {
    background: #f1f5f9;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(71, 85, 105, 0.1);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const TagsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

export const Tag = styled.span`
  background: #e0e7ff;
  color: #3730a3;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
`;
