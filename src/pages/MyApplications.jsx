import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PremiumButton from '@/components/PremiumButton';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  Calendar,
  TrendingUp,
  Filter,
  Search,
  ChevronDown,
  FileText,
  Heart,
  Building2,
  Download,
  ExternalLink,
  ChevronRight,
  Star,
  Users,
  Crown,
  Phone,
  Mail,
  Target,
  Sparkles,
  Gift,
  Rocket,
  BadgeCheck,
  Zap,
  Activity,
  Shield,
  MessageSquare,
  Building,
  AlertCircle,
  ChevronUp,
  Plus
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { databases, storage, DATABASE_ID } from '@/lib/appwrite';
import { Query } from 'appwrite';

// Carrousel vertical des dernières offres (réutilisé de JobDetail)
const VerticalJobCarousel = ({ jobs }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [jobsWithLogos, setJobsWithLogos] = useState([]);

  useEffect(() => {
    const loadJobLogos = async () => {
      if (jobs.length === 0) {
        setJobsWithLogos([]);
        return;
      }
  
      try {
        const jobsWithLogosData = await Promise.all(
          jobs.map(async (job) => {
            if (job.employer_id) {
              try {
                const profileData = await databases.getDocument(
                  DATABASE_ID,
                  'profiles',
                  job.employer_id
                );
                
                if (profileData?.company_logo_url) {
                  return { ...job, employer_logo: profileData.company_logo_url };
                }
              } catch (logoError) {
                console.log('Erreur logo pour job', job.$id, ':', logoError);
              }
            }
            return { ...job, employer_logo: null };
          })
        );
        
        setJobsWithLogos(jobsWithLogosData);
      } catch (error) {
        console.error('Erreur lors du chargement des logos:', error);
        setJobsWithLogos(jobs.map(job => ({ ...job, employer_logo: null })));
      }
    };
  
    loadJobLogos();
  }, [jobs]);

  useEffect(() => {
    if (jobsWithLogos.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % jobsWithLogos.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [jobsWithLogos.length]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % jobsWithLogos.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + jobsWithLogos.length) % jobsWithLogos.length);
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - new Date(date).getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Aujourd\'hui';
    if (diffDays === 2) return 'Hier';
    if (diffDays <= 7) return `Il y a ${diffDays} jours`;
    return `Il y a ${Math.ceil(diffDays / 7)} semaines`;
  };

  if (!jobsWithLogos.length) {
    return (
      <div className="text-center py-8">
        <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Aucune offre récente</p>
      </div>
    );
  }

  return (
    <div className="relative bg-white rounded-2xl shadow-xl border-2 border-job-gold overflow-hidden">
      <div className="bg-gradient-to-r from-job-gold to-job-dark-gold p-4 flex items-center justify-between">
        <h3 className="font-bold text-white text-lg flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Dernières offres
        </h3>
        <Link 
          to="/jobs"
          className="text-white/80 hover:text-white text-sm font-medium flex items-center transition-colors"
        >
          Voir tout
          <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      </div>

      <div className="relative h-80 overflow-hidden">
        <div 
          className="transition-transform duration-500 ease-in-out h-full"
          style={{ transform: `translateY(-${currentIndex * 100}%)` }}
        >
          {jobsWithLogos.map((job, index) => (
            <Link
            key={job.$id}
            to={`/jobs/${job.$id}`}
            className="h-full block cursor-pointer transform transition-all duration-300 hover:scale-105"
          >
              <div className="h-full p-6 flex flex-col justify-between bg-gradient-to-br from-white via-job-cream to-job-light-gold hover:from-job-light-gold hover:via-job-cream hover:to-white border-b border-job-gold/20">
                <div>
                  <div className="flex items-center mb-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center mr-4 shadow-lg border-2 border-gray-100 bg-white overflow-hidden">
                      {job.employer_logo ? (
                        <img 
                          src={job.employer_logo} 
                          alt={`Logo ${job.company_name}`}
                          className="w-full h-full object-contain p-2"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            const fallback = e.target.parentNode.querySelector('.fallback-icon');
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className={`fallback-icon w-full h-full bg-gradient-to-r from-job-gold to-job-orange rounded-lg flex items-center justify-center ${job.employer_logo ? 'hidden' : 'flex'}`}
                      >
                        <Building className="h-7 w-7 text-white" />
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-bold text-job-brown text-base line-clamp-1 hover:text-job-gold transition-colors">
                        {job.title}
                      </h4>
                      <p className="text-gray-600 text-sm font-medium">{job.company_name}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-job-gold/20 rounded-full flex items-center justify-center mr-3">
                        <MapPin className="h-3 w-3 text-job-gold" />
                      </div>
                      <span className="font-medium">{job.location}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <Clock className="h-3 w-3 text-blue-600" />
                      </div>
                      <span>{getTimeAgo(job.created_at)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-job-gold/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Cliquez pour voir</span>
                    <div className="w-8 h-8 bg-job-gold rounded-full flex items-center justify-center">
                      <ChevronRight className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {jobsWithLogos.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
            <button
              onClick={goToPrev}
              className="p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all"
            >
              <ChevronUp className="h-4 w-4 text-job-gold" />
            </button>
            <button
              onClick={goToNext}
              className="p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all"
            >
              <ChevronDown className="h-4 w-4 text-job-gold" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const MyApplications = () => {
  const { user, profile, isCandidate } = useAuth();
  const navigate = useNavigate();
  
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [isLoading, setIsLoading] = useState(true);
  const [recentJobs, setRecentJobs] = useState([]);
  const [error, setError] = useState(null);

  // Cache pour éviter les rechargements
  const [dataCache] = useState(new Map());
  const [dataLoaded, setDataLoaded] = useState(false);

  // Rediriger si l'utilisateur n'est pas un candidat
  useEffect(() => {
    if (!user || !isCandidate) {
      navigate('/login');
      return;
    }
  }, [user, isCandidate, navigate]);

  // Charger les candidatures avec les détails des offres - UNE SEULE FOIS
  useEffect(() => {
    if (user && isCandidate && !dataLoaded) {
      const cacheKey = `applications-${user.$id}`;
      
      // Vérifier si on a les données en cache
      if (dataCache.has(cacheKey) && dataCache.has('recent-jobs')) {
        const cachedApplications = dataCache.get(cacheKey);
        const cachedRecentJobs = dataCache.get('recent-jobs');
        
        setApplications(cachedApplications);
        setFilteredApplications(cachedApplications);
        setRecentJobs(cachedRecentJobs);
        setIsLoading(false);
        setDataLoaded(true);
      } else {
        loadApplications();
        loadRecentJobs();
      }
    }
  }, [user, isCandidate, dataLoaded]);

  const loadApplications = async () => {
    try {
      setIsLoading(true);
      setError(null);
  
      // Récupérer les candidatures avec une requête simple
      const applicationsResponse = await databases.listDocuments(
        DATABASE_ID,
        'applications',
        [
          Query.equal('candidate_id', user.$id),
          Query.orderDesc('applied_at')
        ]
      );
  
      if (!applicationsResponse.documents || applicationsResponse.documents.length === 0) {
        console.log('Aucune candidature trouvée');
        setApplications([]);
        setFilteredApplications([]);
        setDataLoaded(true);
        return;
      }
  
      // Récupérer les détails des jobs pour chaque candidature
      const applicationsWithJobs = await Promise.all(
        applicationsResponse.documents.map(async (application) => {
          try {
            const jobData = await databases.getDocument(
              DATABASE_ID,
              'jobs',
              application.job_id
            );
  
            return {
              ...application,
              jobs: jobData
            };
          } catch (jobError) {
            console.error('Erreur lors du chargement du job:', jobError);
            return {
              ...application,
              jobs: {
                id: application.job_id,
                title: 'Titre non disponible',
                company_name: 'Entreprise non disponible',
                location: 'Localisation non disponible'
              }
            };
          }
        })
      );
  
      console.log('Applications chargées:', applicationsWithJobs);
      
      // Mettre en cache
      const cacheKey = `applications-${user.$id}`;
      dataCache.set(cacheKey, applicationsWithJobs);
      
      setApplications(applicationsWithJobs);
      setFilteredApplications(applicationsWithJobs);
      setDataLoaded(true);
  
    } catch (error) {
      console.error('Erreur lors du chargement des candidatures:', error);
      setError('Erreur lors du chargement de vos candidatures');
      setDataLoaded(true);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecentJobs = async () => {
    try {
      // Vérifier le cache d'abord
      if (dataCache.has('recent-jobs')) {
        setRecentJobs(dataCache.get('recent-jobs'));
        return;
      }
  
      const response = await databases.listDocuments(
        DATABASE_ID,
        'jobs',
        [
          Query.equal('is_active', true),
          Query.orderDesc('$createdAt'),
          Query.limit(5)
        ]
      );
  
      const jobsData = response.documents || [];
      
      // Mettre en cache
      dataCache.set('recent-jobs', jobsData);
      setRecentJobs(jobsData);
    } catch (error) {
      console.error('Erreur lors du chargement des offres récentes:', error);
    }
  };

  // Fonction pour formater le salaire
  const formatSalary = (job) => {
    if (!job) return null;
    
    const { salary_min, salary_max, salary_currency = 'MGA' } = job;
    
    if (salary_min && salary_max) {
      return `${salary_min} - ${salary_max} ${salary_currency}`;
    } else if (salary_min) {
      return `À partir de ${salary_min} ${salary_currency}`;
    } else if (salary_max) {
      return `Jusqu'à ${salary_max} ${salary_currency}`;
    }
    
    return null;
  };

  // Fonction pour nettoyer le HTML de la lettre de motivation
  const cleanHtml = (html) => {
    if (!html) return '';
    return html
      .replace(/<[^>]*>/g, '') // Supprimer toutes les balises HTML
      .replace(/&nbsp;/g, ' ') // Remplacer les espaces insécables
      .trim();
  };

  // Fonction pour forcer le rechargement (vider le cache)
  const forceReload = async () => {
    const cacheKey = `applications-${user.$id}`;
    dataCache.delete(cacheKey);
    dataCache.delete('recent-jobs');
    setDataLoaded(false);
    setIsLoading(true);
    
    // Recharger les données
    await loadApplications();
    await loadRecentJobs();
  };

  // Écouter les événements de visibilité pour éviter les rechargements inutiles
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Ne rien faire - éviter les rechargements automatiques
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Filtrer et trier les candidatures
  useEffect(() => {
    let filtered = applications;

    // Filtrer par statut
    if (filterStatus !== 'all') {
      filtered = filtered.filter(app => app.status === filterStatus);
    }

    // Filtrer par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.jobs?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.jobs?.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.jobs?.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Trier
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.applied_at) - new Date(a.applied_at);
        case 'company':
          return (a.jobs?.company_name || '').localeCompare(b.jobs?.company_name || '');
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    setFilteredApplications(filtered);
  }, [applications, filterStatus, searchTerm, sortBy]);

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return {
          label: 'En attente',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Clock
        };
      case 'interview':
        return {
          label: 'Entretien',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Eye
        };
      case 'accepted':
        return {
          label: 'Acceptée',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle
        };
      case 'rejected':
        return {
          label: 'Refusée',
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle
        };
      default:
        return {
          label: 'En attente',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Clock
        };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatsData = () => {
    const total = applications.length;
    const pending = applications.filter(app => app.status === 'pending').length;
    const interview = applications.filter(app => app.status === 'interview').length;
    const accepted = applications.filter(app => app.status === 'accepted').length;
    const rejected = applications.filter(app => app.status === 'rejected').length;

    return { total, pending, interview, accepted, rejected };
  };

  const employmentTypes = {
    'full-time': 'Temps plein',
    'part-time': 'Temps partiel',
    'contract': 'Contrat',
    'internship': 'Stage',
    'freelance': 'Freelance'
  };

  const contractTypes = {
    'cdi': 'CDI',
    'cdd': 'CDD',
    'stage': 'Stage',
    'freelance': 'Freelance',
    'mission': 'Mission'
  };

  const stats = getStatsData();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-job-gold mx-auto mb-4"></div>
          <p className="text-job-brown font-medium">Chargement de vos candidatures...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
        <Navbar />
        <div className="pt-32 pb-16">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Erreur de chargement</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <button 
              onClick={forceReload}
              disabled={isLoading}
              className="bg-job-gold hover:bg-job-dark-gold text-white px-6 py-3 rounded-xl font-medium flex items-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Chargement...
                </>
              ) : (
                <>
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Réessayer
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      <Navbar />
      
      {/* Header avec breadcrumb - Responsive */}
      <section className="pt-20 md:pt-32 pb-8 bg-gradient-to-r from-job-gold to-job-dark-gold text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center space-x-2 md:space-x-4 mb-4 md:mb-6">
            <Link
              to="/profile"
              className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
            >
              <ChevronRight className="h-4 w-4 md:h-5 md:w-5 rotate-180" />
              <span className="text-sm md:text-base">Retour au profil</span>
            </Link>
            <ChevronRight className="h-3 w-3 md:h-4 md:w-4 text-white/60" />
            <span className="text-white/90 text-sm md:text-base">Mes candidatures</span>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-4xl font-bold mb-4">
                ✨ Mes Candidatures
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 md:gap-6 text-white/90 mb-6 text-sm md:text-base">
                <span className="flex items-center">
                  <FileText className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                  {stats.total} envoyées
                </span>
                <span className="flex items-center">
                  <Clock className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                  {stats.pending} en attente
                </span>
                <span className="flex items-center">
                  <CheckCircle className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                  {stats.accepted} acceptées
                </span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <button
                onClick={forceReload}
                disabled={isLoading}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl transition-all font-medium flex items-center justify-center text-sm"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <TrendingUp className="h-4 w-4 mr-2" />
                )}
                Actualiser
              </button>
              <Link
                to="/jobs"
                className="bg-white/20 hover:bg-white/30 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl transition-all font-medium flex items-center justify-center"
              >
                <Search className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                Nouvelles offres
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contenu principal - Layout responsive */}
      <div className="w-full p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Layout adaptatif : colonne unique sur mobile, 3 colonnes sur desktop */}
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            
            {/* Colonne gauche - Widgets publicitaires - Masquée sur mobile */}
            <div className="hidden lg:block lg:w-1/4">
              <div className="sticky top-24 space-y-6">
                {/* Widget Premium Candidat */}
                <div className="bg-gradient-to-br from-job-purple to-job-pink rounded-3xl p-6 text-white shadow-2xl transform hover:scale-105 transition-transform">
                  <div className="flex items-center justify-between mb-4">
                    <Crown className="h-12 w-12 text-white" />
                    <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold">
                      PREMIUM
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-3">
                    Accès Direct Recruteur
                  </h3>
                  <p className="text-white/90 mb-4 text-sm">
                    Contactez directement les recruteurs et augmentez vos chances de 300% !
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center text-sm">
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mr-3">
                        <Phone className="h-3 w-3" />
                      </div>
                      <span>Contact direct recruteur</span>
                    </li>
                    <li className="flex items-center text-sm">
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mr-3">
                        <Mail className="h-3 w-3" />
                      </div>
                      <span>Email professionnel</span>
                    </li>
                    <li className="flex items-center text-sm">
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mr-3">
                        <Target className="h-3 w-3" />
                      </div>
                      <span>Priorité sur les candidatures</span>
                    </li>
                  </ul>
                  <PremiumButton 
                    variant="default"
                    className="w-full"
                  >
                    Passer au Premium
                  </PremiumButton>
                </div>

                {/* Widget Conseils */}
                <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                  <div className="flex items-center mb-4">
                    <Sparkles className="h-6 w-6 text-job-gold mr-3" />
                    <h3 className="font-bold text-job-brown">Conseils pour réussir</h3>
                  </div>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-job-gold rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Suivez régulièrement vos candidatures</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-job-gold rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Relancez poliment après 1 semaine</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-job-gold rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Préparez-vous aux entretiens</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-job-gold rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Continuez à postuler à d'autres offres</span>
                    </li>
                  </ul>
                </div>

                {/* Widget Statistiques */}
                <div className="bg-gradient-to-br from-job-blue via-indigo-500 to-job-purple rounded-2xl p-6 text-white shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold flex items-center">
                      <Activity className="h-5 w-5 mr-2" />
                      Vos statistiques
                    </h3>
                    <TrendingUp className="h-5 w-5 text-white/50"/>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white/80 text-sm">Taux de réponse</span>
                      <span className="font-bold text-lg">
                        {stats.total > 0 ? Math.round(((stats.interview + stats.accepted) / stats.total) * 100) : 0}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/80 text-sm">Entretiens obtenus</span>
                      <span className="font-bold text-lg">{stats.interview}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/80 text-sm">Taux de succès</span>
                      <span className="font-bold text-lg">
                        {stats.total > 0 ? Math.round((stats.accepted / stats.total) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne centrale - Liste des candidatures - Responsive */}
            <div className="w-full lg:w-1/2">
              <div className="bg-white rounded-3xl shadow-xl border-2 border-job-gold p-4 md:p-8">
                
                {/* Statistics Cards - Responsive Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl md:rounded-2xl p-3 md:p-4 border border-yellow-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-yellow-600 font-semibold">En attente</p>
                        <p className="text-xl md:text-2xl font-bold text-yellow-700">{stats.pending}</p>
                      </div>
                      <Clock className="h-5 w-5 md:h-6 md:w-6 text-yellow-500" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl md:rounded-2xl p-3 md:p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-blue-600 font-semibold">Entretiens</p>
                        <p className="text-xl md:text-2xl font-bold text-blue-700">{stats.interview}</p>
                      </div>
                      <Eye className="h-5 w-5 md:h-6 md:w-6 text-blue-500" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl md:rounded-2xl p-3 md:p-4 border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-green-600 font-semibold">Acceptées</p>
                        <p className="text-xl md:text-2xl font-bold text-green-700">{stats.accepted}</p>
                      </div>
                      <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-green-500" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl md:rounded-2xl p-3 md:p-4 border border-red-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-red-600 font-semibold">Refusées</p>
                        <p className="text-xl md:text-2xl font-bold text-red-700">{stats.rejected}</p>
                      </div>
                      <XCircle className="h-5 w-5 md:h-6 md:w-6 text-red-500" />
                    </div>
                  </div>
                </div>

                {/* Filters and Search - Responsive */}
                <div className="bg-gradient-to-r from-job-light-gold to-job-cream rounded-2xl border-2 border-job-gold p-4 md:p-6 mb-6 md:mb-8">
                  <div className="flex flex-col gap-4">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Rechercher une candidature..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 md:pl-10 pr-4 py-2 md:py-3 border-2 border-job-gold/30 rounded-xl focus:ring-2 focus:ring-job-gold focus:border-job-gold outline-none transition-all bg-white text-sm md:text-base"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      {/* Status Filter */}
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="flex-1 px-3 md:px-4 py-2 md:py-3 border-2 border-job-gold/30 rounded-xl focus:ring-2 focus:ring-job-gold focus:border-job-gold outline-none bg-white font-medium text-sm md:text-base"
                      >
                        <option value="all">Tous les statuts</option>
                        <option value="pending">En attente</option>
                        <option value="interview">Entretien</option>
                        <option value="accepted">Acceptées</option>
                        <option value="rejected">Refusées</option>
                      </select>

                      {/* Sort */}
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="flex-1 px-3 md:px-4 py-2 md:py-3 border-2 border-job-gold/30 rounded-xl focus:ring-2 focus:ring-job-gold focus:border-job-gold outline-none bg-white font-medium text-sm md:text-base"
                      >
                        <option value="date">Date de candidature</option>
                        <option value="company">Entreprise</option>
                        <option value="status">Statut</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Applications List - Responsive */}
                <div className="space-y-4">
                  {filteredApplications.length === 0 ? (
                    <div className="text-center py-8 md:py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200">
                      <FileText className="h-12 w-12 md:h-16 md:w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                        {applications.length === 0 ? 'Aucune candidature envoyée' : 'Aucune candidature trouvée'}
                      </h3>
                      <p className="text-gray-600 mb-4 md:mb-6 text-sm md:text-base px-4">
                        {applications.length === 0 
                          ? "Vous n'avez pas encore postulé à d'offres d'emploi."
                          : "Aucune candidature ne correspond à vos critères de recherche."
                        }
                      </p>
                      <Link
                        to="/jobs"
                        className="inline-flex items-center px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-job-gold to-job-dark-gold text-white rounded-xl hover:shadow-lg transition-all font-medium text-sm md:text-base"
                      >
                        <Briefcase className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                        Explorer les offres
                      </Link>
                    </div>
                  ) : (
                    filteredApplications.map((application) => {
                      const statusInfo = getStatusInfo(application.status);
                      const StatusIcon = statusInfo.icon;
                      const job = application.jobs;

                      return (
                        <div
                        key={application.$id}
                          className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 hover:border-job-gold hover:shadow-xl transition-all group overflow-hidden"
                        >
                          <div className="p-4 md:p-6">
                            <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                              {/* Job Info - Responsive */}
                              <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                                  <div className="flex-1">
                                    <Link 
                                      to={`/jobs/${job?.id || job?.$id}`}
                                      className="block hover:text-job-gold transition-colors"
                                    >
                                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                        <h3 className="text-lg md:text-xl font-bold text-job-brown group-hover:text-job-gold transition-colors">
                                          {job?.title || 'Titre non disponible'}
                                        </h3>
                                        <div className="flex gap-2">
                                          {job?.is_featured && (
                                            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                                              <Star className="h-3 w-3 mr-1" />
                                              Featured
                                            </div>
                                          )}
                                          {job?.is_urgent && (
                                            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center animate-pulse">
                                              <Zap className="h-3 w-3 mr-1" />
                                              Urgent
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      
                                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-gray-600 mb-3 text-sm md:text-base">
                                        <div className="flex items-center">
                                          <Building2 className="h-4 w-4 mr-2 text-job-gold" />
                                          <span className="font-medium">{job?.company_name || 'Entreprise non disponible'}</span>
                                        </div>
                                        <div className="flex items-center">
                                          <MapPin className="h-4 w-4 mr-2 text-job-gold" />
                                          <span>{job?.location || 'Localisation non disponible'}</span>
                                        </div>
                                      </div>
                                    </Link>
                                    
                                    <div className="flex flex-wrap items-center gap-2 mb-4">
                                      {formatSalary(job) && (
                                        <span className="px-2 md:px-3 py-1 bg-gradient-to-r from-job-gold to-job-dark-gold text-white rounded-full text-xs md:text-sm font-medium">
                                          {formatSalary(job)}
                                        </span>
                                      )}
                                      {job?.employment_type && (
                                        <span className="px-2 md:px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs md:text-sm font-medium">
                                          {employmentTypes[job.employment_type] || job.employment_type}
                                        </span>
                                      )}
                                      {job?.contract_type && (
                                        <span className="px-2 md:px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs md:text-sm font-medium">
                                          {contractTypes[job.contract_type] || job.contract_type}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Status Badge - Responsive */}
                                  <div className={`inline-flex items-center px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-medium border-2 ${statusInfo.color} self-start`}>
                                    <StatusIcon className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                                    {statusInfo.label}
                                  </div>
                                </div>
                                
                                {/* Application Details - Responsive */}
                                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-3 md:p-4 border border-gray-200 mb-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
                                    <div className="flex items-center">
                                      <Calendar className="h-4 w-4 mr-2 text-job-gold" />
                                      <div>
                                        <span className="text-gray-600">Postulé le </span>
                                        <span className="font-medium text-job-brown">
                                          {formatDate(application.applied_at)}
                                        </span>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center">
                                      <FileText className="h-4 w-4 mr-2 text-job-gold" />
                                      <div>
                                        <span className="text-gray-600">CV envoyé: </span>
                                        <span className="font-medium text-job-brown">
                                          {application.cv_url ? 'Oui' : 'Non'}
                                        </span>
                                      </div>
                                    </div>
                                    
                                    {application.cover_letter && (
                                      <div className="md:col-span-2">
                                        <span className="text-gray-600 text-xs">Lettre de motivation: </span>
                                        <div className="text-gray-700 text-xs md:text-sm mt-1 line-clamp-2">
                                          {cleanHtml(application.cover_letter).substring(0, 150)}
                                          {cleanHtml(application.cover_letter).length > 150 ? '...' : ''}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Action Buttons - Responsive */}
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                  <div className="flex flex-wrap gap-2 sm:gap-3">
                                    {application.cv_url && (
                                      <a 
                                        href={application.cv_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all text-xs md:text-sm font-medium"
                                      >
                                        <Download className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                                        CV
                                      </a>
                                    )}
                                    
                                    <Link 
                                      to={`/jobs/${job?.id || job?.$id}`}
                                      className="flex items-center px-3 py-2 bg-job-cream text-job-brown rounded-lg hover:bg-job-light-gold transition-all text-xs md:text-sm font-medium"
                                    >
                                      <Eye className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                                      Voir l'offre
                                    </Link>
                                  </div>
                                  
                                  <div className="text-right text-xs text-gray-500">
                                    <div>Mis à jour le {formatDate(application.updated_at || application.$updatedAt)}</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Call to Action - Responsive */}
                {filteredApplications.length > 0 && (
                  <div className="mt-6 md:mt-8 text-center">
                    <div className="bg-gradient-to-r from-job-light-gold to-job-cream rounded-2xl p-4 md:p-6 border-2 border-job-gold">
                      <h3 className="text-xl md:text-2xl font-bold text-job-brown mb-3 md:mb-4">
                        Continuez sur votre lancée !
                      </h3>
                      <p className="text-gray-700 mb-4 md:mb-6 text-sm md:text-base px-2">
                        Explorez plus d'offres d'emploi qui correspondent à votre profil et maximisez vos chances de décrocher le job de vos rêves.
                      </p>
                      <Link
                        to="/jobs"
                        className="inline-flex items-center px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-job-gold to-job-dark-gold text-white rounded-xl hover:shadow-lg transition-all font-medium text-sm md:text-lg"
                      >
                        <Search className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                        Explorer plus d'offres
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Colonne droite - Carrousel et widgets - Masquée sur mobile */}
            <div className="hidden lg:block lg:w-1/4">
              <div className="sticky top-24 space-y-6">
                {/* Carrousel vertical des dernières offres */}
                <VerticalJobCarousel jobs={recentJobs} />

                {/* Widget Premium pour candidats */}
                <div className="bg-gradient-to-br from-job-gold via-job-orange to-job-dark-gold rounded-2xl p-6 text-white shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold flex items-center">
                      <Crown className="h-5 w-5 mr-2" />
                      Accès Premium
                    </h3>
                    <Rocket className="h-5 w-5 text-white/50" />
                  </div>
                  
                  <p className="text-white/90 text-sm mb-4">
                    Boostez vos candidatures avec nos outils premium !
                  </p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm">
                      <BadgeCheck className="h-4 w-4 mr-2" />
                      <span>Suivi avancé candidatures</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Star className="h-4 w-4 mr-2" />
                      <span>Alertes personnalisées</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Zap className="h-4 w-4 mr-2" />
                      <span>Candidature express</span>
                    </div>
                  </div>
                  
                  <PremiumButton 
                    variant="default"
                    className="w-full"
                  >
                    Passer au Premium
                  </PremiumButton>
                </div>

                {/* Widget aide et support */}
                <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-job-cream rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="h-8 w-8 text-job-gold" />
                    </div>
                    <h3 className="font-bold text-job-brown mb-2">Besoin d'aide ?</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Notre équipe est là pour vous accompagner dans votre recherche d'emploi
                    </p>
                    <button className="w-full border-2 border-job-gold text-job-gold hover:bg-job-cream py-3 rounded-xl font-medium transition-all">
                      Nous contacter
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Section mobile pour widgets - Affichée seulement sur mobile */}
          <div className="lg:hidden mt-8 space-y-6">
            {/* Carrousel mobile */}
            <VerticalJobCarousel jobs={recentJobs} />

            {/* Widget Premium mobile */}
            <div className="bg-gradient-to-br from-job-gold via-job-orange to-job-dark-gold rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-center mb-4">
                <Crown className="h-8 w-8 text-white mr-3" />
                <h3 className="font-bold text-lg">Accès Premium</h3>
              </div>
              
              <p className="text-white/90 text-center mb-4">
                Boostez vos candidatures !
              </p>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-4">
                <div className="text-center">
                  <div className="text-xl font-bold mb-1">15.000 Ar</div>
                  <div className="text-xs text-white/80">par mois</div>
                </div>
              </div>
              
              <PremiumButton 
                variant="default"
                className="w-full"
              >
                Passer au Premium
              </PremiumButton>
            </div>
          </div>

        </div>
      </div>

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

        .transition-transform {
          transition: transform 0.3s ease;
        }

        .transition-all {
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default MyApplications;