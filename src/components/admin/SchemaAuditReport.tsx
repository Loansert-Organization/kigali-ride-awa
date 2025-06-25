
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Database, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { SchemaAuditService, SchemaAuditResult } from '@/services/SchemaAuditService';

const SchemaAuditReport: React.FC = () => {
  const [auditResults, setAuditResults] = useState<SchemaAuditResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState({
    total: 0,
    passed: 0,
    warnings: 0,
    failed: 0
  });

  const runAudit = async () => {
    setIsLoading(true);
    try {
      const { results, summary: auditSummary } = await SchemaAuditService.performFullAudit();
      setAuditResults(results);
      setSummary(auditSummary);
    } catch (error) {
      console.error('Error running schema audit:', error);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case '✅':
        return <Badge className="bg-green-100 text-green-800">Passed</Badge>;
      case '⚠️':
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case '❌':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-xl">
              <Database className="w-6 h-6 mr-2" />
              🔍 Database Schema Audit
            </CardTitle>
            <Button onClick={runAudit} disabled={isLoading} variant="outline">
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Running Audit...' : 'Run Audit'}
            </Button>
          </div>
          <div className="text-sm text-gray-600">
            Comprehensive audit of database schema, RLS policies, and data integrity
          </div>
        </CardHeader>
        <CardContent>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{summary.total}</div>
              <div className="text-sm text-gray-600">Total Checks</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{summary.passed}</div>
              <div className="text-sm text-gray-600">Passed</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{summary.warnings}</div>
              <div className="text-sm text-gray-600">Warnings</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{summary.failed}</div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
          </div>

          {/* Audit Results */}
          <div className="space-y-3">
            {auditResults.map((result, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                <div className="flex-shrink-0 mt-0.5">
                  {getStatusIcon(result.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-gray-900">
                      {result.table}
                      {result.field && (
                        <span className="text-gray-500 ml-1">→ {result.field}</span>
                      )}
                    </div>
                    {getStatusBadge(result.status)}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{result.issue}</p>
                  {result.fix && (
                    <p className="text-sm text-blue-600 mt-1 italic">
                      Fix: {result.fix}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {auditResults.length === 0 && !isLoading && (
            <div className="text-center py-8 text-gray-500">
              No audit results available. Click "Run Audit" to start the analysis.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SchemaAuditReport;
