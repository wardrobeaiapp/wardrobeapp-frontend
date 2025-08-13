import { ReactNode } from 'react';
import { ProfileData } from '../../../../types';
import { ProfileSection, ArrayFieldsOfProfileData } from '../sections/types';

// Define the SaveResult interface
export interface SaveResult {
  success: boolean;
  error?: any;
}

// Define the context type
export interface StyleProfileContextType {
  profileData: ProfileData;
  setProfileData: React.Dispatch<React.SetStateAction<ProfileData>>;
  originalData: ProfileData;
  activityChanges: {
    dailyActivities: boolean;
    leisureActivities: boolean;
  };
  handleCheckboxChange: (field: ArrayFieldsOfProfileData, value: string) => void;
  handleNestedChange: (parentField: string | number | symbol, field: string, value: any) => void;
  handleSave: (section?: ProfileSection) => Promise<SaveResult>;
  isModalOpen: boolean;
  closeModal: () => void;
  updateScenarios: () => void;
  navigateToScenarios?: () => void;
  isScenarioChangeModalOpen: boolean;
  setIsScenarioChangeModalOpen: (isOpen: boolean) => void;
  scenarioChanges: {
    added: any[];
    modified: any[];
    removed: any[];
  };
}

// Props for the provider component
export interface StyleProfileProviderProps {
  children: ReactNode;
  initialData: ProfileData;
  onSave: (data: ProfileData, section?: ProfileSection) => Promise<SaveResult>;
  onNavigateToScenarios?: () => void;
}
