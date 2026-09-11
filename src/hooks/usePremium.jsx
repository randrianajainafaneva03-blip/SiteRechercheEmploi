import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { databases, DATABASE_ID } from '@/lib/appwrite';
import { Query } from 'appwrite';

export const usePremium = () => {
  const { user, profile } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [premiumType, setPremiumType] = useState(null);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkPremiumStatus();
  }, [user, profile]);

  const checkPremiumStatus = async () => {
    if (!user || !profile) {
      setLoading(false);
      return;
    }

    try {
      // Vérifier le statut premium dans le profil
      const userIsPremium = profile.is_premium || false;
      const userPremiumType = profile.premium_type || null;

      setIsPremium(userIsPremium);
      setPremiumType(userPremiumType);

      // Si premium, récupérer les détails de l'abonnement
      if (userIsPremium) {
        try {
          const subscriptions = await databases.listDocuments(
            DATABASE_ID,
            'subscriptions',
            [
              Query.equal('user_id', user.$id),
              Query.equal('status', 'active'),
              Query.orderDesc('created_at'),
              Query.limit(1)
            ]
          );

          if (subscriptions.documents.length > 0) {
            setSubscriptionData(subscriptions.documents[0]);
          }
        } catch (error) {
          console.log('Erreur récupération abonnement:', error);
        }
      }

    } catch (error) {
      console.error('Erreur vérification premium:', error);
    } finally {
      setLoading(false);
    }
  };

  // Vérifier si une fonctionnalité spécifique est disponible
  const hasFeature = (featureName) => {
    if (!isPremium) return false;

    const premiumProFeatures = [
      'featured_jobs',
      'urgent_badge',
      'direct_contact',
      'download_cv',
      'view_contact_info',
      'contact_freelancers'
    ];

    const premiumPlusFeatures = [
      ...premiumProFeatures,
      'popup_ads',
      'headhunter_assistance',
      'detailed_analytics',
      'premium_support'
    ];

    if (premiumType === 'premium_pro') {
      return premiumProFeatures.includes(featureName);
    }

    if (premiumType === 'premium_plus') {
      return premiumPlusFeatures.includes(featureName);
    }

    return false;
  };

  // Vérifier si l'abonnement est encore valide
  const isSubscriptionValid = () => {
    if (!subscriptionData) return false;
    
    const endDate = new Date(subscriptionData.end_date);
    const now = new Date();
    
    return endDate > now;
  };

  return {
    isPremium,
    premiumType,
    subscriptionData,
    loading,
    hasFeature,
    isSubscriptionValid,
    refreshStatus: checkPremiumStatus
  };
};