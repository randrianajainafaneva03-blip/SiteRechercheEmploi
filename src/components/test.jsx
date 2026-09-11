import React, { useState, useRef, useEffect } from 'react';
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

  // ✅ CORRECTION: Utiliser les types acceptés par Appwrite
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

  // Nettoyage du stream quand le composant se démonte
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
    console.log('🎥 Tentative de démarrage de la caméra...');
    try {
      // Arrêter le stream précédent s'il existe
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      };
  
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('✅ Autorisation caméra accordée');
      setStream(newStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        
        // FORCER l'affichage de la caméra après un délai
        setTimeout(() => {
          console.log('🎯 FORCER affichage caméra');
          setShowCamera(true);
        }, 500);
        
        // Fonction pour gérer le chargement des métadonnées (backup)
        const handleLoadedMetadata = () => {
          console.log('📹 Vidéo prête, dimensions:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight);
          setShowCamera(true);
          videoRef.current?.removeEventListener('loadedmetadata', handleLoadedMetadata);
        };

        // Ajouter l'event listener comme backup
        videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
        
        // Commencer la lecture
        try {
          await videoRef.current.play();
          console.log('▶️ Lecture vidéo démarrée');
        } catch (playError) {
          console.error('Erreur lecture vidéo:', playError);
          // Forcer l'affichage même si autoplay échoue
          setShowCamera(true);
        }
      }
    } catch (error) {
      console.error('❌ Erreur caméra:', error);
      
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
    console.log('📸 Capture de la photo...');
    
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      // Vérifier que la vidéo a des dimensions valides
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        console.error('❌ Vidéo pas encore prête');
        showMessage('Veuillez attendre que la caméra soit complètement chargée.', 'error');
        return;
      }
      
      // Définir les dimensions du canvas
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      
      // CAPTURE NORMALE SANS MIROIR (pour la photo finale)
      // On dessine l'image telle qu'elle est, sans transformation
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convertir en blob
      canvas.toBlob((blob) => {
        if (blob) {
          console.log('✅ Photo capturée:', blob.size, 'bytes');
          
          const photoUrl = URL.createObjectURL(blob);
          setCapturedPhoto(photoUrl);
          setSelfieFile(new File([blob], 'selfie-verification.jpg', { type: 'image/jpeg' }));
          
          // Arrêter la caméra
          stopCamera();
          setShowCamera(false);
        } else {
          console.error('❌ Erreur lors de la capture');
          showMessage('Erreur lors de la capture. Veuillez réessayer.', 'error');
        }
      }, 'image/jpeg', 0.9);
    } else {
      console.error('❌ Éléments vidéo/canvas non disponibles');
      showMessage('Erreur technique. Veuillez relancer la caméra.', 'error');
    }
  };
  
  const stopCamera = () => {
    console.log('🛑 Arrêt de la caméra...');
    
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('🔴 Track arrêté:', track.kind);
      });
      setStream(null);
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setShowCamera(false);
  };
  
  const acceptSelfie = () => {
    console.log('✅ Selfie accepté');
    setShowSelfieModal(false);
    // Le selfieFile est déjà défini dans takeSelfie()
  };
  
  const retakeSelfie = () => {
    console.log('🔄 Reprendre le selfie...');
    
    if (capturedPhoto) {
      URL.revokeObjectURL(capturedPhoto);
    }
    
    setCapturedPhoto(null);
    setSelfieFile(null);
    setVideoReady(false); // RESET
    startCamera();
  };
  
  const closeSelfieModal = () => {
    console.log('❌ Fermeture modal selfie');
    
    if (capturedPhoto) {
      URL.revokeObjectURL(capturedPhoto);
    }
    
    setShowSelfieModal(false);
    setCapturedPhoto(null);
    setSelfieFile(null);
    setVideoReady(false); // RESET
    stopCamera();
  };

  const showMessage = (message, type = 'error') => {
    // Utiliser un système de message dans l'interface au lieu de toast
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // ✅ CORRECTION: Fonction helper pour mapper les types internes vers les types Appwrite
  const mapDocumentType = (internalType) => {
    const typeMapping = {
      // Documents candidats
      'identity_recto': 'id_card',
      'identity_verso': 'id_card', 
      'identity': 'id_card',
      'passport': 'passport',
      'selfie': 'other',
      
      // Documents employeurs
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
      console.log('📤 Upload vers Appwrite Storage:', documentType);
  
      const uploadedFile = await storage.createFile(
        BUCKETS.DOCUMENTS, // Vérifiez que ce bucket existe
        ID.unique(),
        file
      );
  
      console.log('✅ Upload réussi:', uploadedFile);
  
      // ✅ URL PUBLIQUE APPWRITE
      const publicUrl = storage.getFileView(BUCKETS.DOCUMENTS, uploadedFile.$id);
  
      console.log('🔗 URL publique:', publicUrl);
      
      // ✅ CORRECTION: Utiliser le type mappé compatible avec Appwrite
      const mappedDocumentType = mapDocumentType(documentType);
      
      console.log('🔄 Type original:', documentType, '-> Type mappé:', mappedDocumentType);

      const document = await databases.createDocument(
        DATABASE_ID,
        'verification_documents', // Vérifiez que cette collection existe
        ID.unique(),
        {
          profile_id: user.$id,
          document_type: mappedDocumentType, // ✅ UTILISER LE TYPE MAPPÉ
          document_name: label,
          document_url: publicUrl,
          status: 'pending',
          submitted_at: new Date().toISOString(),
        }
      );
  
      console.log('✅ Document enregistré en DB:', document);
  
      // Mettre à jour l'état local
      setDocuments([document, ...documents]);
  
      // Mettre à jour le statut de vérification du profil
      await updateProfile({ verification_status: 'pending' });
  
      showMessage('Document envoyé avec succès ! Il sera examiné sous 48h.', 'success');
  
    } catch (error) {
      console.error('❌ Erreur upload document:', error);
      showMessage(`Erreur lors de l'envoi du document: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const submitVerification = async () => {
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
    
    setLoading(true);
    
    try {
      if (profile?.user_type === 'candidate') {
        // Upload identity documents (multiple files)
        for (let i = 0; i < identityFiles.length; i++) {
          const file = identityFiles[i];
          const documentType = i === 0 ? 'identity_recto' : 'identity_verso';
          const label = i === 0 ? 'Pièce d\'identité - Recto' : 'Pièce d\'identité - Verso';
          
          await handleFileUpload(documentType, file, label);
        }
        
        // Upload selfie avec Appwrite
        if (selfieFile) {
          const uploadedFile = await storage.createFile(
            BUCKETS.DOCUMENTS,
            ID.unique(),
            selfieFile
          );
  
          const publicUrl = storage.getFileView(BUCKETS.DOCUMENTS, uploadedFile.$id);
          
          // ✅ CORRECTION: Utiliser le type mappé pour le selfie
          const mappedSelfieType = mapDocumentType('selfie');
          
          console.log('📸 Upload selfie avec type:', mappedSelfieType);

          await databases.createDocument(
            DATABASE_ID,
            'verification_documents',
            ID.unique(),
            {
              profile_id: user.$id,
              document_type: mappedSelfieType, // ✅ 'other' au lieu de 'selfie'
              document_name: 'Photo de vérification',
              document_url: publicUrl,
              status: 'pending',
              submitted_at: new Date().toISOString(),
            }
          );
        }
      }
      
      await updateProfile({ verification_status: 'pending' });
      
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
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'En attente de vérification';
      case 'approved':
        return 'Approuvé';
      case 'rejected':
        return 'Rejeté';
      default:
        return 'Non envoyé';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'approved':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Modal principal - COMPACT ET CENTRÉ */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
          {/* Header compact */}
          <div className="bg-gradient-to-br from-job-purple to-job-pink p-4 text-white rounded-t-2xl flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6" />
                <div>
                  <h2 className="text-lg font-bold">Vérification de profil</h2>
                  <p className="text-xs text-blue-100">
                    {profile?.user_type === 'employer' ? 'Vérifiez votre entreprise' : 'Vérifiez votre identité'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          {/* Dans le modal principal, après le header */}
          {notification && (
  <div className={`mx-4 mt-2 p-6 rounded-xl border-2 ${
    notification.type === 'success' 
      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
      : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
  }`}>
    <div className="text-center">
      {notification.type === 'success' && loading && (
        <div className="mb-4">
          <div className="relative mx-auto w-16 h-16">
            <div className="absolute inset-0 border-4 border-green-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-green-500 rounded-full border-t-transparent animate-spin"></div>
            <CheckCircle className="absolute inset-0 m-auto h-6 w-6 text-green-500" />
          </div>
        </div>
      )}
      
      {notification.type === 'success' && !loading && (
        <div className="mb-4">
          <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
        </div>
      )}
      
      <p className={`font-semibold text-lg mb-2 ${
        notification.type === 'success' ? 'text-green-800' : 'text-red-800'
      }`}>
        {notification.type === 'success' ? 'Succès !' : 'Erreur'}
      </p>
      
      <p className={`text-sm ${
        notification.type === 'success' ? 'text-green-700' : 'text-red-700'
      }`}>
        {notification.message}
      </p>
      
      {!loading && (
        <button 
          onClick={() => setNotification(null)} 
          className="mt-3 text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  </div>
)}
  
          {/* Content avec scroll */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-4">
              {/* Status compact */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                {profile?.user_type === 'employer' ? (
                  <Building className="h-6 w-6 text-blue-600" />
                ) : (
                  <User className="h-6 w-6 text-blue-600" />
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
  
              {/* Info section compact */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 text-sm">Pourquoi vérifier ?</h4>
                    <ul className="text-xs text-blue-800 mt-1 space-y-1">
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
                  {/* Upload CIN/Passeport compact - MULTIPLE FILES */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center text-sm">
                      <User className="h-4 w-4 mr-2 text-green-600" />
                      Pièce d'identité (Recto/Verso) *
                    </h4>
                    
                    {/* Vérifier si déjà en attente */}
                    {profile?.verification_status === 'pending' ? (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                        <Clock className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                        <h5 className="font-semibold text-yellow-900 mb-1">Vérification en cours</h5>
                        <p className="text-xs text-yellow-800">
                          Vos documents sont en cours d'examen. Vous ne pouvez plus modifier vos pièces justificatives.
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
                                showMessage('Vous pouvez uploader maximum 2 fichiers (recto/verso)', 'error');
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
                            <span>Choisir CIN/Passeport</span>
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
                        <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                          Uploadez 1 ou 2 photos : recto obligatoire, verso si nécessaire (CIN recto/verso ou passeport)
                        </p>
                      </div>
                    )}
                  </div>
  
                  {/* Selfie compact */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center text-sm">
                      <Camera className="h-4 w-4 mr-2 text-purple-600" />
                      Selfie de vérification *
                    </h4>
                    
                    <div className="text-center">
                      {profile?.verification_status === 'pending' ? (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <Clock className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                          <h5 className="font-semibold text-yellow-900 mb-1">Selfie déjà soumis</h5>
                          <p className="text-xs text-yellow-800">
                            Votre selfie est en cours de vérification.
                          </p>
                        </div>
                      ) : !selfieFile ? (
                        <div>
                          <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                            <Camera className="h-8 w-8 text-purple-600" />
                          </div>
                          <Button
                            onClick={() => {
                              setShowSelfieModal(true);
                              // Démarrer la caméra automatiquement après un délai pour que le modal soit monté
                              setTimeout(() => {
                                startCamera();
                              }, 100);
                            }}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mx-auto text-sm"
                          >
                            <Camera className="h-4 w-4" />
                            <span>Prendre selfie</span>
                          </Button>
                          <p className="text-xs text-gray-600 mt-2">
                            Tenez votre pièce d'identité près de votre visage
                          </p>
                        </div>
                      ) : (
                        <div className="inline-block p-3 bg-green-50 rounded-lg border border-green-200">
                          <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-1" />
                          <p className="text-green-700 font-medium mb-2 text-xs">Selfie capturé !</p>
                          <Button
                            onClick={() => {
                              setShowSelfieModal(true);
                              // Démarrer la caméra automatiquement après un délai pour que le modal soit monté
                              setTimeout(() => {
                                startCamera();
                                
                              }, 100);
                            }}
                            className="text-purple-600 hover:text-purple-800 text-xs underline bg-transparent p-1"
                          >
                            Reprendre
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
  
              {/* Documents employeurs - compact */}
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
                              <h4 className="font-medium text-gray-900 text-xs">{docType.label}</h4>
                              {docType.required && <span className="text-red-500 text-xs">*</span>}
                              
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
                              {(!existingDoc || existingDoc.status === 'rejected') && (
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
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
                                  >
                                    <Upload className="h-3 w-3 mr-1" />
                                    Envoyer
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
  
              {/* Message final compact */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <Shield className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-900 text-sm">Délai : 24-48h</h4>
                    <p className="text-green-800 text-xs mt-1">
                      Nous examinerons vos documents et confirmerons votre vérification.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
  
          {/* Footer compact */}
          <div className="p-4 bg-gray-50 border-t border-gray-200 rounded-b-2xl flex-shrink-0">
  <div className="flex justify-between items-center">
    <div className="text-xs text-gray-600">
      {profile?.user_type === 'employer' ? 'Documents * obligatoires' : 'CIN + selfie obligatoires'}
    </div>
    <div className="flex space-x-2">
      <Button
        onClick={onClose}
        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm"
      >
        {profile?.verification_status === 'pending' ? 'Fermer' : 'Annuler'}
      </Button>
      
      {/* Bouton Envoyer - logique conditionnelle */}
      {profile?.verification_status === 'approved' ? (
        <Button
          onClick={() => showMessage('Vous n\'avez plus à vérifier votre compte car il est déjà vérifié. Merci !', 'success')}
          className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-1"
        >
          <CheckCircle className="h-3 w-3" />
          <span>Vérifié</span>
        </Button>
      ) : profile?.verification_status === 'pending' ? (
        <Button
          disabled
          className="bg-gray-400 cursor-not-allowed text-gray-600 px-4 py-2 rounded-lg text-sm flex items-center space-x-1"
        >
          <Clock className="h-3 w-3" />
          <span>En attente...</span>
        </Button>
      ) : (
        <Button
          onClick={submitVerification}
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-1"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
          ) : (
            <Shield className="h-3 w-3" />
          )}
          <span>Envoyer</span>
        </Button>
      )}
    </div>
  </div>
</div>
        </div>
      </div>
  
      {/* Modal Selfie - VERSION QUI FONCTIONNAIT */}
      {showSelfieModal && (
        <div 
          className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4"
          style={{ zIndex: 9999 }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col relative">
            {/* Header selfie */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 text-white rounded-t-2xl flex-shrink-0">
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
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-3 border-purple-300 border-t-purple-600"></div>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Démarrage de la caméra...</h4>
                  <p className="text-gray-600 mb-4 text-sm">
                    Veuillez autoriser l'accès à votre caméra
                  </p>
                  {/* Bouton de test pour forcer l'affichage */}
                  <Button
  onClick={() => {
    console.log('🔧 FORCE showCamera = true');
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
  className="w-full max-w-sm rounded-lg shadow-lg border-2 border-purple-300"
  style={{ 
    transform: 'scaleX(-1)',
    maxHeight: '300px',
    backgroundColor: '#000'
  }}
  onLoadedMetadata={() => {
    console.log('📹 onLoadedMetadata triggered');
    console.log('Video dimensions:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight);
  }}
  onCanPlay={() => {
    console.log('📹 onCanPlay triggered');
    setVideoReady(true); // MARQUER LA VIDÉO COMME PRÊTE
  }}
  onPlay={() => {
    console.log('📹 onPlay triggered');
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
    className="!bg-orange-500 !text-white hover:!bg-orange-600 px-4 py-2 rounded text-xl font-medium"
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
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
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



    </>
  );
};

export default VerifyProfile;