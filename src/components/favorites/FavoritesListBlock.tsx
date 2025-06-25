
import React from 'react';
import FavoriteCardBlock from './FavoriteCardBlock';

interface Favorite {
  id: string;
  label: string;
  address: string;
  lat?: number;
  lng?: number;
  created_at: string;
}

interface FavoritesListBlockProps {
  favorites: Favorite[];
  onEdit: (favorite: Favorite) => void;
  onDelete: (favorite: Favorite) => void;
  onShowOnMap: (favorite: Favorite) => void;
}

const FavoritesListBlock: React.FC<FavoritesListBlockProps> = ({
  favorites,
  onEdit,
  onDelete,
  onShowOnMap
}) => {
  if (favorites.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📍</div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No favorites yet</h3>
        <p className="text-gray-600 mb-4">Save your frequently visited places for faster booking</p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
          <h4 className="font-medium text-blue-800 mb-2">✨ Smart Suggestions:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Do you often go to Church on Sundays? Save it now!</li>
            <li>• Add your workplace for easy morning commutes</li>
            <li>• Save the market you visit regularly</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {favorites.map((favorite) => (
        <FavoriteCardBlock
          key={favorite.id}
          favorite={favorite}
          onEdit={() => onEdit(favorite)}
          onDelete={() => onDelete(favorite)}
          onShowOnMap={() => onShowOnMap(favorite)}
        />
      ))}
      
      {favorites.length >= 8 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
          <p className="text-sm text-yellow-700">
            💡 You have {favorites.length} favorites. Consider removing unused ones to keep your list organized.
          </p>
        </div>
      )}
    </div>
  );
};

export default FavoritesListBlock;
