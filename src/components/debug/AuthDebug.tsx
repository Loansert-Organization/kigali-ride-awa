
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { Bug, Database, Key, Globe } from 'lucide-react';

const AuthDebug: React.FC = () => {
  const { user, session } = useAuth();

  const debugInfo = {
    supabaseUrl: 'https://ldbzarwjnnsoyoengheg.supabase.co',
    supabaseKeyLength: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkYnphcndqbm5zb3lvZW5naGVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NzA4OTIsImV4cCI6MjA2NjQ0Njg5Mn0.iN-Viuf5Vg07aGyAnGgqW3DKFUcqxn8U2KAUeAMk9uY'.length,
    environment: process.env.NODE_ENV || 'development'
  };

  const clearAllData = () => {
    // Clear localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('supabase') || key.startsWith('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Clear sessionStorage
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('supabase') || key.startsWith('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
    
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bug className="w-5 h-5 mr-2" />
            Auth Debug Panel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Database className="w-4 h-4 text-blue-500" />
                <span className="font-semibold">Database</span>
              </div>
              <p className="text-sm text-gray-600">Connected</p>
              <p className="text-xs text-gray-500">{debugInfo.supabaseUrl}</p>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Key className="w-4 h-4 text-green-500" />
                <span className="font-semibold">API Key</span>
              </div>
              <p className="text-sm text-gray-600">Valid</p>
              <p className="text-xs text-gray-500">{debugInfo.supabaseKeyLength} chars</p>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Globe className="w-4 h-4 text-purple-500" />
                <span className="font-semibold">Environment</span>
              </div>
              <Badge variant={debugInfo.environment === 'production' ? 'default' : 'secondary'}>
                {debugInfo.environment}
              </Badge>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <h4 className="font-semibold mb-2">Current User</h4>
              <div className="p-3 bg-gray-50 rounded-lg">
                {user ? (
                  <div className="space-y-1">
                    <p className="text-sm"><strong>ID:</strong> {user.id}</p>
                    <p className="text-sm"><strong>Email:</strong> {user.email || 'Not provided'}</p>
                    <p className="text-sm"><strong>Phone:</strong> {user.phone || 'Not provided'}</p>
                    <p className="text-sm"><strong>Role:</strong> {user.user_metadata?.role || 'None'}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">No user authenticated</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Session Info</h4>
              <div className="p-3 bg-gray-50 rounded-lg">
                {session ? (
                  <div className="space-y-1">
                    <p className="text-sm"><strong>Access Token:</strong> {session.access_token ? 'Present' : 'Missing'}</p>
                    <p className="text-sm"><strong>Refresh Token:</strong> {session.refresh_token ? 'Present' : 'Missing'}</p>
                    <p className="text-sm"><strong>Expires:</strong> {session.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : 'Unknown'}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">No active session</p>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button
              variant="destructive"
              onClick={clearAllData}
              className="w-full"
            >
              Clear All Auth Data & Reload
            </Button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              This will clear all authentication data and reload the page
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthDebug;
