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
  { id: DemoStep.INTRO, title: 'How It Works', required: false },
  { id: DemoStep.PERSONA, title: 'Pick a Persona', required: true },
  { id: DemoStep.WARDROBE, title: 'Explore Their Wardrobe', required: false },
  { id: DemoStep.AI_CHECK, title: 'Test the AI', required: false },
  { id: DemoStep.WAITLIST, title: 'Get Early Access', required: false }
];
