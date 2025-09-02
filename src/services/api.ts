import {
  fetchOutfits,
  createOutfit,
  updateOutfit,
  deleteOutfit
} from './wardrobe/outfits/outfitService';
import {
  fetchCapsules,
  createCapsule,
  updateCapsule,
  deleteCapsule
} from './wardrobe/capsules/capsuleService';
import {
  getScenariosForUser as fetchScenarios,
  updateScenarios,
  createScenario,
  updateScenario,
  deleteScenario
} from './scenarios/scenariosService';

// Re-export all the service functions
export { 
  // Outfits
  fetchOutfits,
  createOutfit,
  updateOutfit,
  deleteOutfit,
  
  // Capsules
  fetchCapsules,
  createCapsule,
  updateCapsule,
  deleteCapsule,
  
  // Scenarios
  fetchScenarios, 
  updateScenarios, 
  createScenario, 
  updateScenario, 
  deleteScenario 
};
