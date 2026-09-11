import { useAuth } from '@/contexts/AuthContext';

export const usePremiumFeatures = () => {
  const { profile } = useAuth();
  
  const isPremium = profile?.is_premium || false;
  const isEmployerPremium = profile?.user_type === 'employer' && profile?.is_premium;
  const isCandidatePremium = profile?.user_type === 'candidate' && profile?.is_premium;
  
  return {
    // État premium
    isPremium,
    isEmployerPremium,
    isCandidatePremium,
    userType: profile?.user_type,
    
    // Fonctionnalités employeur premium
    canFeatureJob: () => isEmployerPremium,
    canContactProvider: () => isEmployerPremium,
    canRevealContacts: () => isEmployerPremium,
    
    // Fonctionnalités candidat premium
    canBoostApplication: () => isCandidatePremium,
    canFeatureService: () => isCandidatePremium,
    canDirectMessage: () => isCandidatePremium,
    
    // Vérifications générales
    hasFeature: (feature) => {
      if (!isPremium) return false;
      
      const employerFeatures = ['feature-job', 'contact-provider', 'reveal-contacts'];
      const candidateFeatures = ['boost-application', 'feature-service', 'direct-message'];
      
      if (profile?.user_type === 'employer') {
        return employerFeatures.includes(feature);
      } else if (profile?.user_type === 'candidate') {
        return candidateFeatures.includes(feature);
      }
      
      return false;
    }
  };
};