import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { databases, DATABASE_ID, Query, ID } from '@/lib/appwrite';
import QuotaIndicator from '@/components/QuotaIndicator';
import { 
  MessageSquare, 
  Crown, 
  User, 
  Building, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Send,
  MoreVertical,
  Star,
  Archive,
  Trash2,
  Reply,
  Forward,
  Eye,
  EyeOff,
  Users,
  Briefcase,
  Badge,
  ArrowLeft,
  Paperclip,
  Phone,
  Video,
  Mail,
  RefreshCw,
  Download,
  FileText,
  Image as ImageIcon,
  Film,
  Music,
  X,
  Plus,
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useMessaging } from '@/hooks/useMessaging';


const Messages = () => {
  const navigate = useNavigate();
  const { user, isCandidate, isEmployer, isPremium } = useAuth();
  
  const {
    messages,
    unreadCount,
    uploadProgress,
    loadConversations: hookLoadConversations,
    refreshConversations,
    sendMessage,
    loadConversationMessages,
    uploadFile,
    loadUserQuota,
    markAsRead,
    markConversationAsRead
  } = useMessaging();

  const [selectedConversation, setSelectedConversation] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true); // Pour mobile seulement
  const { userQuota } = useMessaging();
  // Refs
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Vérification des droits d'accès
  const hasAccess = (isCandidate && isPremium) || isEmployer;

  // Fonction pour scroller vers le bas
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Scroll automatique quand les messages changent
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (user && hasAccess) {
      loadConversations();
    }
  }, [user, hasAccess]);
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!hasAccess) {
      navigate('/');
      return;
    }
  }, [user, hasAccess]);

  // Actualiser les conversations
  const handleRefreshConversations = async () => {
    setRefreshing(true);
    try {
      await refreshConversations();
    } finally {
      setRefreshing(false);
    }
  };

  const loadConversations = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // 1. Charger depuis la collection "conversations" (profils)
      const conversationsResponse = await databases.listDocuments(
        DATABASE_ID,
        'conversations',
        [
          Query.or([
            Query.equal('participant1_id', user.$id),
            Query.equal('participant2_id', user.$id)
          ]),
          Query.orderDesc('last_message_date'),
          Query.limit(50)
        ]
      );
  
      // 2. Charger les messages orphelins (sans conversation_id) pour migration
      const orphanMessagesResponse = await databases.listDocuments(
        DATABASE_ID,
        'messages',
        [
          Query.or([
            Query.equal('sender_id', user.$id),
            Query.equal('receiver_id', user.$id)
          ]),
          Query.isNull('conversation_id'),
          Query.orderDesc('created_at'),
          Query.limit(500)
        ]
      );
  
      const allConversations = new Map();
  
      // Traiter les conversations existantes avec AVATARS
      for (const conv of conversationsResponse.documents) {
        const isCurrentUserParticipant1 = conv.participant1_id === user.$id;
        const otherParticipant = isCurrentUserParticipant1 
          ? {
              id: conv.participant2_id,
              name: conv.participant2_name,
              avatar: conv.participant2_avatar || '', // RÉCUPÉRER L'AVATAR
              type: conv.participant2_type || 'candidate'
            }
          : {
              id: conv.participant1_id,
              name: conv.participant1_name,
              avatar: conv.participant1_avatar || '', // RÉCUPÉRER L'AVATAR
              type: conv.participant1_type || 'candidate'
            };
  
        // Charger les messages de cette conversation
        const convMessagesResponse = await databases.listDocuments(
          DATABASE_ID,
          'messages',
          [
            Query.equal('conversation_id', conv.$id),
            Query.orderDesc('created_at'),
            Query.limit(50)
          ]
        );
  
        const messages = convMessagesResponse.documents;
        const lastMessage = messages[0] || {
          content: 'Conversation créée',
          created_at: conv.created_at,
          sender_id: null
        };
        
        const unreadCount = messages.filter(msg => 
          msg.receiver_id === user.$id && !msg.read_at
        ).length;
  
        const conversationKey = `conv_${conv.$id}`;
  
        allConversations.set(conversationKey, {
          id: conversationKey,
          conversationId: conv.$id,
          type: 'profile',
          otherUser: {
            ...otherParticipant,
            isPremium: false
          },
          lastMessage: lastMessage,
          messages: messages,
          unreadCount: unreadCount,
          job: null,
          context: null
        });
      }
  
      // Traiter les messages orphelins
      const orphansByUser = new Map();
      
      for (const message of orphanMessagesResponse.documents) {
        const otherUserId = message.sender_id === user.$id ? message.receiver_id : message.sender_id;
        
        if (!orphansByUser.has(otherUserId)) {
          orphansByUser.set(otherUserId, []);
        }
        orphansByUser.get(otherUserId).push(message);
      }
  
      // Créer des conversations pour les messages orphelins
      for (const [otherUserId, messages] of orphansByUser) {
        try {
          // Récupérer les données du profil pour l'avatar
          const otherUserProfile = await databases.getDocument(
            DATABASE_ID,
            'profiles',
            otherUserId
          );
  
          // Créer une conversation pour cet utilisateur
          const conversationKey = [user.$id, otherUserId].sort().join('_');
          
          const conversation = await databases.createDocument(
            DATABASE_ID,
            'conversations',
            ID.unique(),
            {
              participant1_id: user.$id,
              participant1_name: user.name || user.full_name || 'Utilisateur',
              participant1_avatar: user.avatar_url || '',
              participant1_type: user.labels?.[0] || 'candidate',
              participant2_id: otherUserId,
              participant2_name: otherUserProfile.full_name || 'Utilisateur',
              participant2_avatar: otherUserProfile.avatar_url || '', // RÉCUPÉRER L'AVATAR
              participant2_type: otherUserProfile.user_type || 'candidate',
              last_message_id: null,
              last_message_date: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          );
          
          // Migrer les messages vers cette conversation
          for (const message of messages) {
            try {
              await databases.updateDocument(
                DATABASE_ID,
                'messages',
                message.$id,
                {
                  conversation_id: conversation.$id,
                  updated_at: new Date().toISOString()
                }
              );
            } catch (error) {
              console.warn('Erreur migration message:', message.$id, error);
            }
          }
  
          // Mettre à jour la conversation avec le dernier message
          const lastMessage = messages.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
          await databases.updateDocument(
            DATABASE_ID,
            'conversations',
            conversation.$id,
            {
              last_message_id: lastMessage.$id,
              last_message_date: lastMessage.created_at,
              updated_at: new Date().toISOString()
            }
          );
  
          const unreadCount = messages.filter(msg => 
            msg.receiver_id === user.$id && !msg.read_at
          ).length;
  
          const migratedConversationKey = `migrated_${conversation.$id}`;
  
          allConversations.set(migratedConversationKey, {
            id: migratedConversationKey,
            conversationId: conversation.$id,
            type: 'migrated',
            otherUser: {
              id: otherUserId,
              name: otherUserProfile.full_name || 'Utilisateur',
              avatar: otherUserProfile.avatar_url || '', // AVATAR RÉCUPÉRÉ
              type: otherUserProfile.user_type || 'candidate',
              isPremium: otherUserProfile.is_premium || false
            },
            lastMessage: lastMessage,
            messages: messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)),
            unreadCount: unreadCount,
            job: null,
            context: lastMessage.context_type === 'job' ? {
              id: lastMessage.context_id,
              title: lastMessage.context_title
            } : null
          });
        } catch (error) {
          console.error('Erreur création conversation pour utilisateur:', otherUserId, error);
        }
      }
  
      // Convertir en tableau et trier par date du dernier message
      const conversationsArray = Array.from(allConversations.values())
        .sort((a, b) => new Date(b.lastMessage.created_at) - new Date(a.lastMessage.created_at));
  
      setConversations(conversationsArray);
      
    } catch (error) {
      console.error('Erreur chargement conversations:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Charger les messages d'une conversation
  const handleLoadConversationMessages = async (conversation) => {
    setSelectedConversation(conversation);
    
    // Fermer la sidebar sur mobile quand on sélectionne une conversation
    if (window.innerWidth < 1024) {
      setShowSidebar(false);
    }
    
    if (conversation.conversationId) {
      await loadConversationMessages(conversation.conversationId);
    }
    
    setTimeout(() => scrollToBottom(), 100);
  };

  // Gestion des fichiers
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));
    
    setAttachedFiles(prev => [...prev, ...newFiles]);
  };

  

  const removeAttachedFile = (fileId) => {
    setAttachedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove && fileToRemove.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  // Envoyer réponse avec fichiers
  const sendReply = async () => {
    if ((!newMessage.trim() && attachedFiles.length === 0) || !selectedConversation) return;
    
    setSending(true);
    try {
      // Upload des fichiers
      let uploadedFiles = [];
      if (attachedFiles.length > 0) {
        for (const attachedFile of attachedFiles) {
          try {
            const uploadedFile = await uploadFile(attachedFile.file);
            uploadedFiles.push(uploadedFile);
          } catch (error) {
            console.error('Erreur upload fichier:', error);
          }
        }
      }

      // Envoyer le message via le hook
      await sendMessage(
        selectedConversation.otherUser.id,
        newMessage.trim() || '[Fichier(s) joint(s)]',
        {
          subject: `Re: ${selectedConversation.lastMessage.subject || 'Message'}`,
          messageType: 'reply',
          attachments: uploadedFiles,
          contextType: selectedConversation.context ? 'job' : 'profile',
          contextId: selectedConversation.context?.id,
          contextTitle: selectedConversation.context?.title,
          receiverData: selectedConversation.otherUser,
          receiverEmail: selectedConversation.otherUser.email,
          receiverName: selectedConversation.otherUser.name,
          isRecipientPremium: selectedConversation.otherUser.isPremium,
          emailApiUrl: 'https://api.job2mada.com/api/send-message-notification'
        }
      );

      setNewMessage('');
      setAttachedFiles([]);
      
      // Recharger les messages de la conversation
      if (selectedConversation.conversationId) {
        await loadConversationMessages(selectedConversation.conversationId);
      }
      
      setTimeout(() => scrollToBottom(), 100);
      
    } catch (error) {
      console.error('Erreur envoi message:', error);
    } finally {
      setSending(false);
    }
  };

  // Obtenir l'icône selon le type de fichier
  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
    if (fileType.startsWith('video/')) return <Film className="h-4 w-4" />;
    if (fileType.startsWith('audio/')) return <Music className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  // Formater la taille du fichier
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Filtrer les conversations
  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = searchTerm === '' || 
      conv.otherUser.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.context?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.lastMessage.content.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesFilter = filter === 'all' ||
      (filter === 'unread' && conv.unreadCount > 0) ||
      (filter === 'premium' && conv.otherUser.isPremium) ||
      (filter === 'jobs' && conv.context);
      
    return matchesSearch && matchesFilter;
  });

  const getTimeAgo = (date) => {
    const now = new Date();
    const diffTime = Math.abs(now - new Date(date));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 60) return `${diffMinutes}min`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}j`;
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-20 md:pt-32 pb-16">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border-2 border-gray-200">
              <MessageSquare className="h-12 w-12 md:h-16 md:w-16 text-gray-400 mx-auto mb-6" />
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                Accès Premium Requis
              </h2>
              <p className="text-gray-600 mb-6">
                {isCandidate ? 
                  'La messagerie est réservée aux candidats premium et aux recruteurs.' :
                  'Seuls les candidats premium et les recruteurs ont accès à la messagerie.'
                }
              </p>
              {isCandidate && (
                <Button
                  onClick={() => navigate('/premium')}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
                >
                  <Crown className="h-5 w-5 mr-2" />
                  Passer au Premium
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requireAuth={true}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        {/* Header - Légèrement responsive */}
        <div className="bg-gradient-to-br from-job-purple to-job-pink mt-16 pt-24 pb-8">
          <div className="max-w-7xl mx-auto px-4 mt-4">
          {userQuota && <QuotaIndicator quota={userQuota} onRefresh={loadUserQuota} />}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  Messagerie Professionnelle
                </h1>
                <p className="text-blue-100">
                  {isCandidate ? 'Vos conversations avec les recruteurs' : 'Messages des candidats premium'}
                  {totalUnread > 0 && (
                    <span className="ml-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {totalUnread} non lu{totalUnread > 1 ? 's' : ''}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {isPremium && (
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center space-x-2">
                    <Crown className="h-5 w-5 text-yellow-300" />
                    <span className="text-white font-medium">Premium</span>
                  </div>
                )}
                <button
                  onClick={handleRefreshConversations}
                  disabled={refreshing}
                  className="bg-gradient-to-br from-job-gold via-job-orange to-job-dark-gold backdrop-blur-sm rounded-xl px-4 py-2 flex items-center space-x-2 hover:bg-white/30 transition-colors"
                >
                  <RefreshCw className={`h-5 w-5 text-white ${refreshing ? 'animate-spin' : ''}`} />
                  <span className="text-white font-medium hidden sm:inline">Actualiser</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Interface de messagerie */}
        <div className="max-w-7xl mx-auto px-2 lg:px-4 pt-8 pb-8">
          <div className="bg-white rounded-lg lg:rounded-2xl shadow-xl overflow-hidden" style={{ height: '700px' }}>
            <div className="flex h-full">
              
              {/* Sidebar conversations - Desktop normal, Mobile avec état */}
              <div className={`${
                window.innerWidth >= 1024 
                  ? 'block w-1/3' 
                  : (showSidebar ? 'block w-full absolute z-10' : 'hidden')
              } border-r border-gray-200 flex flex-col bg-white h-full`}>
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  {/* Bouton fermer SEULEMENT sur mobile */}
                  <div className="flex items-center justify-between mb-3 lg:hidden">
                    <h2 className="font-semibold text-gray-900">Conversations</h2>
                    <button
                      onClick={() => setShowSidebar(false)}
                      className="p-2 hover:bg-gray-200 rounded-lg"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher des conversations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    {[
                      { key: 'all', label: 'Tout', count: conversations.length },
                      { key: 'unread', label: 'Non lus', count: totalUnread },
                      { key: 'premium', label: 'Premium', count: conversations.filter(c => c.otherUser.isPremium).length },
                      { key: 'jobs', label: 'Offres', count: conversations.filter(c => c.context).length }
                    ].map(filterOption => (
                      <button
                        key={filterOption.key}
                        onClick={() => setFilter(filterOption.key)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                          filter === filterOption.key
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                      >
                        {filterOption.label} ({filterOption.count})
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {loading ? (
                    <div className="p-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-500">Chargement...</p>
                    </div>
                  ) : filteredConversations.length === 0 ? (
                    <div className="p-8 text-center">
                      <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Aucune conversation</p>
                    </div>
                  ) : (
                    filteredConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        onClick={() => handleLoadConversationMessages(conversation)}
                        className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedConversation?.id === conversation.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0">
                          {conversation.otherUser.avatar ? (
                            <img 
                              src={conversation.otherUser.avatar} 
                              alt={conversation.otherUser.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                              {conversation.otherUser.type === 'employer' ? (
                                <Building className="h-6 w-6 text-white" />
                              ) : (
                                <User className="h-6 w-6 text-white" />
                              )}
                            </div>
                          )}
                        </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-semibold text-gray-900 truncate">
                                  {conversation.otherUser.name}
                                </h4>
                                {conversation.otherUser.isPremium && (
                                  <Crown className="h-4 w-4 text-yellow-500" />
                                )}
                                {conversation.otherUser.type === 'employer' && (
                                  <Building className="h-4 w-4 text-blue-500" />
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-400">
                                  {getTimeAgo(conversation.lastMessage.created_at)}
                                </span>
                                {conversation.unreadCount > 0 && (
                                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                                    {conversation.unreadCount}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {conversation.context && (
                              <p className="text-xs text-blue-600 mb-1 flex items-center">
                                <Briefcase className="h-3 w-3 mr-1" />
                                {conversation.context.title}
                              </p>
                            )}
                            
                            <p className="text-sm text-gray-600 truncate">
                              {conversation.lastMessage.content ? 
                                conversation.lastMessage.content.substring(0, 60) + '...' :
                                'Nouvelle conversation'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Zone de conversation - Desktop normal, Mobile adaptatif */}
              <div className="flex-1 flex flex-col">
                {selectedConversation ? (
                  <>
                    {/* Header conversation */}
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {/* Bouton retour SEULEMENT sur mobile */}
                          <button
                            onClick={() => setShowSidebar(true)}
                            className="lg:hidden p-2 hover:bg-gray-200 rounded-lg"
                          >
                            <ArrowLeft className="h-5 w-5" />
                          </button>

                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                            {selectedConversation.otherUser.avatar ? (
                              <img src={selectedConversation.otherUser.avatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                {selectedConversation.otherUser.type === 'employer' ? (
                                  <Building className="h-5 w-5 text-white" />
                                ) : (
                                  <User className="h-5 w-5 text-white" />
                                )}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold text-gray-900">
                                {selectedConversation.otherUser.name}
                              </h3>
                              {selectedConversation.otherUser.isPremium && (
                                <Crown className="h-4 w-4 text-yellow-500" />
                              )}
                              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                                {selectedConversation.otherUser.type === 'employer' ? 'Recruteur' : 'Candidat'}
                              </span>
                            </div>
                            {selectedConversation.context && (
                              <p className="text-sm text-blue-600 flex items-center">
<Briefcase className="h-3 w-3 mr-1" />
                                {selectedConversation.context.title}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                            <Mail className="h-5 w-5" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                            <MoreVertical className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Messages */}
                    <div 
                      ref={messagesContainerRef}
                      className="flex-1 overflow-y-auto p-4 space-y-4"
                    >
                      {messages.map((message, index) => {
                        const isFromMe = message.sender_id === user.$id;
                        const showAvatar = index === 0 || messages[index - 1].sender_id !== message.sender_id;
                        
                        // Parser les pièces jointes
                        let attachments = message.parsedAttachments || [];
                        
                        return (
                          <div key={message.$id} className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex space-x-2 max-w-xl ${isFromMe ? 'flex-row-reverse space-x-reverse' : ''}`}>
                              {showAvatar && (
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0">
                                {isFromMe ? (
                                  // Avatar de l'utilisateur actuel
                                  user.avatar_url ? (
                                    <img src={user.avatar_url} alt="Moi" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full bg-blue-600 flex items-center justify-center">
                                      <User className="h-4 w-4 text-white" />
                                    </div>
                                  )
                                ) : (
                                  // Avatar de l'autre utilisateur
                                  selectedConversation.otherUser.avatar ? (
                                    <img 
                                      src={selectedConversation.otherUser.avatar} 
                                      alt={selectedConversation.otherUser.name} 
                                      className="w-full h-full object-cover" 
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gray-400 flex items-center justify-center">
                                      {selectedConversation.otherUser.type === 'employer' ? (
                                        <Building className="h-4 w-4 text-white" />
                                      ) : (
                                        <User className="h-4 w-4 text-white" />
                                      )}
                                    </div>
                                  )
                                )}
                              </div>
                              )}
                              
                              <div className={`${showAvatar ? '' : 'ml-10'}`}>
                                <div className={`p-3 rounded-2xl ${
                                  isFromMe 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-100 text-gray-900'
                                }`}>
                                  {message.is_premium && (
                                    <div className={`flex items-center space-x-1 text-xs mb-2 ${
                                      isFromMe ? 'text-blue-100' : 'text-blue-600'
                                    }`}>
                                      <Crown className="h-3 w-3" />
                                      <span>Message Premium</span>
                                    </div>
                                  )}
                                  
                                  {/* Contenu textuel */}
                                  {message.content && message.content !== '[Fichier(s) joint(s)]' && (
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap mb-2">
                                      {message.content}
                                    </p>
                                  )}
                                  
                                  {/* Pièces jointes */}
                                  {attachments.length > 0 && (
                                    <div className="space-y-2">
                                      {attachments.map((attachment, attachIndex) => (
                                        <div key={attachIndex} className={`rounded-lg p-2 ${isFromMe ? 'bg-blue-500' : 'bg-white border'}`}>
                                          {attachment.fileType && attachment.fileType.startsWith('image/') ? (
                                            <div className="space-y-2">
                                              <img 
                                                src={attachment.fileUrl} 
                                                alt={attachment.fileName}
                                                className="max-w-full h-auto rounded-lg max-h-48 object-cover cursor-pointer"
                                                onClick={() => window.open(attachment.fileUrl, '_blank')}
                                              />
                                              <div className={`text-xs ${isFromMe ? 'text-blue-100' : 'text-gray-600'} flex items-center justify-between`}>
                                                <span className="truncate">{attachment.fileName}</span>
                                                <button
                                                  onClick={() => window.open(attachment.fileUrl, '_blank')}
                                                  className={`ml-2 hover:${isFromMe ? 'text-white' : 'text-gray-800'}`}
                                                >
                                                  <Download className="h-3 w-3" />
                                                </button>
                                              </div>
                                            </div>
                                          ) : (
                                            <div className="flex items-center space-x-2">
                                              <div className={`p-1 rounded ${isFromMe ? 'bg-blue-400' : 'bg-gray-200'}`}>
                                                {getFileIcon(attachment.fileType)}
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-medium truncate ${isFromMe ? 'text-white' : 'text-gray-900'}`}>
                                                  {attachment.fileName}
                                                </p>
                                                <p className={`text-xs ${isFromMe ? 'text-blue-100' : 'text-gray-500'}`}>
                                                  {formatFileSize(attachment.fileSize)}
                                                </p>
                                              </div>
                                              <button
                                                onClick={() => window.open(attachment.fileUrl, '_blank')}
                                                className={`p-1 hover:${isFromMe ? 'text-white' : 'text-gray-800'}`}
                                              >
                                                <Download className="h-4 w-4" />
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div className={`flex items-center space-x-2 mt-1 text-xs text-gray-400 ${
                                  isFromMe ? 'justify-end' : ''
                                }`}>
                                  <span>{new Date(message.created_at).toLocaleString('fr-FR')}</span>
                                  {isFromMe && message.read_at && (
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Zone de saisie avec gestion des fichiers */}
                    <div className="p-3 lg:p-6 border-t-2 border-gray-200 bg-gray-50">
                      <div className="space-y-4">
                        
                        {/* Prévisualisation des fichiers attachés */}
                        {attachedFiles.length > 0 && (
                          <div className="bg-white rounded-xl p-4 border-2 border-dashed border-gray-300">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-gray-700 flex items-center">
                                <Paperclip className="h-4 w-4 mr-2" />
                                Fichiers joints ({attachedFiles.length})
                              </h4>
                            </div>
                            <div className="grid grid-cols-1 gap-3 max-h-32 overflow-y-auto">
                              {attachedFiles.map((file) => (
                                <div key={file.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
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
                                    className="p-1 hover:bg-gray-200 rounded-full"
                                  >
                                    <X className="h-4 w-4 text-gray-500" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex-1">
                          <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Tapez votre message professionnel..."
                            className="w-full p-3 lg:p-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-base"
                            rows={window.innerWidth < 1024 ? 3 : 4}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                sendReply();
                              }
                            }}
                          />
                          {isPremium && (
                            <div className="flex items-center mt-3 text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
                              <Crown className="h-4 w-4 mr-2" />
                              <span className="font-medium">Message premium - Réponse garantie sous 48h</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Indicateur de progression d'upload */}
                        {Object.keys(uploadProgress).length > 0 && (
                          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                            <h4 className="font-medium text-blue-700 mb-2">Upload en cours...</h4>
                            {Object.entries(uploadProgress).map(([fileId, progress]) => (
                              <div key={fileId} className="mb-2">
                                <div className="flex justify-between text-sm text-blue-600 mb-1">
                                  <span>Fichier {fileId.substring(0, 8)}...</span>
                                  <span>{progress}%</span>
                                </div>
                                <div className="w-full bg-blue-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                    style={{ width: `${progress}%` }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Boutons d'action avec le bouton de fichiers bien visible */}
                        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3">
                          <div className="flex items-center space-x-3 order-2 lg:order-1">
                            {/* Input fichier caché */}
                            <input
                              ref={fileInputRef}
                              type="file"
                              multiple
                              onChange={handleFileSelect}
                              className="hidden"
                              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip,.rar"
                            />
                            
                            {/* Bouton pour joindre des fichiers - BIEN VISIBLE */}
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="flex items-center space-x-2 px-4 py-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all border border-blue-300 font-medium"
                              title="Joindre des fichiers"
                            >
                              <Paperclip className="h-5 w-5" />
                              <span className="hidden sm:inline">Joindre</span>
                            </button>
                            
                            <span className="text-sm text-gray-500 hidden lg:inline">
                              Images, vidéos, documents acceptés
                            </span>
                          </div>
                          
                          <div className="flex space-x-3 order-1 lg:order-2">
                            <button
                              onClick={() => {
                                setNewMessage('');
                                setAttachedFiles([]);
                              }}
                              className="flex-1 lg:flex-none px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-medium"
                            >
                              Effacer
                            </button>
                            <button
                              onClick={sendReply}
                              disabled={sending || (!newMessage.trim() && attachedFiles.length === 0)}
                              className="flex-1 lg:flex-none px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 font-medium shadow-lg hover:shadow-xl transition-all min-w-[140px] justify-center"
                            >
                              {sending ? (
                                <>
                                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                  <span>Envoi...</span>
                                </>
                              ) : (
                                <>
                                  <Send className="h-5 w-5" />
                                  <span>Envoyer</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      {/* Bouton pour afficher sidebar SEULEMENT sur mobile */}
                      <button
                        onClick={() => setShowSidebar(true)}
                        className="lg:hidden mb-4 flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors mx-auto"
                      >
                        <Menu className="h-5 w-5" />
                        <span>Voir les conversations</span>
                      </button>
                      
                      <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Sélectionnez une conversation
                      </h3>
                      <p className="text-gray-500">
                        Choisissez une conversation dans la liste pour commencer à échanger
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Messages;