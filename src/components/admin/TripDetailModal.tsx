
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface TripDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
}

const TripDetailModal: React.FC<TripDetailModalProps> = ({ isOpen, onClose, tripId }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl m-4">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Trip Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          <p>Trip ID: {tripId}</p>
          <p>Details coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TripDetailModal;
