
import { useState, useCallback } from 'react';

export const useEnvironmentValidation = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});

  const validateEnvironment = useCallback(() => {
    const supabaseUrl = 'https://ldbzarwjnnsoyoengheg.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkYnphcndqbm5zb3lvZW5naGVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NzA4OTIsImV4cCI6MjA2NjQ0Njg5Mn0.iN-Viuf5Vg07aGyAnGgqW3DKFUcqxn8U2KAUeAMk9uY';
    
    const envInfo = {
      supabaseUrl,
      authKey: supabaseKey?.substring(0, 20) + '...' || 'missing',
      environment: import.meta.env.MODE || 'unknown',
      timestamp: new Date().toISOString()
    };
    
    console.log('🔧 Environment info:', envInfo);
    setDebugInfo(envInfo);
    
    return Boolean(supabaseUrl && supabaseKey);
  }, []);

  return { debugInfo, validateEnvironment };
};
