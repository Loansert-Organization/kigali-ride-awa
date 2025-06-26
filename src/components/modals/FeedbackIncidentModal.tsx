
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, MessageSquare, Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type IncidentType = 'feedback' | 'safety' | 'payment' | 'driver' | 'app' | 'other';

interface FeedbackIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId?: string;
  incidentType?: IncidentType;
}

export const FeedbackIncidentModal: React.FC<FeedbackIncidentModalProps> = ({
  isOpen,
  onClose,
  tripId,
  incidentType = 'feedback'
}) => {
  const { userProfile } = useAuth();
  const [type, setType] = useState<IncidentType>(incidentType);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const incidentTypes = [
    { value: 'feedback' as const, label: '💬 General Feedback', icon: MessageSquare },
    { value: 'safety' as const, label: '🚨 Safety Concern', icon: AlertTriangle },
    { value: 'payment' as const, label: '💳 Payment Issue', icon: MessageSquare },
    { value: 'driver' as const, label: '🚗 Driver Behavior', icon: MessageSquare },
    { value: 'app' as const, label: '📱 App Issue', icon: MessageSquare },
    { value: 'other' as const, label: '📝 Other', icon: MessageSquare }
  ];

  const selectedType = incidentTypes.find(t => t.value === type);

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast({
        title: "Message required",
        description: "Please describe your feedback or incident",
        variant: "destructive"
      });
      return;
    }

    if (!userProfile) {
      toast({
        title: "Authentication required",
        description: "Please verify your WhatsApp number first",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('incidents')
        .insert({
          user_id: userProfile.id,
          trip_id: tripId || null,
          type,
          message: message.trim()
        });

      if (error) throw error;

      toast({
        title: "Report submitted",
        description: "Thank you for your feedback. We'll review it promptly.",
      });

      setMessage('');
      onClose();
    } catch (error) {
      console.error('Error submitting incident:', error);
      toast({
        title: "Submission failed",
        description: "Please try again or contact support",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTypeChange = (value: string) => {
    setType(value as IncidentType);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {selectedType && <selectedType.icon className="w-5 h-5 mr-2 text-purple-600" />}
            Report Issue or Feedback
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type of report
            </label>
            <Select value={type} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {incidentTypes.map((incidentType) => (
                  <SelectItem key={incidentType.value} value={incidentType.value}>
                    {incidentType.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <Textarea
              placeholder="Please describe what happened or provide your feedback..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {tripId && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                📍 This report will be linked to your recent trip
              </p>
            </div>
          )}

          <div className="flex space-x-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !message.trim()}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            <p>🔒 All reports are confidential and help us improve Kigali Ride</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
