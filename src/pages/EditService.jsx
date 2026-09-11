import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  AlertCircle,
  CheckCircle,
  DollarSign,
  Timer,
  Tag,
  FileText,
  Plus,
  X,
  Loader2,
  Edit3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import SkillsAutocomplete from '@/components/ui/SkillsAutocomplete';
import SimpleRichEditor from '@/components/ui/SimpleRichEditor';

// ✅ IMPORTER LES HOOKS APPWRITE
import { useAppwriteQuery, useAppwriteMutation } from '@/hooks/useAppwriteQuery';
import { serviceService } from '@/lib/appwrite';
import PortfolioEditor from '@/components/ui/PortfolioEditor';

const SERVICE_CATEGORIES = [
  'Développement Web', 'Design Graphique', 'Marketing Digital', 'Rédaction',
  'Traduction', 'Photographie', 'Montage Vidéo', 'Comptabilité', 
  'Conseil', 'Formation', 'Maintenance', 'Réparation'
];

const EditService = () => {
  const navigate = useNavigate();
  const { serviceId } = useParams();
  const { user, profile, isCandidate } = useAuth();
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price_range: '',
    delivery_time: '',
    skills: [],
    youtube_url: '',
    video_description: '',
    portfolio: [],
  });

  // ✅ HOOK POUR RÉCUPÉRER LE SERVICE AVEC APPWRITE
  const { 
    data: service, 
    isLoading: loadingService, 
    error: serviceError 
  } = useAppwriteQuery(
    ['service', serviceId],
    async () => {
      if (!serviceId || !user?.$id) {
        throw new Error('ID de service ou utilisateur manquant');
      }
      
      // Récupérer le service par son ID et vérifier que l'utilisateur est le créateur
      const result = await serviceService.getServiceById(serviceId);
      const data = result?.data || result;

      if (data.creator_id !== user.$id) {
        throw new Error('Vous n\'êtes pas autorisé à modifier ce service');
      }

      return data;
    },
    {
      enabled: !!(serviceId && user?.$id),
      requireAuth: true
    }
  );

  // ✅ HOOK POUR METTRE À JOUR LE SERVICE AVEC APPWRITE
  const updateServiceMutation = useAppwriteMutation(
    async (serviceData) => {
      if (!serviceId || !user?.$id) {
        throw new Error('ID de service ou utilisateur manquant');
      }

      const updateData = {
        title: serviceData.title.trim(),
        description: serviceData.description.trim(),
        category: serviceData.category,
        price_range: serviceData.price_range || null,
        delivery_time: serviceData.delivery_time || null,
        skills: serviceData.skills.length > 0 ? serviceData.skills : null,
        youtube_url: serviceData.youtube_url?.trim() || null,
        video_description: serviceData.video_description?.trim() || null,
        portfolio: (serviceData.portfolio || []).map(item => JSON.stringify(item)),
        is_approved: true,
        updated_at: new Date().toISOString()
      };

      const data = await serviceService.updateService(serviceId, updateData, user.$id);
      return data;
    },
    {
      requireAuth: true,
      successMessage: "Service mis à jour avec succès !",
      invalidateQueries: [
        ['services', { creator_id: user?.$id }],
        ['service', serviceId]
      ],
      onSuccess: (data) => {
        console.log('Service mis à jour:', data);
        setShowSuccess(true);
        setTimeout(() => {
          navigate('/my-services');
        }, 2000);
      }
    }
  );

  // ✅ CHARGER LES DONNÉES DU SERVICE DANS LE FORMULAIRE
  useEffect(() => {
    if (service) {
      console.log('Données du service chargées:', service);
      console.log('Description récupérée:', service.description);
      
      const rawPortfolio = Array.isArray(service.portfolio) ? service.portfolio : [];
      const parsedPortfolio = rawPortfolio.map(item => {
        if (typeof item === 'string') { try { return JSON.parse(item); } catch { return { image_url: item, description: '' }; } }
        return item;
      }).filter(i => i?.image_url);

      const newFormData = {
        title: service.title || '',
        description: service.description || '',
        category: service.category || '',
        price_range: service.price_range || '',
        delivery_time: service.delivery_time || '',
        skills: Array.isArray(service.skills) ? service.skills : [],
        youtube_url: service.youtube_url || '',
        video_description: service.video_description || '',
        portfolio: parsedPortfolio,
      };
      
      console.log('FormData mis à jour:', newFormData);
      setFormData(newFormData);
    }
  }, [service]);

  // ✅ VÉRIFICATIONS D'ACCÈS
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (!isCandidate) {
      navigate('/services');
    }
  }, [user, isCandidate, navigate]);

  useEffect(() => {
    if (serviceError) {
      console.error('Erreur lors du chargement du service:', serviceError);
      navigate('/my-services');
    }
  }, [serviceError, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre du service est requis';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
    } else if (formData.description.replace(/<[^>]*>/g, '').length < 50) {
      newErrors.description = 'La description doit contenir au moins 50 caractères';
    }

    if (!formData.category) {
      newErrors.category = 'Veuillez sélectionner une catégorie';
    }

    const phoneRegex = /(\+261|261|0\d{2})\s?\d{2}\s?\d{3}\s?\d{2}|(\d{10})/;
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    
    const cleanText = formData.description.replace(/<[^>]*>/g, '');
    const cleanTitle = formData.title.replace(/<[^>]*>/g, '');
    
    if (phoneRegex.test(cleanText) || phoneRegex.test(cleanTitle)) {
      newErrors.description = 'Les numéros de téléphone ne sont pas autorisés.';
    }

    if (emailRegex.test(cleanText) || emailRegex.test(cleanTitle)) {
      newErrors.description = 'Les adresses email ne sont pas autorisées.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!user || !isCandidate) {
      return;
    }

    updateServiceMutation.mutate(formData);
  };

  if (loadingService) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <Navbar />
        <div className="pt-32 pb-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="bg-white rounded-3xl shadow-2xl p-12">
                <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Chargement du service...
                </h2>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <Navbar />
        <div className="pt-32 pb-16">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-white rounded-3xl shadow-2xl p-12 border-2 border-green-200">
                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mx-auto mb-8 flex items-center justify-center">
                  <CheckCircle className="h-12 w-12 text-white" />
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-6">
                  ✅ Service mis à jour avec succès !
                </h1>
                
                <Button
                  onClick={() => navigate('/my-services')}
                  className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Voir mes services
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navbar />
      <div className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            
            <div className="flex items-center mb-8">
              <Button
                onClick={() => navigate('/my-services')}
                variant="outline"
                className="mr-4 border-2 border-purple-600 text-purple-600 hover:bg-purple-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  <Edit3 className="h-8 w-8 inline mr-2 text-purple-600" />
                  Modifier le service
                </h1>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
              
              <div className="bg-gradient-to-br from-job-gold via-job-orange to-job-dark-gold p-6 text-white">
                <h2 className="text-2xl font-bold">✏️ Modifier votre service</h2>
              </div>

              <div className="p-8 space-y-8">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Tag className="h-4 w-4 inline mr-2" />
                      Titre du service *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className={`w-full p-4 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                        errors.title 
                          ? 'border-red-300 focus:ring-red-200' 
                          : 'border-gray-300 focus:ring-purple-500 focus:border-transparent'
                      }`}
                      placeholder="Ex: Je créé votre site web professionnel"
                      maxLength="100"
                    />
                    {errors.title && (
                      <p className="text-red-600 text-sm mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.title}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Catégorie *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className={`w-full p-4 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                        errors.category 
                          ? 'border-red-300 focus:ring-red-200' 
                          : 'border-gray-300 focus:ring-purple-500 focus:border-transparent'
                      }`}
                    >
                      <option value="">Sélectionner une catégorie</option>
                      {SERVICE_CATEGORIES.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                      {/* ✅ AJOUTER LA CATÉGORIE ACTUELLE SI ELLE N'EST PAS DANS LA LISTE */}
                      {formData.category && !SERVICE_CATEGORIES.includes(formData.category) && (
                        <option value={formData.category}>
                          {formData.category} (Catégorie personnalisée)
                        </option>
                      )}
                    </select>
                    {errors.category && (
                      <p className="text-red-600 text-sm mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.category}
                      </p>
                    )}
                  </div>
                </div>

                {/* DESCRIPTION AVEC SIMPLERICHEDITOR */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FileText className="h-4 w-4 inline mr-2" />
                    Description détaillée *
                  </label>
                  
                  <SimpleRichEditor
                    value={formData.description}
                    onChange={(value) => {
                      console.log('SimpleRichEditor onChange:', value);
                      setFormData(prev => ({ 
                        ...prev, 
                        description: value 
                      }));
                    }}
                    placeholder="Décrivez en détail votre service, votre expérience, ce que vous proposez exactement... (minimum 50 caractères)"
                    error={errors.description}
                  />
                  
                  <div className="flex justify-between items-center mt-2">
                    <div>
                      {errors.description && (
                        <p className="text-red-600 text-sm flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.description}
                        </p>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {formData.description.replace(/<[^>]*>/g, '').length} caractères
                    </span>
                  </div>

                  {/* Avertissement politique */}
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-amber-800 mb-1">⚠️ Politique de contact</h4>
                        <p className="text-amber-700 text-sm">
                          Ne mentionnez <strong>jamais</strong> votre numéro de téléphone ou adresse email dans le contenu. 
                          Les contacts se feront par le biais du site.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <DollarSign className="h-4 w-4 inline mr-2" />
                      Fourchette de prix
                    </label>
                    <select
                      name="price_range"
                      value={formData.price_range}
                      onChange={handleInputChange}
                      className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    >
                      <option value="">Prix à discuter</option>
                      <option value="0-100000">Moins de 100.000 Ar</option>
                      <option value="100000-500000">100.000 - 500.000 Ar</option>
                      <option value="500000-1000000">500.000 - 1.000.000 Ar</option>
                      <option value="1000000+">Plus de 1.000.000 Ar</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Timer className="h-4 w-4 inline mr-2" />
                      Délai de livraison
                    </label>
                    <select
                      name="delivery_time"
                      value={formData.delivery_time}
                      onChange={handleInputChange}
                      className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    >
                      <option value="">Délai à discuter</option>
                      <option value="24h">24 heures</option>
                      <option value="3 jours">3 jours</option>
                      <option value="1 semaine">1 semaine</option>
                      <option value="2 semaines">2 semaines</option>
                      <option value="1 mois">1 mois</option>
                      <option value="Plus d'1 mois">Plus d'1 mois</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Compétences requises
                  </label>
                  <SkillsAutocomplete
                    key={`skills-${serviceId}-${formData.skills?.length || 0}`}
                    selectedSkills={formData.skills}
                    onSkillsChange={(newSkills) => {
                      console.log('Skills onChange:', newSkills);
                      setFormData(prev => ({ ...prev, skills: newSkills }));
                    }}
                    placeholder=""
                  />
                </div>

                {/* Portfolio */}
                <div className="border-t border-gray-100 pt-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    🖼️ Portfolio <span className="text-gray-400 font-normal">(jusqu'à 5 photos)</span>
                  </label>
                  <p className="text-xs text-gray-400 mb-3">Montrez vos réalisations pour convaincre vos clients.</p>
                  <PortfolioEditor
                    portfolio={formData.portfolio}
                    onChange={(items) => setFormData(prev => ({ ...prev, portfolio: typeof items === 'function' ? items(prev.portfolio) : items }))}
                  />
                </div>

                {/* YouTube */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    🎬 Vidéo de présentation <span className="text-gray-400 font-normal">(optionnel)</span>
                  </label>
                  <p className="text-xs text-gray-400 mb-3">Coller le lien d'une vidéo YouTube.</p>
                  <input
                    type="url"
                    name="youtube_url"
                    value={formData.youtube_url}
                    onChange={handleInputChange}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                    style={{ direction: 'ltr', textAlign: 'left' }}
                  />
                  {formData.youtube_url && (
                    <div className="mt-3">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        📝 Description de la vidéo <span className="text-gray-400 font-normal">(optionnel)</span>
                      </label>
                      <textarea
                        name="video_description"
                        value={formData.video_description}
                        onChange={handleInputChange}
                        placeholder={"Décrivez le contenu de cette vidéo…\n\nEx: Démonstration de mon processus de création, présentation de mes dernières réalisations…"}
                        rows={4}
                        maxLength={1500}
                        className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm resize-y"
                      />
                      <p className="text-right text-xs text-gray-400 mt-1">{(formData.video_description || '').length}/1500</p>
                    </div>
                  )}
                </div>

              </div>

              <div className="bg-gray-50 px-8 py-6 flex justify-between items-center border-t border-gray-200">
                <Button
                  type="button"
                  onClick={() => navigate('/my-services')}
                  variant="outline"
                  className="border-2 border-gray-300 text-gray-700 hover:bg-gray-100 px-6 py-3 rounded-xl font-semibold transition-all"
                >
                  Annuler
                </Button>
                
                <Button
                  type="submit"
                  disabled={updateServiceMutation.isPending}
                  className="bg-gradient-to-r from-purple-600 to-pink-500 hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-white px-8 py-3 rounded-xl font-semibold flex items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {updateServiceMutation.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Mise à jour en cours...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Mettre à jour le service
                    </>
                  )}
                </Button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditService;