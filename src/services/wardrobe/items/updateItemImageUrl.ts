import { supabase } from '../../../services/core';

// Update existing item's image URL and expiry after refresh
export const updateItemImageUrl = async (itemId: string, newImageUrl: string, newExpiry: Date): Promise<void> => {
  const { error } = await supabase
    .from('wardrobe_items')
    .update({ 
      image_url: newImageUrl,
      image_expiry: newExpiry.toISOString()
    })
    .eq('id', itemId);
    
  if (error) {
    console.error('[updateItemImageUrl] Failed to update image URL:', error);
    throw error;
  }
  
  console.log('[updateItemImageUrl] Updated cached image URL for item:', itemId);
};
