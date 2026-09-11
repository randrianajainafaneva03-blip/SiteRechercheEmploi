import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ServiceModal from '@/components/ServiceModal';
import FormattedText from '@/components/ui/FormattedText';
import PremiumButton from '@/components/PremiumButton';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  Users, 
  Briefcase, 
  Plus,
  Eye,
  Star,
  ArrowRight,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  User,
  Zap,
  Crown,
  Target,
  UserPlus,
  Building,
  TrendingUp,
  Activity,
  Heart,
  Bookmark,
  DollarSign,
  Timer,
  CheckCircle,
  AlertCircle,
  Award,
  Sparkles,
  Gift,
  Rocket,
  BadgeCheck,
  Shield,
  MessageSquare,
  Building2,
  ExternalLink,
  Share2,
  Download,
  GraduationCap,
  Compass,
  Coffee,
  Lightbulb,
  Handshake,
  Edit3,
  Package,
  Palette,
  Code,
  Camera,
  Megaphone,
  Calculator,
  FileText,
  Globe,
  Wrench
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import PremiumServicesCarousel from '@/components/ui/PremiumServicesCarousel';
import PremiumServicesWidget from '@/components/ui/PremiumServicesWidget';

import { databases, DATABASE_ID, ID } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { 
  useAppwriteMutation,
  useAppwriteQuery 
} from '@/hooks/useAppwriteQuery';

const API_BASE =
   import.meta.env?.VITE_API_BASE_URL ||
   (window.location.hostname === 'localhost'
    ? 'http://localhost:3002'
     : 'https://api.job2mada.com');

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

// Catégories de services avec icônes
const SERVICE_CATEGORIES = [
  { name: 'Développement Web', icon: Code },
  { name: 'Design Graphique', icon: Palette },
  { name: 'Marketing Digital', icon: Megaphone },
  { name: 'Rédaction', icon: FileText },
  { name: 'Traduction', icon: Globe },
  { name: 'Photographie', icon: Camera },
  { name: 'Montage Vidéo', icon: Camera },
  { name: 'Comptabilité', icon: Calculator },
  { name: 'Conseil', icon: Lightbulb },
  { name: 'Formation', icon: GraduationCap },
  { name: 'Maintenance', icon: Wrench },
  { name: 'Réparation', icon: Wrench },
  { name: 'Autres', icon: Wrench }
];

// Carrousel des services mis en avant
const FeaturedServicesCarousel = ({ services, onServiceClick, isScrolled }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (services.length > 3) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % services.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [services.length]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % services.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + services.length) % services.length);
  };

  const getVisibleServices = () => {
    const visibleServices = [];
    const servicesCopy = [...services];
    
  for (let i = 0; i < Math.min(3, servicesCopy.length); i++) {
  const index = (currentIndex + i) % servicesCopy.length;
      if (servicesCopy[index]) {
        visibleServices.push({
          ...servicesCopy[index],
          displayIndex: i
        });
      }
    }
    return visibleServices;
  };

  if (services.length === 0) return null;

  const visibleServices = getVisibleServices();

  return (
    <div className="bg-gradient-to-br from-job-gold via-job-orange to-job-dark-gold rounded-3xl p-4 md:p-8 relative overflow-hidden sticky top-24 z-10 shadow-2xl mt-8">
      <div className="absolute inset-0 bg-black/10"></div>
      
      <div className="relative z-10">
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center justify-center">
            <Crown className="h-8 w-8 mr-3 text-yellow-300" />
            Services Premium
          </h2>
          <p className="text-white/90 text-lg">
            Les meilleurs services de Madagascar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {visibleServices.map((service, index) => (
            <div
              key={`featured-${service.id}-${index}`}
              onClick={() => onServiceClick(service)}
              className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 transform hover:scale-105 transition-all duration-300 shadow-xl animate-slide-in cursor-pointer"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="flex items-center mb-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mr-4 shadow-lg border-2 border-gray-100 bg-white overflow-hidden">
                  {service.creator?.avatar_url ? (
                    <img 
                      src={service.creator.avatar_url} 
                      alt={`Photo de ${service.creator.full_name}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-purple-600 to-pink-500 rounded-full flex items-center justify-center">
                      <Package className="h-7 w-7 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-bold text-purple-600 text-lg line-clamp-1 hover:text-pink-500 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 text-sm font-medium">{service.creator?.full_name}</p>
                </div>
              </div>
              
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                    <MapPin className="h-3 w-3 text-purple-600" />
                  </div>
                  <span className="font-medium">{service.creator?.location}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-2">
                    <Briefcase className="h-3 w-3 text-green-600" />
                  </div>
                  <span>{service.category}</span>
                </div>
                {service.price_range && (
                  <div className="flex items-center">
                    <div className="w-5 h-5 bg-yellow-100 rounded-full flex items-center justify-center mr-2">
                      <DollarSign className="h-3 w-3 text-yellow-600" />
                    </div>
                    <span className="font-bold text-green-600">{service.price_range}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Voir le service</span>
                  <div className="w-6 h-6 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full flex items-center justify-center">
                    <ArrowRight className="h-3 w-3 text-white" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {services.length > 3 && (
          <div className="flex items-center justify-center mt-6 space-x-3">
            <button
              onClick={goToPrev}
              className="p-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full shadow-lg transition-all"
            >
              <ChevronLeft className="h-5 w-5 text-white" />
            </button>
            <div className="flex space-x-2">
              {Array.from({ length: Math.min(5, services.length) }, (_, i) => (
                <div
                  key={`carousel-indicator-${i}`}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={goToNext}
              className="p-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full shadow-lg transition-all"
            >
              <ChevronRight className="h-5 w-5 text-white" />
            </button>
          </div>
        )}
      </div>

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

// Widget des derniers services pour la sidebar
const RecentServicesWidget = ({ services, onServiceClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (services.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % services.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [services.length]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % services.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + services.length) % services.length);
  };

  if (!services.length) {
    return (
      <div className="text-center py-8">
        <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Aucun service récent</p>
      </div>
    );
  }

  return (
    <div className="relative bg-white rounded-2xl shadow-xl border-2 border-purple-600 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-4 flex items-center justify-between">
        <h3 className="font-bold text-white text-lg flex items-center">
          <Sparkles className="h-5 w-5 mr-2" />
          Nouveaux Services
        </h3>
        <span className="text-white/80 text-sm font-medium">
          {services.length} services
        </span>
      </div>

      <div className="relative h-80 overflow-hidden">
        <div 
          className="transition-transform duration-500 ease-in-out h-full"
          style={{ transform: `translateY(-${currentIndex * 100}%)` }}
        >
          {services.map((service, index) => (
            <div
              key={`recent-${service.id}-${index}`}
              onClick={() => onServiceClick(service)}
              className="h-full block cursor-pointer transform transition-all duration-300 hover:scale-105"
            >
              <div className="h-full p-6 flex flex-col justify-between bg-gradient-to-br from-white via-purple-50 to-pink-50 hover:from-pink-50 hover:via-purple-50 hover:to-white border-b border-purple-600/20">
                <div>
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4 shadow-lg border-2 border-gray-100 bg-white overflow-hidden">
                      {service.creator?.avatar_url ? (
                        <img 
                          src={service.creator.avatar_url} 
                          alt={`Photo de ${service.creator.full_name}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-purple-600 to-pink-500 rounded-full flex items-center justify-center">
                          <Package className="h-6 w-6 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-bold text-purple-600 text-sm line-clamp-1 hover:text-pink-500 transition-colors">
                        {service.title}
                      </h4>
                      <p className="text-gray-600 text-xs font-medium">{service.creator?.full_name}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-xs text-gray-600">
                    <div className="flex items-center">
                      <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                        <MapPin className="h-3 w-3 text-purple-600" />
                      </div>
                      <span className="font-medium">{service.creator?.location}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-2">
                        <Briefcase className="h-3 w-3 text-green-600" />
                      </div>
                      <span>{service.category}</span>
                    </div>
                    {service.price_range && (
                      <div className="flex items-center">
                        <div className="w-5 h-5 bg-yellow-100 rounded-full flex items-center justify-center mr-2">
                          <DollarSign className="h-3 w-3 text-yellow-600" />
                        </div>
                        <span className="font-bold text-green-600">{service.price_range}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-purple-600/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Voir le service</span>
                    <div className="w-6 h-6 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full flex items-center justify-center">
                      <ArrowRight className="h-3 w-3 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {services.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            <button
              onClick={goToPrev}
              className="p-2 bg-gradient-to-br from-purple-600 to-pink-500 hover:bg-white rounded-full shadow-lg transition-all"
            >
              <ChevronUp className="h-3 w-3 text-white" />
            </button>
            <button
              onClick={goToNext}
              className="p-2 bg-gradient-to-br from-purple-600 to-pink-500 hover:bg-white rounded-full shadow-lg transition-all"
            >
              <ChevronDown className="h-3 w-3 text-white" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Services = () => {
  // États pour les modals
  const [selectedService, setSelectedService] = useState(null);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const servicesPerPage = 30;
  
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    location: '',
    price_range: '',
    delivery_time: ''
  });

  const navigate = useNavigate();
  const { user, profile, isEmployer, isCandidate, isPremium } = useAuth();

  // ✅ HOOK POUR RÉCUPÉRER TOUS LES SERVICES
  const { 
    data: allServicesData, 
    isLoading: servicesLoading, 
    error: servicesError,
    refetch: refetchServices 
  } = useAppwriteQuery(
    ['services'],
    async () => {
      // Récupérer les services
      const servicesResponse = await databases.listDocuments(
        DATABASE_ID,
        'services',
        [
          Query.equal('is_approved', true),
          Query.equal('is_active', true),
          Query.orderDesc('$createdAt'),
          Query.limit(1000)
        ]
      );
  
      // Pour chaque service, récupérer le profil du créateur
      const servicesWithProfiles = await Promise.all(
        servicesResponse.documents.map(async (service) => {
          try {
            const profile = await databases.getDocument(
              DATABASE_ID,
              'profiles',
              service.creator_id
            );
  
            return {
              id: service.$id,
              title: service.title,
              description: service.description,
              category: service.category,
              price_range: service.price_range,
              delivery_time: service.delivery_time,
              skills: service.skills || [],
              views_count: service.views_count || 0,
              created_at: service.$createdAt,
              creator_id: service.creator_id,
              is_featured: service.is_featured || false,
              creator: {
                full_name: profile.full_name || 'Nom non défini',
                avatar_url: profile.avatar_url,
                location: profile.location || 'Madagascar',
                poste: profile.poste || 'Freelancer',
                is_premium: profile.is_premium || false,
                email: profile.email || null,
                user_type: profile.user_type || 'candidate'
              },
              isCurrentUser: user && service.creator_id === user.$id,
              is_premium: profile.is_premium || false,
              is_urgent: service.delivery_time === '24h' || service.delivery_time === '48h',
              is_approved: service.is_approved ?? true,
              is_active: service.is_active ?? true,
              youtube_url: service.youtube_url || null,
              video_description: service.video_description || null,
              portfolio: service.portfolio || []
            };
          } catch (error) {
            console.warn('Profil non trouvé pour le service:', service.$id);
            return null;
          }
        })
      );
  
      return servicesWithProfiles.filter(service => service !== null);
    }
  );

  // ✅ HOOK POUR ENVOYER UN MESSAGE
  const sendMessageMutation = useAppwriteMutation(
    async ({ receiverId, subject, content, serviceId }) => {
      await databases.createDocument(
        DATABASE_ID,
        'messages',
        'unique()',
        {
          sender_id: user.$id,
          receiver_id: receiverId,
          subject: subject,
          content: content,
          service_id: serviceId,
          message_type: 'service_inquiry'
        }
      );
      return { success: true };
    }
  );

  // ✅ HOOK POUR SAUVEGARDER UN SERVICE
  const saveServiceMutation = useAppwriteMutation(
    async (serviceId) => {
      try {
        await databases.createDocument(
          DATABASE_ID,
          'saved_services',
          'unique()',
          {
            employer_id: user.$id,
            service_id: serviceId
          }
        );
        return { success: true };
      } catch (error) {
        if (error.code === 409) { // Conflit (déjà existant)
          throw new Error('Service déjà sauvegardé !');
        }
        throw error;
      }
    }
  );

  // ✅ TRAITEMENT DES DONNÉES
  const allServices = allServicesData || [];
  
  // Appliquer les filtres
  let filteredServices = [...allServices];
  
  if (filters.search) {
    filteredServices = filteredServices.filter(s => 
      s.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      s.description.toLowerCase().includes(filters.search.toLowerCase()) ||
      s.creator.full_name.toLowerCase().includes(filters.search.toLowerCase()) ||
      (s.skills && s.skills.some(skill => 
        skill.toLowerCase().includes(filters.search.toLowerCase())
      ))
    );
  }
  
  if (filters.category) {
    filteredServices = filteredServices.filter(s => s.category === filters.category);
  }
  
  if (filters.location) {
    filteredServices = filteredServices.filter(s => 
      s.creator.location && s.creator.location.includes(filters.location)
    );
  }

  if (filters.price_range) {
    filteredServices = filteredServices.filter(s => s.price_range === filters.price_range);
  }

  if (filters.delivery_time) {
    filteredServices = filteredServices.filter(s => s.delivery_time === filters.delivery_time);
  }

  // Services finaux avec pagination
  const totalServices = filteredServices.length;
const totalPages = Math.ceil(totalServices / servicesPerPage);
const startIndex = (currentPage - 1) * servicesPerPage;
const endIndex = Math.min(startIndex + servicesPerPage, totalServices);
const services = filteredServices.slice(startIndex, endIndex);

  // Services premium et récents
  const premiumServices = allServices.filter(s => s.creator?.is_premium).slice(0, 10);
  const recentServices = allServices.slice(0, 6);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
  
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ✅ GESTION DES FILTRES AVEC DEBOUNCE
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [filters]);

  // ✅ FONCTIONS D'ACTIONS
  const handleServiceClick = (service) => {
    // Normalise creator → profiles pour ServiceModal
    setSelectedService({ ...service, profiles: service.creator || service.profiles });
    setShowServiceModal(true);
    incrementServiceViews(service.id);
  };

  const handleContactClick = (service) => {
    setSelectedService(service);
    setContactSubject(`Intéressé par votre service: ${service.title}`);
    setContactMessage(`Bonjour ${service.creator.full_name},\n\nJe suis intéressé par votre service "${service.title}".\n\nPourriez-vous me donner plus d'informations ?\n\nCordialement`);
    setShowContactModal(true);
  };

  // Normalise le type pour le template (recruteur/candidat)
const getSenderType = () => (isEmployer ? 'recruteur' : 'candidat');

// Trouver/créer conversation (entre l'user courant et le prestataire)
const findOrCreateConversation = async (otherUser) => {
  const me = {
    id: user?.$id,
    name: user?.name || user?.full_name || 'Utilisateur',
    avatar: user?.avatar_url || '',
    type: isEmployer ? 'employer' : 'candidate',
  };
  const them = {
    id: otherUser?.id || otherUser?.$id || selectedService?.creator_id,
    name: otherUser?.full_name || otherUser?.name || 'Prestataire',
    avatar: otherUser?.avatar_url || '',
    type: otherUser?.user_type || 'candidate',
  };

  if (!me.id || !them.id) throw new Error('IDs manquants pour la conversation');

  const res = await databases.listDocuments(
    DATABASE_ID,
    'conversations',
    [
      Query.or([
        Query.and([Query.equal('participant1_id', me.id),   Query.equal('participant2_id', them.id)]),
        Query.and([Query.equal('participant1_id', them.id), Query.equal('participant2_id', me.id)]),
      ]),
      Query.limit(1),
    ]
  );

  if (res.documents.length) return res.documents[0];

  // create conversation
  const conversationData = {
    participant1_id: me.id,
    participant1_name: me.name,
    participant1_avatar: me.avatar,
    participant1_type: me.type,
    participant2_id: them.id,
    participant2_name: them.name,
    participant2_avatar: them.avatar,
    participant2_type: them.type,
    last_message_id: null,
    last_message_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return await databases.createDocument(
    DATABASE_ID,
    'conversations',
    ID.unique(),
    conversationData
  );
};

// Déclenche la notif e-mail (SES) sans bloquer l’UI
const sendEmailNotification = (payload) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000); // sécurité

    fetch(`${API_BASE}/api/send-message-notification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
    .catch(err => console.warn('Email non envoyé (ignoré):', err))
    .finally(() => clearTimeout(timeout));
  } catch (e) {
    console.warn('Erreur notif email (ignorée):', e);
  }
};

const handleSendMessage = async () => {
     try {
       if (!user) {
         alert('Vous devez être connecté pour envoyer un message');
         return;
       }
       if (!contactMessage.trim() || !contactSubject.trim()) {
         alert('Veuillez remplir tous les champs');
         return;
       }
  
       // 1) Trouver / créer la conversation
       const conversation = await findOrCreateConversation({
         id: selectedService.creator_id,
         full_name: selectedService.creator.full_name,
         avatar_url: selectedService.creator.avatar_url,
         user_type: selectedService.creator.user_type || 'candidate',
       });
       if (!conversation?.$id) throw new Error('Conversation introuvable');
  
       // 2) Créer le message
       const messageDoc = await databases.createDocument(
         DATABASE_ID,
         'messages',
         ID.unique(),
         {
           conversation_id: conversation.$id,
           sender_id: user.$id,
           receiver_id: selectedService.creator_id,
           subject: contactSubject.trim(),
           content: contactMessage.trim(),
           message_type: 'service_inquiry',
           status: 'sent',
           created_at: new Date().toISOString(),
           updated_at: new Date().toISOString(),
           context_type: 'service',
           context_id: selectedService.id,
           context_title: selectedService.title,
         }
       );
  
       // 3) Update conversation
       await databases.updateDocument(
         DATABASE_ID,
         'conversations',
         conversation.$id,
         {
           last_message_id: messageDoc.$id,
           last_message_date: new Date().toISOString(),
           updated_at: new Date().toISOString(),
         }
       );
  
       // 4) Notif e-mail (non bloquante)
       const senderType = getSenderType(); // 'recruteur' | 'candidat'
       sendEmailNotification({
         recipientEmail: selectedService.creator.email,         // <- on l’a ajouté au mapping
         recipientName: selectedService.creator.full_name,
         senderEmail: user?.email,
         senderName: user?.name || user?.full_name || 'Utilisateur',
         subject: contactSubject.trim(),
         message: contactMessage.trim(),
         messagePreview: contactMessage.trim().slice(0, 200),
         jobTitle: selectedService.title,                       // le backend accepte ce champ générique
         contextType: 'service',
         isRecipientPremium: !!selectedService.creator.is_premium,
         conversationId: conversation.$id,
         messageId: messageDoc.$id,
         senderType,                                           // <- important pour le template
       });
  
       // 5) UI
       alert('Message envoyé ✅');
       closeModals();
     } catch (err) {
       console.error('Erreur envoi message service:', err);
       alert("Erreur lors de l'envoi. Réessayez.");
     }
   };

  const handleSaveService = (serviceId) => {
    if (!user || !isEmployer) {
      alert('Seuls les employeurs peuvent sauvegarder des services');
      return;
    }

    saveServiceMutation.mutate(serviceId);
  };

  const incrementServiceViews = async (serviceId) => {
    try {
      const currentService = await databases.getDocument(
        DATABASE_ID,
        'services',
        serviceId
      );
  
      const newViewsCount = (currentService.views_count || 0)  + 1;
  
      await databases.updateDocument(
        DATABASE_ID,
        'services',
        serviceId,
        { views_count: newViewsCount }
      );
  
      refetchServices();
    } catch (error) {
      console.error('Erreur lors de l\'incrémentation des vues:', error);
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
      price_range: '',
      delivery_time: ''
    });
  };

  const handleCreateService = () => {
    if (!user) {
      navigate('/login', { 
        state: { 
          from: '/services', 
          message: 'Connectez-vous pour proposer vos services' 
        } 
      });
      return;
    }
    
    if (!isCandidate) {
      alert('Seuls les candidats peuvent proposer des services');
      return;
    }
    
    navigate('/services/create');
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fonctions de partage
  const generateServiceUrl = (service) => {
    return `${window.location.origin}/services/${service.id}`;
  };

  const shareToFacebook = (service) => {
    const url = generateServiceUrl(service);
    const text = `Découvrez ce service : ${service.title} par ${service.creator.full_name}`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  const shareToLinkedIn = (service) => {
    const url = generateServiceUrl(service);
    const title = `Service : ${service.title}`;
    const summary = `${service.description?.substring(0, 200)}...`;
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(summary)}`;
    window.open(linkedinUrl, '_blank', 'width=600,height=400');
  };

  const shareToWhatsApp = (service) => {
    const url = generateServiceUrl(service);
    const text = `🔥 Découvrez ce service génial !\n\n*${service.title}*\nPar: ${service.creator.full_name}\n📍 ${service.creator.location}\n\n${service.description?.substring(0, 100)}...\n\n💰 ${service.price_range || 'Prix à négocier'}\n⏱️ ${service.delivery_time || 'Délai à définir'}\n\n👉 ${url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareToInstagram = (service) => {
    copyToClipboard(service);
    alert('Lien copié ! Vous pouvez maintenant le coller dans votre story Instagram ou vos DM.');
  };

  const shareToTwitter = (service) => {
    const url = generateServiceUrl(service);
    const text = `🚀 Service disponible : ${service.title}\n💼 Par ${service.creator.full_name}\n📍 ${service.creator.location}\n\n#FreelanceMadagascar #Services`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };

  const shareToTelegram = (service) => {
    const url = generateServiceUrl(service);
    const text = `🔥 Service : ${service.title}\nPar: ${service.creator.full_name}\n\n${service.description?.substring(0, 100)}...\n\n${url}`;
   const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
   window.open(telegramUrl, '_blank');
 };

 const copyToClipboard = async (service) => {
   const url = generateServiceUrl(service);
   const shareText = `🔥 Découvrez ce service !\n\n${service.title}\nPar: ${service.creator.full_name}\n📍 ${service.creator.location}\n\n${service.description?.substring(0, 150)}...\n\n💰 ${service.price_range || 'Prix à négocier'}\n⏱️ ${service.delivery_time || 'Délai à définir'}\n\n${url}`;
   
   try {
     await navigator.clipboard.writeText(shareText);
     alert('Lien et description copiés dans le presse-papier !');
   } catch (err) {
     const textArea = document.createElement('textarea');
     textArea.value = shareText;
     document.body.appendChild(textArea);
     textArea.select();
     document.execCommand('copy');
     document.body.removeChild(textArea);
     alert('Lien copié dans le presse-papier !');
   }
 };

 const handleShareClick = (service) => {
   setSelectedService(service);
   setShowShareModal(true);
 };

 const closeModals = () => {
   setShowServiceModal(false);
   setShowContactModal(false);
   setShowShareModal(false);
   setSelectedService(null);
   setContactMessage('');
   setContactSubject('');
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

 // ✅ GESTION DES ERREURS
 if (servicesError) {
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
       <div className="pt-32 pb-16">
         <div className="max-w-4xl mx-auto px-4 text-center">
           <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
             <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
             <h2 className="text-2xl font-bold text-red-800 mb-2">
               Erreur de chargement
             </h2>
             <p className="text-red-600 mb-6">
               Impossible de charger les services. Veuillez réessayer.
             </p>
             <Button 
               onClick={() => refetchServices()}
               className="bg-red-600 text-white hover:bg-red-700"
             >
               Réessayer
             </Button>
           </div>
         </div>
       </div>
     </div>
   );
 }

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
     <Navbar 
  featuredServices={premiumServices}  // ← Passer les services premium
  showMiniCarousel={isScrolled}
  carouselType="services"  // ← Important !
  onServiceClick={handleServiceClick}  // ← Pour ouvrir le modal
/>
     
     {/* Header avec recherche */}
     <section style={{
       paddingTop: '120px',
       paddingBottom: '32px',
       background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #3B82F6 100%)',
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
             💼 Découvrez les Services de Madagascar
           </h1>
           <p className="text-xl text-white/90 mb-8">
             Explorez {totalServices} services proposés par nos talents
           </p>
                 
           {/* Barre de recherche */}
           <div className="none bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl mb-8">
             <div className="flex flex-col md:flex-row gap-4 items-end">
               <div className="flex-1 relative">
                 <input
                   type="text"
                   placeholder="Rechercher un service, une compétence..."
                   value={filters.search}
                   onChange={(e) => handleFilterChange('search', e.target.value)}
                   className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 font-medium"
                 />
               </div>
               <div className="relative min-w-[200px]">
                 <select
                   value={filters.location}
                   onChange={(e) => handleFilterChange('location', e.target.value)}
                   className="w-full pl-12 pr-8 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 appearance-none bg-white font-medium"
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
                     ? 'bg-purple-600 text-white border-purple-600' 
                     : 'bg-white text-purple-600 border-purple-600 hover:bg-gray-100'
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
             <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-2 border-purple-600">
               <h3 className="text-lg font-bold text-purple-600 mb-4 flex items-center">
                 <Filter className="h-5 w-5 mr-2 text-purple-600" />
                 Filtres avancés
               </h3>
               
               <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                   <select
                     value={filters.category}
                     onChange={(e) => handleFilterChange('category', e.target.value)}
                     className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                   >
                     <option value="">Toutes les catégories</option>
                     {SERVICE_CATEGORIES.map(category => (
                       <option key={category.name} value={category.name}>
                         {category.name}
                       </option>
                     ))}
                   </select>
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">Budget</label>
                   <select
                     value={filters.price_range}
                     onChange={(e) => handleFilterChange('price_range', e.target.value)}
                     className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                   >
                     <option value="">Tous les budgets</option>
                     <option value="0-100000">Moins de 100.000 Ar</option>
                     <option value="100000-500000">100.000 - 500.000 Ar</option>
                     <option value="500000-1000000">500.000 - 1.000.000 Ar</option>
                     <option value="1000000">Plus de 1.000.000 Ar</option>
                   </select>
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">Délai de livraison</label>
                   <select
                     value={filters.delivery_time}
                     onChange={(e) => handleFilterChange('delivery_time', e.target.value)}
                     className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                   >
                     <option value="">Tous délais</option>
                     <option value="24h">24 heures</option>
                     <option value="48h">48 heures</option>
                     <option value="1 semaine">1 semaine</option>
                     <option value="2 semaines">2 semaines</option>
                     <option value="1 mois">1 mois</option>
                   </select>
                 </div>

                 <div className="flex items-end">
                   <button 
                     onClick={clearFilters}
                     className="w-full p-3 text-purple-600 hover:text-purple-800 font-medium transition-colors flex items-center justify-center"
                   >
                     <X className="h-4 w-4 mr-2" />
                     Effacer
                   </button>
                 </div>
               </div>

               <div className="flex justify-between items-center mt-6">
                 <button 
                   onClick={clearFilters}
                   className="text-purple-600 hover:text-purple-800 font-medium transition-colors flex items-center"
                 >
                   <X className="h-4 w-4 mr-2" />
                   Effacer tous les filtres
                 </button>
                 
                 <div className="text-sm text-gray-600">
                   {totalServices} services trouvés
                 </div>
               </div>
             </div>
           )}

         </div>
       </div>
     </section>

     {/* Carrousel des services à la une */}
     <div style={{ 
       width: '100%', 
       padding: '32px 16px 24px 16px',
       margin: 0,
       textAlign: 'left'
     }}>
       <div style={{ 
         maxWidth: '100%', 
         margin: '0 auto',
         width: '100%'
       }}>
         {servicesLoading ? (
           <div className="bg-gradient-to-br from-job-gold via-job-orange to-job-dark-gold rounded-3xl p-8 text-center">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
             <p className="text-white">Chargement des services premium...</p>
           </div>
         ) : (
           <FeaturedServicesCarousel services={premiumServices} onServiceClick={handleServiceClick} />
         )}
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
         margin: '20px auto',
         paddingLeft:'50px',
         paddingRight:'50px', 
         width: '100%',
         
       }}>

         <div style={{ 
           display: 'flex', 
           gap: '4px', 
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
               {/* Widget Proposer un service pour candidats */}
               <div className="bg-gradient-to-br from-job-purple to-job-pink rounded-3xl p-6 text-white shadow-2xl transform hover:scale-105 transition-transform">
                 <div className="flex items-center justify-between mb-4">
                   <Plus className="h-12 w-12 text-white" />
                   <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold">
                     CANDIDAT
                   </span>
                 </div>
                 <h3 className="text-2xl font-bold mb-3">
                   Proposez vos Services
                 </h3>
                 <p className="text-white/90 mb-4 text-sm">
                   Mettez en avant vos compétences et trouvez des clients !
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
                     <span>Contact direct clients</span>
                   </li>
                   <li className="flex items-center text-sm">
                     <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mr-3">
                       <DollarSign className="h-3 w-3" />
                     </div>
                     <span>Revenus supplémentaires</span>
                   </li>
                 </ul>
                 <button 
                   onClick={handleCreateService}
                   className="w-full bg-white text-purple-600 hover:bg-gray-100 font-bold py-3 shadow-lg rounded-xl transition-all"
                 >
                   Créer mon service
                 </button>
               </div>

               {/* Filtres rapides */}
               <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                 <div className="flex items-center justify-between mb-4">
                   <h3 className="font-bold text-purple-600 flex items-center">
                     <Filter className="h-5 w-5 mr-2 text-purple-600" />
                     Filtres rapides
                   </h3>
                   <button 
                     onClick={clearFilters}
                     className="text-purple-600 hover:text-purple-800 text-sm font-medium transition-colors"
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
                       className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                     >
                       <option value="">Toutes</option>
                       {SERVICE_CATEGORIES.slice(0, 5).map(category => (
                         <option key={category.name} value={category.name}>
                           {category.name}
                         </option>
                       ))}
                     </select>
                   </div>

                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">Budget</label>
                     <select
                       value={filters.price_range}
                       onChange={(e) => handleFilterChange('price_range', e.target.value)}
                       className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                     >
                       <option value="">Tous budgets</option>
                       <option value="0-100000">Moins de 100K Ar</option>
                       <option value="100000-500000">100K - 500K Ar</option>
                       <option value="500000-1000000">500K - 1M Ar</option>
                       <option value="1000000">Plus de 1M Ar</option>
                     </select>
                   </div>
                 </div>
               </div>

               {/* Widget Conseils */}
               <div className=" none bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                 <div className="flex items-center mb-4">
                   <Lightbulb className="h-6 w-6 text-purple-600 mr-3" />
                   <h3 className="font-bold text-purple-600">Conseils Services</h3>
                 </div>
                 <ul className="space-y-3 text-sm text-gray-600">
                   <li className="flex items-start">
                     <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                     <span>Détaillez bien votre offre</span>
                   </li>
                   <li className="flex items-start">
                     <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                     <span>Fixez des délais réalistes</span>
                   </li>
                   <li className="flex items-start">
                     <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                     <span>Ajoutez des exemples</span>
                   </li>
                   <li className="flex items-start">
                     <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                     <span>Communiquez rapidement</span>
                   </li>
                 </ul>
               </div>
             </div>
           </div>

           {/* Colonne centrale - Liste des services */}
            <div style={{ 
              width: '70%', 
              backgroundColor: 'transparent', 
              padding: '0',
              display: 'flex',
              flexDirection: 'column',
              height: 'calc(100vh - 96px)',
              position: 'sticky',
              top: '96px',
              marginTop: '20px'
              
            }}>
              {/* Header avec stats - STICKY TOP */}
              <div className="top1 bg-white rounded-2xl shadow-xl border-2 border-purple-600 p-6 flex-shrink-0">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-purple-600 mb-2">
                      {servicesLoading ? '⏳ Chargement...' : `💼 ${totalServices} services disponibles`}
                    </h2>
                    <p className="text-gray-600">
                      Page {currentPage} sur {totalPages} - Découvrez les meilleurs services
                    </p>
                  </div>
                  
                  {isCandidate && (
                    <Button
                      onClick={handleCreateService}
                      className="mt-4 sm:mt-0 bg-gradient-to-r from-purple-600 to-pink-500 text-white flex items-center space-x-2 px-6 py-3 shadow-lg hover:shadow-xl transition-all font-bold"
                    >
                      <Plus className="h-5 w-5" />
                      <span>Proposer un service</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Zone scrollable - LISTE DES SERVICES */}
              <div className="flex-1 overflow-y-auto my-6" style={{ 
                scrollbarWidth: 'thin',
                scrollbarColor: '#8B5CF6 #f3f4f6',
                minHeight: 0
              }}>

               {/* Liste des services */}
               {servicesLoading ? (
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
               ) : services.length === 0 ? (
                 <div className="text-center py-16 bg-white rounded-2xl shadow-xl border-2 border-gray-200">
                   <Package className="h-20 w-20 text-gray-300 mx-auto mb-6" />
                   <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                     🔍 Aucun service trouvé
                   </h3>
                   <p className="text-gray-600 mb-8 max-w-md mx-auto">
                     Essayez de modifier vos critères de recherche ou soyez le premier à proposer un service !
                   </p>
                   <div className="flex gap-4 justify-center">
                     <Button onClick={clearFilters} variant="outline" className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50">
                       Réinitialiser les filtres
                     </Button>
                     {isCandidate && (
                       <Button 
                         onClick={handleCreateService}
                         className="bg-gradient-to-r from-purple-600 to-pink-500 text-white"
                       >
                         Proposer un service
                       </Button>
                     )}
                   </div>
                 </div>
               ) : (
                 <div className="space-y-4 mt-8">
                   {services.map((service) => (
                     <div 
                       key={service.id} 
                       onClick={() => handleServiceClick(service)}
                       className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-purple-600 cursor-pointer group"
                     >
                       <div className="flex items-start flex-col md:flex-row md:space-x-6 gap-4 md:gap-0">
                         {/* Photo de profil */}
                         <div className="h-16 w-16 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg border-2 border-gray-100 bg-white overflow-hidden">
                           {service.creator?.avatar_url ? (
                             <img 
                               src={service.creator.avatar_url} 
                               alt={`Photo de ${service.creator.full_name}`}
                               className="w-full h-full object-cover"
                             />
                           ) : (
                             <div className="w-full h-full bg-gradient-to-r from-purple-600 to-pink-500 rounded-full flex items-center justify-center">
                               <Package className="h-8 w-8 text-white" />
                             </div>
                           )}
                         </div>

                         {/* Contenu principal */}
                         <div className="flex-1 min-w-0">
                           <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-3">
                             <div className="flex-1">
                               <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                                 <h3 className="text-lg md:text-xl font-bold text-purple-600 group-hover:text-pink-500 transition-colors line-clamp-1">
                                   {service.title}
                                 </h3>
                                 {service.creator?.is_premium && (
                                   <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center">
                                     <Crown className="h-3 w-3 mr-1" />
                                     Premium
                                   </div>
                                 )}
                                 {service.is_urgent && (
                                   <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center animate-pulse">
                                     <Zap className="h-3 w-3 mr-1" />
                                     Express
                                   </div>
                                 )}
                               </div>
                               
                               <div className="flex flex-wrap items-center gap-2 md:gap-4 text-sm text-gray-600 mb-3">
                                 <span className="font-bold text-purple-600">{service.creator.full_name}</span>
                                 <span className="flex items-center">
                                   <MapPin className="h-4 w-4 mr-1" />
                                   {service.creator.location}
                                 </span>
                                 <span className="flex items-center">
                                   <Clock className="h-4 w-4 mr-1" />
                                   {getTimeAgo(service.created_at)}
                                 </span>
                                 <span className="flex items-center text-green-600">
                                   <Eye className="h-4 w-4 mr-1" />
                                   {service.views_count || 0} vues
                                 </span>
                               </div>

                               <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                                 {service.description?.substring(0, 150)}...
                               </p>

                               <div className="flex flex-wrap gap-2 mb-3">
                                 <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-bold rounded-full">
                                   {service.category}
                                 </span>
                                 {service.price_range && (
                                   <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center">
                                     <DollarSign className="h-3 w-3 mr-1" />
                                     {service.price_range}
                                   </span>
                                 )}
                                 
                                 {service.delivery_time && (
                                   <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full flex items-center">
                                     <Timer className="h-3 w-3 mr-1" />
                                     {service.delivery_time}
                                   </span>
                                 )}
                               </div>

                               {/* Compétences */}
                               {service.skills && service.skills.length > 0 && (
                                 <div className="flex flex-wrap gap-1 mb-3">
                                   {service.skills.slice(0, 4).map((skill, index) => (
                                     <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                       {skill}
                                     </span>
                                   ))}
                                   {service.skills.length > 4 && (
                                     <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                       {service.skills.length - 4} autres
                                     </span>
                                   )}
                                 </div>
                               )}
                             </div>

                             {/* Actions à droite */}
                             <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start mt-4 md:mt-0 md:space-y-3 md:ml-6">
                               {service.isCurrentUser ? (
                                 <button
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     navigate('/services/edit/' + service.id);
                                   }}
                                   className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-2 rounded-xl font-medium flex items-center space-x-2 hover:shadow-lg transform hover:scale-105 transition-all"
                                 >
                                   <Edit3 className="h-4 w-4" />
                                   <span>Modifier mon service</span>
                                 </button>
                               ) : (
                                 <>
                                   <div className="flex items-center text-purple-600 group-hover:text-pink-500 transition-colors">
                                     <span className="font-bold mr-2 text-sm">Voir le service</span>
                                     <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                   </div>
                                   
                                 </>
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
                <div className="bg-white rounded-2xl shadow-xl border-2 border-purple-600 p-6 flex-shrink-0">
                  {/* Desktop : Pagination complète */}
                  <div className="hidden md:flex items-center justify-center space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-3 border-2 border-purple-600 text-purple-600 hover:bg-purple-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      const page = Math.max(1, Math.min(totalPages, currentPage - 2 + i));
                      return (
                        <Button
                          key={page}
                          variant={page === currentPage ? "default" : "outline"}
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-3 font-bold ${
                            page === currentPage 
                              ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg' 
                              : 'border-2 border-purple-600 text-purple-600 hover:bg-purple-50'
                          }`}
                        >
                          {page}
                        </Button>
                      );
                    })}

                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-3 border-2 border-purple-600 text-purple-600 hover:bg-purple-50"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Mobile : Mini pagination (prev/next uniquement) */}
                  <div className="md:hidden flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center space-x-2 px-4 py-3 border-2 border-purple-600 text-purple-600 hover:bg-purple-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="font-bold">Précédent</span>
                    </Button>

                    <div className="flex items-center space-x-2 px-4 py-2 bg-purple-50 rounded-xl">
                      <span className="font-bold text-purple-600">{currentPage}</span>
                      <span className="text-gray-500">/</span>
                      <span className="text-gray-600">{totalPages}</span>
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="flex items-center space-x-2 px-4 py-3 border-2 border-purple-600 text-purple-600 hover:bg-purple-50"
                    >
                      <span className="font-bold">Suivant</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Compteur d'affichage - Desktop uniquement */}
                  <div className="hidden md:block text-center mt-4 text-sm text-gray-600">
                    Affichage de {((currentPage - 1) * servicesPerPage) + 1} à {Math.min(currentPage * servicesPerPage, totalServices)} sur {totalServices} services
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
               {/* Widget des derniers services */}
               <PremiumServicesWidget services={premiumServices.slice(0, 5)} onServiceClick={handleServiceClick} />

               {/* Widget Premium Employeur */}
               {isPremium ? (
                // Widget pour utilisateurs Premium
                <div className="bg-gradient-to-br from-job-purple to-job-pink rounded-2xl p-6 text-white shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold flex items-center">
                      <BadgeCheck className="h-5 w-5 mr-2" />
                      Premium Actif
                    </h3>
                    <Shield className="h-5 w-5 text-white/50" />
                  </div>
                  
                  <p className="text-white/90 text-sm mb-4">
                    Vous profitez de tous les avantages premium !
                  </p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <span>Contact direct illimité ✓</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Search className="h-4 w-4 mr-2" />
                      <span>Filtres avancés ✓</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Shield className="h-4 w-4 mr-2" />
                      <span>Services vérifiés ✓</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => navigate('/dashboard?tab=premium')}
                    className="w-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 font-bold py-3 rounded-xl transition-all border border-white/30"
                  >
                    Gérer mon abonnement
                  </button>
                </div>
              ) : (
                // Widget pour utilisateurs non-Premium (existant)
                <div className="bg-gradient-to-br from-job-gold via-job-orange to-job-dark-gold rounded-2xl p-6 text-white shadow-xl">
                  {/* Contenu existant inchangé */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold flex items-center">
                      <Crown className="h-5 w-5 mr-2" />
                      Profiter de Premium
                    </h3>
                    <Building className="h-5 w-5 text-white/50" />

                  </div>
                  <h3 className="text-2xl font-bold mb-3">
                    Contacter Direct
                  </h3>
                  <p className="text-black/90 mb-4">
                    Contacter directement les prestataires de services et prenez les meilleurs
                  </p>
                 
                  <PremiumButton 
                    variant="default"
                    className="w-full md:w-auto"
                  >
                    Passer au Premium
                  </PremiumButton>
                </div>
              )}

               {/* Widget Catégories populaires */}
               <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                 <div className="flex items-center mb-4">
                   <TrendingUp className="h-6 w-6 text-purple-600 mr-3" />
                   <h3 className="font-bold text-purple-600">Catégories Populaires</h3>
                 </div>
                 <div className="space-y-3">
                   {SERVICE_CATEGORIES.slice(0, 6).map((category, index) => {
                     const IconComponent = category.icon;
                     return (
                       <button
                         key={category.name}
                         onClick={() => handleFilterChange('category', category.name)}
                         className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-purple-50 transition-colors group"
                       >
                         <div className="flex items-center">
                           <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-purple-200 transition-colors">
                             <IconComponent className="h-4 w-4 text-purple-600" />
                           </div>
                           <span className="text-sm font-medium text-gray-700 group-hover:text-purple-600">
                             {category.name}
                           </span>
                         </div>
                         <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                       </button>
                     );
                   })}
                 </div>
               </div>

               {/* Widget aide et support */}
               <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                 <div className="text-center">
                   <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                     <MessageSquare className="h-8 w-8 text-purple-600" />
                   </div>
                   <h3 className="font-bold text-purple-600 mb-2">Besoin d'aide ?</h3>
                   <p className="text-gray-600 text-sm mb-4">
                     Notre équipe vous accompagne dans votre recherche de services
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

     {/* Modal Détails du Service */}
     <ServiceModal
       service={selectedService}
       isOpen={showServiceModal}
       onClose={() => setShowServiceModal(false)}
       isPremiumUser={isPremium}
       onContact={() => {
         setShowServiceModal(false);
         if (selectedService) handleContactClick(selectedService);
       }}
     />

     {/* ANCIEN MODAL INLINE SUPPRIMÉ — remplacé par ServiceModal */}
     {false && showServiceModal && selectedService && (
       <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
         <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-slide-up">
           
           {/* Header du modal */}
           <div className="bg-gradient-to-br from-job-gold via-job-orange to-job-dark-gold p-6 text-black relative overflow-hidden shrink-0">
             <div className="absolute inset-0 bg-black/10"></div>
             <div className="relative z-10">
               <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center space-x-4">
                   <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white/30 shadow-lg">
                     {selectedService.creator?.avatar_url ? (
                       <img 
                         src={selectedService.creator.avatar_url} 
                         alt={selectedService.creator.full_name}
                         className="w-full h-full object-cover"
                       />
                     ) : (
                       <div className="w-full h-full bg-white/20 flex items-center justify-center">
                         <Package className="h-8 w-8 text-white" />
                       </div>
                     )}
                   </div>
                   
                   <div>
                     <h2 className="text-2xl font-bold">{selectedService.title}</h2>
                     <p className="text-white/90 font-medium">Par {selectedService.creator.full_name}</p>
                     <div className="flex items-center mt-1 text-sm text-white/80">
                       <MapPin className="h-4 w-4 mr-1" />
                       {selectedService.creator.location}
                     </div>
                   </div>
                   {selectedService.creator?.is_premium && (
                     <span className="bg-gradient-to-br from-job-purple to-job-pink text-white px-4 py-2 rounded-full text-sm font-bold flex items-center">
                       <Crown className="h-4 w-4 mr-1" />
                       Prestataire Premium
                     </span>
                   )}
                 </div>
                 <button
                   onClick={closeModals}
                   className="p-2 hover:bg-white/20 rounded-full transition-colors"
                 >
                   <X className="h-6 w-6 text-white" />
                 </button>
               </div>

               <div className="flex flex-wrap items-center gap-3">
                 <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold">
                   {selectedService.category}
                 </span>
                 {selectedService.price_range && (
                   <span className="bg-green-400/30 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold flex items-center">
                     <DollarSign className="h-4 w-4 mr-1" />
                     {selectedService.price_range}
                   </span>
                 )}
                 {selectedService.delivery_time && (
                   <span className="bg-yellow-400/30 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold flex items-center">
                     <Timer className="h-4 w-4 mr-1" />
                     {selectedService.delivery_time}
                   </span>
                 )}
                 <span className="bg-blue-400/30 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold flex items-center">
                   <Eye className="h-4 w-4 mr-1" />
                   {selectedService.views_count || 0} vues
                 </span>
               </div>
             </div>
           </div>

           {/* Contenu scrollable */}
           <div className="overflow-y-auto flex-1">
             <div className="p-6">
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 
                 {/* Description principale */}
                 <div className="lg:col-span-2 space-y-6">
                   <div>
                     <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                       <FileText className="h-5 w-5 mr-2 text-purple-600" />
                       Description du service
                     </h3>
                     <div className="bg-gray-50 rounded-2xl p-4">
                     <FormattedText 
                      content={selectedService.description}
                      className="text-gray-700"
                    />
                     </div>
                   </div>

                   {/* Compétences */}
                   {selectedService.skills && selectedService.skills.length > 0 && (
                     <div>
                       <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                         <Award className="h-5 w-5 mr-2 text-purple-600" />
                         Compétences
                       </h3>
                       <div className="flex flex-wrap gap-2">
                         {selectedService.skills.map((skill, index) => (
                           <span 
                             key={index} 
                             className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium border border-purple-200"
                           >
                             {skill}
                           </span>
                         ))}
                       </div>
                     </div>
                   )}

                   {/* Informations supplémentaires */}
                   <div>
                     <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                       <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
                       Détails du service
                     </h3>
                     <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 space-y-3">
                       <div className="flex items-center justify-between">
                         <span className="text-gray-600 font-medium">Publié le</span>
                         <span className="font-bold text-purple-600">
                           {new Date(selectedService.created_at).toLocaleDateString('fr-FR')}
                         </span>
                       </div>
                       <div className="flex items-center justify-between">
                         <span className="text-gray-600 font-medium">Catégorie</span>
                         <span className="font-bold text-purple-600">{selectedService.category}</span>
                       </div>
                       {selectedService.delivery_time && (
                         <div className="flex items-center justify-between">
                           <span className="text-gray-600 font-medium">Délai de livraison</span>
                           <span className="font-bold text-green-600 flex items-center">
                             <Timer className="h-4 w-4 mr-1" />
                             {selectedService.delivery_time}
                           </span>
                         </div>
                       )}
                       {selectedService.price_range && (
                         <div className="flex items-center justify-between">
                           <span className="text-gray-600 font-medium">Fourchette de prix</span>
                           <span className="font-bold text-green-600 flex items-center">
                             <DollarSign className="h-4 w-4 mr-1" />
                             {selectedService.price_range}
                           </span>
                         </div>
                       )}
                     </div>
                   </div>
                 </div>

                 {/* Sidebar prestataire */}
                 <div className="space-y-6">
                   {/* Profil du prestataire */}
                   <div className="bg-gradient-to-br from-job-purple to-job-pink rounded-2xl border-2 border-purple-200 p-6 shadow-lg">
                     <div className="text-center mb-4">
                       <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-3 border-4 border-purple-200">
                         {selectedService.creator?.avatar_url ? (
                           <img 
                             src={selectedService.creator.avatar_url} 
                             alt={selectedService.creator.full_name}
                             className="w-full h-full object-cover"
                           />
                         ) : (
                           <div className="w-full h-full bg-gradient-to-r from-purple-600 to-pink-500 flex items-center justify-center">
                             <User className="h-10 w-10 text-black" />
                           </div>
                         )}
                       </div>
                       <h4 className="font-bold text-lg text-gray-900">{selectedService.creator.full_name}</h4>
                       <p className="text-white font-medium">{selectedService.creator.poste}</p>
                       <div className="flex items-center justify-center mt-2 text-sm text-gray-600">
                         <MapPin className="h-4 w-4 mr-1" />
                         {selectedService.creator.location}
                       </div>
                     </div>

                     {/* Bouton Contact */}
                      {/* Bouton Contact / Premium gate */}
                     {!selectedService.isCurrentUser && (
                       isPremium ? (
                         <button
                           onClick={() => handleContactClick(selectedService)}
                           className="mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-3 mb-4"
                         >
                           <MessageSquare className="h-5 w-5" />
                           <span>Contacter le prestataire</span>
                           <Sparkles className="h-5 w-5" />
                         </button>
                       ) : (
                         <div className="mx-auto w-full">
                           <div className="bg-white/70 text-gray-800 font-medium py-3 px-4 rounded-xl mb-3 text-center">
                             Passez en <span className="font-bold text-job-gold">Premium</span> pour contacter ce prestataire
                           </div>
                           <PremiumButton variant="default" className="w-full md:w-auto">
                             Passer au Premium
                           </PremiumButton>
                         </div>
                       )
                     )}

                   </div>

                   {/* Services similaires */}
                   <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                     <h4 className="font-bold text-purple-600 mb-4 flex items-center">
                       <Sparkles className="h-5 w-5 mr-2" />
                       Services similaires
                     </h4>
                     <div className="space-y-3">
                       {services.filter(s => s.category === selectedService.category && s.id !== selectedService.id).slice(0, 3).map((similarService) => (
                         <div key={similarService.id} className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                           <h5 className="font-medium text-gray-900 text-sm mb-1">{similarService.title}</h5>
                           <p className="text-xs text-gray-600">{similarService.creator.full_name}</p>
                           <div className="flex items-center justify-between mt-2">
                             <span className="text-xs text-purple-600 font-medium">{similarService.price_range}</span>
                             <ArrowRight className="h-3 w-3 text-gray-400" />
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           </div>
         </div>
       </div>
     )}

     {/* Modal Contact */}
     {showContactModal && selectedService && (
       <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
         <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
           
           {/* Header du modal contact */}
           <div className="bg-gradient-to-br from-job-gold via-job-orange to-job-dark-gold p-6 text-white relative overflow-hidden">
             <div className="absolute inset-0 bg-black/10"></div>
             <div className="relative z-10">
               <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center space-x-4">
                   <div className="w-12 h-12 bg-gradient-to-br from-job-purple to-job-pink backdrop-blur-sm rounded-full flex items-center justify-center">
                     <MessageSquare className="h-6 w-6 text-white" />
                   </div>
                   <div>
                     <h2 className="text-2xl font-bold">Contacter le prestataire</h2>
                     <p className="text-white/90">Envoyez un message à {selectedService.creator.full_name}</p>
                   </div>
                 </div>
                 <button
                   onClick={closeModals}
                   className="p-2 hover:bg-white/20 rounded-full transition-colors"
                 >
                   <X className="h-6 w-6 text-white" />
                 </button>
               </div>

               <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                 <div className="flex items-center space-x-3">
                   <Package className="h-5 w-5 text-white" />
                   <span className="font-medium">Service : {selectedService.title}</span>
                 </div>
               </div>
             </div>
           </div>

           {/* Formulaire de contact */}
           <div className="p-6">
             <div className="space-y-6">
               {/* Sujet */}
               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">
                   Sujet du message *
                 </label>
                 <input
                   type="text"
                   value={contactSubject}
                   onChange={(e) => setContactSubject(e.target.value)}
                   className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                   placeholder="Sujet de votre message..."
                 />
               </div>

               {/* Message */}
               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">
                   Votre message *
                 </label>
                 <textarea
                   value={contactMessage}
                   onChange={(e) => setContactMessage(e.target.value)}
                   rows={8}
                   className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                   placeholder="Décrivez votre projet, vos besoins, votre budget, vos délais..."
                 />
               </div>

               {/* Conseils */}
               <div className="none bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                 <h4 className="font-bold text-blue-700 mb-2 flex items-center">
                   <Lightbulb className="h-4 w-4 mr-2" />
                   Conseils pour un bon message
                 </h4>
                 <ul className="text-sm text-blue-600 space-y-1">
                   <li>• Soyez précis sur vos besoins et attentes</li>
                   <li>• Mentionnez votre budget approximatif</li>
                   <li>• Indiquez vos délais souhaités</li>
                   <li>• Restez professionnel et courtois</li>
                 </ul>
               </div>

               {/* Boutons d'action */}
               <div className="flex space-x-4 pt-4">
                 <button
                   onClick={closeModals}
                   className="flex-1 bg-gray-100 text-gray-700 font-bold py-4 px-6 rounded-xl hover:bg-gray-200 transition-all"
                 >
                   Annuler
                 </button>
                 <button
                   onClick={handleSendMessage}
                   disabled={sendMessageMutation.isLoading || !contactMessage.trim() || !contactSubject.trim()}
                   className="flex-1 bg-gradient-to-br from-job-purple to-job-pink text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                 >
                   {sendMessageMutation.isLoading ? (
                     <>
                       <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                       <span>Envoi en cours...</span>
                     </>
                   ) : (
                     <>
                       <MessageSquare className="h-5 w-5" />
                       <span>Envoyer le message</span>
                       <Rocket className="h-5 w-5" />
                     </>
                   )}
                 </button>
               </div>
             </div>
           </div>
         </div>
       </div>
     )}

     {/* Modal Partage */}
     {showShareModal && selectedService && (
       <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
         <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-slide-up">
           
           {/* Header du modal partage */}
           <div className="bg-gradient-to-br from-job-gold via-job-orange to-job-dark-gold p-6 text-white relative overflow-hidden">
             <div className="absolute inset-0 bg-black/10"></div>
             <div className="relative z-10">
               <div className="flex items-center justify-between mb-4">
                 <button
                   onClick={() => setShowShareModal(false)}
                   className="p-2 hover:bg-white/20 rounded-full transition-colors"
                 >
                   <X className="h-5 w-5 text-white" />
                 </button>
               </div>
             </div>
           </div>

           {/* Contenu du modal partage */}
           <div className="p-6">
             <div className="space-y-4">
               
               {/* Réseaux sociaux principaux */}
               <div>
                 <h3 className="font-bold text-gray-900 mb-3">Réseaux sociaux</h3>
                 <div className="grid grid-cols-2 gap-3">
                   
                   {/* Facebook */}
                   <button
                     onClick={() => shareToFacebook(selectedService)}
                     className="flex items-center space-x-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all group"
                   >
                     <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                       <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                         <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                       </svg>
                     </div>
                     <span className="font-medium text-blue-700 group-hover:text-blue-800">Facebook</span>
                   </button>

                   {/* LinkedIn */}
                   <button
                     onClick={() => shareToLinkedIn(selectedService)}
                     className="flex items-center space-x-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all group"
                   >
                     <div className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center">
                       <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                         <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                       </svg>
                     </div>
                     <span className="font-medium text-blue-700 group-hover:text-blue-800">LinkedIn</span>
                   </button>

                   {/* WhatsApp */}
                   <button
                     onClick={() => shareToWhatsApp(selectedService)}
                     className="flex items-center space-x-3 p-3 bg-green-50 hover:bg-green-100 rounded-xl transition-all group"
                   >
                     <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                       <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                         <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488"/>
                       </svg>
                     </div>
                     <span className="font-medium text-green-700 group-hover:text-green-800">WhatsApp</span>
                   </button>

                   {/* Twitter */}
                   <button
                     onClick={() => shareToTwitter(selectedService)}
                     className="flex items-center space-x-3 p-3 bg-sky-50 hover:bg-sky-100 rounded-xl transition-all group"
                   >
                     <div className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center">
                       <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                         <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                       </svg>
                     </div>
                     <span className="font-medium text-sky-700 group-hover:text-sky-800">Twitter</span>
                   </button>
                 </div>
               </div>

               {/* Autres options */}
               <div>
                 <h3 className="font-bold text-gray-900 mb-3">Autres options</h3>
                 <div className="space-y-2">
                   
                   {/* Telegram */}
                   <button
                     onClick={() => shareToTelegram(selectedService)}
                     className="w-full flex items-center space-x-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all group"
                   >
                     <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                       <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                         <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                       </svg>
                     </div>
                     <span className="font-medium text-blue-700 group-hover:text-blue-800">Telegram</span>
                   </button>

                   {/* Instagram */}
                   <button
                     onClick={() => shareToInstagram(selectedService)}
                     className="w-full flex items-center space-x-3 p-3 bg-pink-50 hover:bg-pink-100 rounded-xl transition-all group"
                   >
                     <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                       <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                         <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                       </svg>
                     </div>
                     <span className="font-medium text-pink-700 group-hover:text-pink-800">Instagram (Copier le lien)</span>
                   </button>

                   {/* Copier le lien */}
                   <button
                     onClick={() => copyToClipboard(selectedService)}
                     className="w-full flex items-center space-x-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all group"
                   >
                     <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                       <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                       </svg>
                     </div>
                     <span className="font-medium text-gray-700 group-hover:text-gray-800">Copier le lien</span>
                   </button>
                 </div>
               </div>

               {/* Aperçu du lien */}
               <div className="bg-gray-50 rounded-xl p-4">
                 <div className="text-xs text-gray-500 mb-2">Aperçu du lien :</div>
                 <div className="bg-white rounded-lg p-3 border">
                   <div className="text-sm font-medium text-gray-900 mb-1">{selectedService.title}</div>
                   <div className="text-xs text-gray-600 mb-2">Par {selectedService.creator.full_name} • {selectedService.creator.location}</div>
                   <div className="text-xs text-blue-600 break-all">{generateServiceUrl(selectedService)}</div>
                 </div>
               </div>
             </div>
           </div>
         </div>
       </div>
     )}

     {/* Styles CSS */}
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

       .animate-fade-in {
         animation: fadeIn 0.3s ease-out;
       }

       .animate-slide-up {
         animation: slideUp 0.4s ease-out;
       }

       .job-purple { color: #8B5CF6; }
       .job-pink { color: #EC4899; }
       .job-blue { color: #3B82F6; }
       .job-gold { background: linear-gradient(135deg, #F59E0B, #D97706); }
       .job-orange { background: linear-gradient(135deg, #EA580C, #DC2626); }
       .job-dark-gold { background: linear-gradient(135deg, #B45309, #92400E); }
       
       
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

       /* Scrollbar personnalisée pour la liste des services */
.flex-1.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.flex-1.overflow-y-auto::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 10px;
}

.flex-1.overflow-y-auto::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
  border-radius: 10px;
}

.flex-1.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #7C3AED 0%, #DB2777 100%);
}

/* Desktop : Scroll fixe avec pagination sticky */
@media (min-width: 769px) {
  /* Container principal avec hauteur fixe */
  div[style*="width: 70%"] {
    display: flex !important;
    flex-direction: column !important;
    height: calc(100vh - 96px) !important;
    position: sticky !important;
    top: 96px !important;
  }

  /* Zone scrollable */
  div[style*="width: 70%"] .flex-1.overflow-y-auto {
    min-height: 0 !important;
  }
}

/* Mobile : Comportement normal sans scroll fixe */
@media (max-width: 768px) {
  /* Désactiver le flex column fixe */
  div[style*="width: 70%"] {
    display: block !important;
    height: auto !important;
    position: relative !important;
    top: auto !important;
  }

  /* Désactiver le scroll fixe */
  div[style*="width: 70%"] .flex-1.overflow-y-auto {
    overflow-y: visible !important;
    max-height: none !important;
  }

  /* Pagination normale (pas sticky) */
  div[style*="width: 70%"] .flex-shrink-0 {
    position: relative !important;
  }
}
/* ============================================ */
/* MOBILE - ENLEVER TOUS LES PADDING/MARGIN */
/* ============================================ */

@media (max-width: 768px) {
  /* Container principal - 0 padding */
  div[style*="padding: 0 16px 32px 16px"] {
    padding: 0 !important;
  }

  div[style*="padding: 32px 16px 24px 16px"] {
    padding: 0 !important;
  }

  /* Containers avec maxWidth - 0 padding/margin */
  div[style*="maxWidth"][style*="margin"] {
    padding-left: 0 !important;
    padding-right: 0 !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
  }

  /* Colonne centrale - PLEINE LARGEUR */
  div[style*="width: 70%"] {
    width: 100% !important;
    padding: 0 !important;
    margin: 0 10 10 !important;
  }

  /* Enlever padding de la zone scrollable */
  div[style*="width: 70%"] .flex-1.overflow-y-auto {
    padding: 0 !important;
    margin: 0 !important;
  }

  /* Container de cartes - pleine largeur */
  div[style*="width: 70%"] .space-y-4 {
    width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  /* Chaque carte - 100% de largeur, pas de margin externe */
  div[style*="width: 70%"] .space-y-4 > div {
    width: 100% !important;
    max-width: 100% !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
    
  }

  /* Header stats - pleine largeur */
  div[style*="width: 70%"] .top1 {
    width: 100% !important;
    margin: 0 !important;
    padding: 16px !important;
    border-radius: 0 !important;
  }

  /* ============================================ */
/* MOBILE - BOUTON FERMER MODAL VISIBLE */
/* ============================================ */

@media (max-width: 768px) {
  /* Modal - ajuster la taille */
  .fixed.inset-0 > div {
    max-width: 95vw !important;
    max-height: 95vh !important;
    margin: auto !important;
  }

  /* Header du modal - assurer que le bouton X est visible */
  .bg-gradient-to-br.from-job-gold.via-job-orange.to-job-dark-gold,
  .bg-gradient-to-br.from-purple-600.to-pink-500 {
    position: relative !important;
    padding: 16px !important;
  }

  /* Bouton fermer - toujours visible et accessible */
  .bg-gradient-to-br button[class*="hover:bg-white/20"] {
    position: absolute !important;
    top: 12px !important;
    right: 12px !important;
    z-index: 9999 !important;
    background: rgba(0, 0, 0, 0.3) !important;
    padding: 8px !important;
    border-radius: 50% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }

  /* Icône X - visible sur fond coloré */
  .bg-gradient-to-br button[class*="hover:bg-white/20"] svg {
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
  }

  /* Titre du modal - laisser de l'espace pour le bouton X */
  .bg-gradient-to-br h2 {
    padding-right: 48px !important;
    font-size: 1.25rem !important;
  }

  /* Container du header - flex wrap pour mobile */
  .bg-gradient-to-br .flex.items-center.justify-between {
    flex-wrap: wrap !important;
    gap: 12px !important;
  }

  /* Avatar dans le modal - plus petit sur mobile */
  .bg-gradient-to-br .w-16.h-16 {
    width: 48px !important;
    height: 48px !important;
  }

  .bg-gradient-to-br .w-12.h-12 {
    width: 40px !important;
    height: 40px !important;
  }

  /* Contenu scrollable du modal */
  .overflow-y-auto.flex-1 {
    max-height: calc(95vh - 200px) !important;
  }

  /* Padding du contenu modal */
  .overflow-y-auto.flex-1 .p-6 {
    padding: 16px !important;
  }

  /* Grille modal - single column sur mobile */
  .grid.grid-cols-1.lg\\:grid-cols-3 {
    grid-template-columns: 1fr !important;
    gap: 16px !important;
  }
}

  /* Pagination - pleine largeur */
  div[style*="width: 70%"] .bg-white.rounded-2xl.shadow-xl.border-2.border-purple-600.p-6 {
    width: 100% !important;
    margin: 0 !important;
    padding: 16px !important;
    border-radius: 0 !important;
  }

  /* Message vide - pleine largeur */
  .text-center.py-16 {
    width: 100% !important;
    margin: 0 !important;
    padding: 32px 16px !important;
  }

  /* Skeleton loader - pleine largeur */
  .animate-pulse {
    width: 100% !important;
    margin: 0 !important;
  }
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
       display:none;
       }
       .top1{
       margin-top: 80px;
       }
         div[style*="width: 25%"], div[style*="width: 50%"] {
           width: 100% !important;
         }

         .sticky {
           position: relative !important;
         }

         .fixed.inset-0 {
           padding: 1rem;
         }

         .max-w-4xl, .max-w-2xl {
           max-width: 100% !important;
         }

         .grid.grid-cols-1.lg\\:grid-cols-3 {
           grid-template-columns: 1fr !important;
         }

         .text-2xl {
           font-size: 1.5rem !important;
         }

         .p-6 {
           padding: 1rem !important;
         }
       }
     `}</style>
   </div>
 );
};

export default Services;