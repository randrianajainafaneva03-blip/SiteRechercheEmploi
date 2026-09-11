import React, { useState, useEffect  } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Mail, Lock, Eye, EyeOff, LogIn, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// ═══════════════════════════════════════════════════════════════════
// CONFIGURATION GOOGLE OAUTH MANUEL
// ═══════════════════════════════════════════════════════════════════

const GOOGLE_CONFIG = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
  redirectUri: window.location.origin + '/auth/google-callback',
  scope: 'openid email profile'
};

// ═══════════════════════════════════════════════════════════════════
// FONCTION OAUTH GOOGLE MANUEL
// ═══════════════════════════════════════════════════════════════════

const handleGoogleOAuthManual = (type: 'login' | 'register') => {
  try {
    console.log(`🔗 OAuth Google manuel - ${type}`);
    
    // Construire l'URL Google OAuth
    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    
    // Paramètres OAuth
    const params = {
      client_id: GOOGLE_CONFIG.clientId,
      redirect_uri: GOOGLE_CONFIG.redirectUri,
      response_type: 'code',
      scope: GOOGLE_CONFIG.scope,
      state: JSON.stringify({ type, timestamp: Date.now() }),
      access_type: 'offline',
      prompt: 'consent'
    };
    
    // Ajouter les paramètres à l'URL
    Object.entries(params).forEach(([key, value]) => {
      googleAuthUrl.searchParams.set(key, value);
    });
    
    console.log('🚀 Redirection vers Google:', googleAuthUrl.toString());
    
    // Rediriger vers Google
    window.location.href = googleAuthUrl.toString();
    
  } catch (error: any) {
    console.error('❌ Erreur OAuth Google:', error);
    toast({
      variant: "destructive",
      title: "Erreur",
      description: "Erreur lors de la connexion Google"
    });
  }
};

// Composant pour les boutons sociaux
const SocialButton = ({ provider, icon, label, onClick, loading, className }: {
  provider: string;
  icon: React.ReactElement;
  label: string;
  onClick: (provider: string) => void;
  loading: boolean;
  className: string;
}) => (
  <button
    type="button"
    onClick={() => onClick(provider)}
    disabled={loading}
    className={`w-full flex items-center justify-center gap-3 px-4 py-3 border rounded-lg shadow-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-50 ${className}`}
  >
    {React.cloneElement(icon, { className: "h-5 w-5" })}
    <span>{label}</span>
    {loading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
  </button>
);

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signIn, authLoading } = useAuth();

  const message = location.state?.message;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // ✅ FONCTION DE CONNEXION CORRIGÉE
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast({
        variant: "destructive",
        title: "Champs requis",
        description: "Veuillez remplir tous les champs",
      });
      return;
    }

    setLoading(true);

    try {
      console.log('🚀 Début de la connexion...');
      
      // ✅ UTILISER DIRECTEMENT signIn du contexte
      const result = await signIn(formData.email.trim(), formData.password);
      
      console.log('📨 Résultat de la connexion:', result);
      
      if (result && result.success && result.user) {
        console.log('✅ Connexion réussie, utilisateur:', result.user);
        
        toast({
          title: "Connexion réussie !",
          description: "Bienvenue sur Job2mada",
        });
        
        // ✅ ATTENDRE QUE LE PROFIL SOIT CHARGÉ
        if (result.profile) {
          const redirectTo = result.profile.user_type === 'employer' ? '/dashboard' : '/jobs';
          console.log('🎯 Redirection immédiate vers:', redirectTo);
          navigate(redirectTo, { replace: true });
        } else {
          // Si pas de profil encore, attendre un peu et réessayer
          console.log('⏳ Profil pas encore chargé, attente...');
          setTimeout(() => {
            const storedProfile = JSON.parse(localStorage.getItem('user_profile') || 'null');
            if (storedProfile?.user_type) {
              const redirectTo = storedProfile.user_type === 'employer' ? '/dashboard' : '/jobs';
              console.log('🎯 Redirection différée vers:', redirectTo);
              navigate(redirectTo, { replace: true });
            } else {
              console.log('🔄 Actualisation forcée - profil non trouvé');
              window.location.reload();
            }
          }, 1500);
        }
      } else if (result?.error) {
        console.error('❌ Erreur de connexion:', result.error);
        toast({
          variant: "destructive",
          title: "Erreur de connexion",
          description: result.error.message || "Vérifiez vos identifiants et réessayez",
        });
      }
    } catch (error: any) {
      console.error('❌ Erreur inattendue:', error);
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: error.message || "Une erreur inattendue s'est produite",
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ CONNEXION SOCIALE CORRIGÉE - OAUTH MANUEL
  const handleSocialLogin = async (provider: string) => {
    if (provider === 'google') {
      setSocialLoading(provider);
      handleGoogleOAuthManual('login');
    } else if (provider === 'github') {
      setSocialLoading(provider);
      toast({
        variant: "destructive",
        title: "Non disponible",
        description: "GitHub OAuth sera disponible prochainement"
      });
      setSocialLoading(null);
    } else {
      toast({
        variant: "destructive",
        title: "Non disponible", 
        description: "Seul Google OAuth est disponible pour l'instant"
      });
    }
  };

  return (
    <ProtectedRoute requireAuth={false} redirectIfAuth={true}>
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-no-repeat py-12 px-4 sm:px-6 lg:px-8"
      style={{
        backgroundImage:
          "linear-gradient(135deg, rgba(20,16,8,0.72), rgba(212,175,55,0.5)), url('/hero-image.png')",
        backgroundPosition: 'center 15%',
      }}
    >
      <div className="max-w-md w-full space-y-8 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 md:p-10 relative">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <LogIn className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Connexion</h2>
          <p className="mt-2 text-gray-600">Connectez-vous à votre compte Job2mada</p>
        </div>

        {/* Success Message */}
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            {message}
          </div>
        )}

        {/* Connexions sociales */}
        <div className="space-y-3">
          {/* Google Button */}
          <SocialButton
            provider="google"
            icon={<svg viewBox="0 0 24 24" className="h-5 w-5">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>}
            label="Continuer avec Google"
            onClick={handleSocialLogin}
            loading={socialLoading === 'google'}
            className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500"
          />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Ou avec votre email</span>
            </div>
          </div>
        </div>

        {/* Form classique */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email */}
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
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Votre mot de passe"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading || authLoading || socialLoading !== null}
            className="w-full py-3 text-lg font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading || authLoading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Connexion en cours...
              </div>
            ) : (
              'Se connecter'
            )}
          </Button>

          {/* Links */}
          <div className="flex items-center justify-between text-sm">
            <Link 
              to="/forgot-password" 
              className="text-blue-600 hover:text-blue-700 transition-colors"
            >
              Mot de passe oublié ?
            </Link>
          </div>

          {/* Sign up link */}
          <div className="text-center">
            <p className="text-gray-600">
              Pas encore de compte ?{' '}
              <Link 
                to="/register" 
                className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Créer un compte
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
    </ProtectedRoute>
  );
};

export default Login;