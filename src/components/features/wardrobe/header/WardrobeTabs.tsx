import React from 'react';
import { TabType } from '../../../../hooks/home';
import { TabsContainer, Tab } from '../../../../pages/HomePage.styles';
import { MdCheckroom, MdOutlineStyle, MdOutlineWorkspaces, MdFavoriteBorder } from 'react-icons/md';

type WardrobeTabsProps = {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
};

const WardrobeTabs: React.FC<WardrobeTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <TabsContainer>
      <Tab 
        $active={activeTab === TabType.ITEMS}
        $type="items"
        onClick={() => onTabChange(TabType.ITEMS)}
      >
        <MdCheckroom />
        Wardrobe Items
      </Tab>
      <Tab 
        $active={activeTab === TabType.OUTFITS}
        $type="outfits"
        onClick={() => onTabChange(TabType.OUTFITS)}
      >
        <MdOutlineStyle />
        Outfits
      </Tab>
      <Tab 
        $active={activeTab === TabType.CAPSULES}
        $type="capsules"
        onClick={() => onTabChange(TabType.CAPSULES)}
      >
        <MdOutlineWorkspaces />
        Capsules
      </Tab>
      <Tab 
        $active={activeTab === TabType.WISHLIST}
        $type="wishlist"
        onClick={() => onTabChange(TabType.WISHLIST)}
      >
        <MdFavoriteBorder />
        Wishlist
      </Tab>
    </TabsContainer>
  );
};

export default WardrobeTabs;
