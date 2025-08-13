import React, { useMemo } from 'react';
import {
  StatsCard,
  StatsTitle,
  StatsList,
  StatItem,
  StatLabel,
  StatValue
} from './WeeklyStats.styles';
import { LocalDayPlan } from '../../../hooks/useCalendar';

interface WeeklyStatsProps {
  dayPlans: LocalDayPlan[];
  itemsUsed?: number;
  repeats?: number;
}

// Helper function to get the start and end dates of the current week
// For this example, we're hardcoding to match the calendar in the screenshot (July 2025)
const getCurrentWeekBounds = (): { start: Date, end: Date } => {
  // Hardcode to July 20, 2025 (the date in the screenshot)
  const fixedDate = new Date(2025, 6, 20); // July 20, 2025 (months are 0-indexed)
  
  // Start from Sunday (day 0) of the current week
  const start = new Date(fixedDate);
  const dayOfWeek = start.getDay();
  start.setDate(start.getDate() - dayOfWeek); // Go back to Sunday
  start.setHours(0, 0, 0, 0); // Start of day
  
  // End on Saturday (day 6) of the current week
  const end = new Date(fixedDate);
  end.setDate(end.getDate() + (6 - dayOfWeek)); // Go forward to Saturday
  end.setHours(23, 59, 59, 999); // End of day
  
  return { start, end };
};

// Helper function to check if a date is within the current week
const isDateInCurrentWeek = (date: Date | string): boolean => {
  const currentDate = typeof date === 'string' ? new Date(date) : date;
  const { start, end } = getCurrentWeekBounds();
  return currentDate >= start && currentDate <= end;
};

const WeeklyStats: React.FC<WeeklyStatsProps> = ({
  dayPlans,
  itemsUsed = 12,
  repeats = 2
}) => {
  // Calculate the number of days in the current week with outfits or items assigned
  const outfitsPlanned = useMemo(() => {
    // If no day plans are provided, return default value
    if (!dayPlans || dayPlans.length === 0) {
      return "0/7";
    }
    
    // Get the current week's date range
    const { start, end } = getCurrentWeekBounds();
    
    // Filter plans to only include those from the current week
    const thisWeekPlans = dayPlans.filter(plan => {
      // Convert the plan date to a Date object if it's a string
      const planDate = typeof plan.date === 'string' ? new Date(plan.date) : plan.date;
      
      // Compare dates by string to ignore time
      return planDate.toDateString() >= start.toDateString() && 
             planDate.toDateString() <= end.toDateString();
    });
    
    // Count days that have either outfits or items assigned
    const daysWithPlans = thisWeekPlans.filter(plan => {
      const hasOutfits = plan.outfitIds && plan.outfitIds.length > 0;
      const hasItems = plan.itemIds && plan.itemIds.length > 0;
      return hasOutfits || hasItems;
    }).length;
    
    // Return the actual count of days with plans
    return `${daysWithPlans}/7`;
  }, [dayPlans]);

  return (
    <StatsCard>
      <StatsTitle>This Week</StatsTitle>
      <StatsList>
        <StatItem>
          <StatLabel>Outfits planned</StatLabel>
          <StatValue>{outfitsPlanned}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Items used</StatLabel>
          <StatValue>{itemsUsed}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Repeats</StatLabel>
          <StatValue color="#22c55e">{repeats}</StatValue>
        </StatItem>
      </StatsList>
    </StatsCard>
  );
};

export default WeeklyStats;
