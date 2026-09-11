import React, { useState, useRef, useEffect } from 'react';
import { 
 X, 
 Plus, 
 Calendar, 
 Building, 
 MapPin, 
 Upload, 
 FileText, 
 Briefcase,
 Award,
 Save,
 Trash2,
 CheckCircle,
 AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { databases, storage, DATABASE_ID, Query, ID } from '@/lib/appwrite';

const OptimizeProfile = ({ isOpen, onClose }) => {
 const { user, profile } = useAuth();
 const [activeTab, setActiveTab] = useState('experience');
 const [loading, setLoading] = useState(false);
 const cvInputRef = useRef(null);
 const portfolioInputRef = useRef(null);

 const [experiences, setExperiences] = useState([]);
 const [educations, setEducations] = useState([]);
 const [successMessage, setSuccessMessage] = useState('');
 const [errorMessage, setErrorMessage] = useState('');
 
 // États pour les modals
 const [showExperiencesModal, setShowExperiencesModal] = useState(false);
 const [showEducationsModal, setShowEducationsModal] = useState(false);
 
 const [newExperience, setNewExperience] = useState({
  company: '',
  position: '',
  start_date: '',
  end_date: '',
  description: '',
  location: '',
  is_current: false
});

const [newEducation, setNewEducation] = useState({
  institution: '',
  degree: '',
  field_of_study: '',
  start_date: '',
  end_date: '',
  description: '',
  location: '',
  is_current: false
});

 // Charger les données existantes
 useEffect(() => {
  if (isOpen && user) {
    loadExistingData();
  }
}, [isOpen, user?.$id]);

 useEffect(() => {
    if (showExperiencesModal || showEducationsModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showExperiencesModal, showEducationsModal]);

 const showMessage = (message, type = 'success') => {
   if (type === 'success') {
     setSuccessMessage(message);
     setErrorMessage('');
   } else {
     setErrorMessage(message);
     setSuccessMessage('');
   }
   setTimeout(() => {
     setSuccessMessage('');
     setErrorMessage('');
   }, 3000);
 };

 const loadExistingData = async () => {
  try {
    setLoading(true);
    console.log('Chargement des données pour l\'utilisateur:', user.$id);

    // Charger expériences
    const experiencesResponse = await databases.listDocuments(
      DATABASE_ID,
      'professional_experience',
      [
        Query.equal('profile_id', user.$id),
        Query.orderDesc('start_date')
      ]
    );

    // Charger éducation
    const educationsResponse = await databases.listDocuments(
      DATABASE_ID,
      'education',
      [
        Query.equal('profile_id', user.$id),
        Query.orderDesc('start_date')
      ]
    );

    console.log('Expériences chargées:', experiencesResponse.documents);
    console.log('Formations chargées:', educationsResponse.documents);

    setExperiences(experiencesResponse.documents || []);
    setEducations(educationsResponse.documents || []);
  } catch (error) {
    console.error('Erreur chargement données:', error);
    showMessage('Erreur lors du chargement des données: ' + error.message, 'error');
    setExperiences([]);
    setEducations([]);
  } finally {
    setLoading(false);
  }
};

const addExperience = async () => {
  try {
    console.log('🔍 DEBUG - newExperience complet:', newExperience);
    console.log('🔍 DEBUG - company:', newExperience.company);
    console.log('🔍 DEBUG - position:', newExperience.position);
    
    // ✅ VALIDATION CORRIGÉE
    if (!newExperience.company || !newExperience.position || 
        newExperience.company.trim() === '' || newExperience.position.trim() === '') {
      console.log('❌ VALIDATION ÉCHOUÉE');
      showMessage('Veuillez remplir l\'entreprise et le poste', 'error');
      return;
    }

    console.log('✅ VALIDATION RÉUSSIE - Envoi des données...');

    // ⚠️ CORRECTION: Utiliser les noms de champs exacts de votre DB
    const experienceData = {
      profile_id: user.$id,
      company: newExperience.company.trim(), // 'company' au lieu de 'company_name'
      position: newExperience.position.trim(),
      start_date: newExperience.start_date || '',
      end_date: newExperience.end_date || null,
      description: newExperience.description?.trim() || null,
      is_current: newExperience.is_current || false,
      created_at: new Date().toISOString()
    };

    console.log('📤 Données à envoyer:', experienceData);

    const result = await databases.createDocument(
      DATABASE_ID,
      'professional_experience',
      ID.unique(),
      experienceData
    );

    console.log('✅ Expérience créée:', result);

    // Recharger les données
    await loadExistingData();

    // Reset formulaire
    setNewExperience({
      company: '',
      position: '',
      start_date: '',
      end_date: '',
      description: '',
      location: '',
      is_current: false
    });

    showMessage('✅ Expérience ajoutée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    showMessage('❌ Erreur: ' + error.message, 'error');
  }
};

const addEducation = async () => {
  try {
    console.log('🔍 DEBUG - newEducation complet:', newEducation);
    console.log('🔍 DEBUG - institution:', newEducation.institution);
    console.log('🔍 DEBUG - degree:', newEducation.degree);
    
    // ✅ VALIDATION CORRIGÉE
    if (!newEducation.institution || !newEducation.degree || 
        newEducation.institution.trim() === '' || newEducation.degree.trim() === '') {
      console.log('❌ VALIDATION ÉCHOUÉE');
      showMessage('Veuillez remplir l\'établissement et le diplôme', 'error');
      return;
    }

    console.log('✅ VALIDATION RÉUSSIE - Envoi des données...');

    // ⚠️ CORRECTION: Utiliser les noms de champs exacts de votre DB
    const educationData = {
      profile_id: user.$id,
      institution: newEducation.institution.trim(), // 'institution' au lieu de 'institution_name'
      degree: newEducation.degree.trim(),
      field_of_study: newEducation.field_of_study?.trim() || null,
      start_date: newEducation.start_date || '',
      end_date: newEducation.end_date || null,
      description: newEducation.description?.trim() || null,
      is_current: newEducation.is_current || false,
      created_at: new Date().toISOString()
    };

    console.log('📤 Données à envoyer:', educationData);

    const result = await databases.createDocument(
      DATABASE_ID,
      'education',
      ID.unique(),
      educationData
    );

    console.log('✅ Formation créée:', result);

    // Recharger les données
    await loadExistingData();

    // Reset formulaire
    setNewEducation({
      institution: '',
      degree: '',
      field_of_study: '',
      start_date: '',
      end_date: '',
      description: '',
      location: '',
      is_current: false
    });

    showMessage('✅ Formation ajoutée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    showMessage('❌ Erreur: ' + error.message, 'error');
  }
};

const deleteExperience = async (id) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette expérience ?')) {
    return;
  }

  try {
    setLoading(true);
    
    const experienceData = await databases.getDocument(
      DATABASE_ID,
      'professional_experience',
      id
    );
    
    if (experienceData.profile_id !== user.$id) {
      throw new Error('Accès non autorisé pour supprimer cette expérience');
    }

    await databases.deleteDocument(
      DATABASE_ID,
      'professional_experience',
      id
    );

    setExperiences(experiences.filter(exp => exp.$id !== id));
    showMessage('Expérience supprimée avec succès');
  } catch (error) {
    console.error('Erreur suppression:', error);
    showMessage('Erreur lors de la suppression', 'error');
  } finally {
    setLoading(false);
  }
};

const deleteEducation = async (id) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
    return;
  }

  try {
    setLoading(true);
    
    const educationData = await databases.getDocument(
      DATABASE_ID,
      'education',
      id
    );
    
    if (educationData.profile_id !== user.$id) {
      throw new Error('Accès non autorisé pour supprimer cette formation');
    }

    await databases.deleteDocument(
      DATABASE_ID,
      'education',
      id
    );

    setEducations(educations.filter(edu => edu.$id !== id));
    showMessage('Formation supprimée avec succès');
  } catch (error) {
    console.error('Erreur suppression:', error);
    showMessage('Erreur lors de la suppression', 'error');
  } finally {
    setLoading(false);
  }
};

const handleFileUpload = async (type, file) => {
  if (!file) return;

  const bucketId = 'documents';
  const fileName = `${user.$id}-${type}-${Date.now()}.${file.name.split('.').pop()}`;

  try {
    setLoading(true);
    console.log(`Upload ${type} vers bucket:`, bucketId, fileName);

    const uploadResponse = await storage.createFile(
      bucketId,
      'unique()',
      file
    );

    console.log('Fichier uploadé:', uploadResponse);

    const fileUrl = storage.getFileView(bucketId, uploadResponse.$id);

    const updateField = type === 'cv' ? 'cv_url' : 'portfolio_url';
    await databases.updateDocument(
      DATABASE_ID,
      'profiles',
      user.$id,
      { 
        [updateField]: fileUrl,
        updated_at: new Date().toISOString()
      }
    );

    showMessage(`${type.toUpperCase()} uploadé avec succès !`);
  } catch (error) {
    console.error(`Erreur upload ${type}:`, error);
    showMessage(`Erreur lors de l'upload du ${type}: ` + error.message, 'error');
  } finally {
    setLoading(false);
  }
};

const deleteCv = async () => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer votre CV ?')) {
    return;
  }

  try {
    setLoading(true);
    
    await databases.updateDocument(
      DATABASE_ID,
      'profiles',
      user.$id,
      { 
        cv_url: null,
        updated_at: new Date().toISOString()
      }
    );

    showMessage('CV supprimé avec succès !');
  } catch (error) {
    console.error('Erreur suppression CV:', error);
    showMessage('Erreur lors de la suppression du CV: ' + error.message, 'error');
  } finally {
    setLoading(false);
  }
};

const deletePortfolio = async () => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer votre portfolio ?')) {
    return;
  }

  try {
    setLoading(true);
    
    await databases.updateDocument(
      DATABASE_ID,
      'profiles',
      user.$id,
      { 
        portfolio_url: null,
        updated_at: new Date().toISOString()
      }
    );

    showMessage('Portfolio supprimé avec succès !');
  } catch (error) {
    console.error('Erreur suppression portfolio:', error);
    showMessage('Erreur lors de la suppression du portfolio: ' + error.message, 'error');
  } finally {
    setLoading(false);
  }
};

 const formatDate = (dateString) => {
   try {
     return new Date(dateString).toLocaleDateString('fr-FR', { 
       month: 'long', 
       year: 'numeric' 
     });
   } catch (error) {
     return dateString;
   }
 };

 const tabs = [
   { id: 'experience', label: 'Expérience', icon: Briefcase },
   { id: 'education', label: 'Éducation', icon: Award },
   { id: 'documents', label: 'Documents', icon: FileText }
 ];

 if (!isOpen) return null;

 return (
   <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
     {/* Modal principal avec dimensions corrigées */}
     <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl h-[85vh] max-h-[800px] flex flex-col overflow-hidden">
       {/* Header fixe */}
       <div className="bg-gradient-elegant p-4 text-white flex-shrink-0">
         <div className="flex items-center justify-between">
           <h2 className="text-xl font-bold">Optimiser mon profil</h2>
           <button
             onClick={onClose}
             className="p-2 hover:bg-white/20 rounded-full transition-colors"
           >
             <X className="h-5 w-5" />
           </button>
         </div>
       </div>

       {/* Messages */}
       {(successMessage || errorMessage) && (
         <div className="p-3 mx-4 mt-3 rounded-lg flex items-center flex-shrink-0">
           {successMessage && (
             <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg flex items-center w-full">
               <CheckCircle className="h-4 w-4 mr-2" />
               {successMessage}
             </div>
           )}
           {errorMessage && (
             <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg flex items-center w-full">
               <AlertCircle className="h-4 w-4 mr-2" />
               {errorMessage}
             </div>
           )}
         </div>
       )}

       {/* Navigation fixe */}
       <div className="flex border-b border-gray-200 flex-shrink-0">
         {tabs.map((tab) => (
           <button
             key={tab.id}
             onClick={() => setActiveTab(tab.id)}
             className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 font-medium transition-all text-sm ${
               activeTab === tab.id
                 ? 'border-b-2 border-job-purple text-job-purple bg-purple-50'
                 : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
             }`}
           >
             <tab.icon className="h-4 w-4" />
             <span>{tab.label}</span>
           </button>
         ))}
       </div>

       {/* Content scrollable */}
       <div className="flex-1 overflow-y-auto p-4">
         {activeTab === 'experience' && (
           <div className="space-y-4">
             <h3 className="text-lg font-bold text-gray-900">Expérience Professionnelle</h3>
             
             {/* Formulaire d'ajout */}
             <div className="bg-gray-50 rounded-xl p-4">
               <h4 className="font-semibold mb-3 text-sm">Ajouter une expérience</h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                 <input
                   type="text"
                   name="company"
                   value={newExperience.company}
                   onChange={(e) => {
                     console.log('📝 INPUT company:', e.target.value);
                     setNewExperience({
                       ...newExperience,
                       company: e.target.value
                     });
                   }}
                   placeholder="Nom de l'entreprise *"
                   className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-job-purple"
                   required
                 />
                 <input
                   type="text"
                   name="position"
                   value={newExperience.position}
                   onChange={(e) => {
                     console.log('📝 INPUT position:', e.target.value);
                     setNewExperience({
                       ...newExperience,
                       position: e.target.value
                     });
                   }}
                   placeholder="Poste occupé *"
                   className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-job-purple"
                   required
                 />
                 <input
                   type="date"
                   name="start_date"
                   value={newExperience.start_date}
                   onChange={(e) => setNewExperience({
                     ...newExperience,
                     start_date: e.target.value
                   })}
                   className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-job-purple"
                 />
                 <input
                   type="date"
                   name="end_date"
                   value={newExperience.end_date}
                   onChange={(e) => setNewExperience({
                     ...newExperience,
                     end_date: e.target.value
                   })}
                   className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-job-purple"
                   disabled={newExperience.is_current}
                 />
                 <input
                   type="text"
                   placeholder="Localisation"
                   value={newExperience.location}
                   onChange={(e) => setNewExperience({...newExperience, location: e.target.value})}
                   className="p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-job-purple"
                 />
                 <div className="flex items-center">
                   <label className="flex items-center space-x-2">
                     <input
                       type="checkbox"
                       checked={newExperience.is_current}
                       onChange={(e) => setNewExperience({
                         ...newExperience, 
                         is_current: e.target.checked,
                         end_date: e.target.checked ? '' : newExperience.end_date
                       })}
                       className="rounded border-gray-300 text-job-purple focus:ring-job-purple"
                     />
                     <span className="text-xs">Poste actuel</span>
                   </label>
                 </div>
               </div>
               <textarea
                 name="description"
                 value={newExperience.description}
                 onChange={(e) => setNewExperience({
                   ...newExperience,
                   description: e.target.value
                 })}
                 placeholder="Description du poste"
                 className="w-full mt-3 p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-job-purple"
                 rows="2"
               />
               <Button
                 onClick={addExperience}
                 disabled={loading}
                 className="mt-3 bg-job-purple hover:bg-job-purple-dark text-white px-4 py-2 rounded-lg disabled:opacity-50 text-sm"
               >
                 {loading ? (
                   <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-2"></div>
                 ) : (
                   <Plus className="h-3 w-3 mr-2" />
                 )}
                 Ajouter l'expérience
               </Button>
             </div>

             {/* Liste des expériences */}
             <div className="space-y-3">
               <div className="flex items-center justify-between">
                 <h4 className="font-semibold text-gray-900 text-sm">Mes expériences ({experiences.length})</h4>
                 {experiences.length > 0 && (
                   <Button
                     onClick={() => setShowExperiencesModal(true)}
                     className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-xs"
                   >
                     Voir toutes ({experiences.length})
                   </Button>
                 )}
               </div>
               
               {experiences.length === 0 ? (
                 <div className="text-center py-6 text-gray-500">
                   <Briefcase className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                   <p className="text-sm">Aucune expérience ajoutée pour le moment</p>
                 </div>
               ) : (
                 <div className="space-y-3">
                   {experiences.slice(0, 1).map((exp) => (
                    <div key={exp.$id} className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-all">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900 text-sm">{exp.position}</h5>
                          <p className="text-job-purple font-medium text-sm">{exp.company}</p>
                          <p className="text-xs text-gray-600 flex items-center mt-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(exp.start_date)} - 
                            {exp.is_current ? ' Présent' : ` ${formatDate(exp.end_date)}`}
                          </p>
                          {exp.location && (
                            <p className="text-xs text-gray-600 flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {exp.location}
                            </p>
                          )}
                          {exp.description && (
                            <p className="text-xs text-gray-700 mt-1 line-clamp-2">{exp.description}</p>
                          )}
                        </div>
                        <button
                          onClick={() => deleteExperience(exp.$id)}
                          disabled={loading}
                          className="text-red-500 hover:text-red-700 p-1 disabled:opacity-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                   
                   {experiences.length > 1 && (
                     <div className="text-center py-3 border-2 border-dashed border-gray-300 rounded-lg">
                       <Button
                         onClick={() => setShowExperiencesModal(true)}
                         className="bg-job-purple hover:bg-job-purple-dark text-white px-4 py-2 rounded-lg text-xs"
                       >
                         Voir toutes mes expériences ({experiences.length})
                       </Button>
                     </div>
                   )}
                 </div>
               )}
             </div>
           </div>
         )}

         {activeTab === 'education' && (
           <div className="space-y-4">
             <h3 className="text-lg font-bold text-gray-900">Formation & Éducation</h3>
             
             {/* Formulaire d'ajout */}
             <div className="bg-gray-50 rounded-xl p-4">
               <h4 className="font-semibold mb-3 text-sm">Ajouter une formation</h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                 <input
                   type="text"
                   placeholder="Nom de l'établissement *"
                   value={newEducation.institution}
                   onChange={(e) => setNewEducation({...newEducation, institution: e.target.value})}
                   className="p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-job-purple"
                 />
                 <input
                   type="text"
                   placeholder="Diplôme obtenu *"
                   value={newEducation.degree}
                   onChange={(e) => setNewEducation({...newEducation, degree: e.target.value})}
                   className="p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-job-purple"
                 />
                 <input
                   type="text"
                   placeholder="Domaine d'étude"
                   value={newEducation.field_of_study}
                   onChange={(e) => setNewEducation({...newEducation, field_of_study: e.target.value})}
                   className="p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-job-purple"
                 />
                 <input
                   type="text"
                   placeholder="Localisation"
                   value={newEducation.location}
                   onChange={(e) => setNewEducation({...newEducation, location: e.target.value})}
                   className="p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-job-purple"
                 />
                 <input
                   type="date"
                   placeholder="Date de début *"
                   value={newEducation.start_date}
                   onChange={(e) => setNewEducation({...newEducation, start_date: e.target.value})}
                   className="p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-job-purple"
                 />
                 <input
                   type="date"
                   placeholder="Date de fin"
                   value={newEducation.end_date}
                   onChange={(e) => setNewEducation({...newEducation, end_date: e.target.value})}
                   disabled={newEducation.is_current}
                   className="p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-job-purple disabled:bg-gray-100"
                 />
               </div>
               <div className="mt-3">
                 <label className="flex items-center space-x-2">
                   <input
                     type="checkbox"
                     checked={newEducation.is_current}
                     onChange={(e) => setNewEducation({
                       ...newEducation, 
                       is_current: e.target.checked,
                       end_date: e.target.checked ? '' : newEducation.end_date
                     })}
                     className="rounded border-gray-300 text-job-purple focus:ring-job-purple"
                   />
                   <span className="text-xs">Formation en cours</span>
                 </label>
               </div>
               <textarea
                 placeholder="Description de la formation"
                 value={newEducation.description}
                 onChange={(e) => setNewEducation({...newEducation, description: e.target.value})}
                 rows={2}
                 className="w-full mt-3 p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-job-purple"
               />
               <Button
                 onClick={addEducation}
                 disabled={loading}
                 className="mt-3 bg-job-purple hover:bg-job-purple-dark text-white px-4 py-2 rounded-lg disabled:opacity-50 text-sm"
               >
                 {loading ? (
                   <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-2"></div>
                 ) : (
                   <Plus className="h-3 w-3 mr-2" />
                 )}
                 Ajouter la formation
               </Button>
             </div>

             {/* Liste des formations */}
             <div className="space-y-3">
               <div className="flex items-center justify-between">
                 <h4 className="font-semibold text-gray-900 text-sm">Mes formations ({educations.length})</h4>
                 {educations.length > 0 && (
                   <Button
                     onClick={() => setShowEducationsModal(true)}
                     className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-xs"
                   >
                     Voir toutes ({educations.length})
                   </Button>
                 )}
               </div>
               
               {educations.length === 0 ? (
                 <div className="text-center py-6 text-gray-500">
                   <Award className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                   <p className="text-sm">Aucune formation ajoutée pour le moment</p>
                 </div>
               ) : (
                 <div className="space-y-3">
                   {educations.slice(0, 1).map((edu) => (
                    <div key={edu.$id} className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-all">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900 text-sm">{edu.degree}</h5>
                          <p className="text-job-purple font-medium text-sm">{edu.institution}</p>
                          {edu.field_of_study && (
                            <p className="text-xs text-gray-600">{edu.field_of_study}</p>
                          )}
                          <p className="text-xs text-gray-600 flex items-center mt-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(edu.start_date)} - 
                            {edu.is_current ? ' En cours' : ` ${formatDate(edu.end_date)}`}
                          </p>
                          {edu.location && (
                            <p className="text-xs text-gray-600 flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {edu.location}
                            </p>
                          )}
                          {edu.description && (
                            <p className="text-xs text-gray-700 mt-1 line-clamp-2">{edu.description}</p>
                          )}
                        </div>
                        <button
                          onClick={() => deleteEducation(edu.$id)}
                          disabled={loading}
                          className="text-red-500 hover:text-red-700 p-1 disabled:opacity-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                   
                   {educations.length > 1 && (
                     <div className="text-center py-3 border-2 border-dashed border-gray-300 rounded-lg">
                       <Button
                         onClick={() => setShowEducationsModal(true)}
                         className="bg-job-purple hover:bg-job-purple-dark text-white px-4 py-2 rounded-lg text-xs"
                       >
                         Voir toutes mes formations ({educations.length})
                       </Button>
                     </div>
                   )}
                 </div>
               )}
             </div>
           </div>
         )}

         {activeTab === 'documents' && (
           <div className="space-y-4">
             <h3 className="text-lg font-bold text-gray-900">Documents & Portfolio</h3>
             
             {/* Upload CV */}
             <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
               <h4 className="font-semibold mb-3 flex items-center text-blue-700 text-sm">
                 <FileText className="h-4 w-4 mr-2" />
                 Curriculum Vitae (CV)
               </h4>
               <div className="flex items-center space-x-3 flex-wrap gap-2">
                 <input
                   ref={cvInputRef}
                   type="file"
                   accept=".pdf,.doc,.docx"
                   onChange={(e) => handleFileUpload('cv', e.target.files[0])}
                   className="hidden"
                 />
                 <Button
                   onClick={() => cvInputRef.current?.click()}
                   disabled={loading}
                   className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all shadow-lg font-medium disabled:opacity-50 text-sm"
                 >
                   <Upload className="h-3 w-3" />
                   <span>{profile?.cv_url ? 'Remplacer le CV' : 'Choisir un fichier CV'}</span>
                 </Button>
                 {profile && profile.cv_url && (
                   <>
                     <a
                       href={profile.cv_url}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-sm"
                     >
                       Voir le CV actuel
                     </a>
                     <Button
                       onClick={deleteCv}
                       disabled={loading}
                       className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs"
                     >
                       <Trash2 className="h-3 w-3 mr-1" />
                       Supprimer
                     </Button>
                   </>
                 )}
               </div>
               <p className="text-xs text-gray-600 mt-2 bg-white/50 p-2 rounded">
                 Formats acceptés : PDF, DOC, DOCX (max 10MB)
               </p>
             </div>

             {/* Upload Portfolio */}
             <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
               <h4 className="font-semibold mb-3 flex items-center text-purple-700 text-sm">
                 <Briefcase className="h-4 w-4 mr-2" />
                 Portfolio
               </h4>
               <div className="flex items-center space-x-3 flex-wrap gap-2">
                 <input
                   ref={portfolioInputRef}
                   type="file"
                   accept=".pdf,.zip,.rar"
                   onChange={(e) => handleFileUpload('portfolio', e.target.files[0])}
                   className="hidden"
                 />
                 <Button
                   onClick={() => portfolioInputRef.current?.click()}
                   disabled={loading}
                   className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all shadow-lg font-medium disabled:opacity-50 text-sm"
                 >
                   <Upload className="h-3 w-3" />
                   <span>{profile?.portfolio_url ? 'Remplacer le portfolio' : 'Choisir un fichier Portfolio'}</span>
                 </Button>
                 {profile && profile.portfolio_url && (
                   <>
                     <a
                       href={profile.portfolio_url}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="text-purple-600 hover:text-purple-800 hover:underline font-medium text-sm"
                     >
                       Voir le portfolio actuel
                     </a>
                     <Button
                       onClick={deletePortfolio}
                       disabled={loading}
                       className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs"
                     >
                       <Trash2 className="h-3 w-3 mr-1" />
                       Supprimer
                     </Button>
                   </>
                 )}
               </div>
               <p className="text-xs text-gray-600 mt-2 bg-white/50 p-2 rounded">
                 Formats acceptés : PDF, ZIP, RAR (max 50MB)
               </p>
             </div>

             {/* Section Documents ajoutés */}
             <div className="bg-gray-50 rounded-xl p-4">
               <h4 className="font-semibold mb-3 text-gray-900 text-sm">Documents disponibles</h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                 {profile?.cv_url && (
                   <div className="bg-white border border-gray-200 rounded-lg p-3">
                     <div className="flex items-center justify-between">
                       <div className="flex items-center">
                         <div className="p-2 bg-blue-100 rounded-lg mr-2">
                           <FileText className="h-4 w-4 text-blue-600" />
                         </div>
                         <div>
                           <p className="font-medium text-gray-900 text-sm">CV</p>
                           <p className="text-xs text-gray-600">Document PDF</p>
                         </div>
                       </div>
                       <div className="flex items-center space-x-1">
                         <a
                           href={profile.cv_url}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded-lg transition-colors"
                           title="Voir le CV"
                         >
                           <FileText className="h-4 w-4" />
                         </a>
                         <button
                           onClick={deleteCv}
                           disabled={loading}
                           className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                           title="Supprimer le CV"
                         >
                           <Trash2 className="h-4 w-4" />
                         </button>
                       </div>
                     </div>
                   </div>
                 )}
                 
                 {profile?.portfolio_url && (
                   <div className="bg-white border border-gray-200 rounded-lg p-3">
                     <div className="flex items-center justify-between">
                       <div className="flex items-center">
                         <div className="p-2 bg-purple-100 rounded-lg mr-2">
                           <Briefcase className="h-4 w-4 text-purple-600" />
                         </div>
                         <div>
                           <p className="font-medium text-gray-900 text-sm">Portfolio</p>
                           <p className="text-xs text-gray-600">Fichier archive</p>
                         </div>
                       </div>
                       <div className="flex items-center space-x-1">
                         <a
                           href={profile.portfolio_url}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="text-purple-600 hover:text-purple-800 p-1 hover:bg-purple-50 rounded-lg transition-colors"
                           title="Voir le portfolio"
                         >
                           <Briefcase className="h-4 w-4" />
                         </a>
                         <button
                           onClick={deletePortfolio}
                           disabled={loading}
                           className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                           title="Supprimer le portfolio"
                         >
                           <Trash2 className="h-4 w-4" />
                         </button>
                       </div>
                     </div>
                   </div>
                 )}
                 
                 {!profile?.cv_url && !profile?.portfolio_url && (
                   <div className="col-span-2 text-center py-6 text-gray-500">
                     <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                     <p className="text-sm">Aucun document ajouté pour le moment</p>
                     <p className="text-xs">Uploadez votre CV et portfolio ci-dessus</p>
                   </div>
                 )}
               </div>
             </div>
           </div>
         )}
       </div>

       {/* Footer fixe */}
       <div className="p-4 bg-gray-50 flex justify-between items-center flex-shrink-0 border-t">
         <div className="flex items-center space-x-3">
           {loading && (
             <div className="flex items-center text-gray-600">
               <div className="animate-spin rounded-full h-3 w-3 border-2 border-gray-400 border-t-transparent mr-2"></div>
               <span className="text-sm">Chargement...</span>
             </div>
           )}
         </div>
         <Button
           onClick={onClose}
           className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-xl font-semibold text-sm"
         >
           Fermer
         </Button>
       </div>
     </div>

     {/* Modal pour voir toutes les expériences */}
     {showExperiencesModal && (
       <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
         <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh]">
           {/* Header fixe */}
           <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white rounded-t-2xl flex-shrink-0">
             <div className="flex items-center justify-between">
               <h3 className="text-lg font-bold flex items-center">
                 <Briefcase className="h-5 w-5 mr-2" />
                 Toutes mes expériences ({experiences.length})
               </h3>
               <button
                 onClick={() => setShowExperiencesModal(false)}
                 className="p-2 hover:bg-white/20 rounded-full transition-colors"
               >
                 <X className="h-4 w-4" />
               </button>
             </div>
           </div>
           
           {/* Zone scrollable */}
           <div className="p-4 overflow-y-auto" style={{ height: 'calc(80vh - 120px)' }}>
             <div className="space-y-3">
               {experiences.map((exp) => (
                 <div key={exp.$id} className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 hover:shadow-lg transition-all">
                   <div className="flex justify-between items-start">
                     <div className="flex-1">
                       <h4 className="text-lg font-bold text-gray-900">{exp.position}</h4>
                       <p className="text-blue-600 font-semibold flex items-center">
                         <Building className="h-4 w-4 mr-1" />
                         {exp.company}
                       </p>
                       <p className="text-sm text-gray-600 flex items-center mt-2">
                         <Calendar className="h-4 w-4 mr-1" />
                         {formatDate(exp.start_date)} - 
                         {exp.is_current ? ' Présent' : ` ${formatDate(exp.end_date)}`}
                       </p>
                       {exp.location && (
                         <p className="text-sm text-gray-600 flex items-center mt-1">
                           <MapPin className="h-4 w-4 mr-1" />
                           {exp.location}
                         </p>
                       )}
                       {exp.description && (
                         <p className="text-gray-700 mt-2 leading-relaxed text-sm">{exp.description}</p>
                       )}
                     </div>
                     <button
                       onClick={() => deleteExperience(exp.$id)}
                       disabled={loading}
                       className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                     >
                       <Trash2 className="h-4 w-4" />
                     </button>
                   </div>
                 </div>
               ))}
             </div>
           </div>
           
           {/* Footer fixe */}
           <div className="p-3 bg-gray-50 rounded-b-2xl flex justify-end border-t flex-shrink-0">
             <Button
               onClick={() => setShowExperiencesModal(false)}
               className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm"
             >
               Fermer
             </Button>
           </div>
         </div>
       </div>
     )}

     {/* Modal pour voir toutes les formations */}
     {showEducationsModal && (
       <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
         <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh]">
           {/* Header fixe */}
           <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 text-white rounded-t-2xl flex-shrink-0">
             <div className="flex items-center justify-between">
               <h3 className="text-lg font-bold flex items-center">
                 <Award className="h-5 w-5 mr-2" />
                 Toutes mes formations ({educations.length})
               </h3>
               <button
                 onClick={() => setShowEducationsModal(false)}
                 className="p-2 hover:bg-white/20 rounded-full transition-colors"
               >
                 <X className="h-4 w-4" />
               </button>
             </div>
           </div>
           
           {/* Zone scrollable */}
           <div className="p-4 overflow-y-auto" style={{ height: 'calc(80vh - 120px)' }}>
             <div className="space-y-3">
               {educations.map((edu) => (
                 <div key={edu.$id} className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 hover:shadow-lg transition-all">
                   <div className="flex justify-between items-start">
                     <div className="flex-1">
                       <h4 className="text-lg font-bold text-gray-900">{edu.degree}</h4>
                       <p className="text-green-600 font-semibold flex items-center">
                         <Building className="h-4 w-4 mr-1" />
                         {edu.institution}
                       </p>
                       {edu.field_of_study && (
                         <p className="text-gray-600 italic mt-1">{edu.field_of_study}</p>
                       )}
                       <p className="text-sm text-gray-600 flex items-center mt-2">
                         <Calendar className="h-4 w-4 mr-1" />
                         {formatDate(edu.start_date)} - 
                         {edu.is_current ? ' En cours' : ` ${formatDate(edu.end_date)}`}
                       </p>
                       {edu.location && (
                         <p className="text-sm text-gray-600 flex items-center mt-1">
                           <MapPin className="h-4 w-4 mr-1" />
                           {edu.location}
                         </p>
                       )}
                       {edu.description && (
                         <p className="text-gray-700 mt-2 leading-relaxed text-sm">{edu.description}</p>
                       )}
                     </div>
                     <button
                       onClick={() => deleteEducation(edu.$id)}
                       disabled={loading}
                       className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                     >
                       <Trash2 className="h-4 w-4" />
                     </button>
                   </div>
                 </div>
               ))}
             </div>
           </div>
           
           {/* Footer fixe */}
           <div className="p-3 bg-gray-50 rounded-b-2xl flex justify-end border-t flex-shrink-0">
             <Button
               onClick={() => setShowEducationsModal(false)}
               className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm"
             >
               Fermer
             </Button>
           </div>
         </div>
       </div>
     )}
   </div>
 );
};

export default OptimizeProfile;