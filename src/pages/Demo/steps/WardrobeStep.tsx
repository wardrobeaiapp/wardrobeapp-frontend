import React, { useEffect, useState } from 'react';
import {
  DemoTitle,
  DemoSubtitle,
  CTAButton,
  HeroBlock,
  CTABlock
} from '../DemoPage.styles';
import { DemoStep } from '../types';
import { getSelectedPersona, SelectedPersona } from '../utils/personaUtils';
import { getWardrobeItems } from '../../../services/wardrobe/items';
import { WardrobeItem } from '../../../types';
import { TabType } from '../../../hooks/home';
import { TabsContainer, Tab } from '../../../pages/HomePage.styles';
import { MdCheckroom, MdFavoriteBorder } from 'react-icons/md';
import ItemsTab from '../../../components/features/wardrobe/tabs/ItemsTab';
import WishlistTab from '../../../components/features/wardrobe/tabs/WishlistTab';
import { WishlistStatus } from '../../../types';
import styled from 'styled-components';

// Wide container for wardrobe interface to match real app experience
const WideContainer = styled.div`
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  width: 100vw;
  max-width: none;
  padding: 0;
  background: transparent;
  
  & > * {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

interface WardrobeStepProps {
  onNext: () => void;
  markStepCompleted: (step: DemoStep) => void;
}

const WardrobeStep: React.FC<WardrobeStepProps> = ({ onNext, markStepCompleted }) => {
  const [selectedPersona, setSelectedPersona] = useState<SelectedPersona | null>(null);
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>(TabType.ITEMS);
  
  // Filters state for ItemsTab
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [seasonFilter, setSeasonFilter] = useState<string | string[]>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [scenarioFilter, setScenarioFilter] = useState('all');
  
  // Filters state for WishlistTab  
  const [statusFilter, setStatusFilter] = useState<WishlistStatus | 'all'>('all');

  useEffect(() => {
    const persona = getSelectedPersona();
    setSelectedPersona(persona);
    
    if (persona) {
      console.log('Current persona in wardrobe step:', persona);
      loadWardrobeData(persona.userId);
    }
  }, []);

  const loadWardrobeData = async (userId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const items = await getWardrobeItems(userId); // Load all items
      setWardrobeItems(items);
      console.log(`Loaded ${items.length} items for ${userId}`);
    } catch (err: any) {
      console.error('Error loading wardrobe data:', err);
      setError(err.message || 'Failed to load wardrobe data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    markStepCompleted(DemoStep.WARDROBE);
    onNext();
  };

  const personaName = selectedPersona?.name || 'your selected persona';

  // Dummy functions for demo (no actions allowed)
  const handleEditItem = () => {};
  const handleDeleteItem = () => {};

  return (
    <div>
      {/* Narrow container for headers */}
      <HeroBlock>
        <DemoTitle>Explore {personaName}'s Wardrobe</DemoTitle>
        <DemoSubtitle>
          Browse through {personaName}'s real wardrobe items and wishlist
        </DemoSubtitle>
      </HeroBlock>

      {/* Wide container for authentic wardrobe experience */}
      <WideContainer>
        <div>
          {/* Demo wardrobe tabs - only show Items and Wishlist */}
          <TabsContainer>
            <Tab 
              $active={activeTab === TabType.ITEMS}
              $type="items"
              onClick={() => setActiveTab(TabType.ITEMS)}
            >
              <MdCheckroom />
              Wardrobe Items
            </Tab>
            <Tab 
              $active={activeTab === TabType.WISHLIST}
              $type="wishlist"
              onClick={() => setActiveTab(TabType.WISHLIST)}
            >
              <MdFavoriteBorder />
              Wishlist
            </Tab>
          </TabsContainer>

          {/* Render appropriate tab content */}
          {activeTab === TabType.ITEMS && (
            <ItemsTab
              items={wardrobeItems}
              itemCount={wardrobeItems.filter(item => !item.wishlist).length}
              isLoading={isLoading}
              error={error}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              seasonFilter={seasonFilter}
              setSeasonFilter={setSeasonFilter}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              scenarioFilter={scenarioFilter}
              setScenarioFilter={setScenarioFilter}
              onViewItem={undefined}
              onEditItem={handleEditItem}
              onDeleteItem={handleDeleteItem}
            />
          )}

          {activeTab === TabType.WISHLIST && (
            <WishlistTab
              items={wardrobeItems}
              isLoading={isLoading}
              error={error}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              seasonFilter={seasonFilter}
              setSeasonFilter={setSeasonFilter}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              scenarioFilter={scenarioFilter}
              setScenarioFilter={setScenarioFilter}
              onViewItem={undefined}
              onEditItem={handleEditItem}
              onDeleteItem={handleDeleteItem}
            />
          )}
        </div>
      </WideContainer>

      {/* Narrow container for continue button */}
      <CTABlock>
        <CTAButton onClick={handleNext}>
          Continue to AI Check
        </CTAButton>
      </CTABlock>
    </div>
  );
};

export default WardrobeStep;
