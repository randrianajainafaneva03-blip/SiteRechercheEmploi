// ✅ HOOK CENTRALISÉ POUR LE COMPTEUR DE MESSAGES NON LUS
// src/hooks/useUnreadCount.js

import { useState, useEffect, useCallback } from 'react';
import { databases, DATABASE_ID, Query } from '@/lib/appwrite';
import { useAuth } from '@/contexts/AuthContext';

// Système d'événements pour synchroniser tous les composants
const unreadCountListeners = new Set();

const notifyListeners = (count) => {
  unreadCountListeners.forEach(listener => listener(count));
};

export const useUnreadCount = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const loadUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      notifyListeners(0);
      return;
    }

    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        'messages',
        [
          Query.equal('receiver_id', user.$id),
          Query.isNull('read_at'), // ✅ CRUCIAL : Seulement les NON LUS
          Query.limit(100)
        ]
      );
      
      const count = response.documents.length;
      setUnreadCount(count);
      notifyListeners(count); // ✅ Notifier tous les composants
      
      console.log('📊 Compteur mis à jour:', count, 'messages non lus');
      
    } catch (error) {
      console.error('❌ Erreur compteur non lus:', error);
      setUnreadCount(0);
    }
  }, [user]);

  // ✅ Écouter les changements de tous les autres composants
  useEffect(() => {
    const listener = (count) => {
      setUnreadCount(count);
    };
    
    unreadCountListeners.add(listener);
    
    return () => {
      unreadCountListeners.delete(listener);
    };
  }, []);

  // ✅ Charger au démarrage et toutes les 30 secondes
  useEffect(() => {
    loadUnreadCount();
    
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [loadUnreadCount]);

  // ✅ Fonction pour forcer un rafraîchissement (appelée après markAsRead)
  const refreshUnreadCount = useCallback(() => {
    loadUnreadCount();
  }, [loadUnreadCount]);

  return { unreadCount, refreshUnreadCount };
};

// ✅ Fonction utilitaire pour rafraîchir depuis n'importe où
export const triggerUnreadCountRefresh = async (user) => {
  if (!user) return;

  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      'messages',
      [
        Query.equal('receiver_id', user.$id),
        Query.isNull('read_at'),
        Query.limit(100)
      ]
    );
    
    const count = response.documents.length;
    notifyListeners(count);
    console.log('🔄 Rafraîchissement manuel:', count, 'messages non lus');
    
  } catch (error) {
    console.error('❌ Erreur rafraîchissement manuel:', error);
  }
};