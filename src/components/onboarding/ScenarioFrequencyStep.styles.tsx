import styled from 'styled-components';

export const PageContainer = styled.div`
  max-width: 700px;
  margin: 0 auto;
  padding: 0 20px;
`;

export const ScenarioList = styled.div`
  margin: 20px 0 30px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const ScenarioItem = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 20px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #eaeaea;
  margin-bottom: 10px;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

export const ScenarioIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  margin-right: 16px;
  font-size: 24px;
  
  &.computer {
    background-color: #e8f0fe;
    color: #4285f4;
  }
  
  &.home {
    background-color: #e6f4ea;
    color: #34a853;
  }
  
  &.outdoor {
    background-color: #fff8e1;
    color: #fbbc04;
  }
  
  &.social {
    background-color: #f3e8fd;
    color: #a142f4;
  }
`;

export const ScenarioContent = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
  gap: 12px;
`;

export const ScenarioName = styled.div`
  font-weight: 600;
  font-size: 17px;
  color: #333;
`;

export const ScenarioDescription = styled.div`
  font-size: 14px;
  color: #666;
  margin-top: 4px;
  line-height: 1.4;
`;

export const FrequencyControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  margin-left: 64px; /* Aligns with content after the icon */
`;

export const EditControls = styled.div`
  display: flex;
  align-items: center;
  margin-left: 10px;
  gap: 8px;
`;

export const EditField = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
`;

export const EditButton = styled.button`
  background-color: #6c5ce7;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #5649c0;
  }
`;

export const FrequencyInput = styled.input`
  width: 60px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
  background-color: #f8f9fa;
  
  &:focus {
    outline: none;
    border-color: #4285f4;
    background-color: white;
  }
`;

export const FrequencySelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  background-color: #f8f9fa;
  
  &:focus {
    outline: none;
    border-color: #4285f4;
    background-color: white;
  }
  
  &:hover {
    border-color: #4285f4;
  }
`;

export const DeleteButton = styled.button`
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  padding: 10px;
  margin-left: 10px;
  font-size: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    color: #f43f5e;
    background-color: rgba(244, 63, 94, 0.1);
    transform: scale(1.1);
  }
`;

export const AddScenarioButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 16px;
  background-color: white;
  border: 1px dashed #ccc;
  border-radius: 12px;
  color: #666;
  font-weight: 500;
  font-size: 16px;
  cursor: pointer;
  margin-bottom: 30px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #f9f9f9;
  }
`;

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const ModalContent = styled.div`
  background-color: white;
  border-radius: 16px;
  padding: 32px;
  width: 90%;
  max-width: 600px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
`;

export const ModalTitle = styled.h3`
  text-align: center;
  font-size: 1.75rem;
  margin-top: 0;
  margin-bottom: 0.75rem;
  color: #333;
  font-weight: 600;
`;

export const ModalForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  margin-top: 1.5rem;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const ModalFrequencyControls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  justify-content: space-between;
`;

export const FormLabel = styled.label`
  font-size: 1.1rem;
  font-weight: 500;
  color: #333;
  margin-bottom: 0.5rem;
`;

export const FormInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  background-color: #f8f9fa;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #4285f4;
    background-color: white;
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 16px;
  margin-bottom: 8px;
`;

export const CancelButton = styled.button`
  padding: 12px 20px;
  border: none;
  border-radius: 12px;
  background-color: #f5f5f5;
  color: #333;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  
  &:hover {
    background-color: #eaeaea;
  }
`;

export const SaveButton = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  background-color: #6366f1;
  color: white;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background-color: #4f46e5;
  }
`;

export const ButtonsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
`;

export const BackButton = styled.button`
  display: flex;
  align-items: center;
  padding: 12px 20px;
  background-color: #f5f5f5;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: #eaeaea;
  }
`;

export const CompleteButton = styled.button`
  display: flex;
  align-items: center;
  padding: 12px 24px;
  background-color: #6c5ce7;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: #5b4bc4;
  }
  
  svg {
    margin-left: 8px;
  }
`;

export const NoteText = styled.p`
  color: #666;
  font-size: 14px;
  margin-top: 20px;
  font-style: italic;
`;

export const InfoLink = styled.span`
  color: #6c5ce7;
  cursor: pointer;
  text-decoration: underline;
  margin: 0 4px;
  
  &:hover {
    color: #5649c0;
  }
`;

export const SaveIndicator = styled.div`
  display: flex;
  align-items: center;
  margin-top: 16px;
  padding: 12px 16px;
  background-color: #e3f2fd;
  border-radius: 4px;
  border-left: 4px solid #2196f3;
`;

export const SaveIcon = styled.span`
  margin-right: 10px;
  color: #2196f3;
  font-size: 18px;
`;
