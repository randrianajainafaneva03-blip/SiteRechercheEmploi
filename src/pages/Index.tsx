import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Briefcase, Star, ArrowRight, Clock, Building, Eye, Crown, Zap, TrendingUp, Shield, Globe, Award, Target, Sparkles, Gift, Rocket, BadgeCheck, Activity, MessageSquare, Users, Package, DollarSign, Timer, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useJobsQuery, useServicesQuery } from '@/hooks/useAppwriteQuery';
import { databases, DATABASE_ID } from '@/lib/appwrite';
import { SEO } from '@/components/SEO';

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
  'Maintirano'
];

const JobMadaHomepage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  const [selectedService, setSelectedService] = useState(null);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const [translateX, setTranslateX] = useState(0);
  const [jobsWithLogos, setJobsWithLogos] = useState([]);
  const [featuredJobsWithLogos, setFeaturedJobsWithLogos] = useState([]);
  
  // Hook pour les services premium
  const { data: premiumServicesData, isLoading: premiumServicesLoading } = useServicesQuery({
    limit: 10 // Plus de services pour le carrousel
  });

  // État pour les services premium avec créateur
  const [premiumServicesWithCreators, setPremiumServicesWithCreators] = useState([]);
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);
  const [isServiceCarouselPaused, setIsServiceCarouselPaused] = useState(false);

  // Récupération des vraies données depuis Appwrite
  const { data: jobsData, isLoading: jobsLoading } = useJobsQuery({
    is_featured: false,
    limit: 6
  });

  const { data: featuredJobsData, isLoading: featuredLoading } = useJobsQuery({
    is_featured: true,
    limit: 10
  });

  const { data: servicesData, isLoading: servicesLoading } = useServicesQuery({
    limit: 6
  });

  // Données réelles ou tableaux vides si en cours de chargement
  const recentJobs = jobsData?.data || [];
  const featuredJobs = featuredJobsData?.data || [];
  const recentServices = servicesData?.data || [];

  useEffect(() => {
    const loadPremiumServicesWithCreators = async () => {
      if (premiumServicesData?.data?.length > 0) {
        try {
          const servicesWithCreators = await Promise.all(
            premiumServicesData.data
              .filter(service => service.is_premium) // Filtrer seulement les premium
              .map(async (service) => {
                if (service.creator_id) {
                  try {
                    const creatorData = await databases.getDocument(
                      DATABASE_ID,
                      'profiles',
                      service.creator_id
                    );
                    
                    return { 
                      ...service, 
                      creator: {
                        full_name: creatorData.full_name,
                        avatar_url: creatorData.avatar_url,
                        location: creatorData.location,
                        is_premium: creatorData.is_premium
                      }
                    };
                  } catch (error) {
                    console.log('Erreur créateur pour service', service.$id);
                  }
                }
                return { ...service, creator: null };
              })
          );
          
          setPremiumServicesWithCreators(servicesWithCreators.filter(s => s.creator !== null));
        } catch (error) {
          console.error('Erreur lors du chargement des services premium:', error);
        }
      }
    };
  
    loadPremiumServicesWithCreators();
  }, [premiumServicesData]);

  useEffect(() => {
    const loadJobLogos = async () => {
      if (recentJobs.length > 0) {
        try {
          const jobsWithLogosData = await Promise.all(
            recentJobs.map(async (job) => {
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
          setJobsWithLogos(recentJobs.map(job => ({ ...job, employer_logo: null })));
        }
      }
    };
  
    loadJobLogos();
  }, [recentJobs]);

  useEffect(() => {
    const loadFeaturedJobLogos = async () => {
      if (featuredJobs.length > 0) {
        try {
          const featuredJobsWithLogosData = await Promise.all(
            featuredJobs.map(async (job) => {
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
          
          setFeaturedJobsWithLogos(featuredJobsWithLogosData);
        } catch (error) {
          console.error('Erreur lors du chargement des logos featured:', error);
          setFeaturedJobsWithLogos(featuredJobs.map(job => ({ ...job, employer_logo: null })));
        }
      }
    };
  
    loadFeaturedJobLogos();
  }, [featuredJobs]);

  useEffect(() => {
    if (premiumServicesWithCreators.length > 0 && !isServiceCarouselPaused) {
      const interval = setInterval(() => {
        setCurrentServiceIndex((prev) => (prev + 1) % premiumServicesWithCreators.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [premiumServicesWithCreators.length, isServiceCarouselPaused]);
  
  const getVisiblePremiumServices = () => {
    if (premiumServicesWithCreators.length === 0) return [];
    
    const visibleServices = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentServiceIndex + i) % premiumServicesWithCreators.length;
      visibleServices.push({
        ...premiumServicesWithCreators[index],
        uniqueKey: `${premiumServicesWithCreators[index].$id}-${currentServiceIndex}-${i}`,
        displayIndex: i
      });
    }
    return visibleServices;
  };

  // Carrousel automatique pour les offres à la une
  useEffect(() => {
    if (featuredJobsWithLogos.length > 0 && !isCarouselPaused) {
      const interval = setInterval(() => {
        setCurrentFeaturedIndex((prev) => (prev + 1) % featuredJobsWithLogos.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [featuredJobsWithLogos.length, isCarouselPaused]);

  useEffect(() => {
    const cardWidth = 100 / 3; // Chaque carte fait 33.33% de largeur
    setTranslateX(currentFeaturedIndex * cardWidth);
  }, [currentFeaturedIndex]);

  const goToNextFeatured = () => {
    setCurrentFeaturedIndex((prev) => (prev + 1) % featuredJobsWithLogos.length);
  };
  
  const goToPrevFeatured = () => {
    setCurrentFeaturedIndex((prev) => (prev - 1 + featuredJobsWithLogos.length) % featuredJobsWithLogos.length);
  };

  const getVisibleFeaturedJobs = () => {
    if (featuredJobsWithLogos.length === 0) return [];
    
    const visibleJobs = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentFeaturedIndex + i) % featuredJobsWithLogos.length;
      visibleJobs.push({
        ...featuredJobsWithLogos[index],
        uniqueKey: `${featuredJobsWithLogos[index].$id}-${currentFeaturedIndex}-${i}`,
        displayIndex: i
      });
    }
    return visibleJobs;
  };

  const handleServiceClick = (service) => {
    setSelectedService(service);
    setShowServiceModal(true);
  };

  const closeServiceModal = () => {
    setShowServiceModal(false);
    setSelectedService(null);
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (selectedLocation) params.append('location', selectedLocation);
    
    navigate(`/jobs?${params.toString()}`);
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

  const stats = [
    { number: jobsData?.count || "1200+", label: "Entreprises", icon: "🏢" },
    { number: "8500+", label: "Candidats", icon: "👥" },
    { number: "95%", label: "Satisfaction", icon: "⭐" },
    { number: recentJobs.length || "2000+", label: "Offres Actives", icon: "💼" }
  ];

  return (
    <>
      <SEO 
        title="Job2mada - Plateforme d'emploi Madagascar | Offres et recrutement"
        description="Trouvez votre emploi de rêve à Madagascar sur Job2mada. Plus de 2500 offres d'emploi, 15000 candidats actifs. Recrutement et carrières à Antananarivo."
        keywords="job2mada, emploi madagascar, travail antananarivo, recrutement madagascar, offres emploi, cv madagascar"
      />

      <div className="min-h-screen bg-slate-50">
        <Navbar />

        {/* Hero Section pleine largeur avec hauteur fixe */}
        <section className="relative overflow-hidden bg-gradient-to-r from-job-navy via-job-navy-light to-job-navy-dark pt-24 pb-12 md:min-h-[600px] lg:pt-24 lg:pb-12 lg:min-h-screen w-full flex flex-col">
          <div className="absolute inset-0 bg-black/10"></div>
          
          {/* Animation d'étoiles magnifiques côté gauche - Hidden on mobile */}
          <div className="absolute left-0 top-0 w-1/2 h-full overflow-hidden hidden md:block">
            {/* Étoiles scintillantes */}
            <div className="absolute top-20 left-16 w-1 h-1 bg-white rounded-full animate-twinkle opacity-80"></div>
            <div className="absolute top-32 left-32 w-1.5 h-1.5 bg-job-light-gold rounded-full animate-twinkle delay-500 opacity-70"></div>
            <div className="absolute top-48 left-24 w-1 h-1 bg-white rounded-full animate-twinkle delay-1000 opacity-90"></div>
            <div className="absolute top-64 left-40 w-2 h-2 bg-job-light-gold rounded-full animate-twinkle delay-1500 opacity-60"></div>
            <div className="absolute top-80 left-20 w-1 h-1 bg-white rounded-full animate-twinkle delay-2000 opacity-85"></div>
            <div className="absolute top-96 left-36 w-1.5 h-1.5 bg-job-light-gold rounded-full animate-twinkle delay-2500 opacity-75"></div>
            
            {/* Étoiles plus grandes avec croix */}
            <div className="absolute top-40 left-48 animate-sparkle">
              <div className="relative w-3 h-3">
                <div className="absolute inset-0 bg-white rounded-full opacity-80"></div>
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white transform -translate-y-1/2 opacity-60"></div>
                <div className="absolute left-1/2 top-0 h-full w-0.5 bg-white transform -translate-x-1/2 opacity-60"></div>
              </div>
            </div>
            
            <div className="absolute top-72 left-28 animate-sparkle delay-700">
              <div className="relative w-2.5 h-2.5">
                <div className="absolute inset-0 bg-job-light-gold rounded-full opacity-70"></div>
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-job-light-gold transform -translate-y-1/2 opacity-50"></div>
                <div className="absolute left-1/2 top-0 h-full w-0.5 bg-job-light-gold transform -translate-x-1/2 opacity-50"></div>
              </div>
            </div>
            
            <div className="absolute top-56 left-44 animate-sparkle delay-1400">
              <div className="relative w-2 h-2">
                <div className="absolute inset-0 bg-job-light-gold rounded-full opacity-90"></div>
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-job-light-gold transform -translate-y-1/2 opacity-70"></div>
                <div className="absolute left-1/2 top-0 h-full w-0.5 bg-job-light-gold transform -translate-x-1/2 opacity-70"></div>
              </div>
            </div>
            
            {/* Particules dorées flottantes */}
            <div className="absolute top-24 left-52 w-1 h-1 bg-gradient-to-r from-job-gold to-job-gold rounded-full animate-float-up opacity-60"></div>
            <div className="absolute top-44 left-12 w-1.5 h-1.5 bg-gradient-to-r from-job-light-gold to-job-light-gold rounded-full animate-float-up delay-800 opacity-70"></div>
            <div className="absolute top-68 left-60 w-1 h-1 bg-gradient-to-r from-job-light-gold to-job-gold rounded-full animate-float-up delay-1600 opacity-50"></div>
            <div className="absolute top-84 left-16 w-2 h-2 bg-gradient-to-r from-job-light-gold to-job-light-gold rounded-full animate-float-up delay-2400 opacity-80"></div>
            
            {/* Lueurs magiques */}
            <div className="absolute top-36 left-40 w-8 h-8 bg-white/10 rounded-full blur-md animate-pulse-glow"></div>
            <div className="absolute top-60 left-20 w-12 h-12 bg-job-gold/15 rounded-full blur-lg animate-pulse-glow delay-1000"></div>
            <div className="absolute top-76 left-56 w-6 h-6 bg-job-light-gold/20 rounded-full blur-sm animate-pulse-glow delay-2000"></div>
          </div>
          
          <div className="relative w-full flex-1 flex flex-col md:flex-row">

            {/* Côté gauche - Titre + Formulaire - Responsive */}
            <div className="w-full md:w-1/2 flex items-center justify-center px-4 sm:px-8 lg:px-16 relative z-10">
              <div className="text-white max-w-2xl w-full">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-6 sm:mb-8 text-center md:text-left">
                  Trouvez le Job
                  <br />
                  <span className="text-job-light-gold">de Vos Rêves</span>
                  <br />
                  à Madagascar
                </h1>
                <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 text-job-light-gold leading-relaxed text-center md:text-left">
                  Job2Mada connecte les talents avec les meilleures opportunités professionnelles 
                  sur l'île, avec plus de {recentJobs.length} offres disponibles.
                </p>
                
                {/* Formulaire de recherche intégré - Responsive */}
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-2xl border border-white/20">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 text-center md:text-left">Recherche rapide</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mots clés</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="text"
                          placeholder="Titre, compétences ou entreprise"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent text-sm sm:text-base text-gray-900 placeholder-gray-400 bg-white"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Lieu</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <select
                          value={selectedLocation}
                          onChange={(e) => setSelectedLocation(e.target.value)}
                          className="w-full text-black pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent appearance-none bg-white text-sm sm:text-base"
                        >
                          <option value="">Toutes les régions</option>
                          {PROVINCES_MADAGASCAR.map(province => (
                            <option key={province} value={province}>{province}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <button 
                      onClick={handleSearch}
                      className="w-full bg-gradient-to-r from-job-gold to-job-dark-gold text-white py-3 rounded-lg font-semibold hover:from-job-dark-gold hover:to-job-gold transition-all transform hover:scale-105 text-sm sm:text-base"
                    >
                      Rechercher des offres
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Côté droit - Image pleine largeur - Hidden on mobile */}
            <div className="hidden md:block w-1/2 relative self-stretch">
              <div className="relative h-full w-full">
                <div 
                  className="h-full w-full relative overflow-hidden group"
                  style={{
                    backgroundImage: 'url("/hero-image2.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  {/* Effet de brillance qui traverse */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-2000 ease-in-out bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12"></div>
                  
                  {/* Particules magiques flottantes */}
                  <div className="absolute top-20 left-12 w-1 h-1 bg-white rounded-full animate-ping opacity-60"></div>
                  <div className="absolute top-1/4 left-16 w-1.5 h-1.5 bg-job-gold rounded-full animate-pulse delay-300 opacity-80"></div>
                  <div className="absolute top-1/3 left-8 w-1 h-1 bg-white rounded-full animate-bounce delay-700 opacity-50"></div>
                  <div className="absolute top-1/2 left-20 w-2 h-2 bg-job-gold rounded-full animate-ping delay-1000 opacity-40"></div>
                  <div className="absolute top-2/3 left-14 w-1 h-1 bg-white rounded-full animate-pulse delay-1500 opacity-70"></div>
                  <div className="absolute top-3/4 left-18 w-1.5 h-1.5 bg-job-gold rounded-full animate-bounce delay-500 opacity-60"></div>
                </div>
                
                {/* Éléments décoratifs flottants */}
                <div className="absolute top-10 -right-6 w-12 h-12 bg-gradient-to-r from-job-gold/20 to-job-gold/20 rounded-full blur-lg animate-float"></div>
                <div className="absolute bottom-20 -right-8 w-16 h-16 bg-gradient-to-r from-white/15 to-job-gold/15 rounded-full blur-xl animate-float delay-700"></div>
              </div>
            </div>
          </div>
          
          {/* Styles CSS pour les animations magnifiques */}
          <style>{`
            @keyframes float {
              0%, 100% { transform: translateY(0px) scale(1); }
              50% { transform: translateY(-12px) scale(1.1); }
            }
            
            @keyframes twinkle {
              0%, 100% { opacity: 0.3; transform: scale(0.8); }
              50% { opacity: 1; transform: scale(1.2); }
            }
            
            @keyframes sparkle {
              0%, 100% { opacity: 0.4; transform: scale(0.8) rotate(0deg); }
              50% { opacity: 1; transform: scale(1.3) rotate(180deg); }
            }
            
            @keyframes float-up {
              0% { transform: translateY(0px) translateX(0px); opacity: 0; }
              50% { opacity: 1; }
              100% { transform: translateY(-50px) translateX(10px); opacity: 0; }
            }
            
            @keyframes pulse-glow {
              0%, 100% { opacity: 0.1; transform: scale(0.8); }
              50% { opacity: 0.3; transform: scale(1.2); }
            }
            
            .animate-float {
              animation: float 4s ease-in-out infinite;
            }
            
            .animate-twinkle {
              animation: twinkle 2s ease-in-out infinite;
            }
            
            .animate-sparkle {
              animation: sparkle 3s ease-in-out infinite;
            }
            
            .animate-float-up {
              animation: float-up 4s ease-out infinite;
            }
            
            .animate-pulse-glow {
              animation: pulse-glow 4s ease-in-out infinite;
            }
          `}</style>
        </section>

        {/* Featured Jobs Carousel Section - Responsive */}
        {featuredJobsWithLogos.length > 0 && (
          <section className="py-8 sm:py-12 lg:py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
                  Offres <span className="text-slate-500">à la Une</span>
                </h2>
                <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                  Découvrez les opportunités mises en avant par nos partenaires premium
                </p>
              </div>
              
              <div className="relative overflow-hidden">
                <div 
                  className="relative"
                  onMouseEnter={() => setIsCarouselPaused(true)}
                  onMouseLeave={() => setIsCarouselPaused(false)}
                >
                  {/* Grid adaptatif : 1 colonne sur mobile, 2 sur tablet, 3 sur desktop */}
                  <div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 transition-all duration-1000 ease-in-out"
                    key={currentFeaturedIndex}
                  >
                    {getVisibleFeaturedJobs().map((job, index) => (
                      <div
                        key={job.uniqueKey}
                        className="transform transition-all duration-700 ease-in-out animate-fade-in-up"
                        style={{ animationDelay: `${index * 0.15}s` }}
                      >
                        <Link to={`/jobs/${job.$id}`} className="block h-full">
                          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-job-light-gold hover:border-job-gold group hover:-translate-y-2 h-full transform-gpu">
                            <div className="flex items-start space-x-3 sm:space-x-4 mb-4">
                              <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl flex items-center justify-center shadow-lg border border-gray-100 bg-white overflow-hidden group-hover:scale-110 transition-transform flex-shrink-0">
                                {job.employer_logo ? (
                                  <img 
                                    src={job.employer_logo} 
                                    alt={`Logo ${job.company_name}`}
                                    className="w-full h-full object-contain p-2"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      const fallback = target.parentNode?.querySelector('.fallback-icon') as HTMLElement;
                                      if (fallback) fallback.style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                <div 
                                  className={`fallback-icon w-full h-full bg-gradient-to-r from-job-gold to-job-dark-gold rounded-xl flex items-center justify-center ${job.employer_logo ? 'hidden' : 'flex'}`}
                                >
                                  <Building className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1">
                                  <div className="bg-gradient-to-r from-job-gold to-job-gold text-white px-2 py-1 rounded-full text-xs font-bold flex items-center animate-pulse">
                                    <Star className="h-3 w-3 mr-1" />
                                    <span>PREMIUM</span>
                                    </div>
                                  {job.is_urgent && (
                                    <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center animate-pulse">
                                      <Zap className="h-3 w-3 mr-1" />
                                      <span>URGENT</span>
                                    </div>
                                  )}
                                </div>
                                <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-800 group-hover:text-slate-500 transition-colors line-clamp-1">
                                  {job.title}
                                </h3>
                                <p className="text-slate-500 font-semibold text-xs sm:text-sm">{job.company_name}</p>
                              </div>
                            </div>

                            <div className="space-y-2 mb-4 text-xs sm:text-sm text-gray-600">
                              <div className="flex items-center">
                                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-slate-500 mr-2 flex-shrink-0" />
                                <span className="truncate">{job.location}</span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-job-navy mr-2 flex-shrink-0" />
                                <span className="truncate">{getTimeAgo(job.$createdAt)}</span>
                              </div>
                              <div className="flex items-center">
                                <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 mr-2 flex-shrink-0" />
                                <span>{job.views_count || 0} vues</span>
                              </div>
                            </div>

                            <p className="text-gray-700 mb-4 line-clamp-2 text-xs sm:text-sm hidden sm:block">
                              {job.description?.replace(/<[^>]*>/g, '').substring(0, 100)}...
                            </p>

                            <div className="flex flex-wrap gap-1 sm:gap-2 mb-4">
                              <span className="px-2 sm:px-3 py-1 bg-gradient-to-r from-job-gold to-job-dark-gold text-white rounded-full text-xs font-bold">
                                {job.category}
                              </span>
                              <span className="px-2 sm:px-3 py-1 bg-slate-100 text-job-navy-dark rounded-full text-xs font-bold">
                                {job.contract_type?.toUpperCase()}
                              </span>
                              {formatSalary(job) && (
                                <span className="px-2 sm:px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold hidden sm:inline-block">
                                  {formatSalary(job)}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-center text-slate-500 group-hover:text-job-dark-gold transition-colors">
                              <span className="font-bold mr-1 md:mr-2 text-xs sm:text-sm">
                                Voir les détails
                              </span>
                              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>

                  {/* Flèches de navigation - Hidden on mobile */}
                  {featuredJobsWithLogos.length > 1 && (
                    <>
                      <button
                        onClick={goToPrevFeatured}
                        className="hidden sm:block absolute left-2 top-1/2 transform -translate-y-1/2 bg-slate-500/90 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full shadow-lg hover:bg-job-dark-gold hover:shadow-xl transition-all z-10"
                      >
                        <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6" />
                      </button>
                      <button
                        onClick={goToNextFeatured}
                        className="hidden sm:block absolute right-2 top-1/2 transform -translate-y-1/2 bg-slate-500/90 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full shadow-lg hover:bg-job-dark-gold hover:shadow-xl transition-all z-10"
                      >
                        <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6" />
                      </button>
                    </>
                  )}
                </div>

                {/* Indicateurs */}
                {featuredJobsWithLogos.length > 1 && (
                  <div className="flex justify-center mt-6 sm:mt-8 space-x-2">
                    {featuredJobsWithLogos.map((_, index) => (
                      <button
                        key={`indicator-${index}`}
                        onClick={() => setCurrentFeaturedIndex(index)}
                        className={`transition-all duration-300 ${
                          index === currentFeaturedIndex 
                            ? 'w-6 sm:w-8 h-2 sm:h-3 bg-slate-500 rounded-full shadow-lg' 
                            : 'w-2 sm:w-3 h-2 sm:h-3 bg-gray-300 hover:bg-job-gold rounded-full'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Latest Jobs Section - Responsive */}
        <section className="py-8 sm:py-12 lg:py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
                Dernières <span className="text-slate-500">Offres d'Emploi</span>
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                Découvrez les {recentJobs.length} opportunités les plus récentes
              </p>
            </div>
            
            {jobsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 sm:p-6 shadow-lg animate-pulse">
                    <div className="flex items-start space-x-3 sm:space-x-4 mb-4">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gray-200 rounded-xl flex-shrink-0"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-2 sm:h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 sm:h-3 bg-gray-200 rounded"></div>
                      <div className="h-2 sm:h-3 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : jobsWithLogos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
                {jobsWithLogos.slice(0, 6).map((job) => (
                  <Link key={job.$id} to={`/jobs/${job.$id}`} className="block">
                    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-job-gold group hover:-translate-y-1">
                      <div className="flex items-start space-x-3 sm:space-x-4 mb-4">
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center shadow-md border border-gray-100 bg-white overflow-hidden flex-shrink-0">
                          {job.employer_logo ? (
                            <img 
                              src={job.employer_logo} 
                              alt={`Logo ${job.company_name}`}
                              className="w-full h-full object-contain p-1"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const fallback = target.parentNode?.querySelector('.fallback-icon') as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className={`fallback-icon w-full h-full bg-gradient-to-r from-job-gold to-job-dark-gold rounded-xl flex items-center justify-center ${job.employer_logo ? 'hidden' : 'flex'}`}
                          >
                            <Building className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-800 group-hover:text-slate-500 transition-colors line-clamp-1 text-sm sm:text-base">
                            {job.title}
                          </h3>
                          <p className="text-slate-500 font-medium text-xs sm:text-sm">{job.company_name}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4 text-xs sm:text-sm text-gray-600">
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-slate-500 mr-2 flex-shrink-0" />
                          <span className="truncate">{job.location}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-job-navy mr-2 flex-shrink-0" />
                          <span className="truncate">{getTimeAgo(job.$createdAt)}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 sm:gap-2 mb-4">
                        <span className="px-2 sm:px-3 py-1 bg-job-light-gold text-job-dark-gold rounded-full text-xs font-medium">
                          {job.category}
                        </span>
                        <span className="px-2 sm:px-3 py-1 bg-slate-100 text-job-navy-dark rounded-full text-xs font-medium">
                          {job.contract_type}
                        </span>
                      </div>

                      <div className="flex items-center text-slate-500 group-hover:text-job-dark-gold transition-colors">
                        <span className="font-medium mr-2 text-xs sm:text-sm">Voir l'offre</span>
                        <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12 bg-white rounded-2xl shadow-lg">
                <Briefcase className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Aucune offre disponible</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-6">Soyez le premier à publier une offre d'emploi !</p>
                <Link to="/jobs/create">
                  <Button className="bg-gradient-to-r from-job-gold to-job-dark-gold text-white text-sm sm:text-base">
                    Publier une offre
                  </Button>
                </Link>
              </div>
            )}
            
            <div className="text-center">
              <Link to="/jobs">
                <button className="bg-gradient-to-r from-job-gold to-job-dark-gold text-white px-6 sm:px-8 py-3 rounded-lg font-semibold hover:from-job-dark-gold hover:to-job-gold transition-all flex items-center mx-auto text-sm sm:text-base">
                  Voir toutes les offres d'emploi
                  <ArrowRight className="ml-2" size={16} />
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Services Premium Carousel Section - Responsive */}
        {premiumServicesWithCreators.length > 0 && (
          <section className="py-8 sm:py-12 lg:py-16 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
                  Services <span className="text-job-navy">Premium</span>
                </h2>
                <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                  Découvrez les services proposés par nos prestataires premium
                </p>
              </div>
              
              <div className="relative overflow-hidden">
                <div 
                  className="relative"
                  onMouseEnter={() => setIsServiceCarouselPaused(true)}
                  onMouseLeave={() => setIsServiceCarouselPaused(false)}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 transition-all duration-1000 ease-in-out">
                    {getVisiblePremiumServices().map((service, index) => (
                      <div
                        key={service.uniqueKey}
                        className="transform transition-all duration-700 ease-in-out"
                        onClick={() => handleServiceClick(service)}
                      >
                        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-slate-100 hover:border-job-navy-light group hover:-translate-y-2 h-full cursor-pointer">
                          <div className="text-center mb-4">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 overflow-hidden border-4 border-job-navy-light">
                              {service.creator?.avatar_url ? (
                                <img 
                                  src={service.creator.avatar_url} 
                                  alt={service.creator.full_name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-r from-job-navy to-slate-500 flex items-center justify-center">
                                  <Package className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <span className="bg-gradient-to-r from-job-gold to-job-gold text-white px-2 sm:px-3 py-1 rounded-full text-xs font-bold flex items-center">
                                <Crown className="h-3 w-3 mr-1" />
                                PREMIUM
                              </span>
                            </div>
                          </div>
                          
                          <h3 className="font-bold text-sm sm:text-lg text-job-navy mb-2 text-center group-hover:text-slate-500 transition-colors line-clamp-1">
                            {service.title}
                          </h3>
                          <p className="text-gray-600 mb-3 text-center text-xs sm:text-sm">{service.creator?.full_name}</p>
                          
                          {service.price_range && (
                            <div className="text-center text-job-navy font-semibold mb-4 flex items-center justify-center text-sm sm:text-base">
                              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                              {service.price_range}
                            </div>
                          )}
                          
                          <button className="w-full bg-gradient-to-r from-job-navy to-slate-500 text-white py-2 rounded-lg font-medium hover:from-job-navy-dark hover:to-job-navy-dark transition-all text-sm sm:text-base">
                            Voir le service
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Featured Services Section - Responsive */}
        <section className="py-8 sm:py-12 lg:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
                Offres de <span className="text-job-navy">Services</span>
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                Trouvez les meilleurs prestataires pour vos projets
              </p>
            </div>
            
            {servicesLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 sm:p-6 shadow-lg animate-pulse border border-gray-200">
                    <div className="text-center mb-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-full mx-auto mb-3"></div>
                      <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 sm:h-3 bg-gray-200 rounded"></div>
                      <div className="h-2 sm:h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentServices.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
                {recentServices.slice(0, 6).map((service) => (
                  <div 
                    key={service.$id} 
                    onClick={() => handleServiceClick(service)}
                    className="bg-white rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-job-navy-light group hover:-translate-y-1 cursor-pointer"
                  >
                    <div className="text-center mb-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-slate-100 to-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Package className="h-6 w-6 sm:h-8 sm:w-8 text-job-navy" />
                      </div>
                      <span className="bg-slate-100 text-job-navy text-xs px-2 sm:px-3 py-1 rounded-full font-medium">
                        {service.category}
                      </span>
                    </div>
                    
                    <h3 className="font-bold text-sm sm:text-lg text-gray-800 mb-2 text-center group-hover:text-job-navy transition-colors line-clamp-1">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 mb-3 text-center text-xs sm:text-sm line-clamp-2">
                      {service.description?.substring(0, 100)}...
                    </p>
                    
                    {service.price_range && (
                      <div className="text-center text-job-navy font-semibold mb-4 flex items-center justify-center text-sm sm:text-base">
                        <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        {service.price_range}
                      </div>
                    )}

                    {service.delivery_time && (
                      <div className="text-center text-job-navy font-medium mb-4 flex items-center justify-center text-xs sm:text-sm">
                        <Timer className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        {service.delivery_time}
                      </div>
                    )}
                    
                    <button className="w-full bg-gradient-to-r from-job-navy to-slate-500 text-white py-2 rounded-lg font-medium hover:from-job-navy-dark hover:to-job-navy-dark transition-all text-sm sm:text-base">
                      Voir le service
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12 bg-slate-50 rounded-2xl border border-job-navy-light">
                <Package className="h-12 w-12 sm:h-16 sm:w-16 text-job-navy-light mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Aucun service disponible</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-6">Proposez vos services et développez votre activité !</p>
                <Link to="/services/create">
                  <Button className="bg-gradient-to-r from-job-navy to-slate-500 text-white text-sm sm:text-base">
                    Proposer un service
                  </Button>
                </Link>
              </div>
            )}
            
            <div className="text-center">
              <Link to="/services">
                <button className="bg-white text-job-navy border-2 border-job-navy px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-job-navy hover:text-white transition-all flex items-center mx-auto text-sm sm:text-base">
                  Explorer tous les services
                  <ArrowRight className="ml-2" size={16} />
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Why Choose Job2ada - Responsive */}
        <section className="py-8 sm:py-12 lg:py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
                Pourquoi choisir <span className="text-slate-500">Job2Mada</span> ?
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              <div className="text-center group">
                <div className="bg-gradient-to-r from-job-gold to-slate-500 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp className="text-white" size={20} />
                </div>
                <h3 className="font-bold text-base sm:text-lg mb-2">Croissance Rapide</h3>
                <p className="text-gray-600 text-sm sm:text-base">Plus de {recentJobs.length} nouvelles offres disponibles</p>
              </div>
              
              <div className="text-center group">
                <div className="bg-gradient-to-r from-job-gold to-slate-500 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="text-white" size={20} />
                </div>
                <h3 className="font-bold text-base sm:text-lg mb-2">Sécurisé & Fiable</h3>
                <p className="text-gray-600 text-sm sm:text-base">Toutes les offres sont vérifiées par notre équipe</p>
              </div>
              
              <div className="text-center group">
                <div className="bg-gradient-to-r from-job-gold to-slate-500 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="text-white" size={20} />
                </div>
                <h3 className="font-bold text-base sm:text-lg mb-2">Matching Rapide</h3>
                <p className="text-gray-600 text-sm sm:text-base">Notre algorithme trouve les meilleurs matchs</p>
              </div>
              
              <div className="text-center group">
                <div className="bg-gradient-to-r from-job-gold to-slate-500 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Globe className="text-white" size={20} />
                </div>
                <h3 className="font-bold text-base sm:text-lg mb-2">Couverture Nationale</h3>
                <p className="text-gray-600 text-sm sm:text-base">Présent dans toutes les régions de Madagascar</p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action - Responsive */}
        <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-r from-job-navy via-job-navy-light to-job-navy-dark">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <div className="text-white mb-6 sm:mb-8">
              <Award size={36} className="mx-auto mb-4 sm:hidden" />
              <Award size={48} className="mx-auto mb-4 hidden sm:block" />
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">Prêt à transformer votre carrière ?</h2>
              <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 text-job-light-gold">
                Rejoignez des milliers de professionnels qui ont trouvé leur emploi idéal sur Job2Mada
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <button className="w-full sm:w-auto bg-white text-slate-500 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:bg-slate-50 transition-all transform hover:scale-105 text-sm sm:text-base">
                  Créer mon profil candidat
                </button>
              </Link>
              <Link to="/jobs/create">
                <button className="w-full sm:w-auto border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:bg-white hover:text-slate-500 transition-all text-sm sm:text-base">
                  Publier une offre d'emploi
                </button>
              </Link>
              </div>
          </div>
        </section>

        {/* Footer */}
        <Footer />

        {/* Modal Service - Responsive */}
        {showServiceModal && selectedService && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-fade-in">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden animate-slide-up">
              
              {/* Header du modal */}
              <div className="bg-gradient-to-br from-job-navy via-job-navy-light to-job-navy-dark p-4 sm:p-6 text-white relative overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 sm:border-4 border-white/30 shadow-lg bg-white/20 flex items-center justify-center">
                        <Package className="h-5 w-5 sm:h-8 sm:w-8 text-white" />
                      </div>
                      
                      <div>
                        <h2 className="text-lg sm:text-2xl font-bold line-clamp-1">{selectedService.title}</h2>
                        <p className="text-white/90 font-medium text-sm sm:text-base">Service proposé</p>
                        <div className="flex items-center mt-1 text-xs sm:text-sm text-white/80">
                          <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Madagascar
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={closeServiceModal}
                      className="p-2 hover:bg-white/20 rounded-full transition-colors flex-shrink-0"
                    >
                      <X className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className="bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-bold">
                      {selectedService.category}
                    </span>
                    {selectedService.price_range && (
                      <span className="bg-green-400/30 backdrop-blur-sm px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-bold flex items-center">
                        <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        {selectedService.price_range}
                      </span>
                    )}
                    {selectedService.delivery_time && (
                      <span className="bg-job-navy-light/30 backdrop-blur-sm px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-bold flex items-center">
                        <Timer className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        {selectedService.delivery_time}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Contenu scrollable */}
              <div className="overflow-y-auto flex-1">
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Description principale */}
                    <div className="lg:col-span-2 space-y-6">
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 flex items-center">
                          <Package className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-job-navy" />
                          Description du service
                        </h3>
                        <div className="bg-gray-50 rounded-2xl p-3 sm:p-4">
                          <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                            {selectedService.description || "Aucune description disponible."}
                          </p>
                        </div>
                      </div>

                      {/* Détails du service */}
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 flex items-center">
                          <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-job-navy" />
                          Détails du service
                        </h3>
                        <div className="bg-slate-50 rounded-2xl p-3 sm:p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 font-medium text-sm sm:text-base">Publié le</span>
                            <span className="font-bold text-job-navy text-sm sm:text-base">
                              {new Date(selectedService.$createdAt).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 font-medium text-sm sm:text-base">Catégorie</span>
                            <span className="font-bold text-job-navy text-sm sm:text-base">{selectedService.category}</span>
                          </div>
                          {selectedService.delivery_time && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600 font-medium text-sm sm:text-base">Délai de livraison</span>
                              <span className="font-bold text-green-600 flex items-center text-sm sm:text-base">
                                <Timer className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                {selectedService.delivery_time}
                              </span>
                            </div>
                          )}
                          {selectedService.price_range && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600 font-medium text-sm sm:text-base">Fourchette de prix</span>
                              <span className="font-bold text-green-600 flex items-center text-sm sm:text-base">
                                <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                {selectedService.price_range}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Sidebar actions */}
                    <div className="space-y-6">
                      {/* Actions principales */}
                      <div className="bg-gradient-to-br from-job-navy to-slate-500 rounded-2xl p-4 sm:p-6 text-white text-center">
                        <Package className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4" />
                        <h4 className="font-bold text-base sm:text-lg mb-4">Intéressé par ce service ?</h4>
                        
                        <Link to="/services" className="block">
                          <button className="w-full bg-white text-job-navy font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-xl hover:bg-gray-100 transition-all mb-3 text-sm sm:text-base">
                            Voir tous les services
                          </button>
                        </Link>
                        
                        <Link to="/services/create" className="block">
                          <button className="w-full bg-job-navy-dark text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-xl hover:bg-job-navy transition-all text-sm sm:text-base">
                            Proposer mon service
                          </button>
                        </Link>
                      </div>

                      {/* Informations supplémentaires */}
                      <div className="bg-slate-50 rounded-2xl p-4 sm:p-6 border border-job-navy-light">
                        <h4 className="font-bold text-job-navy mb-4 flex items-center text-sm sm:text-base">
                          <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                          À savoir
                        </h4>
                        <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
                          <li className="flex items-start">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-job-navy rounded-full mt-2 mr-2 sm:mr-3 flex-shrink-0"></div>
                            <span>Tous nos prestataires sont vérifiés</span>
                          </li>
                          <li className="flex items-start">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-job-navy rounded-full mt-2 mr-2 sm:mr-3 flex-shrink-0"></div>
                            <span>Communication directe possible</span>
                          </li>
                          <li className="flex items-start">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-job-navy rounded-full mt-2 mr-2 sm:mr-3 flex-shrink-0"></div>
                            <span>Support client disponible</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Styles CSS pour les animations et responsive */}
        <style>{`
          @keyframes fadeIn {
            0% { opacity: 0; }
            100% { opacity: 1; }
          }

          @keyframes slideUp {
            0% {
              opacity: 0;
              transform: translateY(50px) scale(0.95);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes slideIn {
            0% {
              opacity: 0;
              transform: translateX(30px) scale(0.95);
            }
            100% {
              opacity: 1;
              transform: translateX(0) scale(1);
            }
          }

          .animate-fade-in {
            animation: fadeIn 0.3s ease-out;
          }

          .animate-slide-up {
            animation: slideUp 0.4s ease-out;
          }

          .animate-slide-in {
            animation: slideIn 0.6s ease-out forwards;
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

          @keyframes fadeInUp {
            0% {
              opacity: 0;
              transform: translateY(30px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-fade-in-up {
            animation: fadeInUp 0.8s ease-out forwards;
          }
                
          .animate-pulse {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }

          @keyframes slideInLeft {
            0% {
              opacity: 0;
              transform: translateX(-100px) scale(0.8);
            }
            100% {
              opacity: 0.8;
              transform: translateX(0) scale(0.95);
            }
          }

          @keyframes slideInRight {
            0% {
              opacity: 0;
              transform: translateX(100px) scale(0.8);
            }
            100% {
              opacity: 0.8;
              transform: translateX(0) scale(0.95);
            }
          }

          @keyframes scaleUp {
            0% {
              opacity: 0.8;
              transform: scale(0.9);
            }
            100% {
              opacity: 1;
              transform: scale(1.05);
            }
          }

          .animate-slide-in-left {
            animation: slideInLeft 1s ease-out forwards;
          }

          .animate-slide-in-right {
            animation: slideInRight 1s ease-out forwards;
          }

          .animate-scale-up {
            animation: scaleUp 1s ease-out forwards;
          }

          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: .5;
            }
          }

          /* Gradient text pour WebKit */
          .bg-clip-text {
            -webkit-background-clip: text;
            background-clip: text;
          }
        `}</style>
      </div>
    </>
  );
};

export default JobMadaHomepage;