
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, X, Flag, Link } from 'lucide-react';

interface Trip {
  id: string;
  role: 'passenger' | 'driver';
  status: string;
  fromLocation: string;
  toLocation: string;
  createdBy: string;
}

interface TripConfirmationDialogProps {
  action: string;
  trip: Trip;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const TripConfirmationDialog: React.FC<TripConfirmationDialogProps> = ({
  action,
  trip,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [reason, setReason] = useState('');

  const getActionDetails = () => {
    switch (action) {
      case 'cancel':
        return {
          title: 'Cancel Trip',
          icon: <X className="w-6 h-6 text-red-600" />,
          description: 'This will cancel the trip and notify the creator. This action cannot be undone.',
          buttonText: 'Cancel Trip',
          buttonVariant: 'destructive' as const,
          reasonRequired: true
        };
      case 'flag':
        return {
          title: 'Flag Trip',
          icon: <Flag className="w-6 h-6 text-orange-600" />,
          description: 'This will flag the trip for review and investigation.',
          buttonText: 'Flag Trip',
          buttonVariant: 'default' as const,
          reasonRequired: true
        };
      case 'force-match':
        return {
          title: 'Force Match Trip',
          icon: <Link className="w-6 h-6 text-blue-600" />,
          description: 'This will manually match this trip with available counterparts. Use with caution.',
          buttonText: 'Force Match',
          buttonVariant: 'default' as const,
          reasonRequired: false
        };
      default:
        return {
          title: 'Confirm Action',
          icon: <AlertTriangle className="w-6 h-6 text-yellow-600" />,
          description: 'Please confirm this action.',
          buttonText: 'Confirm',
          buttonVariant: 'default' as const,
          reasonRequired: false
        };
    }
  };

  const actionDetails = getActionDetails();

  const handleConfirm = () => {
    if (actionDetails.reasonRequired && !reason.trim()) {
      return; // Don't proceed without reason
    }
    onConfirm();
    setReason('');
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {actionDetails.icon}
            <span>{actionDetails.title}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Trip ID:</span>
                <span className="font-mono text-sm">{trip.id.slice(0, 8)}...</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Role:</span>
                <Badge variant={trip.role === 'driver' ? 'default' : 'secondary'}>
                  {trip.role}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Route:</span>
                <span className="text-sm text-right">
                  {trip.fromLocation} → {trip.toLocation}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Creator:</span>
                <span className="text-sm">{trip.createdBy}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              {actionDetails.description}
            </p>
            
            {actionDetails.reasonRequired && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Reason <span className="text-red-500">*</span>
                </label>
                <Textarea
                  placeholder={`Please provide a reason for ${action}ing this trip...`}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                />
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant={actionDetails.buttonVariant}
            onClick={handleConfirm}
            disabled={actionDetails.reasonRequired && !reason.trim()}
          >
            {actionDetails.buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
