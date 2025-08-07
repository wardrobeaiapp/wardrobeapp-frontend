// Scenario types for the application

export interface ComponentScenario {
  id: string;
  user_id: string;
  type: string;       // Maps to 'name' in the database
  description: string; // UI description
  frequency: number;   // Numeric frequency value
  period: string;      // Period (week, month, etc.)
  isNew?: boolean;     // Flag to identify newly added scenarios that haven't been saved to the database yet
  markedForDeletion?: boolean; // Flag to identify scenarios that should be deleted when saving
}
