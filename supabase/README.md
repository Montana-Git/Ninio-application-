# Supabase Database Migrations

This directory contains SQL migration files for the Supabase database.

## How to Apply Migrations

You can apply these migrations using the Supabase CLI, the SQL Editor in the Supabase Dashboard, or using the provided script.

### Using Supabase CLI

1. Install the Supabase CLI if you haven't already:
   ```bash
   npm install -g supabase
   ```

2. Link your project:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

3. Apply migrations:
   ```bash
   supabase db push
   ```

### Using the SQL Editor in Supabase Dashboard

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy the contents of the migration file you want to apply
4. Paste it into the SQL Editor and run the query

### Using the Provided Script

We've included a script to help you apply migrations:

1. Make sure you have the required environment variables set:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_SERVICE_KEY`: Your Supabase service role key

2. Run the script:
   ```bash
   node scripts/apply-migrations.js
   ```

   To apply only the latest migration:
   ```bash
   node scripts/apply-migrations.js --latest
   ```

## Fixing RLS Policies for Admin Access

If you're having issues with the admin dashboard not showing children or parents, you may need to update your Row Level Security (RLS) policies. The migration file (`20240710000001_fix_rls_policies_for_admin.sql`) addresses this issue.

This migration:

1. Updates the RLS policies to allow admins to view and manage all users and children
2. Adds temporary development policies for easier testing (these should be removed in production)

## Adding Payments Functionality

To enable payments functionality, you need to create the payments table in your database. The migration file (`20240712000001_create_payments_table.sql`) creates the necessary table and RLS policies.

This migration:

1. Creates a payments table with all necessary fields
2. Sets up RLS policies to allow authenticated users to view and manage payments
3. Grants the necessary permissions for the table

## Updating Parent Payments Function

To fix issues with child names not appearing in the parent dashboard, apply the migration file (`20240713000001_update_parent_payments_function.sql`).

This migration:

1. Drops the existing `get_parent_payments` function
2. Creates a new version that includes child names in the results
3. Joins the payments table with the children table to get the child names

## Fixing Parent Payments Display

To fix issues with payments added by the admin not appearing in the parent dashboard, apply the migration files:

1. `20240714000001_fix_parent_payments_function.sql`
2. `20240714000002_add_debug_payments_function.sql`

These migrations:

1. Fix the `get_parent_payments` function to ensure it retrieves all payments for a parent
2. Add a `debug_payments` function to help diagnose payment issues
3. Include additional debugging information in the function output

## Adding Sample Activities and Events

To fix issues with activities and calendar dashboard cards not showing up, apply the migration file:

1. `20240715000001_add_sample_activities_and_events.sql`

This migration:

1. Creates the `child_activities` table if it doesn't exist
2. Adds sample activities and events for testing
3. Links activities to children using a helper function

After applying this migration, make sure to:

1. Sign out and sign back in to refresh your session
2. Check that your user has the admin role correctly set

## Troubleshooting

If you're still having issues after applying the migrations:

1. Check the browser console for any error messages
2. Verify that your user has the correct role (admin)
3. Try clearing your browser cache and local storage
4. Ensure your Supabase project has the correct tables and policies

### Using Supabase SQL Editor

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of each migration file
4. Run the SQL commands in order (by filename)

## Migration Files

- `20240601000000_create_notifications_table.sql`: Creates the notifications table for storing user notifications
- `20240601000001_create_user_preferences_table.sql`: Creates the user_preferences table for storing notification preferences

## Database Schema

### notifications

| Column     | Type        | Description                                   |
|------------|-------------|-----------------------------------------------|
| id         | UUID        | Primary key                                   |
| user_id    | UUID        | Foreign key to auth.users                     |
| title      | TEXT        | Notification title                            |
| message    | TEXT        | Notification message                          |
| type       | TEXT        | Type of notification (info, success, warning, error) |
| is_read    | BOOLEAN     | Whether the notification has been read        |
| link       | TEXT        | Optional link to navigate to                  |
| created_at | TIMESTAMPTZ | Creation timestamp                            |
| updated_at | TIMESTAMPTZ | Last update timestamp                         |

### user_preferences

| Column              | Type        | Description                                   |
|---------------------|-------------|-----------------------------------------------|
| id                  | UUID        | Primary key                                   |
| user_id             | UUID        | Foreign key to auth.users                     |
| email_notifications | BOOLEAN     | Whether to send email notifications           |
| activity_updates    | BOOLEAN     | Whether to send activity update notifications |
| payment_reminders   | BOOLEAN     | Whether to send payment reminder notifications|
| event_reminders     | BOOLEAN     | Whether to send event reminder notifications  |
| created_at          | TIMESTAMPTZ | Creation timestamp                            |
| updated_at          | TIMESTAMPTZ | Last update timestamp                         |
