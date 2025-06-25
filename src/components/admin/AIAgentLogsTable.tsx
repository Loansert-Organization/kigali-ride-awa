
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Bot, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface AIAgentLog {
  id: string;
  timestamp: string;
  agent: string;
  action: string;
  details: string;
  status: 'success' | 'error' | 'warning';
  user_id?: string;
  trip_id?: string;
}

const AIAgentLogsTable: React.FC = () => {
  const [logs, setLogs] = useState<AIAgentLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      // Mock data - in real implementation, this would fetch from agent_logs table
      const mockLogs: AIAgentLog[] = [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          agent: 'trip-matcher',
          action: 'match_passenger_driver',
          details: 'Successfully matched passenger with driver (Score: 85)',
          status: 'success'
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          agent: 'referral-validator',
          action: 'validate_weekly_referrals',
          details: 'Processed 12 referrals, awarded 45 points',
          status: 'success'
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          agent: 'fraud-detector',
          action: 'check_suspicious_activity',
          details: 'Flagged user for potential fake trips',
          status: 'warning'
        },
        {
          id: '4',
          timestamp: new Date(Date.now() - 10800000).toISOString(),
          agent: 'geocoding-service',
          action: 'reverse_geocode',
          details: 'Failed to geocode address: timeout',
          status: 'error'
        }
      ];
      
      setLogs(mockLogs);
    } catch (error) {
      console.error('Error loading AI agent logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg">
            <Bot className="w-5 h-5 mr-2" />
            🤖 AI Agent Activity Logs
          </CardTitle>
          <Button onClick={loadLogs} disabled={isLoading} variant="outline" size="sm">
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          Real-time logs from AI agents handling matching, validation, and monitoring
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
              <div className="flex-shrink-0 mt-1">
                {getStatusIcon(log.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{log.agent}</span>
                    <span className="text-gray-500">→</span>
                    <span className="text-sm text-gray-700">{log.action}</span>
                  </div>
                  {getStatusBadge(log.status)}
                </div>
                <p className="text-sm text-gray-600 mb-2">{log.details}</p>
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatTimestamp(log.timestamp)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {logs.length === 0 && !isLoading && (
          <div className="text-center py-8 text-gray-500">
            No AI agent logs available
          </div>
        )}

        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent mx-auto mb-2"></div>
            <p className="text-gray-600">Loading logs...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIAgentLogsTable;
