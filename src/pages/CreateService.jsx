import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notifyNewService } from '@/lib/telegram';
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
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import SkillsAutocomplete from '@/components/ui/SkillsAutocomplete';
import SimpleRichEditor from '@/components/ui/SimpleRichEditor';

// ✅ IMPORTER LES HOOKS APPWRITE
import { useAppwriteMutation } from '@/hooks/useAppwriteQuery';
import { serviceService } from '@/lib/appwrite';
import PortfolioEditor from '@/components/ui/PortfolioEditor';

const SERVICE_CATEGORIES = [
  'Développement Web', 'Design Graphique', 'Marketing Digital', 'Rédaction',
  'Traduction', 'Photographie', 'Montage Vidéo', 'Comptabilité', 
  'Conseil', 'Formation', 'Maintenance', 'Réparation',
  'Autres' // ✅ AJOUT DE "AUTRES"
];

const CreateService = () => {
  const navigate = useNavigate();
  const { user, profile, isCandidate } = useAuth();
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    customCategory: '', // ✅ NOUVEAU CHAMP POUR CATÉGORIE PERSONNALISÉE
    price_range: '',
    delivery_time: '',
    skills: [],
    youtube_url: '',
    video_description: '',
    portfolio: [],
  });

  const [errors, setErrors] = useState({});

  // ✅ HOOK POUR CRÉER UN SERVICE AVEC APPWRITE
  const createServiceMutation = useAppwriteMutation(
    async (serviceData) => {
      // ✅ UTILISER LA CATÉGORIE PERSONNALISÉE SI "AUTRES" EST SÉLECTIONNÉ
      const finalCategory = serviceData.category === 'Autres' 
        ? serviceData.customCategory 
        : serviceData.category;

        const newService = {
          creator_id: user.$id,
          title: serviceData.title.trim(),
          description: serviceData.description.trim(),
          category: finalCategory,
          price_range: serviceData.price_range || null,
          delivery_time: serviceData.delivery_time || null,
          skills: Array.isArray(serviceData.skills)
            ? serviceData.skills
                .map(s => typeof s === 'string' ? s.trim() : (s?.value ?? s?.label ?? '').trim())
                .filter(Boolean)
            : [],
          youtube_url: serviceData.youtube_url?.trim() || null,
          video_description: serviceData.video_description?.trim() || null,
          portfolio: (serviceData.portfolio || []).map(item => JSON.stringify(item)),
          is_active: false, // ✅ TOUJOURS FALSE - En attente d'approbation
          is_approved: false, // ✅ TOUJOURS FALSE - En attente d'approbation
          approval_status: 'pending', // ✅ Statut de modération
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

      const data = await serviceService.createService(newService);
      return data;
    },
    {
      requireAuth: true,
      successMessage: "Service créé avec succès !",
      onSuccess: (data) => {
        console.log('Service créé:', data);
        setShowSuccess(true);
        
        // Rediriger après 10 secondes
        setTimeout(() => {
          navigate('/services');
        }, 10000);
      },
      onError: (error) => {
        console.error('Erreur lors de la création du service:', error);
      }
    }
  );

  // Rediriger si pas candidat
  React.useEffect(() => {
    if (!user) {
      navigate('/login', { 
        state: { 
          from: '/services/create', 
          message: 'Connectez-vous pour proposer un service' 
        } 
      });
    } else if (!isCandidate) {
      navigate('/services', { 
        state: { 
          message: 'Seuls les candidats peuvent proposer des services' 
        } 
      });
    }
  }, [user, isCandidate, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // ✅ RÉINITIALISER LA CATÉGORIE PERSONNALISÉE SI ON CHANGE DE CATÉGORIE
    if (name === 'category' && value !== 'Autres') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        customCategory: ''
      }));
    }
    
    // Effacer l'erreur si le champ est corrigé
    if (errors[name] || errors.customCategory) {
      setErrors(prev => ({
        ...prev,
        [name]: null,
        customCategory: null
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

    // ✅ VALIDATION POUR CATÉGORIE PERSONNALISÉE
    if (formData.category === 'Autres' && !formData.customCategory.trim()) {
      newErrors.customCategory = 'Veuillez spécifier votre catégorie';
    }

    // Vérifier qu'il n'y a pas de numéros de téléphone ou emails
    const phoneRegex = /(\+261|261|0\d{2})\s?\d{2}\s?\d{3}\s?\d{2}|(\d{10})/;
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    
    const cleanText = formData.description.replace(/<[^>]*>/g, '');
    const cleanTitle = formData.title.replace(/<[^>]*>/g, '');
    const cleanCustomCategory = formData.customCategory.replace(/<[^>]*>/g, '');
    
    if (phoneRegex.test(cleanText) || phoneRegex.test(cleanTitle) || phoneRegex.test(cleanCustomCategory)) {
      newErrors.description = 'Les numéros de téléphone ne sont pas autorisés. Les contacts se font via le site.';
    }

    if (emailRegex.test(cleanText) || emailRegex.test(cleanTitle) || emailRegex.test(cleanCustomCategory)) {
      newErrors.description = 'Les adresses email ne sont pas autorisées. Les contacts se font via le site.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ VALIDATION AVANT ENVOI
    if (!validateForm()) {
      return;
    }
   
    // ✅ VÉRIFICATION UTILISATEUR APPWRITE
    if (!user) {
      alert('Vous devez être connecté pour créer un service');
      navigate('/login');
      return;
    }
   
    if (!isCandidate) {
      alert('Seuls les candidats peuvent créer des services');
      navigate('/services');
      return;
    }
   
    // ✅ LANCER LA MUTATION APPWRITE (qui gère loading automatiquement)
    createServiceMutation.mutate(formData, {
      onSuccess: async (data) => {
        console.log('✅ Service créé avec succès:', data);
        
        // ✅ NOTIFICATION TELEGRAM
        try {
          const finalCategory = formData.category === 'Autres' 
            ? formData.customCategory 
            : formData.category;
            
          await notifyNewService({
            title: formData.title.trim(),
            provider_name: profile?.full_name || user?.name || 'Prestataire',
            category: finalCategory,
            price: formData.price_range || 'À discuter',
            location: profile?.location || 'Madagascar'
          });
          console.log('✅ Notification Telegram envoyée');
        } catch (telegramError) {
          console.warn('⚠️ Erreur notification Telegram (non bloquant):', telegramError);
        }
        
        // Afficher écran de succès
        setShowSuccess(true);
      }
    });
  };

  if (showSuccess) {
    return (
      <>
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
                    🎉 Service créé avec succès !
                  </h1>
                  
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border-2 border-amber-200 mb-8">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <AlertCircle className="h-6 w-6 text-amber-600 mt-1" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-bold text-amber-800 mb-2">Modération en cours</h3>
                        <p className="text-amber-700 text-sm leading-relaxed">
                          Votre service a bien été enregistré et sera géré par nos modérateurs avant d'être publié sur le site. 
                          Il sera visible s'il est conforme à nos politiques.
                        </p>
                        <div className="mt-4 p-3 bg-amber-100 rounded-lg">
                          <p className="text-xs text-amber-600 font-medium">
                            📋 <strong>Rappel de nos politiques :</strong> Le contenu ne doit jamais afficher un numéro de téléphone 
                            ou une adresse mail pour vous contacter. Les contacts se font par le biais du site.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-8">
                    Vous allez être redirigé vers la liste des services dans quelques secondes...
                  </p>
                  
                  <Button
                    onClick={() => navigate('/services')}
                    className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Voir tous les services
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* ✅ STYLE CSS POUR CORRIGER LA DIRECTION DU TEXTE */}
      <style>
        {`
          /* Forcer la direction LTR pour l'éditeur de texte */
          .rich-editor,
          .rich-editor *,
          [contenteditable="true"],
          .ql-editor,
          .tiptap,
          textarea {
            direction: ltr !important;
            text-align: left !important;
            unicode-bidi: embed !important;
          }
          
          /* Correction spécifique pour les inputs */
          input[type="text"],
          input[type="email"],
          textarea,
          select {
            direction: ltr !important;
            text-align: left !important;
          }
          
          /* Assurer que le placeholder est aussi LTR */
          input::placeholder,
          textarea::placeholder {
            direction: ltr !important;
            text-align: left !important;
          }
        `}
      </style>
      
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <Navbar />
        <div className="pt-32 pb-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              
              {/* Header */}
              <div className="flex items-center mb-8">
                <Button
                  onClick={() => navigate('/services')}
                  variant="outline"
                  className="mr-4 border-2 border-purple-600 text-purple-600 hover:bg-purple-50"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    💼 Créer un nouveau service
                  </h1>
                  <p className="text-gray-600 mt-2">
                    Mettez en avant vos compétences et trouvez des clients
                  </p>
                </div>
              </div>

              {/* Formulaire */}
              <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                
                {/* Header du formulaire */}
                <div className="bg-gradient-to-br from-job-gold via-job-orange to-job-dark-gold p-6 text-white">
                  <h2 className="text-2xl font-bold">✨ Détails de votre service</h2>
                  <p className="text-white/90 mt-1">Remplissez tous les champs pour créer votre offre</p>
                </div>

                <div className="p-8 space-y-8">
                  
                  {/* Titre et catégorie */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
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
                        style={{ direction: 'ltr', textAlign: 'left' }}
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
                        style={{ direction: 'ltr', textAlign: 'left' }}
                      >
                        <option value="">Sélectionner une catégorie</option>
                        {SERVICE_CATEGORIES.map(category => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                      {errors.category && (
                        <p className="text-red-600 text-sm mt-1 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.category}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* ✅ CHAMP CATÉGORIE PERSONNALISÉE (AFFICHÉ SI "AUTRES" EST SÉLECTIONNÉ) */}
                  {formData.category === 'Autres' && (
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                      <label className="block text-sm font-semibold text-blue-800 mb-2">
                        <Plus className="h-4 w-4 inline mr-2" />
                        Spécifiez votre catégorie *
                      </label>
                      <input
                        type="text"
                        name="customCategory"
                        value={formData.customCategory}
                        onChange={handleInputChange}
                        className={`w-full p-4 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                          errors.customCategory 
                            ? 'border-red-300 focus:ring-red-200' 
                            : 'border-blue-300 focus:ring-blue-500 focus:border-transparent'
                        }`}
                        placeholder="Ex: Jardinage, Plomberie, Couture, etc."
                        maxLength="50"
                        style={{ direction: 'ltr', textAlign: 'left' }}
                      />
                      {errors.customCategory && (
                        <p className="text-red-600 text-sm mt-1 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.customCategory}
                        </p>
                      )}
                      <p className="text-blue-600 text-xs mt-1">
                        💡 Cette catégorie sera ajoutée à votre service et pourra être utilisée par d'autres utilisateurs
                      </p>
                    </div>
                  )}

                  {/* Description */}
                  <div>
  <label className="block text-sm font-semibold text-gray-700 mb-2">
    <FileText className="h-4 w-4 inline mr-2" />
    Description détaillée *
  </label>
  
  {/* ✅ TEXTAREA SIMPLE AU LIEU DE RICH EDITOR */}
  <textarea
    name="description"
    value={formData.description}
    onChange={handleInputChange}
    className={`w-full p-4 border rounded-xl focus:outline-none focus:ring-2 transition-all resize-none ${
      errors.description 
        ? 'border-red-300 focus:ring-red-200' 
        : 'border-gray-300 focus:ring-purple-500 focus:border-transparent'
    }`}
    placeholder="Décrivez en détail votre service, votre expérience, ce que vous proposez exactement... (minimum 50 caractères)"
    rows="6"
    style={{ 
      direction: 'ltr', 
      textAlign: 'left',
      fontFamily: 'inherit'
    }}
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
      {formData.description.length} caractères
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
          Les contacts se feront par le biais du site une fois votre service approuvé.
        </p>
      </div>
    </div>
  </div>
</div>

                  {/* Tarif et délai */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
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
                        style={{ direction: 'ltr', textAlign: 'left' }}
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
                        style={{ direction: 'ltr', textAlign: 'left' }}
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

                  {/* Compétences */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Compétences requises
                    </label>
                    <div style={{ direction: 'ltr', textAlign: 'left' }}>
                      <SkillsAutocomplete
                        selectedSkills={formData.skills}
                        onSkillsChange={(newSkills) => setFormData(prev => ({ ...prev, skills: newSkills }))}
                        placeholder=""
                      />
                    </div>
                  </div>

                  {/* Portfolio */}
                  <div className="border-t border-gray-100 pt-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      🖼️ Portfolio <span className="text-gray-400 font-normal">(jusqu'à 5 photos)</span>
                    </label>
                    <p className="text-xs text-gray-400 mb-3">Montrez vos réalisations pour convaincre vos clients.</p>
                    <PortfolioEditor
                      portfolio={formData.portfolio}
                      onChange={(items) => setFormData(prev => ({ ...prev, portfolio: items }))}
                    />
                  </div>

                  {/* YouTube */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      🎬 Vidéo de présentation <span className="text-gray-400 font-normal">(optionnel)</span>
                    </label>
                    <p className="text-xs text-gray-400 mb-3">Coller le lien d'une vidéo YouTube pour vous présenter ou montrer votre travail.</p>
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
                          placeholder={"Décrivez le contenu de cette vidéo, ce qu'elle montre...\n\nEx: Démonstration de mon processus de création, présentation de mes dernières réalisations…"}
                          rows={4}
                          maxLength={1500}
                          className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm resize-y"
                        />
                        <p className="text-right text-xs text-gray-400 mt-1">{(formData.video_description || '').length}/1500</p>
                      </div>
                    )}
                  </div>

                </div>

                {/* Footer avec boutons */}
                <div className="bg-gray-50 px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-gray-200">
                  <Button
                    type="button"
                    onClick={() => navigate('/services')}
                    variant="outline"
                    className="border-2 border-gray-300 text-gray-700 hover:bg-gray-100 px-6 py-3 rounded-xl font-semibold transition-all"
                  >
                    Annuler
                  </Button>
                  
                  <Button
                    type="submit"
                    disabled={createServiceMutation.isPending}
                    className="bg-gradient-to-r from-purple-600 to-pink-500 hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-white px-8 py-3 rounded-xl font-semibold flex items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {createServiceMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                        Création en cours...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Créer le service
                      </>
                    )}
                  </Button>
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateService;