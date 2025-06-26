
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useModal } from '@/hooks/useModal';
import { Minimize2, X, Bug } from 'lucide-react';

const AuthDebug: React.FC = () => {
  const { user, session, userProfile, loading, error, debugInfo } = useAuth();
  const { isOpen, openModal, closeModal } = useModal();
  const [isMinimized, setIsMinimized] = React.useState(false);
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  // If closed completely, show nothing
  if (!isOpen && !isMinimized) {
    return (
      <button
        onClick={openModal}
        className="fixed bottom-4 left-4 bg-black text-white p-2 rounded-full z-50 hover:bg-gray-800 transition-colors"
        title="Show Auth Debug"
      >
        <Bug className="w-4 h-4" />
      </button>
    );
  }

  // If minimized, show compact version
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 left-4 bg-black text-white p-2 rounded-lg z-50 flex items-center gap-2">
        <Bug className="w-4 h-4" />
        <span className="text-xs">Auth: {loading ? 'Loading...' : user ? '✅' : '❌'}</span>
        <button
          onClick={() => setIsMinimized(false)}
          className="text-white hover:text-gray-300 transition-colors"
          title="Expand"
        >
          <Minimize2 className="w-3 h-3" />
        </button>
        <button
          onClick={closeModal}
          className="text-white hover:text-gray-300 transition-colors"
          title="Close"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  }

  // Full expanded version
  return (
    <div className="fixed bottom-4 left-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50 max-h-96 overflow-y-auto">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-bold flex items-center gap-1">
          <Bug className="w-3 h-3" />
          Auth Debug
        </h4>
        <div className="flex gap-1">
          <button
            onClick={() => setIsMinimized(true)}
            className="text-white hover:text-gray-300 transition-colors"
            title="Minimize"
          >
            <Minimize2 className="w-3 h-3" />
          </button>
          <button
            onClick={closeModal}
            className="text-white hover:text-gray-300 transition-colors"
            title="Close"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
      
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
