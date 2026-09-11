import React, { useState, useRef } from 'react';
import { 
  X, 
  MessageSquare, 
  Send, 
  Crown, 
  User, 
  Building, 
  Mail, 
  Briefcase,
  Sparkles,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  Paperclip,
  FileText,
  Image as ImageIcon,
  Film,
  Music,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { databases, storage, DATABASE_ID, BUCKETS, ID, Query } from '@/lib/appwrite';
import { useMessaging } from '@/hooks/useMessaging'; // ✅ AJOUT
import { toast } from 'sonner'; // ✅ AJOUT

const EMAIL_API_URL =
  import.meta.env.VITE_EMAIL_API_URL ||
  'https://api.job2mada.com/api/send-message-notification';

const DirectMessageModal = ({ isOpen, onClose, recruiterData, jobData, candidateData, otherUserData, contextType = 'job', onMessageSent }) => {
  const { user, profile, isEmployer, isCandidate } = useAuth();
  
  // ✅ HOOK POUR GESTION DES QUOTAS
  const { sendMessage, uploadFile, loadUserQuota } = useMessaging();
  
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState(
    contextType === 'job' 
      ? `Candidature Premium - ${jobData?.title || 'Offre'}` 
      : `Contact Direct - ${otherUserData?.name || 'Profil'}`
  );
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  
  const fileInputRef = useRef(null);

  // Déterminer les participants selon le contexte
  const getParticipants = () => {
    if (contextType === 'job') {
      return {
        currentUser: {
          id: candidateData?.id || candidateData?.$id || user?.$id,
          name: candidateData?.name || candidateData?.full_name || user?.name || user?.full_name,
          email: candidateData?.email || user?.email,
          avatar: candidateData?.avatar || candidateData?.avatar_url || user?.avatar_url,
          user_type: resolveUserType(),
          is_premium: user?.is_premium || false
        },
        otherUser: {
          id: recruiterData?.id || recruiterData?.$id,
          name: recruiterData?.name || recruiterData?.company_name,
          email: recruiterData?.email,
          avatar: recruiterData?.avatar || recruiterData?.avatar_url || recruiterData?.logo,
          user_type: 'employer',
          is_premium: recruiterData?.is_premium || false
        },
        context: jobData
      };
    } else {
      return {
        currentUser: {
          id: user?.$id,
          name: user?.name || user?.full_name,
          email: user?.email,
          avatar: user?.avatar_url,
          user_type: resolveUserType(),
          is_premium: user?.is_premium || false
        },
        otherUser: {
          id: otherUserData?.id || otherUserData?.$id || otherUserData?.user_id,
          name: otherUserData?.name || otherUserData?.full_name,
          email: otherUserData?.email,
          avatar: otherUserData?.avatar || otherUserData?.avatar_url,
          user_type: otherUserData?.user_type || 'candidate',
          is_premium: otherUserData?.is_premium || false
        },
        context: null
      };
    }
  };

  const resolveUserType = () => {
    return (
      user?.user_type ||                
      profile?.user_type ||              
      (isEmployer ? 'employer' : (isCandidate ? 'candidate' : undefined)) ||
      user?.labels?.[0] ||       
      'candidate'
    );
  };
  
  const { currentUser, otherUser, context } = getParticipants();

  // Gestion des fichiers
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files || []);
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type?.startsWith('image/') ? URL.createObjectURL(file) : null
    }));
    
    setAttachedFiles(prev => [...prev, ...newFiles]);
  };

  const removeAttachedFile = (fileId) => {
    setAttachedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove?.preview) URL.revokeObjectURL(fileToRemove.preview);
      return prev.filter(f => f.id !== fileId);
    });
  };

  // ✅ FONCTION D'ENVOI MODIFIÉE AVEC GESTION DES QUOTAS
  const handleSendMessage = async () => {
    if ((!message.trim() && attachedFiles.length === 0) || !subject.trim()) {
      setError('Veuillez remplir le sujet et/ou ajouter du contenu');
      return;
    }

    setSending(true);
    setError('');

    try {
      // 1) Upload des fichiers (si présents)
      let uploadedFiles = [];
      if (attachedFiles.length > 0) {
        for (const attachedFile of attachedFiles) {
          try {
            const uploaded = await uploadFile(attachedFile.file);
            uploadedFiles.push(uploaded);
          } catch (error) {
            console.error('Erreur upload fichier:', error);
          }
        }
      }

      // ✅ 2) UTILISER LE HOOK useMessaging QUI GÈRE AUTOMATIQUEMENT LES QUOTAS
      await sendMessage(
        otherUser.id,
        message.trim() || '[Fichier(s) joint(s)]',
        {
          subject: subject.trim(),
          messageType: contextType === 'job' ? 'job_application' : 'direct_contact',
          attachments: uploadedFiles,
          contextType: contextType,
          contextId: context?.id || context?.$id || null,
          contextTitle: context?.title || null,
          receiverData: {
            id: otherUser.id,
            name: otherUser.name,
            email: otherUser.email,
            type: otherUser.user_type,
            is_premium: otherUser.is_premium
          },
          receiverEmail: otherUser.email,
          receiverName: otherUser.name,
          isRecipientPremium: otherUser.is_premium,
          emailApiUrl: EMAIL_API_URL
        }
      );

      // ✅ Le quota est automatiquement vérifié et incrémenté par useMessaging
      setSent(true);

      // ✅ FORCER LE RAFRAÎCHISSEMENT IMMÉDIAT DU QUOTA
      if (loadUserQuota) {
        await loadUserQuota();
      }

      // Appeler le callback si fourni
      if (onMessageSent) {
        onMessageSent();
      }

      // Fermer après 1.2s
      setTimeout(() => {
        onClose();
        setSent(false);
        setMessage('');
        setSubject(
          contextType === 'job' 
            ? `Candidature Premium - ${context?.title || 'Offre'}` 
            : `Contact Direct - ${otherUser?.name || 'Profil'}`
        );
        setAttachedFiles([]);
        setError('');
      }, 1200);

    } catch (error) {
      console.error('Erreur envoi message:', error);
      
      if (error.message === 'QUOTA_EXCEEDED') {
        // Le toast d'erreur est déjà affiché par useMessaging
        // Fermer le modal sans envoyer
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError('Erreur lors de l\'envoi. Veuillez réessayer.');
      }
    } finally {
      setSending(false);
    }
  };

  const generateProfessionalMessage = () => {
    let professionalTemplate = '';
    
    if (contextType === 'job') {
      professionalTemplate = `Bonjour ${otherUser?.name || 'Madame, Monsieur'},

Je me permets de vous contacter directement concernant l'offre "${context?.title || 'cette opportunité'}" pour laquelle j'ai déjà postulé.

En tant que candidat premium, j'aimerais échanger davantage sur cette opportunité et vous présenter mes motivations plus en détail.

Seriez-vous disponible pour un entretien ou un échange téléphonique dans les prochains jours ?

Je reste à votre disposition pour toute information complémentaire.

Cordialement,
${currentUser?.name || currentUser?.full_name || 'Candidat'}`;
    } else {
      professionalTemplate = `Bonjour ${otherUser?.name || 'Madame, Monsieur'},

J'ai consulté votre profil sur Job2mada et je suis intéressé(e) par votre parcours professionnel.

En tant que membre premium de la plateforme, j'aimerais échanger avec vous concernant d'éventuelles opportunités de collaboration.

Seriez-vous disponible pour un échange dans les prochains jours ?

Cordialement,
${currentUser?.name || currentUser?.full_name || 'Utilisateur'}`;
    }
    
    setMessage(professionalTemplate);
  };

  const getFileIcon = (fileType) => {
    if (fileType?.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
    if (fileType?.startsWith('video/')) return <Film className="h-4 w-4" />;
    if (fileType?.startsWith('audio/')) return <Music className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-hidden"
        style={{ animation: 'fadeIn 0.3s ease-out' }}
      >
        <div 
          className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl flex flex-col"
          style={{ height: '90vh', maxHeight: '90vh', animation: 'slideUp 0.4s ease-out' }}
        >
          <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 p-6 text-white relative overflow-hidden flex-shrink-0">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <Crown className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {contextType === 'job' ? 'Message Direct Premium' : 'Contact Direct Premium'}
                    </h2>
                    <p className="text-white/90">
                      {contextType === 'job' ? 'Contactez directement le recruteur' : 'Contactez ce profil directement'}
                    </p>
                  </div>
                </div>
                <button onClick={onClose} className="p-3 hover:bg-white/20 rounded-full transition-colors">
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>

              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                  {contextType === 'job' ? (
                    <>
                      <div className="flex items-center space-x-3">
                        <Briefcase className="h-5 w-5 text-white flex-shrink-0" />
                        <span className="truncate">Offre : {context?.title || 'Non spécifiée'}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Building className="h-5 w-5 text-white flex-shrink-0" />
                        <span className="truncate">Entreprise : {otherUser?.name || 'Non spécifiée'}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center space-x-3">
                        <User className="h-5 w-5 text-white flex-shrink-0" />
                        <span className="truncate">Contact : {otherUser?.name || 'Non spécifié'}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-white flex-shrink-0" />
                        <span className="truncate">Type : Contact Direct</span>
                      </div>
                    </>
                  )}
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-white flex-shrink-0" />
                    <span className="truncate">De : {currentUser?.name || currentUser?.full_name || 'Utilisateur'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-white flex-shrink-0" />
                    <span>Message Premium Certifié</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#CBD5E0 #F7FAFC' }}>
            <div className="p-6">
              {sent ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
                  <h3 className="text-3xl font-bold text-green-700 mb-4">Message envoyé avec succès !</h3>
                  <p className="text-green-600 mb-6 text-lg">
                    Votre message premium a été livré. Une notification email a été envoyée.
                  </p>
                  <div className="bg-green-50 rounded-2xl p-6 border-2 border-green-200 max-w-md mx-auto">
                    <p className="text-green-700 font-medium flex items-center justify-center">
                      <Clock className="h-5 w-5 mr-2" />
                      Réponse attendue sous 48h maximum (garantie premium)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Sujet du message *
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-base"
                      placeholder="Sujet de votre message..."
                    />
                  </div>

                  {attachedFiles.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-4 border-2 border-dashed border-gray-300">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-700 flex items-center">
                          <Paperclip className="h-4 w-4 mr-2" />
                          Fichiers joints ({attachedFiles.length})
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 gap-3 max-h-32 overflow-y-auto">
                        {attachedFiles.map((file) => (
                          <div key={file.id} className="flex items-center space-x-3 p-2 bg-white rounded-lg border">
                            {file.preview ? (
                              <img src={file.preview} alt="" className="w-12 h-12 object-cover rounded" />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                {getFileIcon(file.type)}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                            </div>
                            <button
                              onClick={() => removeAttachedFile(file.id)}
                              className="p-1 hover:bg-gray-200 rounded-full text-red-500"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-3 space-y-2 lg:space-y-0">
                      <label className="block text-sm font-bold text-gray-700">
                        Votre message
                      </label>
                      <div className="flex items-center space-x-4">
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          onChange={handleFileSelect}
                          className="hidden"
                          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip,.rar"
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center space-x-2"
                        >
                          <Paperclip className="h-4 w-4" />
                          <span>Joindre des fichiers</span>
                        </button>
                        <button
                          onClick={generateProfessionalMessage}
                          className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center space-x-2"
                        >
                          <Sparkles className="h-4 w-4" />
                          <span>Modèle professionnel</span>
                        </button>
                      </div>
                    </div>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={10}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none text-base leading-relaxed"
                      placeholder="Rédigez votre message professionnel..."
                    />
                    <div className="flex justify-between items-center mt-3 text-sm text-gray-500">
                      <span>{message.length} caractères</span>
                      <span className={`font-medium ${message.length < 50 && attachedFiles.length === 0 ? 'text-orange-500' : 'text-green-500'}`}>
                        {message.length < 50 && attachedFiles.length === 0 ? 'Ajoutez du contenu ou des fichiers' : 'Contenu optimal'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
                    <h4 className="font-bold text-green-700 mb-4 flex items-center text-lg">
                      <Crown className="h-5 w-5 mr-2" />
                      Avantages de votre message premium
                    </h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <ul className="text-green-600 space-y-2">
                        <li className="flex items-center"><div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>Notification email immédiate</li>
                        <li className="flex items-center"><div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>Réponse garantie sous 48h</li>
                        <li className="flex items-center"><div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>Envoi de fichiers illimité</li>
                      </ul>
                      <ul className="text-green-600 space-y-2">
                        <li className="flex items-center"><div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>Message marqué prioritaire</li>
                        <li className="flex items-center"><div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>Accès direct sans filtrage</li>
                        <li className="flex items-center"><div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>Support multimédia complet</li>
                      </ul>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start">
                      <AlertCircle className="h-6 w-6 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-800">Erreur</p>
                        <p className="text-sm text-red-700 mt-1">{error}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {!sent && (
            <div className="bg-gray-50 border-t-2 border-gray-200 p-6 flex-shrink-0">
              <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-6">
                <button
                  onClick={onClose}
                  className="flex-1 lg:flex-none lg:px-8 bg-gray-200 text-gray-700 font-bold py-4 px-6 rounded-xl hover:bg-gray-300 transition-all text-base"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={sending || ((!message.trim() && attachedFiles.length === 0) || !subject.trim())}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-base min-h-[56px]"
                >
                  {sending ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      <span>Envoi en cours...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-6 w-6" />
                      <span>Envoyer le message premium</span>
                      <Crown className="h-6 w-6" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes slideUp { 0% { opacity: 0; transform: translateY(50px) scale(0.95); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
        body.modal-open { overflow: hidden; }
        .scrollbar-thin::-webkit-scrollbar { width: 6px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: #f7fafc; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #cbd5e0; border-radius: 3px; }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #a0aec0; }
      `}</style>
    </>
  );
};

export default DirectMessageModal;