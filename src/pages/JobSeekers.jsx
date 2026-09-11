import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PremiumButton from '@/components/PremiumButton';
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  Users, 
  Briefcase, 
  Plus,
  Eye,
  Calendar,
  Building,
  Star,
  ArrowRight,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Send,
  Paperclip,
  FileText,
  Mail,
  CheckCircle,
  AlertCircle,
  Zap,
  Crown,
  Phone,
  Target,
  Sparkles,
  Gift,
  Rocket,
  BadgeCheck,
  Activity,
  Shield,
  MessageSquare,
  TrendingUp,
  Building2,
  Heart,
  ExternalLink,
  UserPlus,
  Award,
  Bookmark,
  Share2,
  Download,
  User,
  GraduationCap,
  Compass,
  Coffee,
  Lightbulb,
  Handshake,
  Edit3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { databases, storage, DATABASE_ID } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import VerifiedBadge from '@/components/ui/VerifiedBadge';

// NOUVEAU : Import du modal
import ProfileModal from '@/components/ProfileModal';

// Provinces de Madagascar
const PROVINCES_MADAGASCAR = [
  'Antananarivo',
  'Fianarantsoa', 
  'Toamasina',
  'Mahajanga',
  'Toliara',
  'Antsiranana',
  'Sambava',
  'Morondava',
  'Manakara',
  'Ambilobe',
  'Antsohihy',
  'Maintirano',
  'Manja',
  'Miandrivazo',
  'Sakaraha',
  'Ihosy',
  'Farafangana',
  'Vangaindrano',
  'Ambositra',
  'Antsirabe',
  'Moramanga',
  'Ambatondrazaka',
  'Maroantsetra',
  'Vohémar'
];

// Categories professionnelles
const JOB_CATEGORIES = [
    'Développeur Full Stack',
    'Développeur Frontend', 
    'Développeur Backend',
    'Designer UX/UI',
    'Marketing Digital', 
    'Comptable',
    'Ressources Humaines',
    'Commercial',
    'Chef de projet',
    'Data Analyst',
    // ... autres postes selon vos besoins
  ];

// Carrousel des demandes mises en avant
const FeaturedDemandsCarousel = ({ demands }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (demands.length > 3) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % demands.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [demands.length]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % demands.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + demands.length) % demands.length);
  };

  const getVisibleDemands = () => {
    const visibleDemands = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % demands.length;
      visibleDemands.push(demands[index]);
    }
    return visibleDemands;
  };

  const visibleDemands = getVisibleDemands();

  return (
    <div className="bg-gradient-to-r from-job-gold via-job-orange to-job-dark-gold rounded-3xl p-4 md:p-8 relative overflow-hidden sticky top-24 z-10 shadow-2xl mt-8">
      <div className="absolute inset-0 bg-black/10"></div>
      
      

      {/* Styles CSS intégrés */}
      <style>{`
        @keyframes slideIn {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInCard {
          0% {
            opacity: 0;
            transform: translateX(30px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        .animate-slide-in {
          animation: slideInCard 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

// Widget des dernières demandes pour la sidebar
const RecentDemandsWidget = ({ demands, onViewProfile }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (demands.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % demands.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [demands.length]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % demands.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + demands.length) % demands.length);
  };

  if (!demands.length) {
    return (
      <div className="text-center py-8">
        <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Aucune demande récente</p>
      </div>
    );
  }

  return (
    <div className="relative bg-white rounded-2xl shadow-xl border-2 border-job-gold overflow-hidden">
      <div className="bg-gradient-to-r from-job-gold to-job-dark-gold p-4 flex items-center justify-between">
        <h3 className="font-bold text-white text-lg flex items-center">
          <BadgeCheck className="h-5 w-5 mr-2" />
          Talents Vérifiés
        </h3>
        <span className="text-white/80 text-sm font-medium">
          {demands.length} profils
        </span>
      </div>

      <div className="relative h-80 overflow-hidden">
        <div
          className="transition-transform duration-500 ease-in-out h-full"
          style={{ transform: `translateY(-${currentIndex * 100}%)` }}
        >
          {demands.map((demand, index) => (
            <div
              key={demand.$id || demand.id || index}
              className="h-full block cursor-pointer transform transition-all duration-300 hover:scale-105"
              onClick={() => onViewProfile && onViewProfile(demand)}
            >
              <div className="h-full p-6 flex flex-col justify-between bg-gradient-to-br from-white via-job-cream to-job-light-gold hover:from-job-light-gold hover:via-job-cream hover:to-white border-b border-job-gold/20">
                <div>
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4 shadow-lg border-2 border-gray-100 bg-white overflow-hidden">
                      {demand.avatar_url ? (
                        <img 
                          src={demand.avatar_url} 
                          alt={`Photo de ${demand.full_name}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-job-gold to-job-orange rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-bold text-job-brown text-sm line-clamp-1 hover:text-job-gold transition-colors">
                        {demand.title}
                      </h4>
                      <p className="text-gray-600 text-xs font-medium">{demand.full_name}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-xs text-gray-600">
                    <div className="flex items-center">
                      <div className="w-5 h-5 bg-job-gold/20 rounded-full flex items-center justify-center mr-2">
                        <MapPin className="h-3 w-3 text-job-gold" />
                      </div>
                      <span className="font-medium">{demand.location}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                        <Briefcase className="h-3 w-3 text-blue-600" />
                      </div>
                      <span>{demand.category}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-job-gold/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Voir le profil</span>
                    <div className="w-6 h-6 bg-job-gold rounded-full flex items-center justify-center">
                      <ArrowRight className="h-3 w-3 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {demands.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            <button
              onClick={goToPrev}
              className="p-2 bg-gradient-to-br from-job-purple to-job-pink hover:bg-white rounded-full shadow-lg transition-all"
            >
              <ChevronUp className="h-3 w-3 text-white" />
            </button>
            <button
              onClick={goToNext}
              className="p-2 bg-gradient-to-br from-job-purple to-job-pink hover:bg-white rounded-full shadow-lg transition-all"
            >
              <ChevronDown className="h-3 w-3 text-white" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const JobSeekers = () => {
  const [demands, setDemands] = useState([]);
  const [featuredDemands, setFeaturedDemands] = useState([]);
  const [recentDemands, setRecentDemands] = useState([]);
  const [verifiedProfiles, setVerifiedProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // NOUVEAU : États pour le modal
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalDemands, setTotalDemands] = useState(0);
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [unverifiedCount, setUnverifiedCount] = useState(0);
  const demandsPerPage = 20;
  const totalPages = Math.ceil(totalDemands / demandsPerPage);
  
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    location: '',
    experience: '',
    availability: '',
    verified: ''
  });

  const navigate = useNavigate();
  const { user, profile, isEmployer, isCandidate, isPremium } = useAuth();

  useEffect(() => {
    debugAppwriteData();
    loadInitialData();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      loadDemandsWithFilters();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [filters]);

  useEffect(() => {
    if (currentPage > 1) {
      loadDemandsWithFilters();
    }
  }, [currentPage]);

  // NOUVELLE fonction pour gérer les filtres
  const loadDemandsWithFilters = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 Chargement des profils...');
      
      const queries = [
        Query.equal('user_type', 'candidate'),
        // Query.equal('is_active', true),  // Commenté pour afficher tous les profils
        Query.orderDesc('$createdAt'),
        Query.limit(10000)
      ];
  
      const response = await databases.listDocuments(
        DATABASE_ID,
        'profiles',
        queries
      );
  
      console.log('📊 Total profils récupérés:', response.documents.length);
  
      if (!response.documents || response.documents.length === 0) {
        console.log('❌ Aucun profil trouvé');
        setDemands([]);
        setTotalDemands(0);
        setLoading(false);
        return;
      }
  
      // Mapper les données
      const profilesData = response.documents.map((profile) => ({
        id: profile.$id,
        title: profile.poste || 'Candidat',
        full_name: profile.full_name || 'Nom non défini',
        category: profile.poste || 'Non spécifié',
        location: profile.location || 'Madagascar',
        experience: profile.experience_years ? `${profile.experience_years} ans` : 'Non spécifié',
        availability: profile.disponibilite || 'Non spécifié',
        description: profile.bio || 'Aucune description disponible',
        skills: Array.isArray(profile.skills) ? profile.skills : [],
        views_count: 0,
        created_at: profile.$createdAt,
        avatar_url: profile.avatar_url,
        is_featured: profile.is_verified || false,
        is_urgent: profile.disponibilite === 'Immédiate',
        is_verified: profile.is_verified,
        linkedin_url: profile.linkedin_url,
        cv_url: profile.cv_url,
        portfolio_url: profile.portfolio_url,
        email: profile.email || '',
        phone: profile.phone || '',
        salary_expected: null,
        isCurrentUser: user && profile.$id === user.$id
      }));
      
      console.log('✅ Profils mappés:', profilesData.length);
      
      // ✅ TRI : Vérifiés en premier, puis par date
      profilesData.sort((a, b) => {
        // 1. Profils vérifiés en premier
        if (a.is_verified && !b.is_verified) return -1;
        if (!a.is_verified && b.is_verified) return 1;
        
        // 2. Si même statut de vérification, trier par date (récents en premier)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      
      console.log('✅ Profils triés (vérifiés en premier)');

      // Mettre à jour les compteurs globaux (avant filtres)
      const verified = profilesData.filter(p => p.is_verified);
      setVerifiedCount(verified.length);
      setUnverifiedCount(profilesData.filter(p => !p.is_verified).length);
      setVerifiedProfiles(verified);

      // Appliquer les filtres
      let allDemands = [...profilesData];
      
      if (filters.search && filters.search.trim() !== '') {
        allDemands = allDemands.filter(d => 
          d.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          d.full_name.toLowerCase().includes(filters.search.toLowerCase()) ||
          d.description.toLowerCase().includes(filters.search.toLowerCase()) ||
          (d.skills && d.skills.some(skill => 
            skill.toLowerCase().includes(filters.search.toLowerCase())
          ))
        );
      }
      
      if (filters.category && filters.category !== '') {
        allDemands = allDemands.filter(d => 
          d.category && d.category.toLowerCase().includes(filters.category.toLowerCase())
        );
      }
      
      if (filters.location && filters.location !== '') {
        allDemands = allDemands.filter(d => 
          d.location && d.location.includes(filters.location)
        );
      }
  
      if (filters.availability && filters.availability !== '') {
        allDemands = allDemands.filter(d => d.availability === filters.availability);
      }
      
      if (filters.verified && filters.verified !== '') {
        allDemands = allDemands.filter(d => {
          const isVerified = d.is_verified === true || d.is_verified === 1 || d.is_verified === "true";
          
          if (filters.verified === 'true') return isVerified;
          if (filters.verified === 'false') return !isVerified;
          return true;
        });
      }
  
      console.log('📊 Après filtres:', allDemands.length);
      
      // Pagination
      const startIndex = (currentPage - 1) * demandsPerPage;
      const endIndex = startIndex + demandsPerPage;
      const paginatedDemands = allDemands.slice(startIndex, endIndex);
      
      console.log(`📄 Page ${currentPage}: Affichage de ${paginatedDemands.length} profils (${startIndex} à ${endIndex})`);
      
      setDemands(paginatedDemands);
      setTotalDemands(allDemands.length);
      
      console.log('✅ État final - demands:', paginatedDemands.length, 'total:', allDemands.length);
      
    } catch (error) {
      console.error('❌ Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        'profiles',
        [
          Query.equal('user_type', 'candidate'),
          Query.orderDesc('$createdAt'),
          Query.limit(10000)
        ]
      );

      if (!response.documents) {

        setLoading(false);
        return;
      }
  
  
      // Mapper les données Appwrite au format attendu
      const mappedProfiles = response.documents.map((profile) => ({
        id: profile.$id,
        title: profile.poste || 'Candidat',
        full_name: profile.full_name || 'Nom non défini',
        category: profile.poste || 'Non spécifié',
        location: profile.location || 'Madagascar',
        experience: profile.experience_years ? `${profile.experience_years} ans` : 'Non spécifié',
        availability: profile.disponibilite || 'Non spécifié',
        description: profile.bio || 'Aucune description disponible',
        skills: Array.isArray(profile.skills) ? profile.skills : [],
        views_count: 0,
        created_at: profile.$createdAt,
        avatar_url: profile.avatar_url,
        is_featured: profile.is_verified || false,
        is_urgent: profile.disponibilite === 'Immédiate',
        is_verified: profile.is_verified,
        linkedin_url: profile.linkedin_url,
        cv_url: profile.cv_url,
        portfolio_url: profile.portfolio_url,
        email: profile.email || '',
        phone: profile.phone || '',
        salary_expected: null,
        isCurrentUser: user && profile.$id === user.$id
      }));
  
  
      // Tri : vérifiés en premier, puis par date décroissante
      mappedProfiles.sort((a, b) => {
        if (a.is_verified && !b.is_verified) return -1;
        if (!a.is_verified && b.is_verified) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      // Mettre à jour les compteurs globaux
      const verified = mappedProfiles.filter(p => p.is_verified);
      const unverified = mappedProfiles.filter(p => !p.is_verified);
      setVerifiedCount(verified.length);
      setUnverifiedCount(unverified.length);
      setVerifiedProfiles(verified);

      // Séparer les profils mis en avant et récents
      const featuredData = verified;
      const recentData = mappedProfiles.slice(0, 6);

      setFeaturedDemands(featuredData.slice(0, 6));
      setRecentDemands(recentData.slice(0, 3));

      setDemands(mappedProfiles.slice(0, demandsPerPage));
      setTotalDemands(mappedProfiles.length);
      
    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  };
  
  const loadDemands = async (allProfiles = null) => {
    try {
      setLoading(true);
      
      let profilesData = allProfiles;
      
      if (!profilesData) {
        const response = await databases.listDocuments(
          DATABASE_ID,
          'profiles',
          [
            Query.equal('user_type', 'candidate'),
            Query.orderDesc('$createdAt'),
            Query.limit(10000)
          ]
        );
  
        if (!response.documents || response.documents.length === 0) {
          setDemands([]);
          setTotalDemands(0);
          setLoading(false);
          return;
        }
  
        // Mapper les données
        profilesData = response.documents.map((profile) => ({
          id: profile.$id,
          title: profile.poste || 'Candidat',
          full_name: profile.full_name || 'Nom non défini',
          category: profile.poste || 'Non spécifié',
          location: profile.location || 'Madagascar',
          experience: profile.experience_years ? `${profile.experience_years} ans` : 'Non spécifié',
          availability: profile.disponibilite || 'Non spécifié',
          description: profile.bio || 'Aucune description disponible',
          skills: Array.isArray(profile.skills) ? profile.skills : [],
          views_count: 0,
          created_at: profile.$createdAt,
          avatar_url: profile.avatar_url,
          is_featured: profile.is_verified || false,
          is_urgent: profile.disponibilite === 'Immédiate',
          is_verified: profile.is_verified,
          linkedin_url: profile.linkedin_url,
          cv_url: profile.cv_url,
          portfolio_url: profile.portfolio_url,
          email: profile.email || '',
          phone: profile.phone || '',
          salary_expected: null,
          isCurrentUser: user && profile.$id === user.$id
        }));
      }
      
      // Tri : vérifiés en premier, puis par date décroissante
      profilesData.sort((a, b) => {
        if (a.is_verified && !b.is_verified) return -1;
        if (!a.is_verified && b.is_verified) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      // Appliquer les filtres (même code que avant)
      let filteredDemands = [...profilesData];
      
      if (filters.search) {
        filteredDemands = filteredDemands.filter(d => 
          d.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          d.full_name.toLowerCase().includes(filters.search.toLowerCase()) ||
          d.description.toLowerCase().includes(filters.search.toLowerCase()) ||
          (d.skills && d.skills.some(skill => 
            skill.toLowerCase().includes(filters.search.toLowerCase())
          ))
        );
      }
      
      if (filters.category) {
        filteredDemands = filteredDemands.filter(d => 
          d.category && d.category.toLowerCase().includes(filters.category.toLowerCase())
        );
      }
      
      if (filters.location) {
        filteredDemands = filteredDemands.filter(d => 
          d.location && d.location.includes(filters.location)
        );
      }
  
      if (filters.availability) {
        filteredDemands = filteredDemands.filter(d => d.availability === filters.availability);
      }
      
      // Pagination
      const startIndex = (currentPage - 1) * demandsPerPage;
      const endIndex = startIndex + demandsPerPage;
      const paginatedDemands = filteredDemands.slice(startIndex, endIndex);
      
      setDemands(paginatedDemands);
      setTotalDemands(filteredDemands.length);
    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  };

  const getProfileViews = async (_profileId) => {
    return 0;
  };

  // AJOUT : Debug de la table profiles
  const debugAppwriteData = async () => {
    try {
      
      // Vérifier si la collection existe et contient des données
      const allProfiles = await databases.listDocuments(
        DATABASE_ID,
        'profiles'
      );
      
      
      // Vérifier les candidats spécifiquement
      const candidates = await databases.listDocuments(
        DATABASE_ID,
        'profiles',
        [Query.equal('user_type', 'candidate')]
      );
      
      
      // Vérifier les candidats actifs
      const activeCandidates = await databases.listDocuments(
        DATABASE_ID,
        'profiles',
        [
          Query.equal('user_type', 'candidate'),
          Query.equal('is_active', true)
        ]
      );
      
      
    } catch (error) {
      
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      location: '',
      experience: '',
      availability: '',
      verified: '' // ← AJOUT
    });
  };

  const handleCreateDemand = () => {
    if (!user) {
        navigate('/login', { 
          state: { 
            from: '/candidates', 
            message: 'Connectez-vous pour publier votre demande d\'emploi' 
          } 
        });
        return;
      }
      
      if (!isCandidate) {
        navigate('/login', { 
          state: { 
            message: 'Seuls les candidats peuvent publier des demandes d\'emploi' 
          } 
        });
        return;
      }
      
      navigate('/create-demand');
    };

    const getTimeAgo = (date) => {
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - new Date(date).getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return 'Aujourd\'hui';
      if (diffDays === 2) return 'Hier';
      if (diffDays <= 7) return `Il y a ${diffDays} jours`;
      if (diffDays <= 30) return `Il y a ${Math.ceil(diffDays / 7)} semaines`;
      return `Il y a ${Math.ceil(diffDays / 30)} mois`;
    };

  // NOUVEAU : Fonction pour ouvrir le modal
  const handleViewProfile = (demand) => {
    setSelectedProfile(demand);
    setIsModalOpen(true);
  };

  // NOUVEAU : Fonction pour fermer le modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProfile(null);
  };

  return (
    <ProtectedRoute isPublic={false} requireAuth={true}>
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#fffaf0',
      textAlign: 'left', 
      maxWidth: 'none',
      width: '100%',
      margin: 0,
      padding: 0
    }}>
      <Navbar />
      
      {/* Header avec recherche */}
      <section style={{
        paddingTop: '120px',
        paddingBottom: '32px',
        background: 'linear-gradient(135deg, #D4AF37 0%, #F39C12 50%, #AA8C3E 100%)',
        color: 'white',
        width: '100%',
        textAlign: 'left'
      }}>
        <div style={{ 
          maxWidth: '1280px', 
          margin: '0 auto', 
          padding: '0 60px',
          width: '100%'
        }}>
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">
              👥 Découvrez les Talents de Madagascar
            </h1>
                   
            {/* Barre de recherche */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl mb-8">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="none flex-1 relative">
                  
                  <input
                    type="text"
                    placeholder="Rechercher un profil, une compétence..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-job-gold text-gray-900 font-medium"
                  />
                </div>
                <div className="none relative min-w-[200px]">
                  <select
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="w-full pl-12 pr-8 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-job-gold text-gray-900 appearance-none bg-white font-medium"
                  >
                    <option value="">Toute localisation</option>
                    {PROVINCES_MADAGASCAR.map(province => (
                      <option key={province} value={province}>{province}</option>
                    ))}
                  </select>
                </div>
                <Button 
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className={`px-6 py-4 rounded-xl flex items-center space-x-2 transition-all font-bold border-2 whitespace-nowrap ${
                    showAdvancedFilters 
                      ? 'bg-job-gold text-white border-job-gold' 
                      : 'bg-white text-job-gold border-job-gold hover:bg-gray-100'
                  }`}
                >
                  <Filter className="h-5 w-5" />
                  <span>Filtres avancés</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
                </Button>
              </div>
            </div>

            {/* Filtres avancés */}
{showAdvancedFilters && (
  <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-2 border-job-gold">
    <h3 className="text-lg font-bold text-job-brown mb-6 flex items-center">
      <Filter className="h-5 w-5 mr-2 text-job-gold" />
      Filtres avancés
    </h3>
    
    {/* Première ligne - Filtres principaux */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-black mb-6">
      <div>
        <label className="block text-sm font-medium text-black mb-2">Catégorie</label>
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-job-gold"
        >
          <option value="">Toutes les catégories</option>
          {JOB_CATEGORIES.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Expérience</label>
        <select
          value={filters.experience}
          onChange={(e) => handleFilterChange('experience', e.target.value)}
          className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-job-gold"
        >
          <option value="">Tous niveaux</option>
          <option value="0-1 an">0-1 an</option>
          <option value="1-3 ans">1-3 ans</option>
          <option value="3-5 ans">3-5 ans</option>
          <option value="5+ ans">5+ ans</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Disponibilité</label>
        <select
          value={filters.availability}
          onChange={(e) => handleFilterChange('availability', e.target.value)}
          className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-job-gold"
        >
          <option value="">Toutes</option>
          <option value="Immédiate">Immédiate</option>
          <option value="Dans 1 semaine">Dans 1 semaine</option>
          <option value="Dans 1 mois">Dans 1 mois</option>
          <option value="Dans 3 mois">Dans 3 mois</option>
        </select>
      </div>
    </div>

    {/* Deuxième ligne - Filtre de vérification magnifique */}
    <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-6 border-2 border-blue-200">
      <div className="flex items-center mb-4">
        <Shield className="h-6 w-6 text-blue-600 mr-3" />
        <h4 className="text-lg font-bold text-gray-800">Filtrer par vérification</h4>
      </div>
      
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => handleFilterChange('verified', '')}
          className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 ${
            filters.verified === '' 
              ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-black shadow-lg' 
              : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-gray-400'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Tous les profils</span>
        </button>
        
        <button
          onClick={() => handleFilterChange('verified', 'true')}
          className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 ${
            filters.verified === 'true' 
              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg transform scale-105' 
              : 'bg-white text-green-600 border-2 border-green-200 hover:border-green-400 hover:bg-green-50'
          }`}
        >
          <CheckCircle className="h-4 w-4" />
          <span>Profils vérifiés</span>
        </button>
        
        <button
          onClick={() => handleFilterChange('verified', 'false')}
          className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 ${
            filters.verified === 'false' 
              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg transform scale-105' 
              : 'bg-white text-red-600 border-2 border-red-200 hover:border-red-400 hover:bg-red-50'
          }`}
        >
          <X className="h-4 w-4" />
          <span>Profils non vérifiés</span>
        </button>
      </div>
    </div>

    <div className="flex justify-between items-center mt-6">
      <button 
        onClick={clearFilters}
        className="text-job-gold hover:text-job-dark-gold font-medium transition-colors flex items-center"
      >
        <X className="h-4 w-4 mr-2" />
        Effacer tous les filtres
      </button>
      
      <div className="text-sm text-gray-600">
        {totalDemands} profils trouvés
      </div>
    </div>
  </div>
)}

          </div>
        </div>
      </section>

      {/* Carrousel des talents à la une */}
      <div style={{ 
        width: '100%', 
        padding: '32px 16px 24px 16px',
        margin: 0,
        textAlign: 'left'
      }}>
        <div style={{ 
          maxWidth: '1500px', 
          margin: '0 auto',
          width: '100%'
        }}>
          <FeaturedDemandsCarousel demands={featuredDemands} />
        </div>
      </div>

      {/* Contenu principal - 3 colonnes */}
      <div style={{ 
        width: '100%', 
        padding: '0 16px 32px 16px',
        margin: 0,
        textAlign: 'left'
      }}>
        <div style={{ 
          maxWidth: '100%', 
          margin: '15px auto',
          paddingLeft:'50px',
          paddingRight:'50px',
          width: '100%'
        }}>

          <div style={{ 
            display: 'flex', 
            gap: '24px', 
            minHeight: '800px',
            width: '100%'
          }}>
            
            {/* Colonne gauche - Widgets et filtres */}
            <div style={{ 
              width: '25%', 
              minHeight: '600px',
              padding: '16px'
            }}>
              <div className="sticky top-24 space-y-6">
                {/* Widget Publier une demande pour candidats */}
                <div className="bg-gradient-to-br from-job-purple to-job-pink rounded-3xl p-6 text-white shadow-2xl transform hover:scale-105 transition-transform">
                  <div className="flex items-center justify-between mb-4">
                    <UserPlus className="h-12 w-12 text-white" />
                    <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold">
                      CANDIDAT
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-3">
                    Publiez votre Profil
                  </h3>
                  <p className="text-white/90 mb-4 text-sm">
                    Mettez en avant vos compétences et trouvez votre emploi idéal !
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center text-sm">
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mr-3">
                        <Eye className="h-3 w-3" />
                      </div>
                      <span>Visibilité maximale</span>
                    </li>
                    <li className="flex items-center text-sm">
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mr-3">
                        <Target className="h-3 w-3" />
                      </div>
                      <span>Contact direct employeurs</span>
                    </li>
                    <li className="flex items-center text-sm">
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mr-3">
                        <Handshake className="h-3 w-3" />
                      </div>
                      <span>Opportunités exclusives</span>
                    </li>
                  </ul>
                  <PremiumButton 
                                variant="default"
                                className="w-full md:w-auto"
                              >
                               Créer mon Profil
                              </PremiumButton>
                </div>

                {/* Filtres rapides */}
                <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-job-brown flex items-center">
                      <Filter className="h-5 w-5 mr-2 text-job-gold" />
                      Filtres rapides
                    </h3>
                    <button 
                      onClick={clearFilters}
                      className="text-job-gold hover:text-job-dark-gold text-sm font-medium transition-colors"
                    >
                      Effacer
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                      <select
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-job-gold"
                      >
                        <option value="">Toutes</option>
                        {JOB_CATEGORIES.slice(0, 5).map(category => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Expérience</label>
                      <select
                        value={filters.experience}
                        onChange={(e) => handleFilterChange('experience', e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-job-gold"
                      >
                        <option value="">Tous niveaux</option>
                        <option value="0-1 an">Débutant (0-1 an)</option>
                        <option value="1-3 ans">Junior (1-3 ans)</option>
                        <option value="3-5 ans">Senior (3-5 ans)</option>
                        <option value="5+ ans">Expert (5+ ans)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Widget Conseils */}
                <div className="none bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                  <div className="flex items-center mb-4">
                    <Lightbulb className="h-6 w-6 text-job-gold mr-3" />
                    <h3 className="font-bold text-job-brown">Conseils Recrutement</h3>
                  </div>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-job-gold rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Soyez précis dans votre profil</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-job-gold rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Mettez à jour régulièrement</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-job-gold rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Ajoutez un portfolio</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-job-gold rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Répondez rapidement</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Colonne centrale - Liste des demandes */}
            <div style={{ 
              width: '50%', 
              backgroundColor: 'transparent', 
              minHeight: '600px',
              padding: '0',
              
            }}>
              <div className="space-y-6">
                
                {/* Header avec stats et options */}
                <div className="top1 bg-white rounded-2xl shadow-xl border-2 border-job-gold p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div>
                      <h2 className="text-2xl font-bold text-job-brown mb-2">
                        {loading ? '⏳ Chargement...' : `👥 ${totalDemands} profils disponibles`}
                      </h2>
                      {!loading && (
                        <div className="flex flex-wrap items-center gap-3 mt-1">
                          <button
                            onClick={() => handleFilterChange('verified', filters.verified === 'true' ? '' : 'true')}
                            className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full transition-all ${
                              filters.verified === 'true'
                                ? 'bg-green-500 text-white shadow'
                                : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-300'
                            }`}
                          >
                            <CheckCircle className="h-4 w-4" />
                            {verifiedCount} vérifiés
                          </button>
                          <span className="text-gray-300 text-xs">•</span>
                          <button
                            onClick={() => handleFilterChange('verified', filters.verified === 'false' ? '' : 'false')}
                            className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full transition-all ${
                              filters.verified === 'false'
                                ? 'bg-gray-500 text-white shadow'
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-300'
                            }`}
                          >
                            <AlertCircle className="h-4 w-4" />
                            {unverifiedCount} non vérifiés
                          </button>
                        </div>
                      )}
                      <p className="text-gray-600 mt-2">
                        Page {currentPage} sur {totalPages} - Découvrez les meilleurs talents
                      </p>
                    </div>
                  </div>
                </div>

              {/* ✅ BARRE DE RECHERCHE PAR NOM - NOUVEAU */}
              <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-6">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-orange-500" />
                  </div>
                  <input
                    type="text"
                    placeholder="🔍 Rechercher un profil par nom..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-xl shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all text-gray-900 placeholder-gray-500 font-medium"
                  />
                  {filters.search && (
                    <button
                      onClick={() => handleFilterChange('search', '')}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-orange-600 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
                
                {/* Résultats de recherche */}
                {filters.search && (
                  <div className="mt-3 flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-medium">
                      {totalDemands} profil{totalDemands > 1 ? 's' : ''} trouvé{totalDemands > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>

                {/* Liste des demandes */}
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="bg-white rounded-2xl p-6 shadow-lg animate-pulse border border-gray-100">
                        <div className="flex space-x-4">
                          <div className="h-16 w-16 bg-gray-200 rounded-full"></div>
                          <div className="flex-1 space-y-3">
                            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : demands.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl shadow-xl border-2 border-gray-200">
                    <Users className="h-20 w-20 text-gray-300 mx-auto mb-6" />
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                      🔍 Aucun profil trouvé
                    </h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      Essayez de modifier vos critères de recherche ou consultez nos talents vedettes.
                    </p>
                    <div className="flex gap-4 justify-center">
                      <Button onClick={clearFilters} variant="outline" className="border-2 border-job-gold text-job-gold hover:bg-job-cream">
                        Réinitialiser les filtres
                      </Button>
                      {isCandidate && (
                        <Button 
                          onClick={handleCreateDemand}
                          className="bg-gradient-to-r from-job-gold to-job-dark-gold text-white"
                        >
                          Publier mon profil
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {demands.map((demand, index) => (
                      <div 
                      key={demand.$id || demand.id || index} 
                        className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-job-gold cursor-pointer group"
                        onClick={() => handleViewProfile(demand)}
                      >
                        <div className="flex items-start flex-col md:flex-row md:space-x-6 gap-4 md:gap-0">
                          {/* Photo de profil */}
                          <div className="relative h-16 w-16 flex-shrink-0 group-hover:scale-110 transition-transform">
                          <div className="relative h-16 w-16 flex-shrink-0 group-hover:scale-110 transition-transform">
                          <div className="h-16 w-16 rounded-full shadow-lg border-2 border-gray-100 bg-white overflow-hidden">
                            {demand.avatar_url ? (
                              <img 
                                src={demand.avatar_url} 
                                alt={`Photo de ${demand.full_name}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-r from-job-gold to-job-orange rounded-full flex items-center justify-center">
                                <User className="h-8 w-8 text-white" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Badge avec texte à côté */}
                        <div className="mt-2">
                          <VerifiedBadge 
                            size="small"
                            variant={demand.is_premium ? 'gold' : 'blue'}
                            isVerified={demand.is_verified}
                            showText={true}
                            showTooltip={false}
                          />
                        </div>
                    </div>

                          {/* Contenu principal */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                                  <h3 className="text-lg md:text-xl font-bold text-job-brown group-hover:text-job-gold transition-colors line-clamp-1">
                                    {demand.title}
                                  </h3>
                                  {demand.is_featured && (
                                    <div className="bg-gradient-to-r from-blue-400 to-purple-400 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center">
                                      <Star className="h-3 w-3 mr-1" />
                                      Talent
                                    </div>
                                  )}
                                  {demand.is_urgent && (
                                    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center animate-pulse">
                                      <Zap className="h-3 w-3 mr-1" />
                                      Disponible
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-2 md:gap-4 text-sm text-gray-600 mb-3">
                                  <span className="font-bold text-job-gold">{demand.full_name}</span>
                                  <span className="flex items-center">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    {demand.location}
                                  </span>
                                  <span className="flex items-center">
                                    <Clock className="h-4 w-4 mr-1" />
                                    {getTimeAgo(demand.created_at)}
                                  </span>
                                  <span className="flex items-center text-green-600">
                                    <Eye className="h-4 w-4 mr-1" />
                                    {demand.views_count || 0} vues
                                  </span>
                                </div>

                                <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                                  {demand.description?.substring(0, 150)}...
                                </p>

                                <div className="flex flex-wrap gap-2 mb-3">
                                  <span className="px-3 py-1 bg-gradient-to-r from-job-gold to-job-dark-gold text-white text-xs font-bold rounded-full">
                                    {demand.category}
                                  </span>
                                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                                    {demand.experience}
                                  </span>
                                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                    {demand.availability}
                                  </span>
                                </div>

                                {/* Compétences */}
                                {demand.skills && (
                                  <div className="flex flex-wrap gap-1 mb-3">
                                    {demand.skills.slice(0, 4).map((skill, index) => (
                                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                        {skill}
                                      </span>
                                    ))}
                                    {demand.skills.length > 4 && (
                                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                        +{demand.skills.length - 4} autres
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Actions à droite */}
                              <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start mt-4 md:mt-0 md:space-y-3 md:ml-6">
                                {demand.isCurrentUser ? (
                                  // Bouton modifier pour le profil de l'utilisateur connecté
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate('/profile', { state: { openEditModal: true } });
                                    }}
                                    className="bg-gradient-to-r from-job-gold to-job-dark-gold text-white px-4 py-2 rounded-xl font-medium flex items-center space-x-2 hover:shadow-lg transform hover:scale-105 transition-all"
                                  >
                                    <Edit3 className="h-4 w-4" />
                                    <span>Modifier mon profil</span>
                                  </button>
                                ) : (
                                  <div className="flex items-center text-job-gold group-hover:text-job-dark-gold transition-colors">
                                    <span className="font-bold mr-2 text-sm">Voir le profil</span>
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="bg-white rounded-2xl shadow-xl border-2 border-job-gold p-6">
                      <div className="flex items-center justify-center space-x-2">
                        {/* Bouton Précédent */}
                        <Button
                          variant="outline"
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="p-3 border-2 border-job-gold text-job-gold hover:bg-job-cream disabled:opacity-50"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>

                        {/* Page 1 toujours visible */}
                        <Button
                          variant={1 === currentPage ? "default" : "outline"}
                          onClick={() => setCurrentPage(1)}
                          className={`px-4 py-3 font-bold ${
                            1 === currentPage 
                              ? 'bg-gradient-to-r from-job-gold to-job-dark-gold text-white shadow-lg' 
                              : 'border-2 border-job-gold text-job-gold hover:bg-job-cream'
                          }`}
                        >
                          1
                        </Button>

                        {/* Points de suspension si nécessaire */}
                        {currentPage > 3 && (
                          <span className="px-2 text-gray-400">...</span>
                        )}

                        {/* Pages autour de la page actuelle */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter(page => {
                            // Afficher les pages autour de currentPage (±1)
                            return page > 1 && page < totalPages && Math.abs(page - currentPage) <= 1;
                          })
                          .map(page => (
                            <Button
                              key={page}
                              variant={page === currentPage ? "default" : "outline"}
                              onClick={() => setCurrentPage(page)}
                              className={`px-4 py-3 font-bold ${
                                page === currentPage 
                                  ? 'bg-gradient-to-r from-job-gold to-job-dark-gold text-white shadow-lg' 
                                  : 'border-2 border-job-gold text-job-gold hover:bg-job-cream'
                              }`}
                            >
                              {page}
                            </Button>
                          ))
                        }

                        {/* Points de suspension si nécessaire */}
                        {currentPage < totalPages - 2 && (
                          <span className="px-2 text-gray-400">...</span>
                        )}

                        {/* Dernière page toujours visible */}
                        {totalPages > 1 && (
                          <Button
                            variant={totalPages === currentPage ? "default" : "outline"}
                            onClick={() => setCurrentPage(totalPages)}
                            className={`px-4 py-3 font-bold ${
                              totalPages === currentPage 
                                ? 'bg-gradient-to-r from-job-gold to-job-dark-gold text-white shadow-lg' 
                                : 'border-2 border-job-gold text-job-gold hover:bg-job-cream'
                            }`}
                          >
                            {totalPages}
                          </Button>
                        )}

                        {/* Bouton Suivant */}
                        <Button
                          variant="outline"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="p-3 border-2 border-job-gold text-job-gold hover:bg-job-cream disabled:opacity-50"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="text-center mt-4 text-sm text-gray-600">
                        Affichage de {((currentPage - 1) * demandsPerPage) + 1} à {Math.min(currentPage * demandsPerPage, totalDemands)} sur {totalDemands} profils
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Colonne droite - Widgets et informations */}
            <div style={{ 
              width: '25%', 
              minHeight: '600px',
              padding: '16px'
            }}>
              <div className="sticky top-24 space-y-6">
                {/* Widget des derniers profils */}
                <RecentDemandsWidget demands={verifiedProfiles} onViewProfile={handleViewProfile} />

                {/* Widget Premium - dynamique */}
                {isPremium ? (
                  <div className="relative bg-gradient-to-r from-job-gold via-job-orange to-job-dark-gold rounded-2xl p-6 text-white shadow-2xl overflow-hidden">
                    {/* Effet brillance */}
                    <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                    <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/10 rounded-full blur-lg"></div>

                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                            <Crown className="h-5 w-5 text-yellow-200" />
                          </div>
                          <span className="text-xs font-bold tracking-widest uppercase text-yellow-200">Membre VIP</span>
                        </div>
                        <div className="flex gap-1">
                          <Star className="h-4 w-4 text-yellow-300 fill-yellow-300" />
                          <Star className="h-4 w-4 text-yellow-300 fill-yellow-300" />
                          <Star className="h-4 w-4 text-yellow-300 fill-yellow-300" />
                        </div>
                      </div>

                      <h3 className="text-xl font-extrabold mb-1 text-white">
                        Vous êtes VIP Premium !
                      </h3>
                      <p className="text-yellow-100 text-sm mb-4 leading-relaxed">
                        {isCandidate
                          ? 'Profitez de votre visibilité maximale, accès prioritaire aux offres et contact direct avec les recruteurs.'
                          : 'Profitez de l\'accès illimité aux talents, filtres avancés et mise en relation directe avec les candidats.'}
                      </p>

                      <div className="space-y-2 mb-5">
                        <div className="flex items-center gap-2 text-sm text-yellow-100">
                          <CheckCircle className="h-4 w-4 text-yellow-300 flex-shrink-0" />
                          <span>{isCandidate ? 'Profil mis en avant en priorité' : 'Candidats illimités contactables'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-yellow-100">
                          <CheckCircle className="h-4 w-4 text-yellow-300 flex-shrink-0" />
                          <span>{isCandidate ? 'Badge vérifié visible par tous' : 'Accès aux profils vérifiés'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-yellow-100">
                          <CheckCircle className="h-4 w-4 text-yellow-300 flex-shrink-0" />
                          <span>Support prioritaire 24h/7j</span>
                        </div>
                      </div>

                      <div className="bg-white/15 rounded-xl px-4 py-3 text-center border border-white/20">
                        <p className="text-white font-bold text-sm flex items-center justify-center gap-2">
                          <Sparkles className="h-4 w-4 text-yellow-300" />
                          Statut actif — Merci de votre confiance !
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-job-gold via-job-orange to-job-dark-gold rounded-2xl p-6 text-white shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold flex items-center">
                        <Crown className="h-5 w-5 mr-2" />
                        Premium
                      </h3>
                      <Building className="h-5 w-5 text-white/50" />
                    </div>

                    <p className="text-white/90 text-sm mb-4">
                      Accédez aux services premium et bénéficiez de toutes les fonctionnalités !
                    </p>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-sm">
                        <BadgeCheck className="h-4 w-4 mr-2" />
                        <span>Contact direct illimité</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Search className="h-4 w-4 mr-2" />
                        <span>Filtres avancés</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Shield className="h-4 w-4 mr-2" />
                        <span>Services vérifiés</span>
                      </div>
                    </div>

                    <PremiumButton variant="default" className="w-full md:w-auto">
                      Passer au Premium
                    </PremiumButton>
                  </div>
                )}

                {/* Widget Statistiques */}
                <div className="bg-gradient-to-br from-job-blue via-indigo-500 to-job-purple rounded-2xl p-6 text-white shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold flex items-center">
                      <Activity className="h-5 w-5 mr-2" />
                      Marché des Talents
                    </h3>
                    <TrendingUp className="h-5 w-5 text-white/50" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white/80 text-sm">Nouveaux profils</span>
                      <span className="font-bold text-lg">+{recentDemands.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/80 text-sm">Cette semaine</span>
                      <span className="font-bold text-lg">{Math.ceil(totalDemands / 4)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/80 text-sm">Taux d'embauche</span>
                      <span className="font-bold text-lg">89%</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <div className="flex items-center justify-center">
                      <Shield className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">Profils vérifiés</span>
                    </div>
                  </div>
                </div>

                {/* Widget aide et support */}
                <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-job-cream rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="h-8 w-8 text-job-gold" />
                    </div>
                    <h3 className="font-bold text-job-brown mb-2">Besoin d'aide ?</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Notre équipe vous accompagne dans votre recherche de talents
                    </p>
                    <Link to="/contact">
                   <button className="w-full border-2 border-purple-600 text-purple-600 hover:bg-purple-50 py-3 rounded-xl font-medium transition-all">
                        Nous contacter
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* NOUVEAU : Modal de profil */}
      <ProfileModal 
        demand={selectedProfile}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Styles CSS */}
      <style>{`
        .job-gold { color: #D4AF37; }
        .job-dark-gold { color: #B8860B; }
        .job-light-gold { background-color: #FDF6E3; }
        .job-cream { background-color: #FEF9E7; }
        .job-brown { color: #8B4513; }
        .job-blue { color: #3B82F6; }
        .job-purple { color: #8B5CF6; }
        .job-pink { color: #EC4899; }
        .job-orange { color: #F97316; }

        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .hover\\:scale-105:hover {
          transform: scale(1.05);
        }

        .hover\\:scale-110:hover {
          transform: scale(1.10);
        }

        .transition-transform {
          transition: transform 0.3s ease;
        }

        .transition-all {
          transition: all 0.3s ease;
        }

        .transform-gpu {
          transform: translateZ(0);
          will-change: transform;
        }

        @media (max-width: 1024px) {
          div[style*="width: 25%"] {
            width: 30% !important;
          }
          
          div[style*="width: 50%"] {
            width: 40% !important;
          }
        }

        @media (max-width: 768px) {
          div[style*="display: flex"] {
            flex-direction: column !important;
          }
            .none{
            display: none;
            }

            .top1{
            margin-top: 80px;}
          
          div[style*="width: 25%"], div[style*="width: 50%"] {
            width: 100% !important;
          }

          .sticky {
            position: relative !important;
          }
        }
      `}</style>
    </div>
    </ProtectedRoute>
  );
  
};

export default JobSeekers;