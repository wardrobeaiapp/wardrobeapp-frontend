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
  currentItems: WardrobeItem[] | Outfit[] | Capsule[];
  filteredItems: WardrobeItem[];
  filteredOutfits: Outfit[];
  filteredCapsules: Capsule[];
  isLoading: boolean;
  error: string | null;
  itemCount?: number;
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
  currentItems,
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
  onViewItem = () => {
    console.log('[TabContent] Default onViewItem handler called - this should NOT happen');
  },
  onViewOutfit = () => {
    console.log('[TabContent] Default onViewOutfit handler called - this should NOT happen');
  },
  onDeleteOutfit = () => {},
  onViewCapsule = () => {
    console.log('[TabContent] Default onViewCapsule handler called - this should NOT happen');
  },
  onDeleteCapsule = () => {},
}) => {
  // Use currentItems for the active tab, falling back to individual filtered lists
  const items = activeTab === TabType.ITEMS || activeTab === TabType.WISHLIST 
    ? (currentItems as WardrobeItem[]) 
    : [];
  const outfits = activeTab === TabType.OUTFITS 
    ? (currentItems as Outfit[]) 
    : [];
  const capsules = activeTab === TabType.CAPSULES 
    ? (currentItems as Capsule[]) 
    : [];

  switch (activeTab) {
    case TabType.ITEMS:
      return (
        <ItemsTab
          items={items}
          itemCount={items.length}
          isLoading={isLoading}
          error={error}
          categoryFilter={categoryFilter}
          seasonFilter={seasonFilter}
          searchQuery={searchQuery}
          scenarioFilter={scenarioFilter}
          setCategoryFilter={setCategoryFilter}
          setSeasonFilter={setSeasonFilter}
          setSearchQuery={setSearchQuery}
          setScenarioFilter={setScenarioFilter}
          onViewItem={onViewItem}
          onEditItem={onEditItem}
          onDeleteItem={onDeleteItem}
          onAddItem={onAddItem}
          disableMockDataCheck={false}
        />
      );
    case TabType.OUTFITS:
      return (
        <OutfitsTab
          outfits={outfits}
          wardrobeItems={items as WardrobeItem[]}
          isLoading={isLoading}
          error={error}
          seasonFilter={typeof seasonFilter === 'string' ? seasonFilter : 'all'}
          setSeasonFilter={setSeasonFilter}
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
          capsules={capsules}
          wardrobeItems={items as WardrobeItem[]}
          isLoading={isLoading}
          error={error}
          seasonFilter={typeof seasonFilter === 'string' ? seasonFilter : 'all'}
          setSeasonFilter={setSeasonFilter}
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
          onViewItem={onViewItem}
          onEditItem={onEditItem}
          onDeleteItem={onDeleteItem}
          onAddItem={onAddItem}
          disableMockDataCheck={false}
        />
      );
    default:
      return null;
  }
};

export default TabContent;
