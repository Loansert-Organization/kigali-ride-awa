
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, Eye, RefreshCw } from 'lucide-react';

interface AILogData {
  id: string;
  timestamp: string;
  agentName: string;
  action: string;
  status: 'success' | 'failure';
  error?: string;
  payload?: any;
}

interface AIAgentLogsTableProps {
  data?: AILogData[];
}

export const AIAgentLogsTable: React.FC<AIAgentLogsTableProps> = ({ data = [] }) => {
  const [agentFilter, setAgentFilter] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AILogData | null>(null);

  // Mock data for demonstration
  const mockLogs: AILogData[] = [
    {
      id: '1',
      timestamp: new Date().toISOString(),
      agentName: 'RideMatchAgent',
      action: 'Matched passenger with driver',
      status: 'success'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      agentName: 'GeocodeAgent',
      action: 'Geocoded address',
      status: 'failure',
      error: 'Invalid address format'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      agentName: 'NotificationAgent',
      action: 'Sent WhatsApp message',
      status: 'success'
    }
  ];

  const logsData = data.length > 0 ? data : mockLogs;

  const uniqueAgents = [...new Set(logsData.map(log => log.agentName))];

  const filteredLogs = logsData.filter(log => 
    agentFilter === 'all' || log.agentName === agentFilter
  );

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // In a real implementation, this would trigger a data refetch
      console.log('Auto-refreshing AI logs...');
    }, 10000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const formatRelativeTime = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 min ago';
    if (minutes < 60) return `${minutes} mins ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;
    
    return new Date(timestamp).toLocaleDateString();
  };

  const handleViewPayload = (log: AILogData) => {
    setSelectedLog(log);
    // In a real implementation, this would open a modal with the full payload
    console.log('View log payload:', log);
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center space-x-4">
          <Select value={agentFilter} onValueChange={setAgentFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by agent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Agents</SelectItem>
              {uniqueAgents.map(agent => (
                <SelectItem key={agent} value={agent}>{agent}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <span className="text-sm text-gray-500">
            {filteredLogs.length} logs found
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
              id="auto-refresh"
            />
            <label htmlFor="auto-refresh" className="text-sm text-gray-700">
              Auto-refresh (10s)
            </label>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Now
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Error</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <div className="text-sm">
                    <div className="font-medium">
                      {formatRelativeTime(log.timestamp)}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono text-xs">
                    {log.agentName}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="max-w-xs">
                    <span className="text-sm">{log.action}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    {log.status === 'success' ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-green-600 text-sm font-medium">Success</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span className="text-red-600 text-sm font-medium">Failure</span>
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {log.error && (
                    <div className="max-w-xs">
                      <span className="text-sm text-red-600">{log.error}</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewPayload(log)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredLogs.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No AI logs found matching the current filters.
          </div>
        )}
      </div>
    </div>
  );
};
