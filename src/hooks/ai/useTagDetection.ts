import { useState } from 'react';
import { DetectedTags } from '../../services/ai/formAutoPopulation/types';

export const useTagDetection = () => {
  const [extractedTags, setExtractedTags] = useState<DetectedTags | null>(null);

  // Convert Ximilar tags to DetectedTags format
  // const convertToDetectedTagsFormat = (tags: Record<string, string>): DetectedTags => {
  //   console.log('[useTagDetection] Converting tags to DetectedTags format:', tags);
    
  //   // Extract all available tags
  //   const allTags = Object.values(tags);
    
  //   // Create the result object with proper typing
  //   const raw_tag_confidences: { [key: string]: number } = {};
    
  //   // Add dummy confidences for all tags
  //   allTags.forEach(tag => {
  //     raw_tag_confidences[tag] = 0.9; // Assume high confidence
  //   });

  //   const result: DetectedTags = {
  //     general_tags: allTags,
  //     fashion_tags: allTags, // Use same tags for fashion category
  //     color_tags: tags.color ? [tags.color] : [],
  //     raw_tag_confidences
  //   };
    
  //   console.log('[useTagDetection] Converted to DetectedTags format:', result);
  //   return result;
  // };
  
  // Function to fetch tags from Ximilar API for an image
  const fetchTags = async (imageUrl: string): Promise<DetectedTags | null> => {
    // COMMENTED OUT: Ximilar API functionality disabled to avoid 400 errors
    console.log('[useTagDetection] Ximilar tag detection disabled - skipping API call');
    return null;
    
    /* ORIGINAL XIMILAR INTEGRATION - COMMENTED OUT
    try {
      console.log('[useTagDetection] Fetching tags for image from Ximilar API');
      
      let processedImageUrl = imageUrl;
      
      // Handle blob URLs by converting to data URL first
      if (imageUrl.startsWith('blob:')) {
        console.log('[useTagDetection] Converting blob URL to processable format');
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        processedImageUrl = URL.createObjectURL(blob);
      }
      
      // Call Ximilar API
      const tags = await detectImageTags(processedImageUrl);
      console.log('[useTagDetection] Raw tags from Ximilar:', tags);
      
      if (!tags) {
        console.log('[useTagDetection] No tags detected');
        return null;
      }
      
      // Extract top tags using the existing utility
      const topTags = extractTopTags(tags);
      console.log('[useTagDetection] Top tags extracted:', topTags);
      
      // Convert to DetectedTags format
      const detectedTags = convertToDetectedTagsFormat(topTags);
      setExtractedTags(detectedTags);
      
      return detectedTags;
    } catch (error) {
      console.error('[useTagDetection] Error detecting tags:', error);
      return null;
    }
    */
  };

  return {
    extractedTags,
    fetchTags,
    setExtractedTags
  };
};
