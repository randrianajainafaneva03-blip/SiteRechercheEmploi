// src/components/Premium/PremiumFeatureButton.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePremium } from '@/hooks/usePremium';
import { Lock, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const PremiumFeatureButton = ({ 
  feature, 
  children, 
  onClick, 
  className = '',
  disabled = false,
  ...props 
}) => {
  const { hasFeature } = usePremium();
  const navigate = useNavigate();

  const hasAccess = hasFeature(feature);

  const handleClick = (e) => {
    if (!hasAccess) {
      e.preventDefault();
      navigate('/premium');
      return;
    }
    
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={disabled}
      className={`relative ${className} ${
        !hasAccess ? 'opacity-75 cursor-pointer' : ''
      }`}
      {...props}
    >
      {!hasAccess && (
        <Lock className="h-4 w-4 mr-2" />
      )}
      {children}
      {!hasAccess && (
        <Crown className="h-4 w-4 ml-2 text-yellow-300" />
      )}
    </Button>
  );
};