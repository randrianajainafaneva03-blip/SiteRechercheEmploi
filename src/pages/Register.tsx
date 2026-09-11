import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, Mail, Lock, Eye, EyeOff, UserPlus, Briefcase, Users, 
  AlertCircle, CheckCircle, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMutation, useQuery } from '@tanstack/react-query';
import { authService, databases, DATABASE_ID, COLLECTIONS, account, ID } from '@/lib/appwrite';
import { Query } from 'appwrite';
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
    
    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    
    const params = {
      client_id: GOOGLE_CONFIG.clientId,
      redirect_uri: GOOGLE_CONFIG.redirectUri,
      response_type: 'code',
      scope: GOOGLE_CONFIG.scope,
      state: JSON.stringify({ type, timestamp: Date.now() }),
      access_type: 'offline',
      prompt: 'consent'
    };
    
    Object.entries(params).forEach(([key, value]) => {
      googleAuthUrl.searchParams.set(key, value);
    });
    
   
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

interface UserData {
  full_name: string;
  user_type: string;
  company_name: string;
  company_category: string;
  company_address: string;
  company_headquarters: string;
  phone: string;
  website_url: string;
}

interface SignUpData {
  email: string;
  password: string;
  userData: UserData;
}

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

const Register = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    user_type: 'candidate',
    company_name: '',
    company_category: '',
    company_address: '',
    company_headquarters: '',
    phone: '',
    website_url: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailCheckDebounce, setEmailCheckDebounce] = useState('');
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const navigate = useNavigate();

  // ✅ FONCTION POUR ENVOYER EMAIL DE VÉRIFICATION
  const sendVerificationEmail = async () => {
    try {
     
      const verification = await account.createVerification(
        `${window.location.origin}/verify-email`
      );
  
      return true;
    } catch (error) {
      console.error('❌ Erreur envoi email:', error);
      return false;
    }
  };

  // ✅ HOOK INSCRIPTION CORRIGÉ
  const signUpMutation = useMutation({
    mutationFn: async (data: SignUpData) => {
      
     
      
      try {
        // 1. Créer le compte utilisateur
       
        const authResult = await authService.signUp(
          data.email, 
          data.password, 
          { full_name: data.userData.full_name }
        );
        
        
        
        if (authResult.error) {
          throw new Error(authResult.error.message || 'Erreur lors de la création du compte');
        }

        // Extraire l'utilisateur
        let user;
        if (authResult.data?.user) {
          user = authResult.data.user;
        } else if (authResult.data?.session?.userId) {
          user = { $id: authResult.data.session.userId };
        } else {
          throw new Error('Impossible de récupérer les informations utilisateur');
        }
        
        
        
        if (!user || !user.$id) {
          throw new Error('ID utilisateur manquant');
        }

        // ✅ 2. CRÉER LE PROFIL AVANT DE DÉCONNECTER
        
        
        const profileData: any = {
          full_name: data.userData.full_name,
          email: data.email,
          user_type: data.userData.user_type,  // ✅ CRITIQUE
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          onboarding_completed: true
        };

        // Ajouter les données entreprise si employeur
        if (data.userData.user_type === 'employer') {
          profileData.company_name = data.userData.company_name || null;
          profileData.company_category = data.userData.company_category || null;
          profileData.company_address = data.userData.company_address || null;
          profileData.company_headquarters = data.userData.company_headquarters || null;
          profileData.phone = data.userData.phone || null;
          profileData.website_url = data.userData.website_url || null;
        } else {
          profileData.phone = data.userData.phone || null;
        }
        
       
        
        let profile = null;
        
        try {
          profile = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.PROFILES,
            user.$id,
            profileData
          );
          
          
          
        } catch (profileError: any) {
          console.error('❌ Erreur création profil:', profileError);
          
        }

        // ✅ 3. ENVOYER EMAIL DE VÉRIFICATION
       
        const emailSent = await sendVerificationEmail();
        
        // ✅ 4. DÉCONNECTER APRÈS CRÉATION DU PROFIL
       
        try {
          await authService.signOut();
          
        } catch (logoutError) {
          console.warn('⚠️ Erreur déconnexion (non bloquante):', logoutError);
        }
        
        return { user, profile, emailSent };
        
      } catch (error) {
        console.error('❌ Erreur générale inscription:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      
      
      const message = data.emailSent 
        ? '✅ Compte créé avec succès ! Un email de vérification a été envoyé. Vérifiez votre boîte mail puis connectez-vous.'
        : '✅ Compte créé avec succès ! Vous pouvez maintenant vous connecter.';

      toast({
        title: "Inscription réussie !",
        description: message,
      });

      navigate('/login', { 
        state: { 
          message: message,
          email: formData.email,
          emailSent: data.emailSent
        }
      });
    },
    onError: (error: any) => {
      console.error('❌ Erreur inscription finale:', error);
      toast({
        variant: "destructive",
        title: "Erreur d'inscription",
        description: error.message || "Erreur lors de la création du compte",
      });
    }
  });

  // Debounce pour la vérification d'email
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.email && formData.email.includes('@')) {
        setEmailCheckDebounce(formData.email);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.email]);

  // Vérification si l'email existe
  const { data: emailCheck, isLoading: checkingEmail } = useQuery({
    queryKey: ['check-email', emailCheckDebounce],
    queryFn: async () => {
      if (!emailCheckDebounce) return null;
      
      try {
    
        
        const profilesResponse = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.PROFILES,
          [
            Query.equal('email', emailCheckDebounce.toLowerCase()),
            Query.limit(1)
          ]
        );
        
        const exists = profilesResponse.documents.length > 0;
        
        if (exists) {
          const existingProfile = profilesResponse.documents[0];
   
          
          return { 
            exists: true, 
            userType: existingProfile.user_type 
          };
        }
        
        return { exists: false };
      } catch (error) {
        console.error('❌ Erreur vérification email:', error);
        return { exists: false };
      }
    },
    enabled: !!emailCheckDebounce,
    staleTime: 30000
  });

  const companyCategories = [
    'Technologie', 'Finance & Banque', 'Santé & Médical', 'Éducation',
    'Commerce & Retail', 'Industrie & Manufacturing', 'Construction & BTP',
    'Tourisme & Hôtellerie', 'Transport & Logistique', 'Énergie & Environnement',
    'Agriculture & Agroalimentaire', 'Médias & Communication', 'Consulting & Services', 'Autre'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.full_name.trim()) {
      return 'Le nom complet est requis';
    }
    if (!formData.email.trim()) {
      return 'L\'adresse email est requise';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return 'L\'adresse email n\'est pas valide';
    }
    if (emailCheck?.exists) {
      return 'Un compte avec cette adresse email existe déjà';
    }
    if (formData.password !== formData.confirmPassword) {
      return 'Les mots de passe ne correspondent pas';
    }
    if (formData.password.length < 6) {
      return 'Le mot de passe doit contenir au moins 6 caractères';
    }
    if (formData.user_type === 'employer') {
      if (!formData.company_name.trim()) {
        return 'Le nom de l\'entreprise est requis pour les employeurs';
      }
      if (!formData.company_category) {
        return 'La catégorie de l\'entreprise est requise';
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const error = validateForm();
    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur de validation",
        description: error,
      });
      return;
    }

    const userData: UserData = {
      full_name: formData.full_name.trim(),
      user_type: formData.user_type,
      company_name: formData.company_name.trim(),
      company_category: formData.company_category,
      company_address: formData.company_address.trim(),
      company_headquarters: formData.company_headquarters.trim(),
      phone: formData.phone.trim(),
      website_url: formData.website_url.trim()
    };

   

    signUpMutation.mutate({
      email: formData.email.toLowerCase().trim(),
      password: formData.password,
      userData
    });
  };

  const handleSocialLogin = async (provider: string) => {
    if (provider === 'google') {
      setSocialLoading(provider);
      handleGoogleOAuthManual('register');
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

  const formError = validateForm();

  return (
    <ProtectedRoute requireAuth={false} redirectIfAuth={true}>
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Créer un compte</h2>
          <p className="mt-2 text-gray-600">Rejoignez la communauté Job2mada</p>
        </div>

        {/* Connexions sociales */}
        <div className="space-y-3">
          <SocialButton
            provider="google"
            icon={<svg viewBox="0 0 24 24" className="h-5 w-5">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>}
            label="Continuer avec Google"
            onClick={() => handleSocialLogin('google')}
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

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* User Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Je suis un(e)
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.user_type === 'candidate' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="user_type"
                  value="candidate"
                  checked={formData.user_type === 'candidate'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <Users className="h-5 w-5 text-blue-600 mr-3" />
                <span className="font-medium">Candidat</span>
              </label>
              <label className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.user_type === 'employer' 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="user_type"
                  value="employer"
                  checked={formData.user_type === 'employer'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <Briefcase className="h-5 w-5 text-purple-600 mr-3" />
                <span className="font-medium">Employeur</span>
              </label>
            </div>
          </div>

          {/* Full Name */}
          <div>
           <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
             Nom complet *
           </label>
           <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <User className="h-5 w-5 text-gray-400" />
             </div>
             <input
               id="full_name"
               name="full_name"
               type="text"
               required
               value={formData.full_name}
               onChange={handleChange}
               className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
               placeholder="Votre nom complet"
             />
           </div>
         </div>

         {/* Email avec vérification */}
         <div>
           <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
             Adresse email *
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
               className={`block w-full pl-10 pr-10 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                 emailCheck?.exists ? 'border-red-300' : 'border-gray-300'
               }`}
               placeholder="votre@email.com"
             />
             <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
               {checkingEmail ? (
                 <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
               ) : emailCheck?.exists ? (
                 <AlertCircle className="h-5 w-5 text-red-500" />
               ) : formData.email && emailCheck?.exists === false ? (
                 <CheckCircle className="h-5 w-5 text-green-500" />
               ) : null}
             </div>
           </div>
           {emailCheck?.exists && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {emailCheck.userType 
                  ? `Un compte ${emailCheck.userType === 'employer' ? 'employeur' : 'candidat'} existe déjà avec cet email`
                  : 'Un compte avec cette adresse email existe déjà'
                }
              </p>
            )}
         </div>

         {/* Champs entreprise si employeur */}
         {formData.user_type === 'employer' && (
           <>
             <div>
               <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-2">
                 Nom de l'entreprise *
               </label>
               <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                   <Briefcase className="h-5 w-5 text-gray-400" />
                 </div>
                 <input
                   id="company_name"
                   name="company_name"
                   type="text"
                   required
                   value={formData.company_name}
                   onChange={handleChange}
                   className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                   placeholder="Nom de votre entreprise"
                 />
               </div>
             </div>

             <div>
               <label htmlFor="company_category" className="block text-sm font-medium text-gray-700 mb-2">
                 Catégorie de l'entreprise *
               </label>
               <select
                 id="company_category"
                 name="company_category"
                 required
                 value={formData.company_category}
                 onChange={handleChange}
                 className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
               >
                 <option value="">Sélectionnez une catégorie</option>
                 {companyCategories.map(category => (
                   <option key={category} value={category}>{category}</option>
                 ))}
               </select>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                 <label htmlFor="company_address" className="block text-sm font-medium text-gray-700 mb-2">
                   Adresse de l'entreprise
                 </label>
                 <input
                   id="company_address"
                   name="company_address"
                   type="text"
                   value={formData.company_address}
                   onChange={handleChange}
                   className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                   placeholder="Adresse complète"
                 />
               </div>

               <div>
                 <label htmlFor="company_headquarters" className="block text-sm font-medium text-gray-700 mb-2">
                   Siège social
                 </label>
                 <input
                   id="company_headquarters"
                   name="company_headquarters"
                   type="text"
                   value={formData.company_headquarters}
                   onChange={handleChange}
                   className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                   placeholder="Ville du siège"
                 />
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                 <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                   Téléphone
                 </label>
                 <input
                   id="phone"
                   name="phone"
                   type="tel"
                   value={formData.phone}
                   onChange={handleChange}
                   className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                   placeholder="+261 XX XX XXX XX"
                 />
               </div>

               <div>
                 <label htmlFor="website_url" className="block text-sm font-medium text-gray-700 mb-2">
                   Site web
                 </label>
                 <input
                   id="website_url"
                   name="website_url"
                   type="url"
                   value={formData.website_url}
                   onChange={handleChange}
                   className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                   placeholder="https://www.entreprise.com"
                 />
               </div>
             </div>
           </>
         )}

         {/* Mot de passe */}
         <div>
           <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
             Mot de passe *
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
               placeholder="Minimum 6 caractères"
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

        {/* Confirmer mot de passe */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Confirmer le mot de passe *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Confirmez votre mot de passe"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {(formError || signUpMutation.error) && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {formError || (signUpMutation.error as any)?.message || 'Erreur lors de la création du compte'}
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={signUpMutation.isPending || !!formError || checkingEmail || socialLoading !== null}
          className="w-full py-3 text-lg font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {signUpMutation.isPending ? (
            <div className="flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Création en cours...
            </div>
          ) : (
            'Créer mon compte'
          )}
        </Button>

        {/* Terms and Privacy */}
        <div className="text-center text-sm text-gray-600">
          En créant un compte, vous acceptez nos{' '}
          <Link to="/terms" className="text-blue-600 hover:underline">
            Conditions d'utilisation
          </Link>
          {' '}et notre{' '}
          <Link to="/privacy" className="text-blue-600 hover:underline">
            Politique de confidentialité
          </Link>
        </div>

        {/* Sign in link */}
        <div className="text-center">
          <p className="text-gray-600">
            Déjà un compte ?{' '}
            <Link 
              to="/login" 
              className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </form>
    </div>
  </div>
  </ProtectedRoute>
);
};

export default Register;