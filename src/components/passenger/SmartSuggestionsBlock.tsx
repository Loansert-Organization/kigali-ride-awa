
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ShoppingBag, MapPin, Clock, Plus } from 'lucide-react';

interface Favorite {
  id: string;
  label: string;
  address: string;
}

interface SuggestionItem {
  icon: React.ComponentType<any>;
  label: string;
  type: string;
  color: string;
  data?: Favorite;
}

interface SmartSuggestionsBlockProps {
  favorites: Favorite[];
  onSuggestionClick: (suggestion: { type: string; data?: any }) => void;
}

const SmartSuggestionsBlock: React.FC<SmartSuggestionsBlockProps> = ({
  favorites,
  onSuggestionClick
}) => {
  const defaultSuggestions: SuggestionItem[] = [
    { icon: Home, label: 'Home', type: 'home', color: 'text-blue-600' },
    { icon: ShoppingBag, label: 'Market', type: 'market', color: 'text-green-600' },
    { icon: MapPin, label: 'Church', type: 'church', color: 'text-purple-600' },
    { icon: Clock, label: 'Last Trip', type: 'last_trip', color: 'text-orange-600' },
    { icon: Plus, label: 'Add Favorite', type: 'add_favorite', color: 'text-gray-600' }
  ];

  // Use favorites if available, otherwise show default suggestions
  const displaySuggestions: SuggestionItem[] = favorites.length > 0 
    ? [
        ...favorites.slice(0, 4).map(fav => ({
          icon: MapPin,
          label: fav.label,
          type: 'favorite',
          data: fav,
          color: 'text-purple-600'
        })),
        { icon: Plus, label: 'Add More', type: 'add_favorite', color: 'text-gray-600' }
      ]
    : defaultSuggestions;

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-purple-600" />
          📍 Where to?
        </h3>
        
        <div className="grid grid-cols-3 gap-3">
          {displaySuggestions.map((suggestion, index) => {
            const Icon = suggestion.icon;
            return (
              <Button
                key={index}
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-1 hover:bg-purple-50 transition-colors border-2 hover:border-purple-200"
                onClick={() => onSuggestionClick(suggestion)}
              >
                <Icon className={`w-6 h-6 ${suggestion.color}`} />
                <span className="text-xs font-medium text-center leading-tight">
                  {suggestion.label}
                </span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default SmartSuggestionsBlock;
