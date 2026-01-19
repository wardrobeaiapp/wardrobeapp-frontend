const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = process.env.SUPABASE_URL || 'https://gujpqecwdftbwkcnwiup.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1anBxZWN3ZGZ0YndrY253aXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTU0NDksImV4cCI6MjA2ODA5MTQ0OX0.1_ViFuaH4PAiTk_QkSm7S9srp1rQa_Zv7D2a8pJx5So';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateWishlistStatusConstraint() {
  try {
    console.log('🔄 Updating wishlist_status constraint...');
    
    // First, let's check current constraint
    const checkConstraintQuery = `
      SELECT constraint_name, check_clause 
      FROM information_schema.check_constraints 
      WHERE constraint_name LIKE '%wish%' 
        OR constraint_name LIKE '%valid%';
    `;
    
    console.log('📋 Checking existing constraints...');
    const { data: constraints, error: constraintError } = await supabase.rpc('exec_sql', {
      query: checkConstraintQuery
    });
    
    if (constraintError) {
      console.log('❗ Could not check constraints (this is normal):', constraintError.message);
    } else {
      console.log('Current constraints:', constraints);
    }
    
    // Update the constraint to allow 'not_recommended'
    const updateQuery = `
      -- Drop existing constraint if it exists
      ALTER TABLE wardrobe_items DROP CONSTRAINT IF EXISTS valid_wishlist_status;
      ALTER TABLE wardrobe_items DROP CONSTRAINT IF EXISTS valid_wish;
      
      -- Add updated constraint with all valid values
      ALTER TABLE wardrobe_items 
      ADD CONSTRAINT valid_wishlist_status 
      CHECK (wishlist_status IN ('approved', 'potential_issue', 'not_reviewed', 'not_recommended'));
    `;
    
    const { data, error } = await supabase.rpc('exec_sql', {
      query: updateQuery
    });
    
    if (error) {
      console.error('❌ Error updating constraint:', error);
      
      // Try alternative approach with individual queries
      console.log('🔄 Trying alternative approach...');
      
      const dropQuery1 = "ALTER TABLE wardrobe_items DROP CONSTRAINT IF EXISTS valid_wishlist_status";
      const dropQuery2 = "ALTER TABLE wardrobe_items DROP CONSTRAINT IF EXISTS valid_wish";  
      const addQuery = "ALTER TABLE wardrobe_items ADD CONSTRAINT valid_wishlist_status CHECK (wishlist_status IN ('approved', 'potential_issue', 'not_reviewed', 'not_recommended'))";
      
      await supabase.rpc('exec_sql', { query: dropQuery1 });
      await supabase.rpc('exec_sql', { query: dropQuery2 });
      const { error: addError } = await supabase.rpc('exec_sql', { query: addQuery });
      
      if (addError) {
        console.error('❌ Alternative approach also failed:', addError);
        return false;
      }
    }
    
    console.log('✅ Database constraint updated successfully!');
    console.log('🎯 The wishlist_status field now accepts: approved, potential_issue, not_reviewed, not_recommended');
    return true;
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

// Run the update
updateWishlistStatusConstraint()
  .then(success => {
    console.log(success ? '🎉 Migration completed!' : '❌ Migration failed!');
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('💥 Fatal error:', err);
    process.exit(1);
  });
