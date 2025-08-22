import React from 'react';
import styled, { keyframes } from 'styled-components';
import theme from '../../../styles/theme';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoaderContainer = styled.div`
  position: relative;
  width: 100%;
  padding: 40px;
  text-align: center;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin: 20px 0;
  z-index: 100;
`;

const SpinnerElement = styled.div`
  display: inline-block;
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid ${theme.colors.primaryActive};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoaderText = styled.p`
  margin-top: 16px;
  font-weight: bold;
  color: #333;
  font-size: 16px;
`;

interface LoaderProps {
  text?: string;
}

const Loader: React.FC<LoaderProps> = ({ text = 'Loading...' }) => {
  return (
    <LoaderContainer>
      <SpinnerElement />
      <LoaderText>{text}</LoaderText>
    </LoaderContainer>
  );
};

export default Loader;
