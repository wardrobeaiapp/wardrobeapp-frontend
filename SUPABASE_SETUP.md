# Supabase Setup Documentation for Wardrobe App

This document outlines the Supabase configuration for the Wardrobe App, including authentication, database schema, and Row Level Security (RLS) policies.

## Project Configuration

- **Supabase Project URL**: https://gujpqecwdftbwkcnwiup.supabase.co
- **API Key**: Stored in environment variables (not included in this document for security)

## Authentication

The app uses Supabase Auth for user authentication. The authentication flow is implemented in:
- `src/services/supabaseAuthService.ts`
- `src/contexts/SupabaseAuthContext.tsx`

### Key Authentication Functions:

- `register(userData)`: Creates a new user in Supabase Auth and adds their profile to the `user_profiles` table
- `login(email, password)`: Authenticates a user and retrieves their session
- `logout()`: Signs out the current user
- `getCurrentUser()`: Retrieves the currently authenticated user
- `updateUserMetadata(userId, metadata)`: Updates user profile information

### Email Confirmation Flow:

The app supports Supabase's email confirmation requirements:

1. **Registration Process**:
   - When a user registers, the `register` function checks if email confirmation is required (when `session` is `null` after signup)
   - If confirmation is required, the UI shows a confirmation message and hides the registration form
   - The function returns an `emailConfirmationRequired` flag to inform the UI of this state

2. **User Profile Creation**:
   - If email confirmation is required, user profile creation is deferred until after confirmation and first login
   - On first login after email confirmation, the system automatically creates the user profile

3. **Implementation Details**:
   - `RegisterPage.tsx`: Displays confirmation message when `emailConfirmationRequired` is true
   - `supabaseAuthService.ts`: Detects email confirmation requirement and handles profile creation timing
   - `SupabaseAuthContext.tsx`: Propagates the email confirmation state to the UI

## Database Schema

### user_profiles Table

This table stores additional user information beyond what's in the Supabase Auth system.

| Column Name | Type | Description | Constraints |
|-------------|------|-------------|------------|
| id | bigint | Primary key | Primary Key, Auto-increment |
| user_uuid | text | Supabase Auth user ID | Not Null |
| name | text | User's display name | |
| email | text | User's email address | |
| profile_completed | boolean | Whether user has completed profile | Default: false |
| onboarding_completed | boolean | Whether user has completed onboarding | Default: false |
| created_at | timestamp with time zone | Creation timestamp | Default: now() |
| updated_at | timestamp with time zone | Last update timestamp | Default: now() |

**Important Notes:**
- Column names must use snake_case in the database (e.g., `profile_completed`), but the code uses camelCase (e.g., `profileCompleted`)
- The `updateUserMetadata` function automatically converts camelCase to snake_case

## Row Level Security (RLS) Policies

RLS is enabled on the `user_profiles` table to ensure users can only access their own data.

### INSERT Policy

```sql
create policy "Users can insert their own profile"
on "public"."user_profiles"
for INSERT to authenticated
with check (auth.uid()::text = user_uuid);
```

### SELECT Policy

```sql
create policy "Users can view their own profile"
on "public"."user_profiles"
for SELECT to authenticated
using (auth.uid()::text = user_uuid);
```

### UPDATE Policy

```sql
create policy "Users can update their own profile"
on "public"."user_profiles"
for UPDATE to authenticated
using (auth.uid()::text = user_uuid)
with check (auth.uid()::text = user_uuid);
```

## Important Implementation Details

1. **Linking Auth Users to Profiles**:
   - The `user_uuid` column in `user_profiles` stores the Supabase Auth user ID
   - RLS policies use `auth.uid()::text = user_uuid` to verify ownership

2. **Naming Conventions**:
   - Database: snake_case (e.g., `user_uuid`, `profile_completed`)
   - Code: camelCase (e.g., `userUuid`, `profileCompleted`)
   - Conversion happens in the `camelToSnakeCase` utility function

3. **Error Handling**:
   - RLS policy violations return error code `42501`
   - Schema errors return code `PGRST204`

## Troubleshooting

### Common Issues:

1. **RLS Policy Violations**:
   - Error: "new row violates row-level security policy for table user_profiles"
   - Solution: Ensure RLS policies are correctly set up and that `user_uuid` matches `auth.uid()`

2. **Schema Errors**:
   - Error: "Could not find the 'X' column of 'user_profiles' in the schema cache"
   - Solution: Ensure column names in the database use snake_case and match what's expected in the code

3. **Authentication Issues**:
   - Check if the user is properly authenticated before attempting database operations
   - Verify that the session token is being stored and retrieved correctly

## Future Considerations

1. **Schema Migration**:
   - If changing the schema, remember to update both the database and the code
   - Be careful with column renames as they may break existing RLS policies

2. **Performance Optimization**:
   - Consider adding an index on the `user_uuid` column for better query performance:
     ```sql
     CREATE INDEX idx_user_profiles_user_uuid ON public.user_profiles(user_uuid);
     ```

3. **Security Enhancements**:
   - Regularly review RLS policies to ensure they provide appropriate access controls
   - Consider adding additional policies for specific operations as needed
