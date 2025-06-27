// Comprehensive build health monitoring
import { supabase } from "@/integrations/supabase/client";

export interface BuildHealthCheckResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  details?: Record<string, unknown>;
}

interface HealthCheckResult {
  component: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  details?: Record<string, unknown>;
}

export const runBuildHealthCheck = async (): Promise<HealthCheckResult[]> => {
  const results: HealthCheckResult[] = [];

  // 1. Supabase Connection Health
  try {
    const { data, error } = await supabase.auth.getSession();
    results.push({
      component: 'Supabase Auth',
      status: error ? 'error' : 'healthy',
      message: error ? `Auth error: ${error.message}` : 'Auth service is responding',
      details: error
    });
  } catch (error) {
    results.push({
      component: 'Supabase Auth',
      status: 'error',
      message: `Connection failed: ${error}`,
      details: error
    });
  }

  // 2. Database Connection Health
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    results.push({
      component: 'Database',
      status: error ? 'error' : 'healthy',
      message: error ? `Database error: ${error.message}` : 'Database is accessible',
      details: error
    });
  } catch (error) {
    results.push({
      component: 'Database',
      status: 'error',
      message: `Database connection failed: ${error}`,
      details: error
    });
  }

  // 3. Edge Functions Health
  try {
    const { data, error } = await supabase.functions.invoke('get-app-config', {
      body: { healthCheck: true }
    });
    results.push({
      component: 'Edge Functions',
      status: error ? 'warning' : 'healthy',
      message: error ? `Functions warning: ${error.message}` : 'Edge functions are responding',
      details: error
    });
  } catch (error) {
    results.push({
      component: 'Edge Functions',
      status: 'warning',
      message: `Edge functions may not be available: ${error}`,
      details: error
    });
  }

  // 4. Browser APIs Health
  try {
    const hasRequiredAPIs = {
      geolocation: 'geolocation' in navigator,
      notifications: 'Notification' in window,
      serviceWorker: 'serviceWorker' in navigator,
      localStorage: typeof localStorage !== 'undefined'
    };

    const missingAPIs = Object.entries(hasRequiredAPIs)
      .filter(([, available]) => !available)
      .map(([api]) => api);

    results.push({
      component: 'Browser APIs',
      status: missingAPIs.length > 0 ? 'warning' : 'healthy',
      message: missingAPIs.length > 0 
        ? `Some APIs unavailable: ${missingAPIs.join(', ')}` 
        : 'All required browser APIs available',
      details: hasRequiredAPIs
    });
  } catch (error) {
    results.push({
      component: 'Browser APIs',
      status: 'error',
      message: `Browser API check failed: ${error}`,
      details: error
    });
  }

  return results;
};

export const getBuildHealthSummary = (results: HealthCheckResult[]) => {
  const healthy = results.filter(r => r.status === 'healthy').length;
  const warnings = results.filter(r => r.status === 'warning').length;
  const errors = results.filter(r => r.status === 'error').length;
  
  return {
    total: results.length,
    healthy,
    warnings,
    errors,
    overallStatus: errors > 0 ? 'error' : warnings > 0 ? 'warning' : 'healthy'
  };
};
