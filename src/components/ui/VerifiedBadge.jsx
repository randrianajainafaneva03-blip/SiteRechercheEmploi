import React from 'react';
import { CheckCircle, Shield, Award, X, AlertTriangle } from 'lucide-react';

const VerifiedBadge = ({ 
  size = 'default', 
  position = 'bottom-right',
  variant = 'blue',
  showTooltip = true,
  showText = false, // Nouveau prop pour afficher le texte
  className = '',
  isVerified
}) => {
  const sizeClasses = {
    tiny: 'w-3 h-3',
    small: 'w-4 h-4',
    default: 'w-5 h-5',
    medium: 'w-6 h-6',
    large: 'w-8 h-8'
  };

  const positionClasses = {
    'bottom-right': 'absolute -bottom-0.5 -right-0.5',
    'bottom-left': 'absolute -bottom-0.5 -left-0.5',
    'top-right': 'absolute -top-0.5 -right-0.5',
    'top-left': 'absolute -top-0.5 -left-0.5'
  };

  const variantStyles = {
    blue: 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-blue-500/50',
    gold: 'bg-gradient-to-r from-yellow-400 to-amber-500 shadow-yellow-500/50',
    green: 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-green-500/50',
    purple: 'bg-gradient-to-r from-purple-500 to-violet-600 shadow-purple-500/50'
  };

  const unverifiedStyle = 'bg-gradient-to-r from-red-500 to-red-600 shadow-red-500/50';

  const iconSize = {
    tiny: 10,
    small: 12,
    default: 14,
    medium: 16,
    large: 20
  };

  // Vérification robuste
  const isActuallyVerified = isVerified === true || isVerified === 1 || isVerified === "true";
  
  const backgroundStyle = isActuallyVerified ? variantStyles[variant] : unverifiedStyle;
  const tooltipText = isActuallyVerified ? "Profil Vérifié" : "Profil non vérifié!";
  const tooltipIcon = isActuallyVerified ? Shield : AlertTriangle;
  const badgeIcon = isActuallyVerified ? CheckCircle : X;

  // Si showText est true, on retourne le badge avec texte à côté
  if (showText) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div 
          className={`
            ${sizeClasses[size]}
            ${backgroundStyle}
            rounded-full flex items-center justify-center
            shadow-lg border-2 border-white
            transform transition-all duration-300
            hover:scale-110 hover:rotate-12
            z-20 group relative
          `}
          title={showTooltip ? tooltipText : undefined}
        >
          {React.createElement(badgeIcon, {
            className: "text-white drop-shadow-sm",
            size: iconSize[size],
            strokeWidth: 3
          })}
          
          <div className="absolute inset-0 rounded-full bg-white/30 animate-pulse" />
        </div>
        
        <span className={`font-medium text-sm ${
          isActuallyVerified ? 'text-green-600' : 'text-red-600'
        }`}>
          {isActuallyVerified ? 'Vérifié(e)' : 'Non vérifié'}
        </span>
      </div>
    );
  }

  // Sinon, badge normal avec tooltip
  return (
    <div 
      className={`
        ${positionClasses[position]}
        ${sizeClasses[size]}
        ${backgroundStyle}
        rounded-full flex items-center justify-center
        shadow-lg border-2 border-white
        transform transition-all duration-300
        hover:scale-110 hover:rotate-12
        z-20 group relative
        ${className}
      `}
      title={showTooltip ? tooltipText : undefined}
    >
      {React.createElement(badgeIcon, {
        className: "text-white drop-shadow-sm",
        size: iconSize[size],
        strokeWidth: 3
      })}
      
      <div className="absolute inset-0 rounded-full bg-white/30 animate-pulse" />
      
      {showTooltip && (
  <div 
    className="absolute pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
    style={{ 
      zIndex: 999999,
      top: '100%',
      left: '50%',
      transform: 'translate(-50%, 8px)',
      marginTop: '8px'
    }}
  >
    <div className="bg-gray-900 text-xs px-2 py-1 rounded-lg whitespace-nowrap shadow-2xl border border-gray-700">
      <div className={`flex items-center space-x-2 text-white bg-blue-600 text-sm rounded-xl p-3 ${
        isActuallyVerified ? 'bg-blue-600' : 'bg-job-brown'
      }`}>
        {React.createElement(tooltipIcon, { className: "w-4 h-4 flex-shrink-0" })}
        <span className="font-medium">
          {isActuallyVerified ? 'Profil Vérifié(e)' : 'Non vérifié(e)'}
        </span>
      </div>
      <div 
        className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1"
        style={{ zIndex: 999999 }}
      >
        <div className="border-4 border-transparent border-b-gray-900" />
      </div>
    </div>
  </div>
)}
    </div>
  );
};

// Reste du code AvatarWithBadge identique...
export const AvatarWithBadge = ({ 
  src, 
  alt, 
  name, 
  isVerified = false,
  isPremium = false,
  size = 'medium',
  className = '',
  badgePosition = 'bottom-right',
  showBadgeAlways = true
}) => {
  // Code identique à avant...
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-16 h-16',
    xlarge: 'w-24 h-24',
    xxlarge: 'w-32 h-32'
  };

  const badgeSizeMap = {
    small: 'tiny',
    medium: 'small',
    large: 'default',
    xlarge: 'medium',
    xxlarge: 'large'
  };

  const getInitials = (fullName) => {
    if (!fullName) return '?';
    return fullName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isActuallyVerified = isVerified === true || isVerified === 1 || isVerified === "true";

  return (
    <div className={`relative inline-block ${className}`}>
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300`}>
        {src ? (
          <img 
            src={src} 
            alt={alt || name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-job-purple to-job-pink flex items-center justify-center text-white font-bold">
            {getInitials(name)}
          </div>
        )}
      </div>
      
      {(showBadgeAlways || isActuallyVerified) && (
        <VerifiedBadge 
          size={badgeSizeMap[size]}
          position={badgePosition}
          variant={isPremium ? 'gold' : 'blue'}
          isVerified={isVerified}
        />
      )}
    </div>
  );
};

export default VerifiedBadge;