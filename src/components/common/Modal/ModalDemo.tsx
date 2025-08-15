import React, { useState } from 'react';
import Modal from './Modal';
import Button from '../Button';

const ModalDemo: React.FC = () => {
  const [showBasicModal, setShowBasicModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showLargeModal, setShowLargeModal] = useState(false);

  return (
    <div style={{ padding: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <h2>Standard Modal Component Demo</h2>
      
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Button onClick={() => setShowBasicModal(true)}>
          Basic Modal
        </Button>
        
        <Button onClick={() => setShowConfirmModal(true)}>
          Confirmation Modal
        </Button>
        
        <Button onClick={() => setShowLargeModal(true)}>
          Large Modal
        </Button>
      </div>

      {/* Basic Modal */}
      <Modal
        isOpen={showBasicModal}
        onClose={() => setShowBasicModal(false)}
        title="Basic Modal"
        size="md"
      >
        <p>This is a basic modal with just a title and content. It demonstrates the standard modal component with default styling.</p>
        <p>You can close this modal by clicking the X button, pressing Escape, or clicking outside the modal.</p>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Action"
        size="sm"
        actions={[
          {
            label: 'Cancel',
            onClick: () => setShowConfirmModal(false),
            variant: 'secondary'
          },
          {
            label: 'Delete',
            onClick: () => {
              alert('Item deleted!');
              setShowConfirmModal(false);
            },
            variant: 'danger'
          }
        ]}
      >
        <p>Are you sure you want to delete this item? This action cannot be undone.</p>
      </Modal>

      {/* Large Modal */}
      <Modal
        isOpen={showLargeModal}
        onClose={() => setShowLargeModal(false)}
        title="Large Modal Example"
        size="lg"
        actions={[
          {
            label: 'Save Changes',
            onClick: () => {
              alert('Changes saved!');
              setShowLargeModal(false);
            },
            variant: 'primary'
          }
        ]}
      >
        <div>
          <h3>Form Example</h3>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Name:</label>
            <input type="text" style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description:</label>
            <textarea 
              rows={4} 
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          <p>This is a larger modal that demonstrates how the component handles more content and form elements.</p>
        </div>
      </Modal>
    </div>
  );
};

export default ModalDemo;
