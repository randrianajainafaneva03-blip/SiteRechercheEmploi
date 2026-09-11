// src/components/Premium/PremiumGuard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePremium } from '@/hooks/usePremium';
import { useAuth } from '@/contexts/AuthContext';
import { Crown, Lock, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const PremiumGuard = ({ 
  children, 
  feature, 
  fallback = null,
  showUpgradePrompt = true 
}) => {
  const { hasFeature, isPremium, loading } = usePremium();
  const { isEmployer } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-job-gold border-t-transparent"></div>
      </div>
    );
  }

  // Si l'utilisateur a accès à la fonctionnalité
  if (hasFeature(feature)) {
    return children;
  }

  // Si un fallback personnalisé est fourni
  if (fallback) {
    return fallback;
  }

  // Si on ne doit pas afficher le prompt d'upgrade
  if (!showUpgradePrompt) {
    return null;
  }

  // Prompt d'upgrade par défaut
  return (
    <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-50 rounded-2xl p-6 border-2 border-yellow-300">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Crown className="h-8 w-8 text-white" />
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Fonctionnalité Premium
        </h3>
        
        <p className="text-gray-600 mb-6">
          Cette fonctionnalité est réservée aux membres Premium. 
          Passez au Premium pour débloquer tous les avantages !
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div className="flex items-center text-sm text-gray-600">
            <Star className="h-4 w-4 text-yellow-500 mr-2" />
            <span>Offres à la une</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Star className="h-4 w-4 text-yellow-500 mr-2" />
            <span>Contact direct candidats</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Star className="h-4 w-4 text-yellow-500 mr-2" />
            <span>Télécharger CV</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Star className="h-4 w-4 text-yellow-500 mr-2" />
            <span>Support prioritaire</span>
          </div>
        </div>

        <Button
          onClick={() => navigate('/premium')}
          className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold px-6 py-3"
        >
          Passer au Premium
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};