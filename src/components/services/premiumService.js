// src/services/premiumService.js
import { databases, DATABASE_ID } from '@/lib/appwrite';
import { Query } from 'appwrite';

export const PremiumService = {
  // Vérifier le statut premium d'un utilisateur
  checkUserPremium: async (userId) => {
    try {
      const profile = await databases.getDocument(
        DATABASE_ID,
        'profiles',
        userId
      );
      
      return {
        isPremium: profile.is_premium || false,
        premiumType: profile.premium_type || null,
        activatedAt: profile.premium_activated_at || null
      };
    } catch (error) {
      console.error('Erreur vérification premium:', error);
      return { isPremium: false, premiumType: null, activatedAt: null };
    }
  },

  // Activer l'abonnement premium
  activatePremium: async (userId, subscriptionType, transactionData) => {
    try {
      // Créer l'enregistrement de l'abonnement
      const subscriptionData = {
        user_id: userId,
        subscription_type: subscriptionType,
        transaction_id: transactionData.transactionId,
        status: 'active',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 jours
        amount: subscriptionType === 'premium_pro' ? 20000 : 25000,
        payment_method: transactionData.paymentMethod,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const subscription = await databases.createDocument(
        DATABASE_ID,
        'subscriptions',
        'unique()',
        subscriptionData
      );

      // Mettre à jour le profil utilisateur
      await databases.updateDocument(
        DATABASE_ID,
        'profiles',
        userId,
        {
          is_premium: true,
          premium_type: subscriptionType,
          premium_activated_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      );

      return { success: true, subscription };
    } catch (error) {
      console.error('Erreur activation premium:', error);
      return { success: false, error: error.message };
    }
  },

  // Désactiver l'abonnement premium
  deactivatePremium: async (userId) => {
    try {
      // Trouver l'abonnement actif
      const subscriptions = await databases.listDocuments(
        DATABASE_ID,
        'subscriptions',
        [
          Query.equal('user_id', userId),
          Query.equal('status', 'active')
        ]
      );

      // Désactiver tous les abonnements actifs
      for (const subscription of subscriptions.documents) {
        await databases.updateDocument(
          DATABASE_ID,
          'subscriptions',
          subscription.$id,
          {
            status: 'cancelled',
            cancelled_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        );
      }

      // Mettre à jour le profil utilisateur
      await databases.updateDocument(
        DATABASE_ID,
        'profiles',
        userId,
        {
          is_premium: false,
          premium_type: null,
          premium_deactivated_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      );

      return { success: true };
    } catch (error) {
      console.error('Erreur désactivation premium:', error);
      return { success: false, error: error.message };
    }
  },

  // Renouveler l'abonnement
  renewSubscription: async (userId, transactionData) => {
    try {
      // Trouver l'abonnement actuel
      const subscriptions = await databases.listDocuments(
        DATABASE_ID,
        'subscriptions',
        [
          Query.equal('user_id', userId),
          Query.equal('status', 'active'),
          Query.orderDesc('created_at'),
          Query.limit(1)
        ]
      );

      if (subscriptions.documents.length === 0) {
        throw new Error('Aucun abonnement actif trouvé');
      }

      const currentSubscription = subscriptions.documents[0];
      
      // Étendre la date de fin de 30 jours
      const currentEndDate = new Date(currentSubscription.end_date);
      const newEndDate = new Date(currentEndDate.getTime() + 30 * 24 * 60 * 60 * 1000);

      // Mettre à jour l'abonnement
      await databases.updateDocument(
        DATABASE_ID,
        'subscriptions',
        currentSubscription.$id,
        {
          end_date: newEndDate.toISOString(),
          last_payment_date: new Date().toISOString(),
          last_transaction_id: transactionData.transactionId,
          updated_at: new Date().toISOString()
        }
      );

      return { success: true, newEndDate };
    } catch (error) {
      console.error('Erreur renouvellement:', error);
      return { success: false, error: error.message };
    }
  },

  // Obtenir l'historique des paiements
  getPaymentHistory: async (userId) => {
    try {
      const subscriptions = await databases.listDocuments(
        DATABASE_ID,
        'subscriptions',
        [
          Query.equal('user_id', userId),
          Query.orderDesc('created_at')
        ]
      );

      return { success: true, payments: subscriptions.documents };
    } catch (error) {
      console.error('Erreur historique paiements:', error);
      return { success: false, error: error.message };
    }
  }
};