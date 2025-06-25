
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, AlertTriangle, XCircle, RefreshCw, Database, Shield, Link, BarChart3 } from 'lucide-react';
import { SchemaAuditService, SchemaAuditResult } from '@/services/SchemaAuditService';

const SchemaAuditReport: React.FC = () => {
  const [auditResults, setAuditResults] = useState<SchemaAuditResult[]>([]);
  const [summary, setSummary] = useState({ total: 0, passed: 0, warnings: 0, failed: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [lastAudit, setLastAudit] = useState<Date | null>(null);

  const runAudit = async () => {
    setIsLoading(true);
    try {
      const { results, summary: auditSummary } = await SchemaAuditService.performFullAudit();
      setAuditResults(results);
      setSummary(auditSummary);
      setLastAudit(new Date());
    } catch (error) {
      console.error('Audit failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const runRLSTest = async () => {
    setIsLoading(true);
    try {
      const rlsResults = await SchemaAuditService.testRLSPolicies();
      setAuditResults(prev => [...prev, ...rlsResults]);
    } catch (error) {
      console.error('RLS test failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runAudit();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case '✅':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case '⚠️':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case '❌':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '✅':
        return 'bg-green-100 text-green-800';
      case '⚠️':
        return 'bg-yellow-100 text-yellow-800';
      case '❌':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const groupedResults = auditResults.reduce((acc, result) => {
    const category = result.table;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(result);
    return acc;
  }, {} as Record<string, SchemaAuditResult[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">🔍 Database Schema Audit</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive verification of Supabase tables, RLS policies, and data integrity
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={runRLSTest} disabled={isLoading} variant="outline">
            <Shield className="w-4 h-4 mr-2" />
            Test RLS
          </Button>
          <Button onClick={runAudit} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Run Audit
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Checks</p>
                <p className="text-2xl font-bold">{summary.total}</p>
              </div>
              <Database className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Passed</p>
                <p className="text-2xl font-bold text-green-600">{summary.passed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Warnings</p>
                <p className="text-2xl font-bold text-yellow-600">{summary.warnings}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">{summary.failed}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Last Audit Info */}
      {lastAudit && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">
              Last audit: {lastAudit.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Detailed Results */}
      <Tabs defaultValue="tables" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tables">
            <Database className="w-4 h-4 mr-2" />
            Tables
          </TabsTrigger>
          <TabsTrigger value="rls">
            <Shield className="w-4 h-4 mr-2" />
            RLS Policies
          </TabsTrigger>
          <TabsTrigger value="relationships">
            <Link className="w-4 h-4 mr-2" />
            Relationships
          </TabsTrigger>
          <TabsTrigger value="integrity">
            <BarChart3 className="w-4 h-4 mr-2" />
            Data Integrity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tables">
          <div className="space-y-4">
            {Object.entries(groupedResults).map(([category, results]) => (
              category !== 'relationships' && category !== 'data_integrity' && category !== 'rls_test' && (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="capitalize">{category.replace('_', ' ')} Table</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {results.map((result, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                          {getStatusIcon(result.status)}
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{result.field || 'Table Structure'}</span>
                              <Badge className={getStatusColor(result.status)}>
                                {result.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{result.issue}</p>
                            {result.fix && (
                              <p className="text-sm text-blue-600 mt-1">💡 {result.fix}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rls">
          <Card>
            <CardHeader>
              <CardTitle>Row Level Security Policies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {groupedResults.rls_test?.map((result, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{result.field}</span>
                        <Badge className={getStatusColor(result.status)}>
                          {result.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{result.issue}</p>
                      {result.fix && (
                        <p className="text-sm text-blue-600 mt-1">💡 {result.fix}</p>
                      )}
                    </div>
                  </div>
                )) || (
                  <p className="text-gray-500 text-center py-8">
                    No RLS tests run yet. Click "Test RLS" to verify security policies.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relationships">
          <Card>
            <CardHeader>
              <CardTitle>Foreign Key Relationships</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {groupedResults.relationships?.map((result, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{result.field}</span>
                        <Badge className={getStatusColor(result.status)}>
                          {result.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{result.issue}</p>
                      {result.fix && (
                        <p className="text-sm text-blue-600 mt-1">💡 {result.fix}</p>
                      )}
                    </div>
                  </div>
                )) || (
                  <p className="text-gray-500 text-center py-8">
                    No relationship checks available.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrity">
          <Card>
            <CardHeader>
              <CardTitle>Data Integrity Checks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {groupedResults.data_integrity?.map((result, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{result.field}</span>
                        <Badge className={getStatusColor(result.status)}>
                          {result.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{result.issue}</p>
                      {result.fix && (
                        <p className="text-sm text-blue-600 mt-1">💡 {result.fix}</p>
                      )}
                    </div>
                  </div>
                )) || (
                  <p className="text-gray-500 text-center py-8">
                    No data integrity checks available.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SchemaAuditReport;
