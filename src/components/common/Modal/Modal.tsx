import React, { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import Button from '../Button';
import {
  ModalBackdrop,
  ModalContainer,
  ModalContent,
  ModalHeader,
  ModalTitle,
  CloseButton,
  ModalBody,
  ModalFooter
} from './Modal.styles';

export interface ModalAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  fullWidth?: boolean;
  outlined?: boolean;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  actions?: ModalAction[];
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  actions,
  size = 'md',
  showCloseButton = true,
  closeOnBackdropClick = true,
  className
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnBackdropClick) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const modalContent = (
    <ModalBackdrop onClick={handleBackdropClick} onKeyDown={handleKeyDown} tabIndex={-1}>
      <ModalContainer>
        <ModalContent size={size} className={className}>
          {(title || showCloseButton) && (
            <ModalHeader>
              {title && <ModalTitle>{title}</ModalTitle>}
              {showCloseButton && (
                <CloseButton onClick={onClose} aria-label="Close modal">
                  &times;
                </CloseButton>
              )}
            </ModalHeader>
          )}
          
          <ModalBody hasHeader={!!(title || showCloseButton)} hasFooter={!!actions}>
            {children}
          </ModalBody>
          
          {actions && actions.length > 0 && (
            <ModalFooter>
              {actions.map((action, index) => {
                // Map modal variants to button variants
                const buttonVariant = action.variant === 'danger' ? 'error' : (action.variant || 'primary');
                
                return (
                  <Button
                    key={index}
                    variant={buttonVariant}
                    onClick={action.onClick}
                    disabled={action.disabled}
                    fullWidth={action.fullWidth}
                    outlined={action.outlined}
                  >
                    {action.label}
                  </Button>
                );
              })}
            </ModalFooter>
          )}
        </ModalContent>
      </ModalContainer>
    </ModalBackdrop>
  );

  // Render modal in a portal to ensure it appears above other content
  return createPortal(modalContent, document.body);
};

export default Modal;
