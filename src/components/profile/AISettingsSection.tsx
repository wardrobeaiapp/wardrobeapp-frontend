import React, { useState } from 'react';
import Button from '../../components/Button';
import {
  ContentHeader,
  FormGroup,
  Label,
  Select,
  Textarea,
  ToggleContainer,
  ToggleLabel,
  ToggleSwitch,
  ButtonContainer
} from '../../pages/ProfilePage.styles';

interface AISettingsProps {
  initialData: {
    preferredModel: string;
    enablePersonalization: boolean;
    saveHistory: boolean;
    dataSharing: boolean;
    customPrompts: string;
  };
  onSave: (data: any) => void;
  onReset: () => void;
}

const AISettingsSection: React.FC<AISettingsProps> = ({ initialData, onSave, onReset }) => {
  const [aiSettings, setAiSettings] = useState({
    preferredModel: initialData.preferredModel,
    enablePersonalization: initialData.enablePersonalization,
    saveHistory: initialData.saveHistory,
    dataSharing: initialData.dataSharing,
    customPrompts: initialData.customPrompts
  });

  const handleSave = () => {
    onSave(aiSettings);
  };

  return (
    <>
      <ContentHeader>AI Settings</ContentHeader>
      
      <FormGroup>
        <Label htmlFor="preferredModel">Preferred AI Model</Label>
        <Select 
          id="preferredModel" 
          value={aiSettings.preferredModel}
          onChange={(e) => setAiSettings({...aiSettings, preferredModel: e.target.value})}
        >
          <option value="Claude">Claude</option>
          <option value="GPT-4">GPT-4</option>
          <option value="Basic">Basic (Faster)</option>
        </Select>
      </FormGroup>
      
      <ToggleContainer>
        <ToggleLabel>Enable Personalization</ToggleLabel>
        <ToggleSwitch>
          <input 
            type="checkbox" 
            checked={aiSettings.enablePersonalization}
            onChange={(e) => setAiSettings({...aiSettings, enablePersonalization: e.target.checked})}
          />
          <span></span>
        </ToggleSwitch>
      </ToggleContainer>
      
      <ToggleContainer>
        <ToggleLabel>Save AI Interaction History</ToggleLabel>
        <ToggleSwitch>
          <input 
            type="checkbox" 
            checked={aiSettings.saveHistory}
            onChange={(e) => setAiSettings({...aiSettings, saveHistory: e.target.checked})}
          />
          <span></span>
        </ToggleSwitch>
      </ToggleContainer>
      
      <ToggleContainer>
        <ToggleLabel>Share Data for AI Improvement</ToggleLabel>
        <ToggleSwitch>
          <input 
            type="checkbox" 
            checked={aiSettings.dataSharing}
            onChange={(e) => setAiSettings({...aiSettings, dataSharing: e.target.checked})}
          />
          <span></span>
        </ToggleSwitch>
      </ToggleContainer>
      
      <FormGroup>
        <Label htmlFor="customPrompts">Custom AI Prompts</Label>
        <Textarea 
          id="customPrompts" 
          value={aiSettings.customPrompts}
          onChange={(e) => setAiSettings({...aiSettings, customPrompts: e.target.value})}
          placeholder="Enter custom prompts for AI interactions"
        />
      </FormGroup>
      
      <ButtonContainer>
        <Button onClick={onReset}>Reset to Default</Button>
        <Button primary onClick={handleSave}>Save Changes</Button>
      </ButtonContainer>
    </>
  );
};

export default AISettingsSection;
