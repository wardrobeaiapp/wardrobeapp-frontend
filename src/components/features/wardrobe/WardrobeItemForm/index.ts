// Export the main modular component
export { default as WardrobeItemForm } from './WardrobeItemForm';

// Export modular sub-components for potential reuse
export { ImageUploadSection } from './components/ImageUploadSection';
export { BasicInfoFields } from './components/BasicInfoFields';
export { DetailsFields } from './components/DetailsFields';
export { FormActions } from './components/FormActions';

// Export hooks for potential reuse
export { useWardrobeItemForm } from './hooks/useWardrobeItemForm';
export { useImageHandling } from './hooks/useImageHandling';
