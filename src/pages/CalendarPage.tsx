import React, { useState } from 'react';
import PageHeader from '../components/Header/Header';
import { 
  PageContainer,
  CalendarLayout,
  SidebarContainer,
  SidebarCard,
  SidebarTitle,
  SidebarDate,
  ActionButton,
  SecondaryButton,
  OutfitContainer,
  QuickActionsContainer
} from './CalendarPage.styles';

// Import calendar components
import CalendarView from '../components/Calendar/CalendarView';
import OutfitSelectionPopup from '../components/Calendar/OutfitSelectionPopup';
import ItemSelectionPopup from '../components/Calendar/ItemSelectionPopup';
import DateSelectionPopup from '../components/Calendar/DateSelectionPopup';
import EditOutfitPopup from '../components/Calendar/EditOutfitPopup';
import { useWardrobe } from '../context/WardrobeContext';
import useCalendar from '../hooks/useCalendar';
import { WardrobeItem } from '../types';


const CalendarPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { items, outfits } = useWardrobe();
  const { dayPlans, isLoading, error, saveDayPlan } = useCalendar();
  
  // State for popups
  const [outfitPopupVisible, setOutfitPopupVisible] = useState<boolean>(false);
  const [itemPopupVisible, setItemPopupVisible] = useState<boolean>(false);
  const [datePopupVisible, setDatePopupVisible] = useState<boolean>(false);
  const [editOutfitPopupVisible, setEditOutfitPopupVisible] = useState<boolean>(false);
  
  // Get the day plan for the selected date
  const selectedDayPlan = dayPlans.find(plan => 
    new Date(plan.date).toDateString() === selectedDate.toDateString()
  );
  
  // Get selected outfits and items for the selected date
  const selectedOutfitIds = selectedDayPlan?.outfitIds || [];
  const selectedItemIds = selectedDayPlan?.itemIds || [];
  
  // handleSaveDayPlan function removed to fix ESLint warning
  
  // Handlers for outfit selection
  const handleSaveOutfits = async (outfitIds: string[]) => {
    await saveDayPlan(
      selectedDate,
      outfitIds,
      selectedItemIds,
      '' // Empty notes
    );
  };
  
  // Handlers for item selection
  const handleSaveItems = async (itemIds: string[]) => {
    await saveDayPlan(
      selectedDate,
      selectedOutfitIds,
      itemIds,
      '' // Empty notes
    );
  };
  
  // Handler for copying from another date
  const handleCopyFromDate = async (sourceDate: Date) => {
    // Find the day plan for the source date
    const sourceDayPlan = dayPlans.find(plan => 
      new Date(plan.date).toDateString() === sourceDate.toDateString()
    );
    
    if (sourceDayPlan) {
      // Copy outfits and items from source date to selected date
      await saveDayPlan(
        selectedDate,
        sourceDayPlan.outfitIds || [], 
        sourceDayPlan.itemIds || [],
        '' // Empty notes
      );
    }
  };
  
  return (
    <>
      <PageHeader title="Outfit Calendar" />
      <PageContainer>
        <h2>Outfit Calendar</h2>
        <p>Plan your outfits and track your wardrobe usage</p>
        
        <CalendarLayout>
          {/* Main Calendar Block */}
          {isLoading ? (
            <div>Loading calendar data...</div>
          ) : error ? (
            <div>
              <p>Error loading calendar: {error}</p>
              <button onClick={() => window.location.reload()}>Retry</button>
            </div>
          ) : (
            <CalendarView 
              selectedDate={selectedDate}
              onDateChange={(date) => setSelectedDate(date)}
              dayPlans={dayPlans}
            />
          )}
          
          {/* Sidebar */}
          <SidebarContainer>
            {/* Selected Date's Outfit Block */}
            <SidebarCard>
              <SidebarTitle>{selectedDate.toDateString() === new Date().toDateString() ? "Today's Outfit" : "Selected Outfit"}</SidebarTitle>
              <SidebarDate>{selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</SidebarDate>
              
              {/* Find day plan for selected date */}
              {(() => {
                const dayPlan = dayPlans.find(plan => 
                  new Date(plan.date).toDateString() === selectedDate.toDateString()
                );
                
                // Get selected outfits and items
                const selectedOutfitIds = dayPlan?.outfitIds || [];
                const selectedItemIds = dayPlan?.itemIds || [];
                
                const selectedOutfits = outfits.filter(outfit => selectedOutfitIds.includes(outfit.id));
                const selectedItems = items.filter(item => selectedItemIds.includes(item.id));
                
                if (selectedOutfits.length === 0 && selectedItems.length === 0) {
                  return (
                    <div style={{ marginBottom: '1rem', textAlign: 'center', padding: '1rem' }}>
                      <p>No outfit or items planned for this date.</p>
                    </div>
                  );
                }
                
                return (
                  <OutfitContainer>
                    {/* Display selected outfits */}
                    {selectedOutfits.map(outfit => (
                      <div key={outfit.id} style={{ marginBottom: '1rem' }}>
                        <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>{outfit.name}</div>
                        {/* Get the actual item objects from the item IDs in the outfit */}
                        {outfit.items.map(itemId => {
                          const item = items.find(i => i.id === itemId);
                          if (!item) return null;
                          return (
                            <div key={item.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                              <div style={{ 
                                width: '30px', 
                                height: '30px', 
                                borderRadius: '4px', 
                                backgroundColor: item.color || '#c4b5fd', 
                                marginRight: '0.75rem' 
                              }}></div>
                              <div>
                                <div style={{ fontWeight: '500' }}>{item.name}</div>
                                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{item.category}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                    
                    {/* Display selected individual items */}
                    {selectedItems.map(item => (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <div style={{ 
                          width: '30px', 
                          height: '30px', 
                          borderRadius: '4px', 
                          backgroundColor: item.color || '#c4b5fd', 
                          marginRight: '0.75rem' 
                        }}></div>
                        <div>
                          <div style={{ fontWeight: '500' }}>{item.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{item.category}</div>
                        </div>
                      </div>
                    ))}
                  </OutfitContainer>
                );
              })()}
              
              <button 
                style={{ 
                  width: '100%', 
                  padding: '0.5rem', 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '0.375rem',
                  cursor: 'pointer'
                }}
                onClick={() => setEditOutfitPopupVisible(true)}
              >
                Edit Outfit
              </button>
            </SidebarCard>
            
            {/* Quick Actions Block */}
            <QuickActionsContainer>
              <SidebarTitle>Quick Actions</SidebarTitle>
              
              <ActionButton onClick={() => setOutfitPopupVisible(true)}>
                <span>+</span> Add Outfit
              </ActionButton>
              
              <SecondaryButton onClick={() => setItemPopupVisible(true)}>
                <span>+</span> Add Item
              </SecondaryButton>
              
              <SecondaryButton onClick={() => setDatePopupVisible(true)}>
                <span>↺</span> Copy from Date
              </SecondaryButton>
            </QuickActionsContainer>
          </SidebarContainer>
        </CalendarLayout>
      </PageContainer>

      {/* Selection Popups */}
      <OutfitSelectionPopup
        visible={outfitPopupVisible}
        outfits={outfits}
        selectedOutfitIds={selectedOutfitIds}
        onSave={handleSaveOutfits}
        onClose={() => setOutfitPopupVisible(false)}
      />

      <ItemSelectionPopup
        visible={itemPopupVisible}
        items={items}
        selectedItemIds={selectedItemIds}
        onSave={handleSaveItems}
        onClose={() => setItemPopupVisible(false)}
      />

      <DateSelectionPopup
        isVisible={datePopupVisible}
        onClose={() => setDatePopupVisible(false)}
        onSelectDate={handleCopyFromDate}
        currentDate={selectedDate}
      />
      
      <EditOutfitPopup
        visible={editOutfitPopupVisible}
        date={selectedDate}
        outfitItems={[
          ...selectedOutfitIds.flatMap(outfitId => {
            const outfit = outfits.find(o => o.id === outfitId);
            return outfit ? outfit.items.map(itemId => items.find(item => item.id === itemId)).filter(Boolean) : [];
          }),
          ...selectedItemIds.map(itemId => items.find(item => item.id === itemId)).filter(Boolean)
        ].filter((item): item is WardrobeItem => item !== undefined)}
        allItems={items}
        onSave={async (itemIds) => {
          // Save only the selected items (no outfits)
          await saveDayPlan(
            selectedDate,
            [], // No outfits, only individual items
            itemIds,
            '' // Empty notes
          );
          setEditOutfitPopupVisible(false);
        }}
        onClose={() => setEditOutfitPopupVisible(false)}
      />
    </>
  );
};

export default CalendarPage;
