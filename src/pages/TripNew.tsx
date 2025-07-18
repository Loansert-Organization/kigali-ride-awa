import { TripCreationWizardComplete } from '@/features/trip-creation-wizard/TripCreationWizardComplete';
import { useNavigate } from 'react-router-dom';

export const TripNew = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate(-1); // Go back to previous page
  };

  return <TripCreationWizardComplete onClose={handleClose} />;
}; 