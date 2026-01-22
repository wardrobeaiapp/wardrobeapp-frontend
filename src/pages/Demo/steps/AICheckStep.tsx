import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import styled from 'styled-components';
import { theme } from '../../../styles/theme';
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
import { getDemoWardrobeItems, isDemoUser } from '../services/demoWardrobeService';
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
    border: 1px solid ${theme.colors.primary} !important;
    
    &:hover:not(:disabled) {
      border-color: ${theme.colors.primaryHover} !important;
      transform: translateY(-1px) !important;
      box-shadow: 0 8px 25px ${theme.colors.purple[300]} !important;
    }
    
    &:active:not(:disabled) {
      border-color: ${theme.colors.primaryActive} !important;
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

/**
 * Replace mock items with actual wardrobe items where possible
 * This ensures proper ItemImage component behavior and URL renewal
 */
const refreshImageUrls = (
  compatibleItems: { [category: string]: any[] },
  currentWardrobeItems: WardrobeItem[]
): { [category: string]: any[] } => {
  // Create a lookup map of current items by ID for fast matching
  const itemMap = new Map<string, WardrobeItem>();
  currentWardrobeItems.forEach(item => {
    if (item.id) {
      itemMap.set(item.id, item);
    }
  });

  // Process each category
  const refreshedItems: { [category: string]: any[] } = {};
  
  Object.entries(compatibleItems).forEach(([category, items]) => {
    refreshedItems[category] = items.map(item => {
      // If item has an ID and we have a current wardrobe item with that ID
      if (item.id && itemMap.has(item.id)) {
        const currentItem = itemMap.get(item.id)!;
        
        // Use the actual WardrobeItem instead of mock data + copied URL
        // This ensures proper ItemImage component behavior
        return currentItem;
      }
      
      // Return item unchanged if no current match found (fallback to text display)
      return item;
    });
  });

  return refreshedItems;
};


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
      // Use demo service for demo users (with public access), regular service for authenticated users
      const items = isDemoUser(userId) 
        ? await getDemoWardrobeItems(userId)
        : await getWardrobeItems(userId);
      
      setWardrobeItems(items);
      console.log(`🎭 Demo: Loaded ${items.length} items for wishlist selection`);
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
        
        // Refresh compatible items with current wardrobe data
        const refreshedCompatibleItems = refreshImageUrls(reconstructedData.compatibleItems || {}, wardrobeItems);
        
        // Outfit combinations use original data - OutfitCombinations handles URL matching
        
        resultData = {
          score: existingMockData.compatibility_score || 0,
          status: existingMockData.wishlist_status === 'approved' ? WishlistStatus.APPROVED :
                  existingMockData.wishlist_status === 'potential_issue' ? WishlistStatus.POTENTIAL_ISSUE :
                  WishlistStatus.NOT_REVIEWED,
          recommendationAction: existingMockData.recommendation_action || 'RECOMMEND',
          recommendationText: reconstructedData.recommendationText || 'Analysis from saved data',
          suitableScenarios: existingMockData.suitable_scenarios || [],
          compatibleItems: refreshedCompatibleItems,
          outfitCombinations: reconstructedData.outfitCombinations || [],
          seasonScenarioCombinations: reconstructedData.seasonScenarioCombinations || [],
          coverageGapsWithNoOutfits: reconstructedData.coverageGapsWithNoOutfits || [],
          imageUrl: selectedItem.imageUrl,
          usingMockData: true // Flag to indicate we're using real saved data
        };
      } else {
        console.log('❌ Demo: No saved mock data found, using demo fallback data');
        
        // Demo compatible items
        const demoCompatibleItems = {
          "Bottoms": [
            { name: "Black Dress Pants", category: "PANTS" },
            { name: "Dark Wash Jeans", category: "PANTS" },
            { name: "Navy Chinos", category: "PANTS" }
          ],
          "Outerwear": [
            { name: "Navy Blazer", category: "JACKET" },
            { name: "Denim Jacket", category: "JACKET" }
          ]
        };

        // Demo outfit combinations with proper structure
        const demoOutfitCombinations = [
          {
            season: "SPRING/FALL",
            scenario: "Office Work", 
            outfits: [
              {
                items: [
                  { name: selectedItem.name, type: "base-item" }, // Use the selected item
                  { name: "Black Dress Pants", category: "PANTS" },
                  { name: "Navy Blazer", category: "JACKET" }
                ]
              },
              {
                items: [
                  { name: selectedItem.name, type: "base-item" },
                  { name: "Dark Wash Jeans", category: "PANTS" },
                  { name: "Denim Jacket", category: "JACKET" }
                ]
              }
            ]
          }
        ];
        
        // 🔄 Refresh URLs for compatible items, let OutfitCombinations component handle outfit URLs
        const refreshedCompatibleItems = refreshImageUrls(demoCompatibleItems, wardrobeItems);
        
        resultData = {
          score: 85,
          status: WishlistStatus.APPROVED,
          recommendationAction: "RECOMMEND" as const,
          recommendationText: "Great choice! This item would be a perfect addition to your wardrobe.",
          suitableScenarios: ["Work", "Casual", "Weekend"],
          compatibleItems: refreshedCompatibleItems,
          outfitCombinations: demoOutfitCombinations,
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
          recommendationText={aiCheckData.recommendationText}
          suitableScenarios={aiCheckData.suitableScenarios}
          compatibleItems={aiCheckData.compatibleItems}
          outfitCombinations={aiCheckData.outfitCombinations}
          seasonScenarioCombinations={aiCheckData.seasonScenarioCombinations}
          coverageGapsWithNoOutfits={aiCheckData.coverageGapsWithNoOutfits}
          imageUrl={aiCheckData.imageUrl}
          selectedWishlistItem={selectedItem}
          hideActions={true}
        />
      )}
    </div>
  );
};

export default AICheckStep;
