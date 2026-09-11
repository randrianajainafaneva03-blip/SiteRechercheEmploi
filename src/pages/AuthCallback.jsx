import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, CheckCircle, AlertCircle, Users } from 'lucide-react';
import { account, databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';
import { ID } from 'appwrite';

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshProfile } = useAuth();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        setMessage('Traitement du callback OAuth...');
        
        
        // Pour OAuth, on a toujours des paramètres dans l'URL ou on vient d'une redirection
        const urlParams = new URLSearchParams(location.search);
        const hasOAuthParams = urlParams.has('code') || urlParams.has('state') || urlParams.has('session') || 
                              window.location.pathname === '/auth/callback';
        
        
        
        // Toujours attendre un peu pour laisser Appwrite traiter le callback OAuth
        setMessage('Attente de la finalisation OAuth...');
        await new Promise(resolve => setTimeout(resolve, 3000)); // 3 secondes minimum
        
        // Essayer de récupérer la session plusieurs fois avec backoff
        let user = null;
        let attempts = 0;
        const maxAttempts = 15; // Plus d'attempts
        
        while (!user && attempts < maxAttempts) {
          try {
            setMessage(`Vérification session... (${attempts + 1}/${maxAttempts})`);
           
            
            user = await account.get();
            
            if (user) {
             
              break;
            }
          } catch (error) {
           
            attempts++;
            
            if (attempts < maxAttempts) {
              // Attendre de plus en plus longtemps
              const waitTime = Math.min(1000 * Math.pow(1.5, attempts), 5000);
              setMessage(`Nouvelle tentative dans ${Math.round(waitTime/1000)}s...`);
              await new Promise(resolve => setTimeout(resolve, waitTime));
            }
          }
        }

        if (!user) {
          console.error('❌ Impossible de récupérer la session après', maxAttempts, 'tentatives');
          setStatus('error');
          setMessage('Session OAuth expirée. Veuillez réessayer la connexion.');
          setTimeout(() => navigate('/login?error=oauth_session_failed'), 3000);
          return;
        }

        await handleUserFound(user);

      } catch (error) {
        console.error('❌ Erreur générale dans handleOAuthCallback:', error);
        setStatus('error');
        setMessage('Erreur lors de l\'authentification OAuth: ' + error.message);
        setTimeout(() => navigate('/login?error=oauth_general_error'), 3000);
      }
    };

    const handleUserFound = async (user) => {
      try {
        setMessage('Utilisateur trouvé, vérification du profil...');
        
        // Vérifier si le profil existe
        let profileData = null;
        let isNewOAuthUser = false;
        
        try {
          profileData = await databases.getDocument(
            DATABASE_ID,
            COLLECTIONS.PROFILES,
            user.$id
          );
          
          
        } catch (error) {
          if (error.code === 404) {
            
            isNewOAuthUser = true;
            
            // ✅ CRÉER LE PROFIL POUR L'UTILISATEUR OAUTH
            setMessage('Création de votre profil...');
            profileData = await createOAuthProfile(user);
            
          } else {
            throw error;
          }
        }

        // Vérifier si le profil a un type défini
        if (profileData && profileData.user_type) {
          // Profil complet existant
          setStatus('success');
          setMessage('Connexion réussie ! Redirection...');
          
          // Forcer le rechargement du profil dans AuthContext
          try {
            await refreshProfile();
          } catch (refreshError) {
            console.warn('Erreur lors du refresh du profil:', refreshError);
          }
          
          const redirectUrl = profileData.user_type === 'employer' ? '/dashboard' : '/jobs';
          setTimeout(() => navigate(redirectUrl), 1500);
          
        } else {
          // Profil existe mais pas de type défini OU nouveau profil OAuth
          setStatus('type_selection');
          
          if (isNewOAuthUser) {
            setMessage('Bienvenue ! Veuillez compléter votre profil...');
          } else {
            setMessage('Finalisation de votre compte...');
          }
          
          // Forcer le rechargement du profil dans AuthContext
          try {
            await refreshProfile();
          } catch (refreshError) {
            console.warn('Erreur lors du refresh du profil:', refreshError);
          }
          
          setTimeout(() => navigate('/user-type-selection'), 1500);
        }

      } catch (error) {
        console.error('Erreur lors de la gestion de l\'utilisateur:', error);
        setStatus('error');
        setMessage('Erreur lors de la récupération de votre profil.');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    // ✅ NOUVELLE FONCTION POUR CRÉER LE PROFIL OAUTH
    const createOAuthProfile = async (user) => {
      try {
       
        
        // Déterminer le provider OAuth utilisé
        let authProvider = 'google'; // Par défaut
        if (user.email && user.email.includes('github')) {
          authProvider = 'github';
        }
        
        const oauthProfile = {
          full_name: user.name || user.email?.split('@')[0] || '',
          email: user.email || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          auth_provider: authProvider,
          onboarding_completed: false, // L'utilisateur doit compléter son profil
          email_verified: user.emailVerification || true, // OAuth users are usually verified
          // Pas de user_type défini - l'utilisateur devra le choisir
        };

        

        const createdProfile = await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.PROFILES,
          user.$id, // Utiliser l'ID utilisateur comme ID du document
          oauthProfile
        );

        
        return createdProfile;
        
      } catch (error) {
        console.error('❌ Erreur lors de la création du profil OAuth:', error);
        throw new Error(`Erreur création profil OAuth: ${error.message}`);
      }
    };

    // Démarrer le processus avec un délai initial plus long
    const timer = setTimeout(() => {
      handleOAuthCallback();
    }, 1000); // Délai initial de 1 seconde

    return () => clearTimeout(timer);
  }, [navigate, location.search, refreshProfile]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Finalisation de la connexion...
              </h2>
              <p className="text-gray-600 text-sm">{message}</p>
              
              {/* Barre de progression visuelle */}
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
              </div>
            </>
          )}
          
          {status === 'type_selection' && (
            <>
              <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Bienvenue sur Job2mada ! 🎉
              </h2>
              <p className="text-gray-600">{message}</p>
              
              <div className="mt-4 flex justify-center space-x-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </>
          )}
          
          {status === 'success' && (
            <>
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Connexion réussie ! ✅
              </h2>
              <p className="text-gray-600">{message}</p>
              
              <div className="mt-4 w-full bg-green-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{width: '100%'}}></div>
              </div>
            </>
          )}
          
          {status === 'error' && (
            <>
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Erreur de connexion
              </h2>
              <p className="text-gray-600 mb-4">{message}</p>
              <button
                onClick={() => navigate('/login')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retour à la connexion
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;