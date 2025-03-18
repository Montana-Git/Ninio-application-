-- Create a function to safely create user profiles
CREATE OR REPLACE FUNCTION public.create_user_profile(
  user_id UUID,
  user_email TEXT,
  user_first_name TEXT,
  user_last_name TEXT,
  user_role TEXT,
  user_children_count INTEGER DEFAULT 0,
  user_children_names TEXT[] DEFAULT '{}'::TEXT[]
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- This runs with the privileges of the function creator
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Insert the user profile
  INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    role,
    children_count,
    children_names,
    created_at
  ) VALUES (
    user_id,
    user_email,
    user_first_name,
    user_last_name,
    user_role,
    user_children_count,
    user_children_names,
    NOW()
  )
  RETURNING to_jsonb(users.*) INTO result;
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'error', SQLERRM,
      'detail', SQLSTATE
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_user_profile TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_profile TO anon;

-- Update RLS policy for users table to ensure users can only access their own data
DROP POLICY IF EXISTS "Users can only access their own data" ON public.users;
CREATE POLICY "Users can only access their own data" 
ON public.users
FOR ALL
TO authenticated
USING (auth.uid() = id);

-- Ensure the users table has RLS enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
