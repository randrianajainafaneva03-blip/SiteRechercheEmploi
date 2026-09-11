import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, AlertCircle, Users, Briefcase } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { authService, databases, DATABASE_ID, COLLECTIONS, account, ID } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import TransitionLoader from '@/components/TransitionLoader';

const GOOGLE_CONFIG = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
  redirectUri: window.location.origin + '/auth/google-callback',
};

interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  verified_email: boolean;
}

type AuthType = 'login' | 'register' | 'update_existing';

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshProfile, forceProfileReload } = useAuth();
  const [status, setStatus] = useState<'loading' | 'role-selection' | 'creating' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Traitement de la connexion Google...');
  const [processed, setProcessed] = useState(false);
  const [googleUserData, setGoogleUserData] = useState<GoogleUserInfo | null>(null);
  const [selectedRole, setSelectedRole] = useState<'candidate' | 'employer'>('candidate');
  const [authType, setAuthType] = useState<AuthType>('login');
  const [showTransitionLoader, setShowTransitionLoader] = useState(false);
  const [existingProfileId, setExistingProfileId] = useState<string | null>(null);

  const googleAuthMutation = useMutation({
    mutationFn: async ({ code, state }: { code: string; state: any }) => {
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: GOOGLE_CONFIG.clientId,
          client_secret: GOOGLE_CONFIG.clientSecret,
          redirect_uri: GOOGLE_CONFIG.redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        throw new Error(`Erreur OAuth: ${errorText}`);
      }

      const tokenData = await tokenResponse.json();

      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      if (!userResponse.ok) {
        throw new Error('Erreur lors de la récupération des informations utilisateur');
      }

      const googleUser: GoogleUserInfo = await userResponse.json();

      let existingProfile = null;
      try {
        try {
          await account.deleteSession('current');
        } catch (e) {
          // aucune session à supprimer
        }

        await account.createAnonymousSession();

        const existingProfiles = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.PROFILES,
          [
            Query.equal('email', googleUser.email.toLowerCase()),
            Query.limit(1)
          ]
        );

        await account.deleteSession('current');

        if (existingProfiles.documents.length > 0) {
          existingProfile = existingProfiles.documents[0];
        }

      } catch (searchError: any) {
        // erreur de recherche ignorée silencieusement
      }

      if (state.type === 'login') {
        if (!existingProfile) {
          throw new Error('Aucun compte trouvé avec cette adresse email. Veuillez vous inscrire d\'abord.');
        }

        if (!existingProfile.user_type || existingProfile.user_type === '' || existingProfile.user_type === null) {
          return {
            type: 'existing_user_role_selection',
            profile: existingProfile,
            googleUser
          };
        }

        if (existingProfile.is_active === false) {
          throw new Error('🚫 Votre compte a été désactivé. Contactez l\'administrateur pour plus d\'informations.');
        }

        if (existingProfile.oauth_password) {
          localStorage.setItem('google_oauth_user', 'true');
          await account.createEmailPasswordSession(
            googleUser.email,
            existingProfile.oauth_password
          );
        } else {
          throw new Error('Ce compte n\'a pas été créé via Google. Veuillez utiliser votre mot de passe habituel.');
        }

        return {
          type: 'login',
          profile: existingProfile,
          googleUser
        };

      } else {
        if (existingProfile) {
          throw new Error('Un compte avec cette adresse email existe déjà. Veuillez vous connecter.');
        }

        return {
          type: 'register_pending',
          googleUser
        };
      }
    },
    onSuccess: async (result) => {
      if (result.type === 'existing_user_role_selection') {
        setGoogleUserData(result.googleUser);
        setExistingProfileId(result.profile.$id);
        setStatus('role-selection');
        setAuthType('update_existing');
        setMessage('Votre compte existe mais nécessite une sélection de rôle');
        return;
      }

      if (result.type === 'register_pending') {
        setGoogleUserData(result.googleUser);
        setStatus('role-selection');
        setAuthType('register');
        return;
      }

      if (result.type === 'login') {
        setShowTransitionLoader(true);
        setStatus('success');
        setMessage('Connexion réussie ! Synchronisation...');

        toast({
          title: "Connexion réussie !",
          description: `Bienvenue ${result.googleUser.given_name} !`,
        });

        try {
          await new Promise(resolve => setTimeout(resolve, 1000));

          if (refreshProfile) {
            await refreshProfile();
          }

          let retries = 0;
          const maxRetries = 10;

          while (retries < maxRetries) {
            window.dispatchEvent(new Event('auth-state-change'));
            await new Promise(resolve => setTimeout(resolve, 300));

            const storedProfile = localStorage.getItem('user_profile');
            if (storedProfile) break;

            retries++;
          }

          setMessage('Redirection vers votre espace...');

          setTimeout(() => {
            const redirectTo = result.profile.user_type === 'employer' ? '/dashboard' : '/jobs';
            window.location.href = redirectTo;
          }, 500);

        } catch (error) {
          setTimeout(() => {
            const redirectTo = result.profile.user_type === 'employer' ? '/dashboard' : '/jobs';
            window.location.href = redirectTo;
          }, 2000);
        }
      }
    },
    onError: (error: any) => {
      setStatus('error');
      setMessage(error.message || 'Erreur lors de la connexion Google');

      toast({
        variant: "destructive",
        title: "Erreur OAuth",
        description: error.message,
      });

      setTimeout(() => {
        navigate('/login', { state: { error: error.message } });
      }, 3000);
    }
  });

  const createAccountMutation = useMutation({
    mutationFn: async ({ userType }: { userType: 'candidate' | 'employer' }) => {
      if (!googleUserData) throw new Error('Données Google manquantes');

      const generateSecurePassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < 12; i++) {
          password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
      };

      const oauthPassword = generateSecurePassword();

      const user = await account.create(
        ID.unique(),
        googleUserData.email,
        oauthPassword,
        googleUserData.name
      );

      localStorage.setItem('google_oauth_user', 'true');
      await account.createEmailPasswordSession(googleUserData.email, oauthPassword);

      const profileData: any = {
        full_name: googleUserData.name,
        email: googleUserData.email.toLowerCase(),
        user_type: userType,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        onboarding_completed: false,
        oauth_provider: 'google',
        oauth_password: oauthPassword,
      };

      if (googleUserData.id) {
        profileData.google_id = googleUserData.id;
      }

      if (googleUserData.picture) {
        const pictureUrl = googleUserData.picture;
        if (pictureUrl.length <= 500) {
          profileData.profile_picture = pictureUrl;
        } else {
          const shortUrl = pictureUrl.split('=')[0] + '=s200';
          if (shortUrl.length <= 500) {
            profileData.profile_picture = shortUrl;
          }
        }
      }

      const profile = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.PROFILES,
        user.$id,
        profileData
      );

      return { profile, user, userType };
    },
    onSuccess: async (result) => {
      setShowTransitionLoader(true);
      setStatus('success');
      setMessage('Compte créé avec succès ! Redirection...');

      toast({
        title: "Compte créé !",
        description: `Votre compte ${result.userType === 'employer' ? 'employeur' : 'candidat'} a été créé avec succès.`,
      });

      try {
        if (forceProfileReload) {
          await forceProfileReload();
        }
        window.dispatchEvent(new Event('auth-state-change'));
      } catch (error) {
        // ignoré
      }

      setTimeout(() => {
        const redirectTo = result.userType === 'employer' ? '/dashboard' : '/jobs';
        window.location.href = redirectTo;
      }, 2500);
    },
    onError: (error: any) => {
      setStatus('error');
      setMessage(error.message || 'Erreur lors de la création du compte');

      toast({
        variant: "destructive",
        title: "Erreur création compte",
        description: error.message,
      });
    }
  });

  const updateExistingProfileMutation = useMutation({
    mutationFn: async ({ userType, profileId }: { userType: 'candidate' | 'employer', profileId: string }) => {
      if (!googleUserData) throw new Error('Données Google manquantes');

      const updatedProfile = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.PROFILES,
        profileId,
        { user_type: userType, updated_at: new Date().toISOString() }
      );

      const existingProfile = await databases.getDocument(DATABASE_ID, COLLECTIONS.PROFILES, profileId);

      if (existingProfile.is_active === false) {
        throw new Error('🚫 Votre compte a été désactivé. Contactez l\'administrateur pour plus d\'informations.');
      }

      if (existingProfile.oauth_password) {
        localStorage.setItem('google_oauth_user', 'true');
        await account.createEmailPasswordSession(googleUserData.email, existingProfile.oauth_password);
      } else {
        throw new Error('Problème de configuration du compte OAuth');
      }

      return { profile: updatedProfile, user: await account.get(), userType };
    },
    onSuccess: async (result) => {
      setShowTransitionLoader(true);
      setStatus('success');
      setMessage('Compte mis à jour ! Redirection...');

      toast({
        title: "Profil complété !",
        description: `Votre rôle ${result.userType === 'employer' ? 'employeur' : 'candidat'} a été sauvegardé.`,
      });

      try {
        if (forceProfileReload) {
          await forceProfileReload();
        }
        window.dispatchEvent(new Event('auth-state-change'));
      } catch (error) {
        // ignoré
      }

      setTimeout(() => {
        const redirectTo = result.userType === 'employer' ? '/dashboard' : '/jobs';
        window.location.href = redirectTo;
      }, 2000);
    },
    onError: (error: any) => {
      setStatus('error');
      setMessage(error.message || 'Erreur lors de la mise à jour du profil');

      toast({
        variant: "destructive",
        title: "Erreur mise à jour",
        description: error.message,
      });
    }
  });

  const handleRoleConfirmation = () => {
    setStatus('creating');
    setMessage(authType === 'update_existing' ? 'Mise à jour de votre profil...' : 'Création de votre compte en cours...');

    if (authType === 'update_existing') {
      if (!existingProfileId) {
        setStatus('error');
        setMessage('Erreur: ID de profil manquant');
        return;
      }
      updateExistingProfileMutation.mutate({ userType: selectedRole, profileId: existingProfileId });
    } else {
      createAccountMutation.mutate({ userType: selectedRole });
    }
  };

  useEffect(() => {
    if (processed) return;

    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
          throw new Error(`Erreur OAuth: ${error}`);
        }

        if (!code) {
          throw new Error('Code OAuth manquant');
        }

        let parsedState;
        try {
          parsedState = state ? JSON.parse(state) : { type: 'login' };
        } catch {
          parsedState = { type: 'login' };
        }

        setAuthType(parsedState.type);
        setProcessed(true);
        googleAuthMutation.mutate({ code, state: parsedState });

      } catch (error: any) {
        setStatus('error');
        setMessage(error.message);
        setProcessed(true);

        setTimeout(() => {
          navigate('/login', { state: { error: error.message } });
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, processed]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {googleUserData && status === 'role-selection' && (
            <div className="mb-6">
              <img
                src={googleUserData.picture}
                alt={googleUserData.name}
                className="w-16 h-16 rounded-full mx-auto mb-3"
              />
              <h3 className="text-lg font-semibold text-gray-900">
                Bonjour {googleUserData.given_name} !
              </h3>
              <p className="text-sm text-gray-600">{googleUserData.email}</p>
            </div>
          )}

          {status !== 'role-selection' && (
            <div className="flex justify-center mb-6">
              <div className={`h-16 w-16 rounded-full flex items-center justify-center ${
                status === 'loading' || status === 'creating' ? 'bg-blue-100' :
                status === 'success' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {(status === 'loading' || status === 'creating') && (
                  <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                )}
                {status === 'success' && (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                )}
                {status === 'error' && (
                  <AlertCircle className="h-8 w-8 text-red-600" />
                )}
              </div>
            </div>
          )}

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {status === 'loading' && (authType === 'login' ? 'Connexion en cours...' : 'Vérification du compte...')}
            {status === 'role-selection' && (authType === 'update_existing' ? 'Complétez votre profil' : 'Choisissez votre rôle')}
            {status === 'creating' && (authType === 'update_existing' ? 'Mise à jour du profil...' : 'Création de votre compte...')}
            {status === 'success' && (authType === 'login' || authType === 'update_existing' ? 'Connexion réussie !' : 'Compte créé avec succès !')}
            {status === 'error' && 'Erreur de connexion'}
          </h2>

          {status === 'role-selection' && (
            <div className="space-y-6">
              <p className="text-gray-600 mb-6">
                {authType === 'update_existing'
                  ? 'Votre compte nécessite une sélection de rôle pour continuer'
                  : 'Comment souhaitez-vous utiliser Job2mada ?'
                }
              </p>

              <div className="space-y-4">
                <label className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedRole === 'candidate'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="user_type"
                    value="candidate"
                    checked={selectedRole === 'candidate'}
                    onChange={(e) => setSelectedRole(e.target.value as 'candidate')}
                    className="sr-only"
                  />
                  <Users className="h-6 w-6 text-blue-600 mr-3" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Je suis candidat</div>
                    <div className="text-sm text-gray-600">Je recherche des opportunités d'emploi</div>
                  </div>
                </label>

                <label className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedRole === 'employer'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="user_type"
                    value="employer"
                    checked={selectedRole === 'employer'}
                    onChange={(e) => setSelectedRole(e.target.value as 'employer')}
                    className="sr-only"
                  />
                  <Briefcase className="h-6 w-6 text-purple-600 mr-3" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Je suis recruteur</div>
                    <div className="text-sm text-gray-600">Je recrute des talents pour mon entreprise</div>
                  </div>
                </label>
              </div>

              <button
                onClick={handleRoleConfirmation}
                disabled={createAccountMutation.isPending || updateExistingProfileMutation.isPending}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {(createAccountMutation.isPending || updateExistingProfileMutation.isPending) ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    {authType === 'update_existing' ? 'Mise à jour...' : 'Création en cours...'}
                  </div>
                ) : (
                  `Continuer comme ${selectedRole === 'employer' ? 'recruteur' : 'candidat'}`
                )}
              </button>
            </div>
          )}

          {status !== 'role-selection' && (
            <p className={`text-sm mb-6 ${
              status === 'error' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {message}
            </p>
          )}

          {status === 'error' && (
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              Retour à la connexion
            </button>
          )}
        </div>
      </div>
      <TransitionLoader
        isVisible={showTransitionLoader}
        message="Finalisation de votre connexion..."
      />
    </div>
  );
};

export default GoogleCallback;
