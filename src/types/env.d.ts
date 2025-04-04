/**
 * Type definitions for environment variables
 * 
 * This file provides TypeScript type definitions for the environment variables
 * used in the application. It extends the ImportMeta interface to provide
 * type checking for environment variables.
 */

interface ImportMetaEnv {
  /**
   * Supabase URL
   * @example https://your-project-id.supabase.co
   */
  readonly VITE_SUPABASE_URL: string;
  
  /**
   * Supabase anonymous key
   * @example eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   */
  readonly VITE_SUPABASE_ANON_KEY: string;
  
  /**
   * Groq API key
   * @example gsk_...
   */
  readonly VITE_GROQ_API_KEY: string;
  
  /**
   * Base path for the application
   * @default /
   */
  readonly VITE_BASE_PATH?: string;
  
  /**
   * Enable/disable analytics
   * @default false
   */
  readonly VITE_ENABLE_ANALYTICS?: string;
  
  /**
   * Enable/disable AI assistant
   * @default false
   */
  readonly VITE_ENABLE_AI_ASSISTANT?: string;
  
  /**
   * Enable/disable Tempo devtools
   * @default false
   */
  readonly VITE_TEMPO?: string;
  
  /**
   * Enable/disable source maps in production
   * @default false
   */
  readonly VITE_GENERATE_SOURCEMAPS?: string;
  
  /**
   * Enable/disable CSP nonces for inline scripts
   * @default false
   */
  readonly VITE_USE_CSP_NONCES?: string;
  
  /**
   * Development mode flag
   */
  readonly DEV: boolean;
  
  /**
   * Production mode flag
   */
  readonly PROD: boolean;
  
  /**
   * Base URL for the application
   */
  readonly BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
