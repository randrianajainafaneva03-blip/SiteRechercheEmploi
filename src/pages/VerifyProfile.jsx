import React, { useState, useRef, useEffect } from 'react';
import { notifyNewDocument } from '@/lib/telegram';
import { 
  X, 
  Upload, 
  FileText, 
  Shield, 
  CheckCircle,
  Clock,
  AlertCircle,
  Building,
  User,
  Camera,
  Star,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { databases, storage, account, DATABASE_ID, BUCKETS } from '@/lib/appwrite';
import { Query, ID } from 'appwrite';

const VerifyProfile = ({ isOpen, onClose }) => {
  const { user, profile, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [selfieFile, setSelfieFile] = useState(null);
  const [identityFiles, setIdentityFiles] = useState([]);
  const fileInputRefs = useRef({});
  const identityInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [showSelfieModal, setShowSelfieModal] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [stream, setStream] = useState(null);
  const [videoReady, setVideoReady] = useState(false);
  const [notification, setNotification] = useState(null);

  const requiredDocuments = profile?.user_type === 'employer' 
  ? [
      { type: 'certificate', label: 'NIF (Numéro d\'Identification Fiscale)', required: true },
      { type: 'certificate', label: 'STAT (Statistique)', required: true },
      { type: 'certificate', label: 'RCS (Registre de Commerce)', required: true },
      { type: 'other', label: 'Licence d\'exploitation', required: false }
    ]
  : [
      { type: 'id_card', label: 'Carte d\'Identité Nationale ou Passeport', required: true }
    ];

  useEffect(() => {
    if (isOpen && user) {
      loadExistingDocuments();
    }
  }, [isOpen, user]);

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

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const loadExistingDocuments = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        'verification_documents',
        [
          Query.equal('profile_id', user.$id),
          Query.orderDesc('submitted_at')
        ]
      );
      setDocuments(response.documents || []);
    } catch (error) {
      console.error('Erreur chargement documents:', error);
    }
  };

  const startCamera = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false
      };
  
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        
        setTimeout(() => {
          setShowCamera(true);
        }, 500);
        
        const handleLoadedMetadata = () => {
          setShowCamera(true);
          videoRef.current?.removeEventListener('loadedmetadata', handleLoadedMetadata);
        };

        videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
        
        try {
          await videoRef.current.play();
        } catch (playError) {
          setShowCamera(true);
        }
      }
    } catch (error) {
      let errorMessage = 'Impossible d\'accéder à la caméra.';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Veuillez autoriser l\'accès à la caméra dans votre navigateur.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'Aucune caméra trouvée sur cet appareil.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'La caméra est utilisée par une autre application.';
      }
      
      showMessage(errorMessage, 'error');
      setShowSelfieModal(false);
    }
  };
  
  const takeSelfie = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        showMessage('Veuillez attendre que la caméra soit complètement chargée.', 'error');
        return;
      }
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const photoUrl = URL.createObjectURL(blob);
          setCapturedPhoto(photoUrl);
          setSelfieFile(new File([blob], 'selfie-verification.jpg', { type: 'image/jpeg' }));
          stopCamera();
          setShowCamera(false);
        } else {
          showMessage('Erreur lors de la capture. Veuillez réessayer.', 'error');
        }
      }, 'image/jpeg', 0.9);
    } else {
      showMessage('Erreur technique. Veuillez relancer la caméra.', 'error');
    }
  };
  
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  };
  
  const acceptSelfie = () => {
    setShowSelfieModal(false);
  };
  
  const retakeSelfie = () => {
    if (capturedPhoto) {
      URL.revokeObjectURL(capturedPhoto);
    }
    setCapturedPhoto(null);
    setSelfieFile(null);
    setVideoReady(false);
    startCamera();
  };
  
  const closeSelfieModal = () => {
    if (capturedPhoto) {
      URL.revokeObjectURL(capturedPhoto);
    }
    setShowSelfieModal(false);
    setCapturedPhoto(null);
    setSelfieFile(null);
    setVideoReady(false);
    stopCamera();
  };

  const showMessage = (message, type = 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const mapDocumentType = (internalType) => {
    const typeMapping = {
      'identity_recto': 'id_card',
      'identity_verso': 'id_card', 
      'identity': 'id_card',
      'passport': 'passport',
      'selfie': 'other',
      'company_nif': 'certificate',
      'company_stat': 'certificate', 
      'company_rcs': 'certificate',
      'company_license': 'other'
    };
    return typeMapping[internalType] || 'other';
  };

  const handleFileUpload = async (documentType, file, label) => {
    if (!file) return;
  
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      showMessage('Seuls les fichiers JPEG, PNG et PDF sont acceptés', 'error');
      return;
    }
  
    if (file.size > 10 * 1024 * 1024) {
      showMessage('Le fichier ne doit pas dépasser 10MB', 'error');
      return;
    }
  
    setLoading(true);
  
    try {
      const uploadedFile = await storage.createFile(BUCKETS.DOCUMENTS, ID.unique(), file);
      const publicUrl = storage.getFileView(BUCKETS.DOCUMENTS, uploadedFile.$id);
      const mappedDocumentType = mapDocumentType(documentType);

      const document = await databases.createDocument(
        DATABASE_ID,
        'verification_documents',
        ID.unique(),
        {
          profile_id: user.$id,
          document_type: mappedDocumentType,
          document_name: label,
          document_url: publicUrl,
          status: 'pending',
          submitted_at: new Date().toISOString(),
        }
      );
  
      setDocuments([document, ...documents]);
      await updateProfile({ verification_status: 'pending' });
      showMessage('Document envoyé avec succès ! Il sera examiné sous 48h.', 'success');
  
    } catch (error) {
      showMessage(`Erreur lors de l'envoi du document: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const submitVerification = async () => {
    // ✅ VALIDATION CANDIDATS
    if (profile?.user_type === 'candidate') {
      if (identityFiles.length === 0) {
        showMessage('Veuillez uploader au moins votre pièce d\'identité', 'error');
        return;
      }
      if (!selfieFile) {
        showMessage('Veuillez prendre un selfie pour la vérification', 'error');
        return;
      }
    }
    
    // ✅ VALIDATION EMPLOYEURS
    if (profile?.user_type === 'employer') {
      const nifDoc = documents.find(doc => doc.document_name.includes('NIF'));
      const statDoc = documents.find(doc => doc.document_name.includes('STAT'));
      
      if (!nifDoc || !statDoc) {
        showMessage('NIF et STAT sont obligatoires pour la vérification', 'error');
        return;
      }
    }
    
    setLoading(true);
    
    try {
      let uploadedDocuments = []; // ✅ POUR STOCKER LES NOMS DE DOCUMENTS UPLOADÉS
      
      // ✅ UPLOAD DOCUMENTS CANDIDATS
      if (profile?.user_type === 'candidate') {
        // Upload identity documents (CIN recto/verso)
        for (let i = 0; i < identityFiles.length; i++) {
          const file = identityFiles[i];
          const documentType = i === 0 ? 'identity_recto' : 'identity_verso';
          const label = i === 0 ? 'Pièce d\'identité - Recto' : 'Pièce d\'identité - Verso';
          await handleFileUpload(documentType, file, label);
          uploadedDocuments.push(label);
        }
        
        // Upload selfie
        if (selfieFile) {
          const uploadedFile = await storage.createFile(
            BUCKETS.DOCUMENTS, 
            ID.unique(), 
            selfieFile
          );
          
          const publicUrl = storage.getFileView(BUCKETS.DOCUMENTS, uploadedFile.$id);
          const mappedSelfieType = mapDocumentType('selfie');
   
          await databases.createDocument(
            DATABASE_ID,
            'verification_documents',
            ID.unique(),
            {
              profile_id: user.$id,
              document_type: mappedSelfieType,
              document_name: 'Photo de vérification',
              document_url: publicUrl,
              status: 'pending',
              submitted_at: new Date().toISOString(),
            }
          );
          
          uploadedDocuments.push('Photo de vérification');
        }
      }
    
      // ✅ METTRE À JOUR LE STATUT DU PROFIL
      await updateProfile({ verification_status: 'pending' });
      
      // ✅ NOTIFICATION TELEGRAM
      try {
        if (profile?.user_type === 'candidate') {
          // Notification pour candidat
          await notifyNewDocument({
            type: 'Vérification profil candidat',
            user_name: profile?.full_name || user?.name || 'Candidat',
            document_name: uploadedDocuments.join(', '),
            purpose: 'Vérification d\'identité et photo'
          });
        } else if (profile?.user_type === 'employer') {
          // Notification pour employeur
          const docsToVerify = documents
            .filter(doc => doc.status === 'pending')
            .map(doc => doc.document_name)
            .join(', ');
          
          await notifyNewDocument({
            type: 'Vérification profil employeur',
            user_name: profile?.company_name || profile?.full_name || user?.name || 'Employeur',
            document_name: docsToVerify || 'Documents entreprise',
            purpose: 'Vérification documents légaux'
          });
        }
        
        console.log('✅ Notification Telegram envoyée');
      } catch (telegramError) {
        console.warn('⚠️ Erreur notification Telegram (non bloquant):', telegramError);
        // On continue même si Telegram échoue
      }
      
      showMessage('Documents envoyés ! Nous examinerons votre profil sous 48h.', 'success');
      
      setTimeout(() => {
        onClose();
      }, 3000);
      
    } catch (error) {
      console.error('Erreur soumission vérification:', error);
      showMessage('Erreur lors de la soumission', 'error');
    } finally {
      setLoading(false);
    }
  };
  

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-5 w-5 text-slate-500" />;
      case 'approved': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected': return <AlertCircle className="h-5 w-5 text-red-500" />;
      default: return <FileText className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'En attente de vérification';
      case 'approved': return 'Approuvé';
      case 'rejected': return 'Rejeté';
      default: return 'Non envoyé';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-job-dark-gold bg-slate-50 border-job-light-gold';
      case 'approved': return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Modal principal */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-hidden"
        style={{ zIndex: 50 }}
      >
      <div 
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col" 
          onClick={(e) => e.stopPropagation()}
          style={{ height: '85vh', maxHeight: '85vh' }}
        >
          
          {/* Header */}
          <div className="bg-gradient-to-br from-job-navy to-job-navy-dark p-4 text-white rounded-t-2xl flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6" />
                <div>
                  <h2 className="text-lg font-bold">Vérification de profil</h2>
                  <p className="text-xs text-slate-100">
                    {profile?.user_type === 'employer' ? 'Vérifiez votre entreprise' : 'Vérifiez votre identité'}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Notification */}
          {notification && (
            <div className={`mx-4 mt-2 p-4 rounded-xl border-2 flex-shrink-0 ${
              notification.type === 'success' 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                : 'bg-gradient-to-r from-red-50 to-slate-50 border-red-200'
            }`}>
              <div className="text-center">
                {notification.type === 'success' && loading && (
                  <div className="mb-2">
                    <div className="relative mx-auto w-12 h-12">
                      <div className="absolute inset-0 border-4 border-green-200 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-green-500 rounded-full border-t-transparent animate-spin"></div>
                      <CheckCircle className="absolute inset-0 m-auto h-5 w-5 text-green-500" />
                    </div>
                  </div>
                )}
                
                <p className={`font-semibold text-sm mb-1 ${
                  notification.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {notification.type === 'success' ? 'Succès !' : 'Erreur'}
                </p>
                
                <p className={`text-xs ${
                  notification.type === 'success' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {notification.message}
                </p>
              </div>
            </div>
          )}

          {/* Content avec scroll */}
          <div 
            className="overflow-y-auto custom-scrollbar" 
            style={{ 
              flex: '1 1 0',
              minHeight: 0,
              maxHeight: 'calc(85vh - 200px)',
              overflowY: 'scroll',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <div className="p-4 space-y-4">
              
              {/* Status */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                {profile?.user_type === 'employer' ? (
                  <Building className="h-6 w-6 text-job-navy" />
                ) : (
                  <User className="h-6 w-6 text-job-navy" />
                )}
                <div>
                  <h3 className="font-medium text-gray-900 text-sm">Statut de vérification</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    {getStatusIcon(profile?.verification_status)}
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(profile?.verification_status)}`}>
                      {getStatusText(profile?.verification_status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="bg-slate-50 border border-job-navy-light rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <Shield className="h-4 w-4 text-job-navy mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-job-navy-dark text-sm">Pourquoi vérifier ?</h4>
                    <ul className="text-xs text-job-navy-dark mt-1 space-y-1">
                      {profile?.user_type === 'employer' ? (
                        <>
                          <li>• Augmentez la confiance des candidats</li>
                          <li>• Obtenez un badge "Entreprise Vérifiée"</li>
                        </>
                      ) : (
                        <>
                          <li>• Augmentez vos chances d'être recruté</li>
                          <li>• Obtenez un badge "Profil Vérifié"</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              {profile?.user_type === 'candidate' && (
                <>
                  {/* Upload CIN */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center text-sm">
                      <User className="h-4 w-4 mr-2 text-green-600" />
                      Pièce d'identité (Recto/Verso) *
                    </h4>
                    
                    {profile?.verification_status === 'pending' ? (
                      <div className="bg-slate-50 border border-job-light-gold rounded-lg p-4 text-center">
                        <Clock className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                        <h5 className="font-semibold text-job-dark-gold mb-1 text-sm">Vérification en cours</h5>
                        <p className="text-xs text-job-dark-gold">
                          Vos documents sont en cours d'examen.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <input
                            ref={identityInputRef}
                            type="file"
                            accept="image/*,.pdf"
                            multiple
                            onChange={(e) => {
                              const files = Array.from(e.target.files);
                              if (files.length > 2) {
                                showMessage('Maximum 2 fichiers', 'error');
                                return;
                              }
                              setIdentityFiles(files);
                            }}
                            className="hidden"
                          />
                          <Button
                            onClick={() => identityInputRef.current?.click()}
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 text-sm"
                          >
                            <Upload className="h-4 w-4" />
                            <span>Choisir CIN</span>
                          </Button>
                          {identityFiles.length > 0 && (
                            <div className="flex flex-col space-y-1">
                              {identityFiles.map((file, index) => (
                                <span key={index} className="text-green-600 font-medium flex items-center text-xs">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  <span className="truncate max-w-32">{file.name}</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Selfie - VERSION COMPACTE */}
                  <div className="border-2 border-job-navy-light rounded-xl p-4 bg-gradient-to-br from-slate-50 to-slate-50">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center text-sm">
                      <Camera className="h-4 w-4 mr-2 text-job-navy" />
                      Vérification de votre visage *
                    </h4>
                    
                    {profile?.verification_status === 'pending' ? (
                      <div className="bg-slate-50 border-2 border-job-light-gold rounded-lg p-3 text-center">
                        <Clock className="h-6 w-6 text-slate-500 mx-auto mb-1" />
                        <p className="text-xs text-job-dark-gold">Photo en cours de vérification</p>
                      </div>
                    ) : !selfieFile ? (
                      <div>
                        {/* Instructions compactes */}
                        <div className="bg-white border border-job-navy-light rounded-lg p-3 mb-3">
                          <p className="font-bold text-job-navy-dark mb-2 text-xs">
                            📸 DEUX choix :
                          </p>
                          
                          <div className="space-y-2 text-xs">
                            <div className="flex items-start space-x-2">
                              <span className="bg-job-navy text-white rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0 font-bold" style={{ fontSize: '10px' }}>1</span>
                              <span className="text-job-navy-dark">Selfie webcam/caméra</span>
                            </div>
                            
                            <div className="text-center text-gray-500 text-xs">OU</div>
                            
                            <div className="flex items-start space-x-2">
                              <span className="bg-job-navy text-white rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0 font-bold" style={{ fontSize: '10px' }}>2</span>
                              <span className="text-job-navy-dark">Upload photo avec CIN</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* IMAGE 50% */}
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 mb-3 border border-green-300">
                          <div className="flex items-center space-x-1 mb-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <h5 className="font-bold text-green-900 text-xs">EXEMPLES VALIDES</h5>
                          </div>
                          
                          <div className="flex justify-center">
                            <img 
                              src="/images/selfie-example.jpeg" 
                              alt="Exemples selfies valides"
                              className="rounded-lg shadow-md border border-green-400"
                              style={{ width: '50%', maxWidth: '250px' }}
                            />
                          </div>
                          
                          <div className="mt-2 space-y-1">
                            <p className="text-green-800 font-medium text-xs flex items-center">
                              <CheckCircle className="h-3 w-3 mr-1 flex-shrink-0" />
                              Visage + CIN visibles
                            </p>
                            <p className="text-green-800 font-medium text-xs flex items-center">
                              <CheckCircle className="h-3 w-3 mr-1 flex-shrink-0" />
                              Photo CIN lisible
                            </p>
                          </div>
                        </div>

                        {/* Instructions + Erreurs */}
                        <details className="mb-3">
                          <summary className="cursor-pointer text-xs font-semibold text-job-navy-dark mb-2">📷 Comment faire ? (cliquer)</summary>
                          <ol className="space-y-1 text-xs text-job-navy-dark pl-4">
                            <li>1. Tenez votre CIN près du visage</li>
                            <li>2. Visage + CIN bien visibles</li>
                            <li>3. Bon éclairage, pas de reflets</li>
                          </ol>
                          
                          <p className="font-semibold text-red-900 text-xs mt-2 mb-1">❌ À éviter :</p>
                          <ul className="space-y-1 text-xs text-red-900 pl-4">
                            <li>• CIN flou ou trop loin</li>
                            <li>• Visage coupé</li>
                            <li>• Reflets sur CIN</li>
                          </ul>
                        </details>
                        
                        {/* Boutons */}
                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              setShowSelfieModal(true);
                              setTimeout(() => startCamera(), 100);
                            }}
                            className="flex-1 bg-gradient-to-r from-job-navy to-job-navy hover:from-job-navy-dark hover:to-job-navy-dark text-white px-4 py-2 rounded-lg text-xs font-semibold"
                          >
                            <Camera className="h-4 w-4 mr-1" />
                            Selfie
                          </Button>
                          
                          <input
                            ref={el => fileInputRefs.current['selfie_upload'] = el}
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                if (file.size > 10 * 1024 * 1024) {
                                  showMessage('Max 10MB', 'error');
                                  return;
                                }
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  setCapturedPhoto(event.target.result);
                                  setSelfieFile(file);
                                  showMessage('Photo uploadée !', 'success');
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="hidden"
                          />
                          <Button
                            onClick={() => fileInputRefs.current['selfie_upload']?.click()}
                            className="flex-1 bg-gradient-to-r from-job-navy to-job-navy hover:from-job-navy-dark hover:to-job-navy-dark text-white px-4 py-2 rounded-lg text-xs font-semibold"
                          >
                            <Upload className="h-4 w-4 mr-1" />
                            Upload
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-3 bg-green-50 rounded-lg border border-green-300">
                        {capturedPhoto && (
                          <img 
                            src={capturedPhoto} 
                            alt="Photo vérification" 
                            className="w-32 h-32 object-cover rounded-lg mx-auto mb-2 border-2 border-green-400"
                          />
                        )}
                        <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-1" />
                        <p className="text-green-700 font-bold text-xs mb-2">✅ Photo OK !</p>
                        <div className="flex gap-2 justify-center">
                          <Button
                            onClick={() => {
                              setShowSelfieModal(true);
                              setTimeout(() => startCamera(), 100);
                            }}
                            className="bg-job-navy hover:bg-job-navy-dark text-white px-3 py-1 rounded text-xs"
                          >
                            Reprendre
                          </Button>
                          <Button
                            onClick={() => {
                              setCapturedPhoto(null);
                              setSelfieFile(null);
                              fileInputRefs.current['selfie_upload']?.click();
                            }}
                            className="bg-job-navy hover:bg-job-navy-dark text-white px-3 py-1 rounded text-xs"
                          >
                            Changer
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Documents employeurs - COMPLET */}
              {profile?.user_type === 'employer' && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm">Documents entreprise</h3>
                  <div className="space-y-3">
                    {requiredDocuments.map((docType, index) => {
                      const existingDoc = documents.find(doc => doc.document_name === docType.label);
                      
                      return (
                        <div key={`${docType.type}-${index}`} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-1">
                                <h4 className="font-medium text-gray-900 text-xs">{docType.label}</h4>
                                {docType.required && <span className="text-red-500 text-xs font-bold">*</span>}
                              </div>
                              
                              {existingDoc && (
                                <div className="mt-1 flex items-center space-x-1">
                                  {getStatusIcon(existingDoc.status)}
                                  <span className={`px-1 py-0.5 rounded text-xs ${getStatusColor(existingDoc.status)}`}>
                                    {getStatusText(existingDoc.status)}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            <div className="ml-2">
                              {(!existingDoc || existingDoc.status === 'rejected') && profile?.verification_status !== 'pending' && (
                                <>
                                  <input
                                    ref={el => fileInputRefs.current[`${docType.type}-${index}`] = el}
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={(e) => handleFileUpload(`company_${docType.type}_${index}`, e.target.files[0], docType.label)}
                                    className="hidden"
                                  />
                                  <Button
                                    onClick={() => fileInputRefs.current[`${docType.type}-${index}`]?.click()}
                                    disabled={loading}
                                    className="bg-slate-500 hover:bg-job-navy text-white px-3 py-1 rounded text-xs"
                                  >
                                    <Upload className="h-3 w-3 mr-1" />
                                    Envoyer
                                  </Button>
                                </>
                              )}
                              
                              {existingDoc && existingDoc.status === 'approved' && (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              )}
                              
                              {profile?.verification_status === 'pending' && !existingDoc && (
                                <span className="text-job-dark-gold text-xs">En attente</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Message info pour employeurs */}
                  <div className="bg-slate-50 border border-job-light-gold rounded-lg p-3 mt-3">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-4 w-4 text-job-dark-gold mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-job-dark-gold text-sm">Documents obligatoires *</h4>
                        <p className="text-job-dark-gold text-xs mt-1">
                          NIF et STAT sont obligatoires. RCS fortement recommandé.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Message final */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <Shield className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-900 text-sm">Délai : 24-48h</h4>
                    <p className="text-green-800 text-xs mt-1">
                      Nous examinerons vos documents.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-gray-50 border-t border-gray-200 rounded-b-2xl flex-shrink-0">
            <div className="flex justify-between items-center">
              <div className="text-xs text-gray-600">
                {profile?.user_type === 'employer' ? 'Docs obligatoires' : 'CIN + photo obligatoires'}
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={onClose}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm"
                >
                  {profile?.verification_status === 'pending' ? 'Fermer' : 'Annuler'}
                </Button>
                
                {profile?.verification_status === 'approved' ? (
                  <Button className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Vérifié
                  </Button>
                ) : profile?.verification_status === 'pending' ? (
                  <Button disabled className="bg-gray-400 cursor-not-allowed text-gray-600 px-4 py-2 rounded-lg text-sm">
                    <Clock className="h-3 w-3 mr-1" />
                    En attente...
                  </Button>
                ) : (
                  <Button
                    onClick={submitVerification}
                    disabled={loading}
                    className="bg-gradient-to-r from-job-navy to-job-navy hover:from-job-navy-dark hover:to-job-navy-dark text-white px-4 py-2 rounded-lg text-sm"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-1" />
                    ) : (
                      <Shield className="h-3 w-3 mr-1" />
                    )}
                    Envoyer
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Selfie */}
          {showSelfieModal && (
                  <div 
                    className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4"
                    style={{ zIndex: 9999 }}
                  >
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col relative">
                      {/* Header selfie */}
                      <div className="bg-job-dark-gold p-4 text-white rounded-t-2xl flex-shrink-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold">Selfie de vérification</h3>
                          <button 
                            onClick={closeSelfieModal} 
                            className="p-1 hover:bg-white/20 rounded-full"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
          
                      {/* Content selfie */}
                      <div className="flex-1 overflow-y-auto p-4">
          
                        {/* Chargement de la caméra */}
                        {!showCamera && !capturedPhoto && (
                          <div className="text-center">
                            <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-3 border-job-navy-light border-t-job-navy"></div>
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">Démarrage de la caméra...</h4>
                            <p className="text-gray-600 mb-4 text-sm">
                              Veuillez autoriser l'accès à votre caméra
                            </p>
                            {/* Bouton de test pour forcer l'affichage */}
                            <Button
            onClick={() => {
              
              setShowCamera(true);
            }}
            className="!bg-red-500 !text-white hover:!bg-red-600 px-4 py-2 rounded mt-2 font-medium"
          >
            Prendre la photo
          </Button>
                          </div>
                        )}
          
                        {/* Caméra active */}
                        {showCamera && !capturedPhoto && (
                          <div className="text-center space-y-4">
                            <div className="relative inline-block">
                            <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full max-w-sm rounded-lg shadow-lg border-2 border-job-navy-light"
            style={{ 
              transform: 'scaleX(-1)',
              maxHeight: '300px',
              backgroundColor: '#000'
            }}
            onLoadedMetadata={() => {
              
            }}
            onCanPlay={() => {
              
              setVideoReady(true); // MARQUER LA VIDÉO COMME PRÊTE
            }}
            onPlay={() => {
              
            }}
            onError={(e) => {
              console.error('📹 Video error:', e);
            }}
          />
                              
                              {/* DEBUG: Affichage des dimensions vidéo */}
                              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                {videoRef.current?.videoWidth || 0} x {videoRef.current?.videoHeight || 0}
                              </div>
                              
                              {/* Indicateur de statut */}
                              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                                <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
                                LIVE
                              </div>
                            </div>
                            
                            <p className="text-xs text-gray-600">
                              Positionnez-vous avec votre pièce d'identité visible
                            </p>
                            
                            {/* DEBUG: Bouton pour vérifier le stream */}
                            {!videoReady && (
            <Button
              onClick={() => {
                // Forcer le refresh du stream
                if (videoRef.current && stream) {
                  videoRef.current.srcObject = null;
                  setTimeout(() => {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play();
                  }, 100);
                }
              }}
              className="!bg-slate-500 !text-white hover:!bg-job-dark-gold px-4 py-2 rounded text-xl font-medium"
            >
              Afficher la caméra
            </Button>
          )}
          
          <div className="flex justify-center space-x-3">
            {/* Bouton Capturer - AFFICHER seulement après onCanPlay */}
            {videoReady && (
              <Button 
                onClick={takeSelfie} 
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-lg font-medium transform hover:scale-105 transition-all flex items-center space-x-2"
              >
                <div className="w-6 h-6 border-2 border-white rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
                <span>Capturer</span>
              </Button>
            )}
            
            <Button 
              onClick={closeSelfieModal} 
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
            >
              Annuler
            </Button>
          </div>
                          </div>
                        )}
          
                        {/* Photo capturée */}
                        {capturedPhoto && (
                          <div className="text-center space-y-4">
                            <div className="relative inline-block">
                              <img
                                src={capturedPhoto}
                                alt="Selfie capturé"
                                className="w-full max-w-sm mx-auto rounded-lg shadow-lg border-2 border-green-300"
                                style={{ 
                                  maxHeight: '300px'
                                }}
                              />
                              <div className="absolute inset-0 border-2 border-green-500 rounded-lg pointer-events-none"></div>
                            </div>
                            
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                              <h4 className="font-semibold text-green-900 mb-1">Photo capturée avec succès !</h4>
                              <p className="text-xs text-green-800">
                                Vérifiez que votre visage et votre pièce d'identité sont bien visibles
                              </p>
                            </div>
                            
                            <div className="flex justify-center space-x-3">
                              <Button 
                                onClick={acceptSelfie} 
                                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-lg font-medium transform hover:scale-105 transition-all"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Utiliser cette photo
                              </Button>
                              <Button 
                                onClick={retakeSelfie} 
                                className="bg-slate-500 hover:bg-job-dark-gold text-white px-4 py-2 rounded-lg"
                              >
                                <Camera className="h-4 w-4 mr-1" />
                                Reprendre
                              </Button>
                            </div>
                          </div>
                        )}
          
                        {/* Canvas caché pour la capture */}
                        <canvas ref={canvasRef} className="hidden" />
                      </div>
                    </div>
                  </div>
                )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #9333ea, #ec4899);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #7e22ce, #db2777);
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #9333ea #f1f1f1;
        }
      `}</style>
    </>
  );
};

export default VerifyProfile;