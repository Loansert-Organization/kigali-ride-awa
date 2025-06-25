
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Home, Car, Star, Gift, User, MapPin, FileText } from 'lucide-react';

interface BottomNavigationProps {
  role: 'passenger' | 'driver';
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ role }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const passengerTabs = [
    { icon: Home, label: 'Home', path: '/home/passenger' },
    { icon: Car, label: 'Book', path: '/book-ride' },
    { icon: Star, label: 'Favorites', path: '/favorites' },
    { icon: Gift, label: 'Rewards', path: '/rewards' },
    { icon: User, label: 'Profile', path: '/profile' }
  ];

  const driverTabs = [
    { icon: Home, label: 'Home', path: '/home/driver' },
    { icon: MapPin, label: 'Create Trip', path: '/create-trip' },
    { icon: FileText, label: 'Requests', path: '/requests' },
    { icon: Gift, label: 'Rewards', path: '/rewards' },
    { icon: User, label: 'Profile', path: '/profile' }
  ];

  const tabs = role === 'passenger' ? passengerTabs : driverTabs;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-1">
      <div className="flex justify-around max-w-md mx-auto">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;
          
          return (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center py-2 px-3 min-w-0 ${
                isActive 
                  ? 'text-purple-600 bg-purple-50' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => navigate(tab.path)}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs truncate">{tab.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
