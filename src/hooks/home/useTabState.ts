import { useState, useCallback } from 'react';

export enum TabType {
  ITEMS = 'items',
  OUTFITS = 'outfits',
  CAPSULES = 'capsules',
  WISHLIST = 'wishlist'
}

export const useTabState = (initialTab: TabType = TabType.ITEMS) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  return {
    activeTab,
    setActiveTab: handleTabChange,
    isItemsTab: activeTab === TabType.ITEMS,
    isOutfitsTab: activeTab === TabType.OUTFITS,
    isCapsulesTab: activeTab === TabType.CAPSULES,
    isWishlistTab: activeTab === TabType.WISHLIST
  };
};

export type UseTabStateReturn = ReturnType<typeof useTabState>;
