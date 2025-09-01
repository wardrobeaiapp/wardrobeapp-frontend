// Type declarations for the calendar services - non-relative module names
declare module 'dayPlanItemsService' {
  export function getItemsForDayPlan(dayPlanId: string): Promise<string[]>;
  export function updateDayPlanItems(dayPlanId: string, itemIds: string[], userId: string): Promise<boolean>;
  export function addItemToDayPlan(dayPlanId: string, itemId: string, userId: string): Promise<boolean>;
  export function removeItemFromDayPlan(dayPlanId: string, itemId: string): Promise<boolean>;
  export function deleteAllItemsForDayPlan(dayPlanId: string): Promise<boolean>;
}

declare module 'dayPlanOutfitsService' {
  export function getOutfitIdsForDayPlan(dayPlanId: string): Promise<string[]>;
  export function addOutfitsToDayPlan(dayPlanId: string, outfitIds: string[], userId: string): Promise<boolean>;
  export function updateOutfitsForDayPlan(dayPlanId: string, outfitIds: string[], userId: string): Promise<boolean>;
  export function removeOutfitsFromDayPlan(dayPlanId: string): Promise<boolean>;
  export function getDayPlansForOutfit(outfitId: string, userId: string): Promise<string[]>;
}
