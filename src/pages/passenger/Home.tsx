import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageHeader } from '@/components/ui/page-header';
import { useActiveRequest } from "@/hooks/useActiveRequest";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Plus } from "lucide-react";

const PassengerHome = () => {
  const navigate = useNavigate();
  const { activeRequest, matches, isLoadingMatches, clearRequest } = useActiveRequest();

  if (activeRequest) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader 
          title="Active Request" 
          showBack={false} 
          showHome={false}
        />
        
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-2">Searching for your ride...</h2>
              <p className="text-gray-600 mb-4">
                From: {activeRequest.from_address} <br/>
                To: {activeRequest.to_address}
              </p>
              {isLoadingMatches && <Loader2 className="w-8 h-8 mx-auto animate-spin" />}
              
              {matches.length > 0 && (
                <Button onClick={() => navigate('/passenger/matches')} className="mt-4">
                  View {matches.length} Matches
                </Button>
              )}

              <Button variant="link" onClick={clearRequest} className="mt-4 text-red-500">
                Cancel Request
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Passenger Dashboard" 
        showBack={false} 
        showHome={false}
      />
      
      <div className="min-h-screen flex flex-col items-center justify-center py-10 space-y-6">
        <h1 className="text-3xl font-bold">Find Your Ride</h1>
        <p className="text-gray-600 text-center max-w-md">Find a ride that matches your needs and travel comfortably.</p>
        
        <Link to="/passenger/request" className="w-full max-w-xs">
          <Button className="w-full h-12 text-lg">
            <Plus className="w-5 h-5 mr-2" />
            Create a Ride Request
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default PassengerHome; 