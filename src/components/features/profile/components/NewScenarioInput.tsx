import React from 'react';
import { theme } from '../../../../styles/theme';

interface NewScenarioInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

const NewScenarioInput: React.FC<NewScenarioInputProps> = ({
  value,
  onChange,
  onSubmit,
  onCancel,
  inputRef
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSubmit();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center' }}>
      <input
        ref={inputRef}
        type="text"
        id="new-scenario-input"
        name="newScenarioName"
        placeholder="Enter scenario name (e.g., Office Work, Social Event)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ 
          flex: 1, 
          padding: '0.5rem', 
          borderRadius: '4px', 
          border: '1px solid #ccc' 
        }}
        onKeyDown={handleKeyDown}
      />
      <button
        onClick={onSubmit}
        style={{ 
          marginLeft: '0.5rem', 
          padding: '0.5rem 1rem', 
          borderRadius: '4px', 
          backgroundColor: theme.colors.primary, 
          color: 'white', 
          border: `1px solid ${theme.colors.primary}`, 
          cursor: 'pointer' 
        }}
      >
        Add
      </button>
      <button
        onClick={onCancel}
        style={{ 
          marginLeft: '0.5rem', 
          padding: '0.5rem 1rem', 
          borderRadius: '4px', 
          backgroundColor: '#f3f4f6', 
          color: '#374151', 
          border: '1px solid #d1d5db', 
          cursor: 'pointer' 
        }}
      >
        Cancel
      </button>
    </div>
  );
};

export default NewScenarioInput;
