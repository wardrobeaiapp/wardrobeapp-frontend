import styled from 'styled-components';

export const DemoPageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
  
  @media (max-width: 768px) {
    padding: 10px;
  }
`;

export const DemoHeader = styled.div`
  max-width: 800px;
  margin: 0 auto 40px;
  text-align: center;
  
  button {
    background: #4f46e5;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s;
    
    &:hover {
      background: #4338ca;
    }
    
    &:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }
  }
`;

export const StepContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 20px;
    margin: 0 10px;
  }
  
  button {
    background: #4f46e5;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 600;
    transition: all 0.2s;
    
    &:hover {
      background: #4338ca;
      transform: translateY(-1px);
    }
    
    &:active {
      transform: translateY(0);
    }
  }
  
  input[type="email"] {
    padding: 12px 16px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 16px;
    margin-right: 12px;
    width: 300px;
    
    @media (max-width: 768px) {
      width: 100%;
      margin-right: 0;
      margin-bottom: 12px;
    }
    
    &:focus {
      outline: none;
      border-color: #4f46e5;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
    }
  }
`;

export const DemoTitle = styled.h1`
  color: #1f2937;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 16px;
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

export const DemoSubtitle = styled.p`
  color: #6b7280;
  font-size: 1.25rem;
  margin-bottom: 32px;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

export const PersonaCard = styled.div`
  border: 2px solid #e5e7eb;
  background: white;
  padding: 24px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  
  &:hover {
    border-color: #4f46e5;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }
  
  h3 {
    color: #1f2937;
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 8px;
  }
  
  p {
    color: #6b7280;
    margin: 0;
    line-height: 1.5;
  }
`;

export const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin: 32px 0;
`;

export const StatCard = styled.div`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  
  h3 {
    color: #dc2626;
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 8px;
  }
  
  p {
    color: #6b7280;
    margin: 0;
    line-height: 1.4;
  }
`;

export const AIResultCard = styled.div`
  border: 1px solid #e5e7eb;
  border-left: 4px solid #dc2626;
  background: #fef2f2;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 16px;
  text-align: left;
  
  h4 {
    color: #1f2937;
    margin-bottom: 12px;
    font-weight: 600;
  }
  
  p {
    margin: 8px 0;
    line-height: 1.5;
    
    &:first-of-type {
      color: #dc2626;
      font-weight: 600;
    }
  }
`;

export const TransformationCard = styled.div`
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  padding: 24px;
  margin: 20px 0;
  
  h3 {
    color: #166534;
    margin-bottom: 16px;
    font-weight: 600;
  }
  
  p {
    color: #15803d;
    margin: 8px 0;
    font-weight: 500;
    
    strong {
      color: #14532d;
    }
  }
`;
