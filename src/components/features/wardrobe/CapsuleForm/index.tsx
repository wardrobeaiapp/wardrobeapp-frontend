import React from 'react';
import { WardrobeItem } from '../../../../types';
import { Capsule } from '../../../../types';
import {
  FormContainer
} from '../CapsuleForm.styles';

// Custom hooks
import { useCapsuleFormState } from './hooks/useCapsuleFormState';
import { useItemFiltering } from './hooks/useItemFiltering';
import { useScenarioHandling } from './hooks/useScenarioHandling';
import { useCapsuleValidation } from './hooks/useCapsuleValidation';

// UI Components
import BasicInfoSection from './components/BasicInfoSection';
import ItemSelectionSection from './components/ItemSelectionSection';
import FormActions from './components/FormActions';

// Existing components
import ScenarioSelector from '../capsule/ScenarioSelector';
import SeasonSelector from '../capsule/SeasonSelector';
import ItemsModal from '../capsule/ItemsModal';

// Re-export the interface for external use
export type { CapsuleFormData } from './utils/formHelpers';

interface CapsuleFormProps {
  onSubmit: (id: string, data: any) => void; // Using any to avoid circular dependency
  onGenerateWithAI?: (data: any) => void; // Optional callback for AI generation
  onCancel: () => void;
  availableItems: WardrobeItem[];
  editCapsule?: Capsule; // Optional capsule for editing mode
}

const CapsuleForm: React.FC<CapsuleFormProps> = ({ 
  onSubmit, 
  onGenerateWithAI, 
  onCancel, 
  availableItems, 
  editCapsule 
}) => {
  // ✅ Custom Hooks - Clean state management
  const {
    // Form state
    name,
    setName,
    selectedScenarios,
    setSelectedScenarios,
    customScenario,
    setCustomScenario,
    seasons,
    selectedItems,
    mainItemId,
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
  } = useCapsuleFormState({ editCapsule });

  // ✅ Item Filtering Logic
  const {
    categoryFilter,
    setCategoryFilter,
    colorFilter,
    setColorFilter,
    seasonFilter,
    setSeasonFilter,
    searchQuery,
    setSearchQuery,
    filteredItems,
    categories,
    colors,
    resetFilters,
  } = useItemFiltering({ availableItems });

  // ✅ Scenario Management
  const {
    scenarios,
    scenariosLoading,
  } = useScenarioHandling({ editCapsule, setSelectedScenarios });

  // ✅ Form Validation
  const {
    validateForm,
    prepareFormData: prepareFormDataFromHook
  } = useCapsuleValidation({
    name,
    selectedScenarios,
    customScenario,
    seasons,
    selectedItems,
    mainItemId,
    scenarios,
  });

  // ✅ Modal Handlers
  const openItemsModal = () => {
    resetFilters();
    setIsItemsModalOpen(true);
  };

  const openMainItemModal = () => {
    resetFilters();
    setIsMainItemModalOpen(true);
  };

  // ✅ Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
      return;
    }
    
    console.log('[CapsuleForm] Before prepareFormData - mainItemId:', mainItemId);
    console.log('[CapsuleForm] Before prepareFormData - selectedItems:', selectedItems);
    
    const formData = prepareFormDataFromHook();
    
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

  return (
    <form onSubmit={handleSubmit}>
      <FormContainer>
        {/* ✅ Basic Info Section */}
        <BasicInfoSection
          name={name}
          setName={setName}
        />

        {/* ✅ Scenario Selection */}
        <ScenarioSelector
          scenarios={scenarios}
          selectedScenarios={selectedScenarios}
          customScenario={customScenario}
          onScenarioChange={handleScenarioChange}
          onCustomScenarioChange={setCustomScenario}
          isLoading={scenariosLoading}
        />

        {/* ✅ Season Selection */}
        <SeasonSelector
          selectedSeasons={seasons}
          onSeasonChange={handleSeasonChange}
        />

        {/* ✅ Item Selection Section */}
        <ItemSelectionSection
          mainItemId={mainItemId}
          availableItems={availableItems}
          onMainItemChange={handleMainItemChange}
          onOpenMainItemModal={openMainItemModal}
          selectedItems={selectedItems}
          onItemChange={handleItemChange}
          onOpenItemsModal={openItemsModal}
        />

        {/* ✅ Form Actions */}
        <FormActions
          onCancel={onCancel}
          editCapsule={editCapsule}
        />
      </FormContainer>

      {/* ✅ Modals */}
      <ItemsModal
        isOpen={isItemsModalOpen}
        onClose={() => setIsItemsModalOpen(false)}
        items={filteredItems.filter(item => item.id !== mainItemId)} // Exclude main item from selection
        selectedItems={selectedItems}
        onItemSelect={handleItemChange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        colorFilter={colorFilter}
        onColorChange={setColorFilter}
        seasonFilter={seasonFilter}
        onSeasonChange={setSeasonFilter}
        categories={categories}
        colors={colors}
        title="Select Items"
      />

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
        onSearchChange={setSearchQuery}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        colorFilter={colorFilter}
        onColorChange={setColorFilter}
        seasonFilter={seasonFilter}
        onSeasonChange={setSeasonFilter}
        categories={categories}
        colors={colors}
        singleSelect={true}
        title="Select Main Item"
      />
    </form>
  );
};

export default CapsuleForm;
