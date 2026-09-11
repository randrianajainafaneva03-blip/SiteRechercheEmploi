import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PremiumButton from '@/components/PremiumButton';
import { 
  Package,
  Plus,
  Edit3,
  Eye,
  EyeOff,
  Trash2,
  Star,
  Crown,
  TrendingUp,
  Activity,
  BarChart3,
  Clock,
  DollarSign,
  Timer,
  MapPin,
  Briefcase,
  Users,
  CheckCircle,
  AlertCircle,
  Award,
  Sparkles,
  Settings,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  Target,
  Zap,
  Shield,
  Gift,
  MessageSquare,
  ExternalLink,
  Share2,
  Bookmark,
  Heart,
  Building,
  Lightbulb,
  Coffee,
  ArrowRight,
  FileText,
  User,
  BadgeCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import ServiceModal from '@/components/ServiceModal';
import { databases, storage, DATABASE_ID, COLLECTIONS, Query } from '@/lib/appwrite';
import { 
  useAppwriteQuery, 
  useAppwriteMutation
} from '@/hooks/useAppwriteQuery';

const MyServices = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // ✅ ÉTAT POUR LE MODAL DE DÉTAILS
  const [selectedService, setSelectedService] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✅ CORRECTION 1: Utilisation directe d'useAppwriteQuery avec la bonne structure
  const { 
    data: servicesResponse, 
    isLoading: loading, 
    refetch: refetchServices 
  } = useAppwriteQuery(
    ['services', user?.$id],
    async () => {
      if (!user?.$id) return { data: [], count: 0 };
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.SERVICES,
        [
          Query.equal('creator_id', user.$id),
          Query.orderDesc('$createdAt')
        ]
      );
      
      return { data: response.documents || [], count: response.total || 0 };
    },
    { 
      enabled: !!user?.$id,
      requireAuth: true,
      staleTime: 30 * 1000 // 30 secondes
    }
  );

  // ✅ CORRECTION 2: Extraction sécurisée des services
  const services = servicesResponse?.data || [];
  const servicesCount = servicesResponse?.count || 0;

  // Hook pour charger les statistiques
  const { data: stats = {
    totalServices: 0,
    activeServices: 0,
    totalViews: 0,
    pendingServices: 0,
    premiumServices: 0
  } } = useAppwriteQuery(
    ['service-stats', user?.$id],
    async () => {
      if (!user?.$id) return {
        totalServices: 0,
        activeServices: 0,
        totalViews: 0,
        pendingServices: 0,
        premiumServices: 0
      };

      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.SERVICES,
        [Query.equal('creator_id', user.$id)]
      );
  
      const data = response.documents || [];
  
      const totalServices = data.length;
      const activeServices = data.filter(s => s.is_active && s.is_approved).length;
      const pendingServices = data.filter(s => !s.is_approved).length;
      const totalViews = data.reduce((sum, s) => sum + (s.views_count || 0), 0);
      const premiumServices = profile?.is_premium ? activeServices : 0;
  
      return {
        totalServices,
        activeServices,
        totalViews,
        pendingServices,
        premiumServices
      };
    },
    {
      enabled: !!user?.$id,
      requireAuth: true,
      staleTime: 2 * 60 * 1000 // 2 minutes
    }
  );

  // Mutation pour modifier le statut d'un service
  const toggleServiceStatusMutation = useAppwriteMutation(
    async ({ serviceId, currentStatus }) => {
      // Vérifier d'abord que l'utilisateur est le créateur
      const serviceData = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.SERVICES,
        serviceId
      );
      
      if (serviceData.creator_id !== user.$id) {
        throw new Error('Accès non autorisé pour modifier ce service');
      }
  
      const response = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.SERVICES,
        serviceId,
        { 
          is_active: !currentStatus,
          updated_at: new Date().toISOString()
        }
      );
  
      return response;
    },
    {
      requireAuth: true,
      successMessage: (data) => 
        data.is_active ? "Service publié avec succès !" : "Service masqué avec succès !",
      invalidateQueries: [
        ['services', user?.$id],
        ['service-stats', user?.$id]
      ]
    }
  );

  // Mutation pour supprimer un service
  const deleteServiceMutation = useAppwriteMutation(
    async (serviceId) => {
      // Vérifier d'abord que l'utilisateur est le créateur
      const serviceData = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.SERVICES,
        serviceId
      );
      
      if (serviceData.creator_id !== user.$id) {
        throw new Error('Accès non autorisé pour supprimer ce service');
      }
  
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.SERVICES,
        serviceId
      );
  
      return { success: true };
    },
    {
      requireAuth: true,
      successMessage: "Service supprimé avec succès !",
      invalidateQueries: [
        ['services', user?.$id],
        ['service-stats', user?.$id]
      ]
    }
  );

  // Handlers optimisés
  const handleRefresh = useCallback(async () => {
    await refetchServices();
  }, [refetchServices]);

  const handleToggleStatus = useCallback(async (serviceId, currentStatus) => {
    try {
      await toggleServiceStatusMutation.mutateAsync({ serviceId, currentStatus });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  }, [toggleServiceStatusMutation]);
  
  const handleDeleteService = useCallback(async (serviceId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce service ? Cette action est irréversible.')) {
      return;
    }
  
    try {
      await deleteServiceMutation.mutateAsync(serviceId);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  }, [deleteServiceMutation]);
  
  const handleEditService = useCallback((serviceId) => {
    navigate(`/services/edit/${serviceId}`);
  }, [navigate]);
  
  const handleViewService = useCallback((serviceId) => {
    window.open(`/services/${serviceId}`, '_blank');
  }, []);

  // ✅ NOUVELLE FONCTION POUR OUVRIR LE MODAL DE DÉTAILS
  const handleViewServiceDetails = useCallback((service) => {
    console.log('Ouverture modal pour service:', service);
    setSelectedService(service);
    setIsModalOpen(true);
  }, []);

  // ✅ FERMER LE MODAL
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedService(null);
  }, []);

  // Fonction utilitaire pour le badge de statut
  const getStatusBadge = useCallback((service) => {
    if (!service.is_approved) {
      return (
        <span className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
          <Clock className="h-3 w-3 mr-1" />
          En attente
        </span>
      );
    }
    if (service.is_active) {
      return (
        <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
          <CheckCircle className="h-3 w-3 mr-1" />
          Actif
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">
        <EyeOff className="h-3 w-3 mr-1" />
        Inactif
      </span>
    );
  }, []);

  // ✅ CORRECTION 3: Vérification que services est bien un array
  const mappedServices = React.useMemo(() => {
    if (!Array.isArray(services)) {
      console.warn('Services is not an array:', services);
      return [];
    }
    
    return services.map(service => ({
      ...service,
      isPremium: profile?.is_premium || false,
      isActive: service.is_active && service.is_approved,
      isPending: !service.is_approved,
      formattedDate: new Date(service.$createdAt || service.created_at).toLocaleDateString('fr-FR')
    }));
  }, [services, profile?.is_premium]);

  // Filtrage des services
  const filteredServices = React.useMemo(() => {
    if (!Array.isArray(mappedServices)) {
      return [];
    }
    
    return mappedServices.filter(service => {
      const matchesSearch = service.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           service.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' ||
                           (statusFilter === 'active' && service.isActive) ||
                           (statusFilter === 'pending' && service.isPending) ||
                           (statusFilter === 'inactive' && !service.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [mappedServices, searchTerm, statusFilter]);

  // ✅ DEBUG: Afficher les données pour diagnostiquer
  console.log('Debug MyServices:', {
    user: user?.$id,
    servicesResponse,
    services,
    servicesCount,
    mappedServices: mappedServices.length,
    filteredServices: filteredServices.length
  });

  // Vérification des permissions
  if (!user || profile?.user_type !== 'candidate') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès non autorisé</h1>
          <p className="text-gray-600">Cette page est réservée aux candidats.</p>
          <Button 
            onClick={() => navigate('/profile')}
            className="mt-4 bg-blue-500 text-white"
          >
            Retour au profil
          </Button>
        </div>
      </div>
    );
  }

  const isOperationLoading = toggleServiceStatusMutation.isPending || deleteServiceMutation.isPending;

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc',
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
        background: 'linear-gradient(135deg, #F59E0B 0%, #F97316 50%, #EF4444 100%)',
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
            <div className="flex items-center justify-center mb-4">
              <Package className="h-12 w-12 mr-4 text-yellow-300" />
              <h1 className="text-4xl font-bold">
                ✨ Mes Services 
              </h1>
              {profile?.is_premium && (
                <Crown className="h-12 w-12 ml-4 text-yellow-300 animate-pulse" />
              )}
            </div>
            <p className="text-xl text-white/90 mb-8">
              Gérez vos {stats.totalServices} services et maximisez votre visibilité
            </p>
                  
            {/* Barre de recherche */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl mb-8">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Rechercher mes services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 font-medium"
                  />
                </div>
                <div className="relative min-w-[200px]">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full pl-12 pr-8 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 appearance-none bg-white font-medium"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="active">Actifs</option>
                    <option value="pending">En attente</option>
                    <option value="inactive">Inactifs</option>
                  </select>
                </div>
                <Button
                  onClick={() => navigate('/services/create')}
                  className="bg-gradient-to-r from-orange-600 to-red-500 hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-white px-8 py-4 rounded-xl font-bold flex items-center whitespace-nowrap"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Nouveau Service
                </Button>
              </div>
            </div>

            {/* Badge Premium */}
            {profile?.is_premium && (
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/30 inline-flex items-center">
                <Crown className="h-6 w-6 text-yellow-300 mr-2" />
                <span className="text-white font-bold text-lg">Membre Premium Actif</span>
                <Star className="h-6 w-6 text-yellow-300 ml-2" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contenu principal */}
      <div style={{ 
        width: '100%', 
        padding: '32px 16px',
        margin: 0,
        textAlign: 'left'
      }}>
        <div style={{ 
          maxWidth: '1500px', 
          margin: '0 auto',
          width: '100%'
        }}>
          <div style={{ 
            display: 'flex', 
            gap: '24px', 
            minHeight: '800px',
            width: '100%'
          }}>
            
            {/* Colonne gauche - Statistiques et actions */}
            <div style={{ 
              width: '25%', 
              minHeight: '600px',
              padding: '16px'
            }}>
              <div className="sticky top-24 space-y-6">
                
                {/* Statistiques Premium */}
                <div className="bg-gradient-to-br from-job-purple to-job-pink rounded-3xl p-6 text-white shadow-2xl transform hover:scale-105 transition-transform">
                  <div className="flex items-center justify-between mb-4">
                    <BarChart3 className="h-12 w-12 text-white" />
                    <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold">
                      STATS
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-3">
                    Mes Statistiques
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Services totaux</span>
                      <span className="text-2xl font-bold">{stats.totalServices}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Services actifs</span>
                      <span className="text-2xl font-bold text-green-300">{stats.activeServices}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Total des vues</span>
                      <span className="text-2xl font-bold text-blue-300">{stats.totalViews}</span>
                    </div>
                    {stats.pendingServices > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-white/80">En attente</span>
                        <span className="text-2xl font-bold text-yellow-300">{stats.pendingServices}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions rapides */}
                <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-orange-600 flex items-center">
                      <Zap className="h-5 w-5 mr-2 text-orange-600" />
                      Actions Rapides
                    </h3>
                    <button 
                      onClick={handleRefresh}
                      disabled={loading}
                      className="text-orange-600 hover:text-orange-800 text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => navigate('/services/create')}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white p-3 rounded-xl hover:shadow-lg transition-all flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Créer un service
                    </button>
                    <button
                      onClick={() => navigate('/services')}
                      className="w-full bg-gray-100 text-gray-700 p-3 rounded-xl hover:bg-gray-200 transition-all flex items-center"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Voir tous les services
                    </button>
                    <button
                      onClick={() => navigate('/profile')}
                      className="w-full bg-blue-100 text-blue-700 p-3 rounded-xl hover:bg-blue-200 transition-all flex items-center"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Mon profil
                    </button>
                  </div>
                </div>

                {/* Performance */}
                <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                  <h3 className="font-bold text-orange-600 mb-4 flex items-center">
                    <Target className="h-5 w-5 mr-2 text-orange-600" />
                    Performance
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Taux de visibilité</span>
                      <span className="font-bold text-orange-600">
                        {stats.totalServices > 0 ? Math.round((stats.activeServices / stats.totalServices) * 100) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all"
                        style={{ width: `${stats.totalServices > 0 ? (stats.activeServices / stats.totalServices) * 100 : 0}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Vues moyennes</span>
                      <span className="font-bold text-blue-600">
                        {stats.activeServices > 0 ? Math.round(stats.totalViews / stats.activeServices) : 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne centrale - Liste des services */}
            <div style={{ 
              width: '50%', 
              backgroundColor: 'transparent', 
              minHeight: '600px',
              padding: '0'
            }}>
              <div className="space-y-6">
                
                {/* Header avec stats et options */}
                <div className="bg-white rounded-2xl shadow-xl border-2 border-orange-500 p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div>
                      <h2 className="text-2xl font-bold text-orange-600 mb-2">
                        {loading ? '⏳ Chargement...' : `🚀 ${filteredServices.length} services trouvés`}
                      </h2>
                      <p className="text-gray-600">
                        Gérez vos services et optimisez votre visibilité
                      </p>
                    </div>
                    
                    <Button
                      onClick={() => navigate('/services/create')}
                      className="mt-4 sm:mt-0 bg-gradient-to-r from-orange-600 to-red-500 text-white flex items-center space-x-2 px-6 py-3 shadow-lg hover:shadow-xl transition-all font-bold"
                    >
                      <Plus className="h-5 w-5" />
                      <span>Nouveau Service</span>
                    </Button>
                  </div>
                </div>

                {/* Liste des services */}
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
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
                ) : filteredServices.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl shadow-xl border-2 border-gray-200">
                    <Package className="h-20 w-20 text-gray-300 mx-auto mb-6" />
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                      {searchTerm || statusFilter !== 'all' ? '🔍 Aucun service trouvé' : '🎯 Créez votre premier service'}
                    </h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'Essayez de modifier vos critères de recherche'
                        : 'Commencez à proposer vos services et trouvez des clients'
                      }
                    </p>
                    <Button 
                      onClick={() => navigate('/services/create')}
                      className="bg-gradient-to-r from-orange-600 to-red-500 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Créer mon premier service
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredServices.map((service) => (
                      <div 
                        key={service.$id} 
                        className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-orange-500 cursor-pointer"
                        onClick={() => handleViewServiceDetails(service)}
                      >
                        {/* Header du service */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-xl font-bold text-gray-900 hover:text-orange-600 transition-colors">
                                {service.title}
                              </h3>
                              {service.isPremium && (
                                <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center">
                                  <Crown className="h-3 w-3 mr-1" />
                                  PREMIUM
                                </div>
                              )}
                              {getStatusBadge(service)}
                            </div>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                              {service.description?.replace(/<[^>]*>/g, '').substring(0, 150)}...
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {service.formattedDate}
                              </span>
                              <span className="flex items-center">
                                <Eye className="h-4 w-4 mr-1" />
                                {service.views_count || 0} vues
                              </span>
                              <span className="flex items-center">
                                <Briefcase className="h-4 w-4 mr-1" />
                                {service.category}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Informations détaillées */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          {service.price_range && (
                            <div className="bg-green-50 rounded-xl p-3">
                              <div className="flex items-center">
                                <DollarSign className="h-4 w-4 text-green-600 mr-2" />
                                <div>
                                  <p className="text-xs text-gray-600">Prix</p>
                                  <p className="font-semibold text-green-600">{service.price_range}</p>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {service.delivery_time && (
                            <div className="bg-blue-50 rounded-xl p-3">
                              <div className="flex items-center">
                                <Timer className="h-4 w-4 text-blue-600 mr-2" />
                                <div>
                                  <p className="text-xs text-gray-600">Délai</p>
                                  <p className="font-semibold text-blue-600">{service.delivery_time}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="bg-purple-50 rounded-xl p-3">
                            <div className="flex items-center">
                              <Activity className="h-4 w-4 text-purple-600 mr-2" />
                              <div>
                                <p className="text-xs text-gray-600">Statut</p>
                                <p className="font-semibold text-purple-600">
                                  {service.isActive ? 'Visible' : service.isPending ? 'En attente' : 'Masqué'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                      {/* Compétences */}
                        {(() => {
                          // ✅ PARSER LES SKILLS EN TOUTE SÉCURITÉ
                          let skillsArray = [];
                          try {
                            if (service.skills) {
                              if (Array.isArray(service.skills)) {
                                skillsArray = service.skills;
                              }
                              // Si c'est une string JSON, la parser
                              else if (typeof service.skills === 'string') {
                                skillsArray = JSON.parse(service.skills);
                              }
                            }
                          } catch (error) {
                            console.warn('Erreur parsing skills:', error);
                            skillsArray = [];
                          }

                          return skillsArray.length > 0 && (
                            <div className="mb-4">
                              <div className="flex flex-wrap gap-2">
                                {skillsArray.slice(0, 4).map((skill, index) => (
                                  <span key={index} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                                    {skill}
                                  </span>
                                ))}
                                {skillsArray.length > 4 && (
                                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                    +{skillsArray.length - 4} autres
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })()}

                     </div>
                   ))}
                 </div>
               )}
             </div>
           </div>

           {/* Colonne droite - Widgets et publicités */}
           <div style={{ 
             width: '25%', 
             minHeight: '600px',
             padding: '16px'
           }}>
             <div className="sticky top-24 space-y-6">
               
               {/* Widget Premium */}
               <div className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-xl">
                 <div className="flex items-center justify-between mb-4">
                   <h3 className="font-bold flex items-center text-black">
                     <Crown className="h-5 w-5 mr-2" />
                     Statut Premium
                   </h3>
                   <Star className="h-5 w-5 text-yellow-300" />
                 </div>
                 
                 {profile?.is_premium ? (
                   <div>
                     <p className="text-white/90 text-sm mb-4">
                       Vous êtes membre premium ! Vos services bénéficient d'une visibilité maximale.
                     </p>
                     <div className="space-y-3 mb-6">
                       <div className="flex items-center text-sm">
                         <CheckCircle className="h-4 w-4 mr-2" />
                         <span>Visibilité premium</span>
                       </div>
                       <div className="flex items-center text-sm">
                         <Zap className="h-4 w-4 mr-2" />
                         <span>Badge premium</span>
                       </div>
                       <div className="flex items-center text-sm">
                         <Target className="h-4 w-4 mr-2" />
                         <span>Priorité dans les résultats</span>
                       </div>
                     </div>
                   </div>
                 ) : (
                   <div>
                     <p className="text-black text-sm mb-4">
                       Passez premium pour booster la visibilité de vos services !
                     </p>
                     <PremiumButton 
                        variant="default"
                        className="w-full md:w-auto"
                      >
                        Passer au Premium
                      </PremiumButton>
                   </div>
                 )}
               </div>

               {/* Conseils d'optimisation */}
               <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                 <h3 className="font-bold text-orange-600 mb-4 flex items-center">
                   <Lightbulb className="h-5 w-5 mr-2 text-orange-600" />
                   Conseils Services
                 </h3>
                 <div className="space-y-3">
                   <div className="flex items-start space-x-3">
                     <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                     <p className="text-sm text-gray-600">Ajoutez des images à vos services</p>
                   </div>
                   <div className="flex items-start space-x-3">
                     <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                     <p className="text-sm text-gray-600">Mettez à jour régulièrement</p>
                   </div>
                   <div className="flex items-start space-x-3">
                     <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                     <p className="text-sm text-gray-600">Répondez rapidement aux messages</p>
                   </div>
                   <div className="flex items-start space-x-3">
                     <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                     <p className="text-sm text-gray-600">Optimisez vos descriptions</p>
                   </div>
                 </div>
               </div>


               {/* Widget Statistiques avancées */}
               <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                 <h3 className="font-bold text-orange-600 mb-4 flex items-center">
                   <BarChart3 className="h-5 w-5 mr-2 text-orange-600" />
                   Analyse Détaillée
                 </h3>
                 <div className="space-y-4">
                   <div className="flex justify-between items-center">
                     <span className="text-gray-600 text-sm">Taux de conversion</span>
                     <span className="font-bold text-green-600">12%</span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-gray-600 text-sm">Services populaires</span>
                     <span className="font-bold text-blue-600">{Math.min(stats.activeServices, 3)}</span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-gray-600 text-sm">Messages reçus</span>
                     <span className="font-bold text-purple-600">24</span>
                   </div>
                   <div className="pt-3 border-t border-gray-200">
                     <button className="w-full text-orange-600 hover:text-orange-800 font-medium text-sm transition-colors">
                       Voir le rapport complet →
                     </button>
                   </div>
                 </div>
               </div>

               {/* Support et contact */}
               <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                 <div className="text-center">
                   <div className="w-16 h-16 bg-orange-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                     <MessageSquare className="h-8 w-8 text-orange-600" />
                   </div>
                   <h3 className="font-bold text-gray-900 mb-2">Besoin d'aide ?</h3>
                   <p className="text-gray-600 text-sm mb-4">
                     Notre équipe vous accompagne pour optimiser vos services
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

     {/* ✅ MODAL DE DÉTAILS DU SERVICE */}
     {isModalOpen && selectedService && (
       <ServiceModal
         service={selectedService}
         isOpen={isModalOpen}
         onClose={handleCloseModal}
       />
     )}

     {/* Overlay de chargement pour les opérations */}
     {isOperationLoading && (
       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
         <div className="bg-white rounded-2xl p-8 flex flex-col items-center space-y-4">
           <RefreshCw className="h-8 w-8 animate-spin text-orange-600" />
           <p className="text-gray-700 font-medium">
             {toggleServiceStatusMutation.isPending ? 'Modification en cours...' : 'Suppression en cours...'}
           </p>
         </div>
       </div>
     )}

     {/* Styles CSS */}
     <style>{`
       @keyframes shimmer {
         0% { transform: translateX(-100%); }
         100% { transform: translateX(200%); }
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
         
         div[style*="width: 25%"], div[style*="width: 50%"] {
           width: 100% !important;
         }

         .sticky {
           position: relative !important;
         }
       }
     `}</style>
   </div>
 );
};

export default MyServices;