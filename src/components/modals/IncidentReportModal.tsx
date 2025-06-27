
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface IncidentReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId?: string;
  onSubmit: (report: {
    type: string;
    description: string;
    tripId?: string;
    contactInfo?: string;
  }) => void;
}

const IncidentReportModal: React.FC<IncidentReportModalProps> = ({
  isOpen,
  onClose,
  tripId,
  onSubmit
}) => {
  const [selectedType, setSelectedType] = useState('');
  const [description, setDescription] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const incidentTypes = [
    'safety_concern',
    'payment_issue',
    'driver_behavior',
    'passenger_behavior',
    'vehicle_condition',
    'route_problem',
    'other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedType || !description.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select an incident type and provide a description",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit({
        type: selectedType,
        description: description.trim(),
        tripId,
        contactInfo: contactInfo.trim() || undefined
      });
      
      toast({
        title: "Report Submitted",
        description: "Your incident report has been submitted successfully"
      });
      
      // Reset form
      setSelectedType('');
      setDescription('');
      setContactInfo('');
      onClose();
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit incident report. Please try again.",
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
            <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
            Report Incident
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Incident Type
            </label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Select incident type" />
              </SelectTrigger>
              <SelectContent>
                {incidentTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please describe what happened..."
              rows={4}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Information (Optional)
            </label>
            <Input
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder="Phone number or email for follow-up"
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default IncidentReportModal;
