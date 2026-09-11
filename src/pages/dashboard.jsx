import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PremiumButton from '@/components/PremiumButton';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  Briefcase, 
  FileText,
  Calendar,
  Star,
  ArrowUp,
  ArrowDown,
  Download,
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Search,
  MoreVertical,
  Award,
  Crown,
  BadgeCheck,
  Shield,
  Target,
  Zap,
  Rocket,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  User,
  Building,
  Bookmark,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { databases, DATABASE_ID, COLLECTIONS, Query } from '@/lib/appwrite';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isEmployer, isPremium } = useAuth();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplications: 0,
    totalViews: 0,
    thisMonthViews: 0,
    thisMonthApplications: 0,
    responseRate: 0
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [topJobs, setTopJobs] = useState([]);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  // ✅ PAGINATION POUR CANDIDATURES
  const [applicationsPage, setApplicationsPage] = useState(1);
  const applicationsPerPage = 25;

  // ✅ PAGINATION POUR OFFRES
  const [jobsPage, setJobsPage] = useState(1);
  const jobsPerPage = 25;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!isDataLoaded) {
      loadDashboardData();
    }
  }, [user, navigate, isDataLoaded]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && ['overview', 'applications', 'jobs'].includes(tabParam)) {
      setSelectedTab(tabParam);
    }
  }, []);

  // ✅ FONCTION POUR RÉCUPÉRER TOUS LES DOCUMENTS (pagination automatique)
  const getAllDocuments = async (collectionId, queries = []) => {
    let allDocuments = [];
    let offset = 0;
    const limit = 100; // Appwrite max par requête
    let hasMore = true;

    while (hasMore) {
      const response = await databases.listDocuments(
        DATABASE_ID,
        collectionId,
        [
          ...queries,
          Query.limit(limit),
          Query.offset(offset)
        ]
      );

      allDocuments = [...allDocuments, ...response.documents];
      offset += limit;
      hasMore = response.documents.length === limit;
    }

    return allDocuments;
  };

  const loadDashboardData = async () => {
    if (!user?.$id) return;

    try {
      setLoading(true);

      // ✅ RÉCUPÉRER TOUS LES JOBS DE L'EMPLOYEUR
      const jobsData = await getAllDocuments(
        COLLECTIONS.JOBS,
        [Query.equal('employer_id', user.$id)]
      );

      // ✅ RÉCUPÉRER TOUTES LES CANDIDATURES
      const applicationsData = await getAllDocuments(COLLECTIONS.APPLICATIONS);

      // Filtrer les candidatures pour cet employeur
      const jobIds = jobsData.map(job => job.$id);
      const myApplications = applicationsData.filter(app => 
        jobIds.includes(app.job_id)
      );

      // Calculer les statistiques
      const activeJobs = jobsData.filter(job => job.is_active && !job.is_draft);
      const totalViews = activeJobs.reduce((sum, job) => sum + (job.views_count || 0), 0);
      
      const currentMonth = new Date();
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      
      const thisMonthJobs = activeJobs.filter(job => new Date(job.$createdAt) >= startOfMonth);
      const thisMonthViews = thisMonthJobs.reduce((sum, job) => sum + (job.views_count || 0), 0);
      const thisMonthApps = myApplications.filter(app => new Date(app.$createdAt) >= startOfMonth);

      const sortedJobs = [...activeJobs]
        .sort((a, b) => (b.views_count || 0) - (a.views_count || 0));

      setStats({
        activeJobs: activeJobs.length,
        totalApplications: myApplications.length,
        totalViews: totalViews,
        thisMonthViews: thisMonthViews,
        thisMonthApplications: thisMonthApps.length,
        responseRate: myApplications.length > 0 ? 
          Math.round((myApplications.filter(app => app.status !== 'pending').length / myApplications.length) * 100) : 0
      });

      // Trier les candidatures par date (plus récentes en premier)
      const sortedApplications = [...myApplications].sort((a, b) => 
        new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
      );

      setTopJobs(sortedJobs);
      setRecentApplications(sortedApplications);
      setIsDataLoaded(true);

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationAction = async (applicationId, action) => {
    try {
      const newStatus = action === 'accepted' ? 'approved' : 'rejected';
      
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.APPLICATIONS,
        applicationId,
        { 
          status: newStatus,
          updated_at: new Date().toISOString()
        }
      );

      loadDashboardData();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const getTimeAgo = (date) => {
    if (!date) return 'Date inconnue';
    
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - new Date(date).getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Aujourd\'hui';
    if (diffDays === 1) return 'Hier';
    if (diffDays < 30) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `Il y a ${diffMonths} mois`;
    
    const diffYears = Math.floor(diffMonths / 12);
    return `Il y a ${diffYears} an${diffYears > 1 ? 's' : ''}`;
  };

  const getStatusIcon = (status) => {
    const iconStyle = { width: '16px', height: '16px' };
    switch (status) {
      case 'approved':
      case 'accepted': 
        return <CheckCircle style={iconStyle} />;
      case 'rejected': 
        return <XCircle style={iconStyle} />;
      case 'reviewed': 
        return <Eye style={iconStyle} />;
      default: 
        return <AlertCircle style={iconStyle} />;
    }
  };

  // ✅ CALCUL PAGINATION CANDIDATURES
  const totalApplications = recentApplications.length;
  const totalApplicationsPages = Math.ceil(totalApplications / applicationsPerPage);
  const startApplicationsIndex = (applicationsPage - 1) * applicationsPerPage;
  const endApplicationsIndex = Math.min(startApplicationsIndex + applicationsPerPage, totalApplications);
  const currentApplications = recentApplications.slice(startApplicationsIndex, endApplicationsIndex);

  // ✅ CALCUL PAGINATION OFFRES
  const totalJobs = topJobs.length;
  const totalJobsPages = Math.ceil(totalJobs / jobsPerPage);
  const startJobsIndex = (jobsPage - 1) * jobsPerPage;
  const endJobsIndex = Math.min(startJobsIndex + jobsPerPage, totalJobs);
  const currentJobs = topJobs.slice(startJobsIndex, endJobsIndex);

  // ✅ FONCTIONS PAGINATION CANDIDATURES
  const goToApplicationsPage = (page) => {
    setApplicationsPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const previousApplicationsPage = () => {
    if (applicationsPage > 1) {
      goToApplicationsPage(applicationsPage - 1);
    }
  };

  const nextApplicationsPage = () => {
    if (applicationsPage < totalApplicationsPages) {
      goToApplicationsPage(applicationsPage + 1);
    }
  };

  // ✅ FONCTIONS PAGINATION OFFRES
  const goToJobsPage = (page) => {
    setJobsPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const previousJobsPage = () => {
    if (jobsPage > 1) {
      goToJobsPage(jobsPage - 1);
    }
  };

  const nextJobsPage = () => {
    if (jobsPage < totalJobsPages) {
      goToJobsPage(jobsPage + 1);
    }
  };

  // ✅ COMPOSANT PAGINATION RÉUTILISABLE
  const Pagination = ({ currentPage, totalPages, onPageChange, onPrevious, onNext, totalItems, startIndex, endIndex }) => {
    if (totalPages <= 1) return null;

    // Générer les numéros de page à afficher (max 5)
    const getPageNumbers = () => {
      const pages = [];
      const maxVisible = 5;
      
      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) pages.push(i);
          pages.push('...');
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(1);
          pages.push('...');
          for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
        } else {
          pages.push(1);
          pages.push('...');
          pages.push(currentPage - 1);
          pages.push(currentPage);
          pages.push(currentPage + 1);
          pages.push('...');
          pages.push(totalPages);
        }
      }
      
      return pages;
    };

    return (
      <div className="mt-8 space-y-4">
        {/* Info */}
        <div className="text-center text-sm text-gray-600">
          Affichage de <span className="font-bold text-job-gold">{startIndex + 1}</span> à{' '}
          <span className="font-bold text-job-gold">{endIndex}</span> sur{' '}
          <span className="font-bold text-job-gold">{totalItems}</span> résultats
        </div>

        {/* Boutons pagination */}
        <div className="flex items-center justify-center gap-2">
          {/* Bouton Précédent */}
          <button
            onClick={onPrevious}
            disabled={currentPage === 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-job-gold border-2 border-job-gold hover:bg-job-cream'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Précédent</span>
          </button>

          {/* Numéros de page */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, index) => (
              page === '...' ? (
                <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-400">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                    currentPage === page
                      ? 'bg-gradient-to-r from-job-gold to-job-orange text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-job-gold hover:text-job-gold'
                  }`}
                >
                  {page}
                </button>
              )
            ))}
          </div>

          {/* Bouton Suivant */}
          <button
            onClick={onNext}
            disabled={currentPage === totalPages}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-job-gold border-2 border-job-gold hover:bg-job-cream'
            }`}
          >
            <span className="hidden sm:inline">Suivant</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  const StatCard = ({ title, value, subtitle, icon, color, trend }) => (
    <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-lg border-2 border-gray-100 hover:border-job-gold hover:shadow-xl transition-all hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-4`} 
               style={{ backgroundColor: `${color}20` }}>
            {React.cloneElement(icon, { 
              className: 'w-5 h-5 md:w-6 md:h-6',
              style: { color: color }
            })}
          </div>
          <h3 className="text-xl md:text-3xl font-bold text-gray-900 mb-1">
            {value}
          </h3>
          <p className="text-gray-600 text-sm md:text-base font-medium">
            {title}
          </p>
          {subtitle && (
            <p className="text-gray-400 text-xs md:text-sm mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
            trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {trend > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
        <Navbar />
        <div className="pt-20 md:pt-32 flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 md:h-16 md:w-16 border-b-4 border-job-gold mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de votre tableau de bord...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute isPublic={false} requireAuth={true}>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
        <Navbar />
        
        {/* Header - Responsive */}
        <section className="pt-20 md:pt-32 pb-8 bg-gradient-to-r from-job-gold to-job-dark-gold text-white">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center">
              <h1 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4">
                Tableau de bord
              </h1>
              <p className="text-base md:text-lg opacity-90">
                Gérez vos offres et candidatures efficacement
              </p>
            </div>
          </div>
        </section>

        {/* Contenu principal - Responsive */}
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          
          {/* Statistiques principales - Grid responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <StatCard
              title="Offres actives"
              value={stats.activeJobs}
              subtitle="Offres publiées"
              icon={<Briefcase />}
              color="#D4AF37"
              trend={stats.activeJobs > 0 ? 12 : 0}
            />
            <StatCard
              title="Candidatures"
              value={stats.totalApplications}
              subtitle={`${stats.thisMonthApplications} ce mois`}
              icon={<Users />}
              color="#10B981"
              trend={stats.thisMonthApplications > 0 ? 25 : 0}
            />
            <StatCard
              title="Vues totales"
              value={stats.totalViews}
              subtitle={`${stats.thisMonthViews} ce mois`}
              icon={<Eye />}
              color="#3B82F6"
              trend={stats.thisMonthViews > 0 ? 18 : 0}
            />
            <StatCard
              title="Taux de réponse"
              value={`${stats.responseRate}%`}
              subtitle="Candidatures traitées"
              icon={<TrendingUp />}
              color="#8B5CF6"
              trend={stats.responseRate > 50 ? 8 : -5}
            />
          </div>

          {/* Navigation par onglets - Responsive */}
          <div className="flex flex-wrap gap-2 mb-6 md:mb-8 border-b-2 border-gray-100 pb-4">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: <BarChart3 /> },
              { id: 'applications', label: 'Candidatures', icon: <Users /> },
              { id: 'jobs', label: 'Mes offres', icon: <Briefcase /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center gap-2 px-3 md:px-5 py-2 md:py-3 rounded-xl border-none font-semibold text-sm md:text-base transition-all ${
                  selectedTab === tab.id 
                    ? 'bg-job-gold text-white' 
                    : 'bg-transparent text-gray-600 hover:bg-gray-100'
                }`}
              >
                {React.cloneElement(tab.icon, { className: 'w-4 h-4' })}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Contenu des onglets - Responsive */}
          {selectedTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Top offres - Responsive */}
              <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-xl border-2 border-gray-100">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
                  <Star className="w-5 h-5 md:w-6 md:h-6 text-job-gold" />
                  Top offres par vues
                </h3>
                
                <div className="space-y-3 md:space-y-4">
                  {topJobs.slice(0, 5).map((job, index) => (
                    <div key={job.$id || job.id || `job-${index}`} className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 md:w-8 md:h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs md:text-sm ${
                          index === 0 ? 'bg-job-gold' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm md:text-base">
                            {job.title}
                          </h4>
                          <p className="text-gray-500 text-xs md:text-sm">
                            Publié {getTimeAgo(job.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-job-gold text-sm md:text-base">
                          {job.views_count || 0}
                        </span>
                        <p className="text-gray-500 text-xs">vues</p>
                      </div>
                    </div>
                  ))}
                  
                  {topJobs.length === 0 && (
                    <div className="text-center py-8 md:py-12 text-gray-400">
                      <Briefcase className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-sm md:text-base">Aucune offre active pour le moment</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Widget Premium - Reste inchangé */}
              <div className="space-y-6">
                {isPremium ? (
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl md:rounded-3xl p-4 md:p-6 text-white shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold flex items-center text-sm md:text-base">
                        <BadgeCheck className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                        Premium Actif
                      </h3>
                      <Shield className="w-4 h-4 md:w-5 md:h-5 text-white/50" />
                    </div>
                    
                    <p className="text-white/90 text-xs md:text-sm mb-4">
                      Votre abonnement premium vous donne accès à toutes les fonctionnalités !
                    </p>
                    
                    <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                      <div className="flex items-center text-xs md:text-sm">
                        <CheckCircle className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                        <span>Contact services illimité</span>
                      </div>
                      <div className="flex items-center text-xs md:text-sm">
                        <Star className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                        <span>Offres mises en avant</span>
                      </div>
                      <div className="flex items-center text-xs md:text-sm">
                        <Target className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                        <span>Statistiques avancées</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => navigate('/dashboard?tab=premium')}
                      className="w-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 font-bold py-2 md:py-3 rounded-xl transition-all border border-white/30 text-sm md:text-base"
                    >
                      Gérer mon abonnement
                    </button>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-job-gold to-job-orange rounded-2xl md:rounded-3xl p-4 md:p-6 text-white shadow-xl">
                    <h3 className="text-lg md:text-2xl font-bold mb-2 md:mb-3">
                      Boostez vos Offres
                    </h3>
                    <p className="text-white/90 mb-3 md:mb-4 text-xs md:text-sm">
                      Mettez vos offres en avant et trouvez les meilleurs talents !
                    </p>
                    <ul className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                      <li className="flex items-center text-xs md:text-sm">
                        <div className="w-4 h-4 md:w-6 md:h-6 bg-white/20 rounded-full flex items-center justify-center mr-2 md:mr-3">
                          <Star className="w-2 h-2 md:w-3 md:h-3" />
                        </div>
                        <span>Offres à la une</span>
                      </li>
                      <li className="flex items-center text-xs md:text-sm">
                        <div className="w-4 h-4 md:w-6 md:h-6 bg-white/20 rounded-full flex items-center justify-center mr-2 md:mr-3">
                          <Target className="w-2 h-2 md:w-3 md:h-3" />
                        </div>
                        <span>Ciblage candidats</span>
                      </li>
                      <li className="flex items-center text-xs md:text-sm">
                        <div className="w-4 h-4 md:w-6 md:h-6 bg-white/20 rounded-full flex items-center justify-center mr-2 md:mr-3">
                          <TrendingUp className="w-2 h-2 md:w-3 md:h-3" />
                        </div>
                        <span>5x plus de visibilité</span>
                      </li>
                    </ul>
                    <PremiumButton 
                      variant="default"
                      className="w-full text-sm md:text-base"
                    >
                      Passer au Premium
                    </PremiumButton>
                  </div>
                )}

                {/* Widget Premium supplémentaire */}
                {isPremium ? (
                  <div className="bg-gradient-to-br from-job-purple to-job-pink rounded-2xl md:rounded-3xl p-4 md:p-6 text-white shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <Crown className="w-8 h-8 md:w-12 md:h-12 text-white" />
                      <span className="bg-white/20 backdrop-blur-sm px-2 md:px-3 py-1 rounded-full text-xs font-bold">
                        ACTIF
                      </span>
                    </div>
                    <h3 className="text-lg md:text-2xl font-bold mb-2 md:mb-3">
                      Votre Espace Premium
                    </h3>
                    <p className="text-white/90 mb-3 md:mb-4 text-xs md:text-sm">
                      Accédez à vos statistiques avancées et gérez votre abonnement
                    </p>
                    <button 
                      onClick={() => setSelectedTab('premium')}
                      className="w-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 font-bold py-2 md:py-3 rounded-xl transition-all border border-white/30 text-sm md:text-base"
                    >
                      Accéder aux statistiques premium
                    </button>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-job-purple to-job-pink rounded-2xl md:rounded-3xl p-4 md:p-6 text-white shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold flex items-center text-sm md:text-base">
                        <Crown className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                        Premium
                      </h3>
                      <Rocket className="w-4 h-4 md:w-5 md:h-5 text-white/50" />
                    </div>
                    
                    <p className="text-white/90 text-xs md:text-sm mb-4">
                      Démarquez-vous avec nos outils Premium !
                    </p>
                    
                    <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                      <div className="flex items-center text-xs md:text-sm">
                        <BadgeCheck className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                        <span>Annonces mis en avant</span>
                      </div>
                      <div className="flex items-center text-xs md:text-sm">
                        <Star className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                        <span>Contact direct avec les profils</span>
                      </div>
                      <div className="flex items-center text-xs md:text-sm">
                        <Zap className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                        <span>Fonctionnalités Express</span>
                      </div>
                    </div>
                    
                    <PremiumButton 
                      variant="default"
                      className="w-full text-sm md:text-base"
                    >
                      Passer au Premium
                    </PremiumButton>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ✅ ONGLET CANDIDATURES AVEC PAGINATION */}
          {selectedTab === 'applications' && (
            <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-xl border-2 border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 md:w-6 md:h-6 text-job-gold" />
                  Candidatures reçues ({totalApplications})
                </h3>
                
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 text-sm">
                    <Filter className="w-4 h-4" />
                    <span className="hidden sm:inline">Filtrer</span>
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 text-sm">
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Exporter</span>
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                {currentApplications.map((app) => (
                  <div key={app.$id || app.id || `app-${Math.random()}`} className="p-4 md:p-5 rounded-2xl border-2 border-gray-100 bg-gray-50 hover:border-job-gold transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-job-gold flex items-center justify-center text-white font-bold text-lg md:text-xl flex-shrink-0">
                        {app.profiles?.first_name?.[0] || 'U'}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                          <h4 className="text-base md:text-lg font-bold text-gray-900 truncate">
                            {app.profiles?.first_name} {app.profiles?.last_name}
                          </h4>
                          
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1 px-2 md:px-3 py-1 rounded-full text-xs font-semibold border ${
                              app.status === 'approved' || app.status === 'accepted' ? 'bg-green-100 text-green-700 border-green-200' : 
                              app.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                              app.status === 'reviewed' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                            }`}>
                              {getStatusIcon(app.status)}
                              {app.status === 'pending' ? 'En attente' : 
                              app.status === 'reviewed' ? 'Examiné' :
                              app.status === 'approved' || app.status === 'accepted' ? 'Accepté' : 
                              app.status === 'rejected' ? 'Rejeté' : 'En attente'}
                            </span>
                            
                            <button className="p-1">
                              <MoreVertical className="w-4 h-4 text-gray-400" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-3 text-xs md:text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3 md:w-4 md:h-4" />
                            {app.jobs?.title}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 md:w-4 md:h-4" />
                            <span className="truncate">{app.profiles?.email}</span>
                          </span>
                          {app.profiles?.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 md:w-4 md:h-4" />
                              {app.profiles.phone}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 md:w-4 md:h-4" />
                            {getTimeAgo(app.applied_at || app.$createdAt)}
                          </span>
                        </div>
                        
                        {app.cover_letter && (
                          <div className="p-3 bg-white rounded-lg mb-3 border border-gray-200">
                            <p className="text-xs md:text-sm text-gray-700 line-clamp-2">
                              "{app.cover_letter.substring(0, 150)}..."
                            </p>
                          </div>
                        )}
                        
                        <div className="flex flex-wrap gap-2">
                          {app.cv_url && (
                            <a 
                              href={app.cv_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1 bg-job-gold text-white rounded-lg text-xs font-semibold hover:bg-job-dark-gold transition-colors"
                            >
                              <Download className="w-3 h-3" />
                              <span className="hidden sm:inline">Télécharger </span>CV
                            </a>
                          )}
                          
                          {app.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApplicationAction(app.$id, 'accepted')}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-lg text-xs font-semibold hover:bg-green-600 transition-colors"
                              >
                                <CheckCircle className="w-3 h-3" />
                                Accepter
                              </button>
                              <button
                                onClick={() => handleApplicationAction(app.$id, 'rejected')}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 transition-colors"
                              >
                                <XCircle className="w-3 h-3" />
                                Rejeter
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {currentApplications.length === 0 && (
                  <div className="text-center py-12 md:py-16 text-gray-400">
                    <FileText className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 opacity-50" />
                    <h4 className="text-lg md:text-xl font-semibold mb-2">
                      Aucune candidature reçue
                    </h4>
                    <p className="text-sm md:text-base">
                      Les candidatures pour vos offres apparaîtront ici
                    </p>
                  </div>
                )}
              </div>

              {/* ✅ PAGINATION CANDIDATURES */}
              <Pagination
                currentPage={applicationsPage}
                totalPages={totalApplicationsPages}
                onPageChange={goToApplicationsPage}
                onPrevious={previousApplicationsPage}
                onNext={nextApplicationsPage}
                totalItems={totalApplications}
                startIndex={startApplicationsIndex}
                endIndex={endApplicationsIndex}
              />
            </div>
          )}

          {/* ✅ ONGLET OFFRES AVEC PAGINATION */}
          {selectedTab === 'jobs' && (
            <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-xl border-2 border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 md:w-6 md:h-6 text-job-gold" />
                  Mes offres d'emploi ({totalJobs})
                </h3>
                
                <Button
                  onClick={() => navigate('/jobs/create')}
                  className="bg-gradient-to-r from-job-gold to-job-orange text-white px-4 py-2 rounded-lg font-semibold text-sm hover:shadow-lg transition-all"
                >
                  + Nouvelle offre
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {currentJobs.map((job) => (
                  <div key={job.$id || job.id || `job-list-${Math.random()}`} className="p-4 md:p-5 rounded-2xl border-2 border-gray-100 bg-gray-50 hover:border-job-gold hover:-translate-y-1 transition-all cursor-pointer">
                    <div className="mb-4">
                      <h4 className="text-base md:text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                        {job.title}
                      </h4>
                      <p className="text-gray-500 text-xs md:text-sm">
                        Publié {getTimeAgo(job.created_at)}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1 text-xs md:text-sm text-gray-600">
                          <Eye className="w-3 h-3 md:w-4 md:h-4" />
                          {job.views_count || 0} vues
                        </span>
                      </div>
                      
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                        job.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {job.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/jobs/${job.$id}`)}
                        className="flex-1 py-2 px-3 border border-job-gold text-job-gold rounded-lg text-xs md:text-sm font-semibold hover:bg-job-cream transition-colors"
                      >
                        Voir l'offre
                      </button>
                    </div>
                  </div>
                ))}
                
                {currentJobs.length === 0 && (
                  <div className="col-span-full text-center py-12 md:py-16 text-gray-400">
                    <Briefcase className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 opacity-50" />
                    <h4 className="text-lg md:text-xl font-semibold mb-2">
                      Aucune offre active
                    </h4>
                    <p className="text-sm md:text-base">
                      Créez votre première offre d'emploi pour commencer
                    </p>
                  </div>
                )}
              </div>

              {/* ✅ PAGINATION OFFRES */}
              <Pagination
                currentPage={jobsPage}
                totalPages={totalJobsPages}
                onPageChange={goToJobsPage}
                onPrevious={previousJobsPage}
                onNext={nextJobsPage}
                totalItems={totalJobs}
                startIndex={startJobsIndex}
                endIndex={endJobsIndex}
              />
            </div>
          )}
        </div>

        {/* CSS pour les animations */}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          
          .job-gold { color: #D4AF37; }
          .job-dark-gold { color: #B8860B; }
          .job-orange { color: #F97316; }
          .job-purple { color: #8B5CF6; }
          .job-pink { color: #EC4899; }
          .job-cream { background-color: #FEF9E7; }
        `}</style>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;