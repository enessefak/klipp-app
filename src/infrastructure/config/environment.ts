/**
 * Environment configuration helper
 * Access environment variables safely with type checking
 */

export const Environment = {
    /**
     * Current environment: development | preview | production
     */
    env: process.env.EXPO_PUBLIC_ENV || 'development',
    
    /**
     * API base URL
     */
    apiUrl: process.env.EXPO_PUBLIC_API_URL || 'https://klipp-api.orjinfinity.net',
    
    /**
     * Check if running in development
     */
    isDevelopment: () => __DEV__ || Environment.env === 'development',
    
    /**
     * Check if running in production
     */
    isProduction: () => Environment.env === 'production',
    
    /**
     * Check if running in preview
     */
    isPreview: () => Environment.env === 'preview',
} as const;

// Type for environment names
export type EnvironmentName = 'development' | 'preview' | 'production';
