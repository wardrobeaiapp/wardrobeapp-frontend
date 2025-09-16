import { WardrobeItem, Scenario } from '../../../types';
import { calculateScenarioCoverage } from './coverageCalculator';
import { saveScenarioCoverage } from './coverageStorage';

export { calculateScenarioCoverage } from './coverageCalculator';
export type { CategoryCoverage, ScenarioCoverage } from './coverageCalculator';

export class ScenarioCoverageService {
  private static instance: ScenarioCoverageService;
  
  private constructor() {}

  public static getInstance(): ScenarioCoverageService {
    if (!ScenarioCoverageService.instance) {
      ScenarioCoverageService.instance = new ScenarioCoverageService();
    }
    return ScenarioCoverageService.instance;
  }

  /**
   * Recalculate and save scenario coverage
   */
  public async updateScenarioCoverage(
    userId: string,
    items: WardrobeItem[],
    scenarios: Scenario[]
  ): Promise<void> {
    try {
      console.log('🟦 SCENARIO COVERAGE - Starting coverage update');
      
      // Calculate coverage
      const coverageResults = await calculateScenarioCoverage(userId, items, scenarios);
      
      // Save to database
      await saveScenarioCoverage(userId, coverageResults);
      
      console.log('🟢 SCENARIO COVERAGE - Coverage update completed successfully');
    } catch (error) {
      console.error('🔴 SCENARIO COVERAGE - Error updating coverage:', error);
      throw error;
    }
  }

  /**
   * Handle item added event
   */
  public async onItemAdded(
    userId: string,
    items: WardrobeItem[],
    scenarios: Scenario[],
    newItem: WardrobeItem
  ): Promise<void> {
    console.log('🟦 SCENARIO COVERAGE - Handling item added:', newItem.name);
    await this.updateScenarioCoverage(userId, items, scenarios);
  }

  /**
   * Handle item updated event
   */
  public async onItemUpdated(
    userId: string,
    items: WardrobeItem[],
    scenarios: Scenario[],
    oldItem: WardrobeItem,
    newItem: WardrobeItem
  ): Promise<void> {
    console.log('🟦 SCENARIO COVERAGE - Handling item updated:', newItem.name);
    await this.updateScenarioCoverage(userId, items, scenarios);
  }

  /**
   * Handle item deleted event
   */
  public async onItemDeleted(
    userId: string,
    items: WardrobeItem[],
    scenarios: Scenario[],
    deletedItem: WardrobeItem
  ): Promise<void> {
    console.log('🟦 SCENARIO COVERAGE - Handling item deleted:', deletedItem.name);
    await this.updateScenarioCoverage(userId, items, scenarios);
  }
}
