import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, CheckCircle, X, Clock, MapPin, Users, Car } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface DraftTrip {
  id: string;
  payload: {
    role: 'driver' | 'passenger';
    origin_text: string;
    dest_text: string;
    departure_time: string;
    seats?: number;
    vehicle_type?: string;
  };
  confidence_score: number;
  suggestion_reason: string;
  generated_for: string;
}

export const DraftTripBanner = () => {
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const [drafts, setDrafts] = useState<DraftTrip[]>([]);
  const [currentDraft, setCurrentDraft] = useState<DraftTrip | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadDraftTrips();
      // Subscribe to new drafts
      const subscription = supabase
        .channel('draft_trips')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'ai_draft_trips',
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
          loadDraftTrips();
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const loadDraftTrips = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('ai_draft_trips')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .order('confidence_score', { ascending: false })
        .limit(5);

      if (error) throw error;
      
      setDrafts(data || []);
      if (data && data.length > 0) {
        setCurrentDraft(data[0]);
      }
    } catch (error) {
      console.error('Error loading draft trips:', error);
    }
  };

  const handleAccept = async () => {
    if (!currentDraft || !user) return;

    setIsLoading(true);
    try {
      // Update draft status
      await supabase
        .from('ai_draft_trips')
        .update({ status: 'accepted' })
        .eq('id', currentDraft.id);

      // Navigate to trip wizard with prefilled data
      const tripData = {
        role: currentDraft.payload.role,
        origin: { address: currentDraft.payload.origin_text },
        destination: { address: currentDraft.payload.dest_text },
        departureTime: currentDraft.payload.departure_time,
        seats: currentDraft.payload.seats || 1,
        vehicleType: currentDraft.payload.vehicle_type || 'any',
        fromAI: true
      };

      // Store in localStorage for trip wizard to pick up
      localStorage.setItem('ai_draft_trip', JSON.stringify(tripData));
      
      toast({
        title: "AI Draft Accepted",
        description: "Opening trip creation with your details...",
      });

      navigate('/trip/new');
    } catch (error) {
      console.error('Error accepting draft:', error);
      toast({
        title: "Error",
        description: "Failed to accept draft. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = async () => {
    if (!currentDraft) return;

    try {
      await supabase
        .from('ai_draft_trips')
        .update({ status: 'dismissed' })
        .eq('id', currentDraft.id);

      // Move to next draft
      const remainingDrafts = drafts.filter(d => d.id !== currentDraft.id);
      setDrafts(remainingDrafts);
      setCurrentDraft(remainingDrafts[0] || null);
    } catch (error) {
      console.error('Error dismissing draft:', error);
    }
  };

  const formatDepartureTime = (isoTime: string) => {
    const date = new Date(isoTime);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = date.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();

    if (isToday) {
      return `Today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (isTomorrow) {
      return `Tomorrow at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    }
  };

  if (!currentDraft) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-4 left-4 right-4 z-40 max-w-2xl mx-auto"
      >
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-purple-100 rounded-full">
                  <Bot className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">AI Trip Suggestion</h4>
                  <p className="text-xs text-gray-600">{currentDraft.suggestion_reason}</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                {Math.round(currentDraft.confidence_score * 100)}% match
              </Badge>
            </div>

            <div className="space-y-2 mb-4">
              {/* Origin */}
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="font-medium">From:</span>
                <span className="text-gray-700">{currentDraft.payload.origin_text}</span>
              </div>

              {/* Destination */}
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span className="font-medium">To:</span>
                <span className="text-gray-700">{currentDraft.payload.dest_text}</span>
              </div>

              {/* Details */}
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatDepartureTime(currentDraft.payload.departure_time)}</span>
                </div>
                {currentDraft.payload.seats && (
                  <div className="flex items-center space-x-1">
                    <Users className="w-3 h-3" />
                    <span>{currentDraft.payload.seats} seat{currentDraft.payload.seats > 1 ? 's' : ''}</span>
                  </div>
                )}
                {currentDraft.payload.vehicle_type && (
                  <div className="flex items-center space-x-1">
                    <Car className="w-3 h-3" />
                    <span className="capitalize">{currentDraft.payload.vehicle_type}</span>
                  </div>
                )}
                <Badge variant="outline" className="text-xs">
                  {currentDraft.payload.role === 'driver' ? 'Offer Ride' : 'Request Ride'}
                </Badge>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleAccept}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Accept & Create Trip
              </Button>
              <Button
                onClick={handleDismiss}
                variant="outline"
                disabled={isLoading}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {drafts.length > 1 && (
              <p className="text-xs text-center text-gray-500 mt-2">
                {drafts.length - 1} more suggestion{drafts.length > 2 ? 's' : ''} available
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}; 