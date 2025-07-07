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
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  const isAnonymous = !user?.phone;

  useEffect(() => {
    const fetchSessionAndProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      await handleAuthStateChange(session?.user ?? null);
    };

    fetchSessionAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event: string, session: any) => handleAuthStateChange(session?.user ?? null)
    );

    return () => authListener?.subscription.unsubscribe();
  }, []);
  
  const handleAuthStateChange = async (authUser: User | null) => {
    setLoading(true);
    if (!authUser) {
      // Create a local session that works offline
      console.log("No authenticated user found, creating local session");
      
      // Check if we have a stored local session
      const storedSession = localStorage.getItem('localSession');
      if (storedSession) {
        try {
          const session = JSON.parse(storedSession);
          setUser(session.user);
          setUserProfile(session.profile);
          if (session.driverProfile) {
            setDriverProfile(session.driverProfile);
          }
          setLoading(false);
          return;
        } catch (err) {
          console.error('Error parsing stored session:', err);
        }
      }
      
      // Create a new local session
      const localUser = {
        id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        aud: 'authenticated',
        role: 'authenticated',
        email: '',
        phone: '',
        app_metadata: { provider: 'local' },
        user_metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as unknown as User;
      
      const localProfile: UserProfile = {
        id: localUser.id,
        auth_user_id: localUser.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        phone_verified: false,
        onboarding_completed: false,
        is_suspended: false,
        role: null,
        auth_method: 'local',
      } as UserProfile;
      
      // Store in localStorage
      localStorage.setItem('localSession', JSON.stringify({
        user: localUser,
        profile: localProfile,
        createdAt: new Date().toISOString()
      }));
      
      setUser(localUser);
      setUserProfile(localProfile);
      setDriverProfile(null);
      setLoading(false);
      
      console.log("Created local session:", localUser.id);
      return;
    }

    // Rest of the function remains the same for real Supabase users
    setUser(authUser);

    // For anonymous users, create a user profile in the users table
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', authUser.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching user profile:', profileError);
    }
    
    // If no profile exists, create one for anonymous users
    if (!profile) {
      const newProfile = {
        auth_user_id: authUser.id,
        phone_verified: false,
        onboarding_completed: false,
        is_suspended: false,
        role: null,
        auth_method: 'anonymous',
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
          auth_user_id: authUser.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          phone_verified: false,
          onboarding_completed: false,
          is_suspended: false,
          role: null,
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

    try {
      // Check if this is a local session
      if (user.id.startsWith('local-')) {
        console.log('Setting role for local session:', role);
        
        // Update local session
        const localSession = localStorage.getItem('localSession');
        if (localSession) {
          const session = JSON.parse(localSession);
          session.profile.role = role;
          session.profile.onboarding_completed = true;
          session.profile.updated_at = new Date().toISOString();
          
          // If setting driver role, add driver profile
          if (role === UserRole.DRIVER) {
            session.driverProfile = {
              id: user.id,
              user_id: user.id,
              is_available: false,
              rating: 5.0,
              total_trips: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            setDriverProfile(session.driverProfile);
          }
          
          localStorage.setItem('localSession', JSON.stringify(session));
          setUserProfile(session.profile);
        }
        
        toast({
        title: t('success'),
        description: role === UserRole.DRIVER ? t('youre_now_driver') : t('youre_now_passenger'),
        });
        
        return;
      }

      // For real Supabase users, use the edge function
      const { data, error } = await supabase.functions.invoke('create-or-update-user-profile', {
        body: {
          profileData: {
            role,
            onboarding_completed: true
          }
        }
      });

      if (error) {
        console.error("Error setting role:", error);
        
        // Fallback: try direct database update
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            role, 
            onboarding_completed: true,
            updated_at: new Date().toISOString()
          })
          .eq('auth_user_id', user.id);
          
        if (updateError) {
          console.error("Direct update also failed:", updateError);
          toast({
            title: "Error",
            description: "Failed to save role. Please try again.",
            variant: "destructive"
          });
          return;
        }
        
        // Update local state
        setUserProfile(prev => prev ? { ...prev, role, onboarding_completed: true } : null);
      }

      if (data?.success && data?.profile) {
        setUserProfile(data.profile as UserProfile);
      }
        
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
      
      toast({
        title: t('success'),
        description: role === UserRole.DRIVER ? t('youre_now_driver') : t('youre_now_passenger'),
      });
      
    } catch (error) {
      console.error('Unexpected error in setRole:', error);
      toast({
        title: "Error",
        description: "Failed to save role. Please try again.",
        variant: "destructive"
      });
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
