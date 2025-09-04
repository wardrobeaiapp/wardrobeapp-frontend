import React from 'react';
import { TabType } from '../../../../hooks/home';
import ItemsTab from '../tabs/ItemsTab';
import OutfitsTab from '../tabs/OutfitsTab';
import CapsulesTab from '../tabs/CapsulesTab';
import WishlistTab from '../tabs/WishlistTab';
import { WardrobeItem, Outfit, Capsule, WishlistStatus } from '../../../../types';

interface TabContentProps {
  activeTab: TabType;
  items: WardrobeItem[];
  filteredItems: WardrobeItem[];
  filteredOutfits: any[]; // Update with proper type
  filteredCapsules: any[]; // Update with proper type
  isLoading: boolean;
  error: string | null;
  // Filters
  categoryFilter: string;
  seasonFilter: string | string[];
  statusFilter?: WishlistStatus | 'all';
  searchQuery: string;
  scenarioFilter?: string;
  // Filter handlers
  setCategoryFilter: (category: string) => void;
  setSeasonFilter: (season: string | string[]) => void;
  setStatusFilter?: (status: WishlistStatus | 'all') => void;
  setSearchQuery: (query: string) => void;
  setScenarioFilter?: (scenario: string) => void;
  onAddItem: () => void;
  onEditItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onViewItem?: (item: WardrobeItem) => void;
  onViewOutfit?: (outfit: Outfit) => void;
  onDeleteOutfit?: (id: string) => void;
  onViewCapsule?: (capsule: Capsule) => void;
  onDeleteCapsule?: (id: string) => void;
};

const TabContent: React.FC<TabContentProps> = ({
  activeTab,
  items,
  filteredItems,
  filteredOutfits = [],
  filteredCapsules = [],
  isLoading,
  error,
  // Filters
  categoryFilter,
  seasonFilter,
  statusFilter = 'all',
  searchQuery,
  scenarioFilter = 'all',
  // Filter handlers
  setSearchQuery,
  setCategoryFilter,
  setSeasonFilter,
  setStatusFilter = () => {},
  setScenarioFilter = () => {},
  // Action handlers
  onAddItem,
  onEditItem,
  onDeleteItem = () => {},
  onViewItem = () => {},
  onViewOutfit = () => {},
  onDeleteOutfit = () => {},
  onViewCapsule = () => {},
  onDeleteCapsule = () => {},
}) => {
  switch (activeTab) {
    case TabType.ITEMS:
      return (
        <ItemsTab
          items={filteredItems}
          isLoading={isLoading}
          error={error}
          // Filters
          categoryFilter={categoryFilter}
          seasonFilter={seasonFilter}
          searchQuery={searchQuery}
          scenarioFilter={scenarioFilter}
          // Filter handlers
          setCategoryFilter={setCategoryFilter}
          setSeasonFilter={setSeasonFilter}
          setSearchQuery={setSearchQuery}
          setScenarioFilter={setScenarioFilter}
          // Action handlers
          onViewItem={onViewItem}
          onEditItem={onEditItem}
          onDeleteItem={onDeleteItem}
        />
      );
    case TabType.OUTFITS:
      return (
        <OutfitsTab 
          outfits={filteredOutfits}
          wardrobeItems={items}
          isLoading={isLoading}
          error={error}
          seasonFilter={Array.isArray(seasonFilter) ? seasonFilter[0] : seasonFilter}
          setSeasonFilter={(season) => setSeasonFilter(season)}
          scenarioFilter={scenarioFilter}
          setScenarioFilter={setScenarioFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onViewOutfit={onViewOutfit}
          onDeleteOutfit={onDeleteOutfit}
        />
      );
    case TabType.CAPSULES:
      return (
        <CapsulesTab 
          capsules={filteredCapsules}
          wardrobeItems={items}
          isLoading={isLoading}
          error={error}
          seasonFilter={Array.isArray(seasonFilter) ? seasonFilter[0] : seasonFilter}
          setSeasonFilter={(season) => setSeasonFilter(season)}
          scenarioFilter={scenarioFilter}
          setScenarioFilter={setScenarioFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onViewCapsule={onViewCapsule}
          onDeleteCapsule={onDeleteCapsule}
        />
      );
    case TabType.WISHLIST:
      return (
        <WishlistTab 
          items={items}
          isLoading={isLoading}
          error={error}
          // Filters
          categoryFilter={categoryFilter}
          seasonFilter={seasonFilter}
          statusFilter={statusFilter}
          searchQuery={searchQuery}
          // Filter handlers
          setCategoryFilter={setCategoryFilter}
          setSeasonFilter={setSeasonFilter}
          setStatusFilter={setStatusFilter}
          setSearchQuery={setSearchQuery}
          // Action handlers
          onViewItem={onViewItem}
          onEditItem={onEditItem}
          onDeleteItem={onDeleteItem}
          onAddItem={onAddItem}
        />
      );
    default:
      return null;
  }
};

export default TabContent;
