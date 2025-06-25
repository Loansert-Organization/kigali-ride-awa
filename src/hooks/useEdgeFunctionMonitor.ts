
// Edge function deployment and health monitoring
import { useState, useCallback, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface EdgeFunctionStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'offline';
  responseTime: number;
  lastChecked: Date;
  error?: string;
}

export const useEdgeFunctionMonitor = () => {
  const [functionStatuses, setFunctionStatuses] = useState<EdgeFunctionStatus[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const checkFunction = useCallback(async (
    functionName: string,
    testPayload: any = {}
  ): Promise<EdgeFunctionStatus> => {
    const startTime = performance.now();
    
    try {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: testPayload
      });

      const responseTime = performance.now() - startTime;

      if (error) {
        return {
          name: functionName,
          status: 'degraded',
          responseTime: Math.round(responseTime),
          lastChecked: new Date(),
          error: error.message
        };
      }

      return {
        name: functionName,
        status: 'healthy',
        responseTime: Math.round(responseTime),
        lastChecked: new Date()
      };
    } catch (error) {
      const responseTime = performance.now() - startTime;
      return {
        name: functionName,
        status: 'offline',
        responseTime: Math.round(responseTime),
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, []);

  const checkAllFunctions = useCallback(async () => {
    setIsMonitoring(true);

    const functionsToCheck = [
      { name: 'smart-trip-matcher', payload: { passengerTripId: 'health-check' } },
      { name: 'send-push-notification', payload: { userId: 'health-check', title: 'Test', body: 'Test' } },
      { name: 'auto-reward-processor', payload: { action: 'health_check' } },
      { name: 'comprehensive-error-handler', payload: { component: 'health-check' } },
      { name: 'create-trip', payload: { health_check: true } },
      { name: 'match-passenger-driver', payload: { action: 'health_check' } }
    ];

    const statuses: EdgeFunctionStatus[] = [];

    for (const func of functionsToCheck) {
      const status = await checkFunction(func.name, func.payload);
      statuses.push(status);
    }

    setFunctionStatuses(statuses);
    setIsMonitoring(false);

    return statuses;
  }, [checkFunction]);

  const getHealthSummary = useCallback(() => {
    const total = functionStatuses.length;
    const healthy = functionStatuses.filter(f => f.status === 'healthy').length;
    const degraded = functionStatuses.filter(f => f.status === 'degraded').length;
    const offline = functionStatuses.filter(f => f.status === 'offline').length;

    const avgResponseTime = functionStatuses.length > 0 
      ? Math.round(functionStatuses.reduce((sum, f) => sum + f.responseTime, 0) / functionStatuses.length)
      : 0;

    return {
      total,
      healthy,
      degraded,
      offline,
      healthPercentage: total > 0 ? Math.round((healthy / total) * 100) : 0,
      avgResponseTime
    };
  }, [functionStatuses]);

  // Auto-check functions every 5 minutes when monitoring is enabled
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isMonitoring) {
      interval = setInterval(checkAllFunctions, 5 * 60 * 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isMonitoring, checkAllFunctions]);

  return {
    functionStatuses,
    isMonitoring,
    checkAllFunctions,
    checkFunction,
    getHealthSummary
  };
};
