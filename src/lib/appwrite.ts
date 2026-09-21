import { Client, Account, Databases, Storage, Query, ID, Permission, Role, OAuthProvider } from 'appwrite';


// Configuration Appwrite (surchargeable via .env : VITE_APPWRITE_ENDPOINT / VITE_APPWRITE_PROJECT_ID)
const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://appwrite.dat-articles.com/v1';
const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || 'job2mada';
const client = new Client();

client
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setLocale('fr'); // Sans ça, Appwrite envoie les emails (vérification, recovery) en anglais par défaut

  
export { Query } from 'appwrite';
export const account = new Account(client);
export const databases = new Databases(client);
// Buckets "logiques" (images / documents / verification-docs).
// Si VITE_APPWRITE_SINGLE_BUCKET est défini (plan Appwrite limité à 1 bucket), tous les fichiers vont dans ce
// bucket physique et les permissions sont appliquées fichier par fichier selon le bucket logique :
//  - images            : lecture publique
//  - documents         : lecture réservée aux utilisateurs connectés (CV, pièces jointes)
//  - verification-docs : lecture réservée au propriétaire
const SINGLE_BUCKET: string | undefined = import.meta.env.VITE_APPWRITE_SINGLE_BUCKET;
const rawStorage = new Storage(client);
const BUCKET_ARG_METHODS = ['getFile', 'updateFile', 'deleteFile', 'getFileView', 'getFilePreview', 'getFileDownload'];

export const storage: Storage = !SINGLE_BUCKET ? rawStorage : new Proxy(rawStorage, {
  get(target, prop, receiver) {
    const original = Reflect.get(target, prop, receiver);
    if (typeof original !== 'function') return original;

    if (prop === 'createFile') {
      return async (...args: any[]) => {
        const params = typeof args[0] === 'object' && args[0] !== null && !('size' in args[0])
          ? { ...args[0] }
          : { bucketId: args[0], fileId: args[1], file: args[2], permissions: args[3], onProgress: args[4] };
        const logical = params.bucketId;
        if (!params.permissions) {
          let ownerId: string | null = null;
          try { ownerId = (await account.get()).$id; } catch { /* non connecté */ }
          const owner = ownerId
            ? [Permission.read(Role.user(ownerId)), Permission.update(Role.user(ownerId)), Permission.delete(Role.user(ownerId))]
            : [];
          if (logical === 'images') params.permissions = [Permission.read(Role.any()), ...owner.slice(1)];
          else if (logical === 'documents') params.permissions = [Permission.read(Role.users()), ...owner.slice(1)];
          else params.permissions = owner;
        }
        params.bucketId = SINGLE_BUCKET;
        return original.call(target, params);
      };
    }

    if (typeof prop === 'string' && BUCKET_ARG_METHODS.includes(prop)) {
      return (...args: any[]) => {
        if (typeof args[0] === 'object' && args[0] !== null) return original.call(target, { ...args[0], bucketId: SINGLE_BUCKET });
        return original.call(target, SINGLE_BUCKET, ...args.slice(1));
      };
    }
    return original.bind(target);
  },
});
export { ID } from 'appwrite';

// IDs des collections et buckets (à remplacer par vos vrais IDs)
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

// ✅ CORRECTION: Fonction pour générer des URLs correctes
export const getFileUrl = (bucketId: string, fileId: string) => {
  return `${APPWRITE_ENDPOINT}/storage/buckets/${SINGLE_BUCKET || bucketId}/files/${fileId}/view?project=${APPWRITE_PROJECT_ID}`;
};

// Interface pour les erreurs étendues
interface ExtendedError extends Error {
  code?: number | string;
}

// Fonction utilitaire pour retry avec backoff
const retryWithBackoff = async (fn: () => Promise<any>, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      console.log(`Tentative ${i + 1}/${maxRetries} échouée:`, error.message);
      
      if (i === maxRetries - 1) throw error;
      
      // Vérifier les types d'erreurs qui nécessitent un retry
      const shouldRetry = 
        error.message?.includes('session') || 
        error.code === 401 || 
        error.message?.includes('network') ||
        error.message?.includes('timeout');
      
      if (shouldRetry) {
        console.log(`Attente de ${delay * (i + 1)}ms avant retry...`);
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      } else {
        throw error;
      }
    }
  }
};

// Fonction pour vérifier la session avec retry
const ensureValidSession = async () => {
  return retryWithBackoff(async () => {
    try {
      const session = await account.getSession('current');
      if (!session) {
        throw new Error('Session expirée ou invalide');
      }
      return session;
    } catch (error: any) {
      console.error('Erreur session:', error);
      throw new Error(`Erreur session: ${error.message}`);
    }
  }, 2, 500);
};

// Services d'authentification
export const authService = {
  async signUp(email: string, password: string, userData: any) {
    try {
      // Créer le compte
      const user = await account.create(ID.unique(), email, password, userData.full_name);
      
      // Créer une session automatiquement avec la nouvelle méthode
      const session = await account.createEmailPasswordSession(email, password);
      
      return { data: { user, session }, error: null };
    } catch (error: any) {
      console.error('Erreur signUp:', error);
      return { data: null, error };
    }
  },

  async signIn(email: string, password: string) {
    try {
      console.log('🔑 authService.signIn début');
      
      // Créer la session
      const session = await account.createEmailPasswordSession(email, password);
      console.log('📝 Session créée:', session.$id);
      
      // Récupérer l'utilisateur
      const user = await account.get();
      console.log('👤 Utilisateur récupéré:', user.$id);
      
      return { 
        data: { user, session }, 
        error: null 
      };
    } catch (error: any) {
      console.error('❌ Erreur authService.signIn:', error);

      // Traduction des erreurs Appwrite les plus courantes (le SDK renvoie du texte en anglais)
      let message = 'Erreur de connexion. Veuillez réessayer.';
      if (error.code === 401) {
        // Message volontairement générique (email ou mot de passe) pour éviter
        // de révéler si un compte existe avec cette adresse (énumération de comptes)
        message = 'Email ou mot de passe incorrect.';
      } else if (error.code === 429) {
        message = 'Trop de tentatives. Veuillez réessayer dans quelques minutes.';
      }

      return {
        data: null,
        error: {
          message,
          code: error.code
        }
      };
    }
  },

  async signOut() {
    try {
      await account.deleteSession('current');
      return { error: null };
    } catch (error: any) {
      console.error('Erreur signOut:', error);
      return { error };
    }
  },

  async getCurrentUser() {
    try {
      const user = await account.get();
      return { user, error: null };
    } catch (error: any) {
      console.error('Erreur getCurrentUser:', error);
      return { user: null, error };
    }
  },

  async getSession() {
    try {
      const session = await account.getSession('current');
      return { data: { session }, error: null };
    } catch (error: any) {
      return { data: { session: null }, error };
    }
  },

};

// Services pour les profils
export const profileService = {
  async getProfile(userId: string) {
    return retryWithBackoff(async () => {
      console.log('Récupération profil pour:', userId);
      try {
        const profile = await databases.getDocument(DATABASE_ID, COLLECTIONS.PROFILES, userId);
        return { data: profile, error: null };
      } catch (error: any) {
        if (error.code === 404) {
          return { data: null, error: null };
        }
        console.error('Erreur getProfile:', error);
        throw error;
      }
    });
  },

  async updateProfile(userId: string, updates: any) {
    return retryWithBackoff(async () => {
      await ensureValidSession();
      
      console.log('Mise à jour profil:', userId, updates);
      try {
        const profile = await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.PROFILES,
          userId,
          {
            ...updates,
            updated_at: new Date().toISOString()
          }
        );
        return { data: profile, error: null };
      } catch (error: any) {
        console.error('Erreur updateProfile:', error);
        throw error;
      }
    });
  },

  async createProfile(userId: string, profileData: any) {
    return retryWithBackoff(async () => {
      await ensureValidSession();
      
      console.log('Création profil:', userId, profileData);
      try {
        const profile = await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.PROFILES,
          userId,
          {
            ...profileData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        );
        return { data: profile, error: null };
      } catch (error: any) {
        console.error('Erreur createProfile:', error);
        throw error;
      }
    });
  }
};

// Services pour les offres d'emploi
export const jobService = {
  async getJobs(filters: any = {}) {
    return retryWithBackoff(async () => {
      console.log('Récupération des jobs avec filtres:', filters);
      
      try {
        let queries: string[] = [
          Query.equal('is_active', true),
          Query.equal('is_draft', false),
          Query.orderDesc('created_at')
        ];

        // Appliquer les filtres
        if (filters.category) {
          queries.push(Query.equal('category', filters.category));
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
        if (filters.location) {
          queries.push(Query.equal('location', filters.location));
        }
        if (filters.remote_work !== undefined) {
          queries.push(Query.equal('remote_work', filters.remote_work));
        }
        if (filters.is_featured !== undefined) {
          queries.push(Query.equal('is_featured', filters.is_featured));
        }
        if (filters.search) {
          queries.push(Query.search('title', filters.search));
        }

        // Pagination
        if (filters.limit) {
          queries.push(Query.limit(filters.limit));
        }
        if (filters.page && filters.limit) {
          const offset = (filters.page - 1) * filters.limit;
          queries.push(Query.offset(offset));
        }

        const response = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.JOBS,
          queries
        );

        // Récupérer les profils des employeurs
        const jobsWithProfiles = await Promise.all(
          response.documents.map(async (job) => {
            try {
              const profile = await databases.getDocument(
                DATABASE_ID,
                COLLECTIONS.PROFILES,
                job.employer_id
              );
              return {
                ...job,
                profiles: {
                  company_name: profile.company_name,
                  avatar_url: profile.avatar_url
                }
              };
            } catch {
              return {
                ...job,
                profiles: {
                  company_name: job.company_name,
                  avatar_url: null
                }
              };
            }
          })
        );

        console.log(`${jobsWithProfiles.length} jobs récupérés`);
        return { data: jobsWithProfiles, error: null, count: response.total };
      } catch (error: any) {
        console.error('Erreur getJobs:', error);
        throw error;
      }
    }, 3, 1000);
  },

  async createJob(jobData: any) {
    return retryWithBackoff(async () => {
      const session = await ensureValidSession();
      const user = await account.get();
      
      const cleanData = {
        title: jobData.title || '',
        company_name: jobData.company_name || '',
        category: jobData.category || '',
        description: jobData.description || '',
        employment_type: jobData.employment_type || '',
        contract_type: jobData.contract_type || '',
        experience_level: jobData.experience_level || '',
        location: jobData.location || '',
        remote_work: jobData.remote_work || false,
        benefits: jobData.benefits || [],
        requirements: jobData.requirements || [],
        application_deadline: jobData.application_deadline || null,
        contact_email: jobData.contact_email || '',
        company_website: jobData.company_website || null,
        application_instructions: jobData.application_instructions || null,
        is_featured: jobData.is_featured || false,
        is_urgent: jobData.is_urgent || false,
        is_draft: jobData.is_draft || false,
        is_active: jobData.is_active ?? false,
        moderation_status: jobData.moderation_status || 'pending',
        views_count: 0,
        linkedin_auto_posted: false,
        employer_id: user.$id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Création job:', cleanData);

      try {
        const job = await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.JOBS,
          ID.unique(),
          cleanData
        );
        return { data: job, error: null };
      } catch (error: any) {
        
        throw error;
      }
    });
  },

  async updateJob(jobId: string, updates: any) {
    return retryWithBackoff(async () => {
      await ensureValidSession();
      
      console.log('Mise à jour job:', jobId, updates);
      try {
        const job = await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.JOBS,
          jobId,
          {
            ...updates,
            updated_at: new Date().toISOString()
          }
        );
        return { data: job, error: null };
      } catch (error: any) {
        
        throw error;
      }
    });
  },

  async deleteJob(jobId: string) {
    return retryWithBackoff(async () => {
      await ensureValidSession();
      
      console.log('Suppression job:', jobId);
      try {
        const job = await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.JOBS,
          jobId,
          { 
            is_active: false,
            updated_at: new Date().toISOString()
          }
        );
        return { data: job, error: null };
      } catch (error: any) {
        
        throw error;
      }
    });
  },

  async getJobsByEmployer(employerId: string, includeInactive = false) {
    return retryWithBackoff(async () => {
      console.log('Récupération jobs employeur:', employerId);
      
      try {
        let queries: string[] = [
          Query.equal('employer_id', employerId),
          Query.orderDesc('created_at')
        ];

        if (!includeInactive) {
          queries.push(Query.equal('is_active', true));
        }

        const response = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.JOBS,
          queries
        );

        return { data: response.documents, error: null };
      } catch (error: any) {
        
        throw error;
      }
    });
  },

  async getCategories() {
    return retryWithBackoff(async () => {
      console.log('Récupération catégories');
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.JOB_CATEGORIES,
          [
            Query.equal('is_active', true),
            Query.orderAsc('name')
          ]
        );
        return { data: response.documents, error: null };
      } catch (error: any) {
        console.error('Erreur getCategories:', error);
        throw error;
      }
    });
  },

  async createCategory(categoryData: any) {
    return retryWithBackoff(async () => {
      await ensureValidSession();
      
      console.log('Création catégorie:', categoryData);
      try {
        const category = await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.JOB_CATEGORIES,
          ID.unique(),
          categoryData
        );
        return { data: category, error: null };
      } catch (error: any) {
        console.error('Erreur createCategory:', error);
        throw error;
      }
    });
  },

  async getJobById(id: string) {
    return retryWithBackoff(async () => {
      console.log('Récupération job par ID:', id);
      try {
        const job = await databases.getDocument(DATABASE_ID, COLLECTIONS.JOBS, id);
        
        // Récupérer le profil de l'employeur
        try {
          const profile = await databases.getDocument(
            DATABASE_ID,
            COLLECTIONS.PROFILES,
            job.employer_id
          );
          
          return {
            data: {
              ...job,
              profiles: {
                company_name: profile.company_name,
                avatar_url: profile.avatar_url,
                phone: profile.phone,
                email: profile.email,
                website: profile.website,
                company_description: profile.company_description,
                company_size: profile.company_size,
                industry: profile.industry
              }
            },
            error: null
          };
        } catch {
          return {
            data: {
              ...job,
              profiles: {
                company_name: job.company_name,
                avatar_url: null
              }
            },
            error: null
          };
        }
      } catch (error: any) {
        console.error('Erreur getJobById:', error);
        throw error;
      }
    });
  },

  async incrementViews(jobId: string) {
    return retryWithBackoff(async () => {
      console.log('Incrémentation vues:', jobId);
      
      try {
        const job = await databases.getDocument(DATABASE_ID, COLLECTIONS.JOBS, jobId);
        
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.JOBS,
          jobId,
          { 
            views_count: (job.views_count || 0) + 1,
            updated_at: new Date().toISOString()
          }
        );
        
        return { error: null };
      } catch (error: any) {
        console.error('Erreur incrementViews:', error);
        return { error };
      }
    }, 2, 500);
  },

  async searchJobs(searchTerm: string, filters: any = {}) {
    return retryWithBackoff(async () => {
      console.log('Recherche jobs:', searchTerm, filters);
      
      try {
        let queries: string[] = [
          Query.equal('is_active', true),
          Query.equal('is_draft', false),
          Query.orderDesc('created_at')
        ];

        if (searchTerm) {
          queries.push(Query.search('title', searchTerm));
        }

        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queries.push(Query.equal(key, value as string | number | boolean));
          }
        });

        const response = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.JOBS,
          queries
        );

        // Récupérer les profils des employeurs
        const jobsWithProfiles = await Promise.all(
          response.documents.map(async (job) => {
            try {
              const profile = await databases.getDocument(
                DATABASE_ID,
                COLLECTIONS.PROFILES,
                job.employer_id
              );
              return {
                ...job,
                profiles: {
                  company_name: profile.company_name,
                  avatar_url: profile.avatar_url
                }
              };
            } catch {
              return {
                ...job,
                profiles: {
                  company_name: job.company_name,
                  avatar_url: null
                }
              };
            }
          })
        );

        return { data: jobsWithProfiles, error: null };
      } catch (error: any) {
        console.error('Erreur searchJobs:', error);
        throw error;
      }
    });
  }
};

// Services pour les services
export const serviceService = {
  async getServices(filters: any = {}) {
    return retryWithBackoff(async () => {
      console.log('Récupération services avec filtres:', filters);
      
      try {
        let queries: string[] = [Query.orderDesc('created_at')];

        if (filters.creator_id) {
          queries.push(Query.equal('creator_id', filters.creator_id));
        } else {
          queries.push(Query.equal('is_approved', true));
          queries.push(Query.equal('is_active', true));
        }

        // Appliquer les autres filtres
        if (filters.category) {
          queries.push(Query.equal('category', filters.category));
        }
        if (filters.price_range) {
          queries.push(Query.equal('price_range', filters.price_range));
        }
        if (filters.delivery_time) {
          queries.push(Query.equal('delivery_time', filters.delivery_time));
        }
        if (filters.search) {
          queries.push(Query.search('title', filters.search));
        }

        // Pagination
        if (filters.limit) {
          queries.push(Query.limit(filters.limit));
        }
        if (filters.page && filters.limit) {
          const offset = (filters.page - 1) * filters.limit;
          queries.push(Query.offset(offset));
        }

        const response = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.SERVICES,
          queries
        );

        // Récupérer les profils des créateurs
        const servicesWithProfiles = await Promise.all(
          response.documents.map(async (service) => {
            try {
              const profile = await databases.getDocument(
                DATABASE_ID,
                COLLECTIONS.PROFILES,
                service.creator_id
              );
              return {
                ...service,
                profiles: {
                  full_name: profile.full_name,
                  avatar_url: profile.avatar_url,
                  location: profile.location,
                  poste: profile.poste
                }
              };
            } catch {
              return service;
            }
          })
        );

        console.log(`${servicesWithProfiles.length} services récupérés`);
        return { data: servicesWithProfiles, error: null, count: response.total };
      } catch (error: any) {
        console.error('Erreur getServices:', error);
        throw error;
      }
    });
  },

  async getServiceById(serviceId: string) {
    return retryWithBackoff(async () => {
      console.log('Récupération service par ID:', serviceId);
      try {
        const service = await databases.getDocument(DATABASE_ID, COLLECTIONS.SERVICES, serviceId);
        
        // Récupérer le profil du créateur
        try {
          const profile = await databases.getDocument(
            DATABASE_ID,
            COLLECTIONS.PROFILES,
            service.creator_id
          );
          
          return {
            data: {
              ...service,
              profiles: {
                full_name: profile.full_name,
                avatar_url: profile.avatar_url,
                location: profile.location,
                poste: profile.poste,
                phone: profile.phone,
                email: profile.email
              }
            },
            error: null
          };
        } catch {
          return { data: service, error: null };
        }
      } catch (error: any) {
        console.error('Erreur getServiceById:', error);
        throw error;
      }
    });
  },

  async getServicesByCreator(creatorId: string) {
    return retryWithBackoff(async () => {
      console.log('Récupération services pour créateur:', creatorId);
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.SERVICES,
          [
            Query.equal('creator_id', creatorId),
            Query.orderDesc('created_at')
          ]
        );
        return { data: response.documents, error: null };
      } catch (error: any) {
        console.error('Erreur getServicesByCreator:', error);
        throw error;
      }
    });
  },

  async createService(serviceData: any) {
    return retryWithBackoff(async () => {
      const session = await ensureValidSession();
      const user = await account.get();
      
      const cleanData = {
        title: serviceData.title || '',
        description: serviceData.description || '',
        category: serviceData.category || '',
        price_range: serviceData.price_range || null,
        delivery_time: serviceData.delivery_time || null,
        skills: serviceData.skills || [],
        creator_id: user.$id,
        is_approved: false,
        is_active: true,
        approval_status: 'pending',
        views_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Création service:', cleanData);

      try {
        const service = await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.SERVICES,
          ID.unique(),
          cleanData
        );
        return { data: service, error: null };
      } catch (error: any) {
        console.error('Erreur createService:', error);
        throw error;
      }
    });
  },

  async updateService(serviceId: string, updates: any, creatorId: string) {
    return retryWithBackoff(async () => {
      await ensureValidSession();
      
      console.log('Mise à jour service:', serviceId, updates);
      try {
        // Vérifier que l'utilisateur est le créateur du service
        const service = await databases.getDocument(DATABASE_ID, COLLECTIONS.SERVICES, serviceId);
        if (service.creator_id !== creatorId) {
          throw new Error('Non autorisé');
        }

        const updatedService = await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.SERVICES,
          serviceId,
          {
            ...updates,
            updated_at: new Date().toISOString()
          }
        );
        return { data: updatedService, error: null };
      } catch (error: any) {
        console.error('Erreur updateService:', error);
        throw error;
      }
    });
  },

  async deleteService(serviceId: string, creatorId: string) {
    return retryWithBackoff(async () => {
      await ensureValidSession();
      
      console.log('Suppression service:', serviceId);
      try {
        // Vérifier que l'utilisateur est le créateur du service
        const service = await databases.getDocument(DATABASE_ID, COLLECTIONS.SERVICES, serviceId);
        if (service.creator_id !== creatorId) {
          throw new Error('Non autorisé');
        }

        await databases.deleteDocument(DATABASE_ID, COLLECTIONS.SERVICES, serviceId);
        return { data: { success: true }, error: null };
      } catch (error: any) {
        console.error('Erreur deleteService:', error);
        throw error;
      }
    });
  },

  async toggleServiceStatus(serviceId: string, isActive: boolean, creatorId: string) {
    return retryWithBackoff(async () => {
      await ensureValidSession();
      
      console.log('Changement statut service:', serviceId, isActive);
      try {
        // Vérifier que l'utilisateur est le créateur du service
        const service = await databases.getDocument(DATABASE_ID, COLLECTIONS.SERVICES, serviceId);
        if (service.creator_id !== creatorId) {
          throw new Error('Non autorisé');
        }

        const updatedService = await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.SERVICES,
          serviceId,
          { 
            is_active: !isActive,
            updated_at: new Date().toISOString()
          }
        );
        return { data: updatedService, error: null };
      } catch (error: any) {
        console.error('Erreur toggleServiceStatus:', error);
        throw error;
      }
    });
  },

  async incrementViews(serviceId: string) {
    return retryWithBackoff(async () => {
      console.log('Incrémentation vues service:', serviceId);
      
      try {
        const service = await databases.getDocument(DATABASE_ID, COLLECTIONS.SERVICES, serviceId);
        
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.SERVICES,
          serviceId,
          { 
            views_count: (service.views_count || 0) + 1,
            updated_at: new Date().toISOString()
          }
        );
        
        return { error: null };
      } catch (error: any) {
        console.error('Erreur incrementViews service:', error);
        return { error };
      }
    }, 2, 500);
  }
};

// Services pour les candidatures
export const applicationService = {
  async createApplication(applicationData: any) {
    return retryWithBackoff(async () => {
      await ensureValidSession();
      
      console.log('Vérification candidature existante...');
      try {
        const existing = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.APPLICATIONS,
          [
            Query.equal('candidate_id', applicationData.candidate_id),
            Query.equal('job_id', applicationData.job_id)
          ]
        );

        if (existing.documents.length > 0) {
          return { data: null, error: { message: 'Vous avez déjà postulé à cette offre' } };
        }

        console.log('Création candidature:', applicationData);
        const application = await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.APPLICATIONS,
          ID.unique(),
          {
            ...applicationData,
            created_at: new Date().toISOString()
          }
        );
        
        return { data: application, error: null };
      } catch (error: any) {
        console.error('Erreur createApplication:', error);
        throw error;
      }
    });
  },

  async getApplicationsByCandidate(candidateId: string) {
    return retryWithBackoff(async () => {
      console.log('Récupération candidatures pour:', candidateId);
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.APPLICATIONS,
          [
            Query.equal('candidate_id', candidateId),
            Query.orderDesc('created_at')
          ]
        );

        // Récupérer les détails des jobs pour chaque candidature
        const applicationsWithJobs = await Promise.all(
          response.documents.map(async (application) => {
            try {
              const job = await databases.getDocument(DATABASE_ID, COLLECTIONS.JOBS, application.job_id);
              const profile = await databases.getDocument(DATABASE_ID, COLLECTIONS.PROFILES, job.employer_id);
              
              return {
                ...application,
                jobs: {
                  ...job,
                  profiles: {
                    company_name: profile.company_name,
                    avatar_url: profile.avatar_url
                  }
                }
              };
            } catch {
              return application;
            }
          })
        );

        return { data: applicationsWithJobs, error: null };
      } catch (error: any) {
        console.error('Erreur getApplicationsByCandidate:', error);
        throw error;
      }
    });
  },

  async getApplicationsByJob(jobId: string) {
    return retryWithBackoff(async () => {
      console.log('Récupération candidatures pour job:', jobId);
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.APPLICATIONS,
          [
            Query.equal('job_id', jobId),
            Query.orderDesc('created_at')
          ]
        );

        // Récupérer les profils des candidats
        const applicationsWithProfiles = await Promise.all(
          response.documents.map(async (application) => {
            try {
              const profile = await databases.getDocument(
                DATABASE_ID,
                COLLECTIONS.PROFILES,
                application.candidate_id
              );
              
              return {
                ...application,
                profiles: {
                    first_name: profile.first_name,
                 last_name: profile.last_name,
                 email: profile.email,
                 phone: profile.phone,
                 avatar_url: profile.avatar_url
               }
             };
           } catch {
             return application;
           }
         })
       );

       return { data: applicationsWithProfiles, error: null };
     } catch (error: any) {
       console.error('Erreur getApplicationsByJob:', error);
       throw error;
     }
   });
 },

 async getApplicationsByEmployer(employerId: string) {
   return retryWithBackoff(async () => {
     console.log('Récupération candidatures pour employeur:', employerId);
     try {
       // D'abord récupérer tous les jobs de l'employeur
       const jobsResponse = await databases.listDocuments(
         DATABASE_ID,
         COLLECTIONS.JOBS,
         [Query.equal('employer_id', employerId)]
       );

       const jobIds = jobsResponse.documents.map(job => job.$id);
       
       if (jobIds.length === 0) {
         return { data: [], error: null };
       }

       // Récupérer toutes les candidatures pour ces jobs
       const applicationsResponse = await databases.listDocuments(
         DATABASE_ID,
         COLLECTIONS.APPLICATIONS,
         [
           Query.orderDesc('created_at')
         ]
       );

       // Filtrer les candidatures pour les jobs de cet employeur
       const relevantApplications = applicationsResponse.documents.filter(app => 
         jobIds.includes(app.job_id)
       );

       // Enrichir avec les données des jobs et profils candidats
       const applicationsWithDetails = await Promise.all(
         relevantApplications.map(async (application) => {
           try {
             const job = jobsResponse.documents.find(j => j.$id === application.job_id);
             const profile = await databases.getDocument(
               DATABASE_ID,
               COLLECTIONS.PROFILES,
               application.candidate_id
             );
             
             return {
               ...application,
               jobs: {
                 id: job?.$id,
                 title: job?.title,
                 company_name: job?.company_name,
                 employer_id: job?.employer_id
               },
               profiles: {
                 first_name: profile.first_name,
                 last_name: profile.last_name,
                 email: profile.email,
                 phone: profile.phone,
                 avatar_url: profile.avatar_url
               }
             };
           } catch {
             return application;
           }
         })
       );

       return { data: applicationsWithDetails, error: null };
     } catch (error: any) {
       console.error('Erreur getApplicationsByEmployer:', error);
       throw error;
     }
   });
 },

 async updateApplicationStatus(applicationId: string, status: string, notes: string | null = null) {
   return retryWithBackoff(async () => {
     await ensureValidSession();
     
     const updates: any = {
       status,
       updated_at: new Date().toISOString()
     };
     
     if (notes) {
       updates.employer_notes = notes;
     }

     console.log('Mise à jour statut candidature:', applicationId, updates);
     try {
       const application = await databases.updateDocument(
         DATABASE_ID,
         COLLECTIONS.APPLICATIONS,
         applicationId,
         updates
       );
       return { data: application, error: null };
     } catch (error: any) {
       console.error('Erreur updateApplicationStatus:', error);
       throw error;
     }
   });
 },

 async checkExistingApplication(candidateId: string, jobId: string) {
   return retryWithBackoff(async () => {
     console.log('Vérification candidature existante:', candidateId, jobId);
     try {
       const response = await databases.listDocuments(
         DATABASE_ID,
         COLLECTIONS.APPLICATIONS,
         [
           Query.equal('candidate_id', candidateId),
           Query.equal('job_id', jobId)
         ]
       );
       
       return { data: response.documents.length > 0 ? response.documents[0] : null, error: null };
     } catch (error: any) {
       console.error('Erreur checkExistingApplication:', error);
       throw error;
     }
   });
 },

 async deleteApplication(applicationId: string) {
   return retryWithBackoff(async () => {
     await ensureValidSession();
     
     console.log('Suppression candidature:', applicationId);
     try {
       await databases.deleteDocument(DATABASE_ID, COLLECTIONS.APPLICATIONS, applicationId);
       return { data: { success: true }, error: null };
     } catch (error: any) {
       console.error('Erreur deleteApplication:', error);
       throw error;
     }
   });
 }
};

// Services pour les offres sauvegardées
export const savedJobService = {
 async saveJob(candidateId: string, jobId: string) {
   return retryWithBackoff(async () => {
     await ensureValidSession();
     
     console.log('Sauvegarde job:', candidateId, jobId);
     try {
       const savedJob = await databases.createDocument(
         DATABASE_ID,
         COLLECTIONS.SAVED_JOBS,
         ID.unique(),
         {
           candidate_id: candidateId,
           job_id: jobId,
           created_at: new Date().toISOString()
         }
       );
       return { data: savedJob, error: null };
     } catch (error: any) {
       console.error('Erreur saveJob:', error);
       throw error;
     }
   });
 },

 async unsaveJob(candidateId: string, jobId: string) {
   return retryWithBackoff(async () => {
     await ensureValidSession();
     
     console.log('Suppression sauvegarde job:', candidateId, jobId);
     try {
       const response = await databases.listDocuments(
         DATABASE_ID,
         COLLECTIONS.SAVED_JOBS,
         [
           Query.equal('candidate_id', candidateId),
           Query.equal('job_id', jobId)
         ]
       );

       if (response.documents.length > 0) {
         await databases.deleteDocument(
           DATABASE_ID,
           COLLECTIONS.SAVED_JOBS,
           response.documents[0].$id
         );
       }

       return { data: { success: true }, error: null };
     } catch (error: any) {
       console.error('Erreur unsaveJob:', error);
       throw error;
     }
   });
 },

 async getSavedJobs(candidateId: string) {
   return retryWithBackoff(async () => {
     console.log('Récupération jobs sauvegardés:', candidateId);
     try {
       const response = await databases.listDocuments(
         DATABASE_ID,
         COLLECTIONS.SAVED_JOBS,
         [
           Query.equal('candidate_id', candidateId),
           Query.orderDesc('created_at')
         ]
       );

       // Récupérer les détails des jobs sauvegardés
       const savedJobsWithDetails = await Promise.all(
         response.documents.map(async (savedJob) => {
           try {
             const job = await databases.getDocument(DATABASE_ID, COLLECTIONS.JOBS, savedJob.job_id);
             
             // Vérifier que le job est encore actif
             if (!job.is_active) {
               return null;
             }

             const profile = await databases.getDocument(DATABASE_ID, COLLECTIONS.PROFILES, job.employer_id);
             
             return {
               ...savedJob,
               jobs: {
                 ...job,
                 profiles: {
                   company_name: profile.company_name,
                   avatar_url: profile.avatar_url
                 }
               }
             };
           } catch {
             return null;
           }
         })
       );

       // Filtrer les jobs null (supprimés ou inactifs)
       const validSavedJobs = savedJobsWithDetails.filter(job => job !== null);

       return { data: validSavedJobs, error: null };
     } catch (error: any) {
       console.error('Erreur getSavedJobs:', error);
       throw error;
     }
   });
 },

 async isJobSaved(candidateId: string, jobId: string) {
   return retryWithBackoff(async () => {
     console.log('Vérification job sauvegardé:', candidateId, jobId);
     try {
       const response = await databases.listDocuments(
         DATABASE_ID,
         COLLECTIONS.SAVED_JOBS,
         [
           Query.equal('candidate_id', candidateId),
           Query.equal('job_id', jobId)
         ]
       );
       
       return { data: response.documents.length > 0, error: null };
     } catch (error: any) {
       console.error('Erreur isJobSaved:', error);
       return { data: false, error: null };
     }
   }, 2, 500);
 }
};

// Services pour les services sauvegardés
export const savedServiceService = {
 async saveService(employerId: string, serviceId: string) {
   return retryWithBackoff(async () => {
     await ensureValidSession();
     
     console.log('Sauvegarde service:', employerId, serviceId);
     try {
       const savedService = await databases.createDocument(
         DATABASE_ID,
         COLLECTIONS.SAVED_SERVICES,
         ID.unique(),
         {
           employer_id: employerId,
           service_id: serviceId,
           created_at: new Date().toISOString()
         }
       );
       return { data: savedService, error: null };
     } catch (error: any) {
       console.error('Erreur saveService:', error);
       throw error;
     }
   });
 },

 async unsaveService(employerId: string, serviceId: string) {
   return retryWithBackoff(async () => {
     await ensureValidSession();
     
     console.log('Suppression sauvegarde service:', employerId, serviceId);
     try {
       const response = await databases.listDocuments(
         DATABASE_ID,
         COLLECTIONS.SAVED_SERVICES,
         [
           Query.equal('employer_id', employerId),
           Query.equal('service_id', serviceId)
         ]
       );

       if (response.documents.length > 0) {
         await databases.deleteDocument(
           DATABASE_ID,
           COLLECTIONS.SAVED_SERVICES,
           response.documents[0].$id
         );
       }

       return { data: { success: true }, error: null };
     } catch (error: any) {
       console.error('Erreur unsaveService:', error);
       throw error;
     }
   });
 },

 async getSavedServices(employerId: string) {
   return retryWithBackoff(async () => {
     console.log('Récupération services sauvegardés:', employerId);
     try {
       const response = await databases.listDocuments(
         DATABASE_ID,
         COLLECTIONS.SAVED_SERVICES,
         [
           Query.equal('employer_id', employerId),
           Query.orderDesc('created_at')
         ]
       );

       // Récupérer les détails des services sauvegardés
       const savedServicesWithDetails = await Promise.all(
         response.documents.map(async (savedService) => {
           try {
             const service = await databases.getDocument(DATABASE_ID, COLLECTIONS.SERVICES, savedService.service_id);
             
             // Vérifier que le service est encore actif
             if (!service.is_active) {
               return null;
             }

             const profile = await databases.getDocument(DATABASE_ID, COLLECTIONS.PROFILES, service.creator_id);
             
             return {
               ...savedService,
               services: {
                 ...service,
                 profiles: {
                   full_name: profile.full_name,
                   avatar_url: profile.avatar_url,
                   location: profile.location,
                   poste: profile.poste
                 }
               }
             };
           } catch {
             return null;
           }
         })
       );

       // Filtrer les services null (supprimés ou inactifs)
       const validSavedServices = savedServicesWithDetails.filter(service => service !== null);

       return { data: validSavedServices, error: null };
     } catch (error: any) {
       console.error('Erreur getSavedServices:', error);
       throw error;
     }
   });
 }
};

// Services pour les messages
export const messageService = {
 async sendMessage(messageData: any) {
   return retryWithBackoff(async () => {
     await ensureValidSession();
     
     console.log('Envoi message:', messageData);
     try {
       const message = await databases.createDocument(
         DATABASE_ID,
         COLLECTIONS.MESSAGES,
         ID.unique(),
         {
           ...messageData,
           created_at: new Date().toISOString()
         }
       );
       return { data: message, error: null };
     } catch (error: any) {
       console.error('Erreur sendMessage:', error);
       throw error;
     }
   });
 },

 async getMessages(userId: string) {
   return retryWithBackoff(async () => {
     console.log('Récupération messages pour:', userId);
     try {
       // Récupérer tous les messages
       const response = await databases.listDocuments(
         DATABASE_ID,
         COLLECTIONS.MESSAGES,
         [Query.orderDesc('created_at')]
       );

       // Filtrer les messages pour cet utilisateur
       const userMessages = response.documents.filter(message => 
         message.sender_id === userId || message.receiver_id === userId
       );

       // Enrichir avec les profils des expéditeurs et destinataires
       const messagesWithProfiles = await Promise.all(
         userMessages.map(async (message) => {
           try {
             const senderProfile = await databases.getDocument(
               DATABASE_ID,
               COLLECTIONS.PROFILES,
               message.sender_id
             );
             const receiverProfile = await databases.getDocument(
               DATABASE_ID,
               COLLECTIONS.PROFILES,
               message.receiver_id
             );
             
             return {
               ...message,
               sender: {
                 full_name: senderProfile.full_name,
                 avatar_url: senderProfile.avatar_url
               },
               receiver: {
                 full_name: receiverProfile.full_name,
                 avatar_url: receiverProfile.avatar_url
               }
             };
           } catch {
             return message;
           }
         })
       );

       return { data: messagesWithProfiles, error: null };
     } catch (error: any) {
       console.error('Erreur getMessages:', error);
       throw error;
     }
   });
 },

 async markAsRead(messageId: string) {
   return retryWithBackoff(async () => {
     await ensureValidSession();
     
     console.log('Marquage message lu:', messageId);
     try {
       const message = await databases.updateDocument(
         DATABASE_ID,
         COLLECTIONS.MESSAGES,
         messageId,
         { 
           is_read: true,
           updated_at: new Date().toISOString()
         }
       );
       return { data: message, error: null };
     } catch (error: any) {
       console.error('Erreur markAsRead:', error);
       throw error;
     }
   });
 }
};

// Services pour l'upload de fichiers
export const fileService = {
 async uploadCV(file: File, candidateId: string) {
   return retryWithBackoff(async () => {
     await ensureValidSession();
     
     const fileExt = file.name.split('.').pop();
     const fileName = `${candidateId}_cv_${Date.now()}.${fileExt}`;

     console.log('Upload CV:', fileName);
     try {
       const uploadedFile = await storage.createFile(
         BUCKETS.DOCUMENTS,
         ID.unique(),
         file
       );

       const fileUrl = storage.getFileView(BUCKETS.DOCUMENTS, uploadedFile.$id);

       return { 
         data: { 
           path: uploadedFile.$id, 
           url: fileUrl,
           fileId: uploadedFile.$id
         }, 
         error: null 
       };
     } catch (error: any) {
       console.error('Erreur uploadCV:', error);
       throw error;
     }
   });
 },

 async uploadCompanyLogo(file: File, employerId: string) {
   return retryWithBackoff(async () => {
     await ensureValidSession();
     
     const fileExt = file.name.split('.').pop();
     const fileName = `${employerId}_logo_${Date.now()}.${fileExt}`;

     console.log('Upload logo:', fileName);
     try {
       const uploadedFile = await storage.createFile(
         BUCKETS.IMAGES,
         ID.unique(),
         file
       );

       const fileUrl = storage.getFileView(BUCKETS.IMAGES, uploadedFile.$id);

       return { 
         data: { 
           path: uploadedFile.$id, 
           url: fileUrl,
           fileId: uploadedFile.$id
         }, 
         error: null 
       };
     } catch (error: any) {
       console.error('Erreur uploadCompanyLogo:', error);
       throw error;
     }
   });
 },

 async deleteFile(bucketId: string, fileId: string) {
   return retryWithBackoff(async () => {
     await ensureValidSession();
     
     console.log('Suppression fichier:', bucketId, fileId);
     try {
       await storage.deleteFile(bucketId, fileId);
       return { data: { success: true }, error: null };
     } catch (error: any) {
       console.error('Erreur deleteFile:', error);
       throw error;
     }
   });
 },

 // Fonction utilitaire pour obtenir l'URL d'un fichier
 getFileUrl(bucketId: string, fileId: string) {
   return storage.getFileView(bucketId, fileId);
 },

 // Fonction utilitaire pour obtenir l'URL de téléchargement d'un fichier
 getFileDownloadUrl(bucketId: string, fileId: string) {
   return storage.getFileDownload(bucketId, fileId);
 }
};

// Services pour les statistiques
export const statsService = {
 async getGeneralStats() {
   return retryWithBackoff(async () => {
     console.log('Récupération statistiques générales');
     
     try {
       const [jobsResponse, candidatesResponse, employersResponse, applicationsResponse] = await Promise.all([
         databases.listDocuments(DATABASE_ID, COLLECTIONS.JOBS, [Query.equal('is_active', true)]),
         databases.listDocuments(DATABASE_ID, COLLECTIONS.PROFILES, [Query.equal('user_type', 'candidate')]),
         databases.listDocuments(DATABASE_ID, COLLECTIONS.PROFILES, [Query.equal('user_type', 'employer')]),
         databases.listDocuments(DATABASE_ID, COLLECTIONS.APPLICATIONS, [])
       ]);

       return {
         totalJobs: jobsResponse.total || 0,
         totalCandidates: candidatesResponse.total || 0,
         totalEmployers: employersResponse.total || 0,
         totalApplications: applicationsResponse.total || 0
       };
     } catch (error: any) {
       console.error('Erreur getGeneralStats:', error);
       throw error;
     }
   });
 },

 async getEmployerStats(employerId: string) {
   return retryWithBackoff(async () => {
     console.log('Récupération stats employeur:', employerId);
     
     try {
       const [jobsResponse, applicationsResponse] = await Promise.all([
         databases.listDocuments(DATABASE_ID, COLLECTIONS.JOBS, [
           Query.equal('employer_id', employerId),
           Query.equal('is_active', true)
         ]),
         databases.listDocuments(DATABASE_ID, COLLECTIONS.APPLICATIONS, [])
       ]);

       // Calculer les vues totales
       const totalViews = jobsResponse.documents.reduce((sum, job) => sum + (job.views_count || 0), 0);

       // Filtrer les candidatures pour cet employeur
       const employerApplications = applicationsResponse.documents.filter(app => {
         return jobsResponse.documents.some(job => job.$id === app.job_id);
       });

       return {
         activeJobs: jobsResponse.total || 0,
         totalApplications: employerApplications.length,
         totalViews: totalViews
       };
     } catch (error: any) {
       console.error('Erreur getEmployerStats:', error);
       throw error;
     }
   });
 },

 async getCandidateStats(candidateId: string) {
   return retryWithBackoff(async () => {
     console.log('Récupération stats candidat:', candidateId);
     
     try {
       const [applicationsResponse, savedJobsResponse] = await Promise.all([
         databases.listDocuments(DATABASE_ID, COLLECTIONS.APPLICATIONS, [
           Query.equal('candidate_id', candidateId)
         ]),
         databases.listDocuments(DATABASE_ID, COLLECTIONS.SAVED_JOBS, [
           Query.equal('candidate_id', candidateId)
         ])
       ]);

       const applications = applicationsResponse.documents || [];
       const applicationsByStatus = applications.reduce((acc: any, app: any) => {
         acc[app.status] = (acc[app.status] || 0) + 1;
         return acc;
       }, {});

       return {
         totalApplications: applicationsResponse.total || 0,
         savedJobs: savedJobsResponse.total || 0,
         applicationsByStatus
       };
     } catch (error: any) {
       console.error('Erreur getCandidateStats:', error);
       throw error;
     }
   });
 }
};

// Services utilitaires
export const utilService = {
 formatSalary(min: number, max: number, currency = 'MGA') {
   if (!min && !max) return null;
   const formatNumber = (num: number) => new Intl.NumberFormat('fr-FR').format(num);
   
   if (min && max) {
     return `${formatNumber(min)} - ${formatNumber(max)} ${currency}`;
   }
   return `À partir de ${formatNumber(min || max)} ${currency}`;
 },

 getTimeAgo(date: string | Date) {
   const now = new Date();
   const diffTime = Math.abs(now.getTime() - new Date(date).getTime());
   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
   
   if (diffDays === 1) return 'Aujourd\'hui';
   if (diffDays === 2) return 'Hier';
   if (diffDays <= 7) return `Il y a ${diffDays} jours`;
   if (diffDays <= 30) return `Il y a ${Math.ceil(diffDays / 7)} semaines`;
   return `Il y a ${Math.ceil(diffDays / 30)} mois`;
 },

 validateEmail(email: string) {
   const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   return re.test(email);
 },

 validatePhone(phone: string) {
   const re = /^(\+261|0)[0-9]{9}$/;
   return re.test(phone);
 }
};

// Fonction pour initialiser Appwrite avec les bonnes configurations
export const initializeAppwrite = (endpoint: string, projectId: string) => {
 client.setEndpoint(endpoint).setProject(projectId);
};

// Export du client pour usage avancé si nécessaire
export { client };

// Fonction utilitaire pour gérer les erreurs Appwrite
export const handleAppwriteError = (error: ExtendedError) => {
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

// Types TypeScript pour une meilleure expérience de développement
export interface AppwriteResponse<T> {
 data: T | null;
 error: any;
 count?: number;
}

export interface AppwriteUser {
 $id: string;
 name: string;
 email: string;
 emailVerification: boolean;
 registration: string;
 status: boolean;
 prefs: any;
}

export interface AppwriteSession {
 $id: string;
 userId: string;
 expire: string;
 provider: string;
 providerUid: string;
 providerAccessToken: string;
 current: boolean;
}

// Constantes pour les rôles et permissions
export const ROLES = {
 GUEST: 'guests',
 USER: 'users',
 ADMIN: 'admin'
};

export const PERMISSIONS = {
 READ: (role: string) => Permission.read(Role.user(role)),
 WRITE: (role: string) => Permission.write(Role.user(role)),
 UPDATE: (role: string) => Permission.update(Role.user(role)),
 DELETE: (role: string) => Permission.delete(Role.user(role))
};