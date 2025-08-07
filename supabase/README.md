# Supabase Setup Instructions

This directory contains SQL scripts for setting up and migrating data to Supabase.

## Setting Up the Outfits Table

To create the outfits table in your Supabase project:

1. Log in to your Supabase dashboard at https://app.supabase.com
2. Select your project
3. Go to the SQL Editor tab
4. Create a new query
5. Copy and paste the contents of `create_outfits_table.sql` into the editor
6. Run the query

## Table Structure

The outfits table has the following structure:

- `id`: UUID, primary key
- `name`: Text, required
- `items`: Array of strings (item IDs)
- `scenarios`: Array of strings (scenario IDs)
- `season`: Array of strings (seasons)
- `favorite`: Boolean
- `date_created`: Timestamp with timezone
- `last_worn`: Timestamp with timezone (nullable)
- `user_uuid`: UUID, foreign key to auth.users
- `created_at`: Timestamp with timezone
- `updated_at`: Timestamp with timezone

## Row Level Security

The table has Row Level Security (RLS) enabled with policies that ensure users can only:
- View their own outfits
- Insert their own outfits
- Update their own outfits
- Delete their own outfits

## Data Migration

When a user first loads the app after this update, any existing outfits from the legacy API will be automatically migrated to Supabase. This is handled by the `migrateOutfitsToSupabase` function in the `outfitService.ts` file.
