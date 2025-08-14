import React, { useState, useEffect, useMemo } from 'react';
import { Outfit, Season, WardrobeItem, ItemCategory, Scenario } from '../../../../types';
import { fetchScenarios } from '../../../../services/api';
import { FALLBACK_SCENARIOS } from '../../../../constants';
import { 
  FormContainer, 
  FormGroup, 
  Label, 
  ButtonGroup,
  ModernCancelButton,
  ModernSubmitButton
} from './OutfitForm.styles';
// ScenarioFixer removed as requested
import SelectedItemsList from '../outfit/SelectedItemsList';
import ItemsModal from '../outfit/ItemsModal';

// Import the extracted components
import ScenarioSelector from '../outfit/ScenarioSelector';
import SeasonSelector from '../outfit/SeasonSelector';

// Using Scenario interface imported from '../types'

// Using FALLBACK_SCENARIOS imported from '../constants'
// These are used if API fails or returns empty
// In normal operation, scenarios should come from user's profile preferences (set during onboarding)

interface OutfitFormProps {
  onSubmit: (outfit: Omit<Outfit, 'id' | 'dateCreated'>) => void;
  onGenerateWithAI?: (outfit: Omit<Outfit, 'id' | 'dateCreated'>) => void;
  onCancel: () => void;
  availableItems: WardrobeItem[];
  initialOutfit?: Outfit;
}

const OutfitForm: React.FC<OutfitFormProps> = ({ onSubmit, onGenerateWithAI, onCancel, availableItems, initialOutfit }) => {
  // Filter out wishlist items from available items
  const nonWishlistItems = useMemo(() => 
    availableItems.filter(item => !item.wishlist), 
    [availableItems]
  );
  
  // Initialize state from initialOutfit if provided
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>(initialOutfit?.scenarios || []);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>(initialOutfit?.items || []);
  const [selectedSeasons, setSelectedSeasons] = useState<Season[]>(initialOutfit?.season || []);
  const [isItemsModalOpen, setIsItemsModalOpen] = useState(false);
  const [scenariosLoading, setScenariosLoading] = useState(false);
  
  // Filter states
  const [categoryFilter, setCategoryFilter] = useState<ItemCategory | 'all'>('all');
  const [colorFilter, setColorFilter] = useState<string>('');
  const [seasonFilter, setSeasonFilter] = useState<Season | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredItems, setFilteredItems] = useState<WardrobeItem[]>(nonWishlistItems);
  
  const handleSeasonChange = (season: Season) => {
    setSelectedSeasons(prev => 
      prev.includes(season) 
        ? prev.filter(s => s !== season) 
        : [...prev, season]
    );
  };
  
  const handleItemChange = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId) 
        : [...prev, itemId]
    );
  };
  
  // Scenario fixing is now handled by the ScenarioFixer component
  
  // Fetch scenarios when component mounts
  useEffect(() => {
    const loadScenarios = async () => {
      try {
        setScenariosLoading(true);
        console.log('[OutfitForm] Fetching scenarios...');
        const data = await fetchScenarios();
        console.log('[OutfitForm] Scenarios from API:', data);
        
        // Check if data is valid - must be an array
        if (!Array.isArray(data)) {
          console.error('[OutfitForm] Invalid scenarios data format:', data);
          throw new Error('Invalid scenarios data format');
        }
        
        // Only use fallback scenarios if API returns empty array
        if (data.length === 0) {
          console.log('[OutfitForm] No scenarios found in profile, using fallback scenarios');
          const fallbackScenarios: Scenario[] = FALLBACK_SCENARIOS.map((name, index) => ({
            id: `fallback-${index}`,
            user_id: '', // Add required user_id property
            name,
            type: 'default', // Add required type property
            frequency: 'occasional'
          }));
          console.log('[OutfitForm] Fallback scenarios:', fallbackScenarios);
          setScenarios(fallbackScenarios);
        } else {
          // Validate and normalize scenarios from profile
          const validScenarios = data.filter(scenario => 
            scenario && typeof scenario === 'object' && 
            'id' in scenario && 'name' in scenario
          );
          
          if (validScenarios.length === 0) {
            console.log('[OutfitForm] No valid scenarios found in profile data, using fallback scenarios');
            const fallbackScenarios: Scenario[] = FALLBACK_SCENARIOS.map((name, index) => ({
              id: `fallback-${index}`,
              user_id: '', // Add required user_id property
              name,
              type: 'default', // Add required type property
              frequency: 'occasional'
            }));
            setScenarios(fallbackScenarios);
          } else {
            // Use the scenarios from user's profile (set during onboarding)
            console.log('[OutfitForm] Using scenarios from profile:', validScenarios);
            setScenarios(validScenarios);
          }
        }
      } catch (err) {
        console.error('[OutfitForm] Error loading scenarios:', err);
        // On error, still provide fallback scenarios
        const fallbackScenarios: Scenario[] = FALLBACK_SCENARIOS.map((name, index) => ({
          id: `fallback-${index}`,
          user_id: '', // Add required user_id property
          name,
          type: 'default', // Add required type property
          frequency: 'occasional'
        }));
        console.log('[OutfitForm] Using fallback scenarios due to error:', fallbackScenarios);
        setScenarios(fallbackScenarios);
      } finally {
        setScenariosLoading(false);
      }
    };
    
    loadScenarios();
  }, []);
  
  // Handle scenario selection
  const handleScenarioChange = (scenarioName: string) => {
    setSelectedScenarios(prev => 
      prev.includes(scenarioName) 
        ? prev.filter(name => name !== scenarioName) 
        : [...prev, scenarioName]
    );
  };
  
  // Apply filters to available items
  useEffect(() => {
    let filtered = [...nonWishlistItems];
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }
    
    // Apply color filter
    if (colorFilter) {
      filtered = filtered.filter(item => 
        item.color.toLowerCase().includes(colorFilter.toLowerCase())
      );
    }
    
    // Apply season filter
    if (seasonFilter !== 'all') {
      filtered = filtered.filter(item => 
        item.season.includes(seasonFilter)
      );
    }
    
    // Apply search query
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.brand && item.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.material && item.material.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
      );
    }
    
    setFilteredItems(filtered);
  }, [nonWishlistItems, categoryFilter, colorFilter, seasonFilter, searchQuery]);
  
  // Reset filters when modal opens
  const openItemsModal = () => {
    setCategoryFilter('all');
    setColorFilter('');
    setSeasonFilter('all');
    setSearchQuery('');
    setIsItemsModalOpen(true);
  };
  
  // Function to prepare form data for submission or AI generation
  const prepareFormData = (): Omit<Outfit, 'id' | 'dateCreated'> => {
    // Create outfit object with auto-generated name
    const selectedItemsDetails = selectedItems.map(id => nonWishlistItems.find(item => item.id === id))
      .filter(item => item !== undefined) as WardrobeItem[];
    
    // Generate name based on selected items (e.g., "Blue Jeans + White T-shirt Outfit")
    // If editing an existing outfit, preserve the original name if possible
    const generatedName = initialOutfit?.name || (
      selectedItemsDetails.length > 0
        ? selectedItemsDetails.map(item => item.name).join(' + ')
        : 'New Outfit'
    );
      
    return {
      name: generatedName,
      items: selectedItems,
      season: selectedSeasons,
      occasion: selectedScenarios.length > 0 ? scenarios.find(s => s.id === selectedScenarios[0])?.name : undefined,  // For backward compatibility
      scenarios: selectedScenarios,
      favorite: initialOutfit?.favorite || false,
      lastWorn: initialOutfit?.lastWorn
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedItems.length === 0) {
      alert('Please select at least one item for your outfit');
      return;
    }
    
    if (selectedSeasons.length === 0) {
      alert('Please select at least one season');
      return;
    }
    
    const newOutfit = prepareFormData();
    onSubmit(newOutfit);
  };
  
  // Filter items for the modal
  useEffect(() => {
    let filtered = [...nonWishlistItems];
    
    // Apply category filter
  if (categoryFilter !== 'all') {
    filtered = filtered.filter(item => item.category === categoryFilter);
  }
  
  // Apply color filter
  if (colorFilter) {
    filtered = filtered.filter(item => 
      item.color.toLowerCase().includes(colorFilter.toLowerCase())
    );
  }
  
  // Apply season filter
  if (seasonFilter !== 'all') {
    filtered = filtered.filter(item => 
      item.season.includes(seasonFilter)
    );
  }
  
  // Apply search query
  if (searchQuery) {
    filtered = filtered.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.brand && item.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.material && item.material.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
    );
  }
  
  setFilteredItems(filtered);
}, [nonWishlistItems, categoryFilter, colorFilter, seasonFilter, searchQuery]);


// handleSubmit is already defined above

return (
  <form onSubmit={handleSubmit}>
    <FormContainer>
      {/* Scenario selector */}
      <ScenarioSelector
        scenarios={scenarios}
        selectedScenarios={selectedScenarios}
        onScenarioChange={handleScenarioChange}
        isLoading={scenariosLoading}
      />

      <SeasonSelector
        selectedSeasons={selectedSeasons}
        onSeasonChange={handleSeasonChange}
      />
      
      <FormGroup>
          <Label>Select Items</Label>
          <ModernSubmitButton 
            type="button" 
            onClick={openItemsModal}
            style={{ marginBottom: '0.5rem' }}
          >
            Select Wardrobe Items
          </ModernSubmitButton>
          
          {/* Selected items list component */}
          <SelectedItemsList
            selectedItems={selectedItems}
            availableItems={availableItems}
            onItemRemove={handleItemChange}
          />
          
          {/* Items modal component */}
          <ItemsModal
            isOpen={isItemsModalOpen}
            onClose={() => setIsItemsModalOpen(false)}
            availableItems={nonWishlistItems}
            filteredItems={filteredItems}
            selectedItems={selectedItems}
            searchQuery={searchQuery}
            categoryFilter={categoryFilter}
            colorFilter={colorFilter}
            seasonFilter={seasonFilter}
            onSearchChange={setSearchQuery}
            onCategoryChange={setCategoryFilter}
            onColorChange={setColorFilter}
            onSeasonChange={setSeasonFilter}
            onItemSelect={handleItemChange}
          />
        </FormGroup>
        
        <ButtonGroup>
          <ModernCancelButton type="button" onClick={onCancel}>
            Cancel
          </ModernCancelButton>
          <ModernSubmitButton type="submit">
            Save Outfit
          </ModernSubmitButton>
        </ButtonGroup>
      </FormContainer>
    </form>
  );
};

export default OutfitForm;
