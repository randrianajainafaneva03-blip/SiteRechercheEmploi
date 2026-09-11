// src/components/Premium/PremiumBadge.jsx
import React from 'react';
import { Crown, Star, Sparkles } from 'lucide-react';
import { usePremium } from '@/hooks/usePremium';

export const PremiumBadge = ({ size = 'md', showText = true }) => {
  const { isPremium, premiumType } = usePremium();

  if (!isPremium) return null;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const isPro = premiumType === 'premium_pro';
  const isPlus = premiumType === 'premium_plus';

  return (
    <span className={`inline-flex items-center rounded-full font-bold ${sizeClasses[size]} ${
      isPlus 
        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
        : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
    }`}>
      {isPlus ? (
        <Sparkles className={`${iconSizes[size]} mr-1`} />
      ) : (
        <Crown className={`${iconSizes[size]} mr-1`} />
      )}
      {showText && (
        <span>
          {isPlus ? 'Premium Plus+' : 'Premium Pro'}
        </span>
      )}
    </span>
  );
};