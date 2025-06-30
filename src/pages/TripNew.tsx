import { TripWizard } from '@/features/trip-wizard/TripWizard';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const TripNew = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="mr-3"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-lg font-semibold">Create New Trip</h1>
        </div>
      </div>

      {/* Trip Wizard */}
      <div className="py-6">
        <TripWizard onClose={handleClose} />
      </div>
    </div>
  );
}; 