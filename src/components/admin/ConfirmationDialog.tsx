
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Ban, Flag, RotateCcw } from 'lucide-react';

interface User {
  id: string;
  name: string;
  phone: string;
  role: 'driver' | 'passenger' | 'admin';
}

interface ConfirmationDialogProps {
  action: string;
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  action,
  user,
  isOpen,
  onClose,
  onConfirm
}) => {
  const getActionConfig = () => {
    switch (action) {
      case 'ban':
        return {
          title: 'Ban User',
          icon: <Ban className="w-6 h-6 text-red-500" />,
          message: `Are you sure you want to ban ${user.name || 'this user'}? This will prevent them from accessing the platform.`,
          confirmText: 'Ban User',
          confirmVariant: 'destructive' as const,
          warning: 'This action can be reversed later.'
        };
      case 'flag':
        return {
          title: 'Flag User',
          icon: <Flag className="w-6 h-6 text-yellow-500" />,
          message: `Are you sure you want to flag ${user.name || 'this user'}? This will mark them for review.`,
          confirmText: 'Flag User',
          confirmVariant: 'default' as const,
          warning: 'Flagged users may have limited functionality.'
        };
      case 'reset':
        return {
          title: 'Reset User Data',
          icon: <RotateCcw className="w-6 h-6 text-blue-500" />,
          message: `Are you sure you want to reset all data for ${user.name || 'this user'}? This will clear their trip history, favorites, and preferences.`,
          confirmText: 'Reset Data',
          confirmVariant: 'destructive' as const,
          warning: 'This action cannot be undone!'
        };
      default:
        return {
          title: 'Confirm Action',
          icon: <AlertTriangle className="w-6 h-6 text-gray-500" />,
          message: 'Are you sure you want to perform this action?',
          confirmText: 'Confirm',
          confirmVariant: 'default' as const,
          warning: 'Please review before proceeding.'
        };
    }
  };

  const config = getActionConfig();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {config.icon}
            <span>{config.title}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-gray-700">{config.message}</p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
              <p className="text-sm text-yellow-800">{config.warning}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="font-medium text-gray-900 mb-2">User Details:</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div>Name: {user.name || 'Anonymous User'}</div>
              <div>Phone: {user.phone}</div>
              <div>Role: {user.role}</div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant={config.confirmVariant} onClick={onConfirm}>
            {config.confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
