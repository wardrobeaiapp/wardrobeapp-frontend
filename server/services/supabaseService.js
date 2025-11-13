const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://gujpqecwdftbwkcnwiup.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1anBxZWN3ZGZ0YndrY253aXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTU0NDksImV4cCI6MjA2ODA5MTQ0OX0.1_ViFuaH4PAiTk_QkSm7S9srp1rQa_Zv7D2a8pJx5So';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Get all wardrobe items for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of wardrobe items
 */
const getUserWardrobeItems = async (userId) => {
  const { data, error } = await supabase
    .from('wardrobe_items')
    .select('*')
    .eq('user_id', userId)
    .order('date_added', { ascending: false });

  if (error) {
    console.error('Supabase error:', error);
    throw new Error('Failed to fetch items from database');
  }

  return data || [];
};

/**
 * Create a new wardrobe item
 * @param {Object} itemData - Item data in Supabase format
 * @returns {Promise<Object>} - Created item
 */
const createWardrobeItem = async (itemData) => {
  console.log('Saving item to Supabase with mapped data:', itemData);
  
  const { data, error } = await supabase
    .from('wardrobe_items')
    .insert([itemData])
    .select();

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(`Failed to save item to database: ${error.message}`);
  }

  if (!data || data.length === 0) {
    throw new Error('No data returned from database');
  }

  const newItem = data[0];
  console.log('Item saved successfully to Supabase with ID:', newItem.id);
  console.log('Final closure value in saved item:', newItem.closure);
  console.log('Final imageUrl in saved item:', newItem.image_url);
  
  return newItem;
};

/**
 * Get a specific wardrobe item by ID and user
 * @param {string} itemId - Item ID
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} - Item or null if not found
 */
const getWardrobeItemById = async (itemId, userId) => {
  const { data, error } = await supabase
    .from('wardrobe_items')
    .select('*')
    .eq('id', itemId)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // Not found
      return null;
    }
    console.error('Supabase error:', error);
    throw new Error('Failed to fetch item from database');
  }

  return data;
};

/**
 * Update a wardrobe item
 * @param {string} itemId - Item ID
 * @param {string} userId - User ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} - Updated item or null
 */
const updateWardrobeItem = async (itemId, userId, updates) => {
  const { data, error } = await supabase
    .from('wardrobe_items')
    .update(updates)
    .eq('id', itemId)
    .eq('user_id', userId)
    .select();

  if (error) {
    console.error('Supabase error:', error);
    throw new Error('Failed to update item in database');
  }

  if (!data || data.length === 0) {
    return null;
  }

  return data[0];
};

/**
 * Delete a wardrobe item
 * @param {string} itemId - Item ID
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} - True if deleted successfully
 */
const deleteWardrobeItem = async (itemId, userId) => {
  const { error } = await supabase
    .from('wardrobe_items')
    .delete()
    .eq('id', itemId)
    .eq('user_id', userId);

  if (error) {
    console.error('Supabase error:', error);
    throw new Error('Failed to delete item from database');
  }

  return true;
};

module.exports = {
  supabase,
  getUserWardrobeItems,
  createWardrobeItem,
  getWardrobeItemById,
  updateWardrobeItem,
  deleteWardrobeItem
};
