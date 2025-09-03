import { useState, useEffect } from 'react';
import { Season } from '../../../../../../types';
import { Capsule } from '../../../../../../types';
import { useCapsuleItems } from '../../../../../../hooks/wardrobe/capsules/useCapsuleItems';

export interface UseCapsuleFormStateProps {
  editCapsule?: Capsule;
}

export interface UseCapsuleFormStateReturn {
  // Form state
  name: string;
  setName: (name: string) => void;
  selectedScenarios: string[];
  setSelectedScenarios: React.Dispatch<React.SetStateAction<string[]>>;
  customScenario: string;
  setCustomScenario: (scenario: string) => void;
  seasons: Season[];
  setSeasons: (seasons: Season[]) => void;
  selectedItems: string[];
  setSelectedItems: (items: string[]) => void;
  mainItemId: string;
  setMainItemId: (id: string) => void;
  
  // Modal state
  isItemsModalOpen: boolean;
  setIsItemsModalOpen: (open: boolean) => void;
  isMainItemModalOpen: boolean;
  setIsMainItemModalOpen: (open: boolean) => void;
  
  // Handlers
  handleSeasonChange: (season: Season | 'all') => void;
  handleItemChange: (itemIds: string | string[]) => void;
  handleMainItemChange: (itemId: string) => void;
  handleScenarioChange: (scenarioId: string) => void;
}

export const useCapsuleFormState = ({ 
  editCapsule 
}: UseCapsuleFormStateProps): UseCapsuleFormStateReturn => {
  // Always call the hook at the top level, passing null when not editing
  const { itemIds: capsuleItemIds } = useCapsuleItems(editCapsule?.id || null);
  
  // Initialize form state with existing capsule data if provided
  const [name, setName] = useState(editCapsule?.name || '');
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>(
    editCapsule?.scenarios || []
  );
  const [customScenario, setCustomScenario] = useState('');
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

  // Handle season changes
  const handleSeasonChange = (season: Season | 'all') => {
    if (season === 'all') {
      setSeasons([]);
    } else if (seasons.includes(season)) {
      setSeasons(seasons.filter(s => s !== season));
    } else {
      setSeasons([...seasons, season]);
    }
  };

  // Handle item selection (supports both single and multiple items)
  const handleItemChange = (itemIds: string | string[]) => {
    const ids = Array.isArray(itemIds) ? itemIds : [itemIds];
    setSelectedItems(prev => {
      const newItems = [...prev];
      ids.forEach(id => {
        const index = newItems.indexOf(id);
        if (index === -1) {
          newItems.push(id);
        } else {
          newItems.splice(index, 1);
        }
      });
      return newItems;
    });
  };

  // Handle main item selection
  const handleMainItemChange = (itemId: string) => {
    setMainItemId(itemId);
  };
  
  // Handle scenario selection
  const handleScenarioChange = (scenarioId: string) => {
    setSelectedScenarios(prev => 
      prev.includes(scenarioId) 
        ? prev.filter(id => id !== scenarioId) 
        : [...prev, scenarioId]
    );
  };

  return {
    // Form state
    name,
    setName,
    selectedScenarios,
    setSelectedScenarios,
    customScenario,
    setCustomScenario,
    seasons,
    setSeasons,
    selectedItems,
    setSelectedItems,
    mainItemId,
    setMainItemId,
    
    // Modal state
    isItemsModalOpen,
    setIsItemsModalOpen,
    isMainItemModalOpen,
    setIsMainItemModalOpen,
    
    // Handlers
    handleSeasonChange,
    handleItemChange,
    handleMainItemChange,
    handleScenarioChange,
  };
};
