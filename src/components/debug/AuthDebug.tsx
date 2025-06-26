
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

const AuthDebug: React.FC = () => {
  const { user, session, userProfile, loading } = useAuth();
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h4 className="font-bold mb-2">🐛 Auth Debug</h4>
      <div>Loading: {loading ? '✅' : '❌'}</div>
      <div>User ID: {user?.id || 'null'}</div>
      <div>Session: {session ? '✅' : '❌'}</div>
      <div>Profile: {userProfile?.id || 'null'}</div>
      <div>Role: {userProfile?.role || 'null'}</div>
      <div>Onboarding: {userProfile?.onboarding_completed ? '✅' : '❌'}</div>
    </div>
  );
};

export default AuthDebug;
