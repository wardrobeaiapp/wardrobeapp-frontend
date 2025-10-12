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
  padding: 0 20px;
  
  @media (max-width: 768px) {
    padding: 0 10px;
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

export const IntroSection = styled.div`
  margin-bottom: 48px;
  
  h2 {
    color: #1f2937;
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 16px;
    text-align: left;
  }
  
  p {
    color: #6b7280;
    line-height: 1.6;
    margin-bottom: 12px;
    text-align: left;
  }
`;

export const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin: 24px 0;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
    margin: 20px 0;
  }
`;

export const FeatureCard = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 16px;
    border-radius: 6px;
  }
  
  .icon {
    font-size: 2rem;
    margin-bottom: 12px;
    
    @media (max-width: 768px) {
      font-size: 1.8rem;
      margin-bottom: 10px;
    }
  }
  
  h4 {
    color: #1e293b;
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 8px;
    
    @media (max-width: 768px) {
      font-size: 1rem;
      margin-bottom: 6px;
    }
  }
  
  p {
    color: #64748b;
    font-size: 0.9rem;
    margin: 0;
    
    @media (max-width: 768px) {
      font-size: 0.85rem;
    }
  }
`;

export const DemoStepsList = styled.ol`
  list-style: none;
  padding: 0;
  margin: 24px 0;
  
  li {
    display: flex;
    align-items: flex-start;
    margin-bottom: 20px;
    text-align: left;
    
    &:before {
      content: counter(step-counter);
      counter-increment: step-counter;
      background: #4f46e5;
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
      font-weight: 600;
      margin-right: 16px;
      flex-shrink: 0;
      margin-top: 2px;
    }
    
    div {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
    }
    
    strong {
      color: #1f2937;
      font-size: 1rem;
      line-height: 1.4;
    }
    
    span {
      color: #6b7280;
      font-size: 0.9rem;
      line-height: 1.5;
    }
    
    @media (max-width: 768px) {
      margin-bottom: 24px;
      
      &:before {
        width: 28px;
        height: 28px;
        font-size: 0.8rem;
        margin-right: 14px;
      }
      
      strong {
        font-size: 0.95rem;
      }
      
      span {
        font-size: 0.85rem;
        margin-top: 2px;
      }
    }
  }
  
  counter-reset: step-counter;
`;

export const PersonaPreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin: 24px 0;
`;

export const PersonaPreviewCard = styled.div`
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  text-align: left;
  transition: all 0.2s;
  cursor: pointer;
  
  &:hover {
    border-color: #4f46e5;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }
  
  .persona-type {
    background: #fef3c7;
    color: #92400e;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    margin-bottom: 12px;
    display: inline-block;
  }
  
  h4 {
    color: #1f2937;
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 8px;
  }
  
  p {
    color: #6b7280;
    margin-bottom: 12px;
    line-height: 1.4;
  }
  
  .stats {
    display: flex;
    gap: 12px;
    font-size: 0.8rem;
    color: #9ca3af;
    
    span {
      background: #f3f4f6;
      padding: 2px 6px;
      border-radius: 3px;
    }
  }
`;

export const CTAButton = styled.button`
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 25px rgba(79, 70, 229, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

// Separate blocks for better organization
export const HeroBlock = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  padding: 48px 40px;
  margin-bottom: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 32px 24px;
    border-radius: 16px;
    margin-bottom: 32px;
  }
`;

export const InfoBlock = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 40px;
  margin-bottom: 32px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  
  @media (max-width: 768px) {
    padding: 24px 20px;
    border-radius: 12px;
  }
  
  h2 {
    color: #1f2937;
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 16px;
    text-align: left;
    margin-top: 0;
    
    @media (max-width: 768px) {
      font-size: 1.3rem;
    }
  }
  
  p {
    color: #6b7280;
    line-height: 1.6;
    margin-bottom: 12px;
    text-align: left;
    
    @media (max-width: 768px) {
      font-size: 0.9rem;
      line-height: 1.7;
    }
  }
`;

export const InstructionsBlock = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-left: 4px solid #4f46e5;
  border-radius: 16px;
  padding: 40px;
  margin-bottom: 32px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  
  @media (max-width: 768px) {
    padding: 24px 20px;
    border-radius: 12px;
  }
  
  h2 {
    color: #1f2937;
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 16px;
    text-align: left;
    margin-top: 0;
    
    @media (max-width: 768px) {
      font-size: 1.3rem;
      margin-bottom: 20px;
    }
  }
`;

export const CTABlock = styled.div`
  text-align: center;
  padding: 20px 0;
`;
