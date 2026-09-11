import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PremiumButton from '@/components/PremiumButton';
import { databases, DATABASE_ID } from '@/lib/appwrite';
import { notifyNewJob } from '@/lib/telegram';
import { 
  ArrowLeft,
  ArrowRight,
  Building,
  MapPin,
  DollarSign,
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
  Plus,
  Minus,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Zap,
  TrendingUp,
  Award,
  Target,
  Sparkles,
  Crown,
  Rocket,
  Gift,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Image,
  Code,
  Quote,
  Gem,
  Shield,
  BadgeCheck,
  Activity,
  ChevronRight,
  ChevronDown,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { jobService, COLLECTIONS, Query, ID } from '@/lib/appwrite';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/layout/Navbar';

// Fonction utilitaire pour nettoyer le HTML et extraire le texte
const cleanHtmlText = (htmlString) => {
  if (!htmlString) return '';
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlString;
  return tempDiv.textContent || tempDiv.innerText || '';
};

// Fonction pour afficher le HTML formaté de manière sécurisée
const formatRichText = (htmlString) => {
  if (!htmlString) return '';
  // Nettoyer les balises potentiellement dangereuses tout en gardant le formatage
  const cleanHtml = htmlString
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '');
  return cleanHtml;
};

// Composant Rich Text Editor TRÈS amélioré
const RichTextEditor = ({ value, onChange, placeholder, error }) => {
  const editorRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

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

  // Gestion améliorée du paste pour préserver le formatage
  const handlePaste = (e) => {
    e.preventDefault();
    
    // Récupérer les données du clipboard
    const clipboardData = e.clipboardData || window.clipboardData;
    const htmlData = clipboardData.getData('text/html');
    const textData = clipboardData.getData('text/plain');

    if (htmlData) {
      // Si on a du HTML formaté, on le nettoie mais on préserve le formatage
      const cleanedHtml = htmlData
        // Supprimer les styles et classes spécifiques à Word/Google Docs
        .replace(/class="[^"]*"/gi, '')
        .replace(/style="[^"]*"/gi, '')
        .replace(/<o:p\s*\/?>|<\/o:p>/gi, '')
        .replace(/<span[^>]*>/gi, '')
        .replace(/<\/span>/gi, '')
        .replace(/<font[^>]*>/gi, '')
        .replace(/<\/font>/gi, '')
        // Conserver les balises de formatage importantes
        .replace(/<(\/?)strong>/gi, '<$1b>')
        .replace(/<(\/?)em>/gi, '<$1i>')
        .replace(/<(\/?)u>/gi, '<$1u>')
        // Nettoyer les commentaires et metadata
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/<meta[^>]*>/gi, '')
        .replace(/<link[^>]*>/gi, '')
        // Préserver les listes
        .replace(/<(\/?)ul>/gi, '<$1ul>')
        .replace(/<(\/?)ol>/gi, '<$1ol>')
        .replace(/<(\/?)li>/gi, '<$1li>')
        // Préserver les paragraphes et titres
        .replace(/<(\/?)p>/gi, '<$1p>')
        .replace(/<(\/?)h([1-6])>/gi, '<$1h$2>')
        // Supprimer tout le reste
        .replace(/<[^>]*>/gi, function(match) {
          const allowedTags = ['b', '/b', 'i', '/i', 'u', '/u', 'ul', '/ul', 'ol', '/ol', 'li', '/li', 'p', '/p', 'h1', '/h1', 'h2', '/h2', 'h3', '/h3', 'h4', '/h4', 'h5', '/h5', 'h6', '/h6', 'br'];
          const tagName = match.replace(/<\/?([^>\s]+).*?>/i, '$1').toLowerCase();
          return allowedTags.includes(tagName) || allowedTags.includes('/' + tagName) ? match : '';
        });

      // Insérer le HTML nettoyé
      document.execCommand('insertHTML', false, cleanedHtml);
    } else if (textData) {
      // Si on n'a que du texte, on l'insère normalement
      document.execCommand('insertText', false, textData);
    }
    
    handleInput();
  };

  const insertLink = () => {
    if (linkUrl) {
      executeCommand('createLink', linkUrl);
      setShowLinkDialog(false);
      setLinkUrl('');
    }
  };

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  return (
    <div className={`border-2 rounded-2xl overflow-hidden transition-all ${
      isFocused ? 'ring-4 ring-job-gold/20 border-job-gold shadow-lg' : 'border-gray-200 hover:border-gray-300'
    } ${error ? 'border-red-500' : ''}`}>
      {/* Barre d'outils améliorée */}
      <div className="bg-gradient-to-r from-job-light-gold via-job-cream to-job-light-gold border-b border-gray-200 p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-1">
            {/* Groupe Formatage texte */}
            <div className="flex items-center space-x-1 bg-white/50 rounded-lg p-1">
              <button
                type="button"
                onClick={() => executeCommand('bold')}
                className="p-2 text-job-brown hover:text-job-gold hover:bg-job-cream rounded-lg transition-all tooltip"
                title="Gras (Ctrl+B)"
              >
                <Bold className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => executeCommand('italic')}
                className="p-2 text-job-brown hover:text-job-gold hover:bg-job-cream rounded-lg transition-all"
                title="Italique (Ctrl+I)"
              >
                <Italic className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => executeCommand('underline')}
                className="p-2 text-job-brown hover:text-job-gold hover:bg-job-cream rounded-lg transition-all"
                title="Souligné (Ctrl+U)"
              >
                <Underline className="h-4 w-4" />
              </button>
            </div>
            
            {/* Groupe Alignement */}
            <div className="flex items-center space-x-1 bg-white/50 rounded-lg p-1">
              <button
                type="button"
                onClick={() => executeCommand('justifyLeft')}
                className="p-2 text-job-brown hover:text-job-gold hover:bg-job-cream rounded-lg transition-all"
                title="Aligner à gauche"
              >
                <AlignLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => executeCommand('justifyCenter')}
                className="p-2 text-job-brown hover:text-job-gold hover:bg-job-cream rounded-lg transition-all"
                title="Centrer"
              >
                <AlignCenter className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => executeCommand('justifyRight')}
                className="p-2 text-job-brown hover:text-job-gold hover:bg-job-cream rounded-lg transition-all"
                title="Aligner à droite"
              >
                <AlignRight className="h-4 w-4" />
              </button>
            </div>
            
            {/* Groupe Listes */}
            <div className="flex items-center space-x-1 bg-white/50 rounded-lg p-1">
            <button
                type="button"
                onClick={() => executeCommand('insertUnorderedList')}
                className="p-2 text-job-brown hover:text-job-gold hover:bg-job-cream rounded-lg transition-all"
                title="Liste à puces"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => executeCommand('insertOrderedList')}
                className="p-2 text-job-brown hover:text-job-gold hover:bg-job-cream rounded-lg transition-all"
                title="Liste numérotée"
              >
                <ListOrdered className="h-4 w-4" />
              </button>
            </div>
            
            {/* Groupe Éléments */}
            <div className="flex items-center space-x-1 bg-white/50 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setShowLinkDialog(true)}
                className="p-2 text-job-brown hover:text-job-gold hover:bg-job-cream rounded-lg transition-all"
                title="Insérer un lien"
              >
                <LinkIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => executeCommand('formatBlock', '<blockquote>')}
                className="p-2 text-job-brown hover:text-job-gold hover:bg-job-cream rounded-lg transition-all"
                title="Citation"
              >
                <Quote className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Sélecteurs de style */}
          <div className="flex items-center space-x-3">
            <select
              onChange={(e) => executeCommand('formatBlock', e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-job-gold focus:border-job-gold bg-white"
              defaultValue=""
            >
              <option value="">Normal</option>
              <option value="h2">Titre Principal</option>
              <option value="h3">Sous-titre</option>
              <option value="h4">Titre Secondaire</option>
              <option value="p">Paragraphe</option>
            </select>
            
            <select
              onChange={(e) => executeCommand('fontSize', e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-job-gold focus:border-job-gold bg-white"
              defaultValue="3"
            >
              <option value="1">Très petit</option>
              <option value="2">Petit</option>
              <option value="3">Normal</option>
              <option value="4">Grand</option>
              <option value="5">Très grand</option>
              <option value="6">Énorme</option>
            </select>
          </div>
        </div>
        
        {/* Indicateur de formatage */}
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <span>💡 Copiez-collez votre texte formaté depuis Word/Google Docs - le formatage sera préservé</span>
          <span className="bg-job-gold/20 px-2 py-1 rounded text-job-brown font-medium">
            Ctrl+Z pour annuler
          </span>
        </div>
      </div>

      {/* Zone d'édition améliorée */}
      <div className="relative bg-white">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning={true}
          onInput={handleInput}
          onPaste={handlePaste}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="p-6 min-h-[300px] max-h-[500px] overflow-y-auto focus:outline-none prose prose-lg max-w-none"
          data-placeholder={placeholder}
          style={{
            lineHeight: '1.6',
            fontSize: '16px'
          }}
        />
        
        {(!value || value === '<br>' || value === '') && !isFocused && (
          <div className="absolute top-6 left-6 text-gray-400 pointer-events-none">
            {placeholder}
          </div>
        )}
      </div>

      {/* Barre d'état améliorée */}
      <div className="bg-gradient-to-r from-job-light-gold to-job-cream border-t border-gray-200 px-4 py-3 flex justify-between items-center text-sm">
        <div className="flex items-center space-x-4">
          <span className={`font-medium ${
            value && value.replace(/<[^>]*>/g, '').length < 100 ? 'text-orange-600' : 'text-green-600'
          }`}>
            <span className="text-gray-600">Caractères :</span> {value ? value.replace(/<[^>]*>/g, '').length : 0}
            {value && value.replace(/<[^>]*>/g, '').length < 100 && ' (minimum 100 recommandé)'}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            value && value.replace(/<[^>]*>/g, '').length >= 100 
              ? 'bg-green-100 text-green-700' 
              : 'bg-orange-100 text-orange-700'
          }`}>
            {value && value.replace(/<[^>]*>/g, '').length >= 100 ? '✓ Optimal' : '⚠ Trop court'}
          </span>
        </div>
        <span className="text-gray-500 flex items-center">
          <Sparkles className="h-4 w-4 mr-1" />
          Formatage avancé activé
        </span>
      </div>

      {/* Dialog pour insérer un lien */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-96 shadow-2xl">
            <h3 className="text-lg font-semibold mb-4 text-job-brown">🔗 Insérer un lien</h3>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-job-gold focus:border-job-gold"
              autoFocus
            />
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                onClick={() => {
                  setShowLinkDialog(false);
                  setLinkUrl('');
                }}
                variant="outline"
              >
                Annuler
              </Button>
              <Button
                type="button"
                onClick={insertLink}
                className="bg-gradient-to-r from-job-gold to-job-dark-gold hover:from-job-dark-gold hover:to-job-gold text-white"
              >
                Insérer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Modal pour afficher toutes les offres du recruteur
const AllJobsModal = ({ jobs, isOpen, onClose }) => {
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

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)',
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        width: '50%',
        maxHeight: '90vh',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '2px solid #D4AF37',
        overflow: 'hidden'
      }}>
        {/* Header du modal */}
        <div style={{
          padding: '24px',
          borderBottom: '2px solid #f3f4f6',
          background: 'linear-gradient(135deg, #FDF6E3 0%, #FEF9E7 100%)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#8B4513',
                margin: 0,
                marginBottom: '4px'
              }}>
                📋 Toutes vos offres d'emploi
              </h3>
              <p style={{
                color: '#6B7280',
                margin: 0,
                fontSize: '0.875rem'
              }}>
                {jobs.length} offres publiées au total
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                padding: '8px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <X style={{ width: '20px', height: '20px', color: '#6B7280' }} />
            </button>
          </div>
        </div>

        {/* Contenu avec scroll fixe pour 4 lignes */}
        <div style={{
          height: '400px', // Hauteur fixe pour exactement 4 lignes (100px par ligne)
          overflowY: 'auto',
          padding: '24px',
          backgroundColor: '#fefefe',
          scrollbarWidth: 'thin',
          scrollbarColor: '#D4AF37 #f1f1f1'
        }}>
          {jobs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {jobs.map((job, index) => (
                <div key={job.$id} style={{
                  minHeight: '90px',
                  padding: '20px',
                  borderRadius: '16px',
                  border: '2px solid #e5e7eb',
                  background: 'linear-gradient(135deg, #ffffff 0%, #fefefe 100%)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#D4AF37';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(212, 175, 55, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ flex: 1 }}>
                      {/* Titre et badges */}
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px', 
                        marginBottom: '8px',
                        flexWrap: 'wrap'
                      }}>
                        <h4 style={{
                          fontSize: '1.125rem',
                          fontWeight: 'bold',
                          color: '#8B4513',
                          margin: 0,
                          lineHeight: '1.2'
                        }}>
                          {job.title}
                        </h4>
                        
                        {job.is_featured && (
                          <span style={{
                            padding: '4px 8px',
                            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                            color: 'white',
                            fontSize: '0.75rem',
                            borderRadius: '12px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            ⭐ Featured
                          </span>
                        )}
                        
                        {job.is_urgent && (
                          <span style={{
                            padding: '4px 8px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            fontSize: '0.75rem',
                            borderRadius: '12px',
                            fontWeight: '600',
                            animation: 'pulse 2s infinite',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            🚨 Urgent
                          </span>
                        )}
                      </div>
                      
                      {/* Informations détaillées */}
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '20px', 
                        marginBottom: '12px',
                        flexWrap: 'wrap',
                        fontSize: '0.875rem',
                        color: '#6B7280'
                      }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin style={{ width: '14px', height: '14px' }} />
                          {job.location}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Briefcase style={{ width: '14px', height: '14px' }} />
                          {job.category}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock style={{ width: '14px', height: '14px' }} />
                          {getTimeAgo(job.created_at)}
                        </span>
                      </div>

                      {/* Statuts et actions */}
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          {/* Badge de statut */}
                          {job.is_active ? (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 12px',
                              backgroundColor: 'rgba(16, 185, 129, 0.1)',
                              color: '#10B981',
                              fontSize: '0.75rem',
                              borderRadius: '16px',
                              fontWeight: '600'
                            }}>
                              <span style={{
                                width: '6px',
                                height: '6px',
                                backgroundColor: '#10B981',
                                borderRadius: '50%',
                                animation: 'pulse 2s infinite'
                              }}></span>
                              Active
                            </span>
                          ) : job.is_draft ? (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 12px',
                              backgroundColor: 'rgba(245, 158, 11, 0.1)',
                              color: '#F59E0B',
                              fontSize: '0.75rem',
                              borderRadius: '16px',
                              fontWeight: '600'
                            }}>
                              <span style={{
                                width: '6px',
                                height: '6px',
                                backgroundColor: '#F59E0B',
                                borderRadius: '50%'
                              }}></span>
                              Brouillon
                            </span>
                          ) : (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 12px',
                              backgroundColor: 'rgba(156, 163, 175, 0.1)',
                              color: '#9CA3AF',
                              fontSize: '0.75rem',
                              borderRadius: '16px',
                              fontWeight: '600'
                            }}>
                              <span style={{
                                width: '6px',
                                height: '6px',
                                backgroundColor: '#9CA3AF',
                                borderRadius: '50%'
                              }}></span>
                              Inactive
                            </span>
                          )}
                          
                          {/* Compteur de vues */}
                          <span style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.75rem',
                            color: '#6B7280'
                          }}>
                            <Eye style={{ width: '14px', height: '14px' }} />
                            {job.views_count || 0} vues
                          </span>
                        </div>

                        {/* Bouton voir détails */}
                        <a 
                          href={`/jobs/${job.$id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            padding: '8px 16px',
                            color: '#D4AF37',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            borderRadius: '8px',
                            border: '2px solid #D4AF37',
                            backgroundColor: 'transparent',
                            textDecoration: 'none',
                            transition: 'all 0.2s ease',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#D4AF37';
                            e.target.style.color = 'white';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                            e.target.style.color = '#D4AF37';
                          }}
                        >
                          <Eye style={{ width: '14px', height: '14px' }} />
                          Voir détails
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#6B7280'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#FEF9E7',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <Briefcase style={{ width: '40px', height: '40px', color: '#D4AF37' }} />
              </div>
              <h4 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#8B4513',
                margin: '0 0 8px 0'
              }}>
                Aucune offre publiée
              </h4>
              <p style={{
               color: '#9CA3AF',
               margin: 0,
               fontSize: '0.875rem'
             }}>
               Vous n'avez pas encore publié d'offres d'emploi.
             </p>
           </div>
         )}
       </div>
     </div>

     {/* Styles CSS pour les animations */}
     <style>{`
       @keyframes pulse {
         0%, 100% { opacity: 1; }
         50% { opacity: 0.5; }
       }
       
       /* Scrollbar pour le modal */
       div[style*="height: 400px"]::-webkit-scrollbar {
         width: 8px;
       }
       
       div[style*="height: 400px"]::-webkit-scrollbar-track {
         background: #f1f1f1;
         border-radius: 4px;
       }
       
       div[style*="height: 400px"]::-webkit-scrollbar-thumb {
         background: #D4AF37;
         border-radius: 4px;
       }
       
       div[style*="height: 400px"]::-webkit-scrollbar-thumb:hover {
         background: #B8860B;
       }
     `}</style>
   </div>
 );
};

// Aperçu de l'offre avec formatage amélioré
const JobPreview = ({ formData }) => {
 const { profile } = useAuth();
 const contractTypes = [
   { value: 'cdi', label: 'CDI' },
   { value: 'cdd', label: 'CDD' },
   { value: 'stage', label: 'Stage' },
   { value: 'freelance', label: 'Freelance' },
   { value: 'mission', label: 'Mission' }
 ];

 const experienceLevels = [
   { value: 'entry', label: 'Débutant' },
   { value: 'mid', label: 'Intermédiaire' },
   { value: 'senior', label: 'Senior' },
   { value: 'executive', label: 'Cadre dirigeant' }
 ];

 return (
   <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
     <h3 className="text-lg font-bold text-job-brown mb-4 flex items-center">
       <Eye className="h-5 w-5 mr-2" />
       Aperçu de votre offre
     </h3>
     
     <div className="bg-white rounded-xl p-6 shadow-sm">
       <div className="flex items-start space-x-6 mb-4">
         {/* Logo de l'entreprise dans l'aperçu */}
         <div className="h-20 w-20 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg border-2 border-gray-100 bg-white">
           {profile?.company_logo_url ? (
             <img 
               src={profile.company_logo_url} 
               alt={`Logo ${formData.company_name}`}
               className="w-full h-full object-contain rounded-xl p-2"
               onError={(e) => {
                 e.target.style.display = 'none';
                 e.target.nextSibling.style.display = 'flex';
               }}
             />
           ) : null}
           <div className={`w-full h-full bg-gradient-to-r from-job-gold to-job-orange rounded-xl flex items-center justify-center ${profile?.company_logo_url ? 'hidden' : 'flex'}`}>
             <Building className="h-10 w-10 text-white" />
           </div>
         </div>
         
         <div className="flex-1">
           <div className="flex items-center space-x-3 mb-2">
             <h4 className="text-xl font-bold text-gray-900">
               {formData.title || 'Titre du poste'}
             </h4>
             {formData.is_featured && (
               <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
                 <Star className="h-3 w-3 mr-1" />
                 Mis en avant
               </div>
             )}
             {formData.is_urgent && (
               <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center animate-pulse">
                 <Zap className="h-3 w-3 mr-1" />
                 Urgent
               </div>
             )}
           </div>
           
           <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
             <span className="font-medium">{formData.company_name || 'Nom de l\'entreprise'}</span>
             <span className="flex items-center">
               <MapPin className="h-4 w-4 mr-1" />
               {Array.isArray(formData.location) ? formData.location.join(', ') : (formData.location || 'Localisation')}
             </span>
             <span className="flex items-center">
               <Clock className="h-4 w-4 mr-1" />
               Aujourd'hui
             </span>
           </div>

           <div className="mb-4">
             <div 
               className="text-gray-600 text-sm leading-relaxed prose prose-sm max-w-none preview-content"
               dangerouslySetInnerHTML={{ 
                 __html: formatRichText(formData.description) || '<p class="text-gray-400">Description du poste...</p>' 
               }}
               style={{
                 wordWrap: 'break-word',
                 overflowWrap: 'break-word',
                 hyphens: 'auto',
                 lineHeight: '1.6'
               }}
             />
           </div>

           <div className="flex flex-wrap gap-2 mb-4">
             {formData.category && (
               <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                 {formData.category}
               </span>
             )}
             {formData.contract_type && (
               <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
                 {contractTypes.find(t => t.value === formData.contract_type)?.label || formData.contract_type}
               </span>
             )}
             {formData.experience_level && (
               <span className="px-3 py-1 bg-green-50 text-green-600 text-xs font-medium rounded-full">
                 {experienceLevels.find(l => l.value === formData.experience_level)?.label || formData.experience_level}
               </span>
             )}
             {formData.remote_work && (
               <span className="px-3 py-1 bg-purple-50 text-purple-600 text-xs font-medium rounded-full">
                 Remote
               </span>
             )}
           </div>

           {/* Avantages */}
           {formData.benefits && formData.benefits.filter(b => b.trim()).length > 0 && (
             <div className="mb-4">
               <h5 className="font-semibold text-gray-900 mb-2">Avantages :</h5>
               <ul className="text-sm text-gray-600 space-y-1">
                 {formData.benefits.filter(b => b.trim()).map((benefit, index) => (
                   <li key={index} className="flex items-center">
                     <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2"></span>
                     {benefit}
                   </li>
                 ))}
               </ul>
             </div>
           )}

           {/* Exigences */}
           {formData.requirements && formData.requirements.filter(r => r.trim()).length > 0 && (
             <div className="mb-4">
               <h5 className="font-semibold text-gray-900 mb-2">Exigences :</h5>
               <ul className="text-sm text-gray-600 space-y-1">
                 {formData.requirements.filter(r => r.trim()).map((requirement, index) => (
                   <li key={index} className="flex items-center">
                     <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                     {requirement}
                   </li>
                 ))}
               </ul>
             </div>
           )}

           <div className="flex items-center justify-between pt-4 border-t border-gray-100">
             <div className="text-xs text-gray-500">
               Contact : {formData.contact_email || 'email@entreprise.com'}
             </div>
             {formData.application_deadline && (
               <div className="text-xs text-orange-600 flex items-center">
                 <Calendar className="h-3 w-3 mr-1" />
                 Candidature avant le {new Date(formData.application_deadline).toLocaleDateString('fr-FR')}
               </div>
             )}
           </div>
         </div>
       </div>
     </div>
   </div>
 );
};


const CreateJob = () => {
 const navigate = useNavigate();
 const { user, isEmployer, profile, isPremium } = useAuth()
 const [loading, setLoading] = useState(false);
 const [categories, setCategories] = useState([]);
 const [recentJobs, setRecentJobs] = useState([]);
 const [allUserJobs, setAllUserJobs] = useState([]);
 const [showAllJobsModal, setShowAllJobsModal] = useState(false);
 const [userQuota, setUserQuota] = useState(null);
  const [quotaLoading, setQuotaLoading] = useState(true);
 const [employerStats, setEmployerStats] = useState({
   activeJobs: 0,
   totalApplications: 0,
   totalViews: 0,
   thisMonthViews: 0
 });

 const [errors, setErrors] = useState({});
 const [currentStep, setCurrentStep] = useState(1);
 const totalSteps = 4;
 
 const [formData, setFormData] = useState({
   title: '',
   company_name: '',
   category: '',
   description: '',
   employment_type: '',
   contract_type: '',
   experience_level: '',
   location: [],
   remote_work: false,
   benefits: [],
   requirements: [],
   application_deadline: '',
   contact_email: '',
   company_website: '',
   is_featured: false,
   is_urgent: false,
   application_instructions: ''
 });

 const employmentTypes = [
   { value: 'full-time', label: 'Temps plein', icon: '⏰', desc: 'Emploi à temps complet', color: 'from-blue-500 to-blue-600' },
   { value: 'part-time', label: 'Temps partiel', icon: '🕐', desc: 'Emploi à temps partiel', color: 'from-green-500 to-green-600' },
   { value: 'contract', label: 'Contrat', icon: '📋', desc: 'Mission contractuelle', color: 'from-purple-500 to-purple-600' },
   { value: 'internship', label: 'Stage', icon: '🎓', desc: 'Stage professionnel', color: 'from-orange-500 to-orange-600' },
   { value: 'freelance', label: 'Freelance', icon: '💼', desc: 'Travail indépendant', color: 'from-pink-500 to-pink-600' }
 ];

 const contractTypes = [
   { value: 'cdi', label: 'CDI', desc: 'Contrat à Durée Indéterminée', icon: '📝', color: 'from-emerald-500 to-emerald-600' },
   { value: 'cdd', label: 'CDD', desc: 'Contrat à Durée Déterminée', icon: '📅', color: 'from-amber-500 to-amber-600' },
   { value: 'stage', label: 'Stage', desc: 'Stage professionnel', icon: '🎓', color: 'from-blue-500 to-blue-600' },
   { value: 'freelance', label: 'Freelance', desc: 'Travail indépendant', icon: '🚀', color: 'from-purple-500 to-purple-600' },
   { value: 'mission', label: 'Mission', desc: 'Mission temporaire', icon: '⚡', color: 'from-red-500 to-red-600' }
 ];

 const experienceLevels = [
   { value: 'entry', label: 'Débutant', desc: '0-2 ans d\'expérience', icon: '🌱', color: 'from-green-400 to-green-500' },
   { value: 'mid', label: 'Intermédiaire', desc: '2-5 ans d\'expérience', icon: '🌿', color: 'from-blue-400 to-blue-500' },
   { value: 'senior', label: 'Senior', desc: '5+ ans d\'expérience', icon: '🌳', color: 'from-purple-400 to-purple-500' },
   { value: 'executive', label: 'Cadre dirigeant', desc: '10+ ans d\'expérience', icon: '👑', color: 'from-yellow-400 to-yellow-500' }
 ];

 const PROVINCES_MADAGASCAR = [
   'Dans tout Madagascar',
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



const saveJobToDatabase = async (jobData) => {
  try {
    const response = await databases.createDocument(
      DATABASE_ID,
      'jobs', // ID de ta collection jobs
      ID.unique(), // ← Corrigé ici
      jobData
    );
    return response;
  } catch (error) {
    console.error('Erreur sauvegarde job:', error);
    throw error;
  }
};

 useEffect(() => {
  
  
  if (!user || !isEmployer) {
  
    navigate('/login', {
      state: { message: 'Seuls les employeurs peuvent créer des offres d\'emploi' }
    });
    return;
  }


  loadCategories();
  loadRecentJobs();
  loadEmployerStats();
  loadUserQuota();
}, [user, isEmployer, navigate]);

const loadUserQuota = async () => {
  if (!user?.$id) {
    setQuotaLoading(false);
    return;
  }

  try {
    const quotaResponse = await databases.listDocuments(
      DATABASE_ID,
      'subscription_quotas',
      [
        Query.equal('user_id', user.$id),
        Query.limit(1)
      ]
    );

    if (quotaResponse.documents.length > 0) {
      setUserQuota(quotaResponse.documents[0]);
    } else {
      setUserQuota(null);
    }
  } catch (error) {
    console.error('Erreur chargement quota:', error);
    setUserQuota(null);
  } finally {
    setQuotaLoading(false);
  }
};

const loadCategories = async () => {
  try {
    
    
    // ✅ Utiliser la nouvelle syntaxe Appwrite
    const response = await databases.listDocuments(
      DATABASE_ID,
      'job_categories', // Nom exact de votre collection
      [Query.orderAsc('name')]
    );
    
    
    
    if (response.documents && response.documents.length > 0) {
     
      setCategories(response.documents);
    } else {
      
      throw new Error('Aucune catégorie dans la base');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du chargement des catégories:', error);
   
    
    // Catégories par défaut
    const defaultCategories = [
      { $id: '1', name: 'Informatique & Technologies' },
      { $id: '2', name: 'Marketing & Communication' },
      { $id: '3', name: 'Ressources Humaines' },
      { $id: '4', name: 'Finance & Comptabilité' },
      { $id: '5', name: 'Vente & Commerce' },
      { $id: '6', name: 'Éducation & Formation' },
      { $id: '7', name: 'Santé & Médical' },
      { $id: '8', name: 'Ingénierie' },
      { $id: '9', name: 'Design & Créatif' },
      { $id: '10', name: 'Administration' },
      { $id: '11', name: 'Transport & Logistique' },
      { $id: '12', name: 'Hôtellerie & Restauration' },
      { $id: '13', name: 'Agriculture & Environnement' },
      { $id: '14', name: 'BTP & Construction' },
      { $id: '15', name: 'Autres' }
    ];
    
  
    setCategories(defaultCategories);
  }
};

 const loadEmployerStats = async () => {
   if (user && user.$id) {
     try {
       // Charger les offres actives avec Appwrite
       const activeJobs = await databases.listDocuments(
         DATABASE_ID,
         COLLECTIONS.JOBS,
         [
           Query.equal('employer_id', user.$id),
           Query.equal('is_active', true),
           Query.equal('is_draft', false)
         ]
       );

       // Calculer les vues totales
       const totalViews = activeJobs.documents?.reduce((sum, job) => sum + (job.views_count || 0), 0) || 0;

       // Calculer les vues de ce mois
       const currentMonth = new Date();
       const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
       const thisMonthViews = activeJobs.documents?.filter(job => 
         new Date(job.created_at) >= startOfMonth
       ).reduce((sum, job) => sum + (job.views_count || 0), 0) || 0;

       // Charger les candidatures avec Appwrite
       const allApplications = await databases.listDocuments(
         DATABASE_ID,
         COLLECTIONS.APPLICATIONS,
         []
       );

       // Filtrer les candidatures pour cet employeur
       const jobIds = activeJobs.documents.map(job => job.$id);
       const employerApplications = allApplications.documents.filter(app => 
         jobIds.includes(app.job_id)
       );

       setEmployerStats({
         activeJobs: activeJobs.documents?.length || 0,
         totalApplications: employerApplications.length || 0,
         totalViews: totalViews,
         thisMonthViews: thisMonthViews
       });

     } catch (error) {
       console.error('Erreur lors du chargement des statistiques:', error);
     }
   }
 };

 const loadRecentJobs = async () => {
   if (user && user.$id) {
     try {
       // Charger les 5 offres les plus récentes pour l'affichage dans la sidebar avec Appwrite
       const response = await databases.listDocuments(
         DATABASE_ID,
         COLLECTIONS.JOBS,
         [
           Query.equal('employer_id', user.$id),
           Query.orderDesc('created_at'),
           Query.limit(5)
         ]
       );

 
       setRecentJobs(response.documents || []);
     } catch (error) {
       console.error('Erreur lors du chargement des offres récentes:', error);
     }
   }
 };

 const loadAllUserJobs = async () => {
   if (user && user.$id) {
     try {
       // Charger toutes les offres du recruteur pour le modal avec Appwrite
       const response = await databases.listDocuments(
         DATABASE_ID,
         COLLECTIONS.JOBS,
         [
           Query.equal('employer_id', user.$id),
           Query.orderDesc('created_at')
         ]
       );

    
       setAllUserJobs(response.documents || []);
     } catch (error) {
       console.error('Erreur lors du chargement de toutes les offres:', error);
     }
   }
 };

 const handleShowAllJobs = async () => {
   await loadAllUserJobs();
   setShowAllJobsModal(true);
 };

 const handleInputChange = (field, value) => {
   setFormData(prev => ({
     ...prev,
     [field]: value
   }));
   
   if (errors[field]) {
     setErrors(prev => ({
       ...prev,
       [field]: null
     }));
   }
 };

 // Gestion de la sélection multiple pour les localisations
 const handleLocationChange = (selectedLocation) => {
   const currentLocations = formData.location || [];
   
   if (selectedLocation === 'Dans tout Madagascar') {
     // Si "Dans tout Madagascar" est sélectionné, on vide les autres et on met seulement celui-ci
     setFormData(prev => ({
       ...prev,
       location: ['Dans tout Madagascar']
     }));
   } else {
     // Si une autre localisation est sélectionnée
     const newLocations = currentLocations.includes(selectedLocation)
       ? currentLocations.filter(loc => loc !== selectedLocation) // Retirer si déjà sélectionné
       : [...currentLocations.filter(loc => loc !== 'Dans tout Madagascar'), selectedLocation]; // Ajouter et retirer "Dans tout Madagascar" si présent
     
     setFormData(prev => ({
       ...prev,
       location: newLocations
     }));
   }
 };

 const addArrayItem = (field, item = '') => {
   setFormData(prev => ({
     ...prev,
     [field]: [...prev[field], item]
   }));
 };

 const removeArrayItem = (field, index) => {
   setFormData(prev => ({
     ...prev,
     [field]: prev[field].filter((_, i) => i !== index)
   }));
 };

 const updateArrayItem = (field, index, value) => {
   setFormData(prev => ({
     ...prev,
     [field]: prev[field].map((item, i) => i === index ? value : item)
   }));
 };

 const validateStep = (step) => {
   const newErrors = {};

   switch (step) {
     case 1:
       if (!formData.title.trim()) newErrors.title = 'Le titre du poste est requis';
       if (!formData.company_name.trim()) newErrors.company_name = 'Le nom de l\'entreprise est requis';
       if (!formData.category) newErrors.category = 'Sélectionnez une catégorie';
       if (!formData.description.trim()) newErrors.description = 'La description est requise';
       const textLength = formData.description.replace(/<[^>]*>/g, '').length;
       if (textLength < 100) newErrors.description = 'La description doit contenir au moins 100 caractères';
       break;
     
     case 2:
       if (!formData.employment_type) newErrors.employment_type = 'Sélectionnez un type d\'emploi';
       if (!formData.contract_type) newErrors.contract_type = 'Sélectionnez un type de contrat';
       if (!formData.experience_level) newErrors.experience_level = 'Sélectionnez un niveau d\'expérience';
       if (!formData.location || formData.location.length === 0) newErrors.location = 'Sélectionnez au moins une localisation';
       break;
     
     case 3:
       break;
     
     case 4:
       if (!formData.contact_email.trim()) newErrors.contact_email = 'L\'email de contact est requis';
       if (formData.contact_email && !/\S+@\S+\.\S+/.test(formData.contact_email)) {
         newErrors.contact_email = 'Format d\'email invalide';
       }
       break;
   }

   setErrors(newErrors);
   return Object.keys(newErrors).length === 0;
 };

 const nextStep = () => {
   if (validateStep(currentStep)) {
     setCurrentStep(prev => Math.min(prev + 1, totalSteps));
     window.scrollTo({ top: 0, behavior: 'smooth' });
   }
 };

 const prevStep = () => {
   setCurrentStep(prev => Math.max(prev - 1, 1));
   window.scrollTo({ top: 0, behavior: 'smooth' });
 };

 const handleSubmit = async (isDraft = false) => {
  if (!isDraft && !validateStep(currentStep)) return;
 
  setLoading(true);
  try {
    // ✅ VÉRIFICATION QUOTA AVANT CRÉATION
    if (!isDraft && isPremium && formData.is_featured && userQuota) {
      if ((userQuota.featured_jobs_used || 0) >= (userQuota.featured_jobs_quota || 0)) {
        setErrors({ 
          submit: `❌ Quota épuisé ! Vous avez déjà utilisé ${userQuota.featured_jobs_used}/${userQuota.featured_jobs_quota} offres à la une. Désactivez l'option ou passez au plan supérieur.` 
        });
        setLoading(false);
        return;
      }
    }
 
    const jobData = {
      title: formData.title.trim(),
      company_name: formData.company_name.trim(),
      category: formData.category,
      description: formData.description,
      employment_type: formData.employment_type,
      contract_type: formData.contract_type,
      experience_level: formData.experience_level,
      location: Array.isArray(formData.location) ? formData.location.join(', ') : formData.location,
      remote_work: formData.remote_work,
      benefits: formData.benefits.filter(b => b.trim() !== ''),
      requirements: formData.requirements.filter(r => r.trim() !== ''),
      application_deadline: formData.application_deadline || null,
      contact_email: formData.contact_email.trim(),
      company_website: formData.company_website.trim() || null,
      is_featured: isPremium ? formData.is_featured : false,
      is_urgent: isPremium ? formData.is_urgent : false,
      application_instructions: formData.application_instructions.trim() || null,
      is_draft: isDraft,
      is_active: false,
      moderation_status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
 
    // 1️⃣ CRÉER L'OFFRE EN DB
    const { data, error } = await jobService.createJob(jobData);
    
    if (error) {
      console.error('Erreur lors de la création:', error);
      setErrors({ submit: `Erreur: ${error.message}` });
      return;
    }
 
    if (data) {
      console.log('✅ Offre créée avec succès:', data);
 
      // 2️⃣ ✅ NOTIFICATION TELEGRAM (SEULEMENT SI PAS BROUILLON)
      if (!isDraft) {
        try {
          await notifyNewJob({
            title: formData.title.trim(),
            company_name: formData.company_name.trim(),
            location: Array.isArray(formData.location) ? formData.location.join(', ') : formData.location,
            employer_name: profile?.full_name || user?.name || 'Employeur',
            category: formData.category,
            contract_type: formData.contract_type
          });
          console.log('✅ Notification Telegram envoyée');
        } catch (telegramError) {
          console.warn('⚠️ Erreur notification Telegram (non bloquant):', telegramError);
          // On continue même si Telegram échoue
        }
      }
 
      // 3️⃣ INCRÉMENTER QUOTA SI OFFRE À LA UNE
      if (!isDraft && formData.is_featured && userQuota) {
        try {
          await databases.updateDocument(
            DATABASE_ID,
            'subscription_quotas',
            userQuota.$id,
            {
              featured_jobs_used: (userQuota.featured_jobs_used || 0) + 1,
              updated_at: new Date().toISOString()
            }
          );
          console.log('✅ Quota incrémenté');
        } catch (quotaError) {
          console.error('❌ Erreur incrémentation quota:', quotaError);
        }
      }
 
      // 4️⃣ RÉGÉNÉRER SITEMAP EN PRODUCTION
      if (import.meta.env.PROD) {
        try {
          await fetch('/api/generate-sitemap', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });
          console.log('✅ Sitemap régénéré');
        } catch (err) {
          console.warn('Erreur régénération sitemap:', err);
        }
      }
 
      // 5️⃣ REDIRECTION AVEC MESSAGE
      navigate('/jobs', {
        state: { 
          message: isDraft 
            ? 'Brouillon sauvegardé avec succès' 
            : '✅ Offre créée ! Elle sera modérée par notre équipe avant publication.',
          showModerationInfo: !isDraft,
          type: 'success'
        }
      });
    }
  } catch (error) {
    console.error('Erreur inattendue:', error);
    setErrors({ submit: 'Une erreur inattendue s\'est produite. Veuillez réessayer.' });
  } finally {
    setLoading(false);
  }
};

 const renderStepContent = () => {
   switch (currentStep) {
     case 1:
       return renderBasicInfo();
     case 2:
       return renderJobDetails();
     case 3:
       return renderConditions();
     case 4:
       return renderPublication();
     default:
       return null;
   }
 };

 const renderBasicInfo = () => (
   <div className="space-y-6">
     <div>
       <label className="block text-sm font-semibold text-job-brown mb-2">
         Titre du poste *
       </label>
       <input
         type="text"
         value={formData.title}
         onChange={(e) => handleInputChange('title', e.target.value)}
         placeholder="Ex: Développeur Full Stack React/Node.js"
         className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-job-gold/20 focus:border-job-gold transition-all ${
           errors.title ? 'border-red-500' : 'border-gray-200'
         }`}
       />
       {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
     </div>

     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
       <div>
         <label className="block text-sm font-semibold text-job-brown mb-2">
           Nom de l'entreprise *
         </label>
         <input
           type="text"
           value={formData.company_name}
           onChange={(e) => handleInputChange('company_name', e.target.value)}
           placeholder="Nom de votre entreprise"
           className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-job-gold/20 focus:border-job-gold transition-all ${
             errors.company_name ? 'border-red-500' : 'border-gray-200'
           }`}
         />
         {errors.company_name && <p className="text-red-500 text-sm mt-1">{errors.company_name}</p>}
       </div>

       <div>
         <label className="block text-sm font-semibold text-job-brown mb-2">
           Catégorie *
         </label>
         <select
           value={formData.category}
           onChange={(e) => handleInputChange('category', e.target.value)}
           className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-job-gold/20 focus:border-job-gold transition-all ${
             errors.category ? 'border-red-500' : 'border-gray-200'
           }`}
         >
           <option value="">Sélectionnez une catégorie</option>
           {categories.map(category => (
             <option key={category.$id} value={category.name}>
               {category.name}
             </option>
           ))}
         </select>
         {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
       </div>
     </div>

     <div>
       <label className="block text-sm font-semibold text-job-brown mb-2">
         Description du poste *
       </label>
       <RichTextEditor
         value={formData.description}
         onChange={(value) => handleInputChange('description', value)}
         error={errors.description}
       />
       {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
     </div>
   </div>
 );

 const renderJobDetails = () => (
   <div className="space-y-12">
     {/* Type d'emploi - Design complètement repensé */}
     <div>
       <label className="block text-sm font-semibold text-job-brown mb-6">
         Type d'emploi *
       </label>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
         {employmentTypes.map(type => (
           <div
             key={type.value}
             onClick={() => handleInputChange('employment_type', type.value)}
             className={`relative cursor-pointer group transform transition-all duration-300 hover:scale-105 ${
               formData.employment_type === type.value ? 'scale-105' : ''
             }`}
           >
             <div className={`p-6 rounded-2xl border-3 transition-all duration-300 ${
               formData.employment_type === type.value
                 ? 'border-job-gold bg-gradient-to-br from-job-light-gold to-job-cream shadow-2xl'
                 : 'border-gray-200 bg-white hover:border-job-gold hover:shadow-xl'
             }`}>
               <div className="text-center">
                 <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${type.color} flex items-center justify-center transform transition-all duration-300 ${
                   formData.employment_type === type.value ? 'scale-110' : 'group-hover:scale-110'
                 }`}>
                   <span className="text-2xl">{type.icon}</span>
                 </div>
                 <h3 className="font-bold text-gray-900 text-lg mb-2">{type.label}</h3>
                 <p className="text-sm text-gray-600">{type.desc}</p>
               </div>
               
               {formData.employment_type === type.value && (
                 <div className="absolute top-3 right-3 w-6 h-6 bg-job-gold rounded-full flex items-center justify-center">
                   <Check className="h-4 w-4 text-white" />
                 </div>
               )}
             </div>
           </div>
         ))}
       </div>
       {errors.employment_type && <p className="text-red-500 text-sm mt-3">{errors.employment_type}</p>}
     </div>

     {/* Type de contrat - Design repensé */}
     <div>
       <label className="block text-sm font-semibold text-job-brown mb-6">
         Type de contrat *
       </label>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
         {contractTypes.map(type => (
           <div
             key={type.value}
             onClick={() => handleInputChange('contract_type', type.value)}
             className={`relative cursor-pointer group transform transition-all duration-300 hover:scale-105 ${
               formData.contract_type === type.value ? 'scale-105' : ''
             }`}
           >
             <div className={`p-6 rounded-2xl border-3 transition-all duration-300 ${
               formData.contract_type === type.value
                 ? 'border-job-gold bg-gradient-to-br from-job-light-gold to-job-cream shadow-2xl'
                 : 'border-gray-200 bg-white hover:border-job-gold hover:shadow-xl'
             }`}>
               <div className="text-center">
                 <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${type.color} flex items-center justify-center transform transition-all duration-300 ${
                   formData.contract_type === type.value ? 'scale-110' : 'group-hover:scale-110'
                 }`}>
                   <span className="text-2xl">{type.icon}</span>
                 </div>
                 <h3 className="font-bold text-gray-900 text-lg mb-2">{type.label}</h3>
                 <p className="text-sm text-gray-600">{type.desc}</p>
               </div>
               
               {formData.contract_type === type.value && (
                 <div className="absolute top-3 right-3 w-6 h-6 bg-job-gold rounded-full flex items-center justify-center">
                   <Check className="h-4 w-4 text-white" />
                 </div>
               )}
             </div>
           </div>
         ))}
       </div>
       {errors.contract_type && <p className="text-red-500 text-sm mt-3">{errors.contract_type}</p>}
     </div>

     {/* Niveau d'expérience - Design repensé */}
     <div>
       <label className="block text-sm font-semibold text-job-brown mb-6">
         Niveau d'expérience *
       </label>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         {experienceLevels.map(level => (
           <div
             key={level.value}
             onClick={() => handleInputChange('experience_level', level.value)}
             className={`relative cursor-pointer group transform transition-all duration-300 hover:scale-105 ${
               formData.experience_level === level.value ? 'scale-105' : ''
             }`}
           >
             <div className={`p-6 rounded-2xl border-3 transition-all duration-300 ${
               formData.experience_level === level.value
                 ? 'border-job-gold bg-gradient-to-br from-job-light-gold to-job-cream shadow-2xl'
                 : 'border-gray-200 bg-white hover:border-job-gold hover:shadow-xl'
             }`}>
               <div className="flex items-center space-x-4">
                 <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${level.color} flex items-center justify-center transform transition-all duration-300 ${
                   formData.experience_level === level.value ? 'scale-110' : 'group-hover:scale-110'
                 }`}>
                   <span className="text-2xl">{level.icon}</span>
                 </div>
                 <div className="flex-1">
                   <h3 className="font-bold text-gray-900 text-lg mb-1">{level.label}</h3>
                   <p className="text-sm text-gray-600">{level.desc}</p>
                 </div>
               </div>
               
               {formData.experience_level === level.value && (
                 <div className="absolute top-3 right-3 w-6 h-6 bg-job-gold rounded-full flex items-center justify-center">
                   <Check className="h-4 w-4 text-white" />
                 </div>
               )}
             </div>
           </div>
         ))}
       </div>
       {errors.experience_level && <p className="text-red-500 text-sm mt-3">{errors.experience_level}</p>}
     </div>

     {/* Localisation avec sélection multiple - Design repensé */}
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
       <div>
         <label className="block text-sm font-semibold text-job-brown mb-4">
           Localisation * (Sélection multiple possible)
         </label>
         
         {/* Affichage des sélections actuelles */}
         {formData.location && formData.location.length > 0 && (
           <div className="mb-4 p-4 bg-job-cream rounded-xl border-2 border-job-gold">
             <p className="text-sm text-job-brown font-medium mb-2">Localisations sélectionnées :</p>
             <div className="flex flex-wrap gap-2">
               {formData.location.map((loc, index) => (
                 <span
                   key={index}
                   className="inline-flex items-center px-3 py-1 bg-job-gold text-white rounded-full text-sm font-medium"
                 >
                   {loc}
                   <button
                     type="button"
                     onClick={() => handleLocationChange(loc)}
                     className="ml-2 text-white hover:text-red-200 transition-colors"
                   >
                     <X className="h-3 w-3" />
                   </button>
                 </span>
               ))}
             </div>
           </div>
         )}

         {/* Dropdown de sélection */}
         <div className="relative">
           <select
             onChange={(e) => {
               if (e.target.value) {
                 handleLocationChange(e.target.value);
                 e.target.value = ''; // Reset selection
               }
             }}
             className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-job-gold/20 focus:border-job-gold transition-all bg-white"
             defaultValue=""
           >
             <option value="">Sélectionnez une ou plusieurs localisations</option>
             {PROVINCES_MADAGASCAR.map(province => (
               <option 
                 key={province} 
                 value={province}
                 className={formData.location?.includes(province) ? 'bg-job-cream font-medium' : ''}
               >
                 {province} {formData.location?.includes(province) ? '✓' : ''}
               </option>
             ))}
           </select>
           <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
         </div>
         
         {errors.location && <p className="text-red-500 text-sm mt-2">{errors.location}</p>}
       </div>

       {/* Options de travail */}
       <div>
         <label className="block text-sm font-semibold text-job-brown mb-4">
           Options de travail
         </label>
         <div className="space-y-4">
           <label className="flex items-center p-6 border-2 border-gray-200 rounded-2xl hover:border-job-gold transition-all cursor-pointer group bg-white hover:bg-job-cream">
             <input
               type="checkbox"
               checked={formData.remote_work}
               onChange={(e) => handleInputChange('remote_work', e.target.checked)}
               className="w-6 h-6 text-job-gold rounded-lg focus:ring-job-gold mr-4"
             />
             <div className="flex items-center space-x-4">
               <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                 <span className="text-xl">🏠</span>
               </div>
               <div>
                 <div className="font-bold text-gray-900 text-lg">Télétravail possible</div>
                 <div className="text-sm text-gray-600">Travail à distance autorisé</div>
               </div>
             </div>
           </label>
         </div>
       </div>
     </div>
   </div>
 );

 const renderConditions = () => (
   <div className="space-y-8">
     <div>
       <label className="block text-sm font-semibold text-job-brown mb-4">
         Avantages offerts
       </label>
       <div className="space-y-4">
         {formData.benefits.map((benefit, index) => (
           <div key={index} className="flex gap-4">
             <input
               type="text"
               value={benefit}
               onChange={(e) => updateArrayItem('benefits', index, e.target.value)}
               placeholder="Ex: Assurance santé, tickets restaurant..."
               className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-job-gold/20 focus:border-job-gold"
             />
             <Button
               type="button"
               onClick={() => removeArrayItem('benefits', index)}
               variant="outline"
               className="px-4 py-3 text-red-600 hover:bg-red-50 border-red-200 hover:border-red-300"
             >
               <Minus className="h-4 w-4" />
             </Button>
           </div>
         ))}
         <Button
           type="button"
           onClick={() => addArrayItem('benefits', '')}
           variant="outline"
           className="w-full py-4 px-6 border-dashed border-2 border-job-gold text-job-gold hover:bg-job-cream"
         >
           <Plus className="h-4 w-4 mr-2" />
           Ajouter un avantage
         </Button>
       </div>
     </div>

     <div>
       <label className="block text-sm font-semibold text-job-brown mb-4">
         Exigences & Qualifications
       </label>
       <div className="space-y-4">
         {formData.requirements.map((requirement, index) => (
           <div key={index} className="flex gap-4">
             <input
               type="text"
               value={requirement}
               onChange={(e) => updateArrayItem('requirements', index, e.target.value)}
               placeholder="Ex: Maîtrise de React.js, 3 ans d'expérience..."
               className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-job-gold/20 focus:border-job-gold"
             />
             <Button
               type="button"
               onClick={() => removeArrayItem('requirements', index)}
               variant="outline"
               className="px-4 py-3 text-red-600 hover:bg-red-50 border-red-200 hover:border-red-300"
             >
               <Minus className="h-4 w-4" />
             </Button>
           </div>
         ))}
         <Button
           type="button"
           onClick={() => addArrayItem('requirements', '')}
           variant="outline"
           className="w-full py-4 px-6 border-dashed border-2 border-job-gold text-job-gold hover:bg-job-cream"
         >
           <Plus className="h-4 w-4 mr-2" />
           Ajouter une exigence
         </Button>
       </div>
     </div>
   </div>
 );

 const renderPublication = () => (
  <div className="space-y-8">
    {/* Informations de contact */}
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-job-brown mb-2">
            Email de contact *
          </label>
          <input
            type="email"
            value={formData.contact_email}
            onChange={(e) => handleInputChange('contact_email', e.target.value)}
            placeholder="recrutement@entreprise.com"
            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-job-gold/20 focus:border-job-gold transition-all ${
              errors.contact_email ? 'border-red-500' : 'border-gray-200'
            }`}
          />
          {errors.contact_email && <p className="text-red-500 text-sm mt-1">{errors.contact_email}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-job-brown mb-2">
            Date limite de candidature
          </label>
          <input
            type="date"
            value={formData.application_deadline}
            onChange={(e) => handleInputChange('application_deadline', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-job-gold/20 focus:border-job-gold transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-job-brown mb-2">
          Site web de l'entreprise
        </label>
        <input
          type="url"
          value={formData.company_website}
          onChange={(e) => handleInputChange('company_website', e.target.value)}
          placeholder="https://www.entreprise.com"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-job-gold/20 focus:border-job-gold transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-job-brown mb-2">
          Instructions pour postuler
        </label>
        <textarea
          value={formData.application_instructions}
          onChange={(e) => handleInputChange('application_instructions', e.target.value)}
          rows={3}
          placeholder="Instructions spécifiques pour les candidats..."
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-job-gold/20 focus:border-job-gold resize-none transition-all"
        />
      </div>
    </div>

          {/* Options de mise en avant - SEULEMENT POUR LES COMPTES PREMIUM */}
          {isPremium ? (
        <div className="bg-gradient-to-br from-job-light-gold via-job-cream to-job-light-gold p-8 rounded-2xl border-2 border-job-gold">
          <h3 className="text-lg font-semibold text-job-brown mb-6 flex items-center">
            <Sparkles className="h-6 w-6 mr-3 text-job-gold" />
            Options de mise en avant
          </h3>
          
          {/* ✅ AFFICHER LE QUOTA */}
          {userQuota && (
            <div className="mb-6 p-4 bg-white rounded-xl border-2 border-green-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  📊 Offres à la une disponibles
                </span>
                <span className="text-lg font-bold text-green-600">
                  {(userQuota.featured_jobs_quota || 0) - (userQuota.featured_jobs_used || 0)} / {userQuota.featured_jobs_quota || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ 
                    width: `${Math.min(((userQuota.featured_jobs_used || 0) / (userQuota.featured_jobs_quota || 1)) * 100, 100)}%` 
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Durée : {userQuota.featured_days || 3} jours • Renouvellement : {new Date(userQuota.reset_date).toLocaleDateString('fr-FR')}
              </p>
            </div>
          )}
          
          <div className="space-y-6">
            {/* ✅ CHECKBOX AVEC VÉRIFICATION */}
            <label 
              className={`flex items-center space-x-4 p-6 rounded-xl bg-white border-2 transition-all shadow-sm ${
                userQuota && (userQuota.featured_jobs_used >= userQuota.featured_jobs_quota)
                  ? 'opacity-50 cursor-not-allowed border-gray-200'
                  : 'cursor-pointer border-transparent hover:border-job-gold'
              }`}
            >
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => {
                  // ✅ VÉRIFIER LE QUOTA AVANT D'ACTIVER
                  if (e.target.checked) {
                    if (!userQuota) {
                      alert('❌ Aucun quota disponible. Souscrivez à un abonnement premium.');
                      return;
                    }
                    if (userQuota.featured_jobs_used >= userQuota.featured_jobs_quota) {
                      alert(`❌ Quota épuisé ! Vous avez déjà utilisé ${userQuota.featured_jobs_used}/${userQuota.featured_jobs_quota} offres à la une.`);
                      return;
                    }
                  }
                  handleInputChange('is_featured', e.target.checked);
                }}
                disabled={userQuota && (userQuota.featured_jobs_used >= userQuota.featured_jobs_quota)}
                className="w-6 h-6 text-job-gold rounded focus:ring-job-gold"
              />
              <div className="flex-1">
                <div className="font-semibold text-job-brown flex items-center">
                  Offre à la une
                  <span className="ml-4 px-4 py-2 bg-gradient-to-r from-job-gold to-job-dark-gold text-white text-sm rounded-full font-bold">
                    ⭐ Premium
                  </span>
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  Mise en avant dans le carrousel principal pendant {userQuota?.featured_days || 3} jours
                </div>
              </div>
            </label>

            {/* Option urgente (pas de quota requis) */}
            <label className="flex items-center space-x-4 cursor-pointer p-6 rounded-xl bg-white border-2 border-transparent hover:border-red-300 transition-all shadow-sm">
              <input
                type="checkbox"
                checked={formData.is_urgent}
                onChange={(e) => handleInputChange('is_urgent', e.target.checked)}
                className="w-6 h-6 text-red-500 rounded focus:ring-red-500"
              />
              <div className="flex-1">
                <div className="font-semibold text-job-brown flex items-center">
                  Offre urgente
                  <span className="ml-4 px-4 py-2 bg-red-500 text-white text-sm rounded-full animate-pulse font-bold">
                    🚨 Urgent
                  </span>
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  Badge urgent animé pour attirer l'attention (gratuit avec premium)
                </div>
              </div>
            </label>
          </div>
        </div>
      ) : (
      /* Message pour inciter à passer au premium */
      <div className="from-job-gold to-job-dark-gold p-8 rounded-2xl border-2 border-gray-200 text-center">
        <div className="flex items-center justify-center mb-4">
          <Crown className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          Options de mise en avant
        </h3>
        <p className="text-gray-600 mb-6">
          Boostez votre visibilité avec les options premium :<br />
          Offre à la une, badge urgent, et bien plus encore !
        </p>
        <PremiumButton 
          variant="default"
          className="w-full md:w-auto from-job-gold to-job-dark-gold"
        >
          Passer au Premium
        </PremiumButton>
        <p className="text-xs text-gray-500 mt-3">
          Augmentez vos chances de trouver le candidat idéal
        </p>
      </div>
    )}

    {/* PRÉVISUALISATION DE L'OFFRE */}
    <JobPreview formData={formData} />
  </div>
);

 const renderStepIndicator = () => {
   const steps = [
     { num: 1, name: 'Informations' },
     { num: 2, name: 'Détails' },
     { num: 3, name: 'Conditions' },
     { num: 4, name: 'Publication' }
   ];

   return (
     <div className="flex items-center justify-between mb-8">
       {steps.map((step, index) => (
         <div key={step.num} className="flex items-center flex-1">
           <div className="relative">
             <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
               step.num <= currentStep 
                 ? 'bg-gradient-to-r from-job-gold to-job-dark-gold text-white border-job-gold shadow-lg' 
                 : 'border-gray-300 text-gray-400 bg-white'
             }`}>
               {step.num < currentStep ? (
                 <CheckCircle className="h-6 w-6" />
               ) : (
                 <span className="text-sm font-bold">{step.num}</span>
               )}
             </div>
             <div className={`absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium whitespace-nowrap ${
               step.num <= currentStep ? 'text-job-gold' : 'text-gray-400'
             }`}>
               {step.name}
             </div>
           </div>
           
           {index < steps.length - 1 && (
             <div className={`flex-1 h-0.5 mx-2 transition-all ${
               step.num < currentStep ? 'bg-gradient-to-r from-job-gold to-job-dark-gold' : 'bg-gray-200'
             }`} />
           )}
         </div>
       ))}
     </div>
   );
 };

 if (!user || !isEmployer) {
   return null;
 }

 return (
   <div style={{ 
     minHeight: '100vh', 
     backgroundColor: '#fffaf0',
     textAlign: 'left', 
     maxWidth: 'none',
     width: '100%',
     margin: 0,
     padding: 0
   }}>
     <Navbar />
     
     {/* Header */}
     <section style={{
       paddingTop: '120px',
       paddingBottom: '64px',
       background: 'linear-gradient(135deg, #D4AF37 0%, #F39C12 50%, #AA8C3E 100%)',
       color: 'white',
       width: '100%',
       textAlign: 'left',
       marginBottom: '24px'
     }}>
       <div style={{ 
         maxWidth: '1280px', 
         margin: '0 auto', 
         padding: '0 60px',
         width: '100%'
       }}>
         
         <div className="text-center">
           <h1 className="text-4xl font-bold mb-4">
             Créer une nouvelle offre d'emploi
           </h1>
           <p className="text-xl text-white/90">
             Attirez les meilleurs talents avec une offre attractive
           </p>
         </div>
       </div>
     </section>

     {/* Contenu principal - 3 colonnes */}
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
         
         {/* FORCER FLEXBOX avec CSS inline */}
         <div style={{ 
           display: 'flex', 
           gap: '24px', 
           minHeight: '800px',
           width: '100%'
         }}>
           
           {/* Colonne gauche - Widgets publicitaires */}
           <div style={{ 
             width: '25%', 
             minHeight: '600px',
             padding: '16px'
           }}>
             <div className="sticky top-24 space-y-4">
               {/* Widget Premium */}
               {isPremium ? (
                // Widget pour utilisateurs Premium
                <div className="bg-gradient-to-br from-job-purple to-job-pink rounded-3xl p-6 text-white shadow-2xl transform hover:scale-105 transition-transform">
                  <div className="flex items-center justify-between mb-4">
                    <BadgeCheck className="h-12 w-12 text-white" />
                    <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold">
                      ✅ ACTIF
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-3">
                    Vous êtes Premium !
                  </h3>
                  <p className="text-white/90 mb-4">
                    Profitez de tous les avantages premium pour maximiser vos recrutements
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                        <Star className="h-4 w-4" />
                      </div>
                      <span className="text-sm">Offres à la une activées</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                        <Zap className="h-4 w-4" />
                      </div>
                      <span className="text-sm">Badge urgent disponible</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                        <Target className="h-4 w-4" />
                      </div>
                      <span className="text-sm">Ciblage candidats premium</span>
                    </li>
                  </ul>
                  <button 
                    onClick={() => navigate('/dashboard?tab=premium')}
                    className="w-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 font-bold py-3 rounded-xl transition-all border border-white/30"
                  >
                    Gérer mon abonnement
                  </button>
                </div>
              ) : (
                // Widget pour utilisateurs non-Premium (existant)
                <div className="bg-gradient-to-br from-job-gold via-job-orange to-job-dark-gold rounded-3xl p-6 text-black shadow-2xl transform hover:scale-105 transition-transform">
                  {/* Contenu existant inchangé */}
                  <div className="flex items-center justify-between mb-4">
                    <Crown className="h-12 w-12 text-black/90" />
                    <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold">
                      PREMIUM
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-3">
                    Boostez votre offre !
                  </h3>
                  <p className="text-black/90 mb-4">
                    Multipliez par 5 votre visibilité avec nos options premium
                  </p>
                  
                  <PremiumButton 
                    variant="default"
                    className="w-full md:w-auto"
                  >
                    Passer au Premium
                  </PremiumButton>
                </div>
              )}

               {/* Widget Statistiques avec vraies données */}
               <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                 <div className="flex items-center justify-between mb-4">
                   <h3 className="font-bold text-job-brown flex items-center">
                     <TrendingUp className="h-5 w-5 text-job-gold mr-2" />
                     Vos statistiques
                   </h3>
                   <Activity className="h-5 w-5 text-gray-400" />
                 </div>
                 <div className="space-y-4">
                   <div>
                     <div className="flex justify-between text-sm mb-2">
                       <span className="text-gray-600">Offres actives</span>
                       <span className="font-bold text-job-brown">{employerStats.activeJobs}</span>
                     </div>
                     <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                       <div 
                         className="bg-gradient-to-r from-job-gold to-job-dark-gold h-3 rounded-full transition-all duration-1000" 
                         style={{ width: `${Math.min((employerStats.activeJobs / 10) * 100, 100)}%` }}
                       ></div>
                     </div>
                   </div>
                   <div>
                     <div className="flex justify-between text-sm mb-2">
                       <span className="text-gray-600">Candidatures</span>
                       <span className="font-bold text-job-brown">{employerStats.totalApplications}</span>
                     </div>
                     <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                       <div 
                         className="bg-gradient-to-r from-job-green to-emerald-500 h-3 rounded-full transition-all duration-1000" 
                         style={{ width: `${Math.min((employerStats.totalApplications / 50) * 100, 100)}%` }}
                       ></div>
                     </div>
                   </div>
                   <div>
                     <div className="flex justify-between text-sm mb-2">
                       <span className="text-gray-600">Vues ce mois</span>
                       <span className="font-bold text-job-brown">{employerStats.thisMonthViews}</span>
                     </div>
                     <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                       <div 
                         className="bg-gradient-to-r from-job-blue to-indigo-500 h-3 rounded-full transition-all duration-1000" 
                         style={{ width: `${Math.min((employerStats.thisMonthViews / 100) * 100, 100)}%` }}
                       ></div>
                     </div>
                   </div>
                   <div>
                     <div className="flex justify-between text-sm mb-2">
                       <span className="text-gray-600">Total vues</span>
                       <span className="font-bold text-job-brown">{employerStats.totalViews}</span>
                     </div>
                     <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                       <div 
                         className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-1000" 
                         style={{ width: `${Math.min((employerStats.totalViews / 500) * 100, 100)}%` }}
                       ></div>
                     </div>
                   </div>
                 </div>
                 <div className="mt-6 pt-4 border-t border-gray-100">
                   <Button 
                     onClick={() => navigate('/dashboard')}
                     variant="outline" 
                     className="w-full text-job-gold border-job-gold hover:bg-job-cream"
                   >
                     Voir le tableau de bord
                   </Button>
                 </div>
               </div>

               {/* Widget Conseils */}
               <div className="bg-gradient-to-br from-job-purple to-job-pink rounded-2xl p-6 text-black shadow-xl">
                 <div className="flex items-center mb-3">
                   <Sparkles className="h-6 w-6 mr-2" />
                   <h3 className="font-bold">Astuce du jour</h3>
                 </div>
                 <p className="text-sm leading-relaxed mb-4">
                   Les offres avec une description détaillée et bien formatée reçoivent <strong>3x plus</strong> de candidatures qualifiées !
                 </p>
                 <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                   <p className="text-xs">
                     💡 Utilisez notre éditeur de texte pour structurer votre offre avec des titres et des listes.
                   </p>
                 </div>
               </div>
             </div>
           </div>

           {/* Colonne centrale - Formulaire */}
           <div style={{ 
             width: '50%', 
             backgroundColor: '#fef3c7', 
             minHeight: '600px',
             padding: '16px'
           }}>
             <h2 style={{
               fontSize: '1.25rem',
               fontWeight: 'bold',
               color: '#16a34a',
               marginBottom: '2rem',
               textAlign: 'center'
             }}>
               Publier votre annonce ici
             </h2>
             <div className="bg-white rounded-3xl shadow-xl p-8">
               {renderStepIndicator()}

               <div className="mt-10">
                 {renderStepContent()}
               </div>

               {/* Boutons d'action */}
               <div className="flex justify-between mt-12 pt-8 border-t border-gray-200">
                 <div>
                   {currentStep > 1 && (
                     <Button
                       onClick={prevStep}
                       variant="outline"
                       className="px-8 py-4 border-gray-300 text-gray-600 hover:bg-gray-50 font-medium"
                     >
                       <ArrowLeft className="h-4 w-4 mr-3" />
                       Précédent
                     </Button>
                   )}
                 </div>

                 <div className="flex gap-6">
                   {/* Bouton Sauvegarder en brouillon */}
                   {currentStep === totalSteps && (
                     <Button
                       onClick={() => handleSubmit(true)}
                       disabled={loading}
                       variant="outline"
                       className="px-8 py-4 border-job-gold text-job-gold hover:bg-job-cream font-medium"
                     >
                       {loading ? (
                         <>
                           <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-job-gold mr-3"></div>
                           Sauvegarde...
                         </>
                       ) : (
                         <>
                           <Save className="h-4 w-4 mr-3" />
                           Save
                         </>
                       )}
                     </Button>
                   )}
                 
                   {currentStep < totalSteps ? (
                     <Button
                       onClick={nextStep}
                       className="px-8 py-4 bg-gradient-to-r from-job-gold to-job-dark-gold hover:from-job-dark-gold hover:to-job-gold text-white font-medium"
                     >
                       Étape suivante
                       <ArrowRight className="h-4 w-4 ml-3" />
                     </Button>
                   ) : (
                     <Button
                       onClick={() => handleSubmit(false)}
                       disabled={loading}
                       className="px-8 py-4 bg-gradient-to-r from-job-gold to-job-dark-gold hover:from-job-dark-gold hover:to-job-gold text-white font-medium"
                     >
                       {loading ? (
                         <>
                           <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-3"></div>
                           En cours...
                         </>
                       ) : (
                         <>
                           <Rocket className="h-4 w-4 mr-3" />
                           Publier l'offre
                         </>
                       )}
                     </Button>
                   )}
                 </div>
               </div>

               {errors.submit && (
                 <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start">
                   <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                   <div>
                     <p className="text-sm font-medium text-red-800">Erreur lors de la publication</p>
                     <p className="text-sm text-red-700 mt-1">{errors.submit}</p>
                   </div>
                 </div>
               )}
             </div>
           </div>

           {/* Colonne droite - Offres récentes */}
           <div style={{ 
             width: '25%', 
             backgroundColor: 'white', 
             minHeight: '600px',
             padding: '16px'
           }}>
             <div className="sticky top-24 space-y-4">
               {/* Liste des offres récentes */}
               <div className="bg-white rounded-3xl shadow-xl p-6">
                 <div className="flex items-center justify-between mb-6">
                   <h3 className="font-bold text-job-brown text-lg">Vos offres récentes</h3>
                   <button
                     onClick={handleShowAllJobs}
                     className="text-job-gold hover:text-job-dark-gold text-sm font-medium flex items-center transition-colors"
                   >
                     Voir tout
                     <ChevronRight className="h-4 w-4 ml-1" />
                   </button>
                 </div>

                 {recentJobs.length > 0 ? (
                   <div 
                     className="space-y-3 overflow-y-auto pr-2" 
                     style={{ 
                       height: '252px', // Hauteur fixe pour exactement 3 lignes (84px par ligne)
                       scrollbarWidth: 'thin', 
                       scrollbarColor: '#D4AF37 #f1f1f1' 
                     }}
                   >
                     {recentJobs.map((job) => (
                       <div key={job.$id} className="group relative" style={{ minHeight: '80px' }}>
                         <div className="p-4 rounded-2xl border-2 border-gray-100 hover:border-job-gold transition-all hover:shadow-lg bg-gradient-to-r from-white to-job-cream">
                           <div className="flex items-start justify-between">
                             <div className="flex-1 pr-2">
                               <h4 className="font-semibold text-job-brown text-sm group-hover:text-job-gold transition-colors line-clamp-1">
                                 {job.title}
                               </h4>
                               <div className="flex items-center mt-2 space-x-3 text-xs text-gray-500">
                                 <span className="flex items-center">
                                   <MapPin className="h-3 w-3 mr-1" />
                                   {job.location}
                                 </span>
                                 <span className="flex items-center">
                                   <Users className="h-3 w-3 mr-1" />
                                   {job.views_count || 0} vues
                                 </span>
                               </div>
                             </div>
                             <Link 
                               to={`/jobs/${job.$id}`}
                               target="_blank"
                               className="p-2 text-gray-400 hover:text-job-gold hover:bg-job-cream rounded-lg transition-all"
                             >
                               <Eye className="h-4 w-4" />
                             </Link>
                           </div>
                           
                           <div className="mt-3 flex items-center justify-between">
                             {job.is_active ? (
                               <span className="inline-flex items-center px-2.5 py-1 bg-job-green/20 text-job-green text-xs rounded-full font-medium">
                                 <span className="w-1.5 h-1.5 bg-job-green rounded-full mr-1.5 animate-pulse"></span>
                                 Active
                               </span>
                             ) : job.is_draft ? (
                               <span className="inline-flex items-center px-2.5 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
                                 <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-1.5"></span>
                                 Brouillon
                               </span>
                             ) : (
                               <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                                 <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-1.5"></span>
                                 Inactive
                               </span>
                             )}
                             <span className="text-xs text-gray-400">
                               {new Date(job.created_at).toLocaleDateString('fr-FR')}
                             </span>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="text-center py-12">
                     <div className="w-20 h-20 bg-job-cream rounded-full flex items-center justify-center mx-auto mb-4">
                       <Briefcase className="h-10 w-10 text-job-gold" />
                     </div>
                     <p className="text-job-brown font-medium">
                       Aucune offre publiée
                     </p>
                     <p className="text-gray-400 text-sm mt-1">
                       Vos offres apparaîtront ici
                     </p>
                   </div>
                 )}

               </div>

               {/* Widget Performance */}
               <div className="bg-gradient-to-br from-job-blue via-indigo-500 to-job-purple rounded-2xl p-6 text-black shadow-xl">
                 <div className="flex items-center justify-between mb-4">
                   <h3 className="font-bold flex items-center">
                     <Award className="h-5 w-5 mr-2" />
                     Performance
                   </h3>
                   <Shield className="h-5 w-5 text-white/50" />
                 </div>
                 <div className="space-y-3">
                   <div className="flex items-center justify-between">
                     <span className="text-black/80 text-sm">Taux de réponse</span>
                     <span className="font-bold text-lg">92%</span>
                   </div>
                   <div className="flex items-center justify-between">
                     <span className="text-black/80 text-sm">Temps moyen</span>
                     <span className="font-bold text-lg">2 jours</span>
                   </div>
                   <div className="flex items-center justify-between">
                     <span className="text-black/80 text-sm">Note candidats</span>
                     <div className="flex items-center">
                       <Star className="h-4 w-4 text-yellow-300 fill-current" />
                       <span className="font-bold text-lg ml-1">4.8</span>
                     </div>
                   </div>
                 </div>
                 <div className="mt-4 pt-4 border-t border-white/20">
                   <div className="flex items-center justify-center">
                     <BadgeCheck className="h-5 w-5 mr-2" />
                     <span className="text-sm font-medium">Employeur vérifié</span>
                   </div>
                 </div>
               </div>
             </div>
           </div>

         </div>
       </div>
     </div>

     {/* Modal pour toutes les offres */}
     <AllJobsModal
       jobs={allUserJobs}
       isOpen={showAllJobsModal}
       onClose={() => setShowAllJobsModal(false)}
     />

     {/* Styles CSS personnalisés améliorés */}
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

       /* Améliorations pour l'éditeur rich text */
       .prose h1, .prose h2, .prose h3, .prose h4 {
         color: #8B4513;
         font-weight: 600;
         margin-top: 1.5em;
         margin-bottom: 0.5em;
       }

       .prose h2 {
         font-size: 1.5em;
         border-bottom: 2px solid #D4AF37;
         padding-bottom: 0.3em;
       }

       .prose h3 {
         font-size: 1.25em;
       }

       .prose ul, .prose ol {
         margin: 1em 0;
         padding-left: 1.5em;
       }

       .prose li {
         margin: 0.5em 0;
       }

       .prose p {
         margin: 1em 0;
         line-height: 1.7;
       }

       .prose strong {
         color: #8B4513;
         font-weight: 600;
       }

       .prose blockquote {
         border-left: 4px solid #D4AF37;
         margin: 1.5em 0;
         padding-left: 1em;
         font-style: italic;
         color: #6B7280;
         background: #FEF9E7;
         padding: 1em;
         border-radius: 0.5em;
       }

       .prose a {
         color: #D4AF37;
         text-decoration: underline;
       }

       .prose a:hover {
         color: #B8860B;
       }

       /* Amélioration de la prévisualisation avec formatage HTML */
       .preview-content {
         line-height: 1.6;
         word-wrap: break-word;
         overflow-wrap: break-word;
         hyphens: auto;
       }

       .preview-content h2, .preview-content h3, .preview-content h4 {
         font-weight: 600;
         margin: 1em 0 0.5em 0;
         color: #374151;
       }

       .preview-content h2 {
         font-size: 1.1em;
       }

       .preview-content h3 {
         font-size: 1.05em;
       }

       .preview-content ul, .preview-content ol {
         margin: 0.5em 0;
         padding-left: 1.5em;
       }

       .preview-content li {
         margin: 0.25em 0;
       }

       .preview-content p {
         margin: 0.5em 0;
         line-height: 1.6;
       }

       .preview-content blockquote {
         border-left: 4px solid #D4AF37;
         margin: 1em 0;
         padding-left: 1em;
         font-style: italic;
         color: #6B7280;
       }

       .preview-content strong {
         font-weight: 600;
         color: #374151;
       }

       .preview-content em {
         font-style: italic;
       }

       .preview-content u {
         text-decoration: underline;
       }

       /* Animations améliorées */
       @keyframes pulse {
         0%, 100% { opacity: 1; }
         50% { opacity: 0.5; }
       }

       .animate-pulse {
         animation: pulse 2s infinite;
       }

       /* Personnalisation scrollbar */
       div[style*="height: 252px"]::-webkit-scrollbar {
         width: 6px;
       }

       div[style*="height: 252px"]::-webkit-scrollbar-track {
         background: #f1f1f1;
         border-radius: 3px;
       }

       div[style*="height: 252px"]::-webkit-scrollbar-thumb {
         background: #D4AF37;
         border-radius: 3px;
       }

       div[style*="height: 252px"]::-webkit-scrollbar-thumb:hover {
         background: #B8860B;
       }

       /* Effets de survol pour les cartes de l'étape 2 */
       .selection-card {
         transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
         position: relative;
         overflow: hidden;
       }

       .selection-card::before {
         content: '';
         position: absolute;
         top: 0;
         left: -100%;
         width: 100%;
         height: 100%;
         background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
         transition: left 0.5s;
       }

       .selection-card:hover::before {
         left: 100%;
       }

       /* Responsive design amélioré */
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
       }

       /* Line clamp utility */
       .line-clamp-1 {
         overflow: hidden;
         display: -webkit-box;
         -webkit-box-orient: vertical;
         -webkit-line-clamp: 1;
       }

       /* Border width utility */
       .border-3 {
         border-width: 3px;
       }

       /* Custom focus states */
       .focus\\:ring-job-gold\\/20:focus {
         --tw-ring-opacity: 0.2;
         --tw-ring-color: rgb(212 175 55 / var(--tw-ring-opacity));
         box-shadow: var(--tw-ring-inset) 0 0 0 calc(4px + var(--tw-ring-offset-width)) var(--tw-ring-color);
       }

       .focus\\:border-job-gold:focus {
         border-color: #D4AF37;
       }

       /* Hover states */
       .hover\\:border-job-gold:hover {
         border-color: #D4AF37;
       }

       .hover\\:bg-job-cream:hover {
         background-color: #FEF9E7;
       }

       .hover\\:text-job-gold:hover {
         color: #D4AF37;
       }

       .hover\\:text-job-dark-gold:hover {
         color: #B8860B;
       }

       /* Gradient backgrounds */
       .bg-job-light-gold {
         background-color: #FDF6E3;
       }

       .bg-job-cream {
         background-color: #FEF9E7;
       }

       .bg-job-green\\/20 {
         background-color: rgb(16 185 129 / 0.2);
       }

       .text-job-green {
         color: #10B981;
       }

       /* Animation utilities */
       .transition-all {
         transition-property: all;
         transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
         transition-duration: 150ms;
       }

       .duration-300 {
         transition-duration: 300ms;
       }

       .duration-1000 {
         transition-duration: 1000ms;
       }

       /* Transform utilities */
       .hover\\:scale-105:hover {
         transform: scale(1.05);
       }

       .hover\\:scale-110:hover {
         transform: scale(1.1);
       }

       .group:hover .group-hover\\:scale-110 {
         transform: scale(1.1);
       }

       .group:hover .group-hover\\:text-job-gold {
         color: #D4AF37;
       }

       /* Shadow utilities */
       .shadow-2xl {
         box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
       }

       .hover\\:shadow-xl:hover {
         box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
       }

       .hover\\:shadow-lg:hover {
         box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
       }
     `}</style>
   </div>
 );
};


export default CreateJob;