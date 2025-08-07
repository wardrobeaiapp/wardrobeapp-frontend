import React from 'react';
import Button from '../Button';
import { Season } from '../../types';
import { 
  FormContainer, 
  FormGroup, 
  Label, 
  Input, 
  Select,
  Textarea, 
  ButtonContainer 
} from '../../pages/AIAssistantPage.styles';

interface RecommendationFormProps {
  occasion: string;
  setOccasion: (value: string) => void;
  season: string;
  setSeason: (value: string) => void;
  preferences: string;
  setPreferences: (value: string) => void;
  handleGetRecommendation: () => void;
  isLoading: boolean;
}

const RecommendationForm: React.FC<RecommendationFormProps> = ({
  occasion,
  setOccasion,
  season,
  setSeason,
  preferences,
  setPreferences,
  handleGetRecommendation,
  isLoading
}) => {
  return (
    <FormContainer>
      <FormGroup>
        <Label htmlFor="occasion">Occasion</Label>
        <Input
          id="occasion"
          type="text"
          value={occasion}
          onChange={e => setOccasion(e.target.value)}
          placeholder="e.g., Work, Casual, Date Night, Wedding"
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="season">Season</Label>
        <Select
          id="season"
          value={season}
          onChange={e => setSeason(e.target.value)}
        >
          <option value="">Select a season</option>
          {Object.values(Season).map(s => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </Select>
      </FormGroup>

      <FormGroup>
        <Label htmlFor="preferences">Style Preferences (Optional)</Label>
        <Textarea
          id="preferences"
          value={preferences}
          onChange={e => setPreferences(e.target.value)}
          placeholder="Describe your style preferences, colors you like/dislike, or any specific requirements..."
        />
      </FormGroup>

      <ButtonContainer>
        <Button primary onClick={handleGetRecommendation} disabled={isLoading}>
          {isLoading ? 'Getting Recommendations...' : 'Get Recommendations'}
        </Button>
      </ButtonContainer>
    </FormContainer>
  );
};

export default RecommendationForm;
