# Implementing Row Level Security (RLS) in Supabase

This guide explains how to enable Row Level Security (RLS) for your Supabase database and run the migration script with the necessary permissions.

## What is Row Level Security?

Row Level Security (RLS) is a feature that allows you to control access to rows in a database table based on the user executing a query. This is essential for multi-tenant applications where users should only have access to their own data.

## Steps to Enable RLS

1. **Get your Supabase Service Role Key**:
   - Go to your Supabase project dashboard
   - Navigate to Project Settings > API
   - Copy the "service_role" key (keep this secure, it has admin privileges)

2. **Run the RLS SQL Script**:
   - Open the Supabase SQL Editor
   - Copy and paste the contents of `enable_rls.sql` into the editor
   - Run the script to enable RLS and create the necessary policies

3. **Update Environment Variables**:
   - Create a `.env` file in the project root (if it doesn't exist)
   - Add your service role key: `SUPABASE_SERVICE_ROLE_KEY=your-service-role-key`
   - Make sure `.env` is in your `.gitignore` file to avoid exposing the key

## Running the Migration Script

The migration script needs admin privileges to bypass RLS. Run it with:

```bash
# Make sure you have ts-node installed
npm install -g ts-node typescript

# Run the migration script with the service role key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key ts-node src/scripts/migrateScenarios.ts
```

## RLS Policies Created

The `enable_rls.sql` script creates the following policies:

1. **For user_profiles table**:
   - Users can view their own profile
   - Users can update their own profile

2. **For scenarios table**:
   - Users can view their own scenarios
   - Users can insert their own scenarios
   - Users can update their own scenarios
   - Users can delete their own scenarios

## Security Considerations

- Never expose your service role key in client-side code
- Always use the regular Supabase client for user-facing applications
- Only use the service role key for admin scripts and server-side operations
- Consider implementing additional authorization checks in your application code

## Troubleshooting

If you encounter permission errors after enabling RLS:
1. Check that your RLS policies are correctly defined
2. Verify that your tables have the expected `user_id` column
3. Ensure your authentication is working correctly
4. For admin operations, confirm you're using the service role key
