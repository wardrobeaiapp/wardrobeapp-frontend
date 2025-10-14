export interface SelectedPersona {
  userId: string;
  name: string;
  title: string;
  selectedAt: string;
}

export const getSelectedPersona = (): SelectedPersona | null => {
  try {
    const stored = localStorage.getItem('selectedPersona');
    if (stored) {
      return JSON.parse(stored);
    }
    return null;
  } catch (error) {
    console.error('Error retrieving selected persona:', error);
    return null;
  }
};

export const clearSelectedPersona = (): void => {
  localStorage.removeItem('selectedPersona');
};

// Function to log persona selection for analytics
export const trackPersonaSelection = (persona: { userId: string; name: string; title: string }) => {
  // You can extend this to send to your analytics service
  console.log('Analytics: Persona selected', {
    event: 'persona_selected',
    userId: persona.userId,
    personaName: persona.name,
    personaTitle: persona.title,
    timestamp: new Date().toISOString()
  });
  
  // Example: Send to analytics service
  // analytics.track('persona_selected', {
  //   userId: persona.userId,
  //   personaName: persona.name,
  //   personaTitle: persona.title
  // });
};
