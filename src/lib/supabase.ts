import { createClient } from "@supabase/supabase-js";
import { getEnvVariable } from "@/utils/env";

// Get Supabase URL and API key from environment variables with validation
const supabaseUrl = getEnvVariable('VITE_SUPABASE_URL', { required: true });
const supabaseAnonKey = getEnvVariable('VITE_SUPABASE_ANON_KEY', { required: true });

// Validate that we have the required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase configuration is missing. ' +
    'Please make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY ' +
    'are set in your environment variables.'
  );
}

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
