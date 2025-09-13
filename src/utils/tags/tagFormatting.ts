/**
 * Converts Ximilar tags format to the DetectedTags format expected by FormAutoPopulationService
 * @param tags Record of tag types to tag values
 * @returns Formatted tags object for auto-population
 */
export const convertToDetectedTagsFormat = (tags: Record<string, string>): any => {
  // Extract all available tags
  const allTags = Object.values(tags);
  
  // Categorize tags
  const result = {
    general_tags: allTags,
    fashion_tags: [] as string[],
    color_tags: [] as string[],
    dominant_colors: [] as string[],
    pattern_tags: [] as string[],
    raw_tag_confidences: {} as Record<string, number>
  };

  // Fashion tags - copy from general for now
  result.fashion_tags = [...allTags];
  
  // Extract color tags
  if (tags.color) {
    result.color_tags.push(tags.color);
    result.dominant_colors.push(tags.color);
  }
  
  // Extract pattern tags
  if (tags.pattern) {
    result.pattern_tags.push(tags.pattern);
  }
  
  // Add dummy confidences for all tags
  allTags.forEach(tag => {
    result.raw_tag_confidences[tag] = 0.9; // Assume high confidence
  });
  
  console.log('[tagFormatting] Converted to DetectedTags format:', result);
  return result;
};
