-- Diagnostic query to analyze user_profiles table for duplicates and inconsistencies
-- This script helps identify various types of duplicate and data quality issues

-- 1. Check for duplicate emails
SELECT 
    'Duplicate Emails' as issue_type,
    email,
    COUNT(*) as count,
    ARRAY_AGG(id ORDER BY created_at) as profile_ids,
    ARRAY_AGG(user_uuid) as user_uuids,
    ARRAY_AGG(name) as names
FROM user_profiles 
WHERE email IS NOT NULL
GROUP BY email 
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- 2. Check for duplicate user_uuid values
SELECT 
    'Duplicate User UUIDs' as issue_type,
    user_uuid,
    COUNT(*) as count,
    ARRAY_AGG(id ORDER BY created_at) as profile_ids,
    ARRAY_AGG(email) as emails,
    ARRAY_AGG(name) as names
FROM user_profiles 
WHERE user_uuid IS NOT NULL
GROUP BY user_uuid 
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- 3. Check for profiles with NULL user_uuid (orphaned profiles)
SELECT 
    'NULL User UUIDs' as issue_type,
    COUNT(*) as count,
    ARRAY_AGG(id ORDER BY created_at) as profile_ids,
    ARRAY_AGG(email) as emails
FROM user_profiles 
WHERE user_uuid IS NULL;

-- 4. Check for profiles with NULL email
SELECT 
    'NULL Emails' as issue_type,
    COUNT(*) as count,
    ARRAY_AGG(id ORDER BY created_at) as profile_ids,
    ARRAY_AGG(user_uuid) as user_uuids
FROM user_profiles 
WHERE email IS NULL;

-- 5. Check for mismatched email-user_uuid pairs (user_uuid references one email in auth.users, profile has different email)
SELECT 
    'Mismatched Email-UUID' as issue_type,
    up.id,
    up.email as profile_email,
    au.email as auth_email,
    up.user_uuid,
    up.name
FROM user_profiles up
JOIN auth.users au ON up.user_uuid = au.id
WHERE up.email != au.email
  AND up.email IS NOT NULL
  AND au.email IS NOT NULL
ORDER BY up.created_at DESC;

-- 6. Check for profiles where user_uuid doesn't exist in auth.users (orphaned references)
SELECT 
    'Orphaned User References' as issue_type,
    up.id,
    up.email,
    up.user_uuid,
    up.name
FROM user_profiles up
LEFT JOIN auth.users au ON up.user_uuid = au.id
WHERE up.user_uuid IS NOT NULL
  AND au.id IS NULL
ORDER BY up.created_at DESC;

-- 7. Summary statistics
WITH stats AS (
    SELECT 
        COUNT(*) as total_profiles,
        COUNT(DISTINCT email) as unique_emails,
        COUNT(DISTINCT user_uuid) as unique_user_uuids,
        COUNT(*) - COUNT(DISTINCT email) as email_duplicates_count,
        COUNT(*) - COUNT(DISTINCT user_uuid) as uuid_duplicates_count,
        COUNT(*) FILTER (WHERE email IS NULL) as null_email_count,
        COUNT(*) FILTER (WHERE user_uuid IS NULL) as null_uuid_count
    FROM user_profiles
)
SELECT 
    'Summary Statistics' as info_type,
    total_profiles,
    unique_emails,
    unique_user_uuids,
    email_duplicates_count,
    uuid_duplicates_count,
    null_email_count,
    null_uuid_count,
    CASE 
        WHEN email_duplicates_count > 0 OR uuid_duplicates_count > 0 THEN 'ISSUES FOUND'
        ELSE 'CLEAN'
    END as status
FROM stats;

-- 8. Show recent profile creations (for pattern analysis)
SELECT 
    'Recent Profile Creations' as info_type,
    id,
    email,
    user_uuid,
    name,
    created_at,
    updated_at
FROM user_profiles 
ORDER BY created_at DESC 
LIMIT 10;
