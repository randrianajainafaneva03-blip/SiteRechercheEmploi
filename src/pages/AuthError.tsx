// Créer : src/pages/AuthError.tsx

import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AuthError = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type'); // 'login' ou 'register'
  const error = searchParams.get('error') || 'Erreur inconnue';

  useEffect(() => {
    // Redirection automatique après 10 secondes
    const timer = setTimeout(() => {
      navigate(type === 'register' ? '/register' : '/login');
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigate, type]);

  const handleGoBack = () => {
    navigate(type === 'register' ? '/register' : '/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Erreur de connexion
        </h2>
        
        <p className="text-gray-600 mb-6">
          Une erreur s'est produite lors de la connexion avec votre compte social.
        </p>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-700">
            <strong>Détail :</strong> {error}
          </p>
        </div>
        
        <div className="space-y-4">
          <Button
            onClick={handleGoBack}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retourner à la {type === 'register' ? 'création de compte' : 'connexion'}
          </Button>
          
          <p className="text-xs text-gray-500">
            Redirection automatique dans 10 secondes...
          </p>
        </div>
        
        <div className="mt-6 text-sm text-gray-600">
          <p className="mb-2"><strong>Conseils :</strong></p>
          <ul className="text-left space-y-1">
            <li>• Vérifiez que vous avez autorisé l'application</li>
            <li>• Essayez de vider le cache de votre navigateur</li>
            <li>• Tentez la connexion avec email/mot de passe</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AuthError;