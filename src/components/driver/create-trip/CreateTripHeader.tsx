
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";

const CreateTripHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border-b p-4">
      <div className="flex items-center max-w-md mx-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mr-3"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-xl font-bold">Post a Trip</h1>
      </div>
    </div>
  );
};

export default CreateTripHeader;
