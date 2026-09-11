import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { databases, storage, account, DATABASE_ID, Query } from '@/lib/appwrite';

// Hook personnalisé pour les requêtes Appwrite avec gestion d'erreurs améliorée
export const useAppwriteQuery = (queryKey, queryFn, options = {}) => {
  const { user, isAuthenticated } = useAuth();

  return useQuery({
    queryKey,
    queryFn: async () => {
      try {
        // Exécuter avec vérification d'authentification si nécessaire
        if (options.requireAuth && !isAuthenticated) {
          throw new Error('Authentification requise');
        }

        const result = await queryFn();
        return result;
      } catch (error) {
        console.error('Erreur useAppwriteQuery:', error);
        
        // Gestion spécifique des erreurs de session Appwrite
        if (error.code === 401 || error.message?.includes('session') || 
          error.message?.includes('unauthorized')) {
        
        // ✅ SEULEMENT rediriger si l'authentification est requise
        if (options.requireAuth) {
          window.location.href = '/login';
          throw new Error('Session expirée, veuillez vous reconnecter');
        }
        
        // ✅ Pour les pages publiques, continuer sans redirection
        throw error;
      }
        
        throw error;
      }
    },
    enabled: options.enabled !== false && (!options.requireAuth || isAuthenticated),
    retry: (failureCount, error) => {
      // Ne pas retry sur les erreurs d'auth
      if (error?.code === 401 || 
          error?.message?.includes('session') || 
          error?.message?.includes('Authentification requise')) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: 1000,
    staleTime: options.staleTime || 5 * 60 * 1000, // 5 minutes
    gcTime: options.gcTime || 10 * 60 * 1000, // 10 minutes (remplace cacheTime)
    refetchOnWindowFocus: options.refetchOnWindowFocus !== false,
    ...options
  });
};

// Hook pour récupérer le statut de vérification d'un utilisateur
export const useVerificationStatus = (userId, options = {}) => {
  return useAppwriteQuery(
    ['verification-status', userId],
    async () => {
      if (!userId) return { isVerified: false };
      
      try {
        const profileData = await databases.getDocument(
          DATABASE_ID,
          'profiles',
          userId
        );
        
        return {
          isVerified: profileData.is_verified === true,
          verifiedAt: profileData.verified_at || null,
          verificationType: profileData.verification_type || null
        };
      } catch (error) {
        console.error('Erreur récupération statut vérification:', error);
        return { isVerified: false };
      }
    },
    {
      enabled: !!userId,
      staleTime: 5 * 60 * 1000, // 5 minutes de cache
      ...options
    }
  );
};

// Hook pour vérifier plusieurs statuts de vérification en une fois (pour les listes)
export const useBatchVerificationStatus = (userIds = [], options = {}) => {
  return useAppwriteQuery(
    ['batch-verification-status', ...userIds],
    async () => {
      if (!userIds || userIds.length === 0) return {};
      
      try {
        const verificationMap = {};
        
        // Récupérer tous les profils en une seule requête
        const profiles = await databases.listDocuments(
          DATABASE_ID,
          'profiles',
          [
            Query.equal('$id', userIds),
            Query.limit(userIds.length)
          ]
        );
        
        // Créer une map userId -> isVerified
        profiles.documents.forEach(profile => {
          verificationMap[profile.$id] = {
            isVerified: profile.is_verified === true,
            verifiedAt: profile.verified_at || null
          };
        });
        
        // Ajouter les IDs manquants avec false
        userIds.forEach(id => {
          if (!verificationMap[id]) {
            verificationMap[id] = { isVerified: false };
          }
        });
        
        return verificationMap;
      } catch (error) {
        console.error('Erreur récupération batch vérification:', error);
        // Retourner tous les IDs comme non vérifiés en cas d'erreur
        return userIds.reduce((acc, id) => {
          acc[id] = { isVerified: false };
          return acc;
        }, {});
      }
    },
    {
      enabled: userIds.length > 0,
      staleTime: 5 * 60 * 1000,
      ...options
    }
  );
};

// Hook pour les mutations avec gestion d'erreurs et notifications
export const useAppwriteMutation = (mutationFn, options = {}) => {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables) => {
      try {
        // Vérifier l'authentification si nécessaire
        if (options.requireAuth && !isAuthenticated) {
          throw new Error('Authentification requise');
        }

        const result = await mutationFn(variables);
        return result;
      } catch (error) {
        console.error('Erreur useAppwriteMutation:', error);
        
        // Gestion spécifique des erreurs de session Appwrite
        if (error.code === 401 || error.message?.includes('session') || 
            error.message?.includes('unauthorized')) {
          window.location.href = '/login';
          throw new Error('Session expirée, veuillez vous reconnecter');
        }
        
        throw error;
      }
    },
    onSuccess: (data, variables, context) => {
      // Afficher un toast de succès si configuré
      if (options.successMessage) {
        toast({
          title: "Succès",
          description: typeof options.successMessage === 'function' 
            ? options.successMessage(data) 
            : options.successMessage,
        });
      }

      // Invalider les queries spécifiées
      if (options.invalidateQueries) {
        options.invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey });
        });
      }

      // Callback personnalisé de succès
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      // Afficher un toast d'erreur
      const errorMessage = error.message || 'Une erreur est survenue';
      
      toast({
        variant: "destructive",
        title: "Erreur",
        description: errorMessage,
      });

      // Callback personnalisé d'erreur
      if (options.onError) {
        options.onError(error, variables, context);
      }
    },
    retry: (failureCount, error) => {
      // Ne pas retry sur les erreurs d'auth
      if (error?.code === 401 || 
          error?.message?.includes('session') || 
          error?.message?.includes('Authentification requise')) {
        return false;
      }
      return failureCount < 1;
    },
    ...options
  });
};

// Hook spécialisé pour les requêtes de jobs
export const useJobsQuery = (filters = {}, options = {}) => {
  return useAppwriteQuery(
    ['jobs', filters],
    async () => {
      const queries = [Query.equal('is_active', true)];
      
      // Ajouter les filtres
      if (filters.search) {
        queries.push(Query.search('title', filters.search));
      }
      if (filters.category) {
        queries.push(Query.equal('category', filters.category));
      }
      if (filters.location) {
        queries.push(Query.equal('location', filters.location));
      }
      if (filters.employment_type) {
        queries.push(Query.equal('employment_type', filters.employment_type));
      }
      if (filters.contract_type) {
        queries.push(Query.equal('contract_type', filters.contract_type));
      }
      if (filters.experience_level) {
        queries.push(Query.equal('experience_level', filters.experience_level));
      }
      if (filters.remote_work === true) {
        queries.push(Query.equal('remote_work', true));
      }
      if (filters.is_featured === true) {
        queries.push(Query.equal('is_featured', true));
      }
      
      queries.push(Query.orderDesc('$createdAt'));
      
      if (filters.limit) {
        queries.push(Query.limit(filters.limit));
      }
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        'jobs',
        queries
      );
      
      return { 
        data: response.documents || [], 
        count: response.total || 0 
      };
    },
    {
      staleTime: 2 * 60 * 1000, // 2 minutes pour les jobs
      ...options
    }
  );
};

// Hook spécialisé pour un job spécifique
export const useJobQuery = (jobId, options = {}) => {
  return useAppwriteQuery(
    ['job', jobId],
    async () => {
      const jobData = await databases.getDocument(
        DATABASE_ID,
        'jobs',
        jobId
      );
      return jobData;
    },
    {
      enabled: !!jobId,
      staleTime: 5 * 60 * 1000, // 5 minutes pour un job spécifique
      ...options
    }
  );
};

// Hook spécialisé pour les services
export const useServicesQuery = (filters = {}, options = {}) => {
  return useAppwriteQuery(
    ['services', filters],
    async () => {
      const queries = [Query.equal('is_active', true)];
      
      if (filters.search) {
        queries.push(Query.search('title', filters.search));
      }
      if (filters.category) {
        queries.push(Query.equal('category', filters.category));
      }
      if (filters.location) {
        queries.push(Query.equal('location', filters.location));
      }
      if (filters.creator_id) {
        queries.push(Query.equal('creator_id', filters.creator_id));
      }
      
      queries.push(Query.orderDesc('$createdAt'));
      
      if (filters.limit) {
        queries.push(Query.limit(filters.limit));
      }
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        'services',
        queries
      );
      
      return { 
        data: response.documents || [], 
        count: response.total || 0 
      };
    },
    {
      staleTime: 3 * 60 * 1000, // 3 minutes pour les services
      ...options
    }
  );
};

// Hook spécialisé pour le profil utilisateur
export const useProfileQuery = (userId, options = {}) => {
  return useAppwriteQuery(
    ['profile', userId],
    async () => {
      const profileData = await databases.getDocument(
        DATABASE_ID,
        'profiles',
        userId
      );
      return profileData;
    },
    {
      enabled: !!userId,
      requireAuth: true,
      staleTime: 10 * 60 * 1000, // 10 minutes pour le profil
      ...options
    }
  );
};

// Hook spécialisé pour les candidatures d'un candidat
export const useApplicationsQuery = (candidateId, options = {}) => {
  return useAppwriteQuery(
    ['applications', 'candidate', candidateId],
    async () => {
      const response = await databases.listDocuments(
        DATABASE_ID,
        'applications',
        [
          Query.equal('candidate_id', candidateId),
          Query.orderDesc('applied_at')
        ]
      );
      
      return response.documents || [];
    },
    {
      enabled: !!candidateId,
      requireAuth: true,
      staleTime: 2 * 60 * 1000, // 2 minutes pour les candidatures
      ...options
    }
  );
};

// Hook spécialisé pour les jobs sauvegardés
export const useSavedJobsQuery = (candidateId, options = {}) => {
  return useAppwriteQuery(
    ['savedJobs', candidateId],
    async () => {
      const response = await databases.listDocuments(
        DATABASE_ID,
        'saved_jobs',
        [
          Query.equal('candidate_id', candidateId),
          Query.orderDesc('saved_at')
        ]
      );
      
      return response.documents || [];
    },
    {
      enabled: !!candidateId,
      requireAuth: true,
      staleTime: 5 * 60 * 1000, // 5 minutes pour les jobs sauvegardés
      ...options
    }
  );
};

// Hook spécialisé pour les jobs d'un employeur
export const useEmployerJobsQuery = (employerId, options = {}) => {
  return useAppwriteQuery(
    ['jobs', 'employer', employerId],
    async () => {
      const response = await databases.listDocuments(
        DATABASE_ID,
        'jobs',
        [
          Query.equal('employer_id', employerId),
          Query.orderDesc('$createdAt')
        ]
      );
      
      return response.documents || [];
    },
    {
      enabled: !!employerId,
      requireAuth: true,
      staleTime: 3 * 60 * 1000, // 3 minutes pour les jobs d'un employeur
      ...options
    }
  );
};

// Hook pour créer un job
export const useCreateJobMutation = (options = {}) => {
  return useAppwriteMutation(
    async (jobData) => {
      const response = await databases.createDocument(
        DATABASE_ID,
        'jobs',
        'unique()',
        {
          ...jobData,
          is_active: true,
          views_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      );
      return response;
    },
    {
      requireAuth: true,
      successMessage: "Offre d'emploi créée avec succès !",
      invalidateQueries: [['jobs']],
      ...options
    }
  );
};

// Hook pour postuler à un job
export const useApplyToJobMutation = (options = {}) => {
  return useAppwriteMutation(
    async (applicationData) => {
      const response = await databases.createDocument(
        DATABASE_ID,
        'applications',
        'unique()',
        {
          ...applicationData,
          status: 'pending',
          applied_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      );
      return response;
    },
    {
      requireAuth: true,
      successMessage: "Candidature envoyée avec succès !",
      invalidateQueries: [['applications'], ['jobs']],
      ...options
    }
  );
};

// Hook pour sauvegarder/désauvegarder un job
export const useSaveJobMutation = (options = {}) => {
  return useAppwriteMutation(
    async ({ candidateId, jobId, action }) => {
      if (action === 'save') {
        const response = await databases.createDocument(
          DATABASE_ID,
          'saved_jobs',
          'unique()',
          {
            candidate_id: candidateId,
            job_id: jobId,
            saved_at: new Date().toISOString()
          }
        );
        return response;
      } else {
        // Trouver le document à supprimer
        const savedJobsResponse = await databases.listDocuments(
          DATABASE_ID,
          'saved_jobs',
          [
            Query.equal('candidate_id', candidateId),
            Query.equal('job_id', jobId)
          ]
        );
        
        if (savedJobsResponse.documents.length > 0) {
          await databases.deleteDocument(
            DATABASE_ID,
            'saved_jobs',
            savedJobsResponse.documents[0].$id
          );
        }
        
        return { success: true };
      }
    },
    {
      requireAuth: true,
      successMessage: (data, variables) => 
        variables.action === 'save' ? "Job sauvegardé !" : "Job retiré des favoris",
      invalidateQueries: [['savedJobs'], ['jobs']],
      ...options
    }
  );
};

// Hook pour mettre à jour le profil
export const useUpdateProfileMutation = (options = {}) => {
  return useAppwriteMutation(
    async ({ userId, updates }) => {
      const response = await databases.updateDocument(
        DATABASE_ID,
        'profiles',
        userId,
        {
          ...updates,
          updated_at: new Date().toISOString()
        }
      );
      return response;
    },
    {
      requireAuth: true,
      successMessage: "Profil mis à jour avec succès !",
      invalidateQueries: [['profile']],
      ...options
    }
  );
};

// Hook pour créer un service
export const useCreateServiceMutation = (options = {}) => {
  return useAppwriteMutation(
    async (serviceData) => {
      const response = await databases.createDocument(
        DATABASE_ID,
        'services',
        'unique()',
        {
          ...serviceData,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      );
      return response;
    },
    {
      requireAuth: true,
      successMessage: "Service créé avec succès !",
      invalidateQueries: [['services']],
      ...options
    }
  );
};

// Hook utilitaire pour vérifier si un job est sauvegardé
export const useIsJobSavedQuery = (candidateId, jobId, options = {}) => {
  return useAppwriteQuery(
    ['isJobSaved', candidateId, jobId],
    async () => {
      const response = await databases.listDocuments(
        DATABASE_ID,
        'saved_jobs',
        [
          Query.equal('candidate_id', candidateId),
          Query.equal('job_id', jobId),
          Query.limit(1)
        ]
      );
      
      return response.documents.length > 0;
    },
    {
      enabled: !!(candidateId && jobId),
      requireAuth: true,
      staleTime: 1 * 60 * 1000, // 1 minute pour le statut de sauvegarde
      ...options
    }
  );
};

// Hook spécialisé pour les services d'un utilisateur spécifique
export const useUserServicesQuery = (userId, options = {}) => {
  return useAppwriteQuery(
    ['services', 'user', userId],
    async () => {
      const response = await databases.listDocuments(
        DATABASE_ID,
        'services',
        [
          Query.equal('creator_id', userId),
          Query.orderDesc('$createdAt')
        ]
      );
      
      return response.documents || [];
    },
    {
      enabled: !!userId,
      requireAuth: true,
      staleTime: 3 * 60 * 1000, // 3 minutes pour les services utilisateur
      ...options
    }
  );
};

// Hook spécialisé pour un service spécifique d'un utilisateur
export const useUserServiceQuery = (serviceId, userId, options = {}) => {
  return useAppwriteQuery(
    ['service', serviceId, 'user', userId],
    async () => {
      const serviceData = await databases.getDocument(
        DATABASE_ID,
        'services',
        serviceId
      );
      
      // Vérifier que l'utilisateur est le créateur
      if (serviceData.creator_id !== userId) {
        throw new Error('Accès non autorisé à ce service');
      }
      
      return serviceData;
    },
    {
      enabled: !!(serviceId && userId),
      requireAuth: true,
      staleTime: 5 * 60 * 1000, // 5 minutes pour un service spécifique
      ...options
    }
  );
};

// Hook pour mettre à jour un service
export const useUpdateServiceMutation = (options = {}) => {
  return useAppwriteMutation(
    async ({ serviceId, updates, userId }) => {
      // Vérifier d'abord que l'utilisateur est le créateur
      const serviceData = await databases.getDocument(
        DATABASE_ID,
        'services',
        serviceId
      );
      
      if (serviceData.creator_id !== userId) {
        throw new Error('Accès non autorisé pour modifier ce service');
      }
      
      const response = await databases.updateDocument(
        DATABASE_ID,
        'services',
        serviceId,
        {
          ...updates,
          updated_at: new Date().toISOString()
        }
      );
      
      return response;
    },
    {
      requireAuth: true,
      successMessage: "Service mis à jour avec succès !",
      invalidateQueries: [
        ['services'],
        ['services', 'user'],
        ['service']
      ],
      ...options
    }
  );
};

// Hook pour supprimer un service
export const useDeleteServiceMutation = (options = {}) => {
  return useAppwriteMutation(
    async ({ serviceId, userId }) => {
      // Vérifier d'abord que l'utilisateur est le créateur
      const serviceData = await databases.getDocument(
        DATABASE_ID,
        'services',
        serviceId
      );
      
      if (serviceData.creator_id !== userId) {
        throw new Error('Accès non autorisé pour supprimer ce service');
      }
      
      await databases.deleteDocument(
        DATABASE_ID,
        'services',
        serviceId
      );
      
      return { success: true };
    },
    {
      requireAuth: true,
      successMessage: "Service supprimé avec succès !",
      invalidateQueries: [
        ['services'],
        ['services', 'user'],
        ['service-stats']
      ],
      ...options
    }
  );
};

// Hook pour vérifier si un email existe déjà
export const useCheckEmailExistsQuery = (email, options = {}) => {
  return useAppwriteQuery(
    ['email-exists', email],
    async () => {
      if (!email || email.length < 3) return { exists: false };
      
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          'profiles',
          [
            Query.equal('email', email.toLowerCase()),
            Query.limit(1)
          ]
        );
        
        return { exists: response.documents.length > 0 };
      } catch (error) {
        if (error.code === 404) {
          return { exists: false };
        }
        throw error;
      }
    },
    {
      enabled: !!email && email.includes('@'),
      staleTime: 30 * 1000, // 30 secondes
      ...options
    }
  );
};

// Hook pour l'inscription
export const useSignUpMutation = (options = {}) => {
  return useAppwriteMutation(
    async ({ email, password, userData }) => {
      // Vérifier d'abord si l'email existe
      const emailCheck = await databases.listDocuments(
        DATABASE_ID,
        'profiles',
        [
          Query.equal('email', email.toLowerCase()),
          Query.limit(1)
        ]
      );

      if (emailCheck.documents.length > 0) {
        throw new Error('Un compte avec cette adresse email existe déjà');
      }

      // Créer le compte avec Appwrite Auth
      const response = await account.create(
        'unique()',
        email.toLowerCase(),
        password,
        userData.full_name
      );

      return response;
    },
    {
      successMessage: "Compte créé avec succès ! Vérifiez votre email.",
      ...options
    }
  );
};

// Hook pour activer le premium après paiement
export const useActivatePremiumMutation = (options = {}) => {
  return useAppwriteMutation(
    async ({ userId, premiumType, billingPeriod, transactionData }) => {
      console.log('Activation premium pour:', { userId, premiumType, billingPeriod });
      
      const now = new Date();
      const startDate = now.toISOString();
      
      // Calculer la date de fin selon la période
      const endDate = new Date(now);
      if (billingPeriod === 'monthly') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }
      
      // Mettre à jour le profil
      const profileUpdate = await databases.updateDocument(
        DATABASE_ID,
        'profiles',
        userId,
        {
          is_premium: true,
          is_premiumplus: premiumType === 'premium_plus',
          premium_type: premiumType,
          premium_activated_at: startDate,
          updated_at: startDate
        }
      );

      // Créer l'enregistrement d'abonnement
      const subscription = await databases.createDocument(
        DATABASE_ID,
        'subscriptions',
        'unique()',
        {
          user_id: userId,
          subscription_type: premiumType,
          billing_period: billingPeriod,
          status: 'active',
          payment_method: transactionData.paymentMethod || 'stripe',
          transaction_id: transactionData.transactionId,
          stripe_customer_id: transactionData.stripeCustomerId || null,
          stripe_subscription_id: transactionData.stripeSubscriptionId || null,
          amount_mga: transactionData.amount,
          start_date: startDate,
          end_date: endDate.toISOString(),
          next_billing_date: endDate.toISOString(),
          created_at: startDate,
          updated_at: startDate
        }
      );

      console.log('Profil et abonnement créés:', { profileUpdate, subscription });
      return { profile: profileUpdate, subscription };
    },
    {
      requireAuth: true,
      successMessage: "Abonnement Premium activé avec succès !",
      invalidateQueries: [['profile'], ['subscriptions']],
      ...options
    }
  );
};

// Hook pour la connexion
export const useSignInMutation = (options = {}) => {
  return useAppwriteMutation(
    async ({ email, password }) => {
      try {
        const response = await account.createEmailSession(
          email.toLowerCase(),
          password
        );

        return response;
      } catch (error) {
        // Messages d'erreur personnalisés pour Appwrite
        if (error.code === 401) {
          throw new Error('Email ou mot de passe incorrect');
        }
        if (error.message?.includes('not verified')) {
          throw new Error('Veuillez confirmer votre email avant de vous connecter');
        }
        throw error;
      }
    },
    {
      successMessage: "Connexion réussie !",
      ...options
    }
  );
};

// Hook pour la connexion sociale (OAuth)
export const useSocialSignInMutation = (options = {}) => {
  return useAppwriteMutation(
    async ({ provider, redirectTo }) => {
      const response = await account.createOAuth2Session(
        provider,
        redirectTo || `${window.location.origin}/auth/callback`,
        `${window.location.origin}/login`
      );

      return response;
    },
    {
      ...options
    }
  );
};