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
  
  // Augmented user object with app-specific fields to satisfy TS where Supabase types are lacking
  type AppUser = typeof user extends null ? null : (NonNullable<typeof user> & {
    id?: string;
    phone?: string;
    role?: string;
    country?: string;
    promo_code?: string;
    is_anonymous?: boolean;
  });

  const safeUser = user as AppUser;

  return {
    user: safeUser,
    userProfile,
    driverProfile,
    role,
    loading,
    isAuthenticated: !!safeUser && !safeUser?.is_anonymous,
  };
}; 