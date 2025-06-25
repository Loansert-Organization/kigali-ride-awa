
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Wallet, TrendingUp, Download, Calendar, MapPin, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { EarningsSummaryBlock } from "@/components/earnings/EarningsSummaryBlock";
import { EarningsChartBlock } from "@/components/earnings/EarningsChartBlock";
import { CompletedTripsBlock } from "@/components/earnings/CompletedTripsBlock";
import { WithdrawalModal } from "@/components/earnings/WithdrawalModal";

interface EarningsData {
  today: number;
  thisWeek: number;
  thisMonth: number;
  allTime: number;
  completedTrips: any[];
  chartData: any[];
}

const DriverEarnings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('7days');

  // Fetch earnings data
  const { data: earningsData, isLoading } = useQuery({
    queryKey: ['driver-earnings', selectedPeriod],
    queryFn: async () => {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      // Calculate date ranges
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Fetch completed trips with bookings
      const { data: trips, error } = await supabase
        .from('trips')
        .select(`
          *,
          bookings (
            id,
            confirmed,
            passenger_trip_id
          )
        `)
        .eq('role', 'driver')
        .eq('user_id', currentUser.id)
        .eq('status', 'completed')
        .order('scheduled_time', { ascending: false });

      if (error) throw error;

      // Calculate earnings
      const calculateEarnings = (trips: any[], fromDate?: Date) => {
        return trips
          .filter(trip => !fromDate || new Date(trip.scheduled_time) >= fromDate)
          .reduce((total, trip) => {
            const seatsBooked = trip.bookings?.length || 0;
            const farePerSeat = trip.fare || 0;
            return total + (farePerSeat * seatsBooked);
          }, 0);
      };

      const todayEarnings = calculateEarnings(trips, today);
      const weekEarnings = calculateEarnings(trips, weekAgo);
      const monthEarnings = calculateEarnings(trips, monthAgo);
      const allTimeEarnings = calculateEarnings(trips);

      // Generate chart data
      const chartData = [];
      const period = selectedPeriod === '7days' ? 7 : 30;
      
      for (let i = period - 1; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
        
        const dayEarnings = trips
          .filter(trip => {
            const tripDate = new Date(trip.scheduled_time);
            return tripDate >= dayStart && tripDate < dayEnd;
          })
          .reduce((total, trip) => {
            const seatsBooked = trip.bookings?.length || 0;
            const farePerSeat = trip.fare || 0;
            return total + (farePerSeat * seatsBooked);
          }, 0);

        chartData.push({
          date: date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          }),
          earnings: dayEarnings,
          trips: trips.filter(trip => {
            const tripDate = new Date(trip.scheduled_time);
            return tripDate >= dayStart && tripDate < dayEnd;
          }).length
        });
      }

      return {
        today: todayEarnings,
        thisWeek: weekEarnings,
        thisMonth: monthEarnings,
        allTime: allTimeEarnings,
        completedTrips: trips,
        chartData
      } as EarningsData;
    },
    enabled: !!localStorage.getItem('currentUser')
  });

  const formatCurrency = (amount: number) => {
    return `RWF ${amount.toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your earnings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/home/driver')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">Your Earnings</h1>
            </div>
            <Button
              onClick={() => setShowWithdrawalModal(true)}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Withdraw
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-4 space-y-6">
        {/* Earnings Summary */}
        <EarningsSummaryBlock 
          data={earningsData} 
          formatCurrency={formatCurrency} 
        />

        {/* Earnings Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Earnings Trend</CardTitle>
              <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <TabsList className="grid w-32 grid-cols-2">
                  <TabsTrigger value="7days" className="text-xs">7 Days</TabsTrigger>
                  <TabsTrigger value="30days" className="text-xs">30 Days</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <EarningsChartBlock 
              data={earningsData?.chartData || []} 
              formatCurrency={formatCurrency}
            />
          </CardContent>
        </Card>

        {/* Completed Trips */}
        <CompletedTripsBlock 
          trips={earningsData?.completedTrips || []} 
          formatCurrency={formatCurrency}
        />

        {/* Empty State */}
        {(!earningsData?.completedTrips || earningsData.completedTrips.length === 0) && (
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
        )}
      </div>

      {/* Withdrawal Modal */}
      <WithdrawalModal 
        isOpen={showWithdrawalModal}
        onClose={() => setShowWithdrawalModal(false)}
        availableBalance={earningsData?.allTime || 0}
        formatCurrency={formatCurrency}
      />
    </div>
  );
};

export default DriverEarnings;
