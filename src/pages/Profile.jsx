import React, { useState, useEffect, useRef } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import VerifiedBadge, { AvatarWithBadge } from '@/components/ui/VerifiedBadge';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Calendar,
  Edit3,
  Camera,
  Save,
  X,
  Eye,
  EyeOff,
  Lock,
  Briefcase,
  Award,
  ExternalLink,
  Users,
  FileText,
  Settings,
  Shield,
  Upload,
  Star,
  Crown,
  TrendingUp,
  BarChart3,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  Image
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { 
  databases, 
  storage, 
  profileService, 
  account, 
  DATABASE_ID, 
  COLLECTIONS,
  BUCKETS,
  Query 
} from '@/lib/appwrite';
import OptimizeProfile from './OptimizeProfile';
import VerifyProfile from './VerifyProfile';
import Footer from '@/components/layout/Footer';

// NOUVEAUX IMPORTS PREMIUM
import { usePremiumFeatures } from '@/hooks/usePremiumFeatures';
import PremiumBadge from '@/components/ui/PremiumBadge';
import PremiumButton from '@/components/ui/PremiumButton';
import PremiumGuard from '@/components/ui/PremiumGuard';

const Profile = () => {
  const { user, profile, updateProfile, changePassword, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef(null);
  const logoInputRef = useRef(null);
  const [showOptimizeModal, setShowOptimizeModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [experiences, setExperiences] = useState([]);
  const [educations, setEducations] = useState([]);
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // NOUVEAU : Hook Premium
  const premiumFeatures = usePremiumFeatures();
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    company_name: '',
    website_url: '',
    linkedin_url: '',
    skills: [],
    experience_years: '',
    company_logo_url: '',
    poste: '',           
    disponibilite: '',   
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [stats, setStats] = useState({
    profileViews: 0,
    jobsPosted: 0,
    applicationsReceived: 0,
    applicationsSubmitted: 0,
    savedJobs: 0,
    profileCompleteness: 0
  });

  const [newSkill, setNewSkill] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  

  useEffect(() => {
    if (location.state?.openEditModal) {
      setShowEditModal(false);
    }
  }, [location]);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        email: profile.email || user?.email || '',
        phone: profile.phone || '',
        location: profile.location || '',
        bio: profile.bio || '',
        company_name: profile.company_name || '',
        website_url: profile.website_url || '',
        linkedin_url: profile.linkedin_url || '',
        skills: profile.skills || [],
        experience_years: profile.experience_years || '',
        company_logo_url: profile.company_logo_url || '',
        poste: profile.poste || '',           
        disponibilite: profile.disponibilite || '',   
      });
      
      calculateStats();
      loadExperienceAndEducation();
    }
  }, [profile, user]);

  // useEffect pour gérer le scroll du body quand le modal est ouvert
  useEffect(() => {
    if (showEditModal) {
      // Empêcher le scroll du body
      document.body.style.overflow = 'hidden';
    } else {
      // Remettre le scroll du body
      document.body.style.overflow = 'unset';
    }

    // Nettoyage au démontage du composant
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showEditModal]);

  const calculateStats = async () => {
    if (!profile) return;
  
    // Calculer le pourcentage de completion du profil
    const fields = [
      profile.full_name,
      profile.phone,
      profile.location,
      profile.bio,
      profile.avatar_url
    ];
  
    if (profile.user_type === 'employer') {
      fields.push(profile.company_name, profile.website_url, profile.company_logo_url);
    } else {
      fields.push(profile.experience_years, profile.skills?.length > 0);
    }
  
    const completedFields = fields.filter(field => field && field !== '').length;
    const completeness = Math.round((completedFields / fields.length) * 100);
  
    // Récupérer les vraies statistiques depuis la base de données
    try {
      let realStats = {
        profileViews: 0,
        jobsPosted: 0,
        applicationsReceived: 0,
        applicationsSubmitted: 0,
        savedJobs: 0,
        profileCompleteness: completeness
      };
  
      if (profile.user_type === 'employer') {
        // Compter les offres publiées par cet employeur
        const jobsResponse = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.JOBS,
          [Query.equal('employer_id', user.$id)]
        );
        
        const jobIds = jobsResponse.documents.map(job => job.$id);
        let applicationsCount = 0; // ✅ CORRECTION: Déclarer la variable
  
        if (jobIds.length > 0) {
          const applicationsResponse = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.APPLICATIONS,
            []
          );
          applicationsCount = applicationsResponse.documents.filter(app => 
            jobIds.includes(app.job_id)
          ).length;
        }
  
        realStats.jobsPosted = jobsResponse.total || 0;
        realStats.applicationsReceived = applicationsCount;
      } else {
        // Pour les candidats, compter leurs candidatures
        const applicationsResponse = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.APPLICATIONS,
          [Query.equal('candidate_id', user.$id)]
        );
  
        // Compter les offres sauvegardées
        const savedJobsResponse = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.SAVED_JOBS,
          [Query.equal('candidate_id', user.$id)]
        );
  
        realStats.applicationsSubmitted = applicationsResponse.total || 0;
        realStats.savedJobs = savedJobsResponse.total || 0;
      }
  
      // Les vues de profil
      const viewsResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PROFILE_VIEWS,
        [Query.equal('profile_id', user.$id)]
      );
  
      realStats.profileViews = viewsResponse.total || 0;
  
      setStats(realStats);
  
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
      // En cas d'erreur, on utilise des valeurs par défaut
      setStats({
        profileViews: 0,
        jobsPosted: 0,
        applicationsReceived: 0,
        applicationsSubmitted: 0,
        savedJobs: 0,
        profileCompleteness: completeness
      });
    }
  };

  // Ajoutez cette fonction pour charger les expériences et formations
const loadExperienceAndEducation = async () => {
    if (!user) return;
  
    try {
      // Charger expériences
      const expData = await databases.listDocuments(
        DATABASE_ID,
        'professional_experience',
        [
          Query.equal('profile_id', user.$id),
          Query.orderDesc('start_date')
        ]
      ).then(response => response.documents);
  
      // Charger éducation
      const eduData = await databases.listDocuments(
        DATABASE_ID,
        'education',
        [
          Query.equal('profile_id', user.$id),
          Query.orderDesc('start_date')
        ]
      ).then(response => response.documents);
  
      setExperiences(expData || []);
      setEducations(eduData || []);
    } catch (error) {
      console.error('Erreur chargement expériences/formations:', error);
    }
  };
  
  // Fonction utilitaire pour formater les dates
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', { 
        month: 'long', 
        year: 'numeric' 
      });
    } catch (error) {
      return dateString;
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const convertProfileData = (data) => {
    const converted = { ...data };
    
    // ✅ LISTE EXACTE des champs qui existent dans votre DB
    const allowedFields = [
      'full_name',
      'email', 
      'phone',
      'location',
      'bio',
      'company_name',
      'website_url',
      'linkedin_url',
      'skills',           // ← ARRAY
      'experience_years', // ← INTEGER
      'company_logo_url',
      'poste',
      'disponibilite',
      'user_type',
      'google_id',
      'oauth_provider',
      'oauth_password',
      'profile_picture',
      'onboarding_completed',
      'updated_at'
    ];
    
    // ✅ Filtrer pour garder seulement les champs autorisés
    const filtered = {};
    allowedFields.forEach(field => {
      if (converted[field] !== undefined) {
        filtered[field] = converted[field];
      }
    });
    
    // ✅ SKILLS DOIT RESTER UN ARRAY !
    if (filtered.skills) {
      if (!Array.isArray(filtered.skills)) {
        // Si c'est une string, la convertir en array
        filtered.skills = filtered.skills.split(',').map(skill => skill.trim()).filter(skill => skill !== '');
      }
      // Si c'est déjà un array, on le garde tel quel
    } else {
      filtered.skills = []; // Array vide par défaut
    }
    
    // ✅ EXPERIENCE_YEARS doit être un INTEGER
    if (filtered.experience_years !== undefined && filtered.experience_years !== null && filtered.experience_years !== '') {
      filtered.experience_years = parseInt(filtered.experience_years, 10);
      if (isNaN(filtered.experience_years)) {
        filtered.experience_years = null;
      }
    } else {
      filtered.experience_years = null;
    }
    
    // ✅ Updated_at
    filtered.updated_at = new Date().toISOString();
    
    return filtered;
  };
  
  // ✅ FONCTION handleSave FINALE
  const handleSave = async () => {
    try {
      console.log('💾 Début sauvegarde...');
      console.log('📋 FormData original:', formData);
      
      // Convertir et filtrer les données
      const dataToSend = convertProfileData(formData);
      
      console.log('📋 Données à envoyer:', dataToSend);
      console.log('📋 Type de skills:', typeof dataToSend.skills, dataToSend.skills);
      
      // Appeler le service de mise à jour
      const result = await profileService.updateProfile(profile.$id, dataToSend);
      
      if (result.error) {
        throw new Error(result.error.message || 'Erreur lors de la mise à jour');
      }
      
      // Mettre à jour le profil dans le contexte
      if (typeof setProfile !== 'undefined') {
        setProfile(result.data);
      }
      
      // ✅ Message de succès
      alert("✅ Profil mis à jour avec succès !");
      
      console.log('✅ Profil mis à jour avec succès');
      
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      alert("❌ Erreur : " + (error.message || "Impossible de sauvegarder"));
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: profile?.full_name || '',
      email: profile?.email || user?.email || '',
      phone: profile?.phone || '',
      location: profile?.location || '',
      bio: profile?.bio || '',
      company_name: profile?.company_name || '',
      website_url: profile?.website_url || '',
      linkedin_url: profile?.linkedin_url || '',
      skills: profile?.skills || [],
      experience_years: profile?.experience_years || '',
      company_logo_url: profile?.company_logo_url || '',
      poste: profile?.poste || '',           
      disponibilite: profile?.disponibilite || '',   
    });
    setShowEditModal(false);
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image');
      return;
    }
  
    if (file.size > 5 * 1024 * 1024) {
      alert('L\'image doit faire moins de 5MB');
      return;
    }
  
    setUploadingAvatar(true);
  
    try {
      if (!user) {
        throw new Error('Utilisateur non authentifié');
      }
  
      // Supprimer l'ancien avatar s'il existe
      if (profile?.avatar_url && profile.avatar_url.includes('appwrite')) {
        try {
          const urlParts = profile.avatar_url.split('/files/')[1];
          const fileId = urlParts ? urlParts.split('/')[0] : null;
          
          if (fileId) {
            await storage.deleteFile(BUCKETS.IMAGES, fileId);
            console.log('Ancien avatar supprimé:', fileId);
          }
        } catch (error) {
          console.log('Ancien fichier non trouvé:', error);
        }
      }
  
      // Upload vers Appwrite Storage
      const uploadedFile = await storage.createFile(
        BUCKETS.IMAGES, 
        'unique()', 
        file
      );
  
      console.log('Fichier uploadé:', uploadedFile);
  
      // ✅ CORRECTION: Utiliser directement storage.getFileView (plus fiable)
      const publicUrl = storage.getFileView(BUCKETS.IMAGES, uploadedFile.$id);
      
      console.log('URL publique générée:', publicUrl);
  
      // ✅ TESTER l'URL avant de sauvegarder
      try {
        const testResponse = await fetch(publicUrl, { 
          method: 'HEAD',
          mode: 'no-cors' // Important pour éviter les erreurs CORS
        });
        console.log('Test URL réussi');
      } catch (error) {
        console.log('Impossible de tester l\'URL (normal avec no-cors):', error);
        // On continue quand même car no-cors peut générer une erreur même si l'URL fonctionne
      }
  
      // Utiliser updateProfile du contexte
      const result = await updateProfile({
        avatar_url: publicUrl
      });
  
      if (result.error) {
        throw result.error;
      }
  
      console.log('Profil mis à jour avec avatar:', result.data);
      alert('Photo de profil mise à jour avec succès !');
  
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      alert(`Erreur lors de l'upload de l'image: ${error.message || 'Erreur inconnue'}`);
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Nouvelle fonction améliorée pour l'upload du logo de l'entreprise
  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image');
      return;
    }
  
    if (file.size > 5 * 1024 * 1024) {
      alert('L\'image doit faire moins de 5MB');
      return;
    }
  
    setUploadingLogo(true);
  
    try {
      if (!user) {
        throw new Error('Utilisateur non authentifié');
      }
  
      // Supprimer l'ancien logo s'il existe
      if (profile?.company_logo_url && profile.company_logo_url.includes('appwrite')) {
        try {
          const urlParts = profile.company_logo_url.split('/files/')[1];
          const fileId = urlParts ? urlParts.split('/')[0] : null;
          
          if (fileId) {
            await storage.deleteFile(BUCKETS.IMAGES, fileId);
            console.log('Ancien logo supprimé:', fileId);
          }
        } catch (error) {
          console.log('Ancien fichier non trouvé:', error);
        }
      }
  
      // Upload vers Appwrite Storage
      const uploadedFile = await storage.createFile(
        BUCKETS.IMAGES, 
        'unique()', 
        file
      );
  
      console.log('Fichier uploadé:', uploadedFile);
  
      // ✅ CORRECTION: Utiliser let au lieu de const
      let publicUrl = `https://appwrite.dat-articles.com/v1/storage/buckets/${BUCKETS.IMAGES}/files/${uploadedFile.$id}/view?project=job2mada`;
      
      console.log('URL publique générée:', publicUrl);
  
      // Tester l'URL
      try {
        const response = await fetch(publicUrl, { method: 'HEAD' });
        if (!response.ok) {
          throw new Error(`URL inaccessible: ${response.status}`);
        }
        console.log('URL vérifiée et accessible');
      } catch (error) {
        console.error('URL non accessible:', error);
        const alternativeUrl = storage.getFileView(BUCKETS.IMAGES, uploadedFile.$id);
        console.log('URL alternative:', alternativeUrl);
        publicUrl = alternativeUrl; // ✅ Maintenant possible
      }
  
      // Utiliser updateProfile du contexte
      const result = await updateProfile({
        company_logo_url: publicUrl
      });
  
      if (result.error) {
        throw result.error;
      }
  
      // Mettre à jour le formData pour l'affichage immédiat dans le modal
      setFormData(prev => ({
        ...prev,
        company_logo_url: publicUrl
      }));
  
      console.log('Logo mis à jour:', result.data);
      alert('Logo de l\'entreprise mis à jour avec succès !');
  
    } catch (error) {
      console.error('Erreur lors de l\'upload du logo:', error);
      alert(`Erreur lors de l'upload du logo: ${error.message || 'Erreur inconnue'}`);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handlePasswordSubmit = async () => {
    setPasswordError('');
    setPasswordSuccess(false);

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('Tous les champs sont requis');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Les nouveaux mots de passe ne correspondent pas');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setPasswordLoading(true);

    try {
      const { error } = await changePassword(passwordData.newPassword);
      
      if (error) {
        setPasswordError(error.message);
      } else {
        setPasswordSuccess(true);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTimeout(() => {
          setShowPasswordForm(false);
          setPasswordSuccess(false);
        }, 2000);
      }
    } catch (error) {
      setPasswordError('Une erreur inattendue s\'est produite');
    } finally {
      setPasswordLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'security', label: 'Sécurité', icon: Shield },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <Navbar />
        <div className="pt-32 pb-12">
          <div className="container-custom">
            <div className="flex items-center justify-center py-12">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-job-navy border-r-job-navy-dark"></div>
                <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-elegant opacity-20"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 relative overflow-hidden">
        {/* Fond décoratif animé */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-br from-job-navy/10 to-job-navy-dark/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 -left-4 w-96 h-96 bg-job-gold/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-job-navy-light/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <Navbar />
        
        <div className="pt-32 pb-16 relative z-10">
          <div className="container-custom">
            {/* Header avec photo de profil - Design amélioré */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden mb-8 relative">
              <div className="h-48 bg-gradient-to-r from-job-navy via-job-navy-dark to-job-gold relative">
                <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
                <div className="absolute inset-0 opacity-20">
                  <div className="h-full w-full" style={{
                    backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 2px, transparent 2px)',
                    backgroundSize: '20px 20px'
                  }}></div>
                </div>
              </div>
              
              <div className="relative px-8 pb-8">
                <div className="flex flex-col lg:flex-row lg:items-end lg:space-x-8 -mt-16 sm:-mt-20 lg:-mt-24">
                  {/* Avatar avec upload */}
                  <div className="relative group mb-6 lg:mb-0">
                  <div className="relative w-28 h-28 sm:w-36 sm:h-36 lg:w-40 lg:h-40">
  <div 
    className="relative bg-gradient-elegant border-6 border-white shadow-2xl transform transition-all group-hover:scale-105 flex items-center justify-center text-white font-bold text-4xl overflow-hidden w-full h-full rounded-full"
  >
    {profile?.avatar_url ? (
      <img
        src={profile.avatar_url}
        alt="Avatar"
        className="w-full h-full object-cover rounded-full"
      />
    ) : (
      getInitials(profile?.full_name || user?.email)
    )}
    
    {/* Overlay d'upload */}
    <div 
      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center cursor-pointer rounded-full"
      onClick={() => fileInputRef.current?.click()}
    >
      {uploadingAvatar ? (
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
      ) : (
        <Camera className="h-8 w-8 text-white" />
      )}
    </div>
  </div>
  
  <VerifiedBadge
    size="large"
    position="bottom-right"
    variant={profile?.is_premium ? 'gold' : 'blue'}
    isVerified={profile?.is_verified}
    showTooltip={true}
  />
</div>
  
  <input
    ref={fileInputRef}
    type="file"
    accept="image/*"
    onChange={handleAvatarUpload}
    className="hidden"
  />
</div>

                  {/* Informations principales */}
                  <div className="flex-1">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="space-y-2">
                        <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text">
                          {profile?.full_name || 'Nom non défini'}
                        </h1>
                        
                        {/* SECTION BADGES AMÉLIORÉE AVEC COMPOSANTS PREMIUM */}
                        <div className="flex items-center space-x-3 flex-wrap gap-2">
                          <div className={`flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                            profile?.user_type === 'employer' 
                              ? 'bg-slate-100 text-job-navy-dark' 
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {profile?.user_type === 'employer' ? (
                              <Briefcase className="h-4 w-4 mr-2" />
                            ) : (
                              <User className="h-4 w-4 mr-2" />
                            )}
                            {profile?.user_type === 'employer' ? 'Employeur' : 'Candidat'}
                          </div>
                          
                          {/* NOUVEAU : Badge Premium avec composant */}
                          {profile?.is_premium && (
                            <PremiumBadge type="premium" size="md" />
                          )}
                          
                          {/* Poste pour candidats */}
                          {profile?.user_type === 'candidate' && profile?.poste && (
                            <div className="flex items-center px-4 py-2 bg-job-navy/10 text-job-navy rounded-full text-sm font-medium">
                              <Briefcase className="h-4 w-4 mr-2" />
                              {profile.poste}
                            </div>
                          )}
                          
                          {profile?.company_name && (
                            <div className="flex items-center text-job-navy font-medium">
                              <Building className="h-4 w-4 mr-1" />
                              {profile.company_name}
                            </div>
                          )}
                        </div>
                        
                        {profile?.location && (
                          <p className="text-gray-600 flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            {profile.location}
                          </p>
                        )}

                        {/* Barre de progression du profil */}
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Profil complété</span>
                            <span className="text-sm font-bold text-job-navy">{stats.profileCompleteness}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div 
                              className="h-3 bg-gradient-to-r from-job-navy to-job-navy-dark rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                              style={{ width: `${stats.profileCompleteness}%` }}
                            >
                              <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 lg:mt-0">
                        <Button
                          onClick={() => setShowEditModal(true)}
                          className="bg-gradient-elegant hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-white px-8 py-3 rounded-2xl font-semibold flex items-center space-x-2"
                        >
                          <Edit3 className="h-5 w-5" />
                          <span>Modifier le profil</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistiques animées */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Vues du profil</p>
                    <p className="text-3xl font-bold text-gray-900 animate-pulse">{stats.profileViews}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-slate-100 to-job-navy-light rounded-2xl">
                    <Eye className="h-6 w-6 text-job-navy" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-500 font-medium">+12% ce mois</span>
                </div>
              </div>

              {profile?.user_type === 'candidate' ? (
                <>
                  <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Candidatures</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.applicationsSubmitted}</p>
                      </div>
                      <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl">
                        <FileText className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Offres sauvées</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.savedJobs}</p>
                      </div>
                      <div className="p-3 bg-job-light-gold rounded-2xl">
                        <Star className="h-6 w-6 text-job-dark-gold" />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Offres publiées</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.jobsPosted}</p>
                      </div>
                      <div className="p-3 bg-gradient-to-br from-slate-100 to-job-navy-light rounded-2xl">
                        <Briefcase className="h-6 w-6 text-job-navy" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Candidatures reçues</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.applicationsReceived}</p>
                      </div>
                      <div className="p-3 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl">
                        <Users className="h-6 w-6 text-red-600" />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Score profil</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.profileCompleteness}/100</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-slate-100 to-job-navy-light rounded-2xl">
                    <BarChart3 className="h-6 w-6 text-job-navy" />
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation par onglets améliorée */}
            <div className="flex space-x-2 mb-8 bg-white/60 backdrop-blur-xl rounded-2xl p-2 shadow-xl border border-white/20">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center space-x-3 py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-elegant text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:bg-white/50 hover:text-gray-900'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Contenu des onglets */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {activeTab === 'profile' && (
                  <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                      <User className="h-7 w-7 mr-3 text-job-navy" />
                      Informations du profil
                    </h2>

                    <div className="space-y-6">
                      {/* Bio */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          {profile?.user_type === 'employer' ? 'À propos de l\'entreprise' : 'À propos de moi'}
                        </h3>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                          {profile?.bio ? (
                            <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
                          ) : (
                            <p className="text-gray-500 italic">
                              {profile?.user_type === 'employer' 
                                ? 'Aucune description de l\'entreprise'
                                : 'Aucune description personnelle'
                              }
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Informations de contact */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Informations de contact</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="flex items-center">
                              <Mail className="h-5 w-5 text-gray-400 mr-3" />
                              <div>
                                <p className="text-sm text-gray-600">Email</p>
                                <p className="font-medium text-gray-900">{user?.email}</p>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="flex items-center">
                              <Phone className="h-5 w-5 text-gray-400 mr-3" />
                              <div>
                                <p className="text-sm text-gray-600">Téléphone</p>
                                <p className="font-medium text-gray-900">{profile?.phone || 'Non défini'}</p>
                                </div>
                           </div>
                         </div>

                         <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                           <div className="flex items-center">
                             <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                             <div>
                               <p className="text-sm text-gray-600">Localisation</p>
                               <p className="font-medium text-gray-900">{profile?.location || 'Non définie'}</p>
                             </div>
                           </div>
                         </div>

                         {profile?.user_type === 'candidate' && profile?.disponibilite && (
                          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="flex items-center">
                              <Clock className="h-5 w-5 text-gray-400 mr-3" />
                              <div>
                                <p className="text-sm text-gray-600">Disponibilité</p>
                                <p className="font-medium text-gray-900">{profile.disponibilite}</p>
                              </div>
                            </div>
                          </div>
                        )}

                         {profile?.linkedin_url && (
                           <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                             <div className="flex items-center">
                               <ExternalLink className="h-5 w-5 text-gray-400 mr-3" />
                               <div>
                                 <p className="text-sm text-gray-600">LinkedIn</p>
                                 <a 
                                   href={profile.linkedin_url} 
                                   target="_blank" 
                                   rel="noopener noreferrer"
                                   className="font-medium text-job-navy hover:underline"
                                 >
                                   Voir le profil
                                 </a>
                               </div>
                             </div>
                           </div>
                         )}
                       </div>
                     </div>

                     {/* Compétences pour candidats */}
                     {profile?.user_type === 'candidate' && (
                       <div>
                         <h3 className="text-lg font-semibold text-gray-900 mb-3">Compétences</h3>
                         <div className="flex flex-wrap gap-2">
                           {profile?.skills?.length > 0 ? (
                             profile.skills.map((skill, index) => (
                               <span
                                 key={index}
                                 className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-job-navy/10 to-job-navy-dark/10 text-job-navy rounded-full text-sm font-medium border border-job-navy/20 hover:shadow-md transition-all"
                               >
                                 {skill}
                               </span>
                             ))
                           ) : (
                             <p className="text-gray-500 italic">Aucune compétence ajoutée</p>
                           )}
                         </div>
                       </div>
                     )}

                     {/* Informations entreprise pour employeurs */}
                     {profile?.user_type === 'employer' && (
                       <div>
                         <h3 className="text-lg font-semibold text-gray-900 mb-3">Informations entreprise</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                             <div className="flex items-center">
                               <Building className="h-5 w-5 text-gray-400 mr-3" />
                               <div>
                                 <p className="text-sm text-gray-600">Entreprise</p>
                                 <p className="font-medium text-gray-900">{profile?.company_name || 'Non défini'}</p>
                               </div>
                             </div>
                           </div>
                           {profile?.website_url && (
                             <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                               <div className="flex items-center">
                                 <ExternalLink className="h-5 w-5 text-gray-400 mr-3" />
                                 <div>
                                   <p className="text-sm text-gray-600">Site web</p>
                                   <a 
                                     href={profile.website_url} 
                                     target="_blank" 
                                     rel="noopener noreferrer"
                                     className="font-medium text-job-navy hover:underline"
                                   >
                                     Visiter le site
                                   </a>
                                 </div>
                               </div>
                             </div>
                           )}
                           {/* Affichage amélioré du logo de l'entreprise */}
                           {profile?.company_logo_url && (
                             <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 md:col-span-2">
                               <div className="flex items-center">
                                 <Image className="h-5 w-5 text-gray-400 mr-3" />
                                 <div className="flex-1">
                                   <p className="text-sm text-gray-600 mb-3">Logo de l'entreprise</p>
                                   <div className="flex items-center space-x-4">
                                     <div className="relative group">
                                       <img 
                                         src={profile.company_logo_url} 
                                         alt="Logo entreprise" 
                                         className="w-20 h-20 object-contain rounded-xl border border-gray-200 bg-white p-3 shadow-sm group-hover:shadow-lg transition-all"
                                       />
                                       <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all rounded-xl flex items-center justify-center">
                                         <Eye className="h-6 w-6 text-white" />
                                       </div>
                                     </div>
                                     <div>
                                       <p className="font-medium text-gray-900">Logo de l'entreprise</p>
                                       <p className="text-sm text-gray-600">Affiché sur vos offres d'emploi</p>
                                       <p className="text-xs text-green-600 font-medium mt-1">✓ Validé et actif</p>
                                     </div>
                                   </div>
                                 </div>
                               </div>
                             </div>
                           )}
                         </div>
                       </div>
                     )}
                   </div>
                 </div>
               )}

               {activeTab === 'security' && (
                 <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8">
                   <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                     <Shield className="h-7 w-7 mr-3 text-job-navy" />
                     Sécurité et mot de passe
                   </h2>

                   <div className="space-y-6">
                     <div className="flex items-center justify-between p-6 bg-slate-50 rounded-xl border border-job-navy-light">
                       <div>
                         <h3 className="font-semibold text-gray-900 text-lg">Mot de passe</h3>
                         <p className="text-gray-600">Dernière modification il y a plus de 30 jours</p>
                       </div>
                       <Button
                         onClick={() => setShowPasswordForm(!showPasswordForm)}
                         className="bg-gradient-elegant hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-white px-6 py-3 rounded-xl font-semibold"
                       >
                         <Lock className="h-4 w-4 mr-2" />
                         Modifier
                       </Button>
                     </div>

                     {showPasswordForm && (
                       <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6 shadow-lg">
                         <div>
                           <label className="block text-sm font-semibold text-gray-700 mb-2">
                             Mot de passe actuel
                           </label>
                           <div className="relative">
                             <input
                               type={showCurrentPassword ? 'text' : 'password'}
                               name="currentPassword"
                               value={passwordData.currentPassword}
                               onChange={handlePasswordChange}
                               className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-job-navy focus:border-transparent transition-all pr-12"
                             />
                             <button
                               type="button"
                               onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                               className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                             >
                               {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                             </button>
                           </div>
                         </div>

                         <div>
                           <label className="block text-sm font-semibold text-gray-700 mb-2">
                             Nouveau mot de passe
                           </label>
                           <div className="relative">
                             <input
                               type={showNewPassword ? 'text' : 'password'}
                               name="newPassword"
                               value={passwordData.newPassword}
                               onChange={handlePasswordChange}
                               className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-job-navy focus:border-transparent transition-all pr-12"
                             />
                             <button
                               type="button"
                               onClick={() => setShowNewPassword(!showNewPassword)}
                               className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                             >
                               {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                             </button>
                           </div>
                         </div>

                         <div>
                           <label className="block text-sm font-semibold text-gray-700 mb-2">
                             Confirmer le nouveau mot de passe
                           </label>
                           <input
                             type="password"
                             name="confirmPassword"
                             value={passwordData.confirmPassword}
                             onChange={handlePasswordChange}
                             className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-job-navy focus:border-transparent transition-all"
                           />
                         </div>

                         {passwordError && (
                           <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center">
                             <X className="h-5 w-5 mr-2" />
                             {passwordError}
                           </div>
                         )}

                         {passwordSuccess && (
                           <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center">
                             <div className="h-5 w-5 bg-green-500 rounded-full mr-2 flex items-center justify-center">
                               <div className="h-2 w-2 bg-white rounded-full"></div>
                             </div>
                             Mot de passe modifié avec succès !
                           </div>
                         )}

                         <div className="flex space-x-4 pt-4">
                           <Button 
                             onClick={handlePasswordSubmit}
                             disabled={passwordLoading}
                             className="bg-gradient-elegant hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-white px-6 py-3 rounded-xl font-semibold flex items-center"
                           >
                             {passwordLoading ? (
                               <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                             ) : (
                               <Save className="h-4 w-4 mr-2" />
                             )}
                             Changer le mot de passe
                           </Button>
                           <Button
                             onClick={() => setShowPasswordForm(false)}
                             className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-all"
                           >
                             Annuler
                           </Button>
                         </div>
                       </div>
                     )}
                   </div>
                 </div>
               )}

                {/* Section Expérience Professionnelle pour candidats */}
{profile?.user_type === 'candidate' && experiences.length > 0 && (
  <div>
    <h3 className="text-lg font-semibold text-gray-900 mb-3">Expérience Professionnelle</h3>
    <div className="space-y-4">
      {experiences.map((exp) => (
        <div key={exp.$id} className="bg-slate-50 rounded-xl p-4 border border-job-navy-light">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 text-lg">{exp.position}</h4>
              <p className="text-job-navy font-medium flex items-center">
                <Building className="h-4 w-4 mr-1" />
                {exp.company_name}
              </p>
              <p className="text-sm text-gray-600 flex items-center mt-1">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDate(exp.start_date)} - 
                {exp.is_current ? ' Présent' : ` ${formatDate(exp.end_date)}`}
              </p>
              {exp.location && (
                <p className="text-sm text-gray-600 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {exp.location}
                </p>
              )}
              {exp.description && (
                <p className="text-sm text-gray-700 mt-2 leading-relaxed">{exp.description}</p>
              )}
            </div>
            <div className="ml-4">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Briefcase className="h-5 w-5 text-job-navy" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

{/* Section Formations pour candidats */}
{profile?.user_type === 'candidate' && educations.length > 0 && (
  <div>
    <h3 className="text-lg font-semibold text-gray-900 mb-3">Formation & Éducation</h3>
    <div className="space-y-4">
      {educations.map((edu) => (
        <div key={edu.id} className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 text-lg">{edu.degree}</h4>
              <p className="text-job-navy font-medium flex items-center">
                <Building className="h-4 w-4 mr-1" />
                {edu.institution_name}
              </p>
              {edu.field_of_study && (
                <p className="text-sm text-gray-600 italic">{edu.field_of_study}</p>
              )}
              <p className="text-sm text-gray-600 flex items-center mt-1">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDate(edu.start_date)} - 
                {edu.is_current ? ' En cours' : ` ${formatDate(edu.end_date)}`}
              </p>
              {edu.location && (
                <p className="text-sm text-gray-600 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {edu.location}
                </p>
              )}
              {edu.description && (
                <p className="text-sm text-gray-700 mt-2 leading-relaxed">{edu.description}</p>
              )}
            </div>
            <div className="ml-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Award className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

{/* Section Documents pour candidats */}
{profile?.user_type === 'candidate' && (profile?.cv_url || profile?.portfolio_url) && (
  <div>
    <h3 className="text-lg font-semibold text-gray-900 mb-3">Documents</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {profile?.cv_url && (
        <div className="bg-slate-50 rounded-xl p-4 border border-job-navy-light">
          <div className="flex items-center">
            <div className="p-3 bg-slate-100 rounded-lg mr-4">
              <FileText className="h-6 w-6 text-job-navy" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">Curriculum Vitae</h4>
              <p className="text-sm text-gray-600">Document PDF</p>
            </div>
            <a
              href={profile.cv_url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-100 hover:bg-job-navy-light text-job-navy p-2 rounded-lg transition-colors"
            >
              <ExternalLink className="h-5 w-5" />
            </a>
          </div>
        </div>
      )}
      
      {profile?.portfolio_url && (
        <div className="bg-slate-50 rounded-xl p-4 border border-job-light-gold">
          <div className="flex items-center">
            <div className="p-3 bg-job-light-gold rounded-lg mr-4">
              <Briefcase className="h-6 w-6 text-job-dark-gold" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">Portfolio</h4>
              <p className="text-sm text-gray-600">Fichier archive</p>
            </div>
            <a
              href={profile.portfolio_url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-job-light-gold hover:bg-job-light-gold text-job-dark-gold p-2 rounded-lg transition-colors"
            >
              <ExternalLink className="h-5 w-5" />
            </a>
          </div>
        </div>
      )}
    </div>
  </div>
)}
              </div>

              <div className="space-y-8">
               {/* Actions rapides */}
               <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
                 <h3 className="font-bold text-gray-900 mb-4 text-lg">Actions rapides</h3>
                 <div className="space-y-3">
                   {profile?.user_type === 'candidate' ? (
                     <>
              
                <Link to="/my-applications">
                <button className="w-full text-left p-4 bg-gradient-to-br from-job-gold via-job-gold to-job-dark-gold hover:from-slate-50 hover:to-slate-50 rounded-xl transition-all flex items-center group">
                         <div className="p-2 bg-slate-100 rounded-lg mr-3 group-hover:bg-job-navy-light transition-colors">
                           <FileText className="h-5 w-5 text-job-navy" />
                         </div>
                         <span className="font-medium">Voir mes candidatures</span>
                       </button>
                       </Link>
                       <Link to="/jobs">
                        <button className="w-full text-left mt-8 p-4 bg-gradient-to-br from-job-gold via-job-gold to-job-dark-gold hover:from-slate-50 hover:to-slate-50 rounded-xl transition-all flex items-center group">
              
                         <div className="p-2 bg-green-100 rounded-lg mr-3 group-hover:bg-green-200 transition-colors">
                           <Briefcase className="h-5 w-5 text-green-600" />
                         </div>
                         <span className="font-medium">Rechercher des emplois</span>
                         </button>
                       </Link>
                     </>
                   ) : (
                     <>
                       <button className="w-full text-left p-4 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-50 rounded-xl transition-all flex items-center group">
                         <div className="p-2 bg-slate-100 rounded-lg mr-3 group-hover:bg-job-navy-light transition-colors">
                           <Briefcase className="h-5 w-5 text-job-navy" />
                         </div>
                         <span className="font-medium">Publier une offre</span>
                       </button>
                       <button className="w-full text-left p-4 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 rounded-xl transition-all flex items-center group">
                         <div className="p-2 bg-green-100 rounded-lg mr-3 group-hover:bg-green-200 transition-colors">
                           <Users className="h-5 w-5 text-green-600" />
                         </div>
                         <span className="font-medium">Voir les candidatures</span>
                       </button>
                       <button className="w-full text-left p-4 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-50 rounded-xl transition-all flex items-center group">
                         <div className="p-2 bg-slate-100 rounded-lg mr-3 group-hover:bg-job-navy-light transition-colors">
                           <FileText className="h-5 w-5 text-job-navy" />
                         </div>
                         <span className="font-medium">Gérer mes offres</span>
                       </button>
                     </>
                   )}
                 </div>
               </div>

               {/* Informations du compte */}
               <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
                 <h3 className="font-bold text-gray-900 mb-4 text-lg">Informations du compte</h3>
                 <div className="space-y-4">
                   <div className="flex justify-between items-center">
                     <span className="text-gray-600">Type de compte</span>
                     <span className="font-semibold capitalize bg-gradient-to-r from-job-navy to-job-navy-dark bg-clip-text text-transparent">
                       {profile?.user_type}
                     </span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-gray-600">Statut Premium</span>
                     <div className="flex items-center">
                       {profile?.is_premium ? (
                         <>
                           <div className="w-3 h-3 bg-slate-500 rounded-full mr-2 animate-pulse"></div>
                           <span className="font-semibold text-job-dark-gold">Premium</span>
                           <Crown className="h-4 w-4 ml-1 text-job-dark-gold" />
                         </>
                       ) : (
                         <>
                           <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                           <span className="font-semibold text-gray-600">Gratuit</span>
                         </>
                       )}
                     </div>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-gray-600">Membre depuis</span>
                     <span className="font-semibold">
                       {profile?.created_at 
                         ? new Date(profile.created_at).toLocaleDateString('fr-FR', { 
                             year: 'numeric', 
                             month: 'long',
                           })
                         : 'N/A'
                       }
                     </span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-gray-600">Statut</span>
                     <div className="flex items-center">
                       <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                       <span className="font-semibold text-green-600">Actif</span>
                     </div>
                   </div>
                 </div>
               </div>

               {/* Conseils personnalisés - Boutons améliorés */}
               <div className="bg-slate-50 rounded-2xl p-6 border border-job-light-gold shadow-xl">
                 <div className="text-center">
                   <div className="w-16 h-16 bg-job-gold rounded-full mx-auto mb-4 flex items-center justify-center">
                     <span className="text-2xl">💡</span>
                   </div>
                   <h3 className="font-bold text-gray-900 mb-3 text-lg">Améliorez votre profil</h3>
                   <p className="text-gray-600 mb-6 leading-relaxed text-sm">
                     {profile?.user_type === 'candidate'
                       ? "Modifier / Ajoutez vos expériences et vos documents pour un profil complet !"
                       : "Vérifiez votre entreprise pour gagner en crédibilité !"
                     }
                   </p>
                   
                   {/* Boutons sur deux colonnes pour candidats */}
                    {profile?.user_type === 'candidate' ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex justify-center">
                          <Button 
                            onClick={() => setShowOptimizeModal(true)}
                            className="bg-job-gold hover:bg-slate-500 text-white font-semibold py-3 px-6 rounded-xl transform hover:scale-105 transition-all duration-300 shadow-lg whitespace-nowrap min-w-fit"
                          >
                            Expérience / Formations
                          </Button>
                        </div>
                        
                        {/* ✅ MASQUER LE BOUTON SI VÉRIFIÉ */}
                        {!profile?.is_verified && (
                          <div className="flex justify-center">
                            <Button 
                              onClick={() => setShowVerifyModal(true)}
                              className="bg-slate-500 hover:bg-job-navy text-white font-semibold py-2.5 px-4 rounded-xl transform hover:scale-105 transition-all duration-300 shadow-lg flex items-center justify-center space-x-1 text-xs w-24"
                            >
                              <Shield className="h-3 w-3" />
                              <span>Vérifier</span>
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* ✅ MASQUER LE BOUTON SI VÉRIFIÉ - EMPLOYEUR */
                      !profile?.is_verified && (
                        <Button 
                          onClick={() => setShowVerifyModal(true)}
                          className="mx-auto bg-slate-500 hover:bg-job-navy text-white font-semibold py-3 rounded-xl transform hover:scale-105 transition-all duration-300 shadow-lg flex items-center justify-center space-x-2"
                        >
                          <Shield className="h-4 w-4" />
                          <span>Vérifier mon entreprise</span>
                        </Button>
                      )
                    )}
                 </div>
               </div>
              </div>
           </div>
         </div>
       </div>


       {showEditModal && (
         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
             {/* Header fixe */}
             <div className="bg-gradient-elegant p-6 text-white flex-shrink-0 rounded-t-3xl">
               <div className="flex items-center justify-between">
                 <h2 className="text-2xl font-bold">✨ Modifier mon profil</h2>
                 <button
                   onClick={handleCancel}
                   className="p-2 hover:bg-white/20 rounded-full transition-colors"
                 >
                   <X className="h-6 w-6" />
                 </button>
               </div>
             </div>

             {/* Contenu avec scroll */}
             <div className="flex-1 overflow-y-auto p-8" style={{ maxHeight: 'calc(90vh - 200px)' }}>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-2">
                     Nom complet *
                   </label>
                   <input
                     type="text"
                     name="full_name"
                     value={formData.full_name}
                     onChange={handleInputChange}
                     className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-job-navy focus:border-transparent transition-all"
                     placeholder="Votre nom complet"
                   />
                 </div>

                 <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-2">
                     Téléphone
                   </label>
                   <input
                     type="tel"
                     name="phone"
                     value={formData.phone}
                     onChange={handleInputChange}
                     className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-job-navy focus:border-transparent transition-all"
                     placeholder="+261 XX XX XXX XX"
                   />
                 </div>

                 <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-2">
                     Localisation
                   </label>
                   <input
                     type="text"
                     name="location"
                     value={formData.location}
                     onChange={handleInputChange}
                     className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-job-navy focus:border-transparent transition-all"
                     placeholder="Antananarivo, Madagascar"
                   />
                 </div>

                 {profile?.user_type === 'employer' ? (
                   <>
                     <div>
                       <label className="block text-sm font-semibold text-gray-700 mb-2">
                         Nom de l'entreprise
                       </label>
                       <input
                         type="text"
                         name="company_name"
                         value={formData.company_name}
                         onChange={handleInputChange}
                         className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-job-navy focus:border-transparent transition-all"
                         placeholder="Nom de votre entreprise"
                       />
                     </div>

                     <div>
                       <label className="block text-sm font-semibold text-gray-700 mb-2">
                         Site web
                       </label>
                       <input
                         type="url"
                         name="website_url"
                         value={formData.website_url}
                         onChange={handleInputChange}
                         className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-job-navy focus:border-transparent transition-all"
                         placeholder="https://..."
                       />
                     </div>

                     
                     {/* Section Logo de l'entreprise */}
                     <div className="md:col-span-2">
                       <label className="block text-sm font-semibold text-gray-700 mb-3">
                         🏢 Logo de l'entreprise
                       </label>
                       <div className="space-y-6">
                         {formData.company_logo_url && (
                           <div className="flex items-center space-x-6 p-6 bg-slate-50 rounded-2xl border-2 border-job-navy-light">
                             <div className="relative group">
                               <img 
                                 src={formData.company_logo_url} 
                                 alt="Logo actuel" 
                                 className="w-24 h-24 object-contain rounded-xl border-2 border-white bg-white p-3 shadow-lg group-hover:shadow-xl transition-all"
                               />
                               <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all rounded-xl flex items-center justify-center">
                                 <Eye className="h-6 w-6 text-white" />
                               </div>
                             </div>
                             <div className="flex-1">
                               <h4 className="font-bold text-gray-900 text-lg mb-1">Logo actuel</h4>
                               <p className="text-sm text-gray-600 mb-2">Sera affiché sur toutes vos offres d'emploi</p>
                               <div className="flex items-center space-x-2">
                                 <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                 <span className="text-sm font-medium text-green-600">Actif et visible</span>
                               </div>
                             </div>
                           </div>
                         )}
                         
                         <div className="border-3 border-dashed border-job-navy-light rounded-2xl p-8 text-center hover:border-solid hover:bg-slate-50 transition-all group cursor-pointer"
                              onClick={() => logoInputRef.current?.click()}>
                           <input
                             ref={logoInputRef}
                             type="file"
                             accept="image/*"
                             onChange={handleLogoUpload}
                             className="hidden"
                           />
                           <div className="flex flex-col items-center space-y-4">
                             {uploadingLogo ? (
                               <div className="w-16 h-16 border-4 border-job-navy border-t-transparent rounded-full animate-spin"></div>
                             ) : (
                               <div className="w-16 h-16 bg-gradient-to-br from-job-navy to-job-navy-dark rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                 <Image className="h-8 w-8 text-white" />
                               </div>
                             )}
                             <div className="text-center">
                               <p className="font-bold text-gray-900 text-lg mb-2">
                                 {uploadingLogo ? 'Upload en cours...' : formData.company_logo_url ? 'Remplacer le logo' : 'Télécharger un logo'}
                               </p>
                               <p className="text-sm text-gray-500 mb-1">
                                 PNG, JPG, JPEG • Maximum 5MB
                               </p>
                               <p className="text-xs text-gray-400">
                                 Recommandé: 200x200px, fond transparent
                               </p>
                             </div>
                           </div>
                         </div>
                       </div>
                     </div>
                   </>
                 ) : (
                   <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-2">
                       Années d'expérience
                     </label>
                     <input
                       type="number"
                       name="experience_years"
                       value={formData.experience_years}
                       onChange={handleInputChange}
                       className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-job-navy focus:border-transparent transition-all"
                       min="0"
                       max="50"
                       placeholder="Nombre d'années"
                     />
                   </div>
                 )}

                 {profile?.user_type === 'candidate' && (
                   <>
                     <div>
                       <label className="block text-sm font-semibold text-gray-700 mb-2">
                         Poste recherché
                       </label>
                       <input
                         type="text"
                         name="poste"
                         value={formData.poste}
                         onChange={handleInputChange}
                         className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-job-navy focus:border-transparent transition-all"
                         placeholder="Ex: Développeur Full Stack"
                       />
                     </div>

                     <div>
                       <label className="block text-sm font-semibold text-gray-700 mb-2">
                         Disponibilité
                       </label>
                       <select
                         name="disponibilite"
                         value={formData.disponibilite}
                         onChange={handleInputChange}
                         className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-job-navy focus:border-transparent transition-all"
                       >
                         <option value="">Sélectionner...</option>
                         <option value="Immédiate">Immédiate</option>
                         <option value="Bientôt">Bientôt</option>
                         <option value="Pas disponible">Pas disponible</option>
                       </select>
                     </div>
                   </>
                 )}
                 <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-2">
                     LinkedIn
                   </label>
                   <input
                     type="url"
                     name="linkedin_url"
                     value={formData.linkedin_url}
                     onChange={handleInputChange}
                     className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-job-navy focus:border-transparent transition-all"
                     placeholder="https://linkedin.com/in/..."
                   />
                 </div>
               </div>

               <div className="mt-6">
                 <label className="block text-sm font-semibold text-gray-700 mb-2">
                   {profile?.user_type === 'employer' ? 'Description de l\'entreprise' : 'À propos de moi'}
                 </label>
                 <textarea
                   name="bio"
                   value={formData.bio}
                   onChange={handleInputChange}
                   rows={4}
                   className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-job-navy focus:border-transparent transition-all"
                   placeholder={profile?.user_type === 'employer' 
                     ? "Décrivez votre entreprise, ses valeurs et sa mission..." 
                     : "Parlez de vous, vos passions, vos objectifs professionnels..."
                   }
                 />
               </div>

               {profile?.user_type === 'candidate' && (
                 <div className="mt-6">
                   <label className="block text-sm font-semibold text-gray-700 mb-2">
                     Compétences
                   </label>
                   
                   <div className="flex space-x-2 mb-4">
                     <input
                       type="text"
                       value={newSkill}
                       onChange={(e) => setNewSkill(e.target.value)}
                       onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                       className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-job-navy focus:border-transparent transition-all"
                       placeholder="Ajouter une compétence..."
                     />
                     <Button
                       onClick={addSkill}
                       type="button"
                       className="bg-job-navy hover:bg-job-navy-dark text-white px-6 py-3 rounded-xl font-semibold transition-all"
                     >
                       Ajouter
                     </Button>
                   </div>
                   
                   <div className="flex flex-wrap gap-2">
                     {formData.skills.map((skill, index) => (
                       <span
                         key={index}
                         className="inline-flex items-center px-3 py-1 bg-job-navy/10 text-job-navy rounded-full text-sm font-medium border border-job-navy/20"
                       >
                         {skill}
                         <button
                           onClick={() => removeSkill(skill)}
                           className="ml-2 text-job-navy hover:text-red-500 transition-colors"
                         >
                           <X className="h-3 w-3" />
                         </button>
                       </span>
                     ))}
                   </div>
                 </div>
               )}

               {/* Espacement pour le scroll */}
               <div className="h-24"></div>
             </div>

             {/* Footer fixe */}
             <div className="p-6 bg-gray-50 flex justify-end space-x-4 flex-shrink-0 border-t border-gray-200 rounded-b-3xl">
               <Button
                 onClick={handleCancel}
                 className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-8 py-3 rounded-xl font-semibold transition-all"
               >
                 Annuler
               </Button>
               <Button
                 onClick={handleSave}
                 disabled={saveLoading}
                 className="bg-gradient-elegant hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-white px-8 py-3 rounded-xl font-semibold flex items-center"
               >
                 {saveLoading ? (
                   <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                 ) : (
                   <Save className="h-4 w-4 mr-2" />
                 )}
                 Sauvegarder
               </Button>
             </div>
           </div>
         </div>
       )}

       {/* Modals */}
       {profile?.user_type === 'candidate' && (
         <OptimizeProfile 
           isOpen={showOptimizeModal} 
           onClose={() => setShowOptimizeModal(false)} 
         />
       )}

       <VerifyProfile 
         isOpen={showVerifyModal} 
         onClose={() => setShowVerifyModal(false)} 
       />
       
     </div>
     
     {/* Footer */}
     <Footer />
   </>
   
 );
};

export default Profile;