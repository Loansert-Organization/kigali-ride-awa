
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Pencil, X } from 'lucide-react';

interface Favorite {
  id: string;
  label: string;
  address: string;
  lat?: number;
  lng?: number;
  created_at: string;
}

interface FavoriteCardBlockProps {
  favorite: Favorite;
  onEdit: () => void;
  onDelete: () => void;
  onShowOnMap: () => void;
}

const FavoriteCardBlock: React.FC<FavoriteCardBlockProps> = ({
  favorite,
  onEdit,
  onDelete,
  onShowOnMap
}) => {
  const getEmojiForLabel = (label: string) => {
    const lowercaseLabel = label.toLowerCase();
    if (lowercaseLabel.includes('home') || lowercaseLabel.includes('house')) return '🏠';
    if (lowercaseLabel.includes('work') || lowercaseLabel.includes('office')) return '🏢';
    if (lowercaseLabel.includes('church') || lowercaseLabel.includes('cathedral')) return '⛪';
    if (lowercaseLabel.includes('market') || lowercaseLabel.includes('shop')) return '🛒';
    if (lowercaseLabel.includes('school') || lowercaseLabel.includes('university')) return '🎓';
    if (lowercaseLabel.includes('hospital') || lowercaseLabel.includes('clinic')) return '🏥';
    if (lowercaseLabel.includes('gym') || lowercaseLabel.includes('fitness')) return '💪';
    if (lowercaseLabel.includes('restaurant') || lowercaseLabel.includes('cafe')) return '🍽️';
    return '📍';
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-2xl">{getEmojiForLabel(favorite.label)}</span>
              <h3 className="font-semibold text-gray-900">{favorite.label}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3 leading-relaxed">
              {favorite.address}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onShowOnMap}
                className="text-purple-600 border-purple-200 hover:bg-purple-50"
                disabled={!favorite.lat || !favorite.lng}
              >
                <MapPin className="w-4 h-4 mr-1" />
                📍 Show on Map
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <Pencil className="w-4 h-4 mr-1" />
                ✏️ Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onDelete}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-1" />
                ❌ Delete
              </Button>
            </div>
          </div>
        </div>
        
        {favorite.lat && favorite.lng && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              📍 {favorite.lat.toFixed(6)}, {favorite.lng.toFixed(6)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FavoriteCardBlock;
