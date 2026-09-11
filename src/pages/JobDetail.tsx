import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PremiumButton from '@/components/PremiumButton';
import { Helmet } from 'react-helmet-async';
import emailjs from '@emailjs/browser';
import { User } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { 
  ArrowLeft,
  Building,
  MapPin,
  Clock,
  Users,
  FileText,
  Globe,
  Calendar,
  Briefcase,
  Star,
  Save,
  Eye,
  AlertCircle,
  CheckCircle,
  Upload,
  X,
  Send,
  Heart,
  Share2,
  Phone,
  Mail,
  ExternalLink,
  Zap,
  TrendingUp,
  Award,
  Target,
  Sparkles,
  Crown,
  Rocket,
  Gift,
  ChevronUp,
  ChevronDown,
  Paperclip,
  Download,
  MessageSquare,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Shield,
  BadgeCheck,
  Activity,
  ChevronRight,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { databases, storage, DATABASE_ID } from '@/lib/appwrite';
import { Query } from 'appwrite';
import DirectMessageModal from '@/components/messaging/DirectMessageModal';
import { emailService } from '@/components/services/emailService';

interface Job {
  $id: string;
  title: string;
  company_name: string;
  location: string;
  created_at: string;
  $createdAt: string;  
  is_urgent?: boolean;
  is_featured?: boolean;
  employer_id: string;
  description: string;
  category: string;
  contract_type: string;
  employment_type: string;
  experience_level: string;
  remote_work?: boolean;
  application_deadline?: string;
  benefits?: string[];
  requirements?: string[];
  company_website?: string;
  views_count?: number;
  is_active: boolean;
}

interface JobWithLogo extends Job {
  employer_logo?: string | null;
}
// Composant Rich Text Editor pour la lettre de motivation
const RichTextEditor = ({ value, onChange, placeholder }: { 
  value: string; 
  onChange: (value: string) => void; 
  placeholder: string; 
}) => {
  const editorRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  const executeCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    handleInput();
  };

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  return (
    <div className={`border-2 rounded-2xl overflow-hidden transition-all ${
      isFocused ? 'ring-4 ring-job-gold/20 border-job-gold' : 'border-gray-200 hover:border-gray-300'
    } ${Error ? 'border-red-500' : ''}`}>
      <div className="bg-gradient-to-r from-job-light-gold via-job-cream to-job-light-gold border-b border-gray-200 p-3">
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => executeCommand('bold')}
            className="p-2 text-job-brown hover:text-job-gold hover:bg-job-cream rounded-lg transition-all"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('italic')}
            className="p-2 text-job-brown hover:text-job-gold hover:bg-job-cream rounded-lg transition-all"
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('underline')}
            className="p-2 text-job-brown hover:text-job-gold hover:bg-job-cream rounded-lg transition-all"
          >
            <Underline className="h-4 w-4" />
          </button>
          <div className="w-px h-6 bg-job-brown/30 mx-1"></div>
          <button
            type="button"
            onClick={() => executeCommand('insertUnorderedList')}
            className="p-2 text-job-brown hover:text-job-gold hover:bg-job-cream rounded-lg transition-all"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('insertOrderedList')}
            className="p-2 text-job-brown hover:text-job-gold hover:bg-job-cream rounded-lg transition-all"
          >
            <ListOrdered className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="relative bg-white">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning={true}
          onInput={handleInput}
          onPaste={handlePaste}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="p-4 min-h-[200px] max-h-[300px] overflow-y-auto focus:outline-none prose prose-sm max-w-none"
          data-placeholder={placeholder}
        />
        
        {(!value || value === '<br>' || value === '') && !isFocused && (
          <div className="absolute top-4 left-4 text-gray-400 pointer-events-none">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
};

// Modal de postulation
const ApplicationModal = ({ job, isOpen, onClose, onSubmit, userProfile }) => {
  const [formData, setFormData] = useState({
    coverLetter: '',
    cv: null,
    useExistingCV: false,
    additionalDocs: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const addAdditionalDoc = () => {
    if (formData.additionalDocs.length < 3) {
      setFormData({
        ...formData,
        additionalDocs: [...formData.additionalDocs, null]
      });
    }
  };

  const removeAdditionalDoc = (index) => {
    setFormData({
      ...formData,
      additionalDocs: formData.additionalDocs.filter((_, i) => i !== index)
    });
  };

  const updateAdditionalDoc = (index, file) => {
    const newDocs = [...formData.additionalDocs];
    newDocs[index] = file;
    setFormData({
      ...formData,
      additionalDocs: newDocs
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      setSubmitStatus('success');
      setTimeout(() => {
        onClose();
        setSubmitStatus(null);
        setFormData({ coverLetter: '', cv: null, useExistingCV: false, additionalDocs: [] });
      }, 9000);
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasExistingCV = userProfile?.cv_url;

  // Empêcher le scroll du body quand le modal est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Nettoyage
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-4 border-job-gold">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-3xl font-bold text-job-brown mb-2">✨ Postuler pour ce poste</h3>
              <p className="text-job-gold font-semibold text-lg">{job?.title}</p>
              <p className="text-gray-600">chez {job?.company_name}</p>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-job-cream rounded-xl transition-all border-2 border-transparent hover:border-job-gold"
            >
              <X className="h-6 w-6 text-gray-400" />
            </button>
          </div>

          {submitStatus === 'success' ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4">
                🎉 Candidature envoyée avec succès !
              </h4>
              <p className="text-gray-600 text-lg">
                Votre candidature a été transmise au recruteur.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="bg-gradient-to-br from-job-light-gold via-job-cream to-job-light-gold p-6 rounded-2xl border-2 border-job-gold">
                <h4 className="text-xl font-semibold text-job-brown mb-4 flex items-center">
                  <FileText className="h-6 w-6 mr-3" />
                  Votre CV
                </h4>
                
                {hasExistingCV ? (
                  <div className="space-y-4">
                    <div className="flex items-center p-4 bg-white rounded-xl border-2 border-green-200">
                      <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">CV déjà dans votre profil</p>
                        <p className="text-sm text-gray-600">Utiliser votre CV existant</p>
                      </div>
                      <a 
                        href={userProfile.cv_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-job-gold hover:text-job-dark-gold transition-colors"
                      >
                        <Download className="h-5 w-5" />
                      </a>
                    </div>
                    
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.useExistingCV}
                        onChange={(e) => setFormData({ ...formData, useExistingCV: e.target.checked, cv: null })}
                        className="w-5 h-5 text-job-gold rounded focus:ring-job-gold"
                      />
                      <span className="text-job-brown font-medium">Utiliser mon CV existant</span>
                    </label>
                    
                    {!formData.useExistingCV && (
                      <div className="border-2 border-dashed border-job-gold rounded-xl p-6 text-center bg-white">
                        <Upload className="h-12 w-12 text-job-gold mx-auto mb-4" />
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => setFormData({ ...formData, cv: e.target.files[0] })}
                          className="hidden"
                          id="cv-upload"
                          required={!formData.useExistingCV}
                        />
                        <label htmlFor="cv-upload" className="cursor-pointer">
                          <span className="text-job-gold font-bold text-lg">Télécharger un nouveau CV</span>
                          <p className="text-gray-600 mt-2">ou glissez-déposez votre fichier</p>
                        </label>
                        {formData.cv && (
                          <p className="text-green-600 font-medium mt-3">✓ {formData.cv.name}</p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-job-gold rounded-xl p-8 text-center bg-white">
                    <Upload className="h-16 w-16 text-job-gold mx-auto mb-4" />
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setFormData({ ...formData, cv: e.target.files[0] })}
                      className="hidden"
                      id="cv-upload"
                      required
                    />
                    <label htmlFor="cv-upload" className="cursor-pointer">
                      <span className="text-job-gold font-bold text-xl">Télécharger votre CV</span>
                      <p className="text-gray-600 mt-2">Formats acceptés: PDF, DOC, DOCX</p>
                    </label>
                    {formData.cv && (
                      <p className="text-green-600 font-medium mt-4 text-lg">✓ {formData.cv.name}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Documents supplémentaires */}
              <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-semibold text-job-brown flex items-center">
                    <Paperclip className="h-6 w-6 mr-3" />
                    Documents supplémentaires (optionnel)
                  </h4>
                  {formData.additionalDocs.length < 3 && (
                    <button
                      type="button"
                      onClick={addAdditionalDoc}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                    >
                      + Ajouter
                    </button>
                  )}
                </div>
                
                <p className="text-gray-600 text-sm mb-4">
                  Ajoutez jusqu'à 3 documents supplémentaires (lettre de recommandation, portfolio, certificats, etc.)
                </p>
                
                {formData.additionalDocs.map((doc, index) => (
                  <div key={index} className="mb-4 p-4 bg-white rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-700">Document {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeAdditionalDoc(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(e) => updateAdditionalDoc(index, e.target.files[0])}
                      className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {doc && (
                      <p className="text-green-600 text-sm mt-2">✓ {doc.name}</p>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xl font-semibold text-job-brown mb-4 flex items-center">
                  <MessageSquare className="h-6 w-6 mr-3" />
                  Lettre de motivation
                </label>
                <RichTextEditor
                value={formData.coverLetter}
                onChange={(value) => setFormData({ ...formData, coverLetter: value })}
                placeholder="Expliquez pourquoi vous êtes le candidat idéal pour ce poste..."
              />
              </div>

              <div className="flex gap-6 pt-6">
                <Button
                  type="button"
                  onClick={onClose}
                  variant="outline"
                  className="flex-1 py-4 text-lg border-2 border-gray-300 hover:border-gray-400"
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="flex-1 py-4 text-lg bg-gradient-to-r from-job-gold to-job-dark-gold hover:from-job-dark-gold hover:to-job-gold text-white font-bold shadow-lg"
                  disabled={isSubmitting || (!formData.cv && !formData.useExistingCV)}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-3" />
                      Envoyer ma candidature
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// Carrousel vertical des dernières offres
const VerticalJobCarousel = ({ jobs }: { jobs: Job[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [jobsWithLogos, setJobsWithLogos] = useState<JobWithLogo[]>([]);

  // Charger les logos des employeurs pour TOUS les utilisateurs
  useEffect(() => {
    const loadJobLogos = async () => {
      if (jobs.length === 0) {
        setJobsWithLogos([]);
        return;
      }

      console.log('Chargement des logos pour', jobs.length, 'offres');

      try {
        const jobsWithLogosData = await Promise.all(
          jobs.map(async (job) => {
            if (job.employer_id) {
              try {
                console.log('Chargement logo pour employer_id:', job.employer_id);
                
                const profileData = await databases.getDocument(
                  DATABASE_ID,
                  'profiles',
                  job.employer_id
                );
                
                if (profileData?.company_logo_url) {
                  console.log('Logo trouvé:', profileData.company_logo_url);
                  return { ...job, employer_logo: profileData.company_logo_url };
                } else {
                  console.log('Pas de logo pour employer_id:', job.employer_id);
                }
              } catch (logoError) {
                console.log('Erreur logo pour job', job.$id, ':', logoError);
              }
            }
            return { ...job, employer_logo: null };
          })
        );
        
        console.log('Jobs avec logos:', jobsWithLogosData);
        setJobsWithLogos(jobsWithLogosData);
      } catch (error) {
        console.error('Erreur lors du chargement des logos:', error);
        setJobsWithLogos(jobs.map(job => ({ ...job, employer_logo: null })));
      }
    };

    loadJobLogos();
  }, [jobs]);

  useEffect(() => {
    if (jobsWithLogos.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % jobsWithLogos.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [jobsWithLogos.length]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % jobsWithLogos.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + jobsWithLogos.length) % jobsWithLogos.length);
  };

  const getTimeAgo = (date: string) => {
    if (!date) return 'Date inconnue';
    
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - new Date(date).getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Aujourd\'hui';
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    if (diffDays < 30) return `Il y a ${Math.ceil(diffDays / 7)} semaine${Math.ceil(diffDays / 7) > 1 ? 's' : ''}`;
    
    const diffMonths = Math.floor(diffDays / 30);
    return `Il y a ${diffMonths} mois`;
  };

  if (!jobsWithLogos.length) {
    return (
      <div className="text-center py-8">
        <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Aucune offre récente</p>
      </div>
    );
  }

  return (
    <div className="relative bg-white rounded-2xl shadow-xl border-2 border-job-gold overflow-hidden">
      <div className="bg-gradient-to-r from-job-gold to-job-dark-gold p-4 flex items-center justify-between">
        <h3 className="font-bold text-white text-lg flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Dernières offres
        </h3>
        <Link 
          to="/jobs"
          className="text-white/80 hover:text-white text-sm font-medium flex items-center transition-colors"
        >
          Voir tout
          <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      </div>

      <div className="relative h-80 overflow-hidden">
        <div 
          className="transition-transform duration-500 ease-in-out h-full"
          style={{ transform: `translateY(-${currentIndex * 100}%)` }}
        >
          {jobsWithLogos.map((job, index) => (
            <Link
              key={job.$id}
              to={`/jobs/${job.$id}`}
              className="h-full block cursor-pointer transform transition-all duration-300 hover:scale-105"
            >
              <div className="h-full p-6 flex flex-col justify-between bg-gradient-to-br from-white via-job-cream to-job-light-gold hover:from-job-light-gold hover:via-job-cream hover:to-white border-b border-job-gold/20">
                <div>
                  <div className="flex items-center mb-4">
                    {/* Logo de l'entreprise dans le carrousel */}
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center mr-4 shadow-lg border-2 border-gray-100 bg-white overflow-hidden">
                      {job.employer_logo ? (
                        <img 
                          src={job.employer_logo} 
                          alt={`Logo ${job.company_name}`}
                          className="w-full h-full object-contain p-2"
                          onError={(e) => {
                            console.log('Erreur affichage logo:', e);
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.parentNode?.querySelector('.fallback-icon') as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className={`fallback-icon w-full h-full bg-gradient-to-r from-job-gold to-job-orange rounded-lg flex items-center justify-center ${job.employer_logo ? 'hidden' : 'flex'}`}
                      >
                        <Building className="h-7 w-7 text-white" />
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-bold text-job-brown text-base line-clamp-1 hover:text-job-gold transition-colors">
                        {job.title}
                      </h4>
                      <p className="text-gray-600 text-sm font-medium">{job.company_name}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-job-gold/20 rounded-full flex items-center justify-center mr-3">
                        <MapPin className="h-3 w-3 text-job-gold" />
                      </div>
                      <span className="font-medium">{job.location}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <Clock className="h-3 w-3 text-blue-600" />
                      </div>
                      <span>{getTimeAgo(job.created_at)}</span>
                    </div>
                    {job.is_urgent && (
                      <div className="flex items-center">
                        <span className="px-3 py-1 bg-red-500 text-white text-xs rounded-full animate-pulse font-bold">
                          🚨 Urgent
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-job-gold/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Cliquez pour voir</span>
                    <div className="w-8 h-8 bg-job-gold rounded-full flex items-center justify-center">
                      <ChevronRight className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {jobsWithLogos.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
            <button
              onClick={goToPrev}
              className="p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all"
            >
              <ChevronUp className="h-4 w-4 text-job-gold" />
            </button>
            <button
              onClick={goToNext}
              className="p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all"
            >
              <ChevronDown className="h-4 w-4 text-job-gold" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile, isCandidate, isEmployer, isPremium } = useAuth();
  const [showDirectMessageModal, setShowDirectMessageModal] = useState(false);
  
  const [job, setJob] = useState(null);
  const [employerProfile, setEmployerProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [recentJobs, setRecentJobs] = useState([]);
  const [hasApplied, setHasApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savingBookmark, setSavingBookmark] = useState(false);
  const [hassentDirectMessage, setHasSentDirectMessage] = useState(false);
  const [checkingApplicationStatus, setCheckingApplicationStatus] = useState(true);
  const [applicationData, setApplicationData] = useState(null);
  const EMAIL_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const EMAIL_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const EMAIL_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  // Initialiser EmailJS
  if (EMAIL_PUBLIC_KEY) {
    emailjs.init(EMAIL_PUBLIC_KEY);
  }

  // Cache pour éviter les rechargements
  const [dataCache] = useState(new Map());

  const employmentTypes = {
    'full-time': 'Temps plein',
    'part-time': 'Temps partiel',
    'contract': 'Contrat',
    'internship': 'Stage',
    'freelance': 'Freelance'
  };

  const contractTypes = {
    'cdi': 'CDI',
    'cdd': 'CDD',
    'stage': 'Stage',
    'freelance': 'Freelance',
    'mission': 'Mission'
  };

  const experienceLevels = {
    'entry': 'Débutant',
    'mid': 'Intermédiaire',
    'senior': 'Senior',
    'executive': 'Cadre dirigeant'
  };

  // Ajouter cette fonction DANS votre composant JobDetail, avant le return
const sendApplicationNotification = async ({
  recruiterEmail,
  recruiterName,
  candidateName,
  candidatePhone,
  jobTitle,
  jobId,
  companyName,
  applicationDate,
  coverLetter,
  cvUrl,
  additionalDocs = []
}: {
  recruiterEmail: string;
  recruiterName: string;
  candidateName: string;
  candidatePhone?: string;
  jobTitle: string;
  jobId: string;
  companyName: string;
  applicationDate: string;
  coverLetter?: string;
  cvUrl?: string;
  additionalDocs?: Array<{ name: string; url: string }>;
}) => {
  try {
    if (!EMAIL_SERVICE_ID || !EMAIL_TEMPLATE_ID || !EMAIL_PUBLIC_KEY) {
      console.error('Variables EmailJS manquantes');
      return { success: false, error: 'Configuration EmailJS manquante' };
    }

    const cvAttached = cvUrl ? 1 : 0;
    const totalDocs = cvAttached + additionalDocs.length;

    const templateParams = {
      to_email: recruiterEmail,
      to_name: recruiterName,
      job_title: jobTitle,
      job_id: jobId,
      company_name: companyName,
      candidate_name: candidateName,
      candidate_phone: candidatePhone || 'Non renseigné',
      application_date: new Date(applicationDate).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      cover_letter: coverLetter ? coverLetter.substring(0, 500) + '...' : 'Aucune lettre de motivation fournie',
      cv_attached: cvUrl ? '1 CV' : '0 CV',
      cv_status: cvUrl ? 'Fourni' : 'Non fourni',
      additional_docs_count: additionalDocs.length.toString(),
      total_docs_count: totalDocs.toString(),
      dashboard_url: `${window.location.origin}/dashboard`,
      job_url: `${window.location.origin}/jobs/${jobId}`,
      platform_name: 'Job2mada',
      platform_url: window.location.origin
    };

    const response = await emailjs.send(EMAIL_SERVICE_ID, EMAIL_TEMPLATE_ID, templateParams);
    console.log('✅ Email envoyé avec succès');
    return { success: true, response };

  } catch (error: any) {
    console.error('❌ Erreur envoi email:', error);
    return { success: false, error: error.text || 'Erreur inconnue' };
  }
};

  const handleDirectMessageSent = async () => {
    setHasSentDirectMessage(true);
    setShowDirectMessageModal(false);
    
    // Optionnel : re-vérifier le statut pour être sûr
    setTimeout(() => {
      if (job && user && isCandidate) {
        checkApplicationAndMessageStatus();
      }
    }, 1000);
  };

  // Optimisation du chargement avec cache et vérification de changement d'onglet
  useEffect(() => {
    if (id) {
      const cacheKey = `job-${id}`;
      
      if (dataCache.has(cacheKey)) {
        const cachedData = dataCache.get(cacheKey);
        setJob(cachedData.job);
        setEmployerProfile(cachedData.employerProfile);
        setLoading(false);
      } else {
        loadJobDetail();
      }
      
      if (!dataCache.has('recent-jobs')) {
        loadRecentJobs();
      } else {
        setRecentJobs(dataCache.get('recent-jobs'));
      }
      
      incrementViewCount();
    }
  }, [id]);
  

  useEffect(() => {
    if (job && user && isCandidate) {
      checkApplicationAndMessageStatus();
      checkIfSaved();
    } else if (!user || !isCandidate) {
      setCheckingApplicationStatus(false);
    }
  }, [job, user, isCandidate, isPremium]);

  const loadJobDetail = async () => {
    try {
      setLoading(true);
      
      const jobData = await databases.getDocument(
        DATABASE_ID,
        'jobs',
        id
      );
  
      if (!jobData.is_active) {
        throw new Error('Cette offre n\'est plus active');
      }
  
      setJob(jobData);
      console.log('Offre chargée:', jobData);
  
      if (jobData.employer_id) {
        try {
          console.log('Chargement du profil pour employer_id:', jobData.employer_id);
          
          const profileData = await databases.getDocument(
            DATABASE_ID,
            'profiles',
            jobData.employer_id
          );
  
          if (profileData) {
            console.log('Profil employeur chargé:', profileData);
            setEmployerProfile(profileData);
          } else {
            console.log('Aucun profil employeur trouvé pour cet ID');
            setEmployerProfile(null);
          }
        } catch (profileErr) {
          console.error('Erreur lors du chargement du profil employeur:', profileErr);
          setEmployerProfile(null);
        }
      }
  
      dataCache.set(`job-${id}`, {
        job: jobData,
        employerProfile: employerProfile
      });
  
    } catch (err) {
      console.error('Erreur générale lors du chargement:', err);
      setError('Erreur lors du chargement de l\'offre');
    } finally {
      setLoading(false);
    }
  };

  const loadRecentJobs = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        'jobs',
        [
          Query.equal('is_active', true),
          Query.notEqual('$id', id),
          Query.orderDesc('$createdAt'),
          Query.limit(5)
        ]
      );
  
      const jobsData = response.documents || [];
      setRecentJobs(jobsData);
      
      dataCache.set('recent-jobs', jobsData);
    } catch (error) {
      console.error('Erreur lors du chargement des offres récentes:', error);
    }
  };

  const checkApplicationAndMessageStatus = async () => {
    if (!user || !isCandidate || !job || !job.employer_id) {
      setHasApplied(false);
      setHasSentDirectMessage(false);
      setCheckingApplicationStatus(false);
      return;
    }
  
    setCheckingApplicationStatus(true);
    
    try {
      // Vérifier si le candidat a déjà postulé
      const applicationResponse = await databases.listDocuments(
        DATABASE_ID,
        'applications',
        [
          Query.equal('job_id', id),
          Query.equal('candidate_id', user.$id),
          Query.limit(1)
        ]
      );
  
      const hasApplications = applicationResponse.documents.length > 0;
      setHasApplied(hasApplications);
      
      if (hasApplications) {
        setApplicationData(applicationResponse.documents[0]);
      }
  
      // Si le candidat a postulé ET qu'il est premium, vérifier les messages directs
      if (hasApplications && isPremium && job.employer_id) { // Vérification supplémentaire
        try {
          const messageResponse = await databases.listDocuments(
            DATABASE_ID,
            'messages',
            [
              Query.equal('sender_id', user.$id),
              Query.equal('receiver_id', job.employer_id),
              Query.equal('job_id', id),
              Query.equal('message_type', 'direct_contact'),
              Query.limit(1)
            ]
          );
  
          setHasSentDirectMessage(messageResponse.documents.length > 0);
        } catch (messageError) {
          console.warn('Erreur lors de la vérification des messages directs:', messageError);
          setHasSentDirectMessage(false);
        }
      } else {
        setHasSentDirectMessage(false);
      }
  
    } catch (error) {
      console.error('Erreur lors de la vérification du statut de candidature:', error);
      setHasApplied(false);
      setHasSentDirectMessage(false);
    } finally {
      setCheckingApplicationStatus(false);
    }
  };
  
  const checkIfSaved = async () => {
  if (!user || !isCandidate) {
    setIsSaved(false);
    return;
  }

  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      'saved_jobs',
      [
        Query.equal('job_id', id),
        Query.equal('candidate_id', user.$id),
        Query.limit(1)
      ]
    );

    setIsSaved(response.documents.length > 0);
  } catch (error) {
    console.warn('Erreur lors de la vérification de sauvegarde:', error);
    setIsSaved(false);
  }
};

  const handleSaveJob = async () => {
    if (!user || !isCandidate) return;
    
    setSavingBookmark(true);
    try {
      if (isSaved) {
        const response = await databases.listDocuments(
          DATABASE_ID,
          'saved_jobs',
          [
            Query.equal('job_id', id),
            Query.equal('candidate_id', user.$id)
          ]
        );
  
        if (response.documents.length > 0) {
          await databases.deleteDocument(
            DATABASE_ID,
            'saved_jobs',
            response.documents[0].$id
          );
        }
        setIsSaved(false);
      } else {
        await databases.createDocument(
          DATABASE_ID,
          'saved_jobs',
          'unique()',
          {
            job_id: id,
            candidate_id: user.$id,
            saved_at: new Date().toISOString()
          }
        );
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setSavingBookmark(false);
    }
  };

  const incrementViewCount = async () => {
    try {
      const jobData = await databases.getDocument(DATABASE_ID, 'jobs', id);
      const newViewCount = (jobData.views_count || 0) + 1;
      
      await databases.updateDocument(
        DATABASE_ID,
        'jobs',
        id,
        { views_count: newViewCount }
      );
    } catch (error) {
      console.error('Erreur lors de l\'incrémentation des vues:', error);
    }
  };

  const handleApply = async (applicationData) => {
    try {
      // Définir la taille maximale autorisée
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      // Vérification de taille AVANT upload
      if (applicationData.cv && applicationData.cv.size > maxSize) {
        throw new Error('Le CV est trop volumineux (maximum 5MB autorisé)');
      }
  
      if (applicationData.additionalDocs) {
        for (const doc of applicationData.additionalDocs) {
          if (doc && doc.size > maxSize) {
            throw new Error(`Le document "${doc.name}" est trop volumineux (maximum 5MB autorisé)`);
          }
        }
      }
  
      let cvUrl = null;
      let additionalDocsUrls = [];
      
      // Upload du CV
      if (applicationData.useExistingCV && profile?.cv_url) {
        cvUrl = profile.cv_url;
        console.log('✅ Utilisation CV existant:', cvUrl);
      } else if (applicationData.cv) {
        try {
          console.log('Upload nouveau CV...');
          const uploadedFile = await storage.createFile(
            'documents',
            'unique()',
            applicationData.cv
          );
          cvUrl = storage.getFileView('documents', uploadedFile.$id);
          console.log('✅ CV uploadé:', cvUrl);
        } catch (uploadError) {
          console.error('Erreur upload CV:', uploadError);
          throw new Error('Échec de l\'upload du CV. Vérifiez la taille et le format du fichier.');
        }
      }
  
      // Upload des documents supplémentaires
      if (applicationData.additionalDocs && applicationData.additionalDocs.length > 0) {
        for (const doc of applicationData.additionalDocs) {
          if (doc) {
            try {
              console.log('Upload document supplémentaire:', doc.name);
              const uploadedFile = await storage.createFile(
                'documents',
                'unique()',
                doc
              );
              // Stocker seulement l'URL, pas l'objet complet
              additionalDocsUrls.push(storage.getFileView('documents', uploadedFile.$id));
            } catch (uploadError) {
              console.error('Erreur upload document:', uploadError);
              throw new Error(`Échec de l'upload du document "${doc.name}"`);
            }
          }
        }
      }
      
      // Puis dans la création du document :
      const applicationRecord = await databases.createDocument(
        DATABASE_ID,
        'applications',
        'unique()',
        {
          job_id: job.$id,
          candidate_id: user.$id,
          cover_letter: applicationData.coverLetter,
          cv_url: cvUrl,
          additional_documents: additionalDocsUrls,
          status: 'pending',
          applied_at: new Date().toISOString(),
          created_at: new Date().toISOString(), 
          updated_at: new Date().toISOString()   
        }
      );
  
      setHasApplied(true);
  
      // Envoyer via API AWS SES avec pièces jointes
      try {
        const formData = new FormData();
        
        formData.append('recruiterEmail', employerProfile?.email || job.contact_email);
        formData.append('recruiterName', employerProfile?.full_name || job.company_name);
        formData.append('candidateData', JSON.stringify({
          name: profile?.full_name || profile?.name,
          email: profile?.email,
          phone: profile?.phone,
          coverLetter: applicationData.coverLetter,
          cvUrl: cvUrl,
          additionalDocsCount: additionalDocsUrls.length
        }));
        formData.append('jobData', JSON.stringify({
          id: job.$id,
          title: job.title,
          company_name: job.company_name
        }));
  
        // Ajouter le CV comme pièce jointe si disponible
        if (applicationData.cv) {
          formData.append('attachments', applicationData.cv);
        }
  
        // Ajouter les documents supplémentaires
        if (applicationData.additionalDocs) {
          applicationData.additionalDocs.forEach(doc => {
            if (doc) formData.append('attachments', doc);
          });
        }
  
        const response = await fetch('https://api.job2mada.com/api/send-application-email', {
          method: 'POST',
          body: formData
        });
  
        const emailResult = await response.json();
        
        if (emailResult.success) {
          console.log('Email AWS SES envoyé:', emailResult.messageId);
        } else {
          console.warn('Échec email:', emailResult.error);
        }
  
      } catch (emailError) {
        console.error('Erreur email AWS:', emailError);
      }
  
      console.log('Candidature envoyée avec succès');
      
    } catch (error) {
      console.error('Erreur candidature:', error);
      throw error;
    }
  };

  const shareJob = (platform) => {
    const url = window.location.href;
    const title = `${job.title} - ${job.company_name}`;
    const description = `Découvrez cette offre d'emploi : ${job.title} chez ${job.company_name} à ${job.location}`;
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  // Fonction pour copier le lien
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert('Lien copié dans le presse-papiers !');
    });
  };

  // Modal de partage
  const ShareModal = () => {
    if (!showShareModal) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border-4 border-job-gold">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-job-brown">🚀 Partager cette offre</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 hover:bg-job-cream rounded-xl transition-all"
              >
                <X className="h-6 w-6 text-gray-400" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => shareJob('facebook')}
                className="flex items-center justify-center p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all transform hover:scale-105"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">📘</div>
                  <span className="text-sm font-medium">Facebook</span>
                </div>
              </button>

              <button
                onClick={() => shareJob('linkedin')}
                className="flex items-center justify-center p-4 bg-blue-800 hover:bg-blue-900 text-white rounded-xl transition-all transform hover:scale-105"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">💼</div>
                  <span className="text-sm font-medium">LinkedIn</span>
                </div>
              </button>

              <button
                onClick={() => shareJob('twitter')}
                className="flex items-center justify-center p-4 bg-sky-500 hover:bg-sky-600 text-white rounded-xl transition-all transform hover:scale-105"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">🐦</div>
                  <span className="text-sm font-medium">Twitter</span>
                </div>
              </button>

              <button
                onClick={() => shareJob('whatsapp')}
                className="flex items-center justify-center p-4 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all transform hover:scale-105"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">💬</div>
                  <span className="text-sm font-medium">WhatsApp</span>
                </div>
              </button>
            </div>

            <div className="border-t pt-4">
              <button
                onClick={copyLink}
                className="w-full flex items-center justify-center p-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">🔗</div>
                  <span className="text-sm font-medium">Copier le lien</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const formatRichText = (htmlString) => {
    if (!htmlString) return '';
    const cleanHtml = htmlString
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '');
    return cleanHtml;
  };

  const getFormattedDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const generateJobSchema = () => {
    if (!job) return null;
    
    return {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      "title": job.title,
      "description": job.description?.replace(/<[^>]*>/g, '').substring(0, 500) || '',
      "datePosted": job.created_at || job.$createdAt,
      "validThrough": job.application_deadline || undefined,
      "employmentType": (job.employment_type || 'FULL_TIME').toUpperCase().replace('-', '_'),
      "hiringOrganization": {
        "@type": "Organization",
        "name": job.company_name,
        "sameAs": job.company_website || `https://job2mada.com/entreprises/${job.employer_id}`,
        "logo": employerProfile?.company_logo_url || "https://job2mada.com/logo.png"
      },
      "jobLocation": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": job.location,
          "addressRegion": job.location,
          "addressCountry": "MG"
        }
      },
      "baseSalary": job.salary_min && job.salary_max ? {
        "@type": "MonetaryAmount",
        "currency": job.salary_currency || "MGA",
        "value": {
          "@type": "QuantitativeValue",
          "minValue": job.salary_min,
          "maxValue": job.salary_max,
          "unitText": "MONTH"
        }
      } : undefined,
      "skills": job.requirements?.join(', ') || undefined,
      "qualifications": job.experience_level || undefined,
      "jobBenefits": job.benefits?.join(', ') || undefined,
      "workHours": job.contract_type || undefined,
      "url": `https://job2mada.com/jobs/${job.$id}`,
      "identifier": {
        "@type": "PropertyValue",
        "name": "Job2mada",
        "value": job.$id
      },
      "directApply": true,
      "applicantLocationRequirements": {
        "@type": "Country",
        "name": "Madagascar"
      }
    };
  };
  
  // Fonction pour nettoyer la description
  const cleanDescription = (html) => {
    if (!html) return '';
    return html
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 155);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-job-gold mx-auto mb-4"></div>
          <p className="text-job-brown font-medium">Chargement de l'offre...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
        <Navbar />
        <div className="pt-32 pb-16">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Offre non trouvée</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <Button onClick={() => navigate('/jobs')} className="bg-job-gold hover:bg-job-dark-gold">
              Retour aux offres
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
      <>
    {/* ✅ HELMET AVEC TOUS LES META TAGS OPTIMISÉS */}
    <Helmet>
      {/* Title optimisé SEO */}
      <title>
        {job.title} - {job.company_name} à {job.location} | Emploi Madagascar - Job2mada
      </title>
      
      {/* Meta description riche en mots-clés */}
      <meta 
        name="description" 
        content={`Offre d'emploi ${job.title} chez ${job.company_name} à ${job.location}, Madagascar. ${cleanDescription(job.description)}. Postulez sur Job2mada, plateforme emploi Madagascar.`}
      />
      
      {/* Keywords ciblés */}
      <meta 
        name="keywords" 
        content={`${job.title}, emploi ${job.location}, job ${job.location.toLowerCase()}, offre emploi madagascar, ${job.category.toLowerCase()}, ${job.company_name}, recrutement madagascar, travail ${job.location.toLowerCase()}, carrière madagascar, job2mada`}
      />
      
      {/* Canonical URL */}
      <link rel="canonical" href={`https://job2mada.com/jobs/${job.$id}`} />
      
      {/* Open Graph - Facebook/LinkedIn */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={`${job.title} - ${job.company_name} | Job2mada Madagascar`} />
      <meta 
        property="og:description" 
        content={`Postulez pour ${job.title} à ${job.location}. ${job.company_name} recrute sur Job2mada, plateforme emploi Madagascar.`}
      />
      <meta property="og:url" content={`https://job2mada.com/jobs/${job.$id}`} />
      <meta property="og:site_name" content="Job2mada - Emploi Madagascar" />
      <meta property="og:image" content={employerProfile?.company_logo_url || "https://job2mada.com/images/job2mada-social.jpg"} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="fr_MG" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`${job.title} - Job2mada Madagascar`} />
      <meta 
        name="twitter:description" 
        content={`${job.company_name} recrute à ${job.location}. Offre d'emploi ${job.title} - Postulez maintenant sur Job2mada.`}
      />
      <meta name="twitter:image" content={employerProfile?.company_logo_url || "https://job2mada.com/images/job2mada-social.jpg"} />
      <meta name="twitter:site" content="@job2mada" />
      
      {/* Geo tags - Important pour SEO local */}
      <meta name="geo.region" content="MG" />
      <meta name="geo.country" content="Madagascar" />
      <meta name="geo.placename" content={job.location} />
      
      {/* Robots */}
      <meta name="robots" content="index, follow, max-image-preview:large" />
      
      {/* Schema.org JobPosting - LE PLUS IMPORTANT POUR GOOGLE JOBS */}
      <script type="application/ld+json">
        {JSON.stringify(generateJobSchema())}
      </script>
      
      {/* Schema.org BreadcrumbList pour navigation */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Accueil",
              "item": "https://job2mada.com"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Offres d'emploi Madagascar",
              "item": "https://job2mada.com/emplois"
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": job.category,
              "item": `https://job2mada.com/emplois?category=${encodeURIComponent(job.category)}`
            },
            {
              "@type": "ListItem",
              "position": 4,
              "name": `${job.title} - ${job.location}`,
              "item": `https://job2mada.com/jobs/${job.$id}`
            }
          ]
        })}
      </script>
    </Helmet>

    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      <Navbar />
      
      {/* Header avec breadcrumb - Responsive */}
      <section className="pt-20 md:pt-32 pb-8 bg-gradient-to-r from-job-gold to-job-dark-gold text-white">
      <div className="mt-4 max-w-[1600px] mx-auto px-3 md:px-6">
          <div className="flex items-center space-x-2 md:space-x-4 mb-4 md:mb-6">
            <button
              onClick={() => navigate('/jobs')}
              className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
              <span className="text-sm md:text-base text-job-dark-brown bg-job-purple rounded-l">Retour aux offres</span>
            </button>
            <ChevronRight className="h-3 w-3 md:h-4 md:w-4 text-white/60" />
            <span className="text-white/90 text-sm md:text-base truncate">{job.title}</span>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
                <h1 className="text-2xl md:text-4xl font-bold">{job.title}</h1>
                <div className="flex gap-2">
                  {job.is_featured && (
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-xs md:text-sm font-medium flex items-center">
                      <Star className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                      Mis en avant
                    </div>
                  )}
                  {job.is_urgent && (
                    <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-xs md:text-sm font-medium flex items-center animate-pulse">
                      <Zap className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                      Urgent
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-white/90 mb-6">
                <span className="text-lg md:text-xl font-semibold">{job.company_name}</span>
                <div className="flex flex-wrap gap-4 text-sm md:text-base">
                  <span className="flex items-center">
                    <MapPin className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                    {job.location}
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                    {getFormattedDate(job.created_at)}
                  </span>
                  <span className="flex items-center">
                    <Eye className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                    {job.views_count || 0} vues
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
              {/* Bouton "Publier une autre offre" pour les recruteurs */}
              {isEmployer && (
                <>
                  <ChevronRight className="h-4 w-4 text-white/60 hidden md:block" />
                  <Button
                    onClick={() => navigate('/jobs/create')}
                    className="bg-gradient-to-br from-job-purple to-job-pink text-white border-white/30 hover:border-white/50 transition-all text-sm md:text-base"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Publier une autre offre</span>
                    <span className="sm:hidden">Publier</span>
                  </Button>
                </>
              )}
              {/* Bouton cœur - masqué pour les recruteurs */}
              {!isEmployer && (
                <button 
                  onClick={handleSaveJob}
                  disabled={savingBookmark}
                  className={`p-2 md:p-3 rounded-full transition-all ${
                    isSaved 
                      ? 'bg-red-500 text-white hover:bg-red-600' 
                      : 'bg-white/20 hover:bg-white/30 text-white'
                  }`}
                >
                  {savingBookmark ? (
                    <div className="animate-spin rounded-full h-5 w-5 md:h-6 w-6 border-b-2 border-white"></div>
                  ) : (
                    <Heart className={`h-5 w-5 md:h-6 md:w-6 ${isSaved ? 'fill-current' : ''}`} />
                  )}
                </button>
              )}
              
              <button 
                onClick={() => setShowShareModal(true)}
                className="p-2 md:p-3 bg-white/20 hover:bg-white/30 rounded-full transition-all"
              >
                <Share2 className="h-5 w-5 md:h-6 md:w-6" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Contenu principal - Layout responsive */}
      <div className="w-full p-2 md:p-4"> {/* ← Changé de p-4 md:p-8 à p-2 md:p-4 */}
      <div className="max-w-[1600px] mx-auto">
          
          {/* Layout adaptatif : colonne unique sur mobile, 3 colonnes sur desktop */}
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            
            {/* Colonne gauche - Widgets publicitaires - Masquée sur mobile */}
            <div className="hidden lg:block lg:w-[20%]"> {/* ← Changé de lg:w-1/4 (25%) à lg:w-[20%] */}
              <div className="sticky top-24 space-y-4">
                {/* Widget Premium Candidat */}
                <div className="bg-gradient-to-br from-job-purple to-job-pink rounded-3xl p-6 text-white shadow-2xl transform hover:scale-105 transition-transform">
                  <div className="flex items-center justify-between mb-4">
                    <Crown className="h-12 w-12 text-white" />
                    <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold">
                      PREMIUM
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-3">
                    Accès Direct Recruteur
                  </h3>
                  <p className="text-white/90 mb-4 text-sm">
                    Contactez directement les recruteurs et augmentez vos chances de 300% !
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center text-sm">
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mr-3">
                        <Phone className="h-3 w-3" />
                      </div>
                      <span>Contact direct recruteur</span>
                    </li>
                    <li className="flex items-center text-sm">
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mr-3">
                        <Mail className="h-3 w-3" />
                      </div>
                      <span>Email professionnel</span>
                    </li>
                    <li className="flex items-center text-sm">
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mr-3">
                        <Target className="h-3 w-3" />
                      </div>
                      <span>Priorité sur les candidatures</span>
                    </li>
                  </ul>
                </div>

                {/* Widget Conseils */}
                <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                  <div className="flex items-center mb-4">
                    <Sparkles className="h-6 w-6 text-job-gold mr-3" />
                    <h3 className="font-bold text-job-brown">Conseils pour postuler</h3>
                  </div>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-job-gold rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Personnalisez votre lettre de motivation</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-job-gold rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Mettez en avant vos compétences clés</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-job-gold rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Relisez votre candidature avant envoi</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-job-gold rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Postulez rapidement, les recruteurs apprécient</span>
                    </li>
                  </ul>
                </div>

                {/* Widget Statistiques */}
                <div className="bg-gradient-to-br from-job-blue via-indigo-500 to-job-purple rounded-2xl p-6 text-white shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold flex items-center">
                      <Activity className="h-5 w-5 mr-2" />
                      Marché de l'emploi
                    </h3>
                    <TrendingUp className="h-5 w-5 text-white/50" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white/80 text-sm">Nouvelles offres</span>
                      <span className="font-bold text-lg">+47</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/80 text-sm">Cette semaine</span>
                      <span className="font-bold text-lg">156</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/80 text-sm">Taux d'embauche</span>
                      <span className="font-bold text-lg">73%</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <div className="flex items-center justify-center">
                      <Shield className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">Données vérifiées</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne centrale - Détails de l'offre - Responsive */}
            <div className="w-full lg:w-[60%]"> {/* ← Changé de lg:w-1/2 (50%) à lg:w-[60%] */}
        <div className="bg-white rounded-3xl shadow-xl border-2 border-job-gold p-4 md:p-6"> {/* ← Changé p-4 md:p-8 à p-4 md:p-6 */}
                {/* En-tête de l'offre avec logo de l'entreprise */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6 mb-8">
                  {/* Logo de l'entreprise */}
                  <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg border-2 border-gray-100 bg-white overflow-hidden mx-auto sm:mx-0">
                    {employerProfile?.company_logo_url ? (
                      <img 
                        src={employerProfile.company_logo_url} 
                        alt={`Logo ${job.company_name}`}
                        className="w-full h-full object-contain p-2"
                        onError={(e) => {
                          console.log('Erreur chargement logo:', e);
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.parentNode?.querySelector('.fallback-icon') as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className={`fallback-icon w-full h-full bg-gradient-to-r from-job-gold to-job-orange rounded-xl flex items-center justify-center ${employerProfile?.company_logo_url ? 'hidden' : 'flex'}`}
                    >
                      <Building className="h-8 w-8 md:h-10 md:w-10 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                      <h2 className="text-xl md:text-2xl font-bold text-job-brown">{job.title}</h2>
                      <div className="flex gap-2 justify-center sm:justify-start">
                        {job.is_featured && (
                          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
                            <Star className="h-3 w-3 mr-1" />
                            Mis en avant
                          </div>
                        )}
                        {job.is_urgent && (
                          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center animate-pulse">
                            <Zap className="h-3 w-3 mr-1" />
                            Urgent
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-job-gold font-semibold text-lg mb-2">{job.company_name}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4 justify-center sm:justify-start">
                      <span className="px-3 md:px-4 py-1 md:py-2 bg-job-cream text-job-brown text-xs md:text-sm font-medium rounded-full border border-job-gold">
                        {job.category}
                      </span>
                      <span className="px-3 md:px-4 py-1 md:py-2 bg-blue-50 text-blue-600 text-xs md:text-sm font-medium rounded-full">
                        {contractTypes[job.contract_type] || job.contract_type}
                      </span>
                      <span className="px-3 md:px-4 py-1 md:py-2 bg-green-50 text-green-600 text-xs md:text-sm font-medium rounded-full">
                        {experienceLevels[job.experience_level] || job.experience_level}
                      </span>
                      {job.remote_work && (
                        <span className="px-3 md:px-4 py-1 md:py-2 bg-purple-50 text-purple-600 text-xs md:text-sm font-medium rounded-full">
                          Remote
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Informations clés - Responsive */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8 p-4 md:p-6 bg-gradient-to-br from-job-light-gold via-job-cream to-job-light-gold rounded-2xl border-2 border-job-gold">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-job-gold mr-3" />
                      <div>
                        <p className="text-xs text-gray-600 uppercase font-semibold">Localisation</p>
                        <p className="text-job-brown font-medium">{job.location}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Briefcase className="h-5 w-5 text-job-gold mr-3" />
                      <div>
                        <p className="text-xs text-gray-600 uppercase font-semibold">Type d'emploi</p>
                        <p className="text-job-brown font-medium">{employmentTypes[job.employment_type] || job.employment_type}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-job-gold mr-3" />
                      <div>
                        <p className="text-xs text-gray-600 uppercase font-semibold">Expérience</p>
                        <p className="text-job-brown font-medium">{experienceLevels[job.experience_level] || job.experience_level}</p>
                      </div>
                    </div>
                    
                    {job.application_deadline && (
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-job-gold mr-3" />
                        <div>
                          <p className="text-xs text-gray-600 uppercase font-semibold">Date limite</p>
                          <p className="text-job-brown font-medium">
                            {new Date(job.application_deadline).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description avec formatage amélioré */}
                <div className="mb-8">
                  <h3 className="text-lg md:text-xl font-bold text-job-brown mb-4 flex items-center">
                    <FileText className="h-5 w-5 md:h-6 md:w-6 mr-3 text-job-gold" />
                    Description du poste
                  </h3>
                  <div 
                    className="prose prose-sm md:prose-lg max-w-none text-gray-700 leading-relaxed formatted-content"
                    dangerouslySetInnerHTML={{ __html: formatRichText(job.description) }}
                    style={{
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      hyphens: 'auto',
                      lineHeight: '1.7'
                    }}
                  />
                </div>

                {/* Avantages */}
                {job.benefits && job.benefits.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg md:text-xl font-bold text-job-brown mb-4 flex items-center">
                      <Gift className="h-5 w-5 md:h-6 md:w-6 mr-3 text-job-gold" />
                      Avantages
                    </h3>
                    <ul className="grid grid-cols-1 gap-3">
                      {job.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center p-3 bg-green-50 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-gray-700">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Exigences */}
                {job.requirements && job.requirements.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg md:text-xl font-bold text-job-brown mb-4 flex items-center">
                      <Target className="h-5 w-5 md:h-6 md:w-6 mr-3 text-job-gold" />
                      Exigences et qualifications
                    </h3>
                    <ul className="space-y-3">
                      {job.requirements.map((requirement, index) => (
                        <li key={index} className="flex items-start p-3 bg-blue-50 rounded-lg">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                            <span className="text-white text-xs font-bold">{index + 1}</span>
                          </div>
                          <span className="text-gray-700">{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Informations entreprise */}
                <div className="mb-8 p-4 md:p-6 bg-gray-50 rounded-2xl border border-gray-200">
                  <h3 className="text-lg md:text-xl font-bold text-job-brown mb-4 flex items-center">
                    <Building className="h-5 w-5 md:h-6 md:w-6 mr-3 text-job-gold" />
                    À propos de l'entreprise
                  </h3>
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                      <span className="text-gray-600">Nom de l'entreprise</span>
                      <span className="font-semibold text-job-brown">{job.company_name}</span>
                    </div>
                    {job.company_website && (
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                        <span className="text-gray-600">Site web</span>
                        <a 
                          href={job.company_website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-job-gold hover:text-job-dark-gold font-medium flex items-center"
                        >
                          Visiter
                          <ExternalLink className="h-4 w-4 ml-1" />
                        </a>
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                      <span className="text-gray-600">Secteur</span>
                      <span className="font-semibold text-job-brown">{job.category}</span>
                    </div>
                  </div>
                </div>

                {/* Boutons d'action - Responsive */}
                {isCandidate ? (
  <div className="space-y-4">
    {checkingApplicationStatus ? (
      // Affichage de chargement pendant la vérification
      <div className="text-center p-6 bg-gray-50 rounded-2xl border-2 border-gray-300">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Vérification du statut de candidature...</p>
      </div>
    ) : hasApplied ? (
      isPremium ? (
        hassentDirectMessage ? (
          // Message direct déjà envoyé - Redirection vers messagerie
          <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200">
            <CheckCircle className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h4 className="text-lg font-bold text-blue-700 mb-2">
              Message direct envoyé
            </h4>
            <p className="text-blue-600 mb-4">
              Votre message direct a été envoyé au recruteur. Consultez votre messagerie pour suivre la conversation.
            </p>
            <button
              onClick={() => navigate('/messages')}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-3 mx-auto"
            >
              <MessageSquare className="h-5 w-5" />
              <span>Voir la messagerie</span>
            </button>
          </div>
        ) : (
          // Candidat Premium qui a postulé mais pas encore envoyé de message direct
          <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200">
            <BadgeCheck className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h4 className="text-lg font-bold text-green-700 mb-2">
              Candidature envoyée - Accès Premium
            </h4>
            <p className="text-green-600 mb-4">
              Votre candidature a été envoyée ! En tant que membre premium, vous pouvez maintenant contacter directement le recruteur.
            </p>
            <button
              onClick={() => setShowDirectMessageModal(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-3 mx-auto"
            >
              <MessageSquare className="h-5 w-5" />
              <span>Envoyer un message direct</span>
              <Crown className="h-5 w-5" />
            </button>
          </div>
        )
      ) : (
        // Candidat non-Premium qui a déjà postulé
        <div className="text-center p-6 bg-gray-100 rounded-2xl border-2 border-gray-300">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h4 className="text-lg font-bold text-gray-700 mb-2">
            Vous avez déjà postulé à cette offre
          </h4>
          {applicationData && (
            <p className="text-gray-600 mb-2">
            Candidature envoyée le {new Date(applicationData.applied_at).toLocaleDateString('fr-FR')}
          </p>
          )}
          <p className="text-gray-600 mb-4">
            Attendez la réponse du recruteur ou souscrivez à un abonnement premium pour envoyer des messages directs au recruteur !
          </p>
          <PremiumButton 
            variant="default"
            className="w-full md:w-auto"
          >
            Passer au Premium
          </PremiumButton>
        </div>
      )
    ) : (
      // Candidat qui n'a pas encore postulé
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={() => setShowApplicationModal(true)}
          className="flex-1 bg-gradient-to-r from-job-gold to-job-dark-gold hover:from-job-dark-gold hover:to-job-gold text-white py-3 md:py-4 text-base md:text-lg font-bold shadow-lg hover:shadow-xl transition-all"
        >
          <Send className="h-4 w-4 md:h-5 md:w-5 mr-3" />
          Postuler maintenant
        </Button>
        <Button
          onClick={handleSaveJob}
          disabled={savingBookmark}
          variant="outline"
          className={`px-4 md:px-6 py-3 md:py-4 border-2 transition-all ${
            isSaved 
              ? 'border-red-500 text-red-500 bg-red-50 hover:bg-red-100' 
              : 'border-job-gold text-job-gold hover:bg-job-cream'
          }`}
        >
          {savingBookmark ? (
            <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-b-2 border-current"></div>
          ) : (
            <Heart className={`h-4 w-4 md:h-5 md:w-5 ${isSaved ? 'fill-current' : ''}`} />
          )}
        </Button>
      </div>
    )}
  </div>
) : (
  /* Message magnifique pour utilisateurs non connectés */
  <div className="space-y-4">
    <div className="text-center p-6 md:p-8 bg-gradient-to-br from-job-light-gold via-job-cream to-job-light-gold rounded-3xl border-4 border-job-gold shadow-2xl">
      <div className="relative mb-6">
        <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-gradient-to-r from-job-gold to-job-dark-gold rounded-full flex items-center justify-center shadow-lg">
          <Users className="h-8 w-8 md:h-10 md:w-10 text-white" />
        </div>
        <div className="absolute -top-2 -right-2 w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
          <span className="text-white text-xs font-bold">!</span>
        </div>
      </div>
      
      <h3 className="text-xl md:text-2xl font-bold text-job-brown mb-3">
        L'Offre vous intéresse ?
      </h3>
      <p className="text-job-brown/80 text-base md:text-lg mb-6 leading-relaxed">
        <strong>Connectez-vous</strong> ou <strong>créez un compte candidat</strong> pour postuler !
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={() => navigate('/login', { 
            state: { 
              from: `/jobs/${job.$id}`, 
              message: 'Connectez-vous pour postuler à cette offre' 
            } 
          })}
          className="flex-1 bg-gradient-to-r from-job-gold to-job-dark-gold hover:from-job-dark-gold hover:to-job-gold text-white py-3 md:py-4 text-base md:text-lg font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
        >
          <Users className="h-4 w-4 md:h-5 md:w-5 mr-3" />
          Se connecter
        </Button>
        <Button
          onClick={() => navigate('/register', { 
            state: { 
              from: `/jobs/${job.$id}`, 
              message: 'Créez votre compte pour postuler' 
            } 
          })}
          variant="outline"
          className="flex-1 border-2 border-job-gold text-job-gold hover:bg-job-cream py-3 md:py-4 text-base md:text-lg font-bold transition-all transform hover:scale-105"
        >
          <Plus className="h-4 w-4 md:h-5 md:w-5 mr-3" />
          Créer un compte
        </Button>
      </div>
      
      <div className="mt-6 p-4 bg-white/50 rounded-2xl border border-job-gold/30">
        <p className="text-sm text-job-brown/70 flex items-center justify-center space-x-2">
          <Shield className="h-4 w-4 text-job-gold" />
          <span>Vos données sont sécurisées et ne seront jamais partagées</span>
        </p>
      </div>
    </div>
    
    {/* Message pour les employeurs */}
    {isEmployer && (
      <div className="text-center p-6 bg-blue-50 rounded-2xl border-2 border-blue-200">
        <Building className="h-12 w-12 text-blue-500 mx-auto mb-4" />
        <h4 className="text-lg font-bold text-blue-700 mb-2">
          Vous êtes recruteur!! 
        </h4>
        <p className="text-blue-600 mb-4">
          Vous consultez cette offre en tant qu'employeur. Pour postuler, connectez-vous avec un compte candidat.
        </p>
        <Button
          onClick={() => navigate('/jobs/create')}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6"
        >
          <Plus className="h-5 w-5 mr-2" />
          Publier une offre
        </Button>
      </div>
    )}
  </div>
)}
              </div>
            </div>

            {/* Colonne droite - Carrousel et widgets - Masquée sur mobile, visible sur desktop */}
            <div className="hidden lg:block lg:w-[20%]"> {/* ← Changé de lg:w-1/4 (25%) à lg:w-[20%] */}
            <div className="sticky top-24 space-y-4">
                {/* Carrousel vertical des dernières offres */}
                <VerticalJobCarousel jobs={recentJobs} />

        {/* Widget Premium conditionnel selon le type d'utilisateur et le statut premium */}
        {isCandidate ? (
          // CANDIDAT
          isPremium ? (
            // Candidat Premium - Widget informatif
            <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-xl">
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
                  <Star className="h-4 w-4 mr-2" />
                  <span>Priorité candidatures ✓</span>
                </div>
                <div className="flex items-center text-sm">
                  <Zap className="h-4 w-4 mr-2" />
                  <span>Réponse sous 48h ✓</span>
                </div>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold mb-1">Abonnement Actif</div>
                  <div className="text-xs text-white/80">Renouvelé automatiquement</div>
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
            // Candidat non-Premium - Widget promotion
            <div className="bg-gradient-to-br from-job-gold via-job-orange to-job-dark-gold rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold flex items-center">
                  <Crown className="h-5 w-5 mr-2" />
                  Accès Premium
                </h3>
                <Rocket className="h-5 w-5 text-white/50" />
              </div>
              
              <p className="text-white/90 text-sm mb-4">
                Contactez directement ce recruteur et démarquez-vous !
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm">
                  <BadgeCheck className="h-4 w-4 mr-2" />
                  <span>Contact direct garanti</span>
                </div>
                <div className="flex items-center text-sm">
                  <Star className="h-4 w-4 mr-2" />
                  <span>Priorité sur les candidatures</span>
                </div>
                <div className="flex items-center text-sm">
                  <Zap className="h-4 w-4 mr-2" />
                  <span>Réponse sous 48h</span>
                </div>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1">15.000 Ar</div>
                  <div className="text-xs text-white/80">par mois</div>
                </div>
              </div>
              
              <PremiumButton 
                variant="default"
                className="w-full"
              >
                Passer au Premium
              </PremiumButton>
            </div>
          )
        ) : isEmployer ? (
          // RECRUTEUR
          isPremium ? (
            // Recruteur Premium - Widget informatif
            <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold flex items-center">
                  <BadgeCheck className="h-5 w-5 mr-2" />
                  Premium Actif
                </h3>
                <Building className="h-5 w-5 text-white/50" />
              </div>
              
              <p className="text-white/90 text-sm mb-4">
                Votre abonnement premium vous donne accès à tous les services !
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>Contact services illimité ✓</span>
                </div>
                <div className="flex items-center text-sm">
                  <Star className="h-4 w-4 mr-2" />
                  <span>Offres mises en avant ✓</span>
                </div>
                <div className="flex items-center text-sm">
                  <Target className="h-4 w-4 mr-2" />
                  <span>Statistiques avancées ✓</span>
                </div>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold mb-1">Abonnement Actif</div>
                  <div className="text-xs text-white/80">Accès complet aux services</div>
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
            // Recruteur non-Premium - Widget promotion
            <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold flex items-center">
                  <Crown className="h-5 w-5 mr-2" />
                  Premium Recruteur
                </h3>
                <Building className="h-5 w-5 text-white/50" />
              </div>
              
              <p className="text-white/90 text-sm mb-4">
                Accédez aux meilleurs services et contactez directement les prestataires !
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm">
                  <Users className="h-4 w-4 mr-2" />
                  <span>Contact services illimité</span>
                </div>
                <div className="flex items-center text-sm">
                  <Star className="h-4 w-4 mr-2" />
                  <span>Offres à la une</span>
                </div>
                <div className="flex items-center text-sm">
                  <Shield className="h-4 w-4 mr-2" />
                  <span>Services vérifiés premium</span>
                </div>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1">20.000 Ar</div>
                  <div className="text-xs text-white/80">par mois</div>
                </div>
              </div>
              
              <PremiumButton 
                variant="default"
                className="w-full"
              >
                Passer au Premium
              </PremiumButton>
            </div>
          )
        ) : (
          // UTILISATEUR NON CONNECTÉ - Widget générique
          <div className="bg-gradient-to-br from-gray-500 via-gray-600 to-gray-700 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold flex items-center">
                <Crown className="h-5 w-5 mr-2" />
                Accès Premium
              </h3>
              <User className="h-5 w-5 text-white/50" />
            </div>
            
            <p className="text-white/90 text-sm mb-4">
              Connectez-vous pour accéder aux fonctionnalités premium !
            </p>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center text-sm">
                <Users className="h-4 w-4 mr-2" />
                <span>Contact direct</span>
              </div>
              <div className="flex items-center text-sm">
                <Star className="h-4 w-4 mr-2" />
                <span>Fonctionnalités avancées</span>
              </div>
              <div className="flex items-center text-sm">
                <Shield className="h-4 w-4 mr-2" />
                <span>Support prioritaire</span>
              </div>
            </div>
            
            <button 
              onClick={() => navigate('/login')}
              className="w-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 font-bold py-3 rounded-xl transition-all border border-white/30 mb-3"
            >
              Se connecter
            </button>
            
            <button 
              onClick={() => navigate('/register')}
              className="w-full bg-white text-gray-700 hover:bg-gray-100 font-bold py-3 rounded-xl transition-all"
            >
              Créer un compte
            </button>
          </div>
        )}

                {/* Widget aide et support */}
                <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-job-cream rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="h-8 w-8 text-job-gold" />
                    </div>
                    <h3 className="font-bold text-job-brown mb-2">Besoin d'aide ?</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Notre équipe est là pour vous accompagner dans votre recherche d'emploi
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

          {/* Section mobile pour widgets - Affichée seulement sur mobile */}
          <div className="lg:hidden mt-6 space-y-4">
            {/* Carrousel mobile */}
            <VerticalJobCarousel jobs={recentJobs} />

            {/* Widget Premium mobile */}
            {isCandidate && !isPremium && (
              <div className="bg-gradient-to-br from-job-gold via-job-orange to-job-dark-gold rounded-2xl p-6 text-white shadow-xl">
                <div className="flex items-center justify-center mb-4">
                  <Crown className="h-8 w-8 text-white mr-3" />
                  <h3 className="font-bold text-lg">Accès Premium</h3>
                </div>
                
                <p className="text-white/90 text-center mb-4">
                  Contactez directement ce recruteur !
                </p>
                
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-4">
                  <div className="text-center">
                    <div className="text-xl font-bold mb-1">15.000 Ar</div>
                    <div className="text-xs text-white/80">par mois</div>
                  </div>
                </div>
                
                <PremiumButton 
                  variant="default"
                  className="w-full"
                >
                  Passer au Premium
                </PremiumButton>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Modal de candidature */}
      <ApplicationModal
        job={job}
        isOpen={showApplicationModal}
        onClose={() => setShowApplicationModal(false)}
        onSubmit={handleApply}
        userProfile={profile}
      />

      {/* Modal de partage */}
      <ShareModal />

      {/* Styles CSS personnalisés pour le formatage du texte */}
      <style>{`
        .job-gold { color: #D4AF37; }
        .job-dark-gold { color: #B8860B; }
        .job-light-gold { background-color: #FDF6E3; }
        .job-cream { background-color: #FEF9E7; }
        .job-brown { color: #8B4513; }
        .job-green { color: #10B981; }
        .job-blue { color: #3B82F6; }
        .job-purple { color: #8B5CF6; }
        .job-pink { color: #EC4899; }
        .job-orange { color: #F97316; }

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

        .formatted-content {
          line-height: 1.7;
          word-wrap: break-word;
          overflow-wrap: break-word;
          hyphens: auto;
        }

        .formatted-content h1, .formatted-content h2, .formatted-content h3, .formatted-content h4 {
          color: #8B4513;
          font-weight: 600;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
        }

        .formatted-content h2 {
          font-size: 1.5em;
          border-bottom: 2px solid #D4AF37;
          padding-bottom: 0.3em;
        }

        .formatted-content h3 {
          font-size: 1.25em;
        }

        .formatted-content ul, .formatted-content ol {
          margin: 1em 0;
          padding-left: 1.5em;
        }

        .formatted-content li {
          margin: 0.5em 0;
        }

        .formatted-content p {
          margin: 1em 0;
          line-height: 1.7;
        }

        .formatted-content strong {
          color: #8B4513;
          font-weight: 600;
        }

        .formatted-content blockquote {
          border-left: 4px solid #D4AF37;
          margin: 1.5em 0;
          padding-left: 1em;
          font-style: italic;
          color: #6B7280;
          background: #FEF9E7;
          padding: 1em;
          border-radius: 0.5em;
        }

        .formatted-content a {
          color: #D4AF37;
          text-decoration: underline;
        }

        .formatted-content a:hover {
          color: #B8860B;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .animate-pulse {
          animation: pulse 2s infinite;
        }

        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #D4AF37;
          border-radius: 3px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #B8860B;
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
      `}</style>

{/* Modal de message direct premium */}
{showDirectMessageModal && (
  <DirectMessageModal
    isOpen={showDirectMessageModal}
    onClose={() => setShowDirectMessageModal(false)}
    onMessageSent={handleDirectMessageSent}
    recruiterData={{
      id: job.employer_id,
      name: job.company_name,
      email: job.contact_email
    }}
    jobData={{
      id: job.$id,
      title: job.title
    }}
    candidateData={{
      id: user.$id,
      name: user.name,
      email: user.email
    }}
  />
)}

    </div>
    </>
  );
};

export default JobDetail;