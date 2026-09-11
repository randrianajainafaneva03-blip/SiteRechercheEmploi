// lib/appwrite-collections.js
// Définitions des collections Appwrite pour le système Premium

export const COLLECTIONS_SCHEMA = {
    // Collection: subscriptions
    subscriptions: {
      name: 'subscriptions',
      attributes: [
        {
          key: 'user_id',
          type: 'string',
          size: 255,
          required: true,
          description: 'ID de l\'utilisateur'
        },
        {
          key: 'subscription_type',
          type: 'string',
          size: 50,
          required: true,
          description: 'Type d\'abonnement: premium_pro ou premium_plus'
        },
        {
          key: 'transaction_id',
          type: 'string',
          size: 255,
          required: true,
          description: 'ID de la transaction de paiement'
        },
        {
          key: 'status',
          type: 'string',
          size: 50,
          required: true,
          default: 'active',
          description: 'Statut: active, cancelled, expired, suspended'
        },
        {
          key: 'start_date',
          type: 'datetime',
          required: true,
          description: 'Date de début de l\'abonnement'
        },
        {
          key: 'end_date',
          type: 'datetime',
          required: true,
          description: 'Date de fin de l\'abonnement'
        },
        {
          key: 'amount',
          type: 'integer',
          required: true,
          description: 'Montant payé en Ariary'
        },
        {
          key: 'payment_method',
          type: 'string',
          size: 50,
          required: true,
          description: 'Méthode de paiement: orange_money, mvola, credit_card'
        },
        {
          key: 'last_payment_date',
          type: 'datetime',
          required: false,
          description: 'Date du dernier paiement (renouvellement)'
        },
        {
          key: 'last_transaction_id',
          type: 'string',
          size: 255,
          required: false,
          description: 'ID de la dernière transaction'
        },
        {
          key: 'cancelled_at',
          type: 'datetime',
          required: false,
          description: 'Date d\'annulation'
        },
        {
          key: 'created_at',
          type: 'datetime',
          required: true,
          description: 'Date de création'
        },
        {
          key: 'updated_at',
          type: 'datetime',
          required: true,
          description: 'Date de dernière mise à jour'
        }
      ],
      indexes: [
        {
          key: 'user_id_index',
          type: 'key',
          attributes: ['user_id']
        },
        {
          key: 'status_index',
          type: 'key',
          attributes: ['status']
        },
        {
          key: 'subscription_type_index',
          type: 'key',
          attributes: ['subscription_type']
        },
        {
          key: 'user_status_index',
          type: 'key',
          attributes: ['user_id', 'status']
        }
      ]
    },
  
    // Modifications à apporter à la collection profiles existante
    profiles_premium_fields: {
      additional_attributes: [
        {
          key: 'is_premium',
          type: 'boolean',
          required: false,
          default: false,
          description: 'Indique si l\'utilisateur a un abonnement premium actif'
        },
        {
          key: 'premium_type',
          type: 'string',
          size: 50,
          required: false,
          description: 'Type de premium: premium_pro ou premium_plus'
        },
        {
          key: 'premium_activated_at',
          type: 'datetime',
          required: false,
          description: 'Date d\'activation du premium'
        },
        {
          key: 'premium_deactivated_at',
          type: 'datetime',
          required: false,
          description: 'Date de désactivation du premium'
        }
      ]
    },
  
    // Collection: premium_analytics (pour les statistiques Premium Plus+)
    premium_analytics: {
      name: 'premium_analytics',
      attributes: [
        {
          key: 'user_id',
          type: 'string',
          size: 255,
          required: true,
          description: 'ID de l\'utilisateur'
        },
        {
          key: 'job_id',
          type: 'string',
          size: 255,
          required: false,
          description: 'ID de l\'offre d\'emploi (optionnel)'
        },
        {
          key: 'metric_type',
          type: 'string',
          size: 100,
          required: true,
          description: 'Type de métrique: views, applications, contacts, downloads'
        },
        {
          key: 'metric_value',
          type: 'integer',
          required: true,
          description: 'Valeur de la métrique'
        },
        {
          key: 'date',
          type: 'datetime',
          required: true,
          description: 'Date de la métrique'
        },
        {
          key: 'additional_data',
          type: 'string',
          size: 1000,
          required: false,
          description: 'Données supplémentaires au format JSON'
        }
      ],
      indexes: [
        {
          key: 'user_date_index',
          type: 'key',
          attributes: ['user_id', 'date']
        },
        {
          key: 'job_metric_index',
          type: 'key',
          attributes: ['job_id', 'metric_type']
        }
      ]
    },
  
    // Collection: premium_contacts (pour traquer les contacts directs)
    premium_contacts: {
      name: 'premium_contacts',
      attributes: [
        {
          key: 'employer_id',
          type: 'string',
          size: 255,
          required: true,
          description: 'ID de l\'employeur (utilisateur premium)'
        },
        {
          key: 'candidate_id',
          type: 'string',
          size: 255,
          required: true,
          description: 'ID du candidat contacté'
        },
        {
          key: 'job_id',
          type: 'string',
          size: 255,
          required: false,
          description: 'ID de l\'offre liée (optionnel)'
        },
        {
          key: 'contact_type',
          type: 'string',
          size: 50,
          required: true,
          description: 'Type de contact: message, phone, email, cv_download'
        },
        {
          key: 'message',
          type: 'string',
          size: 2000,
          required: false,
          description: 'Message envoyé (si applicable)'
        },
        {
          key: 'contacted_at',
          type: 'datetime',
          required: true,
          description: 'Date du contact'
        }
      ],
      indexes: [
        {
          key: 'employer_date_index',
          type: 'key',
          attributes: ['employer_id', 'contacted_at']
        },
        {
          key: 'candidate_employer_index',
          type: 'key',
          attributes: ['candidate_id', 'employer_id']
        }
      ]
    }
  };
  
  // Fonction pour créer/mettre à jour les collections
  export const setupPremiumCollections = async (databases, databaseId) => {
    console.log('🚀 Configuration des collections Premium...');
  
    try {
      // 1. Créer la collection subscriptions
      try {
        await databases.createCollection(
          databaseId,
          'subscriptions',
          'subscriptions',
          ['read("user")'],
          ['create("user")', 'update("user")', 'delete("user")']
        );
        console.log('✅ Collection subscriptions créée');
  
        // Ajouter les attributs
        for (const attr of COLLECTIONS_SCHEMA.subscriptions.attributes) {
          await databases.createStringAttribute(
            databaseId,
            'subscriptions',
            attr.key,
            attr.size || 255,
            attr.required || false,
            attr.default || null
          );
        }
  
        // Créer les index
        for (const index of COLLECTIONS_SCHEMA.subscriptions.indexes) {
          await databases.createIndex(
            databaseId,
            'subscriptions',
            index.key,
            index.type,
            index.attributes
          );
        }
  
      } catch (error) {
        if (error.code !== 409) { // 409 = Collection already exists
          console.error('Erreur création collection subscriptions:', error);
        } else {
          console.log('ℹ️ Collection subscriptions existe déjà');
        }
      }
  
      // 2. Créer la collection premium_analytics
      try {
        await databases.createCollection(
          databaseId,
          'premium_analytics',
          'premium_analytics',
          ['read("user")'],
          ['create("user")', 'update("user")', 'delete("user")']
        );
        console.log('✅ Collection premium_analytics créée');
  
        // Ajouter les attributs pour premium_analytics
        for (const attr of COLLECTIONS_SCHEMA.premium_analytics.attributes) {
          if (attr.type === 'string') {
            await databases.createStringAttribute(
              databaseId,
              'premium_analytics',
              attr.key,
              attr.size || 255,
              attr.required || false,
              attr.default || null
            );
          } else if (attr.type === 'integer') {
            await databases.createIntegerAttribute(
              databaseId,
              'premium_analytics',
              attr.key,
              attr.required || false,
              attr.min || null,
              attr.max || null,
              attr.default || null
            );
          } else if (attr.type === 'datetime') {
            await databases.createDatetimeAttribute(
              databaseId,
              'premium_analytics',
              attr.key,
              attr.required || false,
              attr.default || null
            );
          }
        }
  
        // Créer les index pour premium_analytics
        for (const index of COLLECTIONS_SCHEMA.premium_analytics.indexes) {
          await databases.createIndex(
            databaseId,
            'premium_analytics',
            index.key,
            index.type,
            index.attributes
          );
        }
  
      } catch (error) {
        if (error.code !== 409) {
          console.error('Erreur création collection premium_analytics:', error);
        } else {
          console.log('ℹ️ Collection premium_analytics existe déjà');
        }
      }
  
      // 3. Créer la collection premium_contacts
      try {
        await databases.createCollection(
          databaseId,
          'premium_contacts',
          'premium_contacts',
          ['read("user")'],
          ['create("user")', 'update("user")', 'delete("user")']
        );
        console.log('✅ Collection premium_contacts créée');
  
        // Ajouter les attributs pour premium_contacts
        for (const attr of COLLECTIONS_SCHEMA.premium_contacts.attributes) {
          if (attr.type === 'string') {
            await databases.createStringAttribute(
              databaseId,
              'premium_contacts',
              attr.key,
              attr.size || 255,
              attr.required || false,
              attr.default || null
            );
          } else if (attr.type === 'datetime') {
            await databases.createDatetimeAttribute(
              databaseId,
              'premium_contacts',
              attr.key,
              attr.required || false,
              attr.default || null
            );
          }
        }
  
        // Créer les index pour premium_contacts
        for (const index of COLLECTIONS_SCHEMA.premium_contacts.indexes) {
          await databases.createIndex(
            databaseId,
            'premium_contacts',
            index.key,
            index.type,
            index.attributes
          );
        }
  
      } catch (error) {
        if (error.code !== 409) {
          console.error('Erreur création collection premium_contacts:', error);
        } else {
          console.log('ℹ️ Collection premium_contacts existe déjà');
        }
      }
  
      // 4. Ajouter les champs Premium à la collection profiles existante
      try {
        console.log('🔄 Ajout des champs Premium à la collection profiles...');
        
        const premiumFields = COLLECTIONS_SCHEMA.profiles_premium_fields.additional_attributes;
        
        for (const field of premiumFields) {
          try {
            if (field.type === 'boolean') {
              await databases.createBooleanAttribute(
                databaseId,
                'profiles',
                field.key,
                field.required || false,
                field.default || false
              );
            } else if (field.type === 'string') {
              await databases.createStringAttribute(
                databaseId,
                'profiles',
                field.key,
                field.size || 255,
                field.required || false,
                field.default || null
              );
            } else if (field.type === 'datetime') {
              await databases.createDatetimeAttribute(
                databaseId,
                'profiles',
                field.key,
                field.required || false,
                field.default || null
              );
            }
            console.log(`✅ Champ ${field.key} ajouté à profiles`);
          } catch (fieldError) {
            if (fieldError.code !== 409) {
              console.error(`Erreur ajout champ ${field.key}:`, fieldError);
            } else {
              console.log(`ℹ️ Champ ${field.key} existe déjà`);
            }
          }
        }
  
      } catch (error) {
        console.error('Erreur mise à jour collection profiles:', error);
      }
  
      console.log('🎉 Configuration des collections Premium terminée !');
      return { success: true };
  
    } catch (error) {
      console.error('❌ Erreur configuration collections Premium:', error);
      return { success: false, error: error.message };
    }
  };
  
  // Fonction pour valider que toutes les collections Premium existent
  export const validatePremiumCollections = async (databases, databaseId) => {
    const requiredCollections = ['subscriptions', 'premium_analytics', 'premium_contacts', 'profiles'];
    const missingCollections = [];
  
    for (const collectionName of requiredCollections) {
      try {
        await databases.getCollection(databaseId, collectionName);
        console.log(`✅ Collection ${collectionName} validée`);
      } catch (error) {
        console.error(`❌ Collection ${collectionName} manquante`);
        missingCollections.push(collectionName);
      }
    }
  
    return {
      isValid: missingCollections.length === 0,
      missingCollections
    };
  };
  
  // Fonction pour nettoyer les abonnements expirés
  export const cleanupExpiredSubscriptions = async (databases, databaseId) => {
    try {
      console.log('🧹 Nettoyage des abonnements expirés...');
      
      // Récupérer tous les abonnements actifs
      const activeSubscriptions = await databases.listDocuments(
        databaseId,
        'subscriptions',
        [Query.equal('status', 'active')]
      );
  
      const now = new Date();
      let expiredCount = 0;
  
      for (const subscription of activeSubscriptions.documents) {
        const endDate = new Date(subscription.end_date);
        
        if (endDate < now) {
          // Marquer comme expiré
          await databases.updateDocument(
            databaseId,
            'subscriptions',
            subscription.$id,
            {
              status: 'expired',
              updated_at: now.toISOString()
            }
          );
  
          // Désactiver le premium dans le profil
          await databases.updateDocument(
            databaseId,
            'profiles',
            subscription.user_id,
            {
              is_premium: false,
              premium_type: null,
              premium_deactivated_at: now.toISOString(),
              updated_at: now.toISOString()
            }
          );
  
          expiredCount++;
          console.log(`⏰ Abonnement expiré pour l'utilisateur ${subscription.user_id}`);
        }
      }
  
      console.log(`🎯 ${expiredCount} abonnements expirés traités`);
      return { success: true, expiredCount };
  
    } catch (error) {
      console.error('❌ Erreur nettoyage abonnements expirés:', error);
      return { success: false, error: error.message };
    }
  };
  
  // Fonction pour créer des données de test Premium
  export const createPremiumTestData = async (databases, databaseId, userId) => {
    try {
      console.log('🧪 Création de données de test Premium...');
  
      // Créer un abonnement Premium Pro de test
      const testSubscription = {
        user_id: userId,
        subscription_type: 'premium_pro',
        transaction_id: `TEST_${Date.now()}`,
        status: 'active',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 jours
        amount: 20000,
        payment_method: 'test',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
  
      const subscription = await databases.createDocument(
        databaseId,
        'subscriptions',
        'unique()',
        testSubscription
      );
  
      // Activer le premium dans le profil
      await databases.updateDocument(
        databaseId,
        'profiles',
        userId,
        {
          is_premium: true,
          premium_type: 'premium_pro',
          premium_activated_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      );
  
      // Créer quelques données analytics de test
      const analyticsData = [
        {
          user_id: userId,
          metric_type: 'views',
          metric_value: 150,
          date: new Date().toISOString()
        },
        {
          user_id: userId,
          metric_type: 'applications',
          metric_value: 25,
          date: new Date().toISOString()
        },
        {
          user_id: userId,
          metric_type: 'contacts',
          metric_value: 8,
          date: new Date().toISOString()
        }
      ];
  
      for (const analytics of analyticsData) {
        await databases.createDocument(
          databaseId,
          'premium_analytics',
          'unique()',
          analytics
        );
      }
  
      console.log('✅ Données de test Premium créées');
      return { success: true, subscription };
  
    } catch (error) {
      console.error('❌ Erreur création données de test:', error);
      return { success: false, error: error.message };
    }
  };
  
  // Fonction pour migrer les utilisateurs existants
  export const migratePremiumUsers = async (databases, databaseId) => {
    try {
      console.log('🔄 Migration des utilisateurs Premium existants...');
  
      // Récupérer tous les profils sans les nouveaux champs premium
      const profiles = await databases.listDocuments(
        databaseId,
        'profiles',
        [Query.limit(1000)]
      );
  
      let migratedCount = 0;
  
      for (const profile of profiles.documents) {
        // Si le profil n'a pas encore les champs premium, les initialiser
        if (profile.is_premium === undefined) {
          await databases.updateDocument(
            databaseId,
            'profiles',
            profile.$id,
            {
              is_premium: false,
              premium_type: null,
              premium_activated_at: null,
              premium_deactivated_at: null,
              updated_at: new Date().toISOString()
            }
          );
          migratedCount++;
        }
      }
  
      console.log(`✅ ${migratedCount} profils migrés`);
      return { success: true, migratedCount };
  
    } catch (error) {
      console.error('❌ Erreur migration utilisateurs:', error);
      return { success: false, error: error.message };
    }
  };
  
  // Export des constantes pour faciliter l'utilisation
  export const PREMIUM_TYPES = {
    PRO: 'premium_pro',
    PLUS: 'premium_plus'
  };
  
  export const SUBSCRIPTION_STATUS = {
    ACTIVE: 'active',
    CANCELLED: 'cancelled',
    EXPIRED: 'expired',
    SUSPENDED: 'suspended'
  };
  
  export const PAYMENT_METHODS = {
    ORANGE_MONEY: 'orange_money',
    MVOLA: 'mvola',
    CREDIT_CARD: 'credit_card'
  };
  
  export const PREMIUM_FEATURES = {
    // Premium Pro
    FEATURED_JOBS: 'featured_jobs',
    URGENT_BADGE: 'urgent_badge',
    DIRECT_CONTACT: 'direct_contact',
    DOWNLOAD_CV: 'download_cv',
    VIEW_CONTACT_INFO: 'view_contact_info',
    CONTACT_FREELANCERS: 'contact_freelancers',
  
    // Premium Plus (inclut tout Pro +)
    POPUP_ADS: 'popup_ads',
    HEADHUNTER_ASSISTANCE: 'headhunter_assistance',
    DETAILED_ANALYTICS: 'detailed_analytics',
    PREMIUM_SUPPORT: 'premium_support'
  };
  
  // Fonction utilitaire pour vérifier les fonctionnalités selon le type
  export const getAvailableFeatures = (premiumType) => {
    const proFeatures = [
      PREMIUM_FEATURES.FEATURED_JOBS,
      PREMIUM_FEATURES.URGENT_BADGE,
      PREMIUM_FEATURES.DIRECT_CONTACT,
      PREMIUM_FEATURES.DOWNLOAD_CV,
      PREMIUM_FEATURES.VIEW_CONTACT_INFO,
      PREMIUM_FEATURES.CONTACT_FREELANCERS
    ];
  
    const plusFeatures = [
      ...proFeatures,
      PREMIUM_FEATURES.POPUP_ADS,
      PREMIUM_FEATURES.HEADHUNTER_ASSISTANCE,
      PREMIUM_FEATURES.DETAILED_ANALYTICS,
      PREMIUM_FEATURES.PREMIUM_SUPPORT
    ];
  
    switch (premiumType) {
      case PREMIUM_TYPES.PRO:
        return proFeatures;
      case PREMIUM_TYPES.PLUS:
        return plusFeatures;
      default:
        return [];
    }
  };
  
  // Script d'initialisation complète
  export const initializePremiumSystem = async (databases, databaseId) => {
    console.log('🚀 Initialisation complète du système Premium...');
  
    try {
      // 1. Configurer les collections
      const setupResult = await setupPremiumCollections(databases, databaseId);
      if (!setupResult.success) {
        throw new Error('Échec configuration collections');
      }
  
      // 2. Valider les collections
      const validationResult = await validatePremiumCollections(databases, databaseId);
      if (!validationResult.isValid) {
        console.warn('⚠️ Collections manquantes:', validationResult.missingCollections);
      }
  
      // 3. Migrer les utilisateurs existants
      await migratePremiumUsers(databases, databaseId);
  
      // 4. Nettoyer les abonnements expirés
      await cleanupExpiredSubscriptions(databases, databaseId);
  
      console.log('🎉 Système Premium initialisé avec succès !');
      return { success: true };
  
    } catch (error) {
      console.error('❌ Erreur initialisation système Premium:', error);
      return { success: false, error: error.message };
    }
  };
  
  export default {
    COLLECTIONS_SCHEMA,
    setupPremiumCollections,
    validatePremiumCollections,
    cleanupExpiredSubscriptions,
    createPremiumTestData,
    migratePremiumUsers,
    initializePremiumSystem,
    PREMIUM_TYPES,
    SUBSCRIPTION_STATUS,
    PAYMENT_METHODS,
    PREMIUM_FEATURES,
    getAvailableFeatures
  };