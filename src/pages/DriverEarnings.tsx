
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDriverEarnings } from "@/hooks/useDriverEarnings";
import { EarningsHeader } from "@/components/earnings/EarningsHeader";
import { EarningsLoading } from "@/components/earnings/EarningsLoading";
import { EarningsEmptyState } from "@/components/earnings/EarningsEmptyState";
import { EarningsSummaryBlock } from "@/components/earnings/EarningsSummaryBlock";
import { EarningsChartBlock } from "@/components/earnings/EarningsChartBlock";
import { CompletedTripsBlock } from "@/components/earnings/CompletedTripsBlock";
import { WithdrawalModal } from "@/components/earnings/WithdrawalModal";

const DriverEarnings = () => {
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('7days');

  const { data: earningsData, isLoading } = useDriverEarnings(selectedPeriod);

  const formatCurrency = (amount: number) => {
    return `RWF ${amount.toLocaleString()}`;
  };

  if (isLoading) {
    return <EarningsLoading />;
  }

  const hasNoEarnings = !earningsData?.completedTrips || earningsData.completedTrips.length === 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <EarningsHeader onWithdrawClick={() => setShowWithdrawalModal(true)} />

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

        {/* Completed Trips or Empty State */}
        {hasNoEarnings ? (
          <EarningsEmptyState />
        ) : (
          <CompletedTripsBlock 
            trips={earningsData?.completedTrips || []} 
            formatCurrency={formatCurrency}
          />
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
