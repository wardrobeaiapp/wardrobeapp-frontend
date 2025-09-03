-- Schema notes for capsules table

/*
Important schema notes for the capsules table:

1. The capsules table does NOT have the following columns that were referenced in the code:
   - date_modified column (removed from code in September 2025)
   - image_url column (removed from code in September 2025)
   - is_favorite column (removed from code in September 2025)
   - item_count column (removed from code in September 2025)

2. Actual columns in the capsules table (as of September 2025):
   - id (primary key)
   - name (string)
   - description (string, nullable)
   - date_created (timestamp)
   - user_id (foreign key)
   - seasons (string - comma separated values)

3. Related tables:
   - capsule_scenarios (join table for capsule-scenario relationships)
   - capsule_items (join table for capsule-item relationships)
*/
