import { TripWizard } from '@/features/trip-wizard/TripWizard';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/page-header';

export const TripNew = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Create New Trip" 
        showBack={true} 
        showHome={true}
        onBack={handleClose}
      />

      {/* Trip Wizard */}
      <div className="py-6">
        <TripWizard onClose={handleClose} />
      </div>
    </div>
  );
}; 