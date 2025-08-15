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
