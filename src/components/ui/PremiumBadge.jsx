import React from 'react';
import { Crown, CheckCircle, Star, Zap, Diamond } from 'lucide-react';

const PremiumBadge = ({ 
  type = 'premium', 
  size = 'md',
  className = '' 
}) => {
  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const badges = {
    premium: {
      icon: Crown,
      text: 'Premium',
      className: 'bg-gradient-to-br from-job-purple to-job-pink text-white border-2 border-yellow-300 animate-pulse',
      iconColor: 'text-yellow-900'
    },
    verified: {
      icon: CheckCircle,
      text: 'Vérifié',
      className: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border border-blue-400',
      iconColor: 'text-blue-100'
    },
    featured: {
      icon: Star,
      text: 'À la une',
      className: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border border-purple-400',
      iconColor: 'text-purple-100'
    },
    sponsored: {
      icon: Zap,
      text: 'Sponsorisé',
      className: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border border-green-400',
      iconColor: 'text-green-100'
    },
  };

  const badge = badges[type] || badges.premium;
  const Icon = badge.icon;

  return (
    <div className={`
      inline-flex items-center rounded-full font-bold shadow-lg
      ${sizes[size]} 
      ${badge.className}
      ${className}
    `}>
      <Icon className={`h-4 w-4 mr-1.5 ${badge.iconColor}`} />
      <span>{badge.text}</span>
      {type === 'premium' && <Star className="h-3 w-3 ml-1.5 text-yellow-900" />}
    </div>
  );
};

export default PremiumBadge;