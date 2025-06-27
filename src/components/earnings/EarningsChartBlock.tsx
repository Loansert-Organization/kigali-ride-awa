import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface EarningsData {
  date: string;
  earnings: number;
  trips: number;
}

interface EarningsChartBlockProps {
  data?: EarningsData[];
  isLoading?: boolean;
}

export const EarningsChartBlock: React.FC<EarningsChartBlockProps> = ({
  data = [],
  isLoading = false
}) => {
  // Mock data if none provided
  const mockData: EarningsData[] = [
    { date: '2024-01-10', earnings: 15000, trips: 8 },
    { date: '2024-01-11', earnings: 22000, trips: 12 },
    { date: '2024-01-12', earnings: 18000, trips: 10 },
    { date: '2024-01-13', earnings: 25000, trips: 14 },
    { date: '2024-01-14', earnings: 20000, trips: 11 },
    { date: '2024-01-15', earnings: 28000, trips: 16 },
    { date: '2024-01-16', earnings: 24000, trips: 13 }
  ];

  const displayData = data.length > 0 ? data : mockData;

  // Prepare pie chart data
  const pieData = [
    { name: 'Short Trips', value: 40, color: '#3B82F6' },
    { name: 'Medium Trips', value: 35, color: '#10B981' },
    { name: 'Long Trips', value: 25, color: '#F59E0B' }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{`Date: ${label}`}</p>
          <p className="text-green-600">{`Earnings: RWF ${payload[0].value.toLocaleString()}`}</p>
          <p className="text-blue-600">{`Trips: ${payload[0].payload?.trips || 0}`}</p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Earnings Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Daily Earnings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={displayData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis tickFormatter={(value) => `${value / 1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="earnings" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trip Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`${value}%`, 'Percentage']}
              />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="mt-4 space-y-2">
            {pieData.map((entry, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span className="text-sm">{entry.name}</span>
                </div>
                <span className="text-sm font-medium">{entry.value}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EarningsChartBlock;
