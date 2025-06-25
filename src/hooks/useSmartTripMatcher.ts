
import { useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useErrorHandler } from './useErrorHandler';

interface MatchedTrip {
  id: string;
  user_id: string;
  from_location: string;
  to_location: string;
  vehicle_type: string;
  scheduled_time: string;
  fare?: number;
  match_score: number;
  from_distance_km: number;
  to_distance_km: number;
  time_diff_minutes: number;
  users: {
    phone_number?: string;
    promo_code: string;
  };
}

interface SmartMatchResult {
  matches: MatchedTrip[];
  matchCount: number;
  passengerTrip: any;
}

export const useSmartTripMatcher = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [matches, setMatches] = useState<MatchedTrip[]>([]);
  const { handleError } = useErrorHandler();

  const findMatches = useCallback(async (
    passengerTripId: string,
    options?: {
      maxDistance?: number;
      maxTimeDiff?: number;
    }
  ): Promise<SmartMatchResult | null> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('smart-trip-matcher', {
        body: {
          passengerTripId,
          maxDistance: options?.maxDistance || 5,
          maxTimeDiff: options?.maxTimeDiff || 30
        }
      });

      if (error) throw error;

      if (data.success) {
        setMatches(data.matches);
        return data as SmartMatchResult;
      } else {
        throw new Error(data.error || 'Failed to find matches');
      }
    } catch (error) {
      await handleError(error, 'SmartTripMatcher.findMatches', {
        passengerTripId,
        options
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  return {
    findMatches,
    matches,
    isLoading
  };
};
