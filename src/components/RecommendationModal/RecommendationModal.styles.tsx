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
  max-width: 500px;
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
  margin: 0 0 2rem 0;
  font-size: 1rem;
`;

export const ActionButtonsContainer = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
`;

export const SaveButton = styled.button`
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
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
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const SkipButton = styled.button`
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
