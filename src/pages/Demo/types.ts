// Demo step types
export enum DemoStep {
  INTRO = 'intro',
  PERSONA = 'persona', 
  WARDROBE = 'wardrobe',
  AI_CHECK = 'ai-check',
  WAITLIST = 'waitlist'
}

// Demo step configuration
export interface DemoStepConfig {
  id: DemoStep;
  title: string;
  required: boolean;
}

export const DEMO_STEPS: DemoStepConfig[] = [
  { id: DemoStep.INTRO, title: 'Introduction', required: false },
  { id: DemoStep.PERSONA, title: 'Choose Your Type', required: true },
  { id: DemoStep.WARDROBE, title: 'Wardrobe Reality', required: false },
  { id: DemoStep.AI_CHECK, title: 'AI Prevention', required: false },
  { id: DemoStep.WAITLIST, title: 'Get Early Access', required: false }
];
