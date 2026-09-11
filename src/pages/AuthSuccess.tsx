// 🔥 REMPLACE COMPLÈTEMENT AuthSuccess.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { account, databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';

const AuthSuccess = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>({});
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');

  useEffect(() => {
    const handleOAuthSuccess = async () => {
      try {
        
        
        // 🔍 RÉCUPÉRER TOUS LES PARAMÈTRES POSSIBLES
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        
        const allParams = {
          search: Object.fromEntries(urlParams.entries()),
          hash: Object.fromEntries(hashParams.entries()),
          fullUrl: window.location.href
        };
        
       
        setDebugInfo(allParams);
        
        // 🔥 MÉTHODE 1 : Paramètres classiques OAuth
        const userId = urlParams.get('userId') || hashParams.get('userId');
        const secret = urlParams.get('secret') || hashParams.get('secret');
        
       
        
        let user;
        
        if (userId && secret) {
         
          try {
            // Méthode moderne Appwrite
            const session = await account.createSession(userId, secret);
           
            
            user = await account.get();
            
            
          } catch (sessionError: any) {
            console.error('❌ Erreur session avec paramètres:', sessionError);
            throw sessionError;
          }
        } else {
          // 🔥 MÉTHODE 2 : Vérifier si session existe déjà
       
          
          try {
            // Attendre un peu pour que la session soit créée côté serveur
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            user = await account.get();
    
            
          } catch (getError: any) {
            console.error('❌ Aucune session trouvée:', getError);
            
            // 🔥 MÉTHODE 3 : Rediriger vers OAuth à nouveau si échec
            if (getError.code === 401) {
            
              
              // Essayer de forcer la récupération des paramètres depuis l'URL
              const code = urlParams.get('code') || hashParams.get('code');
              const state = urlParams.get('state') || hashParams.get('state');
              
              if (code) {
               
                // On peut pas créer directement la session avec le code,
                // Appwrite devrait l'avoir fait automatiquement
                throw new Error(`Code OAuth reçu mais session non créée. Code: ${code}`);
              } else {
                throw new Error('Aucune session et aucun paramètre OAuth valide trouvé');
              }
            } else {
              throw getError;
            }
          }
        }
        
        if (!user) {
          throw new Error('Utilisateur non récupéré malgré une session apparemment valide');
        }

        // 2. Vérifier/créer le profil
        let profile;
        try {
          profile = await databases.getDocument(
            DATABASE_ID,
            COLLECTIONS.PROFILES,
            user.$id
          );
        
        } catch (profileError: any) {
          if (profileError.code === 404) {
           
            
            const profileData = {
              full_name: user.name || user.email.split('@')[0],
              email: user.email,
              user_type: 'candidate',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              onboarding_completed: false,
              auth_provider: 'oauth'
            };
            
            profile = await databases.createDocument(
              DATABASE_ID,
              COLLECTIONS.PROFILES,
              user.$id,
              profileData
            );
           
          } else {
            throw profileError;
          }
        }

        // 3. Sauvegarder et rediriger
        localStorage.setItem('user_profile', JSON.stringify(profile));
        localStorage.setItem('user_auth', JSON.stringify(user));

        setTimeout(() => {
          if (!profile.onboarding_completed) {
            navigate('/onboarding', { 
              state: { 
                message: 'Connexion réussie ! Veuillez compléter votre profil.',
                isOAuth: true 
              }
            });
          } else {
            const redirectUrl = profile.user_type === 'employer' ? '/dashboard' : '/jobs';
            navigate(redirectUrl, { 
              state: { message: 'Connexion réussie !' }
            });
          }
        }, 2000);

      } catch (error: any) {
        console.error('❌ ERREUR COMPLÈTE OAuth:', error);
        setError(`${error.message || 'Erreur inconnue'}`);
        
        setTimeout(() => {
          navigate('/login', {
            state: { 
              error: `Erreur OAuth: ${error.message}. Debug: ${JSON.stringify(debugInfo)}` 
            }
          });
        }, 5000);
      } finally {
        setLoading(false);
      }
    };

    handleOAuthSuccess();
  }, [navigate, type]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-4">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Erreur OAuth</h2>
          <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
            <p className="text-red-700 text-sm"><strong>Erreur:</strong> {error}</p>
          </div>
          
          {/* DEBUG INFO */}
          <details className="mb-4">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
              🔍 Informations de debug (cliquer pour voir)
            </summary>
            <div className="bg-gray-50 border rounded p-3 text-xs">
              <pre className="whitespace-pre-wrap overflow-auto max-h-40">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          </details>
          
          <p className="text-center text-sm text-gray-500">
            Redirection automatique dans 5 secondes...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {loading ? (
          <>
            <Loader2 className="h-16 w-16 text-green-500 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Connexion en cours...</h2>
            <p className="text-gray-600 mb-4">Finalisation de votre connexion OAuth</p>
            
            {/* AFFICHER LES INFOS DE DEBUG PENDANT LE LOADING */}
            {Object.keys(debugInfo).length > 0 && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-xs text-gray-500">Debug info</summary>
                <div className="bg-gray-50 border rounded p-2 mt-2 text-xs">
                  <pre className="whitespace-pre-wrap overflow-auto max-h-32">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </div>
              </details>
            )}
          </>
        ) : (
          <>
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Connexion réussie !</h2>
            <p className="text-gray-600 mb-4">Redirection en cours...</p>
          </>
        )}
        
        <div className="flex justify-center">
          <div className="animate-pulse flex space-x-1">
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthSuccess;