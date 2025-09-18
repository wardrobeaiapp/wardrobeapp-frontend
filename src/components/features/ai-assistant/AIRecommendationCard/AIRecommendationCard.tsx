import React from 'react';
import { FaMagic } from 'react-icons/fa';
import { Season } from '../../../../types';
import {
  AICard,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardIcon,
  DropdownContainer,
  ButtonGroup,
} from '../../../../pages/AIAssistantPage.styles';
import Button from '../../../common/Button';
import { FormField, FormSelect } from '../../../common/Form';

interface AIRecommendationCardProps {
  selectedSeason: string;
  onSeasonChange: (value: string) => void;
  selectedScenario: string;
  onScenarioChange: (value: string) => void;
  scenarioOptions: string[];
  loadingScenarios: boolean;
  onGetRecommendation: () => void;
  isLoading: boolean;
  error: string;
}

const AIRecommendationCard: React.FC<AIRecommendationCardProps> = ({
  selectedSeason,
  onSeasonChange,
  selectedScenario,
  onScenarioChange,
  scenarioOptions,
  loadingScenarios,
  onGetRecommendation,
  isLoading,
  error,
}) => {
  return (
    <AICard>
      <CardContent>
        <CardHeader>
          <CardIcon className="recommendation">
            <FaMagic size={20} />
          </CardIcon>
          <div>
            <CardTitle>AI Recommendation</CardTitle>
            <CardDescription>
              Discover new looks you'll love.
            </CardDescription>
          </div>
        </CardHeader>

        {/* Descriptive Text */}
        <CardDescription style={{ marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: '1.6' }}>
          AI analyzes your wardrobe and lifestyle to recommend items worth adding.
        </CardDescription>

        {/* Season and Scenario Dropdowns */}
        <DropdownContainer>
          <FormField label="Season" htmlFor="season-select">
            <FormSelect
              id="season-select"
              value={selectedSeason}
              onChange={(e) => onSeasonChange(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="all">All Seasons</option>
              <option value={Season.SUMMER}>Summer</option>
              <option value={Season.WINTER}>Winter</option>
              <option value={Season.TRANSITIONAL}>Spring/Fall</option>
            </FormSelect>
          </FormField>
          
          <FormField label="Scenario" htmlFor="scenario-select">
            <FormSelect
              id="scenario-select"
              value={selectedScenario}
              onChange={(e) => onScenarioChange(e.target.value)}
              style={{ width: '100%' }}
              disabled={loadingScenarios}
            >
              <option value="all">All Scenarios</option>
              {loadingScenarios ? (
                <option>Loading scenarios...</option>
              ) : (
                scenarioOptions.map(scenario => (
                  <option key={scenario} value={scenario}>
                    {scenario}
                  </option>
                ))
              )}
            </FormSelect>
          </FormField>
        </DropdownContainer>
        
        {/* Error Message */}
        {error && (
          <div style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}
        
        {/* Single Green Button - Moved to Bottom */}
        <ButtonGroup>
          <Button variant="primary" 
            onClick={onGetRecommendation} 
            disabled={isLoading}>
              {isLoading ? 'Generating...' : 'Get a Recommendation'}
            </Button>
        </ButtonGroup>
      </CardContent>
    </AICard>
  );
};

export default AIRecommendationCard;
