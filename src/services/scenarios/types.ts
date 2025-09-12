export interface Scenario {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  frequency?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateScenarioData extends Omit<Scenario, 'id' | 'created_at' | 'updated_at'> {}
export interface UpdateScenarioData extends Partial<Omit<Scenario, 'id' | 'user_id' | 'created_at'>> {}
