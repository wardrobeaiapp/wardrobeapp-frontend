import React, { useState, useEffect, useMemo } from 'react';
import { Outfit, WardrobeItem, Scenario, Season, ItemCategory } from '../../../../../types';
import { fetchScenarios } from '../../../../../services/api';
import { FALLBACK_SCENARIOS } from '../../../../../constants';
import { ButtonContainer, FormContainer } from '../../shared/styles/form.styles';
import FormField from '../../../../common/Form/FormField';
import Button from '../../../../../components/common/Button';
// ScenarioFixer removed as requested
import SelectedItemsList from '../../shared/SelectedItemsList';
import OutfitItemsSelectionModal from '../../modals/OutfitItemsSelectionModal';

// Import the shared components
import ScenarioSelector from '../../shared/ScenarioSelector';
import SeasonSelector from '../../shared/SeasonSelector';

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

// Use standard function component pattern instead of React.FC
function OutfitForm({ onSubmit, onCancel, availableItems, initialOutfit }: OutfitFormProps) {  // Filter out wishlist items from available items
  const nonWishlistItems = useMemo(() => 
    availableItems.filter(item => !item.wishlist), 
    [availableItems]
  );
  
  // Initialize state from initialOutfit if provided
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>(
    initialOutfit?.scenarios || initialOutfit?.scenarioNames?.map(name => 
      scenarios.find(s => s.name === name)?.id || ''
    ).filter(Boolean) || []
  );
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
  
  const handleSeasonChange = (season: Season) => {
    setSelectedSeasons(prev => 
      prev.includes(season) 
        ? prev.filter(s => s !== season) 
        : [...prev, season]
    );
  };
  
  const handleItemChange = (itemIds: string | string[]) => {
    const ids = Array.isArray(itemIds) ? itemIds : [itemIds];
    setSelectedItems(prev => {
      // If any of the clicked items are already selected, remove them
      if (ids.some(id => prev.includes(id))) {
        return prev.filter(id => !ids.includes(id));
      }
      // Otherwise add them
      return [...prev, ...ids];
    });
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
  
  // Compute filtered items when needed for the modal
  const getFilteredItems = () => {
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
        (item.material && item.material.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    return filtered;
  };
  
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
    
    // Get the first selected scenario for backward compatibility with the occasion field
    const firstScenario = selectedScenarios.length > 0 
      ? scenarios.find(s => s.id === selectedScenarios[0])
      : null;
    
    // Get scenario names for the selected scenario IDs
    const selectedScenarioNames = selectedScenarios
      .map(id => scenarios.find(s => s.id === id)?.name)
      .filter((name): name is string => !!name);
    
    // Create the base outfit data
    const outfitData: Omit<Outfit, 'id' | 'dateCreated'> = {
      name: generatedName,
      items: selectedItems,
      season: selectedSeasons,
      // For backward compatibility, set the occasion to the first scenario's name if available
      occasion: firstScenario?.name || undefined,
      // Store scenario IDs in the scenarios array
      scenarios: selectedScenarios,
      // Also include scenario names for backward compatibility
      scenarioNames: selectedScenarioNames,
      favorite: initialOutfit?.favorite || false,
      lastWorn: initialOutfit?.lastWorn
    };

    // If we're editing an existing outfit, include the ID
    if (initialOutfit?.id) {
      // @ts-ignore - We know ID exists on Outfit but not on the return type
      outfitData.id = initialOutfit.id;
    }
    
    return outfitData;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedItems.length === 0) {
      alert('Please select at least one item for your outfit');
      return;
    }
    
    try {
      const formData = prepareFormData();
      
      // Ensure scenarios array is always defined
      if (!formData.scenarios) {
        formData.scenarios = [];
      }
      
      // Ensure scenarioNames is always defined and in sync with scenarios
      if (!formData.scenarioNames) {
        formData.scenarioNames = [];
      }
      
      // If we have scenario IDs but no names, try to map them
      if (formData.scenarios.length > 0 && formData.scenarioNames.length === 0) {
        formData.scenarioNames = formData.scenarios
          .map(id => scenarios.find(s => s.id === id)?.name)
          .filter((name): name is string => !!name);
      }
      
      // Ensure the occasion field is set for backward compatibility
      if (!formData.occasion && formData.scenarioNames.length > 0) {
        formData.occasion = formData.scenarioNames[0];
      }
      
      onSubmit(formData);
    } catch (error) {
      console.error('Error preparing outfit data:', error);
      // Handle the error appropriately, e.g., show a user-friendly message
      alert('An error occurred while saving the outfit. Please try again.');
    }
  };

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
      
      <FormField 
        label={`Selected Items (${selectedItems.length})`}
        helpText="Add items to create your outfit"
      >
        <div style={{ marginBottom: '0.5rem' }}>
          <Button 
            variant="primary"
            type="button" 
            onClick={openItemsModal}
            fullWidth
          >
            Select Wardrobe Items
          </Button>
        </div>
        
        {/* Selected items list component */}
        <SelectedItemsList
          selectedItems={selectedItems}
          availableItems={availableItems}
          onItemRemove={handleItemChange}
        />
      </FormField>
          
          {/* Items modal component */}
          <OutfitItemsSelectionModal
            isOpen={isItemsModalOpen}
            onClose={() => setIsItemsModalOpen(false)}
            availableItems={getFilteredItems()}
            selectedItems={selectedItems}
            searchQuery={searchQuery}
            categoryFilter={categoryFilter}
            seasonFilter={seasonFilter}
            onSearchChange={setSearchQuery}
            onCategoryChange={(value: string) => setCategoryFilter(value as ItemCategory | 'all')}
            onColorChange={setColorFilter}
            onSeasonChange={(value: string) => setSeasonFilter(value as Season | 'all')}
            onItemSelect={handleItemChange}
            colorFilter={colorFilter}
            categories={Array.from(new Set(nonWishlistItems.map(item => item.category)))}
            colors={Array.from(new Set(nonWishlistItems.map(item => item.color).filter(Boolean)))}
          />
        
        <ButtonContainer>
          <Button fullWidth variant="secondary" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button fullWidth variant="primary" type="submit">
            Save Outfit
          </Button>
        </ButtonContainer>
      </FormContainer>
    </form>
  );
};

export default OutfitForm;
