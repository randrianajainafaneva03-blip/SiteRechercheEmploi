import React, { useState, useEffect } from 'react';
import VerifiedBadge from '@/components/ui/VerifiedBadge';
import { emailService } from '@/components/services/emailService';
import DirectMessageModal from '@/components/messaging/DirectMessageModal';
import {
  X,
  MapPin,
  Calendar,
  Briefcase,
  Mail,
  Phone,
  ExternalLink,
  Download,
  Star,
  Eye,
  Shield,
  Award,
  User,
  GraduationCap,
  Clock,
  Heart,
  Share2,
  MessageSquare,
  Linkedin,
  Globe,
  CheckCircle,
  Zap,
  Target,
  TrendingUp,
  Crown,
  Building2,
  FileText,
  Send,
  Lock,
  Sparkles,
  Code
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { databases, DATABASE_ID, Query, ID } from '@/lib/appwrite';
import { useNavigate } from 'react-router-dom';

interface ProfileModalProps {
  demand: any;
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ demand, isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [viewsCount, setViewsCount] = useState(demand?.views_count || 0);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [showDirectMessageModal, setShowDirectMessageModal] = useState(false);
  const { user, profile, isEmployer, isCandidate } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && demand && user) {
      const profileId = demand.$id || demand.id;
      const userId = user.$id;
      
      if (profileId && userId) {
        incrementViews().catch(console.error);
        checkIfFavorite().catch(console.error);
      }
    }
  }, [isOpen, demand, user]);

  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      return () => {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  const incrementViews = async () => {
    if (!demand || !user) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const existingViews = await databases.listDocuments(
        DATABASE_ID,
        'profile_views',
        [
          Query.equal('profile_id', demand.$id || demand.id),
          Query.equal('viewer_id', user.$id),
          Query.greaterThanEqual('created_at', today)
        ]
      );

      if (existingViews.documents.length === 0) {
        await databases.createDocument(
          DATABASE_ID,
          'profile_views',
          ID.unique(),
          {
            profile_id: demand.$id || demand.id,
            viewer_id: user.$id,
            created_at: new Date().toISOString()
          }
        );

        setViewsCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Erreur lors de l\'incrémentation des vues:', error);
    }
  };

  const checkIfFavorite = async () => {
    if (!demand || !user) return;

    try {
      const favorites = await databases.listDocuments(
        DATABASE_ID,
        'favorites',
        [
          Query.equal('profile_id', demand.$id || demand.id),
          Query.equal('user_id', user.$id),
          Query.limit(1)
        ]
      );

      setIsFavorite(favorites.documents.length > 0);
    } catch (error) {
      console.error('Erreur lors de la vérification des favoris:', error);
      setIsFavorite(false);
    }
  };

  const toggleFavorite = async () => {
    if (!demand || !user) return;

    try {
      if (isFavorite) {
        const favorites = await databases.listDocuments(
          DATABASE_ID,
          'favorites',
          [
            Query.equal('profile_id', demand.$id || demand.id),
            Query.equal('user_id', user.$id)
          ]
        );

        if (favorites.documents.length > 0) {
          await databases.deleteDocument(
            DATABASE_ID,
            'favorites',
            favorites.documents[0].$id
          );
        }
      } else {
        await databases.createDocument(
          DATABASE_ID,
          'favorites',
          ID.unique(),
          {
            profile_id: demand.$id || demand.id,
            user_id: user.$id,
            created_at: new Date().toISOString()
          }
        );
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Erreur lors de la gestion des favoris:', error);
    }
  };

  const handleSendMessage = () => {
    setShowDirectMessageModal(true);
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - new Date(date).getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Aujourd\'hui';
    if (diffDays === 2) return 'Hier';
    if (diffDays <= 7) return `Il y a ${diffDays} jours`;
    if (diffDays <= 30) return `Il y a ${Math.ceil(diffDays / 7)} semaines`;
    return `Il y a ${Math.ceil(diffDays / 30)} mois`;
  };

  // Modal Premium
  const PremiumModal = () => (
    <div className="fixed inset-0 z-[60] overflow-hidden">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowPremiumModal(false)} />
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
          <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 p-6 rounded-t-3xl">
            <div className="text-center">
              <Crown className="h-16 w-16 text-white mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Passez Premium</h3>
              <p className="text-white/90">Débloquez toutes les fonctionnalités</p>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-4 mb-6">
              <div className="flex items-center">
                <MessageSquare className="h-5 w-5 text-yellow-500 mr-3" />
                <span className="text-gray-700">Messages illimités</span>
              </div>
              <div className="flex items-center">
                <Eye className="h-5 w-5 text-yellow-500 mr-3" />
                <span className="text-gray-700">Accès aux contacts</span>
              </div>
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-yellow-500 mr-3" />
                <span className="text-gray-700">Profil vérifié</span>
              </div>
              <div className="flex items-center">
                <Sparkles className="h-5 w-5 text-yellow-500 mr-3" />
                <span className="text-gray-700">Visibilité premium</span>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button
                onClick={() => setShowPremiumModal(false)}
                variant="outline"
                className="flex-1"
              >
                Plus tard
              </Button>
              <Button
                onClick={() => navigate('/premium')}
                className="flex-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-white"
              >
                Passer Premium
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isOpen || !demand) return null;

  return (
    <>
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 15s ease infinite;
        }
      `}</style>

      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          onClick={onClose}
        />
        
        <div className="flex items-center justify-center min-h-screen p-4">
          <div 
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-5xl my-8"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* HEADER MAGNIFIQUE - Fond noir premium */}
<div className="relative">
  {/* Photo de couverture avec fond noir */}
  <div className="h-56 relative overflow-hidden bg-black">
    {/* Bordure dorée en haut */}
    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
    
    {/* Logo centré */}
    <div className="absolute inset-0 flex items-center justify-center">
      <img 
        src="/logo.png"
        alt="Job2mada"
        className=" object-contain opacity-95 drop-shadow-[0_0_30px_rgba(251,191,36,0.3)]"
      />
    </div>
    
    {/* Overlay gradient doré très subtil */}
    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-orange-500/5"></div>
    
    {/* Motif géométrique subtil */}
    <div className="absolute inset-0 opacity-5" style={{
      backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 20px)'
    }}></div>
    
    {/* Bouton fermer */}
    <button
      onClick={onClose}
      className="absolute top-6 right-6 w-12 h-12 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 backdrop-blur-md rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-110 z-20 border border-yellow-500/30"
    >
      <X className="h-6 w-6 text-white" />
    </button>
  </div>

              {/* Profil CENTRÉ */}
              <div className="px-8 pb-6">
                <div className="flex flex-col items-center -mt-20 relative z-10">
                  {/* Photo de profil */}
                  <div className="relative mb-6">
                    <div className="w-40 h-40 rounded-full border-6 border-white shadow-2xl overflow-hidden bg-white ring-4 ring-amber-100">
                      {demand.avatar_url ? (
                        <img src={demand.avatar_url} alt={demand.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-yellow-400 via-orange-500 to-amber-600 flex items-center justify-center">
                          <User className="h-20 w-20 text-white" />
                        </div>
                      )}
                    </div>
                    
                    {/* Badge vérifié */}
                    {demand.is_verified && (
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-1.5 shadow-lg">
                        <CheckCircle className="h-10 w-10 text-blue-500" fill="currentColor" />
                      </div>
                    )}
                    
                    {/* Badge Premium */}
                    {demand.is_premium && (
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-full px-3 py-1.5 shadow-lg border-3 border-white flex items-center space-x-1">
                        <Crown className="h-4 w-4" />
                        <span className="text-xs font-bold">PRO</span>
                      </div>
                    )}
                  </div>

                  {/* Nom + Titre */}
                  <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{demand.full_name}</h1>
                    <h2 className="text-xl text-orange-600 font-semibold mb-4">{demand.title}</h2>
                    
                    {/* Tags */}
                    <div className="flex items-center justify-center space-x-2 mb-4">
                      {demand.is_premium && (
                        <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-4 py-1.5 rounded-full text-sm font-bold flex items-center shadow-md">
                          <Crown className="h-4 w-4 mr-1.5" />Premium
                        </div>
                      )}
                      {demand.is_urgent && (
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-1.5 rounded-full text-sm font-bold flex items-center animate-pulse shadow-md">
                          <Zap className="h-4 w-4 mr-1.5" />Disponible
                        </div>
                      )}
                      {demand.is_featured && (
                        <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white px-4 py-1.5 rounded-full text-sm font-bold flex items-center shadow-md">
                          <Star className="h-4 w-4 mr-1.5" />Talent
                        </div>
                      )}
                    </div>
                    
                    {/* Méta-infos */}
                    <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-gray-600">
                      <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-full">
                        <MapPin className="h-4 w-4 text-orange-500" />
                        <span className="font-medium">{demand.location}</span>
                      </div>
                      <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-full">
                        <Briefcase className="h-4 w-4 text-amber-600" />
                        <span>{demand.experience}</span>
                      </div>
                      <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-full">
                        <Clock className="h-4 w-4 text-green-500" />
                        <span>{demand.availability}</span>
                      </div>
                      <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-full">
                        <Eye className="h-4 w-4 text-blue-500" />
                        <span>{viewsCount} vues</span>
                      </div>
                      <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-full">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{getTimeAgo(demand.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Boutons d'action */}
                  {demand.id !== user?.$id && (
                    <div className="flex items-center space-x-3">
                      {/* ✅ BOUTON MESSAGE SEULEMENT SI PREMIUM */}
                      {profile?.is_premium && (
                        <Button 
                          onClick={handleSendMessage}
                          className="bg-gradient-to-r from-orange-500 to-amber-600 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all font-bold"
                        >
                          <Send className="h-5 w-5 mr-2" />Envoyer un message
                        </Button>
                      )}
                      
                      {/* Bouton favoris (disponible pour tous) */}
                      <button
                        onClick={toggleFavorite}
                        className={`p-3 rounded-full shadow-lg transition-all transform hover:scale-110 ${
                          isFavorite ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                      </button>
                      
                      {/* Bouton partager (disponible pour tous) */}
                      <button className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-all transform hover:scale-110">
                        <Share2 className="h-5 w-5 text-gray-600" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* CONTENU SCROLLABLE */}
            <div className="max-h-[60vh] overflow-y-auto px-8 pb-8 space-y-6">
              
              {/* À propos */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border-2 border-orange-100">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl flex items-center justify-center">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">À propos</h3>
                </div>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line text-justify">
                  {demand.description || 'Aucune description disponible.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Expérience */}
                <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-400 rounded-xl flex items-center justify-center">
                      <Briefcase className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Expérience professionnelle</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <Award className="h-5 w-5 text-orange-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-gray-900">{demand.category}</p>
                        <p className="text-sm text-gray-600">{demand.experience}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 mt-3">
                      <Clock className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600">Disponibilité</p>
                        <p className={`font-semibold ${demand.availability === 'Immédiate' ? 'text-green-600' : 'text-blue-600'}`}>
                          {demand.availability}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Compétences */}
                {demand.skills && demand.skills.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-teal-400 rounded-xl flex items-center justify-center">
                        <Code className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Compétences</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {demand.skills.map((skill: string, index: number) => (
                        <span key={index} className="px-4 py-2 bg-gradient-to-r from-green-100 to-teal-100 text-green-700 rounded-full text-sm font-medium border border-green-200">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Contact */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border-2 border-amber-100">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Contact</h3>
                </div>
                
                {/* CAS 1 : C'EST SON PROPRE PROFIL */}
                {demand.id === user?.$id ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="h-8 w-8 text-orange-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">C'est votre profil</h4>
                    <p className="text-gray-600 mb-4">Vous consultez votre propre profil</p>
                    <Button onClick={() => navigate('/profile')} className="bg-orange-600 text-white">
                      Modifier mon profil
                    </Button>
                  </div>
                ) : (
                  /* CAS 2 : PROFIL D'UN AUTRE UTILISATEUR */
                  <div className="text-center py-8">
                    {/* ✅ SI L'UTILISATEUR CONNECTÉ EST PREMIUM */}
                    {profile?.is_premium ? (
                      <>
                        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Send className="h-8 w-8 text-white" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          Contacter {demand.full_name}
                        </h4>
                        <p className="text-gray-600 mb-4">
                          Envoyez un message direct via notre messagerie sécurisée
                        </p>
                        <Button 
                          onClick={handleSendMessage}
                          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold px-8 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all"
                        >
                          <Send className="h-5 w-5 mr-2" />
                          Envoyer un message
                        </Button>
                      </>
                    ) : (
                      /* ❌ SI L'UTILISATEUR N'EST PAS PREMIUM */
                      <>
                        <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Lock className="h-8 w-8 text-amber-600" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          🔒 Fonctionnalité Premium
                        </h4>
                        <p className="text-gray-600 mb-6">
                          Passez <strong>Premium</strong> pour contacter directement {demand.full_name} et débloquer toutes les fonctionnalités
                        </p>
                        
                        {/* Liste des avantages */}
                        <div className="bg-white rounded-xl p-4 mb-6 text-left max-w-sm mx-auto border-2 border-amber-200">
                          <div className="space-y-3">
                            <div className="flex items-center text-sm">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                                <MessageSquare className="h-4 w-4 text-green-600" />
                              </div>
                              <span className="text-gray-700 font-medium">Messages illimités</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                                <Eye className="h-4 w-4 text-blue-600" />
                              </div>
                              <span className="text-gray-700 font-medium">Accès aux contacts directs</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                                <Sparkles className="h-4 w-4 text-yellow-600" />
                              </div>
                              <span className="text-gray-700 font-medium">Visibilité maximale</span>
                            </div>
                          </div>
                        </div>
                        
                        <Button 
                          onClick={() => setShowPremiumModal(true)}
                          className="bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-white font-bold px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all text-lg"
                        >
                          <Crown className="h-5 w-5 mr-2" />
                          Passer Premium
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>

      {showDirectMessageModal && (
        <DirectMessageModal
          isOpen={showDirectMessageModal}
          onClose={() => setShowDirectMessageModal(false)}
          otherUserData={{
            id: demand.id,
            name: demand.full_name,
            email: demand.email,
            avatar: demand.avatar_url,
            user_type: demand.user_type || 'candidate',
            is_premium: demand.is_premium || false
          }}
          contextType="profile"
        />
      )}

      {showPremiumModal && <PremiumModal />}
    </>
  );
};

export default ProfileModal;