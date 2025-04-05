# How to Apply the RLS Policy Fix

The issue with adding children is due to missing Row Level Security (RLS) policies in Supabase. Parents can view their children but don't have permission to add or update them.

## Option 1: Apply via Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the following SQL and run it:

```sql
-- Add policies for parents to manage their own children
DROP POLICY IF EXISTS "Parents can insert their own children" ON children;
CREATE POLICY "Parents can insert their own children"
  ON children FOR INSERT
  WITH CHECK (auth.uid() = parent_id);

DROP POLICY IF EXISTS "Parents can update their own children" ON children;
CREATE POLICY "Parents can update their own children"
  ON children FOR UPDATE
  USING (auth.uid() = parent_id);
```

## Option 2: Apply via Supabase CLI

If you have the Supabase CLI installed, you can run:

```bash
supabase db push
```

This will apply all migrations, including the new one we've created.

## Verification

After applying the migration, try adding a child again. The 403 Forbidden error should be resolved, and you should be able to add and update children as a parent user.
