
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, CheckCircle, AlertTriangle, XCircle, Activity, Database, Zap } from 'lucide-react';
import { useIntegrationTesting } from '@/hooks/useIntegrationTesting';
import { useEdgeFunctionMonitor } from '@/hooks/useEdgeFunctionMonitor';
import { PerformanceMonitor } from '@/services/PerformanceMonitor';

const ProductionDashboard: React.FC = () => {
  const { testResults, isRunning, runFullIntegrationTest } = useIntegrationTesting();
  const { functionStatuses, isMonitoring, checkAllFunctions, getHealthSummary } = useEdgeFunctionMonitor();
  const [performanceReport, setPerformanceReport] = useState<any>({});

  const healthSummary = getHealthSummary();
  const monitor = PerformanceMonitor.getInstance();

  useEffect(() => {
    // Update performance report every 30 seconds
    const interval = setInterval(() => {
      setPerformanceReport(monitor.getPerformanceReport());
    }, 30000);

    // Initial load
    setPerformanceReport(monitor.getPerformanceReport());

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'degraded':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'fail':
      case 'offline':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <RefreshCw className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800';
      case 'fail':
      case 'offline':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Production Dashboard</h1>
        <div className="flex space-x-2">
          <Button
            onClick={runFullIntegrationTest}
            disabled={isRunning}
            variant="outline"
          >
            {isRunning ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Activity className="w-4 h-4 mr-2" />
            )}
            Run Integration Tests
          </Button>
          <Button
            onClick={checkAllFunctions}
            disabled={isMonitoring}
            variant="outline"
          >
            {isMonitoring ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 mr-2" />
            )}
            Check Edge Functions
          </Button>
        </div>
      </div>

      {/* Overall Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Integration Tests</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {testResults.filter(t => t.status === 'pass').length}/{testResults.length}
            </div>
            <p className="text-xs text-muted-foreground">Tests Passing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Edge Functions</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthSummary.healthPercentage}%</div>
            <p className="text-xs text-muted-foreground">Functions Healthy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthSummary.avgResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">Edge Function Latency</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {monitor.isPerformanceDegraded() ? 'WARN' : 'OK'}
            </div>
            <p className="text-xs text-muted-foreground">System Performance</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="integration" className="space-y-4">
        <TabsList>
          <TabsTrigger value="integration">Integration Tests</TabsTrigger>
          <TabsTrigger value="functions">Edge Functions</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="integration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integration Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              {testResults.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No tests run yet. Click "Run Integration Tests" to start.
                </p>
              ) : (
                <div className="space-y-3">
                  {testResults.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(result.status)}
                        <span className="font-medium">{result.test}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {result.duration && (
                          <span className="text-sm text-gray-500">{result.duration}ms</span>
                        )}
                        <Badge className={getStatusColor(result.status)}>
                          {result.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="functions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Edge Function Health</CardTitle>
            </CardHeader>
            <CardContent>
              {functionStatuses.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No function checks run yet. Click "Check Edge Functions" to start.
                </p>
              ) : (
                <div className="space-y-3">
                  {functionStatuses.map((func, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(func.status)}
                        <span className="font-medium">{func.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">{func.responseTime}ms</span>
                        <Badge className={getStatusColor(func.status)}>
                          {func.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(performanceReport).length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No performance data available yet. Use the app to generate metrics.
                </p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(performanceReport).map(([key, metrics]: [string, any]) => (
                    <div key={key} className="flex items-center justify-between p-3 border rounded">
                      <span className="font-medium">{key.replace(/_/g, ' ')}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          Avg: {metrics.avg.toFixed(0)}ms
                        </span>
                        <span className="text-sm text-gray-500">
                          Latest: {metrics.latest.toFixed(0)}ms
                        </span>
                        <Badge variant="outline">
                          {metrics.count} samples
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductionDashboard;
