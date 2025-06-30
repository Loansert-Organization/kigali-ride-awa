/**
 * Coded by Gemini
 * 
 * src/contexts/AuthContext.tsx
 * 
 * Manages global authentication state, user profiles, and driver data.
 * Follows the Lifuti PWA specification for anonymous-first auth.
 */
import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { UserProfile, DriverProfile, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  driverProfile: DriverProfile | null;
  role: UserRole | null;
  loading: boolean;
  isAnonymous: boolean;
  setRole: (role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const isAnonymous = !user?.phone;

  useEffect(() => {
    const fetchSessionAndProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      await handleAuthStateChange(session?.user ?? null);
    };

    fetchSessionAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => handleAuthStateChange(session?.user ?? null)
    );

    return () => authListener?.subscription.unsubscribe();
  }, []);
  
  const handleAuthStateChange = async (authUser: User | null) => {
    setLoading(true);
    if (!authUser) {
      // If no user, sign in anonymously
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) console.error("Error signing in anonymously:", error);
      setUser(data?.user ?? null);
      setUserProfile(null);
      setDriverProfile(null);
      setLoading(false);
      return;
    }

    setUser(authUser);

    // Fetch UserProfile using the correct schema
    // The users table uses 'id' as primary key that references auth.users.id
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching user profile:', profileError);
    }
    
    // If no profile exists, create one for anonymous users
    if (!profile) {
      const newProfile = {
        id: authUser.id,
        phone_verified: false,
        onboarding_completed: true, // Mark as completed for anonymous users
        is_suspended: false,
        anonymous_auth_uid: authUser.id,
        role: null, // Allow no role initially
      };
      
      const { data: createdProfile, error: createError } = await supabase
        .from('users')
        .insert(newProfile)
        .select()
        .single();
        
      if (createError) {
        console.error('Error creating user profile:', createError);
        // Even if profile creation fails, set a minimal profile
        setUserProfile({
          id: authUser.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          phone_verified: false,
          onboarding_completed: true,
          is_suspended: false,
          role: null,
          anonymous_auth_uid: authUser.id,
        } as UserProfile);
      } else {
        setUserProfile(createdProfile as UserProfile);
      }
    } else {
      setUserProfile(profile as UserProfile);
    }

    // Fetch DriverProfile if applicable - but don't require it
    if (profile?.role === UserRole.DRIVER) {
      const { data: driverData, error: driverError } = await supabase
        .from('drivers')
        .select('*')
        .eq('user_id', authUser.id)
        .single();
      
      if (driverError && driverError.code !== 'PGRST116') {
        console.error('Error fetching driver profile:', driverError);
      }
      setDriverProfile(driverData as DriverProfile);
    } else {
      setDriverProfile(null);
    }
    
    setLoading(false);
  };
  
  const setRole = async (role: UserRole) => {
    if (!user) return;

    // Use the create-or-update-user-profile edge function for proper role setting
    const { data, error } = await supabase.functions.invoke('create-or-update-user-profile', {
      body: {
        profileData: {
          role,
          onboarding_completed: false // Reset onboarding when role changes
        }
      }
    });

    if (error) {
      console.error("Error setting role:", error);
      return;
    }

    if (data?.success && data?.profile) {
      setUserProfile(data.profile as UserProfile);
      
      // If setting driver role, create driver profile
      if (role === UserRole.DRIVER) {
        const { data: driverData } = await supabase
          .from('drivers')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (!driverData) {
          // Create driver profile
          const { data: newDriverProfile } = await supabase
            .from('drivers')
            .insert({
              user_id: user.id,
              is_available: false,
              rating: 5.0,
              total_trips: 0
            })
            .select()
            .single();
            
          setDriverProfile(newDriverProfile as DriverProfile);
        }
      }
    }
  };
  
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserProfile(null);
    setDriverProfile(null);
  };

  const value = {
    user,
    userProfile,
    driverProfile,
    role: userProfile?.role ?? null,
    loading,
    isAnonymous,
    setRole,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
