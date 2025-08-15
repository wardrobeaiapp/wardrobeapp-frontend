import styled from 'styled-components';

export const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 1000;
  animation: backdropFadeIn 0.2s ease-out;

  @keyframes backdropFadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

export const ModalContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 1rem;
`;

export const ModalContent = styled.div<{ size?: 'sm' | 'md' | 'lg' | 'xl' }>`
  background-color: white;
  border-radius: 12px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: modalSlideIn 0.3s ease-out;

  ${props => {
    switch (props.size) {
      case 'sm':
        return 'max-width: 400px;';
      case 'lg':
        return 'max-width: 800px;';
      case 'xl':
        return 'max-width: 1200px;';
      default:
        return 'max-width: 600px;';
    }
  }}

  @keyframes modalSlideIn {
    from {
      opacity: 0;
      transform: translateY(-20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: white;
  border-radius: 12px 12px 0 0;
  flex-shrink: 0;
`;

export const ModalTitle = styled.h2`
  font-size: 1.375rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  padding: 0.25rem;
  border-radius: 6px;
  transition: all 0.2s ease;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #1f2937;
    background-color: #f3f4f6;
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  }
`;

export const ModalBody = styled.div<{ hasHeader?: boolean; hasFooter?: boolean }>`
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
  
  ${props => !props.hasHeader && 'padding-top: 2rem;'}
  ${props => !props.hasFooter && 'padding-bottom: 2rem;'}
`;

export const ModalFooter = styled.div`
  padding: 1rem 1.5rem 1.5rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  background-color: white;
  border-radius: 0 0 12px 12px;
  flex-shrink: 0;
`;
