
import React from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const DriverDetails = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const driverId = searchParams.get('id');

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  if (!driverId) {
    return <Navigate to="/admin/users" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b p-4">
        <div className="flex items-center max-w-7xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
            className="mr-3"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-bold">Driver Details</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Driver Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Driver ID: {driverId}</p>
            <p className="text-sm text-gray-500 mt-2">
              Detailed driver information would be loaded here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DriverDetails;
