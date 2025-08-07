import React from 'react';
import { ProfileData } from '../../types';

interface DebugProfileDataProps {
  profileData: Partial<ProfileData>;
  showDebug?: boolean;
}

const DebugProfileData: React.FC<DebugProfileDataProps> = ({ 
  profileData, 
  showDebug = false 
}) => {
  if (!showDebug) return null;
  
  return (
    <div style={{ 
      margin: '20px 0', 
      padding: '10px', 
      border: '1px solid #ccc', 
      borderRadius: '4px',
      backgroundColor: '#f5f5f5',
      fontSize: '12px'
    }}>
      <h4>Debug: Current Profile Data</h4>
      <pre>{JSON.stringify(profileData, null, 2)}</pre>
    </div>
  );
};

export default DebugProfileData;
