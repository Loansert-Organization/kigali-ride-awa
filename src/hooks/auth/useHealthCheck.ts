
import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const useHealthCheck = () => {
  const performHealthCheck = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🏥 Performing health check...');
      const startTime = Date.now();
      
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      
      const responseTime = Date.now() - startTime;
      console.log(`🏥 Health check completed in ${responseTime}ms`);
      
      if (error) {
        console.error('❌ Health check failed:', error);
        return false;
      }
      
      console.log('✅ Backend is healthy');
      return true;
    } catch (error) {
      console.error('💥 Health check exception:', error);
      return false;
    }
  }, []);

  return { performHealthCheck };
};
