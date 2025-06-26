
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, MapPin, Home, Briefcase, Heart, Edit, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import GooglePlacesInput from '@/components/booking/GooglePlacesInput';

interface Favorite {
  id: string;
  label: string;
  address: string;
  lat?: number;
  lng?: number;
  created_at: string;
}

const FavoritesManager = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFavorite, setEditingFavorite] = useState<Favorite | null>(null);
  const [newFavorite, setNewFavorite] = useState({
    label: '',
    address: '',
    lat: undefined as number | undefined,
    lng: undefined as number | undefined
  });

  useEffect(() => {
    if (userProfile) {
      loadFavorites();
    }
  }, [userProfile]);

  const loadFavorites = async () => {
    if (!userProfile) return;

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', userProfile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error('Error loading favorites:', error);
      toast({
        title: "Error loading favorites",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddFavorite = async () => {
    if (!userProfile || !newFavorite.label.trim() || !newFavorite.address.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('favorites')
        .insert({
          user_id: userProfile.id,
          label: newFavorite.label.trim(),
          address: newFavorite.address.trim(),
          lat: newFavorite.lat,
          lng: newFavorite.lng
        });

      if (error) throw error;

      toast({
        title: "Favorite added!",
        description: "Location saved for quick booking",
      });

      setNewFavorite({ label: '', address: '', lat: undefined, lng: undefined });
      setShowAddModal(false);
      loadFavorites();
    } catch (error) {
      console.error('Error adding favorite:', error);
      toast({
        title: "Failed to add favorite",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const handleDeleteFavorite = async (favoriteId: string) => {
    if (!window.confirm('Are you sure you want to delete this favorite location?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;

      toast({
        title: "Favorite deleted",
        description: "Location removed from your favorites",
      });

      loadFavorites();
    } catch (error) {
      console.error('Error deleting favorite:', error);
      toast({
        title: "Failed to delete favorite",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const getFavoriteIcon = (label: string) => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes('home') || lowerLabel.includes('house')) return Home;
    if (lowerLabel.includes('work') || lowerLabel.includes('office')) return Briefcase;
    return Heart;
  };

  const resetModal = () => {
    setNewFavorite({ label: '', address: '', lat: undefined, lng: undefined });
    setEditingFavorite(null);
    setShowAddModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="mr-3"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-xl font-bold">Favorite Places</h1>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto">
        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No favorite places yet
            </h3>
            <p className="text-gray-600 mb-6">
              Add your frequently visited locations for quick booking
            </p>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Favorite
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {favorites.map((favorite) => {
              const IconComponent = getFavoriteIcon(favorite.label);
              return (
                <Card key={favorite.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <IconComponent className="w-5 h-5 text-purple-600" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {favorite.label}
                          </h3>
                          <p className="text-sm text-gray-600 truncate">
                            {favorite.address}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingFavorite(favorite);
                            setNewFavorite({
                              label: favorite.label,
                              address: favorite.address,
                              lat: favorite.lat,
                              lng: favorite.lng
                            });
                            setShowAddModal(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteFavorite(favorite.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Favorite Modal */}
      <Dialog open={showAddModal} onOpenChange={() => resetModal()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingFavorite ? 'Edit Favorite Place' : 'Add Favorite Place'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="label">Name this place</Label>
              <Input
                id="label"
                placeholder="e.g., Home, Work, Gym"
                value={newFavorite.label}
                onChange={(e) => setNewFavorite(prev => ({ ...prev, label: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <GooglePlacesInput
                value={newFavorite.address}
                onChange={(address, coordinates) => {
                  setNewFavorite(prev => ({
                    ...prev,
                    address,
                    lat: coordinates?.lat,
                    lng: coordinates?.lng
                  }));
                }}
                placeholder="Enter or search for address..."
              />
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={resetModal}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddFavorite}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {editingFavorite ? 'Update' : 'Add'} Favorite
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FavoritesManager;
