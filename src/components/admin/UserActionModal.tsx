
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface UserActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const UserActionModal: React.FC<UserActionModalProps> = ({ isOpen, onClose, userId }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md m-4">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">User Actions</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          <p>User ID: {userId}</p>
          <p>Actions coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserActionModal;
