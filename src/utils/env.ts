/**
 * Environment variable validation and access utilities
 */

/**
 * Type definition for environment variable configuration
 */
type EnvVarConfig = {
  required: boolean;
  defaultValue?: string;
  validator?: (value: string) => boolean;
  errorMessage?: string;
};

/**
 * Default environment variable configurations
 */
const ENV_VAR_CONFIGS: Record<string, EnvVarConfig> = {
  // Supabase configuration
  'VITE_SUPABASE_URL': {
    required: true,
    validator: (value) => value.startsWith('https://') && value.includes('.supabase.co'),
    errorMessage: 'VITE_SUPABASE_URL must be a valid Supabase URL'
  },
  'VITE_SUPABASE_ANON_KEY': {
    required: true,
    validator: (value) => value.length > 20,
    errorMessage: 'VITE_SUPABASE_ANON_KEY must be a valid Supabase anon key'
  },

  // Groq API configuration
  'VITE_GROQ_API_KEY': {
    required: true,
    validator: (value) => value.startsWith('gsk_'),
    errorMessage: 'VITE_GROQ_API_KEY must be a valid Groq API key starting with "gsk_"'
  },

  // Base path configuration
  'VITE_BASE_PATH': {
    required: false,
    defaultValue: '/',
    validator: (value) => value.startsWith('/'),
    errorMessage: 'VITE_BASE_PATH must start with a forward slash (/)'
  },

  // Feature flags
  'VITE_ENABLE_ANALYTICS': {
    required: false,
    defaultValue: 'false',
    validator: (value) => value === 'true' || value === 'false',
    errorMessage: 'VITE_ENABLE_ANALYTICS must be either "true" or "false"'
  },
  'VITE_ENABLE_AI_ASSISTANT': {
    required: false,
    defaultValue: 'false',
    validator: (value) => value === 'true' || value === 'false',
    errorMessage: 'VITE_ENABLE_AI_ASSISTANT must be either "true" or "false"'
  },

  // Tempo configuration
  'VITE_TEMPO': {
    required: false,
    defaultValue: 'false',
    validator: (value) => value === 'true' || value === 'false',
    errorMessage: 'VITE_TEMPO must be either "true" or "false"'
  }
};

/**
 * Get an environment variable with validation
 *
 * @param key - The environment variable key
 * @param config - Optional configuration overrides
 * @returns The environment variable value
 * @throws Error if the variable is required but not set or fails validation
 */
export function getEnvVariable(key: string, config?: Partial<EnvVarConfig>): string {
  // Get the default config for this key, or use defaults
  const defaultConfig = ENV_VAR_CONFIGS[key] || { required: false };

  // Merge with provided config
  const finalConfig = { ...defaultConfig, ...config };

  const value = import.meta.env[key] as string | undefined;

  // Check if required but not set
  if (!value && finalConfig.required) {
    // Log the error for developers
    console.error(`Required environment variable ${key} is not set`);

    // In development, show a more detailed error
    if (import.meta.env.DEV) {
      throw new Error(`Required environment variable ${key} is not set. Please check your .env file.`);
    }

    // In production, use a more generic error
    throw new Error('Application configuration error. Please contact support.');
  }

  const finalValue = value || finalConfig.defaultValue || '';

  // Validate the value if a validator is provided
  if (finalValue && finalConfig.validator && !finalConfig.validator(finalValue)) {
    const errorMessage = finalConfig.errorMessage || `Invalid value for environment variable ${key}`;

    // In development, show a more detailed error
    if (import.meta.env.DEV) {
      throw new Error(`${errorMessage}. Current value: ${finalValue}`);
    }

    // In production, use a more generic error
    throw new Error('Application configuration error. Please contact support.');
  }

  return finalValue;
}

/**
 * Validate that all required environment variables are set and valid
 *
 * @param keys - Array of environment variable keys to validate (defaults to all keys in ENV_VAR_CONFIGS)
 * @returns Object with validation result and issues
 */
export function validateEnvVars(keys: string[] = Object.keys(ENV_VAR_CONFIGS)): {
  isValid: boolean;
  issues: Array<{ key: string; issue: string }>;
} {
  const issues: Array<{ key: string; issue: string }> = [];

  for (const key of keys) {
    try {
      getEnvVariable(key);
    } catch (error) {
      issues.push({
        key,
        issue: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return {
    isValid: issues.length === 0,
    issues
  };
}

/**
 * Initialize environment validation on application startup
 *
 * @param keys - Array of environment variable keys to validate (defaults to all keys in ENV_VAR_CONFIGS)
 * @param strict - If true, throws an error when validation fails; if false, only logs warnings
 * @throws Error if any required variables are missing or invalid (when strict=true)
 */
export function initEnvValidation(keys?: string[], strict: boolean = true): void {
  const { isValid, issues } = validateEnvVars(keys);

  if (!isValid) {
    // Format issues for logging
    const issuesStr = issues.map(({ key, issue }) => `${key}: ${issue}`).join('\n- ');
    const errorMessage = `Environment validation failed:\n- ${issuesStr}`;

    console.error(errorMessage);

    if (strict) {
      if (import.meta.env.DEV) {
        throw new Error(errorMessage);
      } else {
        throw new Error('Application configuration error. Please contact support.');
      }
    }
  }
}
