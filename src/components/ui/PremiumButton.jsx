import React from 'react';
import { 
  Rocket, 
  Star, 
  Mail, 
  Eye, 
  MessageCircle, 
  Zap,
  Crown,
  ArrowUp,
  Phone
} from 'lucide-react';

const PremiumButton = ({ 
  action, 
  onClick, 
  disabled = false,
  size = 'md',
  variant = 'primary',
  children,
  className = ''
}) => {
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const actions = {
    'boost': {
      icon: Rocket,
      text: 'Booster',
      className: 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl',
      iconColor: 'text-white'
    },
    'feature': {
      icon: Star,
      text: 'Mettre en avant',
      className: 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl',
      iconColor: 'text-white'
    },
    'contact': {
      icon: Mail,
      text: 'Contacter',
      className: 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl',
      iconColor: 'text-white'
    },
    'reveal': {
      icon: Eye,
      text: 'Révéler contacts',
      className: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl',
      iconColor: 'text-white'
    },
    'message': {
      icon: MessageCircle,
      text: 'Message direct',
      className: 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl',
      iconColor: 'text-white'
    },
    'upgrade': {
      icon: Crown,
      text: 'Passer Premium',
      className: 'bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 hover:from-yellow-500 hover:via-amber-600 hover:to-orange-600 text-black font-bold shadow-lg hover:shadow-xl border-2 border-yellow-300',
      iconColor: 'text-yellow-900'
    }
  };

  const variants = {
    primary: '',
    secondary: 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg',
    outline: 'bg-transparent border-2 text-current hover:bg-current hover:text-white shadow-md hover:shadow-lg'
  };

  const actionConfig = actions[action] || actions.upgrade;
  const Icon = actionConfig.icon;
  const buttonText = children || actionConfig.text;
  
  const baseClassName = variant === 'primary' ? actionConfig.className : variants[variant];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center rounded-xl font-semibold
        transition-all duration-300 transform hover:scale-105
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${sizes[size]}
        ${baseClassName}
        ${className}
      `}
    >
      <Icon className={`h-4 w-4 mr-2 ${variant === 'primary' ? actionConfig.iconColor : 'current'}`} />
      <span>{buttonText}</span>
      {action === 'boost' && <ArrowUp className="h-3 w-3 ml-1" />}
      {action === 'upgrade' && <Crown className="h-3 w-3 ml-1 text-yellow-900" />}
    </button>
  );
};

export default PremiumButton;