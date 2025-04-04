-- Create user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    activity_updates BOOLEAN NOT NULL DEFAULT TRUE,
    payment_reminders BOOLEAN NOT NULL DEFAULT TRUE,
    event_reminders BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their own preferences
CREATE POLICY "Users can view their own preferences" 
    ON public.user_preferences 
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Create policy to allow users to update only their own preferences
CREATE POLICY "Users can update their own preferences" 
    ON public.user_preferences 
    FOR UPDATE 
    USING (auth.uid() = user_id);

-- Create policy to allow users to insert preferences for themselves
CREATE POLICY "Users can insert their own preferences" 
    ON public.user_preferences 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Create unique index to ensure one preference record per user
CREATE UNIQUE INDEX IF NOT EXISTS user_preferences_user_id_idx ON public.user_preferences(user_id);

-- Add trigger to update updated_at column
CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
