
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path: string;
}

const Breadcrumb = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Generate breadcrumb items based on current path
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', path: '/' }
    ];

    // Map path segments to readable labels
    const pathLabels: Record<string, string> = {
      dashboard: 'Dashboard',
      profile: 'Profile',
      settings: 'Settings',
      analytics: 'Analytics',
      notifications: 'Notifications',
      help: 'Help & Support',
      about: 'About',
      contact: 'Contact',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      login: 'Sign In',
      register: 'Sign Up',
      'forgot-password': 'Forgot Password',
      'verify-account': 'Verify Account',
      'book-ride': 'Book Ride',
      'create-trip': 'Create Trip',
      favorites: 'Favorites',
      leaderboard: 'Leaderboard',
      rewards: 'Rewards',
      'home': 'Home',
      'passenger': 'Passenger',
      'driver': 'Driver',
      'onboarding': 'Getting Started'
    };

    let currentPath = '';
    pathSegments.forEach((segment) => {
      currentPath += `/${segment}`;
      const label = pathLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      breadcrumbs.push({ label, path: currentPath });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumbs on home page
  if (location.pathname === '/') {
    return null;
  }

  return (
    <nav className="bg-gray-50 border-b px-4 sm:px-6 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto">
        <ol className="flex items-center space-x-2 text-sm">
          {breadcrumbs.map((item, index) => (
            <li key={item.path} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
              )}
              
              {index === breadcrumbs.length - 1 ? (
                // Current page - not clickable
                <span className="text-gray-900 font-medium flex items-center">
                  {index === 0 && <Home className="w-4 h-4 mr-1" />}
                  {item.label}
                </span>
              ) : (
                // Clickable breadcrumb
                <Button
                  variant="ghost"
                  className="text-gray-600 hover:text-gray-900 p-0 h-auto font-normal flex items-center"
                  onClick={() => navigate(item.path)}
                >
                  {index === 0 && <Home className="w-4 h-4 mr-1" />}
                  {item.label}
                </Button>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
};

export default Breadcrumb;
