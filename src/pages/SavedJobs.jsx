import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Heart,
  MapPin,
  Clock,
  Building,
  Eye,
  ExternalLink,
  Trash2,
  Search,
  Filter,
  Star,
  Zap,
  ChevronRight,
  Calendar,
  Briefcase,
  ArrowLeft,
  Users,
  BookmarkX,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { databases, DATABASE_ID } from '@/lib/appwrite';
import { Query } from 'appwrite';
import Footer from '@/components/layout/Footer';

const SavedJobs = () => {
  const { user, isCandidate } = useAuth();
  const navigate = useNavigate();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [removingJobId, setRemovingJobId] = useState(null);

  useEffect(() => {
    if (!user || !isCandidate) {
      navigate('/login', {
        state: { message: 'Connectez-vous en tant que candidat pour voir vos offres sauvegardées' }
      });
      return;
    }

    loadSavedJobs();
    loadCategories();
  }, [user, isCandidate, navigate]);

  const loadSavedJobs = async () => {
    try {
      setLoading(true);
      
      // Récupérer les offres sauvegardées avec Appwrite
      const savedJobsResponse = await databases.listDocuments(
        DATABASE_ID,
        'saved_jobs',
        [
          Query.equal('candidate_id', user.$id),
          Query.orderDesc('$createdAt')
        ]
      );

      // Pour chaque offre sauvegardée, récupérer les détails de l'offre et du profil employeur
      const savedJobsWithDetails = await Promise.all(
        savedJobsResponse.documents.map(async (savedJob) => {
          try {
            // Récupérer les détails de l'offre
            const job = await databases.getDocument(
              DATABASE_ID,
              'jobs',
              savedJob.job_id
            );

            // Vérifier si l'offre est active
            if (!job.is_active) {
              return null;
            }

            // Récupérer le profil de l'employeur
            let employerProfile = null;
            try {
              employerProfile = await databases.getDocument(
                DATABASE_ID,
                'profiles',
                job.employer_id
              );
            } catch (error) {
              console.warn('Profil employeur non trouvé:', error);
            }

            return {
              ...savedJob,
              jobs: {
                ...job,
                profiles: employerProfile
              }
            };
          } catch (error) {
            console.warn('Erreur lors du chargement de l\'offre:', savedJob.job_id, error);
            return null;
          }
        })
      );

      // Filtrer les résultats null (offres supprimées ou inactives)
      const validSavedJobs = savedJobsWithDetails.filter(item => item !== null);
      setSavedJobs(validSavedJobs);

    } catch (error) {
      console.error('Erreur lors du chargement des offres sauvegardées:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        'job_categories',
        [
          Query.equal('is_active', true),
          Query.orderAsc('name')
        ]
      );
      
      setCategories(response.documents || []);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
    }
  };

  const handleRemoveJob = async (jobId, savedJobId) => {
    if (!confirm('Êtes-vous sûr de vouloir retirer cette offre de vos favoris ?')) {
      return;
    }

    setRemovingJobId(jobId);

    try {
      await databases.deleteDocument(
        DATABASE_ID,
        'saved_jobs',
        savedJobId
      );

      // Mettre à jour la liste localement
      setSavedJobs(prev => prev.filter(item => item.$id !== savedJobId));
      
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression');
    } finally {
      setRemovingJobId(null);
    }
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

  const filteredJobs = savedJobs.filter(savedJob => {
    const job = savedJob.jobs;
    if (!job) return false;

    const matchesSearch = !searchTerm || 
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = !selectedCategory || job.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
        <Navbar />
        <div className="pt-32 pb-16">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-job-gold border-r-job-pink mx-auto mb-4"></div>
                  <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-job-gold to-job-pink opacity-20"></div>
                </div>
                <p className="text-job-brown font-medium">Chargement de vos offres sauvegardées...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      <Navbar />
      
      {/* Header magnifique */}
      <section className="pt-32 pb-16 bg-gradient-to-r from-job-gold via-yellow-400 to-job-pink relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="h-full w-full" style={{
            backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.2) 2px, transparent 2px)',
            backgroundSize: '30px 30px'
          }}></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Retour</span>
            </button>
            <ChevronRight className="h-4 w-4 text-white/60" />
            <span className="text-white/90">Offres sauvegardées</span>
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Heart className="h-12 w-12 text-white fill-current" />
              </div>
            </div>
            
            <h1 className="text-5xl font-bold text-white mb-4">
              ✨ Mes Offres Favorites
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Retrouvez toutes les offres d'emploi que vous avez sauvegardées
            </p>
            
            {/* Statistiques */}
            <div className="flex items-center justify-center space-x-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{savedJobs.length}</div>
                <div className="text-white/80 text-sm">Offres sauvegardées</div>
              </div>
              <div className="h-12 w-px bg-white/30"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{filteredJobs.length}</div>
                <div className="text-white/80 text-sm">Résultats filtrés</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filtres */}
      <section className="py-8 bg-white shadow-lg">
        <div className="flex items-center justify-center space-x-8 container mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Recherche */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Rechercher dans vos favoris..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-job-gold/20 focus:border-job-gold transition-all"
              />
            </div>

            {/* Filtre catégorie */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-12 pr-8 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-job-gold/20 focus:border-job-gold transition-all bg-white min-w-[200px]"
              >
                <option value="">Toutes les catégories</option>
                {categories.map(category => (
                  <option key={category.name} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Bouton reset */}
            {(searchTerm || selectedCategory) && (
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                }}
                variant="outline"
                className="border-job-gold text-job-gold hover:bg-job-gold hover:text-white"
              >
                Réinitialiser
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Contenu principal */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          {filteredJobs.length === 0 ? (
            /* État vide */
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="relative mb-8">
                  <div className="w-32 h-32 bg-gradient-to-br from-job-gold to-job-pink rounded-full mx-auto flex items-center justify-center shadow-2xl">
                    <BookmarkX className="h-16 w-16 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-job-pink to-purple-500 rounded-full flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {savedJobs.length === 0 ? 'Aucune offre sauvegardée' : 'Aucun résultat'}
                </h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  {savedJobs.length === 0 
                    ? 'Vous n\'avez pas encore sauvegardé d\'offres d\'emploi. Explorez nos offres et cliquez sur le cœur pour les ajouter à vos favoris !'
                    : 'Aucune offre ne correspond à vos critères de recherche. Essayez de modifier vos filtres.'
                  }
                </p>
                
                <div className="space-y-4">
                  <Button
                    onClick={() => navigate('/jobs')}
                    className="bg-gradient-to-r from-job-gold to-job-pink hover:from-job-pink hover:to-job-gold text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                  >
                    <Search className="h-5 w-5 mr-2" />
                    Explorer les offres
                  </Button>
                  
                  {savedJobs.length > 0 && (
                    <Button
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('');
                      }}
                      variant="outline"
                      className="border-job-gold text-job-gold hover:bg-job-gold hover:text-white"
                    >
                      Réinitialiser les filtres
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Liste des offres */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredJobs.map((savedJob) => {
                const job = savedJob.jobs;
                const employer = job.profiles;
                
                return (
                  <div
                    key={savedJob.$id}
                    className="group bg-white rounded-3xl shadow-xl border-2 border-gray-100 hover:border-job-gold transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-2 overflow-hidden"
                  >
                    {/* Header de la carte */}
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          {/* Logo entreprise */}
                          <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg border-2 border-gray-100 bg-white overflow-hidden">
                            {employer?.company_logo_url ? (
                              <img 
                                src={employer.company_logo_url} 
                                alt={`Logo ${job.company_name}`}
                                className="w-full h-full object-contain p-2"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.parentNode.querySelector('.fallback-icon').style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className={`fallback-icon w-full h-full bg-gradient-to-r from-job-gold to-job-pink rounded-xl flex items-center justify-center ${employer?.company_logo_url ? 'hidden' : 'flex'}`}>
                              <Building className="h-8 w-8 text-white" />
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-bold text-gray-900 text-lg line-clamp-1 group-hover:text-job-gold transition-colors">
                                {job.title}
                              </h3>
                              {job.is_featured && (
                                <Star className="h-4 w-4 text-yellow-500 fill-current flex-shrink-0" />
                              )}
                              {job.is_urgent && (
                                <Zap className="h-4 w-4 text-red-500 flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-job-gold font-semibold text-sm">{job.company_name}</p>
                          </div>
                        </div>

                        {/* Bouton supprimer */}
                        <button
                          onClick={() => handleRemoveJob(job.$id, savedJob.$id)}
                          disabled={removingJobId === job.$id}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Retirer des favoris"
                        >
                          {removingJobId === job.$id ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-red-500 border-t-transparent"></div>
                          ) : (
                            <Trash2 className="h-5 w-5" />
                          )}
                        </button>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="px-3 py-1 bg-job-cream text-job-brown text-xs font-medium rounded-full border border-job-gold">
                          {job.category}
                        </span>
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
                          {job.contract_type?.toUpperCase() || 'CDI'}
                        </span>
                        {job.remote_work && (
                          <span className="px-3 py-1 bg-purple-50 text-purple-600 text-xs font-medium rounded-full">
                            Remote
                          </span>
                        )}
                      </div>

                      {/* Informations */}
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-job-gold" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-gray-400" />
                          <span>Publié {getTimeAgo(job.$createdAt)}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          <span>Sauvegardé {getTimeAgo(savedJob.$createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="p-6">
                      <div 
                        className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4"
                        dangerouslySetInnerHTML={{ 
                          __html: job.description?.replace(/<[^>]*>/g, '').substring(0, 150) + '...' || 'Aucune description disponible'
                        }}
                      />

                      {/* Actions */}
                      <div className="flex gap-3">
                        <Link
                          to={`/jobs/${job.$id}`}
                          className="flex-1 bg-gradient-to-r from-job-gold to-job-pink hover:from-job-pink hover:to-job-gold text-white py-3 px-4 rounded-xl font-semibold text-center transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                        >
                          <Eye className="h-4 w-4 inline mr-2" />
                          Voir l'offre
                        </Link>
                        
                        {employer?.website_url && (
                          <a
                            href={employer.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 border-2 border-job-gold text-job-gold hover:bg-job-gold hover:text-white rounded-xl transition-all"
                            title="Site web de l'entreprise"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />

      {/* Styles CSS personnalisés */}
      <style>{`
        .job-gold { color: #D4AF37; }
        .job-pink { color: #EC4899; }
        .job-brown { color: #8B4513; }
        .job-cream { background-color: #FEF9E7; }

        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-in-up {
          animation: slideInUp 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SavedJobs;