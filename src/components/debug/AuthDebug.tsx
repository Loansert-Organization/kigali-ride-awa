
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

const AuthDebug: React.FC = () => {
  const { user, session, userProfile, loading, error, debugInfo } = useAuth();
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50 max-h-96 overflow-y-auto">
      <h4 className="font-bold mb-2">🐛 Auth Debug</h4>
      <div className="space-y-1">
        <div>Loading: {loading ? '✅' : '❌'}</div>
        <div>User ID: {user?.id || 'null'}</div>
        <div>Session: {session ? '✅' : '❌'}</div>
        <div>Profile: {userProfile?.id || 'null'}</div>
        <div>Role: {userProfile?.role || 'null'}</div>
        <div>Onboarding: {userProfile?.onboarding_completed ? '✅' : '❌'}</div>
        
        {error && (
          <div className="text-red-400 mt-2">
            <div className="font-semibold">Error:</div>
            <div className="text-xs break-words">{error}</div>
          </div>
        )}
        
        {debugInfo?.environment && (
          <div className="mt-2 pt-2 border-t border-gray-600">
            <div className="font-semibold">Environment:</div>
            <div>URL: {debugInfo.environment.supabaseUrl?.substring(0, 30)}...</div>
            <div>Key Length: {debugInfo.environment.supabaseKeyLength}</div>
            <div>Mode: {debugInfo.environment.environment}</div>
          </div>
        )}
        
        {debugInfo?.initDuration && (
          <div className="mt-1">
            <div>Init Time: {debugInfo.initDuration}ms</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthDebug;
