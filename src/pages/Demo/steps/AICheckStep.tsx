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

// Demo-specific ButtonGroup with proper styling to override global styles
const DemoButtonGroup = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0.75rem;
  margin-top: auto;
  
  /* Override global button styles with higher specificity - target by position */
  button {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 4px !important;
    font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif !important;
    font-weight: 600 !important;
    border-radius: 0.5rem !important;
    cursor: pointer !important;
    transition: all 0.15s ease !important;
    border: 1px solid transparent !important;
    text-decoration: none !important;
    white-space: nowrap !important;
    padding: 0.5rem 1rem !important;
    font-size: 0.875rem !important;
    min-height: 40px !important;
    flex: 1 !important;
  }
  
  /* First button (Select from Wishlist) - Secondary outlined */
  button:first-child {
    background-color: transparent !important;
    color: #6b7280 !important;
    border: 1px solid #d1d5db !important;
    
    &:hover:not(:disabled) {
      background-color: #f9fafb !important;
      border-color: #9ca3af !important;
    }
    
    &:active:not(:disabled) {
      background-color: #f3f4f6 !important;
    }
  }
  
  /* Second button (Start AI Check) - Primary */
  button:last-child {
    background-color: #8b5cf6 !important;
    color: #ffffff !important;
    border: 1px solid #8b5cf6 !important;
    
    &:hover:not(:disabled) {
      background-color: #7c3aed !important;
      border-color: #7c3aed !important;
    }
    
    &:active:not(:disabled) {
      background-color: #6d28d9 !important;
      border-color: #6d28d9 !important;
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

  const handleStartAICheck = () => {
    // Demo functionality - simulate AI check loading then show result modal
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsAIResultModalOpen(true);
    }, 2000);
  };

  // Mock data for demo AI check result
  const mockAICheckData = {
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
    imageUrl: selectedItem?.imageUrl || undefined
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

      {/* AI Check Result Modal - No action buttons for demo */}
      <AICheckResultModal
        isOpen={isAIResultModalOpen}
        onClose={() => setIsAIResultModalOpen(false)}
        analysisResult="Demo analysis complete"
        score={mockAICheckData.score}
        status={mockAICheckData.status}
        recommendationAction={mockAICheckData.recommendationAction}
        recommendationText={mockAICheckData.recommendationText}
        suitableScenarios={mockAICheckData.suitableScenarios}
        compatibleItems={mockAICheckData.compatibleItems}
        outfitCombinations={mockAICheckData.outfitCombinations}
        imageUrl={mockAICheckData.imageUrl}
        hideActions={true}
      />
    </div>
  );
};

export default AICheckStep;
