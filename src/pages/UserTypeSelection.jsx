// src/pages/UserTypeSelection.jsx - Version Appwrite
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Briefcase, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite'; // ✅ Appwrite

const UserTypeSelection = () => {
  const [selectedType, setSelectedType] = useState('candidate');
  const [loading, setLoading] = useState(false);
  const [showCompanyFields, setShowCompanyFields] = useState(false);
  const [companyData, setCompanyData] = useState({
    company_name: '',
    company_category: '',
    phone: ''
  });
  
  const navigate = useNavigate();
  const { user, updateProfile, forceProfileReload } = useAuth();

  const companyCategories = [
    'Technologie', 'Finance & Banque', 'Santé & Médical', 'Éducation',
    'Commerce & Retail', 'Industrie & Manufacturing', 'Construction & BTP',
    'Tourisme & Hôtellerie', 'Transport & Logistique', 'Énergie & Environnement',
    'Agriculture & Agroalimentaire', 'Médias & Communication', 'Consulting & Services', 'Autre'
  ];

  const handleTypeChange = (type) => {
    setSelectedType(type);
    setShowCompanyFields(type === 'employer');
  };

  const handleCompanyDataChange = (e) => {
    setCompanyData({
      ...companyData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      

      if (!user || !user.$id) {
        alert('Erreur: utilisateur non connecté');
        setLoading(false);
        return;
      }

      // Validation pour employeur
      if (selectedType === 'employer' && !companyData.company_name.trim()) {
        alert('Le nom de l\'entreprise est requis');
        setLoading(false);
        return;
      }

      // Préparer les données du profil
      const profileData = {
        user_type: selectedType,
        full_name: user.name || '',
        email: user.email || '',
        onboarding_completed: true,
        updated_at: new Date().toISOString()
      };

      // Ajouter les données entreprise si employeur
      if (selectedType === 'employer') {
        profileData.company_name = companyData.company_name;
        profileData.company_category = companyData.company_category;
        profileData.phone = companyData.phone;
      }

    

      // Vérifier si le profil existe déjà
      let profileExists = false;
      try {
        const existingProfile = await databases.getDocument(
          DATABASE_ID,
          COLLECTIONS.PROFILES,
          user.$id
        );
        profileExists = !!existingProfile;
     
      } catch (error) {
        if (error.code !== 404) {
          console.error('Erreur lors de la vérification du profil:', error);
        }
     
      }

      let result;
      
      if (profileExists) {
        // Mettre à jour le profil existant
      
        result = await updateProfile(profileData);
      } else {
        // Créer un nouveau profil directement avec Appwrite
        
        try {
          const newProfile = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.PROFILES,
            user.$id, // Utiliser l'ID utilisateur comme ID du document
            {
              ...profileData,
              created_at: new Date().toISOString()
            }
          );
          result = { data: newProfile, error: null };
         
        } catch (createError) {
          console.error('Erreur lors de la création du profil:', createError);
          result = { data: null, error: createError };
        }
      }
      
      if (result.error) {
        console.error('Erreur lors de la sauvegarde:', result.error);
        alert('Erreur lors de la sauvegarde du profil: ' + result.error.message);
        setLoading(false);
        return;
      }

     g('Profil sauvegardé avec succès:', result.data);

      // Forcer le rechargement du profil dans AuthContext
      try {
        await forceProfileReload();
        
      } catch (reloadError) {
        console.warn('Erreur lors du rechargement du profil:', reloadError);
        // Continuer malgré l'erreur de rechargement
      }

      // Redirection selon le type avec un délai
      const redirectUrl = selectedType === 'employer' ? '/dashboard' : '/jobs';
      
      
      setTimeout(() => {
        navigate(redirectUrl, { replace: true });
      }, 1000);
      
    } catch (error) {
      console.error('Erreur générale:', error);
      alert('Une erreur est survenue: ' + error.message);
      setLoading(false);
    }
  };

  if (!user) {
    
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-gradient-elegant rounded-xl flex items-center justify-center shadow-lg">
              <Users className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Finaliser votre profil</h2>
          <p className="mt-2 text-gray-600">
            Choisissez votre type de compte pour personnaliser votre expérience
          </p>
        </div>

        {/* User Info */}
        <div className="bg-white rounded-lg border p-4 text-center">
          <div className="flex items-center justify-center space-x-3">
            {/* Avatar depuis les prefs ou metadata */}
            {(user?.prefs?.avatar_url || user?.name) && (
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                {user.prefs?.avatar_url ? (
                  <img 
                    src={user.prefs.avatar_url} 
                    alt="Avatar" 
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <span className="text-lg">
                    {(user.name || user.email).charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900">
                {user.name || user.email}
              </p>
              <p className="text-sm text-gray-500">{user.email}</p>
              <p className="text-xs text-blue-600">ID: {user.$id}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Je suis un(e) :
            </label>
            <div className="grid grid-cols-1 gap-4">
              {/* Candidat */}
              <label className={`relative flex items-center p-6 border-2 rounded-xl cursor-pointer transition-all ${
                selectedType === 'candidate' 
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}>
                <input
                  type="radio"
                  name="user_type"
                  value="candidate"
                  checked={selectedType === 'candidate'}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="sr-only"
                />
                <Users className="h-8 w-8 text-blue-600 mr-4" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">Candidat</h3>
                  <p className="text-sm text-gray-600">
                    Je cherche un emploi et veux postuler à des offres
                  </p>
                </div>
                {selectedType === 'candidate' && (
                  <div className="ml-4">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                  </div>
                )}
              </label>

              {/* Employeur */}
              <label className={`relative flex items-center p-6 border-2 rounded-xl cursor-pointer transition-all ${
                selectedType === 'employer' 
                  ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}>
                <input
                  type="radio"
                  name="user_type"
                  value="employer"
                  checked={selectedType === 'employer'}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="sr-only"
                />
                <Briefcase className="h-8 w-8 text-purple-600 mr-4" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">Employeur</h3>
                  <p className="text-sm text-gray-600">
                    Je représente une entreprise et veux recruter des talents
                  </p>
                </div>
                {selectedType === 'employer' && (
                  <div className="ml-4">
                    <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Champs entreprise */}
          {showCompanyFields && (
            <div className="space-y-4 bg-purple-50 p-6 rounded-lg border border-purple-200">
              <h4 className="text-lg font-semibold text-purple-900 mb-4">
                Informations sur votre entreprise
              </h4>
              
              {/* Nom entreprise */}
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
                    value={companyData.company_name}
                    onChange={handleCompanyDataChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Nom de votre entreprise"
                  />
                </div>
              </div>

              {/* Catégorie */}
              <div>
                <label htmlFor="company_category" className="block text-sm font-medium text-gray-700 mb-2">
                  Secteur d'activité
                </label>
                <select
                  id="company_category"
                  name="company_category"
                  value={companyData.company_category}
                  onChange={handleCompanyDataChange}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="">Sélectionnez un secteur</option>
                  {companyCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Téléphone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone (optionnel)
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={companyData.phone}
                  onChange={handleCompanyDataChange}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="+261 XX XX XXX XX"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className={`w-full py-4 text-lg font-semibold rounded-lg transition-all ${
              selectedType === 'employer'
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Finalisation en cours...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <span>Commencer sur Job2mada</span>
                <ArrowRight className="h-5 w-5 ml-2" />
              </div>
            )}
          </Button>

          {/* Info */}
          <div className="text-center text-sm text-gray-500">
            <p>Vous pourrez modifier ces informations plus tard dans votre profil</p>
          </div>
        </form>

        {/* Debug info */}
        <div className="bg-gray-100 p-4 rounded-lg text-xs">
          <p><strong>Debug:</strong></p>
          <p>User ID: {user?.$id}</p>
          <p>User Email: {user?.email}</p>
          <p>User Name: {user?.name}</p>
          <p>Selected Type: {selectedType}</p>
        </div>
      </div>
    </div>
  );
};

export default UserTypeSelection;