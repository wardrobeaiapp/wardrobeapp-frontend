import React, { useState } from 'react';
import { fixUserScenarios } from '../services/fixScenarios';
import Button from './Button';

interface ScenarioFixerProps {
  onScenariosFixed?: () => void;
}

const ScenarioFixer: React.FC<ScenarioFixerProps> = ({ onScenariosFixed }) => {
  const [isFixing, setIsFixing] = useState(false);
  const [isFixed, setIsFixed] = useState(false);

  const handleFixScenarios = async () => {
    try {
      setIsFixing(true);
      setIsFixed(false);
      
      console.log('[ScenarioFixer] Fixing scenarios...');
      const success = await fixUserScenarios();
      
      if (success) {
        console.log('[ScenarioFixer] Scenarios fixed successfully');
        setIsFixed(true);
        
        // Call the callback if provided
        if (onScenariosFixed) {
          onScenariosFixed();
        }
      } else {
        console.error('[ScenarioFixer] Failed to fix scenarios');
      }
    } catch (error) {
      console.error('[ScenarioFixer] Error fixing scenarios:', error);
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div style={{ marginTop: '10px' }}>
      <Button 
        onClick={handleFixScenarios} 
        disabled={isFixing}
        style={{ 
          padding: '5px 10px', 
          fontSize: '0.8rem', 
          backgroundColor: isFixed ? '#4CAF50' : '#2196F3' 
        }}
      >
        {isFixing ? 'Fixing...' : isFixed ? 'Scenarios Fixed!' : 'Fix Missing Scenarios'}
      </Button>
      {isFixed && (
        <div style={{ marginTop: '5px', fontSize: '0.8rem', color: '#4CAF50' }}>
          Scenarios have been fixed! Reload the page to see them.
        </div>
      )}
    </div>
  );
};

export default ScenarioFixer;
