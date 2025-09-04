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
  categoryFilter: string;
  seasonFilter: string | string[];
  statusFilter?: WishlistStatus | 'all';
  searchQuery: string;
  setCategoryFilter: (category: string) => void;
  setSeasonFilter: (season: string | string[]) => void;
  setStatusFilter?: (status: WishlistStatus | 'all') => void;
  setSearchQuery: (query: string) => void;
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
  categoryFilter,
  seasonFilter,
  statusFilter = 'all',
  searchQuery,
  setSearchQuery,
  setCategoryFilter,
  setSeasonFilter,
  setStatusFilter = () => {},
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
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          seasonFilter={seasonFilter}
          setSeasonFilter={setSeasonFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
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
          scenarioFilter=""
          setScenarioFilter={() => {}}
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
          scenarioFilter=""
          setScenarioFilter={() => {}}
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
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          seasonFilter={seasonFilter}
          setSeasonFilter={setSeasonFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
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
