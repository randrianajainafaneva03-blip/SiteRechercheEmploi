import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { account } from '@/lib/appwrite';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        variant: "destructive",
        title: "Email requis",
        description: "Veuillez entrer votre adresse email",
      });
      return;
    }

    setLoading(true);

    try {
      // URL de redirection après réinitialisation
      const resetUrl = `${window.location.origin}/reset-password`;
      
      console.log('📧 Envoi email de réinitialisation à:', email);
      console.log('🔗 URL de redirection:', resetUrl);
      
      // Appwrite createRecovery
      await account.createRecovery(
        email.trim(),
        resetUrl
      );
      
      console.log('✅ Email de réinitialisation envoyé !');
      
      setEmailSent(true);
      
      toast({
        title: "Email envoyé !",
        description: "Vérifiez votre boîte mail pour réinitialiser votre mot de passe",
      });
      
    } catch (error: any) {
      console.error('❌ Erreur:', error);
      
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible d'envoyer l'email de réinitialisation",
      });
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </div>

            {/* Success Message */}
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Email envoyé !</h2>
              <p className="text-gray-600">
                Un email de réinitialisation a été envoyé à <strong>{email}</strong>
              </p>
              <p className="text-sm text-gray-500">
                Cliquez sur le lien dans l'email pour réinitialiser votre mot de passe. 
                Le lien est valide pendant 1 heure.
              </p>
            </div>

            {/* Actions */}
            <div className="mt-8 space-y-3">
              <Button
                onClick={() => navigate('/login')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Retour à la connexion
              </Button>
              
              <button
                onClick={() => setEmailSent(false)}
                className="w-full text-sm text-blue-600 hover:text-blue-700 transition-colors"
              >
                Renvoyer l'email
              </button>
            </div>

            {/* Note */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700">
                <strong>💡 Conseil :</strong> Vérifiez également votre dossier spam/courrier indésirable
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Mail className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Mot de passe oublié ?</h2>
            <p className="mt-2 text-gray-600">
              Entrez votre email pour recevoir un lien de réinitialisation
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Adresse email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-lg font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Envoi en cours...
                </div>
              ) : (
                'Envoyer le lien de réinitialisation'
              )}
            </Button>

            {/* Back to Login */}
            <Link
              to="/login"
              className="flex items-center justify-center text-sm text-gray-600 hover:text-gray-900 transition-colors mt-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à la connexion
            </Link>
          </form>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">
              <strong>ℹ️ Note :</strong> Si vous avez créé votre compte avec Google, 
              utilisez la connexion Google directement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;