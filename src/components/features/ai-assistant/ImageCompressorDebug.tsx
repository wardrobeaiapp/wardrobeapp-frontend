import React, { useState } from 'react';
import styled from 'styled-components';
import CompressionTester from './CompressionTester';

const DebugContainer = styled.div`
  margin: 20px 0;
  border-top: 1px dashed #ccc;
  padding-top: 20px;
`;

const ToggleButton = styled.button`
  background-color: #f1f1f1;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 5px 10px;
  font-size: 14px;
  cursor: pointer;
  margin-bottom: 10px;
  &:hover {
    background-color: #e0e0e0;
  }
`;

const ImageCompressorDebug: React.FC = () => {
  const [showDebug, setShowDebug] = useState(false);

  return (
    <DebugContainer>
      <ToggleButton onClick={() => setShowDebug(!showDebug)}>
        {showDebug ? 'Hide' : 'Show'} Image Compression Debugger
      </ToggleButton>
      
      {showDebug && (
        <CompressionTester />
      )}
    </DebugContainer>
  );
};

export default ImageCompressorDebug;
