
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Car, User } from 'lucide-react';

interface RoleSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onRoleSelect: (role: 'passenger' | 'driver') => void;
  selectedRole: 'passenger' | 'driver' | null;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  isOpen,
  onClose,
  onRoleSelect,
  selectedRole
}) => {
  const handleRoleSelect = (role: 'passenger' | 'driver') => {
    onRoleSelect(role);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center">
            I want to...
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Button
            onClick={() => handleRoleSelect('passenger')}
            variant={selectedRole === 'passenger' ? "default" : "outline"}
            className="w-full h-20 flex-col space-y-2 bg-blue-50 hover:bg-blue-100 border-blue-200"
          >
            <User className="w-8 h-8 text-blue-600" />
            <div className="text-center">
              <div className="font-semibold text-blue-900">Book a Ride</div>
              <div className="text-xs text-blue-700">Find drivers going your way</div>
            </div>
          </Button>

          <Button
            onClick={() => handleRoleSelect('driver')}
            variant={selectedRole === 'driver' ? "default" : "outline"}
            className="w-full h-20 flex-col space-y-2 bg-green-50 hover:bg-green-100 border-green-200"
          >
            <Car className="w-8 h-8 text-green-600" />
            <div className="text-center">
              <div className="font-semibold text-green-900">Offer Rides</div>
              <div className="text-xs text-green-700">Post trips and earn money</div>
            </div>
          </Button>

          <div className="text-center">
            <Button variant="link" onClick={onClose} className="text-sm text-gray-500">
              Skip for now - I'll browse first
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
