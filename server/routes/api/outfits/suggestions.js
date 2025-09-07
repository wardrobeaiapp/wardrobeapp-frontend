const express = require('express');
const router = express.Router();
const auth = require('../../../middleware/auth');

// @route   POST /api/outfit-suggestions
// @desc    Generate outfit suggestions
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { wardrobeItems, occasion, season, preferences } = req.body;

    // Simple validation
    if (!wardrobeItems || !Array.isArray(wardrobeItems) || wardrobeItems.length === 0) {
      return res.status(400).json({ message: 'Wardrobe items are required' });
    }

    // In a real implementation, this would use AI to generate outfit suggestions
    // For this example, we'll just create some basic combinations

    // Filter items by season if provided
    let filteredItems = wardrobeItems;
    if (season && season.length > 0) {
      filteredItems = wardrobeItems.filter(item => 
        item.season && item.season.some(s => season.includes(s))
      );
    }

    // Filter items by occasion if provided
    if (occasion && occasion.length > 0) {
      filteredItems = filteredItems.filter(item => 
        item.occasion && item.occasion.some(o => occasion.includes(o))
      );
    }

    // Categorize items
    const topItems = filteredItems.filter(item => item.category === 'top' || item.category === 'shirt');
    const bottomItems = filteredItems.filter(item => item.category === 'bottom' || item.category === 'pants' || item.category === 'skirt');
    const outerItems = filteredItems.filter(item => item.category === 'outer' || item.category === 'jacket');
    const dressItems = filteredItems.filter(item => item.category === 'dress');
    const shoesItems = filteredItems.filter(item => item.category === 'shoes');
    const accessoryItems = filteredItems.filter(item => item.category === 'accessory');

    // Generate outfits (simple combinations for demo)
    const outfits = [];
    
    // Add dress-based outfits
    dressItems.forEach(dress => {
      // Find matching shoes
      const matchingShoes = shoesItems.filter(shoes => true); // Simple example - all shoes match
      
      // Find matching accessories
      const matchingAccessories = accessoryItems.filter(accessory => true); // Simple example
      
      if (matchingShoes.length > 0) {
        outfits.push({
          id: `outfit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          name: `${dress.name} outfit`,
          items: [
            dress,
            matchingShoes[0],
            ...(matchingAccessories.length > 0 ? [matchingAccessories[0]] : [])
          ],
          occasion: occasion || [],
          season: season || [],
          generatedAt: new Date().toISOString()
        });
      }
    });
    
    // Add top+bottom based outfits
    topItems.forEach(top => {
      bottomItems.forEach(bottom => {
        // Find matching outerwear if appropriate for season
        const useOuter = season && (season.includes('fall') || season.includes('winter'));
        const matchingOuter = useOuter && outerItems.length > 0 ? [outerItems[0]] : [];
        
        // Find matching shoes
        const matchingShoes = shoesItems.filter(shoes => true); // Simple example
        
        if (matchingShoes.length > 0) {
          outfits.push({
            id: `outfit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            name: `${top.name} with ${bottom.name}`,
            items: [
              top,
              bottom,
              ...matchingOuter,
              matchingShoes[0]
            ],
            occasion: occasion || [],
            season: season || [],
            generatedAt: new Date().toISOString()
          });
        }
      });
    });

    // Return generated outfits
    res.json(outfits);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
