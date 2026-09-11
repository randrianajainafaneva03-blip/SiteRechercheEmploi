import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronRight, Send, MessageCircle, HelpCircle, Shield } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const ContactPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    subject: '',
    message: '',
    priority: 'normal'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);

  const categories = [
    { id: 'account', label: 'Problème de compte', icon: '👤', description: 'Connexion, inscription, profil' },
    { id: 'technical', label: 'Problème technique', icon: '⚙️', description: 'Bugs, erreurs, fonctionnalités' },
    { id: 'billing', label: 'Facturation & Premium', icon: '💳', description: 'Paiements, abonnements' },
    { id: 'jobs', label: 'Offres d\'emploi', icon: '💼', description: 'Publication, candidatures' },
    { id: 'messaging', label: 'Messagerie', icon: '💬', description: 'Messages, notifications' },
    { id: 'security', label: 'Sécurité', icon: '🔒', description: 'Confidentialité, sécurité' },
    { id: 'other', label: 'Autre demande', icon: '❓', description: 'Questions générales' }
  ];

  const faqs = [
    {
      category: 'Général',
      questions: [
        {
          q: 'Comment créer un compte sur Job2mada ?',
          a: 'Cliquez sur "Inscription" dans le menu, choisissez votre type de profil (Candidat ou Recruteur), remplissez vos informations et validez votre email.'
        },
        {
          q: 'Job2mada est-il gratuit ?',
          a: 'Job2mada propose un accès gratuit avec des fonctionnalités de base. L\'abonnement Premium débloque des fonctionnalités avancées comme la messagerie illimitée.'
        },
        {
          q: 'Comment modifier mon profil ?',
          a: 'Connectez-vous, allez dans "Mon profil" via le menu utilisateur, et modifiez les informations souhaitées. N\'oubliez pas de sauvegarder.'
        }
      ]
    },
    {
      category: 'Pour les candidats',
      questions: [
        {
          q: 'Comment postuler à une offre d\'emploi ?',
          a: 'Consultez l\'offre qui vous intéresse et cliquez sur "Postuler". Vous pourrez joindre votre CV et une lettre de motivation.'
        },
        {
          q: 'Comment publier mes services ?',
          a: 'Dans votre espace candidat, allez dans "Mes services" et cliquez sur "Publier un service". Décrivez vos compétences et tarifs.'
        },
        {
          q: 'Qu\'est-ce que l\'abonnement Premium candidat ?',
          a: 'L\'abonnement Premium vous permet d\'envoyer des messages directs aux recruteurs et d\'accéder à des fonctionnalités exclusives.'
        }
      ]
    },
    {
      category: 'Pour les recruteurs',
      questions: [
        {
          q: 'Comment publier une offre d\'emploi ?',
          a: 'Dans votre tableau de bord recruteur, cliquez sur "Publier une offre", remplissez les détails du poste et publiez.'
        },
        {
          q: 'Comment contacter un candidat ?',
          a: 'Les recruteurs peuvent contacter directement les candidats via la messagerie intégrée de Job2mada.'
        },
        {
          q: 'Comment gérer mes candidatures ?',
          a: 'Accédez à "Mes offres d\'emploi" pour voir toutes les candidatures reçues et gérer leur statut.'
        }
      ]
    },
    {
      category: 'Technique',
      questions: [
        {
          q: 'Je n\'arrive pas à me connecter',
          a: 'Vérifiez votre email et mot de passe. Utilisez "Mot de passe oublié" si nécessaire. Contactez le support si le problème persiste.'
        },
        {
          q: 'Mon CV ne s\'uploade pas',
          a: 'Vérifiez que votre fichier fait moins de 5MB et est au format PDF, DOC ou DOCX. Essayez avec un autre navigateur.'
        },
        {
          q: 'Je ne reçois pas les notifications',
          a: 'Vérifiez vos paramètres de notification et votre dossier spam. Assurez-vous que votre email est confirmé.'
        }
      ]
    }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(files);
  };

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(faq => 
      faq.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('category', categories.find(c => c.id === selectedCategory)?.label || 'Autre');
    formDataToSend.append('subject', formData.subject);
    formDataToSend.append('message', formData.message);
    formDataToSend.append('priority', formData.priority);

    // Ajouter les pièces jointes
    attachments.forEach((file) => {
      formDataToSend.append('attachments', file);
    });

    const response = await fetch('https://api.job2mada.com/api/send-support-email', {
      method: 'POST',
      body: formDataToSend // Pas de Content-Type header pour FormData
    });

    if (!response.ok) throw new Error('Erreur lors de l\'envoi');

    setFormData({
      name: '',
      email: '',
      category: '',
      subject: '',
      message: '',
      priority: 'normal'
    });
    setSelectedCategory('');
    setAttachments([]);
    
    alert('✅ Votre message a été envoyé avec succès! Notre équipe vous répondra dans les 24 heures.');
    
  } catch (error) {
    console.error('Erreur:', error);
    alert('❌ Erreur lors de l\'envoi. Veuillez réessayer.');
  } finally {
    setIsSubmitting(false);
  }
};

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setFormData({ ...formData, category: categoryId });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div>
      <Navbar />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" style={{ paddingTop: '80px' }}>
        {/* Header */}
        <div className="bg-gradient-to-br from-job-gold via-job-orange to-job-dark-gold text-white py-20 mt-8">
          <div className="container mx-auto px-4 text-center max-w-6xl">
            <h1 className="text-5xl font-bold mb-6 bg-blue-600 bg-clip-text text-transparent">
              Centre d'Aide Job2mada
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Trouvez rapidement les réponses à vos questions ou contactez notre équipe support
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16 max-w-6xl">
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-16">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher dans la FAQ..."
                className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-colors shadow-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
            {/* FAQ Section */}
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
                <HelpCircle className="w-8 h-8 text-blue-600 mr-3" />
                Questions Fréquentes
              </h2>

              <div className="space-y-6">
                {filteredFaqs.map((category, categoryIndex) => (
                  <div key={categoryIndex} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-br from-job-purple to-job-pink text-white px-6 py-4">
                      <h3 className="font-semibold text-lg">{category.category}</h3>
                    </div>
                    
                    <div className="divide-y divide-gray-100">
                      {category.questions.map((faq, faqIndex) => {
                        const globalIndex = `${categoryIndex}-${faqIndex}`;
                        return (
                          <div key={faqIndex}>
                            <button
                              className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
                              onClick={() => setOpenFaqIndex(openFaqIndex === globalIndex ? null : globalIndex)}
                            >
                              <span className="font-medium text-gray-800">{faq.q}</span>
                              {openFaqIndex === globalIndex ? 
                                <ChevronDown className="w-5 h-5 text-gray-500" /> : 
                                <ChevronRight className="w-5 h-5 text-job-orange to-job-dark-gold" />
                              }
                            </button>
                            {openFaqIndex === globalIndex && (
                              <div className="px-6 pb-4">
                                <p className="text-gray-600 leading-relaxed">{faq.a}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Section */}
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
                <MessageCircle className="w-8 h-8 text-blue-600 mr-3" />
                Contacter le Support
              </h2>

              <div className="bg-white rounded-2xl shadow-xl p-8">
                <p className="text-gray-600 mb-8 text-center bg-blue-50 p-4 rounded-lg">
                  Notre équipe vous répondra dans les <strong>24 heures</strong> ouvrables
                </p>

                {/* Category Selection */}
                {!selectedCategory && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">
                      Sélectionnez le type de votre demande :
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => handleCategorySelect(cat.id)}
                          className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all group"
                        >
                          <span className="text-2xl mr-4">{cat.icon}</span>
                          <div className="text-left">
                            <div className="font-medium text-gray-800 group-hover:text-blue-600">
                              {cat.label}
                            </div>
                            <div className="text-sm text-gray-500">{cat.description}</div>
                          </div>
                          <ChevronRight className="w-5 h-5 ml-auto text-gray-400 group-hover:text-blue-500" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact Form */}
                {selectedCategory && (
                  <form onSubmit={handleSubmit}>
                    {/* Selected Category Display */}
                    <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg mb-6">
                      <div className="flex items-center">
                        <span className="text-xl mr-3">
                          {categories.find(c => c.id === selectedCategory)?.icon}
                        </span>
                        <span className="font-medium text-blue-800">
                          {categories.find(c => c.id === selectedCategory)?.label}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedCategory('')}
                        className="text-blue-600 hover:text-blue-800 underline text-sm"
                      >
                        Changer
                      </button>
                    </div>

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nom complet *
                          </label>
                          <input
                            type="text"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email *
                          </label>
                          <input
                            type="email"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Priorité
                        </label>
                        <select
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                          value={formData.priority}
                          onChange={(e) => handleInputChange('priority', e.target.value)}
                        >
                          <option value="low">Faible - Question générale</option>
                          <option value="normal">Normale - Problème standard</option>
                          <option value="high">Élevée - Problème urgent</option>
                          <option value="critical">Critique - Service indisponible</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sujet *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Décrivez brièvement votre problème..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                          value={formData.subject}
                          onChange={(e) => handleInputChange('subject', e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Message détaillé *
                        </label>
                        <textarea
                          required
                          rows={6}
                          placeholder="Décrivez votre problème en détail. Plus vous nous donnez d'informations, plus nous pourrons vous aider rapidement."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors resize-none"
                          value={formData.message}
                          onChange={(e) => handleInputChange('message', e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Pièces jointes (optionnel)
                        </label>
                        <input
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                            onChange={handleFileChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            Formats acceptés: PDF, DOC, DOCX, JPG, PNG, TXT (max 10MB par fichier, 3 fichiers max)
                        </p>
                        {attachments.length > 0 && (
                            <div className="mt-3">
                            <p className="text-sm font-medium text-gray-700">Fichiers sélectionnés:</p>
                            <ul className="mt-2 space-y-1">
                                {attachments.map((file, index) => (
                                <li key={index} className="text-sm text-gray-600 flex items-center">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                </li>
                                ))}
                            </ul>
                            </div>
                        )}
                        </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all flex items-center justify-center ${
                          isSubmitting 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:scale-105'
                        }`}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Envoi en cours...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5 mr-2" />
                            Envoyer le message
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Info Box */}
              <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-start">
                  <Shield className="w-6 h-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-green-800 mb-2">
                      Vos données sont protégées
                    </h4>
                    <p className="text-green-700 text-sm leading-relaxed">
                      Toutes les informations que vous nous transmettez sont sécurisées et utilisées uniquement pour répondre à votre demande de support.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ContactPage;
