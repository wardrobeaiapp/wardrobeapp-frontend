// Type declarations for dayPlanItemsService
export function getItemsForDayPlan(dayPlanId: string): Promise<string[]>;
export function updateDayPlanItems(dayPlanId: string, itemIds: string[], userId: string): Promise<boolean>;
export function addItemToDayPlan(dayPlanId: string, itemId: string, userId: string): Promise<boolean>;
export function removeItemFromDayPlan(dayPlanId: string, itemId: string): Promise<boolean>;
export function deleteItemsForDayPlan(dayPlanId: string): Promise<boolean>;
