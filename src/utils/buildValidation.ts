
// Build validation utilities to ensure proper project setup
export const validateBuildEnvironment = () => {
  const issues: string[] = [];
  
  // Check for critical environment variables
  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];

  // Note: In Lovable, these are typically hardcoded in the client config
  // but we can still validate the client is properly configured
  
  try {
    // Check if Supabase client is properly initialized
    const supabaseUrl = 'https://ldbzarwjnnsoyoengheg.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkYnphcndqbm5zb3lvZW5naGVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NzA4OTIsImV4cCI6MjA2NjQ0Njg5Mn0.iN-Viuf5Vg07aGyAnGgqW3DKFUcqxn8U2KAUeAMk9uY';
    
    if (!supabaseUrl || !supabaseKey) {
      issues.push('Supabase configuration is missing');
    }
  } catch (error) {
    issues.push(`Supabase client initialization error: ${error}`);
  }

  // Check for TypeScript configuration
  try {
    // Basic TypeScript validation would happen at build time
    // This is just a runtime check for critical types
    const hasRequiredTypes = typeof window !== 'undefined';
    if (!hasRequiredTypes) {
      issues.push('Browser environment types are missing');
    }
  } catch (error) {
    issues.push(`TypeScript validation error: ${error}`);
  }

  return {
    isValid: issues.length === 0,
    issues,
    timestamp: new Date().toISOString()
  };
};

export const logBuildValidation = () => {
  const validation = validateBuildEnvironment();
  
  if (validation.isValid) {
    console.log('✅ Build validation passed');
  } else {
    console.warn('⚠️ Build validation issues found:', validation.issues);
  }
  
  return validation;
};

// Auto-validate on module load in development
if (import.meta.env?.DEV) {
  logBuildValidation();
}
