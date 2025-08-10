import React, { useState, useEffect } from 'react';
import { Season, WardrobeItem } from '../types';
import { fetchScenarios, Scenario } from '../services/api';
import useCapsuleItems from '../hooks/useCapsuleItems';
import {
  FormContainer,
  FormGroup,
  Label,
  Input,
  ButtonGroup
} from './CapsuleForm.styles';
import {
  ModernCancelButton,
  ModernSubmitButton
} from './OutfitForm.styles';
import { Capsule } from '../types';
import ScenarioSelector from './capsule/ScenarioSelector';
import SeasonSelector from './capsule/SeasonSelector';
import SelectedItemsList from './capsule/SelectedItemsList';
import MainItemSelector from './capsule/MainItemSelector';
import ItemsModal from './capsule/ItemsModal';


interface CapsuleFormProps {
  onSubmit: (id: string, data: CapsuleFormData) => void;
  onGenerateWithAI?: (data: CapsuleFormData) => void; // Optional callback for AI generation
  onCancel: () => void;
  availableItems: WardrobeItem[];
  editCapsule?: Capsule; // Optional capsule for editing mode
}

export interface CapsuleFormData {
  name: string;
  description: string;
  scenario: string; // Kept for backward compatibility
  scenarios?: string[]; // Array of scenario IDs
  seasons: Season[];
  selectedItems: string[];
  mainItemId: string; // ID of the main item (single-select)
}



const CapsuleForm: React.FC<CapsuleFormProps> = ({ onSubmit, onGenerateWithAI, onCancel, availableItems, editCapsule }) => {
  // Always call the hook at the top level, passing null when not editing
  const { itemIds: capsuleItemIds } = useCapsuleItems(editCapsule?.id || null);
  
  // Initialize form state with existing capsule data if provided
  const [name, setName] = useState(editCapsule?.name || '');
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);
  const [customScenario, setCustomScenario] = useState(editCapsule?.scenario || '');
  const [seasons, setSeasons] = useState<Season[]>(editCapsule?.seasons || []);

  // Initialize selectedItems with capsuleItemIds if available, otherwise fall back to selectedItems array
  const [selectedItems, setSelectedItems] = useState<string[]>(
    editCapsule ? 
      (capsuleItemIds.length > 0 ? capsuleItemIds : editCapsule.selectedItems || []) : 
      []
  );
  
  // Update selectedItems when capsuleItemIds changes (for editing mode)
  useEffect(() => {
    if (editCapsule && capsuleItemIds.length > 0) {
      setSelectedItems(capsuleItemIds);
    }
  }, [editCapsule, capsuleItemIds]);
  const [mainItemId, setMainItemId] = useState<string>(editCapsule?.mainItemId || '');
  const [isItemsModalOpen, setIsItemsModalOpen] = useState(false);
  const [isMainItemModalOpen, setIsMainItemModalOpen] = useState(false);
  const [scenariosLoading, setScenariosLoading] = useState(false);
  
  // Filters for item selection
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [colorFilter, setColorFilter] = useState('');
  const [seasonFilter, setSeasonFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState<WardrobeItem[]>(availableItems || []);

  const handleSeasonChange = (season: Season) => {
    if (seasons.includes(season)) {
      setSeasons(seasons.filter(s => s !== season));
    } else {
      setSeasons([...seasons, season]);
    }
  };

  // Handle item selection
  const handleItemChange = (itemId: string) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  // Handle main item selection
  const handleMainItemChange = (itemId: string) => {
    setMainItemId(itemId);
  };

  // Reset filters when modal opens
  const openItemsModal = () => {
    setCategoryFilter('all');
    setColorFilter('');
    setSeasonFilter('all');
    setSearchQuery('');
    setIsItemsModalOpen(true);
  };

  // Open modal for main item selection
  const openMainItemModal = () => {
    setCategoryFilter('all');
    setColorFilter('');
    setSeasonFilter('all');
    setSearchQuery('');
    setIsMainItemModalOpen(true);
  };

  // Fetch scenarios when component mounts
  useEffect(() => {
    const loadScenarios = async () => {
      try {
        setScenariosLoading(true);
        const data = await fetchScenarios();
        setScenarios(data);
        
        // If editing a capsule with a scenario, try to find matching scenario IDs
        if (editCapsule?.scenario) {
          const scenario = editCapsule.scenario; // Store in a local variable to satisfy TypeScript
          const matchingScenarios = data.filter(s => 
            scenario.toLowerCase().includes(s.name.toLowerCase())
          );
          if (matchingScenarios.length > 0) {
            setSelectedScenarios(matchingScenarios.map(s => s.id));
          }
        }
      } catch (err) {
        console.error('Error loading scenarios:', err);
      } finally {
        setScenariosLoading(false);
      }
    };
    
    loadScenarios();
  }, [editCapsule]);
  
  // Handle scenario selection
  const handleScenarioChange = (scenarioId: string) => {
    setSelectedScenarios(prev => 
      prev.includes(scenarioId) 
        ? prev.filter(id => id !== scenarioId) 
        : [...prev, scenarioId]
    );
  };
  
  // Filter items based on selected filters
  React.useEffect(() => {
    if (!availableItems) return;
    
    let filtered = [...availableItems];
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => 
        item.category === categoryFilter
      );
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
        item.season.includes(seasonFilter as Season)
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
  }, [availableItems, categoryFilter, colorFilter, seasonFilter, searchQuery]);

  // Function to prepare form data for submission
  const prepareFormData = (): CapsuleFormData => {
    let scenarioValue = '';
    let scenariosArray: string[] = [];
    
    if (selectedScenarios.length > 0) {
      // Find the names of selected scenarios
      const selectedScenarioNames = scenarios
        .filter(s => selectedScenarios.includes(s.id))
        .map(s => s.name);
      
      // Use the first selected scenario as the primary scenario (for backward compatibility)
      scenarioValue = selectedScenarioNames[0] || '';
      // Store all selected scenario names in the array
      scenariosArray = selectedScenarioNames;
    } else if (customScenario) {
      // If no predefined scenarios are selected but a custom one is entered
      scenarioValue = customScenario;
      scenariosArray = [customScenario];
    }
    
    // Generate a name if the field is empty
    let capsuleName = name.trim();
    if (!capsuleName) {
      // Build name based on available details
      const parts: string[] = [];
      
      // Add seasons if available
      if (seasons.length > 0) {
        const seasonNames = seasons.map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase());
        parts.push(seasonNames.join('/'));
      }
      
      // Add scenario if available
      if (scenarioValue) {
        parts.push(scenarioValue);
      }
      
      // Add "Capsule" at the end
      parts.push('Capsule');
      
      // Join all parts with spaces
      capsuleName = parts.join(' ');
      
      // If we still don't have a name, use a default with timestamp
      if (parts.length <= 1) {
        const date = new Date();
        const month = date.toLocaleString('en-US', { month: 'long' });
        const year = date.getFullYear();
        capsuleName = `${month} ${year} Capsule`;
      }
    }
    
    return {
      name: capsuleName, // Use the generated name if original was empty
      description: '', // Providing empty string as default
      scenario: scenarioValue,
      scenarios: scenariosArray,
      seasons,
      selectedItems,
      mainItemId // Include the mainItemId in the form submission
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (selectedItems.length === 0 && !mainItemId) {
      alert('Please select at least one item for your capsule');
      return;
    }
    
    if (seasons.length === 0) {
      alert('Please select at least one season');
      return;
    }
    
    console.log('[CapsuleForm] Before prepareFormData - mainItemId:', mainItemId);
    console.log('[CapsuleForm] Before prepareFormData - selectedItems:', selectedItems);
    
    const formData = prepareFormData();
    
    console.log('[CapsuleForm] After prepareFormData - formData:', formData);
    console.log('[CapsuleForm] After prepareFormData - mainItemId in formData:', formData.mainItemId);
    
    // If we're editing an existing capsule, pass the ID
    if (editCapsule) {
      console.log('[CapsuleForm] Submitting edit for capsule:', editCapsule.id);
      onSubmit(editCapsule.id, formData);
    } else {
      console.log('[CapsuleForm] Submitting new capsule');
      // For new capsules, pass a placeholder ID that will be ignored
      onSubmit('new', formData);
    }
  };
  
  // Get unique categories and colors for filters
  const categories = availableItems ? availableItems
    .map(item => item.category)
    .filter((category, index, self) => self.indexOf(category) === index) : [];
  const colors = availableItems ? availableItems
    .map(item => item.color)
    .filter((color, index, self) => self.indexOf(color) === index) : [];

  return (
    <form onSubmit={handleSubmit}>
      <FormContainer>
        <FormGroup>
          <Label htmlFor="name">Capsule Name</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Summer 2025 Capsule (leave empty for auto-generation)"
          />
        </FormGroup>

        <ScenarioSelector
          scenarios={scenarios}
          selectedScenarios={selectedScenarios}
          customScenario={customScenario}
          onScenarioChange={handleScenarioChange}
          onCustomScenarioChange={setCustomScenario}
          isLoading={scenariosLoading}
        />

        <SeasonSelector
          selectedSeasons={seasons}
          onSeasonChange={handleSeasonChange}
        />

        <FormGroup>
          <Label>Main Item</Label>
          <MainItemSelector
            mainItemId={mainItemId}
            availableItems={availableItems}
            onMainItemChange={handleMainItemChange}
            onSelectClick={openMainItemModal}
          />
        </FormGroup>

        <FormGroup>
          <Label>Selected Items ({selectedItems.length})</Label>
          <ModernSubmitButton type="button" onClick={openItemsModal}>
            Select Items
          </ModernSubmitButton>
          
          <SelectedItemsList
            selectedItems={selectedItems}
            availableItems={availableItems}
            onItemRemove={handleItemChange}
          />
        </FormGroup>

        <ButtonGroup>
          <ModernCancelButton type="button" onClick={onCancel}>
            Cancel
          </ModernCancelButton>

          <ModernSubmitButton type="submit">
            {editCapsule ? 'Update Capsule' : 'Create Capsule'}
          </ModernSubmitButton>
        </ButtonGroup>
      </FormContainer>

      <ItemsModal
        isOpen={isItemsModalOpen}
        onClose={() => setIsItemsModalOpen(false)}
        items={filteredItems}
        selectedItems={selectedItems}
        onItemSelect={handleItemChange}
        searchQuery={searchQuery}
        categoryFilter={categoryFilter}
        colorFilter={colorFilter}
        seasonFilter={seasonFilter}
        categories={categories}
        colors={colors}
        onSearchChange={setSearchQuery}
        onCategoryChange={setCategoryFilter}
        onColorChange={setColorFilter}
        onSeasonChange={setSeasonFilter}
      />

      {/* Modal for selecting the main item */}
      <ItemsModal
        isOpen={isMainItemModalOpen}
        onClose={() => setIsMainItemModalOpen(false)}
        items={filteredItems}
        selectedItems={mainItemId ? [mainItemId] : []}
        onItemSelect={(itemId) => {
          handleMainItemChange(itemId);
          setIsMainItemModalOpen(false);
        }}
        searchQuery={searchQuery}
        categoryFilter={categoryFilter}
        colorFilter={colorFilter}
        seasonFilter={seasonFilter}
        categories={categories}
        colors={colors}
        onSearchChange={setSearchQuery}
        onCategoryChange={setCategoryFilter}
        onColorChange={setColorFilter}
        onSeasonChange={setSeasonFilter}
        singleSelect={true}
        title="Select Main Item"
      />
    </form>
  );
};

export default CapsuleForm;
