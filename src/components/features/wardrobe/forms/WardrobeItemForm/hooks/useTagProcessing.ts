import { WardrobeItemFormData } from './useWardrobeItemForm';

type TagRecord = Record<string, string>;

/**
 * Custom hook for processing detected tags in wardrobe items
 */
export const useTagProcessing = () => {
  /**
   * Creates a set of form fields that have been populated with values
   * @param formData The form data containing wardrobe item properties
   * @returns A Set containing lowercase field names that have values
   */
  const getPopulatedFormFields = (formData: WardrobeItemFormData): Set<string> => {
    const populatedFormFields = new Set<string>();
    
    if (formData.category) populatedFormFields.add('category');
    if (formData.color) populatedFormFields.add('color');
    if (formData.pattern) populatedFormFields.add('pattern');
    if (formData.material) populatedFormFields.add('material');
    if (formData.brand) populatedFormFields.add('brand');
    if (formData.subcategory) populatedFormFields.add('subcategory');
    if (formData.silhouette) populatedFormFields.add('silhouette');
    if (formData.length) populatedFormFields.add('length');
    if (formData.sleeves) populatedFormFields.add('sleeves');
    if (formData.style) populatedFormFields.add('style');
    if (formData.rise) populatedFormFields.add('rise');
    if (formData.neckline) populatedFormFields.add('neckline');
    if (formData.heelHeight) populatedFormFields.add('heelheight');
    if (formData.bootHeight) populatedFormFields.add('bootheight');
    if (formData.type) populatedFormFields.add('type');
    
    return populatedFormFields;
  };
  
  /**
   * Processes detected tags to filter out ones that were used to populate form fields
   * @param detectedTags The tags detected from image analysis
   * @param formData The form data containing wardrobe item properties
   * @returns A record of tags that weren't used to populate form fields
   */
  const processDetectedTags = (detectedTags: TagRecord, formData: WardrobeItemFormData): TagRecord => {
    const tags: TagRecord = {};
    const populatedFormFields = getPopulatedFormFields(formData);
    
    // Add only unused detected tags to the tags object
    Object.entries(detectedTags).forEach(([key, value]) => {
      if (value) {
        const normalizedKey = key.toLowerCase();
        // Only include if this tag wasn't used to populate a form field
        if (!populatedFormFields.has(normalizedKey)) {
          tags[normalizedKey] = value;
        }
      }
    });
    
    return tags;
  };
  
  return {
    getPopulatedFormFields,
    processDetectedTags
  };
};
