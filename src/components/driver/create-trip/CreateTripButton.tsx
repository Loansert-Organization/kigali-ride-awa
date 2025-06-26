
import React from 'react';
import { Car } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface CreateTripButtonProps {
  onCreateTrip: () => void;
  canCreateTrip: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const CreateTripButton: React.FC<CreateTripButtonProps> = ({
  onCreateTrip,
  canCreateTrip,
  isLoading,
  isAuthenticated
}) => {
  return (
    <Button
      onClick={onCreateTrip}
      disabled={!canCreateTrip || isLoading}
      className="w-full bg-green-600 hover:bg-green-700"
      size="lg"
    >
      <Car className="w-5 h-5 mr-2" />
      {isLoading ? 'Posting Trip...' : !isAuthenticated ? '📱 Verify WhatsApp & Post Trip' : '🚗 Post Trip Now'}
    </Button>
  );
};

export default CreateTripButton;
