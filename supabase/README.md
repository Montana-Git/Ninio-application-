# Supabase Database Migrations

This directory contains SQL migration files for the Supabase database.

## How to Apply Migrations

You can apply these migrations using the Supabase CLI or by running them directly in the Supabase SQL Editor.

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
