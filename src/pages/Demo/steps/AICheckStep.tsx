import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import styled from 'styled-components';
import {
  DemoTitle,
  DemoSubtitle,
  CTAButton,
  HeroBlock,
} from '../DemoPage.styles';
import {
  AICard,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardIcon,
} from '../../../pages/AIAssistantPage.styles';
import Button from '../../../components/common/Button';
import WishlistSelectionModal from '../../../components/features/ai-assistant/modals/WishlistSelectionModal/WishlistSelectionModal';
import AICheckResultModal from '../../../components/features/ai-assistant/modals/AICheckResultModal/AICheckResultModal';
import { DemoStep } from '../types';
import { getSelectedPersona, SelectedPersona } from '../utils/personaUtils';
import { getWardrobeItems } from '../../../services/wardrobe/items';
import { WardrobeItem, WishlistStatus } from '../../../types';
import { aiAnalysisMocksService } from '../../../services/ai/aiAnalysisMocksService';

// Demo-specific ButtonGroup with proper styling to override global styles
const DemoButtonGroup = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0.75rem;
  margin-top: auto;
  
  /* First button (Select from Wishlist) - Secondary outlined */
  button:first-child {
    background-color: transparent !important;
    color: #6b7280 !important;
    border: 1px solid #d1d5db !important;
    
    &:hover:not(:disabled) {
      background-color: #f9fafb !important;
      border-color: #9ca3af !important;
      transform: translateY(-1px) !important;
    }
    
    &:active:not(:disabled) {
      background-color: #f3f4f6 !important;
      transform: translateY(0) !important;
    }
  }
  
  /* Second button (Start AI Check) - Primary */
  button:last-child {
    background-color: #4f46e5 !important;
    color: #ffffff !important;
    border: 1px solid #4f46e5 !important;
    
    &:hover:not(:disabled) {
      background-color: #4338ca !important;
      border-color: #4338ca !important;
      transform: translateY(-1px) !important;
      box-shadow: 0 8px 25px rgba(79, 70, 229, 0.3) !important;
    }
    
    &:active:not(:disabled) {
      background-color: #3730a3 !important;
      border-color: #3730a3 !important;
      transform: translateY(0) !important;
    }
    
    &:disabled {
      opacity: 0.7 !important;
      cursor: not-allowed !important;
      pointer-events: none !important;
    }
  }
  
  @media (max-width: 640px) {
    flex-direction: column;
    gap: 0.5rem;
    
    button {
      flex: none !important;
      width: 100% !important;
    }
  }
`;

interface AICheckStepProps {
  onNext: () => void;
  markStepCompleted: (step: DemoStep) => void;
}

const AICheckStep: React.FC<AICheckStepProps> = ({ onNext, markStepCompleted }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
  const [isAIResultModalOpen, setIsAIResultModalOpen] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<SelectedPersona | null>(null);
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<WardrobeItem | null>(null);
  const [aiCheckData, setAiCheckData] = useState<any>(null);

  useEffect(() => {
    const persona = getSelectedPersona();
    setSelectedPersona(persona);
    
    if (persona) {
      loadWardrobeData(persona.userId);
    }
  }, []);

  const loadWardrobeData = async (userId: string) => {
    try {
      const items = await getWardrobeItems(userId);
      setWardrobeItems(items);
      console.log(`Loaded ${items.length} items for wishlist selection`);
    } catch (err: any) {
      console.error('Error loading wardrobe data:', err);
    }
  };

  const handleNext = () => {
    markStepCompleted(DemoStep.AI_CHECK);
    onNext();
  };

  const handleSelectFromWishlist = () => {
    setIsWishlistModalOpen(true);
  };

  const handleWishlistItemSelect = (item: WardrobeItem) => {
    setSelectedItem(item);
    setIsWishlistModalOpen(false);
  };

  const handleStartAICheck = async () => {
    if (!selectedItem) return;
    
    setIsLoading(true);
    
    try {
      // 🤖 Check for existing saved mock data
      console.log('🔍 Demo: Checking for saved mock data for item:', selectedItem.id);
      const existingMockData = await aiAnalysisMocksService.getMockAnalysis(selectedItem.id);
      
      let resultData;
      
      if (existingMockData) {
        console.log('✅ Demo: Found saved mock data! Using real AI analysis results');
        
        // Reconstruct the analysis data from saved mock
        const reconstructedData = aiAnalysisMocksService.reconstructMockData(existingMockData);
        
        resultData = {
          score: existingMockData.compatibility_score || 0,
          status: existingMockData.wishlist_status === 'approved' ? WishlistStatus.APPROVED :
                  existingMockData.wishlist_status === 'potential_issue' ? WishlistStatus.POTENTIAL_ISSUE :
                  WishlistStatus.NOT_REVIEWED,
          recommendationAction: existingMockData.recommendation_action || 'RECOMMEND',
          recommendationText: reconstructedData.recommendationText || 'Analysis from saved data',
          suitableScenarios: existingMockData.suitable_scenarios || [],
          compatibleItems: reconstructedData.compatibleItems || {},
          outfitCombinations: reconstructedData.outfitCombinations || [],
          seasonScenarioCombinations: reconstructedData.seasonScenarioCombinations || [],
          coverageGapsWithNoOutfits: reconstructedData.coverageGapsWithNoOutfits || [],
          imageUrl: selectedItem.imageUrl,
          usingMockData: true // Flag to indicate we're using real saved data
        };
      } else {
        console.log('❌ Demo: No saved mock data found, using demo fallback data');
        
        // Use fallback demo data
        resultData = {
          score: 85,
          status: WishlistStatus.APPROVED,
          recommendationAction: "RECOMMEND" as const,
          recommendationText: "Great choice! This item would be a perfect addition to your wardrobe.",
          suitableScenarios: ["Work", "Casual", "Weekend"],
          compatibleItems: {
            "Bottoms": [
              { name: "Black Dress Pants", category: "PANTS" },
              { name: "Dark Wash Jeans", category: "PANTS" },
              { name: "Navy Chinos", category: "PANTS" }
            ],
            "Outerwear": [
              { name: "Navy Blazer", category: "JACKET" },
              { name: "Denim Jacket", category: "JACKET" }
            ]
          },
          outfitCombinations: [
            {
              name: "Professional Look",
              items: ["Elegant Plain T-Shirt", "Black Dress Pants", "Navy Blazer"],
              occasion: "Work"
            },
            {
              name: "Casual Weekend",
              items: ["Elegant Plain T-Shirt", "Dark Wash Jeans", "Denim Jacket"],
              occasion: "Casual"
            }
          ],
          imageUrl: selectedItem.imageUrl,
          usingMockData: false // Using demo fallback data
        };
      }
      
      setAiCheckData(resultData);
      
      // Simulate loading time for better UX
      setTimeout(() => {
        setIsLoading(false);
        setIsAIResultModalOpen(true);
      }, 1500);
      
    } catch (error) {
      console.error('Error checking for mock data:', error);
      // Fall back to demo data on error
      setAiCheckData({
        score: 85,
        status: WishlistStatus.APPROVED,
        recommendationAction: "RECOMMEND" as const,
        recommendationText: "Great choice! This item would be a perfect addition to your wardrobe.",
        suitableScenarios: ["Work", "Casual", "Weekend"],
        compatibleItems: {},
        outfitCombinations: [],
        imageUrl: selectedItem.imageUrl,
        usingMockData: false
      });
      
      setTimeout(() => {
        setIsLoading(false);
        setIsAIResultModalOpen(true);
      }, 1500);
    }
  };


  return (
    <div>
      <HeroBlock>
        <DemoTitle>Test the AI Yourself</DemoTitle>
        <DemoSubtitle>
          Try "shopping" for different items from {selectedPersona?.name || 'the selected persona'}'s wishlist and see the instant, data-backed feedback it gives.
        </DemoSubtitle>
        <CTAButton onClick={handleNext}>
          Get Early Access
        </CTAButton>
      </HeroBlock>
      
      {/* AI Check Form - Simplified for Demo */}
      <AICard>
        <CardContent>
          <CardHeader>
            <CardIcon className="check">
              <FaSearch size={20} />
            </CardIcon>
            <div>
              <CardTitle>AI Check</CardTitle>
              <CardDescription>
                Get instant feedback on the clothing item you want to buy
              </CardDescription>
            </div>
          </CardHeader>
          
          {/* Action Buttons */}
          <DemoButtonGroup>
            <Button 
              variant="secondary" 
              outlined 
              onClick={handleSelectFromWishlist}
              fullWidth
            >
              {selectedItem ? 
                `Selected: ${selectedItem.name.length > 20 ? selectedItem.name.slice(0, 20) + '...' : selectedItem.name}` : 
                'Select from Wishlist'
              }
            </Button>
            <Button 
              variant="primary" 
              onClick={handleStartAICheck}
              disabled={isLoading || !selectedItem}
              fullWidth
            >
              {isLoading ? 'Analyzing...' : 'Start AI Check'}
            </Button>
          </DemoButtonGroup>
        </CardContent>
      </AICard>

      {/* Wishlist Selection Modal */}
      <WishlistSelectionModal
        isOpen={isWishlistModalOpen}
        onClose={() => setIsWishlistModalOpen(false)}
        items={wardrobeItems}
        onSelectItem={handleWishlistItemSelect}
      />

      {/* AI Check Result Modal - Using dynamic data from database or demo fallback */}
      {aiCheckData && (
        <AICheckResultModal
          isOpen={isAIResultModalOpen}
          onClose={() => setIsAIResultModalOpen(false)}
          analysisResult={aiCheckData.usingMockData ? "Real AI Analysis Results" : "Demo analysis complete"}
          score={aiCheckData.score}
          status={aiCheckData.status}
          recommendationAction={aiCheckData.recommendationAction}
          recommendationText={aiCheckData.usingMockData ? 
            `🎯 This is real AI analysis data that was previously saved! ${aiCheckData.recommendationText}` : 
            aiCheckData.recommendationText
          }
          suitableScenarios={aiCheckData.suitableScenarios}
          compatibleItems={aiCheckData.compatibleItems}
          outfitCombinations={aiCheckData.outfitCombinations}
          seasonScenarioCombinations={aiCheckData.seasonScenarioCombinations}
          coverageGapsWithNoOutfits={aiCheckData.coverageGapsWithNoOutfits}
          imageUrl={aiCheckData.imageUrl}
          hideActions={true}
        />
      )}
    </div>
  );
};

export default AICheckStep;
