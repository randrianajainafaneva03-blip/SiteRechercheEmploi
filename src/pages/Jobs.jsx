import React, { useState, useEffect, useRef } from 'react';
import { PremiumBadge } from '@/components/Premium';
import { usePremium } from '@/hooks/usePremium';
import PremiumButton from '@/components/PremiumButton';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { databases, storage, DATABASE_ID } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { useAppwriteQuery } from '@/hooks/useAppwriteQuery';
import { ProtectedRoute } from '@/components/ProtectedRoute';
 
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
 
// ========== TES COMPOSANTS CARROUSEL (INCHANGÉS) ==========
// Carrousel 3 cartes magnifique pour les offres à la une
const FeaturedJobsCarousel = ({ jobs, isScrolled }) => {
  const [jobsWithLogos, setJobsWithLogos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
 
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
    if (jobsWithLogos.length > 3) {
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
    if (diffDays <= 30) return `Il y a ${Math.ceil(diffDays / 7)} semaines`;
    return `Il y a ${Math.ceil(diffDays / 30)} mois`;
  };
 
  if (!jobsWithLogos.length) {
    return (
      <div className="bg-gradient-to-r from-job-gold to-job-dark-gold rounded-3xl p-4 md:p-8 text-center text-white sticky top-24 z-10 shadow-2xl mt-8">
        <Star className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-4 text-white/60" />
        <h3 className="text-xl md:text-2xl font-bold mb-2">Offres à la Une</h3>
        <p className="text-white/80">Aucune offre mise en avant pour le moment</p>
      </div>
    );
  }
 
  const getVisibleJobs = () => {
    const visibleJobs = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % jobsWithLogos.length;
      visibleJobs.push(jobsWithLogos[index]);
    }
    return visibleJobs;
  };
 
  const visibleJobs = getVisibleJobs();
 
  return (
    <>
    <div 
        className={`bg-gradient-to-r from-job-gold via-job-gold to-job-dark-gold rounded-3xl p-4 md:p-8 relative overflow-hidden shadow-2xl mt-8 transition-all duration-500 ${
          isScrolled ? 'opacity-0 pointer-events-none h-0' : 'opacity-100'
        }`}
      >
      <div className="absolute inset-0 bg-black/10"></div>
      
      <div className="relative">
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center">
            <Star className="h-5 w-5 md:h-8 md:w-8 mr-2 md:mr-3" />
            ✨ Offres à la Une
          </h2>
          <p className="text-white/90 text-xl md:text-lg">Découvrez les opportunités exceptionnelles</p>
        </div>
 
        <div className="relative overflow-hidden">
          <div 
            className="flex gap-4 md:gap-8 px-4 md:px-8 transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(0)` }}
          >
            {getVisibleJobs().map((job, index) => (
              <div
                key={`${job.$id}-${currentIndex}-${index}`}
                className="flex-1 group mobile-card animate-slide-in"
                style={{ 
                  width: '30%', 
                  minWidth: '30%', 
                  maxWidth: '30%',
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <Link to={`/jobs/${job.$id}`} className="block h-full">
                  <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-6 shadow-2xl hover:shadow-3xl transition-all duration-500 border-2 border-white/20 hover:border-white/40 group-hover:scale-105 group-hover:-translate-y-2 h-full transform-gpu">
                    <div className="flex items-center space-x-2 md:space-x-4 mb-3 md:mb-4">
                      <div className="h-10 w-10 md:h-16 md:w-16 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg border border-gray-100 bg-white overflow-hidden flex-shrink-0">
                        {job.employer_logo ? (
                          <img 
                            src={job.employer_logo} 
                            alt={`Logo ${job.company_name}`}
                            className="w-full h-full object-contain p-1 md:p-2"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              const fallback = e.target.parentNode.querySelector('.fallback-icon');
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className={`fallback-icon w-full h-full bg-gradient-to-r from-job-gold to-job-gold rounded-lg flex items-center justify-center ${job.employer_logo ? 'hidden' : 'flex'}`}
                        >
                          <Building className="h-4 w-4 md:h-8 md:w-8 text-white" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1 mb-1">
                          <div className="bg-gradient-to-r from-job-gold to-job-gold text-white px-2 py-1 rounded-full text-xs md:text-sm font-bold flex items-center">
                            <Star className="h-3 w-3 mr-1" />
                            <span>UNE</span>
                          </div>
                          {job.is_urgent && (
                            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1 rounded-full text-xs md:text-sm font-bold flex items-center animate-pulse">
                              <Zap className="h-3 w-3 mr-1" />
                              <span>URGENT</span>
                            </div>
                          )}
                        </div>
                        <h3 className="text-sm md:text-lg font-bold text-job-navy group-hover:text-job-gold transition-colors line-clamp-1 leading-tight">
                          {job.title}
                        </h3>
                        <p className="text-job-gold font-bold text-xs md:text-sm leading-tight line-clamp-1">{job.company_name}</p>
                      </div>
                    </div>
 
                    <div className="space-y-1 mb-3 md:mb-4 text-xs md:text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 md:h-4 md:w-4 text-job-gold mr-1 flex-shrink-0" />
                        <span className="font-medium truncate">{job.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 md:h-4 md:w-4 text-job-navy mr-1 flex-shrink-0" />
                        <span className="truncate">{getTimeAgo(job.created_at)}</span>
                      </div>
                      <div className="flex items-center">
                        <Eye className="h-3 w-3 md:h-4 md:w-4 text-green-600 mr-1 flex-shrink-0" />
                        <span>{job.views_count || 0} vues</span>
                      </div>
                    </div>
 
                    <p className="hidden lg:block text-gray-700 mb-4 line-clamp-2 text-sm leading-relaxed">
                      {job.description?.replace(/<[^>]*>/g, '').substring(0, 80)}...
                    </p>
 
                    <div className="flex flex-wrap gap-1 md:gap-2 mb-3 md:mb-4">
                      <span className="px-2 md:px-3 py-1 bg-gradient-to-r from-job-gold to-job-dark-gold text-white rounded-full text-xs md:text-sm font-bold">
                        {job.category}
                      </span>
                      <span className="px-2 md:px-3 py-1 bg-slate-100 text-job-navy-dark rounded-full text-xs md:text-sm font-bold">
                        {job.contract_type?.toUpperCase()}
                      </span>
                    </div>
 
                    <div className="flex items-center justify-center text-job-gold group-hover:text-job-dark-gold transition-colors">
                      <span className="font-bold mr-1 md:mr-2 text-sm md:text-base">
                        Voir les détails
                      </span>
                      <ArrowRight className="h-3 w-3 md:h-4 md:w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
 
          {jobsWithLogos.length > 1 && (
            <>
              <button
                onClick={goToPrev}
                className="absolute left-0 md:left-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-br from-job-navy to-job-navy-dark backdrop-blur-sm text-white p-2 md:p-4 rounded-full hover:bg-white/30 transition-all shadow-lg z-10"
              >
                <ChevronLeft className="h-3 w-3 md:h-6 md:w-6" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-0 md:right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-br from-job-navy to-job-navy-dark backdrop-blur-sm text-white p-2 md:p-4 rounded-full hover:bg-white/30 transition-all shadow-lg z-10"
              >
                <ChevronRight className="h-3 w-3 md:h-6 md:w-6" />
              </button>
            </>
          )}
        </div>
 
        {jobsWithLogos.length > 3 && (
          <div className="flex justify-center mt-4 md:mt-6 space-x-2">
            {jobsWithLogos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all ${
                  index === currentIndex ? 'bg-white shadow-lg' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
 
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes slideInCards {
            0% {
              opacity: 0;
              transform: translateY(30px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
 
          .z-\\[100\\] {
            z-index: 100 !important;
          }
 
          @keyframes slideDownMini {
            from {
              transform: translateY(-100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
 
          body {
            position: relative;
          }
      
          @keyframes cardEntrance {
            0% {
              opacity: 0;
              transform: translateY(20px) scale(0.95);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
 
          .animate-card-entrance {
            animation: cardEntrance 0.6s ease-out forwards;
            opacity: 0;
          }
 
          .group:hover .transform-gpu {
            transform: scale(1.05) translateY(-8px);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
          }
 
          .transform-gpu {
            transform: translateZ(0);
            will-change: transform;
          }
        `
      }} />
    </div>
    </>
  );
};
 
// Widget des dernières offres pour la sidebar (INCHANGÉ)
const RecentJobsWidget = ({ jobs }) => {
  const [jobsWithLogos, setJobsWithLogos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
 
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
          Nouvelles Offres
        </h3>
        <span className="text-white/80 text-sm font-medium">
          {jobsWithLogos.length} offres
        </span>
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
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mr-4 shadow-lg border-2 border-gray-100 bg-white overflow-hidden">
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
                        className={`fallback-icon w-full h-full bg-gradient-to-r from-job-gold to-job-gold rounded-lg flex items-center justify-center ${job.employer_logo ? 'hidden' : 'flex'}`}
                      >
                        <Building className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-bold text-job-navy text-sm line-clamp-1 hover:text-job-gold transition-colors">
                        {job.title}
                      </h4>
                      <p className="text-gray-600 text-xs font-medium">{job.company_name}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-xs text-gray-600">
                    <div className="flex items-center">
                      <div className="w-5 h-5 bg-job-gold/20 rounded-full flex items-center justify-center mr-2">
                        <MapPin className="h-3 w-3 text-job-gold" />
                      </div>
                      <span className="font-medium">{job.location}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center mr-2">
                        <Briefcase className="h-3 w-3 text-job-navy" />
                      </div>
                      <span>{job.category}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-job-gold/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Voir l'offre</span>
                    <div className="w-6 h-6 bg-job-gold rounded-full flex items-center justify-center">
                      <ArrowRight className="h-3 w-3 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
 
        {jobsWithLogos.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            <button
              onClick={goToPrev}
              className="p-2 bg-gradient-to-br from-job-navy to-job-navy-dark hover:bg-white rounded-full shadow-lg transition-all"
            >
              <ChevronUp className="h-3 w-3 text-white" />
            </button>
            <button
              onClick={goToNext}
              className="p-2 bg-gradient-to-br from-job-navy to-job-navy-dark hover:bg-white rounded-full shadow-lg transition-all"
            >
              <ChevronDown className="h-3 w-3 text-white" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
 
// ========== COMPOSANT PRINCIPAL MODIFIÉ ==========
const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false); // ← NOUVEAU
  const [searchLoading, setSearchLoading] = useState(false); 
  const [hasMore, setHasMore] = useState(true); // ← NOUVEAU
  const [offset, setOffset] = useState(0); // ← NOUVEAU
  const [showFilters, setShowFilters] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const jobsPerPage = 100;
  const jobsListRef = useRef(null);
  const [filterInputs, setFilterInputs] = useState({
    search: '',
    dateFilter: '',
    dateFilterType: 'quick',
    monthYear: '',
    customDateFrom: '',
    customDateTo: ''
  });

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    employment_type: '',
    contract_type: '',
    experience_level: '',
    location: '',
    remote_work: undefined,
    dateFilter: '',
    dateFilterType: 'quick',
    monthYear: '',
    customDateFrom: '',
    customDateTo: ''
  });
  
  const [availableMonths, setAvailableMonths] = useState([]);
 
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, isEmployer, isCandidate } = useAuth();

  // Lire les query params à l'arrivée (depuis la page d'accueil)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    const locationParam = params.get('location');
    if (searchParam || locationParam) {
      setFilterInputs(prev => ({
        ...prev,
        search: searchParam || prev.search
      }));
      setFilters(prev => ({
        ...prev,
        search: searchParam || '',
        location: locationParam || ''
      }));
    }
  }, []);
  const { isPremium, premiumType } = usePremium();
 
  // Hook pour les catégories (INCHANGÉ)
  const { 
    data: categoriesData = [], 
    isLoading: categoriesLoading 
  } = useAppwriteQuery(
    ['categories'],
    async () => {
      const response = await databases.listDocuments(
        DATABASE_ID,
        'job_categories',
        [Query.orderAsc('name')]
      );
      return response.documents;
    },
    { 
      staleTime: 24 * 60 * 60 * 1000,
      gcTime: 48 * 60 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false
    }
  );
  
  // ✅ HOOK MODIFIÉ : Charger par batch de 30
  const { 
    data: jobsData = [], 
    isLoading: jobsLoading,
    error: jobsError,
    refetch: refetchJobs 
  } = useAppwriteQuery(
    ['jobs', offset, filters],
    async () => {
      const queries = [Query.equal('is_active', true)];
      
      if (filters.search) {
        queries.push(Query.search('title', filters.search));
      }
      if (filters.category) {
        queries.push(Query.equal('category', filters.category));
      }
      if (filters.employment_type) {
        queries.push(Query.equal('employment_type', filters.employment_type));
      }
      if (filters.contract_type) {
        queries.push(Query.equal('contract_type', filters.contract_type));
      }
      if (filters.experience_level) {
        queries.push(Query.equal('experience_level', filters.experience_level));
      }
      if (filters.location) {
        queries.push(Query.equal('location', filters.location));
      }
      if (filters.remote_work === true) {
        queries.push(Query.equal('remote_work', true));
      }
      if (filters.dateFilterType === 'quick' && filters.dateFilter) {
        // Mode rapide (24h, 7d, 30d, 90d)
        const now = new Date();
        let dateLimit;
        
        switch(filters.dateFilter) {
          case '24h':
            dateLimit = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
          case '7d':
            dateLimit = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case '30d':
            dateLimit = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case '90d':
            dateLimit = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
        }
        
        if (dateLimit) {
          queries.push(Query.greaterThanEqual('created_at', dateLimit.toISOString()));
        }
      } else if (filters.dateFilterType === 'month' && filters.monthYear) {
        // Mode mois/année
        const [year, month] = filters.monthYear.split('-');
        
        // Premier jour du mois sélectionné
        const startDate = new Date(parseInt(year), parseInt(month) - 1, 1, 0, 0, 0, 0);
        
        // Dernier jour du mois sélectionné (jour 0 du mois suivant)
        const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);
        
        console.log('🗓️ Filtre mois:', filters.monthYear);
        console.log('📅 Du:', startDate.toISOString());
        console.log('📅 Au:', endDate.toISOString());
        
        queries.push(Query.greaterThanEqual('created_at', startDate.toISOString()));
        queries.push(Query.lessThanEqual('created_at', endDate.toISOString()));
      } else if (filters.dateFilterType === 'custom' && filters.customDateFrom && filters.customDateTo) {
        // Mode personnalisé
        const startDate = new Date(filters.customDateFrom);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(filters.customDateTo);
        endDate.setHours(23, 59, 59, 999);
        
        queries.push(Query.greaterThanEqual('created_at', startDate.toISOString()));
        queries.push(Query.lessThanEqual('created_at', endDate.toISOString()));
      }

      queries.push(Query.orderDesc('$createdAt'));
      queries.push(Query.limit(jobsPerPage));
      queries.push(Query.offset(offset));
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        'jobs',
        queries
      );
      
      const jobsWithLogos = await Promise.all(
        response.documents.map(async (job) => {
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
            } catch (logoError) {}
          }
          return { ...job, employer_logo: null };
        })
      );
      
      return jobsWithLogos;
    },
    {
      requireAuth: false,
      staleTime: 0,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  );
 
  // Hook pour offres à la une (INCHANGÉ)
  const { 
    data: featuredJobsData = [], 
    isLoading: featuredLoading 
  } = useAppwriteQuery(
    ['featured-jobs'],
    async () => {
      const response = await databases.listDocuments(
        DATABASE_ID,
        'jobs',
        [
          Query.equal('is_active', true),
          Query.equal('is_featured', true),
          Query.orderDesc('$createdAt'),
          Query.limit(5)
        ]
      );
      return response.documents || [];
    },
    {
      staleTime: 2 * 60 * 60 * 1000,
      gcTime: 4 * 60 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false
    }
  );
  
  // Hook pour offres récentes (INCHANGÉ)
  const { 
    data: recentJobsData = [], 
    isLoading: recentLoading 
  } = useAppwriteQuery(
    ['recent-jobs'],
    async () => {
      const response = await databases.listDocuments(
        DATABASE_ID,
        'jobs',
        [
          Query.equal('is_active', true),
          Query.orderDesc('$createdAt'),
          Query.limit(8)
        ]
      );
      return response.documents || [];
    },
    {
      staleTime: 1 * 60 * 60 * 1000,
      gcTime: 2 * 60 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false
    }
  );
 
  const employmentTypes = [
    { value: 'full-time', label: 'Temps plein' },
    { value: 'part-time', label: 'Temps partiel' },
    { value: 'contract', label: 'Contrat' },
    { value: 'internship', label: 'Stage' },
    { value: 'freelance', label: 'Freelance' }
  ];
 
  const contractTypes = [
    { value: 'cdi', label: 'CDI' },
    { value: 'cdd', label: 'CDD' },
    { value: 'stage', label: 'Stage' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'mission', label: 'Mission' }
  ];
 
  const experienceLevels = [
    { value: 'entry', label: 'Débutant' },
    { value: 'mid', label: 'Intermédiaire' },
    { value: 'senior', label: 'Senior' },
    { value: 'executive', label: 'Cadre dirigeant' }
  ];
 
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
 
  // ✅ EFFECT MODIFIÉ : Ajouter ou remplacer les jobs
  useEffect(() => {
    if (!jobsLoading && jobsData) {
      if (offset === 0) {
        // Premier chargement ou après filtre
        setJobs(jobsData);
      } else {
        // Ajouter à la liste existante
        setJobs(prev => [...prev, ...jobsData]);
      }
      
      // Si moins de 100, il n'y a plus d'offres
      setHasMore(jobsData.length === jobsPerPage);
      setLoadingMore(false);
      setSearchLoading(false); // ← DÉSACTIVER LE LOADER
    }
    
    if (!categoriesLoading && categoriesData) {
      setCategories(categoriesData);
    }
    
    if (!featuredLoading && featuredJobsData) {
      setFeaturedJobs(featuredJobsData);
    }
    
    if (!recentLoading && recentJobsData) {
      setRecentJobs(recentJobsData);
    }
    
    if (!jobsLoading && !categoriesLoading && !featuredLoading && !recentLoading) {
      setLoading(false);
    }
  }, [
    jobsData,
    jobsLoading,
    offset,
    categoriesData,
    categoriesLoading,
    featuredJobsData,
    featuredLoading,
    recentJobsData,
    recentLoading
  ]);
 
  useEffect(() => {
    const loadAvailableMonths = async () => {
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          'jobs',
          [
            Query.equal('is_active', true),
            Query.orderDesc('created_at'),
            Query.limit(1000)  // Charger les 1000 dernières offres
          ]
        );
  
        // Grouper par mois/année
        const monthsMap = {};
        
        response.documents.forEach(job => {
          const date = new Date(job.created_at);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          const monthLabel = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
          
          if (!monthsMap[monthKey]) {
            monthsMap[monthKey] = {
              value: monthKey,
              label: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
              count: 0
            };
          }
          monthsMap[monthKey].count++;
        });
  
        // Convertir en tableau et trier
        const monthsArray = Object.values(monthsMap).sort((a, b) => b.value.localeCompare(a.value));
        setAvailableMonths(monthsArray);
      } catch (error) {
        console.error('Erreur chargement des mois:', error);
      }
    };
  
    loadAvailableMonths();
  }, []);


  // ✅ FONCTION MODIFIÉE : Charger plus
  const handleLoadMore = () => {
    setLoadingMore(true);
    setOffset(prev => prev + jobsPerPage);
  };
  
  // ✅ FONCTION MODIFIÉE : Reset offset quand filtres changent
  const handleFilterChange = (key, value) => {
    // Juste mettre à jour les filtres, SANS déclencher la recherche
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    
    // NE PAS reset offset/jobs ici !
    // On attend que l'utilisateur clique sur "Rechercher"
  };
  
  const applyFilters = () => {
    // Activer le loader
    setSearchLoading(true);
    
    // Appliquer les inputs aux filtres réels
    setFilters(prev => ({
      ...prev,
      search: filterInputs.search,
      dateFilter: filterInputs.dateFilter,
      dateFilterType: filterInputs.dateFilterType,
      monthYear: filterInputs.monthYear,
      customDateFrom: filterInputs.customDateFrom,
      customDateTo: filterInputs.customDateTo
    }));
    setOffset(0);
    setJobs([]);
    setHasMore(true);
  };

  const clearFilters = () => {
  setFilters({
    search: '',
    category: '',
    employment_type: '',
    contract_type: '',
    experience_level: '',
    location: '',
    remote_work: undefined,
    dateFilter: ''  // ← VÉRIFIER QUE C'EST LÀ
  });
  setOffset(0);
  setJobs([]);
  setHasMore(true);
};
 
  const handleCreateJob = () => {
    if (!user) {
      navigate('/login', { 
        state: { 
          from: '/jobs', 
          message: 'Connectez-vous pour publier une offre d\'emploi' 
        } 
      });
      return;
    }
    
    if (!isEmployer) {
      navigate('/login', { 
        state: { 
          message: 'Seuls les employeurs peuvent publier des offres d\'emploi' 
        } 
      });
      return;
    }
    
    navigate('/jobs/create');
  };
 
  const handleJobClick = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };
 
  const getTimeAgo = (date) => {
    const now = new Date();
    const diffTime = Math.abs(now - new Date(date));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Aujourd\'hui';
    if (diffDays === 2) return 'Hier';
    if (diffDays <= 7) return `Il y a ${diffDays} jours`;
    if (diffDays <= 30) return `Il y a ${Math.ceil(diffDays / 7)} semaines`;
    return `Il y a ${Math.ceil(diffDays / 30)} mois`;
  };
 
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
 
  if (jobsError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 mb-4">Impossible de charger les offres d'emploi.</p>
          <Button onClick={() => refetchJobs()} className="bg-job-gold text-white">
            Réessayer
          </Button>
        </div>
      </div>
    );
  }
 
  return (
    <div className="min-h-screen w-full bg-slate-50 text-left">
      <Navbar featuredJobs={featuredJobs} showMiniCarousel={isScrolled} />

      {/* Header avec recherche */}
      <section
        className="w-full text-left text-white pt-28 sm:pt-32 pb-8"
        style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #3D6491 50%, #122438 100%)' }}
      >
        <div style={{ 
          maxWidth: '1600px',  
          margin: '0 auto', 
          padding: '0 24px', 
          width: '100%'
        }}>
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">
              🚀 Trouvez votre emploi de rêve
            </h1>
            
            {/* Barre de recherche */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl mb-8">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Rechercher un poste, une entreprise..."
                    value={filterInputs.search}
                    onChange={(e) => setFilterInputs(prev => ({ ...prev, search: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === 'Enter') applyFilters(); }}
                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-job-gold text-gray-900 font-medium placeholder-gray-400"
                  />
                </div>
                <div className="relative min-w-[200px]">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
                  <select
                    value={filters.location}
                    onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full pl-12 pr-8 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-job-gold text-gray-900 appearance-none bg-white font-medium"
                  >
                    <option value="">Toute localisation</option>
                    {PROVINCES_MADAGASCAR.map(province => (
                      <option key={province} value={province}>{province}</option>
                    ))}
                  </select>
                </div>
                <Button
                  onClick={applyFilters}
                  disabled={searchLoading}
                  className="px-6 py-4 rounded-xl bg-gradient-to-r from-job-gold to-job-dark-gold text-white font-bold whitespace-nowrap flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {searchLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />
                  ) : (
                    <Search className="h-5 w-5" />
                  )}
                  <span>Rechercher</span>
                </Button>
                <Button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className={`px-6 py-4 rounded-xl flex items-center space-x-2 transition-all font-bold border-2 whitespace-nowrap ${
                    showAdvancedFilters
                      ? 'bg-job-gold text-white border-job-gold'
                      : 'bg-white text-job-gold border-job-gold hover:bg-gray-100'
                  }`}
                >
                  <Filter className="h-5 w-5" />
                  <span className="hidden sm:inline">Filtres</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
                </Button>
              </div>
            </div>
 
            {/* Filtres avancés */}
            {showAdvancedFilters && (
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-2 border-job-gold">
                <h3 className="text-lg font-bold text-job-navy mb-4 flex items-center">
                  <Filter className="h-5 w-5 mr-2 text-job-gold" />
                  Filtres avancés
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {/* Catégorie */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-job-gold"
                    >
                      <option value="">Toutes les catégories</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
 
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type d'emploi</label>
                    <select
                      value={filters.employment_type}
                      onChange={(e) => setFilters(prev => ({ ...prev, employment_type: e.target.value }))}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-job-gold"
                    >
                      <option value="">Tous les types</option>
                      {employmentTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
 
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type de contrat</label>
                    <select
                        value={filters.contract_type}
                        onChange={(e) => setFilters(prev => ({ ...prev, contract_type: e.target.value }))}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-job-gold"
                      >
                      <option value="">Tous les contrats</option>
                      {contractTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
 
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expérience</label>
                    <select
                      value={filters.experience_level}
                      onChange={(e) => setFilters(prev => ({ ...prev, experience_level: e.target.value }))}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-job-gold"
                    >
                      <option value="">Tous les niveaux</option>
                      {experienceLevels.map(level => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>
 
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                    <label className="flex items-center space-x-3 p-3 border-2 border-gray-200 rounded-xl hover:border-job-gold transition-all cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.remote_work === true}
                      onChange={(e) => setFilters(prev => ({ ...prev, remote_work: e.target.checked ? true : undefined }))}
                      className="w-4 h-4 text-job-gold rounded focus:ring-job-gold"
                    />
                      <span className="text-sm font-medium text-gray-700">Travail à distance</span>
                    </label>
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
                    {jobs.length} offres affichées
                  </div>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </section>
 
      {/* Carrousel des offres à la une */}
      <div className="w-full px-4 sm:px-6 lg:px-12 py-6 sm:py-8 text-left">
        <div className="max-w-[1600px] mx-auto w-full">
          <FeaturedJobsCarousel jobs={featuredJobs} isScrolled={isScrolled} />
        </div>
      </div>
 
      {/* Contenu principal - 3 colonnes */}
      <div className="w-full px-4 sm:px-6 lg:px-12 pb-8">
        <div className="max-w-[1600px] mx-auto w-full">

          <div className="lg:grid lg:grid-cols-[260px_minmax(0,1fr)_260px] lg:gap-6 lg:items-start">

            {/* ✅ COLONNE GAUCHE MODIFIÉE : Ajout recherche */}
            <div className="hidden lg:block lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pb-10 job-sidebar-scroll">
  <div className="space-y-6">
                
                {/* 🔍 NOUVEAU : Barre de recherche rapide */}
                <div className="bg-gradient-to-br from-white to-job-cream rounded-2xl p-5 shadow-2xl border-2 border-job-gold">
                    <div className="flex items-center justify-between mb-4 p-2">
                      <h3 className="font-bold text-job-navy text-lg flex items-center">
                        <Search className="h-5 w-5 mr-2 text-job-gold" />
                        Recherche
                      </h3>
                    </div>
                    
                    {/* Recherche par mots-clés */}
                    <div className="mb-4 p-2">
                      <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
                        🔎 Mots-clés
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Poste, entreprise, compétence..."
                          value={filterInputs.search}  // ← filterInputs au lieu de filters
                          onChange={(e) => setFilterInputs(prev => ({ ...prev, search: e.target.value }))}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              applyFilters();
                            }
                          }}
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-job-gold focus:border-job-gold text-sm font-medium"
                        />
                      </div>
                    </div>
                    
                    {/* TYPE DE FILTRE DATE */}
                    <div className="mb-4 p-2">
                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
                      📅 Type de période
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setFilterInputs(prev => ({ ...prev, dateFilterType: 'quick' }))}
                        className={`flex-1 min-w-[70px] py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                          filterInputs.dateFilterType !== 'month' && filterInputs.dateFilterType !== 'custom'
                            ? 'bg-job-gold text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Rapide
                      </button>
                      <button
                        onClick={() => setFilterInputs(prev => ({ ...prev, dateFilterType: 'month' }))}
                        className={`flex-1 min-w-[70px] py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                          filterInputs.dateFilterType === 'month'
                            ? 'bg-job-gold text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Mois
                      </button>
                      <button
                        onClick={() => setFilterInputs(prev => ({ ...prev, dateFilterType: 'custom' }))}
                        className={`flex-1 min-w-[70px] py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                          filterInputs.dateFilterType === 'custom'
                            ? 'bg-job-gold text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Personnalisé
                      </button>
                    </div>
                  </div>

                  {/* FILTRE RAPIDE */}
                  {(!filterInputs.dateFilterType || filterInputs.dateFilterType === 'quick') && (
                    <div className="mb-4 p-2">
                      <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
                        ⚡ Période rapide
                      </label>
                      <select
                        value={filterInputs.dateFilter || ''}
                        onChange={(e) => setFilterInputs(prev => ({ ...prev, dateFilter: e.target.value }))}
                        className="w-full p-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-job-gold text-sm font-bold bg-white"
                      >
                        <option value="">Toutes les dates</option>
                        <option value="24h">Dernières 24 heures</option>
                        <option value="7d">Cette semaine (7 jours)</option>
                        <option value="30d">Ce mois-ci (30 jours)</option>
                        <option value="90d">3 derniers mois</option>
                      </select>
                    </div>
                  )}

                  {/* FILTRE PAR MOIS/ANNÉE */}
                  {filterInputs.dateFilterType === 'month' && (
                    <div className="mb-4 p-2">
                      <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
                        📆 Mois et année
                      </label>
                      <select
                        value={filterInputs.monthYear || ''}
                        onChange={(e) => setFilterInputs(prev => ({ ...prev, monthYear: e.target.value }))}
                        className="w-full p-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-job-gold text-sm font-bold bg-white"
                      >
                        <option value="">Sélectionner un mois</option>
                        {availableMonths.map(month => (
                          <option key={month.value} value={month.value}>
                            {month.label} ({month.count} offres)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* FILTRE PERSONNALISÉ */}
                  {filterInputs.dateFilterType === 'custom' && (
                    <div className="mb-4 space-y-3 p-2">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-2">
                          Du (date de début)
                        </label>
                        <input
                          type="date"
                          value={filterInputs.customDateFrom || ''}
                          onChange={(e) => setFilterInputs(prev => ({ ...prev, customDateFrom: e.target.value }))}
                          className="w-full p-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-job-gold text-sm font-bold bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-2">
                          Au (date de fin)
                        </label>
                        <input
                          type="date"
                          value={filterInputs.customDateTo || ''}
                          onChange={(e) => setFilterInputs(prev => ({ ...prev, customDateTo: e.target.value }))}
                          className="w-full p-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-job-gold text-sm font-bold bg-white"
                        />
                      </div>
                    </div>
                  )}

                    {/* Boutons d'action */}
                    <div className="flex gap-2 p-2">
                    <button
                      onClick={applyFilters}
                      disabled={searchLoading}
                      className="flex-1 bg-gradient-to-r from-job-gold to-job-dark-gold text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {searchLoading ? (
                        <>
                          <div className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                          Recherche en cours...
                        </>
                      ) : (
                        <>
                          <Search className="h-4 w-4 mr-2" />
                          Rechercher
                        </>
                      )}
                    </button>
                      
                      {(filters.search || filters.dateFilter || filters.monthYear || filters.customDateFrom) && (
                        <button
                          onClick={() => {
                            // Reset les inputs ET les filtres
                            setFilterInputs({
                              search: '',
                              dateFilter: '',
                              dateFilterType: 'quick',
                              monthYear: '',
                              customDateFrom: '',
                              customDateTo: ''
                            });
                            setFilters(prev => ({ 
                              ...prev, 
                              search: '', 
                              dateFilter: '',
                              monthYear: '',
                              customDateFrom: '',
                              customDateTo: '',
                              dateFilterType: 'quick'
                            }));
                            setOffset(0);
                            setJobs([]);
                            setHasMore(true);
                          }}
                          className="px-4 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all flex items-center justify-center"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {/* Indicateur recherche active */}
                    {(filters.search || filters.dateFilter || filters.monthYear || filters.customDateFrom) && (
                    <div className="mt-4 bg-job-gold/10 border-2 border-job-gold rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-job-navy">Filtres actifs :</span>
                        <Sparkles className="h-4 w-4 text-job-gold" />
                      </div>
                      {filters.search && (
                        <div className="text-xs text-gray-700 mb-1">
                          🔎 "{filters.search}"
                        </div>
                        )}
                        {filters.dateFilter && (
                          <div className="text-xs text-gray-700">
                            📅 {
                              filters.dateFilter === '24h' ? 'Dernières 24h' :
                              filters.dateFilter === '7d' ? 'Cette semaine' :
                              filters.dateFilter === '30d' ? 'Ce mois' :
                              '3 derniers mois'
                            }
                          </div>
                        )}
                        {filters.monthYear && (
                          <div className="text-xs text-gray-700">
                            📆 {availableMonths.find(m => m.value === filters.monthYear)?.label}
                          </div>
                        )}
                        {filters.customDateFrom && filters.customDateTo && (
                          <div className="text-xs text-gray-700">
                            📅 Du {new Date(filters.customDateFrom).toLocaleDateString('fr-FR')} au {new Date(filters.customDateTo).toLocaleDateString('fr-FR')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
 
                {/* Widget Premium Employeur (INCHANGÉ) */}
                <div className="bg-gradient-to-br from-job-navy to-job-navy-dark rounded-3xl p-6 text-white shadow-2xl transform hover:scale-105 transition-transform">
                  <div className="flex items-center justify-between mb-4">
                    <Crown className="h-12 w-12 text-white" />
                    <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold">
                      PREMIUM
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-3">
                    Boostez vos Offres
                  </h3>
                  <p className="text-white/90 mb-4 text-sm">
                    Mettez vos offres en avant et trouvez les meilleurs talents !
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center text-sm">
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mr-3">
                        <Star className="h-3 w-3" />
                      </div>
                      <span>Offres à la une</span>
                    </li>
                    <li className="flex items-center text-sm">
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mr-3">
                        <Target className="h-3 w-3" />
                      </div>
                      <span>Ciblage candidats</span>
                    </li>
                    <li className="flex items-center text-sm">
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mr-3">
                        <TrendingUp className="h-3 w-3" />
                      </div>
                      <span>5x plus de visibilité</span>
                    </li>
                  </ul>
                  <button 
                    onClick={handleCreateJob}
                    className="w-full bg-white text-job-navy hover:bg-gray-100 font-bold py-3 shadow-lg rounded-xl transition-all"
                  >
                    Publier une offre
                  </button>
                </div>
 
                {/* Filtres rapides (INCHANGÉ) */}
                <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-job-navy flex items-center">
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
                        onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-job-gold"
                      >
                        <option value="">Toutes</option>
                        {categories.map(category => (  
                          <option key={category.id} value={category.name}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
 
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type de contrat</label>
                      <select
                      value={filters.contract_type}
                      onChange={(e) => setFilters(prev => ({ ...prev, contract_type: e.target.value }))}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-job-gold"
                      >
                        <option value="">Tous</option>
                        {contractTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
 
                    <div>
                      <label className="flex items-center space-x-3 p-3 border-2 border-gray-200 rounded-lg hover:border-job-gold transition-all cursor-pointer">
                      <input
                          type="checkbox"
                          checked={filters.remote_work === true}
                          onChange={(e) => setFilters(prev => ({ ...prev, remote_work: e.target.checked ? true : undefined }))}
                          className="w-4 h-4 text-job-gold rounded focus:ring-job-gold"
                        />
                        <span className="text-sm font-medium text-gray-700">Travail à distance</span>
                      </label>
                    </div>
                    <div>
  <button
    onClick={applyFilters}
    className="w-full bg-job-gold text-white py-3 rounded-xl font-bold hover:bg-job-dark-gold transition-all mt-4"
  >
    Appliquer les filtres
  </button>
</div>
                  </div>
                </div>
 
                {/* Widget Conseils (INCHANGÉ) */}
                <div className="boxconseil bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                  <div className="flex items-center mb-4">
                    <Sparkles className="h-6 w-6 text-job-gold mr-3" />
                    <h3 className="font-bold text-job-navy">Conseils Recherche</h3>
                  </div>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-job-gold rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Utilisez des mots-clés précis</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-job-gold rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Consultez les offres récentes</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-job-gold rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Postulez rapidement</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-job-gold rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Activez les alertes</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
 
            {/* Colonne centrale - Liste des offres */}
            <div className="min-w-0">
              {/* Header avec stats */}
              <div ref={jobsListRef} className="filtresm bg-white rounded-xl shadow-lg border border-job-gold mb-16 p-4 flex-shrink-0">
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
    <div>
      <h2 className="text-2xl font-bold text-job-navy mb-2">
        {loading ? '⏳ Chargement...' : `📋 ${jobs.length} offres affichées`}
      </h2>
      <p className="text-gray-600">
        Découvrez les meilleures opportunités
      </p>
    </div>
    
    {/* Boutons à droite */}
    <div className="flex gap-3 mt-4 sm:mt-0">
      {/* Bouton Réinitialiser - TOUJOURS VISIBLE */}
      <Button
        onClick={() => {
          setFilters({
            search: '',
            category: '',
            employment_type: '',
            contract_type: '',
            experience_level: '',
            location: '',
            remote_work: undefined,
            dateFilter: ''
          });
          setOffset(0);
          setJobs([]);
          setHasMore(true);
        }}
        className="bg-gradient-to-r from-red-500 to-slate-500 text-white flex items-center space-x-2 px-6 py-3 shadow-lg hover:shadow-xl transition-all font-bold"
      >
        <X className="h-5 w-5" />
        <span>Réinitialiser</span>
      </Button>
      
      {/* Bouton Publier (employeur seulement) */}
      {isEmployer && (
        <Button
          onClick={handleCreateJob}
          className="bg-gradient-to-br from-job-navy to-job-navy-dark text-white flex items-center space-x-2 px-6 py-3 shadow-lg hover:shadow-xl transition-all font-bold"
        >
          <Plus className="h-5 w-5" />
          <span>Publier une offre</span>
        </Button>
      )}
    </div>
  </div>
</div>
 
              {/* Zone scrollable - LISTE DES OFFRES */}
              <div className="mt-0">
              {(loading && offset === 0) || searchLoading ? (
                  /* Skeleton initial */
                  <div className="space-y-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="bg-white rounded-2xl p-6 shadow-lg animate-pulse border border-gray-100">
                        <div className="flex space-x-4">
                          <div className="h-16 w-16 bg-gray-200 rounded-xl"></div>
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
                ) : jobs.length === 0 ? (
                  /* Message vide */
                  <div className="text-center py-16 bg-white rounded-2xl shadow-xl border-2 border-gray-200" style={{ minHeight: '900px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Briefcase className="h-20 w-20 text-gray-300 mx-auto mb-6" />
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                      🔍 Aucune offre trouvée
                    </h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      Essayez de modifier vos critères de recherche ou réinitialisez les filtres.
                    </p>
                    <div className="flex gap-4 justify-center">
                      <Button 
                        onClick={() => {
                          clearFilters();
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }} 
                        className="bg-gradient-to-r from-job-gold to-job-dark-gold text-white px-8 py-4 rounded-xl font-bold shadow-lg"
                      >
                        <X className="h-5 w-5 mr-2" />
                        Réinitialiser et actualiser
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {jobs.map((job) => (
                      <div 
                        key={job.$id} 
                        onClick={() => handleJobClick(job.$id)}
                        className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-job-gold cursor-pointer group"
                      >
                        <div className="flex items-start flex-col md:flex-row md:space-x-6 gap-4 md:gap-0">
                          <div className="h-16 w-16 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg border-2 border-gray-100 bg-white overflow-hidden">
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
                              className={`fallback-icon w-full h-full bg-gradient-to-r from-job-gold to-job-gold rounded-lg flex items-center justify-center ${job.employer_logo ? 'hidden' : 'flex'}`}
                            >
                              <Building className="h-8 w-8 text-white" />
                            </div>
                          </div>
 
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                                  <h3 className="text-lg md:text-xl font-bold text-job-navy group-hover:text-job-gold transition-colors line-clamp-1">
                                    {job.title}
                                  </h3>
                                  {job.is_featured && (
                                    <div className="bg-gradient-to-r from-job-gold to-job-gold text-white px-3 py-1 rounded-full text-xs font-bold flex items-center">
                                      <Star className="h-3 w-3 mr-1" />
                                      Pro
                                    </div>
                                  )}
                                  {job.is_urgent && (
                                    <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center animate-pulse">
                                      <Zap className="h-3 w-3 mr-1" />
                                      Urgent
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-2 md:gap-4 text-sm text-gray-600 mb-3">
                                  <span className="font-bold text-job-gold">{job.company_name}</span>
                                  <span className="flex items-center">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    {job.location}
                                  </span>
                                  <span className="flex items-center">
                                    <Clock className="h-4 w-4 mr-1" />
                                    {getTimeAgo(job.created_at)}
                                  </span>
                                  <span className="flex items-center text-green-600">
                                    <Eye className="h-4 w-4 mr-1" />
                                    {job.views_count || 0} vues
                                  </span>
                                </div>
 
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                                  {job.description?.replace(/<[^>]*>/g, '').substring(0, 150)}...
                                </p>
 
                                <div className="flex flex-wrap gap-2">
                                  <span className="px-3 py-1 bg-gradient-to-r from-job-gold to-job-dark-gold text-white text-xs font-bold rounded-full">
                                    {job.category}
                                  </span>
                                  <span className="px-3 py-1 bg-slate-100 text-job-navy-dark text-xs font-bold rounded-full">
                                    {contractTypes.find(t => t.value === job.contract_type)?.label || job.contract_type}
                                  </span>
                                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                    {experienceLevels.find(l => l.value === job.experience_level)?.label || job.experience_level}
                                  </span>
                                  {formatSalary(job) && (
                                    <span className="px-3 py-1 bg-slate-100 text-job-navy-dark text-xs font-bold rounded-full">
                                      {formatSalary(job)}
                                    </span>
                                  )}
                                  {job.remote_work && (
                                    <span className="px-3 py-1 bg-slate-100 text-job-navy-dark text-xs font-bold rounded-full">
                                      🏠 Remote
                                    </span>
                                  )}
                                </div>
                              </div>
 
                              <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start mt-4 md:mt-0 md:space-y-3 md:ml-6">
                                {job.application_deadline && (
                                  <div className="text-xs text-job-dark-gold flex items-center bg-slate-50 px-3 py-1 rounded-full">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    <span className="hidden md:inline">Date limite: </span>
                                    {new Date(job.application_deadline).toLocaleDateString('fr-FR')}
                                  </div>
                                )}
                                
                                <div className="flex items-center text-job-gold group-hover:text-job-dark-gold transition-colors">
                                  <span className="font-bold mr-2 text-sm">Voir les détails</span>
                                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
 
                    {/* ✅ BOUTON "VOIR PLUS" au lieu de pagination */}
                    {hasMore && (
                      <div className="flex justify-center py-8">
                        <Button
                          onClick={handleLoadMore}
                          disabled={loadingMore}
                          className="bg-gradient-to-r from-job-gold to-job-dark-gold text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-2xl transition-all transform hover:scale-105"
                        >
                          {loadingMore ? (
                            <>
                              <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                              Chargement de 30 offres...
                            </>
                          ) : (
                            <>
                              Voir 30 offres supplémentaires
                              <ChevronDown className="h-5 w-5 ml-2" />
                            </>
                          )}
                        </Button>
                      </div>
                    )}
 
                    {!hasMore && jobs.length > 0 && (
                      <div className="text-center py-8 bg-gradient-to-r from-job-cream to-white rounded-2xl border-2 border-job-gold/20">
                        <CheckCircle className="h-12 w-12 text-job-gold mx-auto mb-3" />
                        <p className="text-job-navy font-bold text-lg mb-2">
                          🎉 Vous avez vu toutes les offres disponibles
                        </p>
                        <p className="text-gray-600 text-sm">
                          {jobs.length} offres au total
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
 
            {/* Colonne droite - Widgets (INCHANGÉE) */}
            <div className="hidden lg:block lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pb-10 job-sidebar-scroll">
  <div className="space-y-6"> 
                <RecentJobsWidget jobs={recentJobs} />
 
                {isPremium ? (
                  <div className="bg-gradient-to-br from-job-gold via-job-gold to-job-dark-gold rounded-2xl p-6 text-white shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold flex items-center">
                        <Crown className="h-5 w-5 mr-2" />
                        Membre Premium
                      </h3>
                      <div className="flex items-center space-x-2">
                        <PremiumBadge size="sm" />
                        <CheckCircle className="h-6 w-6" />
                      </div>
                    </div>
                    
                    <p className="text-white/90 text-sm mb-4">
                      Vous profitez de tous les avantages Premium !
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm">
                        <Star className="h-4 w-4 mr-2" />
                        <span>Offres à la une</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Eye className="h-4 w-4 mr-2" />
                        <span>Contact direct</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <FileText className="h-4 w-4 mr-2" />
                        <span>Téléchargement CV</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => navigate('/dashboard')}
                      className="w-full bg-white/20 hover:bg-white/30 text-white font-bold py-3 rounded-xl transition-all"
                    >
                      Gérer mon abonnement
                    </button>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-job-gold via-job-gold to-job-dark-gold rounded-2xl p-6 text-white shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold flex items-center">
                        <Crown className="h-5 w-5 mr-2" />
                        Premium
                      </h3>
                      <Rocket className="h-5 w-5 text-white/50" />
                    </div>
                    
                    <p className="text-white/90 text-sm mb-4">
                      Démarquez-vous avec nos outils Premium !
                    </p>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-sm">
                        <BadgeCheck className="h-4 w-4 mr-2" />
                        <span>Annonces mis en avant</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Star className="h-4 w-4 mr-2" />
                        <span>Contact direct avec les profils</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Zap className="h-4 w-4 mr-2" />
                        <span>Fonctionnalités Express</span>
                      </div>
                    </div>
                          
                    <PremiumButton 
                      variant="default"
                      className="w-full md:w-auto"
                    >
                      Passer au Premium
                    </PremiumButton>
                  </div>
                )}
 
                <div className="bg-gradient-to-br from-job-navy via-job-navy to-job-navy rounded-2xl p-6 text-white shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold flex items-center">
                      <Activity className="h-5 w-5 mr-2" />
                      Marché de l'emploi
                    </h3>
                    <TrendingUp className="h-5 w-5 text-white/50" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white/80 text-sm">Nouvelles offres</span>
                      <span className="font-bold text-lg">+{recentJobs.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/80 text-sm">Cette semaine</span>
                      <span className="font-bold text-lg">{Math.ceil(jobs.length / 4)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/80 text-sm">Taux d'embauche</span>
                      <span className="font-bold text-lg">73%</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <div className="flex items-center justify-center">
                      <Shield className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">Données vérifiées</span>
                    </div>
                  </div>
                </div>
 
                <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-job-cream rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="h-8 w-8 text-job-gold" />
                    </div>
                    <h3 className="font-bold text-job-navy mb-2">Besoin d'aide ?</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Notre Support est là pour vous accompagner
                    </p>
                    <Link to="/contact">
                      <button className="btn-primary">
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

      {/* Styles CSS */}
      <style>{`
        html, body {
          overflow-x: hidden;
          max-width: 100vw;
        }

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

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .shadow-3xl {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        @keyframes slideIn {
          0% { opacity: 0; transform: translateX(30px) scale(0.95); }
          100% { opacity: 1; transform: translateX(0) scale(1); }
        }

        .animate-slide-in {
          animation: slideIn 0.6s ease-out forwards;
        }

        .job-sidebar-scroll {
          scrollbar-width: thin;
          scrollbar-color: #D4AF37 #f3f4f6;
        }

        .job-sidebar-scroll::-webkit-scrollbar {
          width: 8px;
        }

        .job-sidebar-scroll::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 10px;
        }

        .job-sidebar-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #D4AF37 0%, #F39C12 100%);
          border-radius: 10px;
        }

        .job-sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #B8860B 0%, #D4AF37 100%);
        }

        @media (max-width: 768px) {
          .mobile-card:nth-child(2),
          .mobile-card:nth-child(3) {
            display: none !important;
          }

          .mobile-card:first-child {
            width: 100% !important;
            min-width: 100% !important;
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Jobs;