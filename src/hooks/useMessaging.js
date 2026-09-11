import { useState, useEffect, useCallback } from 'react';
import { databases, storage, DATABASE_ID, BUCKETS, Query, ID } from '@/lib/appwrite';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { triggerUnreadCountRefresh } from '@/hooks/useUnreadCount';
const EMAIL_API_URL = 'https://api.job2mada.com';

export const useMessaging = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [uploadProgress, setUploadProgress] = useState({});
  const [conversations, setConversations] = useState([]);
  const [userQuota, setUserQuota] = useState(null);

  // ✅ NOUVELLE FONCTION : Charger le quota de l'utilisateur
  const loadUserQuota = useCallback(async () => {
    if (!user) return null;

    try {
      const quotasResponse = await databases.listDocuments(
        DATABASE_ID,
        'subscription_quotas',
        [
          Query.equal('user_id', user.$id),
          Query.orderDesc('created_at'),
          Query.limit(1)
        ]
      );

      if (quotasResponse.documents.length > 0) {
        const quota = quotasResponse.documents[0];
        setUserQuota(quota);
        return quota;
      } else {
        setUserQuota(null);
        return null;
      }
    } catch (error) {
      console.error('Erreur chargement quota:', error);
      return null;
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadUserQuota();
    }
  }, [user, loadUserQuota]);

  const findOrCreateConversation = useCallback(async (otherUserId, otherUserData = {}) => {
    if (!user || !otherUserId) return null;

    try {
      const conversationKey = [user.$id, otherUserId].sort().join('_');
      
      const existingConversations = await databases.listDocuments(
        DATABASE_ID,
        'conversations',
        [
          Query.or([
            Query.and([
              Query.equal('participant1_id', user.$id),
              Query.equal('participant2_id', otherUserId)
            ]),
            Query.and([
              Query.equal('participant1_id', otherUserId),
              Query.equal('participant2_id', user.$id)
            ])
          ]),
          Query.limit(1)
        ]
      );

      if (existingConversations.documents.length > 0) {
        return existingConversations.documents[0];
      }

      let otherUser = otherUserData;
      if (!otherUser.name && !otherUser.full_name) {
        try {
          const otherUserProfile = await databases.getDocument(
            DATABASE_ID,
            'profiles',
            otherUserId
          );
          otherUser = otherUserProfile;
        } catch (error) {
          console.warn('Profil utilisateur non trouvé:', otherUserId);
          otherUser = {
            name: 'Utilisateur inconnu',
            full_name: 'Utilisateur inconnu',
            avatar_url: '',
            user_type: 'candidate'
          };
        }
      }

      const conversationData = {
        conversation_key: conversationKey,
        participant1_id: user.$id,
        participant1_name: user.name || user.full_name || 'Utilisateur',
        participant1_avatar: user.avatar_url || '',
        participant1_type: user.labels?.[0] || 'candidate',
        participant2_id: otherUserId,
        participant2_name: otherUser.name || otherUser.full_name || 'Utilisateur',
        participant2_avatar: otherUser.avatar_url || '',
        participant2_type: otherUser.user_type || 'candidate',
        last_message_id: null,
        last_message_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const newConversation = await databases.createDocument(
        DATABASE_ID,
        'conversations',
        ID.unique(),
        conversationData
      );

      return newConversation;
    } catch (error) {
      console.error('Erreur gestion conversation:', error);
      return null;
    }
  }, [user]);

  const loadConversations = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
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

      for (const conv of conversationsResponse.documents) {
        const isCurrentUserParticipant1 = conv.participant1_id === user.$id;
        const otherParticipant = isCurrentUserParticipant1 
          ? {
              id: conv.participant2_id,
              name: conv.participant2_name,
              avatar: conv.participant2_avatar,
              type: conv.participant2_type
            }
          : {
              id: conv.participant1_id,
              name: conv.participant1_name,
              avatar: conv.participant1_avatar,
              type: conv.participant1_type
            };

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

      const orphansByUser = new Map();
      
      for (const message of orphanMessagesResponse.documents) {
        const otherUserId = message.sender_id === user.$id ? message.receiver_id : message.sender_id;
        
        if (!orphansByUser.has(otherUserId)) {
          orphansByUser.set(otherUserId, []);
        }
        orphansByUser.get(otherUserId).push(message);
      }

      for (const [otherUserId, messages] of orphansByUser) {
        try {
          const conversation = await findOrCreateConversation(otherUserId);
          
          if (conversation) {
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

            const isCurrentUserParticipant1 = conversation.participant1_id === user.$id;
            const otherParticipant = isCurrentUserParticipant1 
              ? {
                  id: conversation.participant2_id,
                  name: conversation.participant2_name,
                  avatar: conversation.participant2_avatar,
                  type: conversation.participant2_type
                }
              : {
                  id: conversation.participant1_id,
                  name: conversation.participant1_name,
                  avatar: conversation.participant1_avatar,
                  type: conversation.participant1_type
                };

            const unreadCount = messages.filter(msg => 
              msg.receiver_id === user.$id && !msg.read_at
            ).length;

            const conversationKey = `migrated_${conversation.$id}`;

            allConversations.set(conversationKey, {
              id: conversationKey,
              conversationId: conversation.$id,
              type: 'migrated',
              otherUser: {
                ...otherParticipant,
                isPremium: false
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
          }
        } catch (error) {
          console.error('Erreur création conversation pour utilisateur:', otherUserId, error);
        }
      }

      const conversationsArray = Array.from(allConversations.values())
        .sort((a, b) => new Date(b.lastMessage.created_at) - new Date(a.created_at));

      setConversations(conversationsArray);
      
      const totalUnread = conversationsArray.reduce((sum, conv) => sum + conv.unreadCount, 0);
      setUnreadCount(totalUnread);
      
      // ✅ RAFRAÎCHIR LE BADGE NAVBAR
      await triggerUnreadCountRefresh(user);
      
    } catch (error) {
      console.error('Erreur chargement conversations:', error);
    } finally {
      setLoading(false);
    }
  }, [user, findOrCreateConversation]);

  const refreshConversations = useCallback(async () => {
    if (!user) return;
    
    try {
      await loadConversations();
    } catch (error) {
      console.error('Erreur actualisation conversations:', error);
    }
  }, [loadConversations]);

  const sendMessage = useCallback(async (receiverId, content, options = {}) => {
    if (!user || !receiverId || (!content.trim() && !options.attachments?.length)) {
      throw new Error('Données manquantes pour envoyer le message');
    }

    try {
      const currentQuota = await loadUserQuota();
      
      if (currentQuota) {
        const userConversationsResponse = await databases.listDocuments(
          DATABASE_ID,
          'conversations',
          [
            Query.or([
              Query.equal('participant1_id', user.$id),
              Query.equal('participant2_id', user.$id)
            ]),
            Query.limit(1000)
          ]
        );

        const uniqueParticipants = new Set();
        userConversationsResponse.documents.forEach(conv => {
          const otherParticipantId = conv.participant1_id === user.$id 
            ? conv.participant2_id 
            : conv.participant1_id;
          uniqueParticipants.add(otherParticipantId);
        });

        const totalConversations = uniqueParticipants.size;
        const isNewConversation = !uniqueParticipants.has(receiverId);
        
        if (isNewConversation) {
          if (totalConversations >= currentQuota.messages_quota) {
            toast.error(`❌ Quota de conversations épuisé ! Vous pouvez contacter jusqu'à ${currentQuota.messages_quota} personnes différentes. Passez au plan supérieur pour débloquer plus de conversations.`, {
              duration: 6000
            });
            throw new Error('QUOTA_EXCEEDED');
          }

          const usagePercent = (totalConversations / currentQuota.messages_quota) * 100;
          if (usagePercent >= 80) {
            const remaining = currentQuota.messages_quota - totalConversations;
            toast.warning(`⚠️ Attention : Vous pouvez encore contacter ${remaining} personne${remaining > 1 ? 's' : ''} différente${remaining > 1 ? 's' : ''}`, {
              duration: 4000
            });
          }
        }
      }

      const conversation = await findOrCreateConversation(receiverId, options.receiverData || {});
      
      if (!conversation) {
        throw new Error('Impossible de créer la conversation');
      }

      const messageData = {
        conversation_id: conversation.$id,
        sender_id: user.$id,
        receiver_id: receiverId,
        subject: options.subject || 'Message direct',
        content: content.trim(),
        message_type: options.messageType || 'direct_message',
        is_premium: user.is_premium || false,
        status: 'sent',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        context_type: options.contextType || null,
        context_id: options.contextId || null,
        context_title: options.contextTitle || null
      };

      if (options.attachments?.length > 0) {
        messageData.attachments = JSON.stringify(options.attachments);
      }

      const newMessage = await databases.createDocument(
        DATABASE_ID,
        'messages',
        ID.unique(),
        messageData
      );

      await databases.updateDocument(
        DATABASE_ID,
        'conversations',
        conversation.$id,
        {
          last_message_id: newMessage.$id,
          last_message_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      );

      if (currentQuota) {
        try {
          const updatedConversationsResponse = await databases.listDocuments(
            DATABASE_ID,
            'conversations',
            [
              Query.or([
                Query.equal('participant1_id', user.$id),
                Query.equal('participant2_id', user.$id)
              ]),
              Query.limit(1000)
            ]
          );

          const updatedUniqueParticipants = new Set();
          updatedConversationsResponse.documents.forEach(conv => {
            const otherParticipantId = conv.participant1_id === user.$id 
              ? conv.participant2_id 
              : conv.participant1_id;
            updatedUniqueParticipants.add(otherParticipantId);
          });

          const newTotalConversations = updatedUniqueParticipants.size;

          await databases.updateDocument(
            DATABASE_ID,
            'subscription_quotas',
            currentQuota.$id,
            {
              messages_used: newTotalConversations,
              updated_at: new Date().toISOString()
            }
          );

          const updatedQuota = await loadUserQuota();

          const remaining = (updatedQuota?.messages_quota || 0) - (updatedQuota?.messages_used || 0);
          toast.success(`✅ Message envoyé ! Vous pouvez encore contacter ${remaining} personne${remaining > 1 ? 's' : ''} différente${remaining > 1 ? 's' : ''}`, {
            duration: 3000
          });
        } catch (quotaError) {
          console.warn('Erreur mise à jour quota:', quotaError);
        }
      } else {
        toast.success('✅ Message envoyé !', { duration: 2000 });
      }

      // Notification email au destinataire via l'API AWS SES
      try {
        const receiverProfile = await databases.getDocument(
          DATABASE_ID,
          'profiles',
          receiverId
        );

        const recipientEmail = receiverProfile.email;
        if (recipientEmail) {
          // Nom affiché de l'expéditeur : JAMAIS email ni téléphone
          const senderDisplayName = user.name || user.full_name || 'Un utilisateur Job2mada';
          const recipientName = receiverProfile.full_name || receiverProfile.company_name || 'Utilisateur';
          const isRecipientCandidate = receiverProfile.user_type === 'candidate';
          const isRecipientPremium = receiverProfile.is_premium || false;
          // L'expéditeur est l'opposé du type destinataire
          const senderType = isRecipientCandidate ? 'recruteur' : 'candidat';

          if (isRecipientCandidate && !isRecipientPremium) {
            // Candidat free : ne peut pas lire dans l'app → incitation premium
            await fetch(`${EMAIL_API_URL}/api/send-premium-upgrade`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                recipientEmail,
                recipientName,
                senderName: senderDisplayName,
                senderType
              })
            });
          } else {
            // Recruteur ou candidat premium : envoyer le contenu du message
            await fetch(`${EMAIL_API_URL}/api/send-message-notification`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                recipientEmail,
                recipientName,
                senderName: senderDisplayName,
                senderType,
                messagePreview: content.trim()
              })
            });
          }
        }
      } catch (emailError) {
        console.warn('Erreur notification email:', emailError);
      }

      setTimeout(() => refreshConversations(), 500);

      return newMessage;

    } catch (error) {
      if (error.message === 'QUOTA_EXCEEDED') {
        throw error;
      }
      console.error('Erreur envoi message:', error);
      toast.error('❌ Erreur lors de l\'envoi du message');
      throw error;
    }
  }, [user, findOrCreateConversation, refreshConversations, loadUserQuota]);

  const uploadFile = async (file, bucketId = BUCKETS.DOCUMENTS) => {
    try {
      const fileId = ID.unique();
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
      
      const uploadedFile = await storage.createFile(
        bucketId,
        fileId,
        file,
        undefined,
        (progress) => {
          const percentage = Math.round((progress.chunksUploaded / progress.chunksTotal) * 100);
          setUploadProgress(prev => ({ ...prev, [fileId]: percentage }));
        }
      );
  
      const fileUrl = storage.getFilePreview(bucketId, fileId);
      
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[fileId];
        return newProgress;
      });
  
      return {
        fileId: fileId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        fileUrl: fileUrl.href
      };
    } catch (error) {
      console.error('Erreur upload fichier:', error);
      throw error;
    }
  };

  const deleteFile = async (fileId, bucketId = BUCKETS.DOCUMENTS) => {
    try {
      await storage.deleteFile(bucketId, fileId);
    } catch (error) {
      console.error('Erreur suppression fichier:', error);
    }
  };

  // ✅ FONCTION MODIFIÉE : Rafraîchir le badge après marquage
  const markAsRead = async (messageId) => {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        'messages',
        messageId,
        {
          status: 'read',
          read_at: new Date().toISOString(), // ✅ IMPORTANT
          updated_at: new Date().toISOString()
        }
      );
      
      console.log('✅ Message marqué comme lu:', messageId);
      
      // ✅ RAFRAÎCHIR LE BADGE NAVBAR IMMÉDIATEMENT
      await triggerUnreadCountRefresh(user);
      
      setTimeout(() => refreshConversations(), 200);
    } catch (error) {
      console.error('Erreur marquage lecture:', error);
    }
  };

  const markConversationAsRead = async (conversationId) => {
    try {
      const messagesResponse = await databases.listDocuments(
        DATABASE_ID,
        'messages',
        [
          Query.equal('conversation_id', conversationId),
          Query.equal('receiver_id', user.$id),
          Query.isNull('read_at'), // ✅ SEULEMENT LES NON LUS
          Query.limit(100)
        ]
      );

      const unreadMessages = messagesResponse.documents;
      
      console.log(`📬 Marquage de ${unreadMessages.length} messages comme lus`);
      
      for (const message of unreadMessages) {
        await markAsRead(message.$id);
      }
      
      // ✅ RAFRAÎCHIR LE BADGE APRÈS TOUT MARQUER
      await triggerUnreadCountRefresh(user);
      
    } catch (error) {
      console.error('Erreur marquage conversation comme lue:', error);
    }
  };

  const loadConversationMessages = useCallback(async (conversationId) => {
    try {
      const messagesResponse = await databases.listDocuments(
        DATABASE_ID,
        'messages',
        [
          Query.equal('conversation_id', conversationId),
          Query.orderAsc('created_at'),
          Query.limit(100)
        ]
      );

      const messages = messagesResponse.documents.map(msg => {
        if (msg.attachments) {
          try {
            msg.parsedAttachments = JSON.parse(msg.attachments);
          } catch (e) {
            msg.parsedAttachments = [];
          }
        } else {
          msg.parsedAttachments = [];
        }
        return msg;
      });

      setMessages(messages);
      
      await markConversationAsRead(conversationId);

      return messages;
    } catch (error) {
      console.error('Erreur chargement messages conversation:', error);
      return [];
    }
  }, [user]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return {
    messages,
    conversations,
    loading,
    unreadCount,
    uploadProgress,
    userQuota,
    loadConversations,
    refreshConversations,
    sendMessage,
    markAsRead,
    markConversationAsRead,
    uploadFile,
    deleteFile,
    loadConversationMessages,
    findOrCreateConversation,
    loadUserQuota
  };
};