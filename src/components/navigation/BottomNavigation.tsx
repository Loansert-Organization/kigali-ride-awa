
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Home, Search, Star, Gift, User, Plus, Users } from 'lucide-react';

interface BottomNavigationProps {
  role: 'passenger' | 'driver';
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ role }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const passengerTabs = [
    { icon: Home, label: 'Home', path: '/home/passenger' },
    { icon: Search, label: 'Book', path: '/book-ride' },
    { icon: Star, label: 'Favorites', path: '/favorites' },
    { icon: Gift, label: 'Rewards', path: '/leaderboard' },
    { icon: User, label: 'Profile', path: '/profile' }
  ];

  const driverTabs = [
    { icon: Home, label: 'Home', path: '/home/driver' },
    { icon: Plus, label: 'Create', path: '/create-trip' },
    { icon: Users, label: 'Requests', path: '/passenger-requests' },
    { icon: Gift, label: 'Rewards', path: '/leaderboard' },
    { icon: User, label: 'Profile', path: '/profile' }
  ];

  const tabs = role === 'passenger' ? passengerTabs : driverTabs;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-1">
      <div className="flex justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;
          
          return (
            <Button
              key={tab.path}
              variant="ghost"
              onClick={() => navigate(tab.path)}
              className={`flex-1 flex flex-col items-center py-3 px-1 h-auto ${
                isActive 
                  ? 'text-purple-600 bg-purple-50' 
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-sm font-semibold">{tab.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
