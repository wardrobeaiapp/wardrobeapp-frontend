import React, { useState } from 'react';
import Button from '../../components/Button';
import {
  ContentHeader,
  FormGroup,
  Label,
  Input,
  ToggleContainer,
  ToggleLabel,
  ToggleSwitch,
  ButtonContainer,
  SectionWrapper
} from '../../pages/ProfilePage.styles';

interface NotificationsProps {
  initialData: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    reminderTime: string;
    weeklyDigest: boolean;
    specialOffers: boolean;
  };
  onSave: (data: any) => void;
}

const NotificationsSection: React.FC<NotificationsProps> = ({ initialData, onSave }) => {
  const [notifications, setNotifications] = useState({
    emailNotifications: initialData.emailNotifications,
    pushNotifications: initialData.pushNotifications,
    reminderTime: initialData.reminderTime,
    weeklyDigest: initialData.weeklyDigest,
    specialOffers: initialData.specialOffers
  });

  const handleSave = () => {
    onSave(notifications);
  };

  return (
    <SectionWrapper>
      <ContentHeader>Reminders & Notifications</ContentHeader>
      
      <ToggleContainer>
        <ToggleLabel>Email Notifications</ToggleLabel>
        <ToggleSwitch>
          <input 
            type="checkbox" 
            checked={notifications.emailNotifications}
            onChange={(e) => setNotifications({...notifications, emailNotifications: e.target.checked})}
          />
          <span></span>
        </ToggleSwitch>
      </ToggleContainer>
      
      <ToggleContainer>
        <ToggleLabel>Push Notifications</ToggleLabel>
        <ToggleSwitch>
          <input 
            type="checkbox" 
            checked={notifications.pushNotifications}
            onChange={(e) => setNotifications({...notifications, pushNotifications: e.target.checked})}
          />
          <span></span>
        </ToggleSwitch>
      </ToggleContainer>
      
      <FormGroup>
        <Label htmlFor="reminderTime">Daily Reminder Time</Label>
        <Input 
          id="reminderTime" 
          type="time" 
          value={notifications.reminderTime}
          onChange={(e) => setNotifications({...notifications, reminderTime: e.target.value})}
        />
      </FormGroup>
      
      <ToggleContainer>
        <ToggleLabel>Weekly Wardrobe Digest</ToggleLabel>
        <ToggleSwitch>
          <input 
            type="checkbox" 
            checked={notifications.weeklyDigest}
            onChange={(e) => setNotifications({...notifications, weeklyDigest: e.target.checked})}
          />
          <span></span>
        </ToggleSwitch>
      </ToggleContainer>
      
      <ToggleContainer>
        <ToggleLabel>Special Offers & Updates</ToggleLabel>
        <ToggleSwitch>
          <input 
            type="checkbox" 
            checked={notifications.specialOffers}
            onChange={(e) => setNotifications({...notifications, specialOffers: e.target.checked})}
          />
          <span></span>
        </ToggleSwitch>
      </ToggleContainer>
      
      <ButtonContainer>
        <Button>Cancel</Button>
        <Button primary onClick={handleSave}>Save Changes</Button>
      </ButtonContainer>
    </SectionWrapper>
  );
};

export default NotificationsSection;
