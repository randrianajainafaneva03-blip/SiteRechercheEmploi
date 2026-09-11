import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const SUBSCRIPTIONS_COLLECTION_ID = 'subscriptions';

/**
 * Récupère l'abonnement actif d'un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @returns {Object|null} - Abonnement actif ou null
 */
export const getActiveSubscription = async (userId) => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      SUBSCRIPTIONS_COLLECTION_ID,
      [
        Query.equal('user_id', userId),
        Query.equal('status', 'active'),
        Query.orderDesc('created_at'),
        Query.limit(1)
      ]
    );

    if (response.documents.length > 0) {
      return response.documents[0];
    }

    return null;
  } catch (error) {
    console.error('Erreur récupération abonnement:', error);
    return null;
  }
};

/**
 * Vérifie si l'utilisateur peut souscrire à un plan
 * @param {Object} currentSubscription - Abonnement actuel
 * @param {string} targetPlanType - Plan cible (ex: 'candidate_pro')
 * @returns {Object} - { canSubscribe: boolean, reason: string }
 */
export const canSubscribeToPlan = (currentSubscription, targetPlanType) => {
  // Si pas d'abonnement actif, peut tout souscrire
  if (!currentSubscription) {
    return { canSubscribe: true, reason: null };
  }

  const currentPlanType = currentSubscription.subscription_type;

  // Tickets toujours disponibles
  if (targetPlanType === 'candidate_ticket') {
    return { canSubscribe: true, reason: null };
  }

  // Même plan = déjà souscrit
  if (currentPlanType === targetPlanType) {
    return { canSubscribe: false, reason: 'current' };
  }

  // Hiérarchie des plans candidats
  const planHierarchy = {
    'candidate_pro': 1,
    'candidate_plus': 2
  };

  const currentLevel = planHierarchy[currentPlanType] || 0;
  const targetLevel = planHierarchy[targetPlanType] || 0;

  // Si plan actuel est ticket, peut upgrader vers tout
  if (currentPlanType === 'candidate_ticket') {
    return { canSubscribe: true, reason: null };
  }

  // Si plan cible est inférieur au plan actuel
  if (targetLevel < currentLevel && targetLevel > 0) {
    return { canSubscribe: false, reason: 'downgrade' };
  }

  // Upgrade autorisé
  return { canSubscribe: true, reason: 'upgrade' };
};

export default {
  getActiveSubscription,
  canSubscribeToPlan
};