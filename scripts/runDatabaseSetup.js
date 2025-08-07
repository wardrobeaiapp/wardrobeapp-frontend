// Script to run the SQL for creating the wardrobe_items table
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration - same as in your app
const supabaseUrl = 'https://gujpqecwdftbwkcnwiup.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1anBxZWN3ZGZ0YndrY253aXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTU0NDksImV4cCI6MjA2ODA5MTQ0OX0.1_ViFuaH4PAiTk_QkSm7S9srp1rQa_Zv7D2a8pJx5So';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Read the SQL file
const sqlFilePath = path.join(__dirname, '..', 'db', 'create_wardrobe_items_table.sql');
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

// Function to run the SQL
async function runDatabaseSetup() {
  try {
    console.log('Starting database setup...');
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('pgcrypto_setup');
    
    if (error) {
      console.error('Error setting up pgcrypto extension:', error);
      return;
    }
    
    // Split the SQL into separate statements
    // This is a simple approach - for more complex SQL you might need a proper SQL parser
    const statements = sqlContent
      .replace(/--.*$/gm, '') // Remove comments
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);
    
    // Execute each statement
    for (const statement of statements) {
      console.log(`Executing SQL statement: ${statement.substring(0, 50)}...`);
      const { error } = await supabase.rpc('run_sql', { sql: statement });
      
      if (error) {
        console.error('Error executing SQL:', error);
        console.error('Failed statement:', statement);
        return;
      }
    }
    
    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Unexpected error during database setup:', error);
  }
}

// Create a stored procedure to run arbitrary SQL (if it doesn't exist)
async function createRunSqlFunction() {
  try {
    console.log('Creating run_sql function...');
    
    const createFunctionSql = `
    CREATE OR REPLACE FUNCTION run_sql(sql text)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE sql;
    END;
    $$;
    `;
    
    const { error } = await supabase.rpc('run_sql_setup', { 
      sql: createFunctionSql 
    });
    
    if (error) {
      console.error('Error creating run_sql function:', error);
    } else {
      console.log('run_sql function created successfully');
    }
  } catch (error) {
    console.error('Unexpected error creating run_sql function:', error);
  }
}

// Create a stored procedure to enable the pgcrypto extension (if it doesn't exist)
async function createPgcryptoSetupFunction() {
  try {
    console.log('Creating pgcrypto_setup function...');
    
    const { error } = await supabase.rpc('create_pgcrypto_setup');
    
    if (error) {
      console.error('Error creating pgcrypto_setup function:', error);
      
      // Try to create it directly
      const createFunctionSql = `
      CREATE OR REPLACE FUNCTION pgcrypto_setup()
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        CREATE EXTENSION IF NOT EXISTS pgcrypto;
      END;
      $$;
      `;
      
      const { error: directError } = await supabase.rpc('run_sql_direct', { 
        sql: createFunctionSql 
      });
      
      if (directError) {
        console.error('Error creating pgcrypto_setup function directly:', directError);
      } else {
        console.log('pgcrypto_setup function created successfully');
      }
    } else {
      console.log('pgcrypto_setup function exists');
    }
  } catch (error) {
    console.error('Unexpected error creating pgcrypto_setup function:', error);
  }
}

// Create a function to create the initial setup functions
async function createSetupFunctions() {
  try {
    console.log('Creating initial setup functions...');
    
    const createFunctionSql = `
    CREATE OR REPLACE FUNCTION run_sql_setup(sql text)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE sql;
    END;
    $$;
    
    CREATE OR REPLACE FUNCTION create_pgcrypto_setup()
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      CREATE EXTENSION IF NOT EXISTS pgcrypto;
    END;
    $$;
    `;
    
    // Use the REST API directly since we don't have the functions yet
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/run_sql_direct`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({ sql: createFunctionSql })
    });
    
    if (!response.ok) {
      console.error('Error creating initial setup functions:', await response.text());
      console.log('You may need to run the SQL manually in the Supabase dashboard');
    } else {
      console.log('Initial setup functions created successfully');
    }
  } catch (error) {
    console.error('Unexpected error creating initial setup functions:', error);
    console.log('You may need to run the SQL manually in the Supabase dashboard');
  }
}

// Main function
async function main() {
  try {
    // Try to create the initial setup functions
    await createSetupFunctions();
    
    // Create the run_sql function
    await createRunSqlFunction();
    
    // Create the pgcrypto setup function
    await createPgcryptoSetupFunction();
    
    // Run the database setup
    await runDatabaseSetup();
    
    console.log('All operations completed');
  } catch (error) {
    console.error('Error in main function:', error);
  }
}

// Run the main function
main();
