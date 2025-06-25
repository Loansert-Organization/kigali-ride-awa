
// Integration testing utilities for production validation
import { useCallback, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface TestResult {
  test: string;
  status: 'pass' | 'fail' | 'pending';
  message: string;
  duration?: number;
}

export const useIntegrationTesting = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTest = useCallback(async (
    testName: string,
    testFn: () => Promise<void>
  ): Promise<TestResult> => {
    const startTime = performance.now();
    
    try {
      await testFn();
      const duration = performance.now() - startTime;
      return {
        test: testName,
        status: 'pass',
        message: 'Test passed successfully',
        duration: Math.round(duration)
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      return {
        test: testName,
        status: 'fail',
        message: error instanceof Error ? error.message : 'Test failed',
        duration: Math.round(duration)
      };
    }
  }, []);

  const testDatabaseConnection = useCallback(async () => {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) throw new Error(`Database connection failed: ${error.message}`);
    if (!data) throw new Error('No data returned from database');
  }, []);

  const testAnonymousAuth = useCallback(async () => {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) throw new Error(`Anonymous auth failed: ${error.message}`);
    if (!data.user) throw new Error('No user returned from anonymous auth');
  }, []);

  const testTripCreation = useCallback(async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('No authenticated user');

    // Get or create user record
    let { data: userRecord } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', user.user.id)
      .single();

    if (!userRecord) {
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          auth_user_id: user.user.id,
          role: 'passenger'
        })
        .select('id')
        .single();
      
      if (error) throw new Error(`User creation failed: ${error.message}`);
      userRecord = newUser;
    }

    // Test trip creation
    const { data, error } = await supabase
      .from('trips')
      .insert({
        user_id: userRecord.id,
        role: 'passenger',
        from_location: 'Test Location A',
        to_location: 'Test Location B',
        vehicle_type: 'car',
        scheduled_time: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw new Error(`Trip creation failed: ${error.message}`);
    if (!data) throw new Error('No trip data returned');

    // Clean up test trip
    await supabase.from('trips').delete().eq('id', data.id);
  }, []);

  const testEdgeFunctions = useCallback(async () => {
    // Test smart trip matcher
    try {
      const { data, error } = await supabase.functions.invoke('smart-trip-matcher', {
        body: { 
          passengerTripId: 'test-id',
          maxDistance: 5,
          maxTimeDiff: 30
        }
      });
      
      if (error && !error.message.includes('not found')) {
        throw new Error(`Smart trip matcher failed: ${error.message}`);
      }
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes('not found')) {
        throw error;
      }
    }

    // Test notification service
    try {
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          userId: 'test-user-id',
          title: 'Test Notification',
          body: 'Integration test',
          type: 'general'
        }
      });
      
      if (error && !error.message.includes('not found')) {
        throw new Error(`Push notification failed: ${error.message}`);
      }
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes('not found')) {
        throw error;
      }
    }
  }, []);

  const runFullIntegrationTest = useCallback(async () => {
    setIsRunning(true);
    setTestResults([]);

    const tests = [
      { name: 'Database Connection', fn: testDatabaseConnection },
      { name: 'Anonymous Authentication', fn: testAnonymousAuth },
      { name: 'Trip Creation', fn: testTripCreation },
      { name: 'Edge Functions', fn: testEdgeFunctions }
    ];

    const results: TestResult[] = [];

    for (const test of tests) {
      const result = await runTest(test.name, test.fn);
      results.push(result);
      setTestResults([...results]);
    }

    const passedTests = results.filter(r => r.status === 'pass').length;
    const totalTests = results.length;

    toast({
      title: "Integration Test Complete",
      description: `${passedTests}/${totalTests} tests passed`,
      variant: passedTests === totalTests ? "default" : "destructive"
    });

    setIsRunning(false);
    return results;
  }, [runTest, testDatabaseConnection, testAnonymousAuth, testTripCreation, testEdgeFunctions]);

  return {
    testResults,
    isRunning,
    runFullIntegrationTest,
    runTest
  };
};
