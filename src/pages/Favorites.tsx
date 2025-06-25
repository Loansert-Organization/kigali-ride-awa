
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import FavoritesListBlock from "@/components/favorites/FavoritesListBlock";
import AddFavoriteModal from "@/components/favorites/AddFavoriteModal";
import EditFavoriteModal from "@/components/favorites/EditFavoriteModal";
import DeleteConfirmationModal from "@/components/favorites/DeleteConfirmationModal";

interface Favorite {
  id: string;
  label: string;
  address: string;
  lat?: number;
  lng?: number;
  created_at: string;
}

const Favorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFavorite, setEditingFavorite] = useState<Favorite | null>(null);
  const [deletingFavorite, setDeletingFavorite] = useState<Favorite | null>(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: userRecord } = await supabase
          .from('users')
          .select('id')
          .eq('auth_user_id', user.id)
          .single();
        
        if (userRecord) {
          const { data, error } = await supabase
            .from('favorites')
            .select('*')
            .eq('user_id', userRecord.id)
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          setFavorites(data || []);
        }
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      toast({
        title: "Error",
        description: "Could not load your favorites",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddFavorite = async (favoriteData: { label: string; address: string; lat?: number; lng?: number }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: userRecord } = await supabase
          .from('users')
          .select('id')
          .eq('auth_user_id', user.id)
          .single();
        
        if (userRecord) {
          const { error } = await supabase
            .from('favorites')
            .insert({
              user_id: userRecord.id,
              label: favoriteData.label,
              address: favoriteData.address,
              lat: favoriteData.lat,
              lng: favoriteData.lng
            });
          
          if (error) throw error;
          
          await loadFavorites();
          setShowAddModal(false);
          
          toast({
            title: "Favorite saved! ⭐",
            description: "You can now use it when booking rides"
          });
        }
      }
    } catch (error) {
      console.error('Error adding favorite:', error);
      toast({
        title: "Error",
        description: "Could not save favorite",
        variant: "destructive"
      });
    }
  };

  const handleEditFavorite = async (favoriteData: { label: string; address: string; lat?: number; lng?: number }) => {
    if (!editingFavorite) return;
    
    try {
      const { error } = await supabase
        .from('favorites')
        .update({
          label: favoriteData.label,
          address: favoriteData.address,
          lat: favoriteData.lat,
          lng: favoriteData.lng
        })
        .eq('id', editingFavorite.id);
      
      if (error) throw error;
      
      await loadFavorites();
      setEditingFavorite(null);
      
      toast({
        title: "Favorite updated",
        description: "Your changes have been saved"
      });
    } catch (error) {
      console.error('Error updating favorite:', error);
      toast({
        title: "Error",
        description: "Could not update favorite",
        variant: "destructive"
      });
    }
  };

  const handleDeleteFavorite = async () => {
    if (!deletingFavorite) return;
    
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', deletingFavorite.id);
      
      if (error) throw error;
      
      await loadFavorites();
      setDeletingFavorite(null);
      
      toast({
        title: "Favorite deleted",
        description: "Location removed from your favorites"
      });
    } catch (error) {
      console.error('Error deleting favorite:', error);
      toast({
        title: "Error",
        description: "Could not delete favorite",
        variant: "destructive"
      });
    }
  };

  const handleShowOnMap = (favorite: Favorite) => {
    if (favorite.lat && favorite.lng) {
      // Open Google Maps with the location
      const url = `https://www.google.com/maps?q=${favorite.lat},${favorite.lng}`;
      window.open(url, '_blank');
    } else {
      toast({
        title: "Location not available",
        description: "No coordinates saved for this location",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-orange-500 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">⭐ My Favorite Places</h1>
              <p className="text-purple-100 text-sm">Manage your saved locations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your favorites...</p>
          </div>
        ) : (
          <>
            <FavoritesListBlock
              favorites={favorites}
              onEdit={setEditingFavorite}
              onDelete={setDeletingFavorite}
              onShowOnMap={handleShowOnMap}
            />
            
            {/* Add New Favorite Button */}
            <div className="mt-6">
              <Button
                onClick={() => setShowAddModal(true)}
                className="w-full h-14 bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white font-semibold rounded-lg shadow-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                ➕ Add New Favorite
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <AddFavoriteModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddFavorite}
      />

      <EditFavoriteModal
        isOpen={!!editingFavorite}
        onClose={() => setEditingFavorite(null)}
        onSave={handleEditFavorite}
        favorite={editingFavorite}
      />

      <DeleteConfirmationModal
        isOpen={!!deletingFavorite}
        onClose={() => setDeletingFavorite(null)}
        onConfirm={handleDeleteFavorite}
        favoriteName={deletingFavorite?.label || ''}
      />
    </div>
  );
};

export default Favorites;
