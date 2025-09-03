import { useState, useEffect, useCallback } from 'react';
import { useSupabaseAuth } from '../../context/SupabaseAuthContext';
import * as calendarService from '../../services/calendar/supabaseCalendarService';
import { formatDateToYYYYMMDD } from '../../utils/calendarUtils';

// Local interface for state management
export interface LocalDayPlan {
  date: Date | string;
  outfitIds: string[];
  itemIds: string[]; // Now populated from day_plan_items join table
  notes?: string;
  id?: string; // Supabase record ID
}

export const useCalendar = () => {
  const { user } = useSupabaseAuth();
  const [dayPlans, setDayPlans] = useState<LocalDayPlan[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load day plans from Supabase on component mount and migrate localStorage data if needed
  useEffect(() => {
    const fetchDayPlans = async () => {
      if (!user) {
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        // First check if we have any Supabase plans
        const supabasePlans = await calendarService.getDayPlans(user.id);
        
        // Check if we need to migrate data from localStorage
        const savedDayPlans = localStorage.getItem('dayPlans');
        const needsMigration = savedDayPlans && supabasePlans.length === 0;
        
        if (needsMigration) {
          await migrateLocalStorageToSupabase(savedDayPlans, user.id);
          // Fetch again after migration
          const updatedPlans = await calendarService.getDayPlans(user.id);
          
          // Convert Supabase data to local format
          const localPlans = updatedPlans.map(plan => ({
            id: plan.id,
            date: new Date(plan.date), // Convert ISO string to Date object
            outfitIds: plan.outfitIds,
            itemIds: plan.itemIds,
            notes: plan.notes || ''
          }));
          
          setDayPlans(localPlans);
          // Clear localStorage after successful migration
          localStorage.removeItem('dayPlans');
        } else {
          // No migration needed, just use Supabase data
          const localPlans = supabasePlans.map(plan => ({
            id: plan.id,
            date: new Date(plan.date), // Convert ISO string to Date object
            outfitIds: plan.outfitIds,
            itemIds: plan.itemIds,
            notes: plan.notes || ''
          }));
          
          setDayPlans(localPlans);
        }
      } catch (err) {
        // Error handling for fetching day plans
        setError('Failed to load calendar data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDayPlans();
  }, [user]);

  // Helper function to migrate localStorage data to Supabase
  const migrateLocalStorageToSupabase = async (savedDayPlans: string, userId: string) => {
    try {
      // Parse localStorage data
      const parsedPlans = JSON.parse(savedDayPlans);
      
      // Create each plan in Supabase
      for (const plan of parsedPlans) {
        const dateString = new Date(plan.date).toISOString().split('T')[0];
        
        // The itemIds will be handled by the service via the join table
        await calendarService.createDayPlan({
          userId,
          date: dateString,
          outfitIds: plan.outfitIds,
          itemIds: plan.itemIds, // Service will add these to the join table
          notes: plan.notes || ''
        });
      }
      
      return true;
    } catch (err) {
      // Error handling for migrating localStorage data
      return false;
    }
  };

  // Find day plan for a specific date
  const findDayPlanForDate = useCallback((date: Date): LocalDayPlan | undefined => {
    // Use our improved date formatting function from calendarUtils
    const dateFormatted = formatDateToYYYYMMDD(date);
    
    return dayPlans.find(plan => {
      // Handle both Date objects and string dates
      let planDateStr = '';
      
      if (plan.date instanceof Date) {
        planDateStr = formatDateToYYYYMMDD(plan.date);
      } else if (typeof plan.date === 'string') {
        // If it's already a string, normalize it
        // This handles both ISO strings and YYYY-MM-DD formats
        const tempDate = new Date(plan.date);
        planDateStr = formatDateToYYYYMMDD(tempDate);
      }
      
      return planDateStr === dateFormatted;
    });
  }, [dayPlans]);

  // Save a day plan
  const saveDayPlan = useCallback(async (
    date: Date,
    outfitIds: string[],
    itemIds: string[],
    notes: string
  ): Promise<boolean> => {
    if (!user) {
      return false;
    }
    
    if (outfitIds.length === 0 && itemIds.length === 0) {
      return false;
    }
    
    try {
      // Format date using our consistent date formatter
      const dateString = formatDateToYYYYMMDD(date);
      
      // First check if there's a plan in the database that might not be in our local state
      let existingDbPlan;
      try {
        existingDbPlan = await calendarService.getDayPlanByDate(user.id, dateString);
      } catch (err) {
        existingDbPlan = null;
      }
      
      // Check if there's already a day plan for this date in our local state
      const existingPlanIndex = dayPlans.findIndex(
        plan => (plan.date instanceof Date ? plan.date.toISOString().split('T')[0] : plan.date.split('T')[0]) === dateString
      );
      
      let updatedPlan;
      
      if (existingPlanIndex >= 0 || existingDbPlan) {
        // Get the plan ID either from local state or from the DB
        const planId = existingPlanIndex >= 0 
          ? dayPlans[existingPlanIndex].id 
          : existingDbPlan?.id;
          
        if (!planId) {
          throw new Error('Cannot update day plan: ID is missing');
        }
        
        // Update existing day plan in Supabase
        // The service will handle updating the join table for itemIds
        updatedPlan = await calendarService.updateDayPlan(planId, {
          outfitIds,
          itemIds, // Service will update the join table with these items
          notes,
          userId: user.id // Pass userId for join table operations
        });
        
        // Update local state
        if (existingPlanIndex >= 0) {
          // Update existing plan in local state
          const updatedDayPlans = [...dayPlans];
          updatedDayPlans[existingPlanIndex] = {
            id: updatedPlan.id,
            date,
            outfitIds,
            itemIds, // These now come from the join table
            notes
          };
          setDayPlans(updatedDayPlans);
        } else {
          // Add the plan to local state if it wasn't there
          setDayPlans([
            ...dayPlans,
            {
              id: updatedPlan.id,
              date,
              outfitIds,
              itemIds, // These now come from the join table
              notes
            }
          ]);
        }
      } else {
        // Use upsert for reliable save
        // The service will handle adding items to the join table
        const newPlan = await calendarService.upsertDayPlan({
          userId: user.id,
          date: dateString,
          outfitIds,
          itemIds, // Service will add these to the join table
          notes
        });
        
        // Update local state
        setDayPlans([
          ...dayPlans,
          {
            id: newPlan.id,
            date,
            outfitIds,
            itemIds, // These now come from the join table
            notes
          }
        ]);
        
        // Local state updated with new plan
      }
      
      return true;
    } catch (err) {
      // Error handling for saving day plan
      return false;
    }
  }, [dayPlans, user]);

  // Delete a day plan
  const deleteDayPlan = useCallback(async (dayPlanId: string): Promise<boolean> => {
    if (!user) {
      return false;
    }
    
    try {
      // The service will handle deleting items from the join table
      await calendarService.deleteDayPlan(dayPlanId);
      
      // Update local state
      setDayPlans(prevPlans => 
        prevPlans.filter(plan => plan.id !== dayPlanId)
      );
      
      return true;
    } catch (error) {
      // Error handling for day plan deletion
      return false;
    }
  }, [user]);

  // Delete a day plan by date
  const deleteDayPlanByDate = useCallback(async (date: Date): Promise<boolean> => {
    
    if (!user) {
      return false;
    }
    
    const dayPlan = findDayPlanForDate(date);
    
    if (!dayPlan) {
      return false;
    }
    
    try {
      // Delete from Supabase if we have an ID
      if (dayPlan.id) {
        // The service will handle deleting items from the join table
        await calendarService.deleteDayPlan(dayPlan.id);
      } else {
        // Fallback to delete by date if no ID (shouldn't happen with Supabase integration)
        const dateString = date.toISOString().split('T')[0];
        // The service will handle deleting items from the join table
        await calendarService.deleteDayPlanByDate(user.id, dateString);
      }
      
      // Update local state
      setDayPlans(
        dayPlans.filter(plan => {
          if (plan.date instanceof Date) {
            return plan.date.toISOString().split('T')[0] !== date.toISOString().split('T')[0];
          } else {
            return plan.date.split('T')[0] !== date.toISOString().split('T')[0];
          }
        })
      );
      return true;
    } catch (err) {
      return false;
    }
  }, [dayPlans, findDayPlanForDate, user]);

  return {
    dayPlans,
    isLoading,
    error,
    findDayPlanForDate,
    saveDayPlan,
    deleteDayPlan,
    deleteDayPlanByDate
  };
};

export default useCalendar;
