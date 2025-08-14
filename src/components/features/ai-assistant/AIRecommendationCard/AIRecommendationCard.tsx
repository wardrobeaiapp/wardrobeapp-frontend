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
  InputSection,
  InputLabel,
  Select,
  ButtonGroup,
} from '../../../../pages/AIAssistantPage.styles';
import Button from '../../../common/Button';

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
          <InputSection>
            <InputLabel>Season</InputLabel>
            <Select
              value={selectedSeason}
              onChange={(e) => onSeasonChange(e.target.value)}
            >
              <option value="all">All Seasons</option>
              <option value={Season.SPRING}>Spring</option>
              <option value={Season.SUMMER}>Summer</option>
              <option value={Season.FALL}>Fall</option>
              <option value={Season.WINTER}>Winter</option>
            </Select>
          </InputSection>
          
          <InputSection>
            <InputLabel>Scenario</InputLabel>
            <Select
              value={selectedScenario}
              onChange={(e) => onScenarioChange(e.target.value)}
            >
              <option value="all">All Scenarios</option>
              {loadingScenarios ? (
                <option disabled>Loading scenarios...</option>
              ) : (
                scenarioOptions.map(scenario => (
                  <option key={scenario} value={scenario}>
                    {scenario}
                  </option>
                ))
              )}
            </Select>
          </InputSection>
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
