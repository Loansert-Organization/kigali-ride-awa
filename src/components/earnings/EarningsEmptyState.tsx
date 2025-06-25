
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const EarningsEmptyState: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardContent className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Wallet className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          No earnings yet
        </h3>
        <p className="text-gray-600 mb-6">
          Once you complete trips, your earnings will appear here.
        </p>
        <Button
          onClick={() => navigate('/create-trip')}
          className="bg-purple-600 hover:bg-purple-700"
        >
          Create Your First Trip
        </Button>
      </CardContent>
    </Card>
  );
};
