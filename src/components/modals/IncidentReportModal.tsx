
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Flag, MessageCircle, Star } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface IncidentReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId?: string;
  reportType?: 'incident' | 'feedback' | 'complaint';
}

const incidentTypes = [
  { id: 'safety', label: 'Safety Concern', icon: AlertTriangle, color: 'text-red-600' },
  { id: 'service', label: 'Service Issue', icon: Flag, color: 'text-orange-600' },
  { id: 'feedback', label: 'General Feedback', icon: MessageCircle, color: 'text-blue-600' },
  { id: 'compliment', label: 'Compliment Driver', icon: Star, color: 'text-green-600' }
];

export const IncidentReportModal: React.FC<IncidentReportModalProps> = ({
  isOpen,
  onClose,
  tripId,
  reportType = 'incident'
}) => {
  const [selectedType, setSelectedType] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedType || !message.trim()) {
      toast({
        title: "Please complete all fields",
        description: "Select a type and provide details",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      const { error } = await supabase
        .from('incidents')
        .insert({
          user_id: currentUser.id,
          trip_id: tripId,
          type: selectedType,
          message: message.trim()
        });

      if (error) throw error;

      toast({
        title: "Report submitted",
        description: "Thank you for your feedback. We'll review it promptly.",
      });

      onClose();
      setSelectedType('');
      setMessage('');
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Flag className="w-5 h-5 mr-2 text-orange-600" />
            Report Issue or Feedback
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">
              What type of report is this?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {incidentTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <Button
                    key={type.id}
                    variant={selectedType === type.id ? "default" : "outline"}
                    className="h-auto p-3 flex flex-col items-center space-y-1"
                    onClick={() => setSelectedType(type.id)}
                  >
                    <Icon className={`w-5 h-5 ${type.color}`} />
                    <span className="text-xs">{type.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Please provide details
            </label>
            <Textarea
              placeholder="Describe the issue or provide your feedback..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {tripId && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Trip ID:</strong> {tripId.slice(0, 8)}...
              </p>
            </div>
          )}

          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!selectedType || !message.trim() || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
