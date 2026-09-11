// This file configures the Appwrite client for job2mada
import { Client, Account, Databases, Storage, Functions, Messaging } from 'appwrite';
import type { Models } from 'appwrite';

// Configuration Appwrite
const appwriteEndpoint = import.meta.env.VITE_APPWRITE_ENDPOINT || "https://appwrite.dat-articles.com/v1";
const appwriteProjectId = import.meta.env.VITE_APPWRITE_PROJECT_ID || "job2mada";

// Créer le client Appwrite
const client = new Client();

client
  .setEndpoint(appwriteEndpoint)
  .setProject(appwriteProjectId);

// Services Appwrite
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);
export const messaging = new Messaging(client);

// Export du client pour usage avancé
export { client };

// Configuration des IDs
export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || 'job2mada-db';

export const COLLECTIONS = {
  PROFILES: 'profiles',
  JOBS: 'jobs',
  SERVICES: 'services',
  APPLICATIONS: 'applications',
  SAVED_JOBS: 'saved_jobs',
  SAVED_SERVICES: 'saved_services',
  MESSAGES: 'messages',
  JOB_CATEGORIES: 'job_categories',
  VERIFICATION_DOCUMENTS: 'verification_documents',
  PROFILE_VIEWS: 'profile_views',
  FAVORITES: 'favorites',
  EDUCATION: 'education',
  PROFESSIONAL_EXPERIENCE: 'professional_experience'
} as const;

export const BUCKETS = {
  DOCUMENTS: 'documents',
  IMAGES: 'images',
  VERIFICATION_DOCS: 'verification-docs'
} as const;

// Types pour une meilleure expérience TypeScript
export interface AppwriteUser extends Models.User<Models.Preferences> {}
export interface AppwriteSession extends Models.Session {}
export interface AppwriteDocument extends Models.Document {}

// Fonction utilitaire pour gérer les erreurs Appwrite
export const handleAppwriteError = (error: any) => {
  console.error('Erreur Appwrite:', error);
  
  // Mapper les erreurs Appwrite vers des messages utilisateur
  switch (error.code) {
    case 401:
      return 'Session expirée, veuillez vous reconnecter';
    case 403:
      return 'Accès non autorisé';
    case 404:
      return 'Ressource non trouvée';
    case 409:
      return 'Conflit de données';
    case 429:
      return 'Trop de tentatives, veuillez patienter';
    case 500:
      return 'Erreur serveur, veuillez réessayer';
    default:
      return error.message || 'Une erreur inattendue s\'est produite';
  }
};

// Gestion des états d'authentification (équivalent à onAuthStateChange de Supabase)
let authStateChangeCallbacks: Array<(event: string, session: AppwriteSession | null) => void> = [];

export const onAuthStateChange = (callback: (event: string, session: AppwriteSession | null) => void) => {
  authStateChangeCallbacks.push(callback);
  
  // Retourner une fonction de cleanup
  return () => {
    authStateChangeCallbacks = authStateChangeCallbacks.filter(cb => cb !== callback);
  };
};

// Fonction utilitaire pour notifier les changements d'état
const notifyAuthStateChange = (event: string, session: AppwriteSession | null = null) => {
  authStateChangeCallbacks.forEach(callback => {
    try {
      callback(event, session);
    } catch (error) {
      console.error('Erreur dans callback auth state change:', error);
    }
  });
};

// Wrapper pour les méthodes d'authentification avec notifications
export const authService = {
  // Connexion avec email/password
  async signIn(email: string, password: string) {
    try {
      const session = await account.createEmailPasswordSession(email, password);
      notifyAuthStateChange('SIGNED_IN', session);
      return { data: { session }, error: null };
    } catch (error: any) {
      console.error('Erreur signIn:', error);
      return { data: null, error };
    }
  },

  // Inscription
  async signUp(email: string, password: string, name: string) {
    try {
      const user = await account.create('unique()', email, password, name);
      // Auto-login après inscription
      const session = await account.createEmailPasswordSession(email, password);
      notifyAuthStateChange('SIGNED_UP', session);
      return { data: { user, session }, error: null };
    } catch (error: any) {
      console.error('Erreur signUp:', error);
      return { data: null, error };
    }
  },

  // Déconnexion
  async signOut() {
    try {
      await account.deleteSession('current');
      notifyAuthStateChange('SIGNED_OUT', null);
      return { error: null };
    } catch (error: any) {
      console.error('Erreur signOut:', error);
      return { error };
    }
  },

  // Obtenir l'utilisateur actuel
  async getCurrentUser() {
    try {
      const user = await account.get();
      return { user, error: null };
    } catch (error: any) {
      return { user: null, error };
    }
  },

  // Obtenir la session actuelle
  async getCurrentSession() {
    try {
      const session = await account.getSession('current');
      return { data: { session }, error: null };
    } catch (error: any) {
      return { data: { session: null }, error };
    }
  },

  async signInWithOAuth(provider: string, redirectTo?: string) {
    try {
      const fallbackRedirect = `${window.location.origin}/auth/callback`;
      const failureRedirect = `${window.location.origin}/login`;
      
      await account.createOAuth2Session(
        provider as any,
        redirectTo || fallbackRedirect,
        failureRedirect
      );
      
      // La notification se fera dans la page de callback
      return { data: { url: 'redirecting...' }, error: null };
    } catch (error: any) {
      console.error('Erreur OAuth:', error);
      return { data: null, error };
    }
  },

  // Vérification d'email
  async verifyEmail(url: string) {
    try {
      const urlObj = new URL(url);
      const userId = urlObj.searchParams.get('userId');
      const secret = urlObj.searchParams.get('secret');
      
      if (userId && secret) {
        await account.updateVerification(userId, secret);
        notifyAuthStateChange('EMAIL_VERIFIED', null);
        return { error: null };
      }
      throw new Error('Paramètres de vérification manquants');
    } catch (error: any) {
      console.error('Erreur vérification email:', error);
      return { error };
    }
  },

  // Réinitialisation du mot de passe
  async resetPassword(email: string) {
    try {
      await account.createRecovery(
        email,
        `${window.location.origin}/auth/reset-password`
      );
      return { error: null };
    } catch (error: any) {
      console.error('Erreur reset password:', error);
      return { error };
    }
  },

  // Confirmation du nouveau mot de passe
  async confirmPasswordReset(password: string, url: string) {
    try {
      const urlObj = new URL(url);
      const userId = urlObj.searchParams.get('userId');
      const secret = urlObj.searchParams.get('secret');
      
      if (userId && secret) {
        await account.updateRecovery(userId, secret, password);
        notifyAuthStateChange('PASSWORD_RESET', null);
        return { error: null };
      }
      throw new Error('Paramètres de récupération manquants');
    } catch (error: any) {
      console.error('Erreur confirmation reset password:', error);
      return { error };
    }
  }
};

// Auto-détection de la session au chargement
(async () => {
  try {
    const session = await account.getSession('current');
    if (session) {
      notifyAuthStateChange('SESSION_LOADED', session);
    }
  } catch (error) {
    // Pas de session active
    notifyAuthStateChange('NO_SESSION', null);
  }
})();

// Export par défaut pour compatibilité
export default {
  auth: authService,
  from: (table: string) => ({
    select: () => ({ 
      eq: () => ({ 
        single: () => Promise.reject(new Error('Méthode Supabase non supportée - utilisez databases.listDocuments()')) 
      }) 
    }),
    insert: () => Promise.reject(new Error('Méthode Supabase non supportée - utilisez databases.createDocument()')),
    update: () => Promise.reject(new Error('Méthode Supabase non supportée - utilisez databases.updateDocument()')),
    delete: () => Promise.reject(new Error('Méthode Supabase non supportée - utilisez databases.deleteDocument()'))
  })
};

// Logging pour le développement
if (import.meta.env.DEV) {
  console.log('🚀 Appwrite client initialisé');
  console.log('📡 Endpoint:', appwriteEndpoint);
  console.log('🆔 Project ID:', appwriteProjectId);
  console.log('🗄️ Database ID:', DATABASE_ID);
}