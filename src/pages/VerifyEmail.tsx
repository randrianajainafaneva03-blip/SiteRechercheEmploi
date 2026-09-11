import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { MailCheck, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { account } from '@/lib/appwrite';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const navigate = useNavigate();

  const userId = searchParams.get('userId');
  const secret = searchParams.get('secret');

  useEffect(() => {
    if (!userId || !secret) {
      setStatus('error');
      return;
    }

    account.updateVerification(userId, secret)
      .then(() => {
        setStatus('success');
        setTimeout(() => {
          navigate('/login', {
            state: { message: 'Email vérifié ! Vous pouvez maintenant vous connecter.' },
          });
        }, 3000);
      })
      .catch((error) => {
        console.error('❌ Erreur vérification email:', error);
        setStatus('error');
      });
  }, [userId, secret, navigate]);

  if (status === 'verifying') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center">
                <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Vérification en cours...</h2>
            <p className="text-gray-600">Merci de patienter quelques instants.</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
                <MailCheck className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Email vérifié !</h2>
            <p className="text-gray-600 mb-6">
              Votre adresse email a été confirmée avec succès. Redirection vers la connexion...
            </p>
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="h-12 w-12 text-red-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Lien invalide ou expiré</h2>
          <p className="text-gray-600 mb-6">
            Ce lien de vérification n'est plus valide. Connecte-toi à ton compte pour en demander un nouveau.
          </p>
          <Button
            onClick={() => navigate('/login')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Aller à la connexion
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
