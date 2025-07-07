import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Plus, User, Car } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { useLocalization } from '@/hooks/useLocalization';

export const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useAuth();
  const { t } = useLocalization();

  if (!role || role === UserRole.ADMIN) return null;

  const isActive = (path: string) => location.pathname === path;

  const driverTabs = [
    {
      icon: Home,
      label: t('home'),
      path: '/driver/home',
    },
    {
      icon: Plus,
      label: t('post_trip'),
      path: '/driver/create-trip',
    },
    {
      icon: Car,
      label: t('vehicle_type'),
      path: '/driver/vehicle-setup',
    },
  ];

  const passengerTabs = [
    {
      icon: Home,
      label: t('home'),
      path: '/passenger/home',
    },
    {
      icon: Plus,
      label: t('book'),
      path: '/passenger/request',
    },
    {
      icon: User,
      label: t('trip_history'),
      path: '/passenger/history',
    },
  ];

  const tabs = role === UserRole.DRIVER ? driverTabs : passengerTabs;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);
          
          return (
            <Button
              key={tab.path}
              variant="ghost"
              onClick={() => navigate(tab.path)}
              className={`flex-1 flex flex-col items-center py-3 px-2 h-auto ${
                active ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${active ? 'text-blue-600' : 'text-gray-600'}`} />
              <span className={`text-xs ${active ? 'text-blue-600 font-medium' : 'text-gray-600'}`}>
                {tab.label}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}; 