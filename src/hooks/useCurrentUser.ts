import { useAuth } from "@/contexts/AuthContext";

/**
 * Coded by Gemini
 * 
 * A simple hook to provide direct access to the current user's state
 * and profile information, abstracting the main AuthContext.
 *
 * @returns An object containing the authenticated user, their app profile,
 *          their driver-specific profile, their role, and loading state.
 */
export const useCurrentUser = () => {
  const { user, userProfile, driverProfile, role, loading } = useAuth();
  
  return {
    user,
    userProfile,
    driverProfile,
    role,
    loading,
    isAuthenticated: !!user && !user.is_anonymous,
  };
}; 