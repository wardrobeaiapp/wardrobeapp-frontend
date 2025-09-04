import { WardrobeItem, Outfit, Capsule } from '../../types';
import { TabType } from './useTabState';

export interface HomePageData {
  // Data
  items: WardrobeItem[];
  filteredItems: WardrobeItem[];
  filteredOutfits: Outfit[];
  filteredCapsules: Capsule[];
  
  // Tab state
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  
  // Filter states
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  seasonFilter: string[];
  setSeasonFilter: (seasons: string[]) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Modal states
  isDeleteConfirmModalOpen: boolean;
  setIsDeleteConfirmModalOpen: (isOpen: boolean) => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (isOpen: boolean) => void;
  isEditModalOpen: boolean;
  setIsEditModalOpen: (isOpen: boolean) => void;
  isAddOutfitModalOpen: boolean;
  setIsAddOutfitModalOpen: (isOpen: boolean) => void;
  isEditOutfitModalOpen: boolean;
  setIsEditOutfitModalOpen: (isOpen: boolean) => void;
  isViewOutfitModalOpen: boolean;
  setIsViewOutfitModalOpen: (isOpen: boolean) => void;
  isViewCapsuleModalOpen: boolean;
  setIsViewCapsuleModalOpen: (isOpen: boolean) => void;
  isEditCapsuleModalOpen: boolean;
  setIsEditCapsuleModalOpen: (isOpen: boolean) => void;
  isAddCapsuleModalOpen: boolean;
  setIsAddCapsuleModalOpen: (isOpen: boolean) => void;
  isViewItemModalOpen: boolean;
  setIsViewItemModalOpen: (isOpen: boolean) => void;
  
  // Selected items
  selectedOutfit: Outfit | null;
  selectedCapsule: Capsule | null;
  currentOutfit: Outfit | null;
  currentItem: WardrobeItem | null;
  selectedItem: WardrobeItem | null;
  
  // Handlers
  setCurrentOutfitId: (id: string | null) => void;
  setSelectedCapsule: (capsule: Capsule | null) => void;
  setSelectedOutfit: (outfit: Outfit | null) => void;
  
  // Event handlers
  handleAddItem: () => void;
  handleViewItem: (item: WardrobeItem) => void;
  handleEditItem: (item: WardrobeItem) => void;
  handleDeleteItem: (item: WardrobeItem) => void;
  handleViewOutfit: (outfit: Outfit) => void;
  handleEditOutfit: (outfit: Outfit) => void;
  handleDeleteOutfit: (outfit: Outfit) => void;
  handleViewCapsule: (capsule: Capsule) => void;
  handleEditCapsule: (capsule: Capsule) => void;
  handleEditCapsuleSubmit: (data: any) => void; // Replace 'any' with actual type
  handleDeleteCapsule: (capsule: Capsule) => void;
  handleSubmitAdd: (data: any) => void; // Replace 'any' with actual type
  handleSubmitEdit: (data: any) => void; // Replace 'any' with actual type
  handleAddOutfit: () => void;
  handleEditOutfitSubmit: (data: any) => void; // Replace 'any' with actual type
  handleAddCapsule: () => void;
  
  // Other properties from the hook
  itemToDelete: WardrobeItem | null;
  confirmDeleteItem: () => Promise<void>;
}
