import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, account, databases, DATABASE_ID, COLLECTIONS, Query } from '@/lib/appwrite';

interface AuthContextType {
  user: any;
  profile: any;
  loading: boolean;
  authLoading: boolean;
  isAuthReady: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, userData: any) => Promise<any>;
  signOut: () => Promise<any>;
  updateProfile: (updates: any) => Promise<any>;
  changePassword: (newPassword: string) => Promise<any>;
  refreshProfile: () => Promise<any>;
  forceProfileReload: () => Promise<any>;
  loadUserProfile: (userId: string) => Promise<any>;
  executeWithAuth: (callback: () => Promise<any>) => Promise<any>;
  ensureConnection: () => Promise<any>;
  getRedirectUrl: (userType: string, currentPath?: string) => string;
  isAuthenticated: boolean;
  isEmployer: boolean;
  isCandidate: boolean;
  isPremium: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(true);

  useEffect(() => {
    let mounted = true;
    let retryTimeout: NodeJS.Timeout | null = null;

    const initializeAuth = async () => {
      try {
        const { data, error } = await authService.getSession();

        if (mounted) {
          if (data?.session && !error) {
            const userResult = await authService.getCurrentUser();
            if (userResult.user) {
              await applyVerifiedSession(userResult.user);
            }
          }

          setLoading(false);
          setInitialized(true);
          setIsAuthReady(true);
        }
      } catch (error) {
        if (mounted) {
          setLoading(false);
          setInitialized(true);
          setIsAuthReady(true);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, []);

  // Vérification périodique du statut premium (toutes les 5 min + retour onglet)
  useEffect(() => {
    if (!user) return;

    const checkPremium = async () => {
      if (user) await loadUserProfileWithRetry(user.$id);
    };

    const interval = setInterval(checkPremium, 5 * 60 * 1000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') checkPremium();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  useEffect(() => {
    const checkInterval = 500;

    const sessionWatcher = setInterval(async () => {
      if (!initialized) return;

      try {
        const { data } = await authService.getSession();

        if (data?.session && !user) {
          const userResult = await authService.getCurrentUser();
          // Ignorer les sessions anonymes (sans email)
          if (userResult.user && userResult.user.email) {
            await applyVerifiedSession(userResult.user);
          }
        } else if (!data?.session && user) {
          setUser(null);
          setProfile(null);
          localStorage.removeItem('user_profile');
        }
      } catch (error) {
        // ignoré silencieusement
      }
    }, checkInterval);

    return () => clearInterval(sessionWatcher);
  }, [user, initialized]);

  useEffect(() => {
    const handleAuthStateChange = async () => {
      try {
        const { data } = await authService.getSession();
        if (data?.session) {
          const userResult = await authService.getCurrentUser();
          if (userResult.user && (!user || userResult.user.$id !== user.$id)) {
            await applyVerifiedSession(userResult.user);
          }
        }
      } catch (error) {
        // ignoré silencieusement
      }
    };

    window.addEventListener('auth-state-change', handleAuthStateChange);

    return () => {
      window.removeEventListener('auth-state-change', handleAuthStateChange);
    };
  }, [user]);

  const loadUserProfileWithRetry = async (userId: string, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const profileData = await databases.getDocument(
          DATABASE_ID,
          COLLECTIONS.PROFILES,
          userId
        );

        if (profileData) {
          setProfile(profileData);
          localStorage.setItem('user_profile', JSON.stringify(profileData));
        }
        return profileData;
      } catch (error: any) {
        if (error.code === 404 && attempt === maxRetries) {
          return await createDefaultProfile(userId);
        }

        if (attempt === maxRetries) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  };

  const createDefaultProfile = async (userId: string) => {
    try {
      const currentUser = await account.get();

      if (!currentUser.email || currentUser.email === '') {
        return null;
      }

      const defaultProfile = {
        full_name: currentUser.name || currentUser.email?.split('@')[0] || 'Utilisateur',
        email: currentUser.email,
        user_type: 'candidate',
        is_active: true,
        phone: '',
        location: '',
        bio: '',
        skills: [],
        is_premium: false,
        verification_status: 'unverified',
        onboarding_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const profileData = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.PROFILES,
        userId,
        defaultProfile
      );

      setProfile(profileData);
      localStorage.setItem('user_profile', JSON.stringify(profileData));
      return profileData;
    } catch (error) {
      return null;
    }
  };

  const loadUserProfile = async (userId: string) => {
    return await loadUserProfileWithRetry(userId);
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await loadUserProfileWithRetry(user.$id);
      return profileData;
    }
  };

  const forceProfileReload = async () => {
    if (user) {
      setProfile(null);
      const profileData = await loadUserProfileWithRetry(user.$id, 5);
      return profileData;
    }
  };

  // Les comptes Google OAuth ont emailVerification=false par défaut dans Appwrite
  // (créés programmatiquement) mais leur email est vérifié par Google.
  const applyVerifiedSession = async (candidateUser: any) => {
    const isGoogleOAuthUser = localStorage.getItem('google_oauth_user') === 'true';
    if (candidateUser.emailVerification === false && !isGoogleOAuthUser) {
      try {
        await authService.signOut();
      } catch (e) {
        // déjà déconnecté
      }
      setUser(null);
      setProfile(null);
      localStorage.removeItem('user_profile');
      return false;
    }

    setUser(candidateUser);
    try {
      await loadUserProfileWithRetry(candidateUser.$id);
    } catch (e) {
      // géré par les appelants
    }
    return true;
  };

  const ensureConnection = async () => {
    try {
      const { data, error } = await authService.getSession();
      if (error || !data?.session) {
        throw new Error('Session expirée');
      }
      return data.session;
    } catch (error) {
      setUser(null);
      setProfile(null);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    setAuthLoading(true);

    try {
      const result = await authService.signIn(email, password);

      if (result.data?.session && !result.error) {
        const userResult = await authService.getCurrentUser();

        if (userResult.user) {
          if (userResult.user.emailVerification === false) {
            try {
              await authService.signOut();
            } catch (e) {
              // déjà déconnecté
            }
            setUser(null);
            setProfile(null);
            localStorage.removeItem('user_profile');
            setAuthLoading(false);

            return {
              success: false,
              error: {
                message: "📧 Merci de vérifier votre adresse email avant de vous connecter. Consultez votre boîte de réception (et vos spams)."
              }
            };
          }

          setUser(userResult.user);

          try {
            const profileData = await loadUserProfileWithRetry(userResult.user.$id);

            if (profileData?.is_active === false) {
              await authService.signOut();
              setUser(null);
              setProfile(null);
              localStorage.removeItem('user_profile');
              setAuthLoading(false);

              return {
                success: false,
                error: {
                  message: '🚫 Votre compte a été désactivé. Contactez l\'administrateur pour plus d\'informations.'
                }
              };
            }

            setAuthLoading(false);

            return {
              success: true,
              user: userResult.user,
              profile: profileData,
              data: result.data
            };
          } catch (profileError) {
            setAuthLoading(false);
            return {
              success: true,
              user: userResult.user,
              profile: null,
              data: result.data
            };
          }
        }
      }

      setAuthLoading(false);
      return { success: false, error: result.error };
    } catch (error) {
      setAuthLoading(false);
      return { success: false, error };
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    setAuthLoading(true);
    try {
      const existingProfiles = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PROFILES,
        [Query.equal('email', email.toLowerCase())]
      );

      if (existingProfiles.total > 0) {
        setAuthLoading(false);
        return {
          error: {
            message: 'Un compte existe déjà avec cet email. Veuillez vous connecter.'
          }
        };
      }

      const result = await authService.signUp(email, password, userData);

      setAuthLoading(false);
      return result;

    } catch (error) {
      setAuthLoading(false);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      setAuthLoading(true);

      localStorage.removeItem('user_profile');
      localStorage.removeItem('google_oauth_user');

      const result = await authService.signOut();

      setUser(null);
      setProfile(null);

      setTimeout(() => {
        setAuthLoading(false);
        window.location.href = '/';
      }, 1000);

      return result;
    } catch (error) {
      setUser(null);
      setProfile(null);
      setAuthLoading(false);
      return { error };
    }
  };

  const updateProfile = async (updates: any) => {
    if (!user) return { error: 'No user logged in' };

    try {
      await ensureConnection();

      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, value]) =>
          value !== undefined && value !== null && value !== ''
        )
      );

      cleanUpdates.updated_at = new Date().toISOString();

      try {
        const updatedProfile = await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.PROFILES,
          user.$id,
          cleanUpdates
        );

        setProfile(updatedProfile);
        localStorage.setItem('user_profile', JSON.stringify(updatedProfile));

        return { data: updatedProfile, error: null };
      } catch (error: any) {
        if (error.code === 404) {
          const newProfile = {
            ...cleanUpdates,
            created_at: new Date().toISOString()
          };

          const createdProfile = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.PROFILES,
            user.$id,
            newProfile
          );

          setProfile(createdProfile);
          localStorage.setItem('user_profile', JSON.stringify(createdProfile));

          return { data: createdProfile, error: null };
        }

        throw error;
      }
    } catch (error) {
      return { data: null, error };
    }
  };

  const changePassword = async (newPassword: string) => {
    try {
      await ensureConnection();
      try {
        await account.updatePassword(newPassword);
        return { data: { success: true }, error: null };
      } catch (error) {
        return { data: null, error };
      }
    } catch (error) {
      return { error };
    }
  };

  const executeWithAuth = async (callback: () => Promise<any>) => {
    try {
      await ensureConnection();
      return await callback();
    } catch (error) {
      throw error;
    }
  };

  const getRedirectUrl = (userType: string, currentPath?: string) => {
    const publicPaths = ['/jobs', '/services', '/', '/about'];

    if (currentPath && publicPaths.includes(currentPath)) {
      return currentPath;
    }

    return userType === 'employer' ? '/dashboard' : '/jobs';
  };

  const value: AuthContextType = {
    user,
    profile,
    loading,
    authLoading,
    isAuthReady,
    signIn,
    signUp,
    signOut,
    updateProfile,
    changePassword,
    refreshProfile,
    forceProfileReload,
    loadUserProfile,
    executeWithAuth,
    ensureConnection,
    getRedirectUrl,
    isAuthenticated: !!user,
    isEmployer: profile?.user_type === 'employer',
    isCandidate: profile?.user_type === 'candidate',
    isPremium: profile?.is_premium || false
  };

  return (
    <AuthContext.Provider value={value}>
      {children}

      {authLoading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-center justify-center">
          <div className="bg-white rounded-3xl p-8 shadow-2xl text-center max-w-sm mx-4">
            <div className="relative mb-6">
              <div className="w-20 h-20 mx-auto">
                <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Chargement...
            </h3>
            <p className="text-gray-600 text-sm">
              Traitement en cours
            </p>

            <div className="mt-4 flex justify-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};
