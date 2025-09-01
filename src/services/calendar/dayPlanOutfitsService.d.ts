// Type declarations for dayPlanOutfitsService
export function getOutfitIdsForDayPlan(dayPlanId: string): Promise<string[]>;
export function addOutfitsToDayPlan(dayPlanId: string, outfitIds: string[], userId: string): Promise<boolean>;
export function updateOutfitsForDayPlan(dayPlanId: string, outfitIds: string[], userId: string): Promise<boolean>;
export function removeOutfitFromDayPlan(dayPlanId: string, outfitId: string): Promise<boolean>;
export function deleteOutfitsForDayPlan(dayPlanId: string): Promise<boolean>;
