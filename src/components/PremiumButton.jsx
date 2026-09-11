import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Crown, Sparkles } from 'lucide-react';

const PremiumButton = ({ 
  className = "", 
  children = "Passer au Premium",
  variant = "default" // "default", "compact", "floating"
}) => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const handlePremiumClick = () => {
    // Si pas connecté, rediriger vers login
    if (!user) {
      navigate('/login');
      return;
    }

    // Si connecté, vérifier le type d'utilisateur
    const userType = profile?.user_type;
    
    if (userType === 'employer' || userType === 'recruiter') {
      // Recruteur -> ancienne page premium
      navigate('/premium');
    } else if (userType === 'candidate') {
      // Candidat -> nouvelle page premium candidat
      navigate('/candidate-premium');
    } else {
      // Type d'utilisateur non défini, par défaut candidat
      navigate('/candidate-premium');
    }
  };

  // Variantes de style
  const variants = {
    default: "group relative px-6 py-3 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-white font-bold rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl overflow-hidden",
    compact: "inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200",
    floating: "fixed bottom-6 right-6 z-50 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 animate-bounce"
  };

  return (
    <button
      onClick={handlePremiumClick}
      className={`${variants[variant]} ${className}`}
    >
      {variant === "floating" ? (
        <Crown className="h-6 w-6" />
      ) : (
        <>
          {/* Effet de brillance animé */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
          
          <span className="relative z-10 flex items-center justify-center">
            <Crown className="h-5 w-5 mr-2" />
            {children}
            <Sparkles className="h-4 w-4 ml-2 animate-pulse" />
          </span>
        </>
      )}
    </button>
  );
};

export default PremiumButton;