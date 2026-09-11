import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const ProtectedRoute = ({ 
  children, 
  requireAuth = true, 
  redirectIfAuth = false,
  isPublic = false
}) => {
  const { user, profile, loading, isAuthReady } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ Pages publiques = Rendu immédiat SANS vérifications
    if (isPublic) {
      return;
    }

    // Attendre que l'auth soit prête
    if (!isAuthReady || loading) {
      return;
    }

    // Pages de connexion - Rediriger si déjà connecté
    if (redirectIfAuth && user && profile?.user_type) {
      const redirectUrl = profile.user_type === 'employer' ? '/dashboard' : '/jobs';
      navigate(redirectUrl, { replace: true });
      return;
    }

    // Pages protégées - Rediriger si non connecté
    if (requireAuth && !user) {
      navigate('/login', { replace: true });
      return;
    }

    // Utilisateur sans type - Rediriger vers sélection
    if (requireAuth && user && profile && !profile.user_type) {
      navigate('/user-type-selection', { replace: true });
      return;
    }

  }, [user, profile?.user_type, loading, isAuthReady, requireAuth, redirectIfAuth, isPublic, navigate]);

  // ✅ CRITIQUE : Rendu IMMÉDIAT pour pages publiques
  if (isPublic) {
    return <>{children}</>;
  }

  // Loader pour pages protégées seulement
  if (loading || !isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};