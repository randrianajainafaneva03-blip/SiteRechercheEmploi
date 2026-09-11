import React, { useEffect, useState } from 'react';
import { MessageSquare, TrendingUp, Calendar, Crown, ArrowUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuotaIndicator = ({ quota, onRefresh }) => {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ✅ RAFRAÎCHISSEMENT AUTOMATIQUE TOUTES LES 2 SECONDES
  useEffect(() => {
    if (!quota || !onRefresh) return;
    
    const interval = setInterval(async () => {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }, 2000); // Toutes les 2 secondes

    return () => clearInterval(interval);
  }, [quota, onRefresh]);

  if (!quota || quota.messages_quota === 0) return null;

  const used = quota.messages_used || 0;
  const total = quota.messages_quota || 0;
  const remaining = total - used;
  const percentageUsed = total > 0 ? (used / total) * 100 : 0;

  // Couleur de la barre selon l'utilisation
  const getProgressColor = () => {
    if (percentageUsed < 80) return 'bg-green-500';
    if (percentageUsed < 100) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getTextColor = () => {
    if (percentageUsed < 80) return 'text-green-700';
    if (percentageUsed < 100) return 'text-orange-700';
    return 'text-red-700';
  };

  const getBgColor = () => {
    if (percentageUsed < 80) return 'bg-green-50 border-green-200';
    if (percentageUsed < 100) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className={`rounded-2xl p-4 border-2 ${getBgColor()} transition-all duration-300 ${isRefreshing ? 'opacity-70' : 'opacity-100'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <MessageSquare className={`h-5 w-5 ${getTextColor()}`} />
          <h3 className={`font-bold ${getTextColor()}`}>
            Quota de conversations
          </h3>
        </div>
        {isRefreshing && (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
        )}
      </div>

      {/* Barre de progression */}
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Utilisé</span>
          <span className={`font-bold ${getTextColor()}`}>
            {used} / {total}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className={`${getProgressColor()} h-full rounded-full transition-all duration-500 ease-out`}
            style={{ width: `${Math.min(percentageUsed, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Message selon le statut */}
      {remaining > 0 ? (
        <div className="space-y-2">
          <p className={`text-sm font-medium ${getTextColor()}`}>
            💬 Vous pouvez contacter <strong>{remaining}</strong> personne{remaining > 1 ? 's' : ''} supplémentaire{remaining > 1 ? 's' : ''}
          </p>
          <p className="text-xs text-gray-600">
            💡 Messages illimités dans chaque conversation • Gratuit
          </p>
          {quota.reset_date && (
            <p className="text-xs text-gray-500 flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              Renouvellement : {new Date(quota.reset_date).toLocaleDateString('fr-FR')}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm font-bold text-red-700">
            🚫 Quota épuisé ! Passez au plan supérieur pour contacter plus de personnes.
          </p>
          <button
            onClick={() => navigate('/pricing')}
            className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold py-2 px-4 rounded-lg hover:from-red-600 hover:to-pink-600 transition-all flex items-center justify-center space-x-2"
          >
            <Crown className="h-4 w-4" />
            <span>Augmenter mon quota</span>
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default QuotaIndicator;