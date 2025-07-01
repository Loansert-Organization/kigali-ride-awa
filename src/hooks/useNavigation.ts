import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

export const useNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useAuth();

  const goToHome = () => {
    if (role === UserRole.DRIVER) {
      navigate('/driver/home');
    } else if (role === UserRole.PASSENGER) {
      navigate('/passenger/home');
    } else {
      navigate('/');
    }
  };

  const goBack = () => {
    // Check if there's history to go back to
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      goToHome();
    }
  };

  const canGoBack = () => {
    return window.history.length > 1;
  };

  const isOnHomePage = () => {
    if (role === UserRole.DRIVER) {
      return location.pathname === '/driver/home';
    } else if (role === UserRole.PASSENGER) {
      return location.pathname === '/passenger/home';
    }
    return location.pathname === '/';
  };

  const getHomeRoute = () => {
    if (role === UserRole.DRIVER) {
      return '/driver/home';
    } else if (role === UserRole.PASSENGER) {
      return '/passenger/home';
    }
    return '/';
  };

  return {
    navigate,
    location,
    role,
    goToHome,
    goBack,
    canGoBack,
    isOnHomePage,
    getHomeRoute,
  };
}; 