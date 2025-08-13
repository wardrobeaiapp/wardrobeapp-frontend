import React, { useState } from 'react';
import Button from '../../common/Button';
import {
  ContentHeader,
  FormGroup,
  Label,
  Select,
  Card,
  CardTitle,
  CardDescription,
  CheckboxGroup,
  Checkbox,
  CheckboxLabel,
  ButtonContainer,
  SectionWrapper
} from '../../../pages/ProfilePage.styles';

interface OtherSettingsProps {
  initialData: {
    language: string;
    theme: string;
    dataExport: boolean;
    deleteAccount: boolean;
  };
  onExportData: () => void;
  onDeleteAccount: () => void;
  onSave: (data: any) => void;
}

const OtherSettingsSection: React.FC<OtherSettingsProps> = ({ 
  initialData, 
  onExportData, 
  onDeleteAccount, 
  onSave 
}) => {
  const [otherSettings, setOtherSettings] = useState({
    language: initialData.language,
    theme: initialData.theme,
    dataExport: initialData.dataExport,
    deleteAccount: initialData.deleteAccount
  });

  // handleSave function removed to fix ESLint warning

  return (
    <SectionWrapper>
        <ContentHeader>Other Settings</ContentHeader>
        
        <FormGroup>
        <Label htmlFor="language">Language</Label>
        <Select 
          id="language" 
          value={otherSettings.language}
          onChange={(e) => setOtherSettings({...otherSettings, language: e.target.value})}
        >
          <option value="English">English</option>
          <option value="Spanish">Spanish</option>
          <option value="French">French</option>
          <option value="German">German</option>
          <option value="Japanese">Japanese</option>
        </Select>
      </FormGroup>
      
      <FormGroup>
        <Label htmlFor="theme">Theme</Label>
        <Select 
          id="theme" 
          value={otherSettings.theme}
          onChange={(e) => setOtherSettings({...otherSettings, theme: e.target.value})}
        >
          <option value="Light">Light</option>
          <option value="Dark">Dark</option>
          <option value="System">System Default</option>
        </Select>
      </FormGroup>
      
      <Card>
        <CardTitle>Data & Privacy</CardTitle>
        
        <CheckboxGroup>
          <Checkbox 
            type="checkbox" 
            id="dataExport" 
            checked={otherSettings.dataExport}
            onChange={(e) => setOtherSettings({...otherSettings, dataExport: e.target.checked})}
          />
          <CheckboxLabel htmlFor="dataExport">Export my wardrobe data</CheckboxLabel>
        </CheckboxGroup>
        
        <ButtonContainer>
          <Button onClick={onExportData}>Export Data</Button>
        </ButtonContainer>
      </Card>
      
      <Card>
        <CardTitle>Account Actions</CardTitle>
        <CardDescription>
          Deleting your account will permanently remove all your data. This action cannot be undone.
        </CardDescription>
        
        <CheckboxGroup>
          <Checkbox 
            type="checkbox" 
            id="deleteAccount" 
            checked={otherSettings.deleteAccount}
            onChange={(e) => setOtherSettings({...otherSettings, deleteAccount: e.target.checked})}
          />
          <CheckboxLabel htmlFor="deleteAccount">I understand this action is permanent</CheckboxLabel>
        </CheckboxGroup>
        
        <ButtonContainer>
          <Button onClick={onDeleteAccount}>Delete Account</Button>
        </ButtonContainer>
      </Card>
    </SectionWrapper>
  );
};

export default OtherSettingsSection;
