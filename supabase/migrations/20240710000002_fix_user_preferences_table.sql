-- This migration fixes the user_preferences table if it already exists
-- It ensures the table references the correct users table and has the right structure

-- First, check if the table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_preferences') THEN
        -- Drop existing foreign key constraints if they exist
        BEGIN
            ALTER TABLE public.user_preferences DROP CONSTRAINT IF EXISTS user_preferences_user_id_fkey;
        EXCEPTION WHEN OTHERS THEN
            -- Constraint doesn't exist or can't be dropped, continue
        END;
        
        -- Add the correct foreign key constraint to public.users
        BEGIN
            ALTER TABLE public.user_preferences
            ADD CONSTRAINT user_preferences_user_id_fkey
            FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
        EXCEPTION WHEN OTHERS THEN
            -- Can't add constraint, might already exist or reference issue
            RAISE NOTICE 'Could not add foreign key constraint to user_preferences: %', SQLERRM;
        END;
        
        -- Ensure all required columns exist
        BEGIN
            ALTER TABLE public.user_preferences 
            ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT TRUE,
            ADD COLUMN IF NOT EXISTS activity_updates BOOLEAN DEFAULT TRUE,
            ADD COLUMN IF NOT EXISTS payment_reminders BOOLEAN DEFAULT TRUE,
            ADD COLUMN IF NOT EXISTS event_reminders BOOLEAN DEFAULT TRUE,
            ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Error adding columns to user_preferences: %', SQLERRM;
        END;
    END IF;
END
$$;

-- Ensure RLS is enabled
ALTER TABLE IF EXISTS public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON public.user_preferences;

-- Create policies
CREATE POLICY IF NOT EXISTS "Users can view their own preferences" 
    ON public.user_preferences 
    FOR SELECT 
    USING (auth.uid()::text = user_id::text);

CREATE POLICY IF NOT EXISTS "Users can update their own preferences" 
    ON public.user_preferences 
    FOR UPDATE 
    USING (auth.uid()::text = user_id::text);

CREATE POLICY IF NOT EXISTS "Users can insert their own preferences" 
    ON public.user_preferences 
    FOR INSERT 
    WITH CHECK (auth.uid()::text = user_id::text);
