import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, User, MessageSquare, Building, Star, MapPin, ChevronLeft, ChevronRight, Package, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import ProfileMenu from './ProfileMenu';
import { AvatarWithBadge } from '@/components/ui/VerifiedBadge';
import { useUnreadCount } from '@/hooks/useUnreadCount';

// ============ MINI CARROUSEL JOBS ============
const MiniJobsCarousel = ({ jobs, currentIndex, goToPrev, goToNext }) => {
  if (!jobs || jobs.length === 0) return null;

  const getVisibleJobs = () => {
    const visibleJobs = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % jobs.length;
      visibleJobs.push(jobs[index]);
    }
    return visibleJobs;
  };

  return (
    <div className="border-t border-gray-200/50 bg-gradient-to-r from-job-gold via-job-orange to-job-dark-gold">
      <div className="max-w-[1500px] mx-auto px-2 md:px-4 py-2 md:py-3">
        <div className="flex items-center justify-between gap-2">
          {/* Titre - CACHÉ SUR MOBILE */}
          <div className="hidden md:flex items-center space-x-2 flex-shrink-0">
            <Star className="h-5 w-5 text-white" />
            <h3 className="text-base font-bold text-white whitespace-nowrap">Offres à la Une</h3>
          </div>

          {/* Carrousel */}
          <div className="flex-1 relative overflow-hidden">
            <div className="flex items-center space-x-1 md:space-x-3">
              {/* Flèche gauche */}
              {jobs.length > 1 && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    goToPrev();
                  }}
                  className="flex-shrink-0 bg-white/20 hover:bg-white/40 text-white p-1.5 md:p-2 rounded-full transition-all shadow-lg"
                >
                  <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
                </button>
              )}

              {/* Cartes */}
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center justify-center">
                  {/* Desktop : 3 cartes */}
                  <div className="hidden md:flex space-x-3 w-full justify-center">
                    {getVisibleJobs().slice(0, 3).map((job, index) => (
                      <Link 
                        key={`${job.$id}-mini-${index}`}
                        to={`/jobs/${job.$id}`}
                        className="flex items-center space-x-3 bg-white hover:bg-gray-50 rounded-xl p-3 shadow-lg hover:shadow-xl transition-all flex-1 max-w-[320px] group"
                      >
                        {/* Logo */}
                        <div className="h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0 border-2 border-gray-100 bg-white overflow-hidden group-hover:border-job-gold transition-colors">
                          {job.employer_logo ? (
                            <img 
                              src={job.employer_logo} 
                              alt={job.company_name}
                              className="w-full h-full object-contain p-1.5"
                            />
                          ) : (
                            <Building className="h-6 w-6 text-job-gold" />
                          )}
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-job-brown truncate group-hover:text-job-gold transition-colors">
                            {job.title}
                          </p>
                          <p className="text-xs text-gray-600 truncate font-medium">
                            {job.company_name}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center mt-0.5">
                            <MapPin className="h-3 w-3 mr-1" />
                            {job.location}
                          </p>
                        </div>

                        {/* Badge */}
                        <div className="flex-shrink-0">
                          {job.is_featured && (
                            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-1.5 rounded-full">
                              <Star className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Mobile : 1 carte COMPLÈTE */}
                  <div className="md:hidden w-full px-1">
                    <Link 
                      to={`/jobs/${getVisibleJobs()[0].$id}`}
                      className="flex items-center space-x-2 bg-white hover:bg-gray-50 rounded-xl p-2.5 shadow-lg w-full"
                    >
                      {/* Logo mobile */}
                      <div className="h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0 border-2 border-gray-100 bg-white overflow-hidden">
                        {getVisibleJobs()[0].employer_logo ? (
                          <img 
                            src={getVisibleJobs()[0].employer_logo} 
                            alt={getVisibleJobs()[0].company_name}
                            className="w-full h-full object-contain p-1.5"
                          />
                        ) : (
                          <Building className="h-6 w-6 text-job-gold" />
                        )}
                      </div>
                      
                      {/* Info mobile */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-job-brown truncate leading-tight">
                          {getVisibleJobs()[0].title}
                        </p>
                        <p className="text-xs text-gray-600 truncate font-medium mt-0.5">
                          {getVisibleJobs()[0].company_name}
                        </p>
                      </div>

                      {/* Badge mobile */}
                      {getVisibleJobs()[0].is_featured && (
                        <div className="flex-shrink-0">
                          <Star className="h-4 w-4 text-yellow-500" />
                        </div>
                      )}
                    </Link>
                  </div>
                </div>
              </div>

              {/* Flèche droite */}
              {jobs.length > 1 && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    goToNext();
                  }}
                  className="flex-shrink-0 bg-white/20 hover:bg-white/40 text-white p-1.5 md:p-2 rounded-full transition-all shadow-lg"
                >
                  <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Compteur - CACHÉ SUR MOBILE */}
          <div className="hidden md:flex items-center space-x-1 bg-white/20 px-3 py-1.5 rounded-full text-white text-sm font-bold flex-shrink-0">
            <span>{currentIndex + 1}</span>
            <span>/</span>
            <span>{jobs.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ MINI CARROUSEL SERVICES ============
const MiniServicesCarousel = ({ services, currentIndex, goToPrev, goToNext, onServiceClick }) => {
  if (!services || services.length === 0) return null;

  const getVisibleServices = () => {
    const visibleServices = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % services.length;
      visibleServices.push(services[index]);
    }
    return visibleServices;
  };

  return (
    <div className="border-t border-gray-200/50 bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600">
      <div className="max-w-[1500px] mx-auto px-2 md:px-4 py-2 md:py-3">
        <div className="flex items-center justify-between gap-2">
          {/* Titre - CACHÉ SUR MOBILE */}
          <div className="hidden md:flex items-center space-x-2 flex-shrink-0">
            <Crown className="h-5 w-5 text-white" />
            <h3 className="text-base font-bold text-white whitespace-nowrap">Services Premium</h3>
          </div>

          {/* Carrousel */}
          <div className="flex-1 relative overflow-hidden">
            <div className="flex items-center space-x-1 md:space-x-3">
              {/* Flèche gauche */}
              {services.length > 1 && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    goToPrev();
                  }}
                  className="flex-shrink-0 bg-white/20 hover:bg-white/40 text-white p-1.5 md:p-2 rounded-full transition-all shadow-lg"
                >
                  <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
                </button>
              )}

              {/* Cartes */}
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center justify-center">
                  {/* Desktop : 3 cartes */}
                  <div className="hidden md:flex space-x-3 w-full justify-center">
                    {getVisibleServices().slice(0, 3).map((service, index) => (
                      <div
                        key={`mini-service-${service.id}-${index}`}
                        onClick={() => onServiceClick(service)}
                        className="flex items-center space-x-3 bg-white hover:bg-gray-50 rounded-xl p-3 shadow-lg hover:shadow-xl transition-all flex-1 max-w-[320px] group cursor-pointer"
                      >
                        {/* Avatar */}
                        <div className="h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-gray-100 bg-white overflow-hidden group-hover:border-purple-600 transition-colors">
                          {service.creator?.avatar_url ? (
                            <img 
                              src={service.creator.avatar_url} 
                              alt={service.creator.full_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="h-6 w-6 text-purple-600" />
                          )}
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-purple-600 truncate group-hover:text-pink-500 transition-colors">
                            {service.title}
                          </p>
                          <p className="text-xs text-gray-600 truncate font-medium">
                            {service.creator.full_name}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center mt-0.5">
                            <MapPin className="h-3 w-3 mr-1" />
                            {service.creator.location}
                          </p>
                        </div>

                        {/* Badge */}
                        <div className="flex-shrink-0">
                          {service.creator?.is_premium && (
                            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-1.5 rounded-full">
                              <Crown className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Mobile : 1 carte COMPLÈTE */}
                  <div className="md:hidden w-full px-1">
                    <div 
                      onClick={() => onServiceClick(getVisibleServices()[0])}
                      className="flex items-center space-x-2 bg-white rounded-xl p-2.5 shadow-lg w-full cursor-pointer"
                    >
                      {/* Avatar mobile */}
                      <div className="h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-gray-100 bg-white overflow-hidden">
                        {getVisibleServices()[0]?.creator?.avatar_url ? (
                          <img 
                            src={getVisibleServices()[0].creator.avatar_url} 
                            alt={getVisibleServices()[0].creator.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="h-6 w-6 text-purple-600" />
                        )}
                      </div>
                      
                      {/* Info mobile */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-purple-600 truncate leading-tight">
                          {getVisibleServices()[0]?.title}
                        </p>
                        <p className="text-xs text-gray-600 truncate font-medium mt-0.5">
                          {getVisibleServices()[0]?.creator.full_name}
                        </p>
                      </div>

                      {/* Badge mobile */}
                      {getVisibleServices()[0]?.creator?.is_premium && (
                        <div className="flex-shrink-0">
                          <Crown className="h-4 w-4 text-yellow-500" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Flèche droite */}
              {services.length > 1 && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    goToNext();
                  }}
                  className="flex-shrink-0 bg-white/20 hover:bg-white/40 text-white p-1.5 md:p-2 rounded-full transition-all shadow-lg"
                >
                  <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Compteur - CACHÉ SUR MOBILE */}
          <div className="hidden md:flex items-center space-x-1 bg-white/20 px-3 py-1.5 rounded-full text-white text-sm font-bold flex-shrink-0">
            <span>{currentIndex + 1}</span>
            <span>/</span>
            <span>{services.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ NAVBAR PRINCIPAL ============
export const Navbar = ({ 
  featuredJobs = [], 
  featuredServices = [],
  showMiniCarousel = false,
  carouselType = 'jobs', // 'jobs' ou 'services'
  onServiceClick = () => {}
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { user, profile, loading, isAuthenticated, signOut, isCandidate, isEmployer, isPremium } = useAuth();
  const { unreadCount } = useUnreadCount();

  const hasMessagingAccess = (isCandidate && isPremium) || isEmployer;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Auto-rotation du carrousel
  useEffect(() => {
    const items = carouselType === 'services' ? featuredServices : featuredJobs;
    if (items.length > 1 && showMiniCarousel) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [featuredJobs.length, featuredServices.length, showMiniCarousel, carouselType]);

  const goToNext = () => {
    const items = carouselType === 'services' ? featuredServices : featuredJobs;
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const goToPrev = () => {
    const items = carouselType === 'services' ? featuredServices : featuredJobs;
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleMobileLogout = async () => {
    await signOut();
    setIsOpen(false);
  };

  return (
    <header className={`w-full fixed top-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-transparent'
    }`}>
      {/* Navbar principal */}
      <nav className={`container-custom flex items-center justify-between ${scrolled ? 'py-3' : 'py-5'}`}>
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="relative">
            <img 
              src="/logo.png" 
              alt="Job-Mada Logo" 
              className="h-12 w-auto object-contain transform transition-transform group-hover:scale-105"
              style={{ maxWidth: '300px', height: '100px' }}
            />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
          <Link to="/" className="nav-link whitespace-nowrap">Accueil</Link>
          <Link to="/jobs" className="nav-link whitespace-nowrap">Offres d'emploi</Link>
          <Link to="/services" className="nav-link whitespace-nowrap">Offre de Services</Link>
          <Link to="/JobSeekers" className="nav-link whitespace-nowrap">Profils</Link>

          {/* Icône Messages Premium */}
          {hasMessagingAccess && (
            <Link 
              to="/messages" 
              className="relative group"
              title="Messagerie Premium"
            >
              <div className="relative transform transition-all duration-300 hover:scale-110 hover:-translate-y-1">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center border-2 border-white/20 hover:border-white/40 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-2xl"></div>
                  <svg width="20" height="16" viewBox="0 0 24 18" fill="none" className="relative z-10 drop-shadow-sm">
                    <path d="M2 4C2 2.89543 2.89543 2 4 2H20C21.1046 2 22 2.89543 22 4V14C22 15.1046 21.1046 16 20 16H4C2.89543 16 2 15.1046 2 14V4Z" fill="white" stroke="white" strokeWidth="1"/>
                    <path d="M2 4L12 10L22 4" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 4L11 9.5C11.6 9.8 12.4 9.8 13 9.5L22 4" stroke="#1E40AF" strokeWidth="1" strokeLinecap="round"/>
                  </svg>
                </div>
                {unreadCount > 0 && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-red-500 via-pink-500 to-red-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-pulse">
                    <span className="text-white text-xs font-bold leading-none">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                    <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-30"></div>
                  </div>
                )}
                <div className="absolute inset-0 rounded-2xl bg-blue-400/20 scale-0 group-hover:scale-110 transition-transform duration-300"></div>
              </div>
            </Link>
          )}
        </div>
        
        {/* Version tablette */}
        <div className="hidden md:flex lg:hidden items-center space-x-4">
          <Link to="/jobs" className="nav-link">Emplois</Link>
          <Link to="/services" className="nav-link">Services</Link>
          
          {hasMessagingAccess && (
            <Link to="/messages" className="relative group" title="Messages">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center border border-white/20">
                <svg width="18" height="14" viewBox="0 0 24 18" fill="none">
                  <path d="M2 4C2 2.89543 2.89543 2 4 2H20C21.1046 2 22 2.89543 22 4V14C22 15.1046 21.1046 16 20 16H4C2.89543 16 2 15.1046 2 14V4Z" fill="white" />
                  <path d="M2 4L12 10L22 4" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold min-w-[18px] text-center leading-none shadow-md">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
            </Link>
          )}
        </div>

        {/* Auth Section */}
        <div className="hidden md:flex items-center space-x-4">
          {loading ? (
            <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
          ) : isAuthenticated && user ? (
            <ProfileMenu user={user} profile={profile} />
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" className="btn-outline flex items-center space-x-2 bg-white/60 backdrop-blur-sm">
                  <User className="h-4 w-4" />
                  <span>Connexion</span>
                </Button>
              </Link>
              <Link to="/register">
                <Button className="btn-primary flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Inscription</span>
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={toggleMenu} className="text-job-dark hover:text-job-purple focus:outline-none">
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* ============ MINI CARROUSEL (apparaît au scroll) ============ */}
      {showMiniCarousel && (
        <>
          {carouselType === 'jobs' ? (
            <MiniJobsCarousel 
              jobs={featuredJobs} 
              currentIndex={currentIndex}
              goToPrev={goToPrev}
              goToNext={goToNext}
            />
          ) : (
            <MiniServicesCarousel 
              services={featuredServices} 
              currentIndex={currentIndex}
              goToPrev={goToPrev}
              goToNext={goToNext}
              onServiceClick={onServiceClick}
            />
          )}
        </>
      )}

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 animate-slide-in shadow-md">
          <div className="container-custom py-4 space-y-3">
            <Link to="/" className="block py-2 nav-link" onClick={() => setIsOpen(false)}>Accueil</Link>
            <Link to="/jobs" className="block py-2 nav-link" onClick={() => setIsOpen(false)}>Offres d'emploi</Link>
            <Link to="/services" className="block py-2 nav-link" onClick={() => setIsOpen(false)}>Offre de services</Link>
            <Link to="/JobSeekers" className="block py-2 nav-link" onClick={() => setIsOpen(false)}>Tous les Profils</Link>
            
            {hasMessagingAccess && (
              <Link to="/messages" className="flex items-center justify-between py-2 nav-link" onClick={() => setIsOpen(false)}>
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Messages</span>
                </div>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            )}
            
            {/* Mobile Auth */}
            <div className="pt-4 border-t border-gray-200">
              {loading ? (
                <div className="space-y-3">
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ) : isAuthenticated && user ? (
                <div className="space-y-3">
                  {/* Mobile Profile Info */}
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile?.full_name || user?.name || 'Avatar'} className="h-10 w-10 rounded-full object-cover"/>
                    ) : (
                      <div className="h-10 w-10 bg-gradient-elegant rounded-full flex items-center justify-center text-white font-semibold">
                        {(profile?.full_name || user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {profile?.full_name || user?.name || user?.email?.split('@')[0] || 'Utilisateur'}
                      </p>
                      <div className="flex items-center space-x-2 text-xs">
                        <span className="text-gray-600">
                          {profile?.user_type === 'employer' ? 'Employeur' : 'Candidat'}
                        </span>
                        {isPremium && (
                          <span className="bg-yellow-500 text-white px-2 py-0.5 rounded-full font-bold">Premium</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Link to="/profile" className="block py-2 nav-link" onClick={() => setIsOpen(false)}>Mon profil</Link>
                  
                  {profile?.user_type === 'employer' && (
                    <>
                      <Link to="/dashboard" className="block py-2 nav-link" onClick={() => setIsOpen(false)}>Tableau de bord</Link>
                      <Link to="/my-jobs" className="block py-2 nav-link" onClick={() => setIsOpen(false)}>Mes offres d'emploi</Link>
                    </>
                  )}
                  
                  {profile?.user_type === 'candidate' && (
                    <>
                      <Link to="/my-applications" className="block py-2 nav-link" onClick={() => setIsOpen(false)}>Mes candidatures</Link>
                      <Link to="/saved-jobs" className="block py-2 nav-link" onClick={() => setIsOpen(false)}>Offres sauvegardées</Link>
                    </>
                  )}
                  
                  <Link to="/transactions" className="block py-2 nav-link" onClick={() => setIsOpen(false)}>Mes transactions</Link>
                  <Link to="/settings" className="block py-2 nav-link" onClick={() => setIsOpen(false)}>Paramètres</Link>
                  
                  <button onClick={handleMobileLogout} className="w-full text-left py-2 text-red-600 font-medium">
                    Se déconnecter
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-3">
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full btn-outline flex items-center justify-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Connexion</span>
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsOpen(false)}>
                    <Button className="w-full btn-primary flex items-center justify-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Inscription</span>
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;