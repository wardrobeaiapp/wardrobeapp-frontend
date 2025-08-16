import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { CalendarWrapper, DotIndicator } from '../../../pages/CalendarPage.styles';

interface DayPlan {
  id?: string;
  date: Date | string;
  outfitIds?: string[];
  itemIds?: string[];
  notes?: string;
}

interface CalendarViewProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  dayPlans: DayPlan[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ 
  selectedDate, 
  onDateChange, 
  dayPlans 
}) => {
  // Custom tile content to show indicators for days with planned outfits or items
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') {
      return null;
    }
    
    // Check if there's a day plan for this date
    const dayPlan = dayPlans.find(
      plan => new Date(plan.date).toDateString() === date.toDateString()
    );
    
    if (!dayPlan) {
      return null;
    }
    
    // Show different indicators based on what's planned
    const hasOutfits = dayPlan.outfitIds && dayPlan.outfitIds.length > 0;
    const hasItems = dayPlan.itemIds && dayPlan.itemIds.length > 0;
    
    if (hasOutfits && hasItems) {
      // Both outfits and items
      return (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '5px' }}>
          <DotIndicator color="#4a90e2" />
          <DotIndicator color="#50c878" style={{ marginLeft: '3px' }} />
        </div>
      );
    } else if (hasOutfits) {
      // Only outfits
      return (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '5px' }}>
          <DotIndicator color="#4a90e2" />
        </div>
      );
    } else if (hasItems) {
      // Only items
      return (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '5px' }}>
          <DotIndicator color="#50c878" />
        </div>
      );
    }
    
    return null;
  };

  return (
    <CalendarWrapper>
      <Calendar 
        onChange={(value) => {
          if (value instanceof Date) {
            onDateChange(value);
          }
        }} 
        value={selectedDate} 
        tileContent={tileContent}
        locale="en-US"
      />
    </CalendarWrapper>
  );
};

export default CalendarView;
