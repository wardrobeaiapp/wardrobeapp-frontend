const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

/**
 * @route POST /api/extract-fashion-tags
 * @desc Extract fashion tags from an image
 * @access Private
 */
router.post('/', async (req, res) => {
  try {
    console.log('[API] Extract fashion tags endpoint hit');
    
    // Check if request body is empty
    if (!req.body || !req.body.imageBase64) {
      console.error('[API] Missing imageBase64 in request body');
      return res.status(400).json({ error: 'Missing imageBase64 in request body' });
    }
    
    // Get the image data from the request
    const { imageBase64 } = req.body;
    
    // Check for Ximilar API token - use a mock token for development if not available
    const apiToken = process.env.REACT_APP_XIMILAR_TOKEN || process.env.XIMILAR_TOKEN;
    if (!apiToken) {
      console.warn('[API] XIMILAR_TOKEN not found in environment variables - using mock data');
      
      // Return mock data for development purposes
      const mockTags = {
        category: 'TOP',
        subCategory: 'BLOUSE',
        seasons: ['SUMMER', 'SPRING'],
        colors: ['BLUE'],
        patterns: [],
        materials: ['COTTON'],
        style: 'CASUAL',
        gender: 'FEMALE',
        details: {
          'Category': 'TOP',
          'Sub-Category': 'BLOUSE',
          'Season': 'SUMMER',
          'Color': 'BLUE',
          'Material': 'COTTON',
          'Style': 'CASUAL',
          'Gender': 'FEMALE'
        }
      };
      
      // Log the mock response
      console.log('[API] Returning mock tags response:', mockTags);
      
      // Return mock data
      return res.json({ tags: mockTags });
    }
    
    try {
      console.log('[API] Sending request to Ximilar API...');
      
      // Send the request to Ximilar API
      const response = await fetch('https://api.ximilar.com/tagging/fashion/v2/tags', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          records: [
            {
              _base64: imageBase64
            },
          ],
          settings: {
            min_score: 0.5, // Minimum confidence threshold
          },
        }),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('[API] Ximilar API Error:', {
          status: response.status,
          statusText: response.statusText,
          response: responseData
        });
        return res.status(response.status).json({ error: responseData.message || 'Error from Ximilar API' });
      }

      console.log('[API] Ximilar API Response received');
      
      // Process the response to extract relevant tags
      const record = responseData.records?.[0];
      
      if (!record) {
        return res.status(500).json({ error: 'No records found in API response' });
      }
      
      // Extract tags from response
      let tags = {};
      
      // First try _tags_map if available
      if (record._tags_map) {
        tags = { ...record._tags_map };
      } 
      // Fallback to _tags if available
      else if (record._tags) {
        Object.entries(record._tags).forEach(([category, tagList]) => {
          if (Array.isArray(tagList)) {
            const topTag = tagList
              .filter(tag => tag && tag.name && tag.prob >= 0.5)
              .sort((a, b) => b.prob - a.prob)[0];
            if (topTag) {
              tags[category] = topTag.name;
            }
          }
        });
      }
      
      // Process tags for client-side use
      // Map the raw tags to a more structured format for the client
      const processedTags = {
        category: tags['Category'] || tags['Top Category'] || '',
        subCategory: tags['Sub-Category'] || tags['Category Level 2'] || '',
        seasons: [],
        colors: [],
        patterns: [],
        materials: [],
        style: tags['Style'] || '',
        gender: tags['Gender'] || '',
        details: {}
      };
      
      // Process seasons
      if (tags['Season']) {
        processedTags.seasons = Array.isArray(tags['Season']) 
          ? tags['Season'] 
          : [tags['Season']];
      }
      
      // Process colors
      if (tags['Color']) {
        processedTags.colors = Array.isArray(tags['Color']) 
          ? tags['Color'] 
          : [tags['Color']];
      }
      
      // Process patterns
      if (tags['Pattern']) {
        processedTags.patterns = Array.isArray(tags['Pattern']) 
          ? tags['Pattern'] 
          : [tags['Pattern']];
      }
      
      // Process materials
      if (tags['Material']) {
        processedTags.materials = Array.isArray(tags['Material']) 
          ? tags['Material'] 
          : [tags['Material']];
      }
      
      // Include all raw tags in details for reference
      processedTags.details = tags;
      
      console.log('[API] Processed tags:', processedTags);
      
      // Return the processed tags
      return res.json({ tags: processedTags });
      
    } catch (fetchError) {
      console.error('[API] Fetch error:', fetchError);
      return res.status(500).json({ 
        error: 'Error communicating with Ximilar API', 
        details: fetchError.message 
      });
    }
  } catch (error) {
    console.error('[API] Extract fashion tags error:', error);
    return res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
});

module.exports = router;
