import React from 'react';
import { Lock, Crown, Star } from 'lucide-react';
import { usePremiumFeatures } from '@/hooks/usePremiumFeatures';
import PremiumButton from './PremiumButton';

const PremiumGuard = ({ 
  requirePremium = true,
  userType = null,
  feature = null,
  fallback = null,
  children,
  showUpgrade = true,
  upgradeText = "Cette fonctionnalité est réservée aux membres Premium"
}) => {
  const { 
    isPremium, 
    isEmployerPremium, 
    isCandidatePremium, 
    userType: currentUserType,
    hasFeature 
  } = usePremiumFeatures();

  // Vérifier les permissions
  let hasAccess = true;

  if (requirePremium) {
    if (userType === 'employer') {
      hasAccess = isEmployerPremium;
    } else if (userType === 'candidate') {
      hasAccess = isCandidatePremium;
    } else {
      hasAccess = isPremium;
    }
  }

  // Vérifier une fonctionnalité spécifique
  if (feature && hasAccess) {
    hasAccess = hasFeature(feature);
  }

  // Si l'utilisateur a accès, afficher le contenu
  if (hasAccess) {
    return <>{children}</>;
  }

  // Si un fallback personnalisé est fourni
  if (fallback) {
    return <>{fallback}</>;
  }

  // Affichage par défaut de mise à niveau si showUpgrade est true
  if (showUpgrade) {
    return (
      <div className="relative">
        {/* Contenu flouté en arrière-plan */}
        <div className="filter blur-sm opacity-50 pointer-events-none">
          {children}
        </div>
        
        {/* Overlay Premium */}
        <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-xl border-2 border-dashed border-yellow-400">
          <div className="text-center p-6 max-w-sm">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Crown className="h-8 w-8 text-white" />
            </div>
            
            <h3 className="font-bold text-gray-900 mb-2 text-lg">
              Fonctionnalité Premium
            </h3>
            
            <p className="text-gray-600 mb-4 text-sm leading-relaxed">
              {upgradeText}
            </p>
            
            <div className="space-y-2">
              <PremiumButton 
                action="upgrade"
                onClick={() => console.log('Upgrade clicked')} // TODO: Implémenter navigation vers upgrade
                size="md"
              >
                ✨ Passer Premium ✨
              </PremiumButton>
              
              <div className="flex items-center justify-center text-xs text-gray-500 mt-2">
                <Star className="h-3 w-3 mr-1" />
                <span>Débloquez toutes les fonctionnalités</span>
                <Star className="h-3 w-3 ml-1" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si showUpgrade est false, ne rien afficher
  return null;
};

export default PremiumGuard;