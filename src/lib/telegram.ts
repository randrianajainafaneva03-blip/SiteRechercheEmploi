// ✅ SYSTÈME COMPLET NOTIFICATIONS TELEGRAM
// Fichier : src/lib/telegram.ts

/// <reference types="vite/client" />

const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;
const TELEGRAM_PAYMENT_CHAT_ID = import.meta.env.VITE_TELEGRAM_PAYMENT_CHAT_ID || TELEGRAM_CHAT_ID;

// ==================== FONCTION DE BASE ====================
export const sendTelegramNotification = async (message: string, chatId?: string) => {
  const targetChatId = chatId || TELEGRAM_CHAT_ID;
  if (!TELEGRAM_BOT_TOKEN || !targetChatId) {
    console.warn('⚠️ Telegram non configuré (TOKEN ou CHAT_ID manquant)');
    return { success: false, error: 'Not configured' };
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: targetChatId,
          text: message,
          parse_mode: 'HTML',
          disable_web_page_preview: false
        })
      }
    );

    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(data.description || 'Telegram API error');
    }

    console.log('✅ Notification Telegram envoyée');
    return { success: true };
  } catch (error: any) {
    console.error('❌ Erreur Telegram:', error);
    return { success: false, error: error.message };
  }
};

// ==================== 1. NOUVELLE OFFRE À APPROUVER ====================
export const notifyNewJob = async (job: {
  title: string;
  company_name: string;
  location: string;
  employer_name?: string;
  category?: string;
  contract_type?: string;
}) => {
  const message = `
🆕 <b>NOUVELLE OFFRE D'EMPLOI</b>

📋 <b>Titre :</b> ${job.title}
🏢 <b>Entreprise :</b> ${job.company_name}
📍 <b>Lieu :</b> ${job.location}
${job.employer_name ? `👤 <b>Employeur :</b> ${job.employer_name}` : ''}
${job.category ? `🏷️ <b>Catégorie :</b> ${job.category}` : ''}
${job.contract_type ? `📝 <b>Contrat :</b> ${job.contract_type}` : ''}

⏰ <i>Publiée à l'instant - En attente d'approbation</i>

👉 <a href="https://admin.job2mada.com/jobs">Modérer maintenant</a>
  `.trim();

  return sendTelegramNotification(message);
};

// ==================== 2. NOUVEAU SERVICE À APPROUVER ====================
export const notifyNewService = async (service: {
  title: string;
  provider_name: string;
  category: string;
  price?: string;
  location?: string;
}) => {
  const message = `
🛠️ <b>NOUVEAU SERVICE À MODÉRER</b>

📋 <b>Titre :</b> ${service.title}
👤 <b>Prestataire :</b> ${service.provider_name}
🏷️ <b>Catégorie :</b> ${service.category}
${service.price ? `💰 <b>Prix :</b> ${service.price}` : ''}
${service.location ? `📍 <b>Lieu :</b> ${service.location}` : ''}

⏰ <i>Publié à l'instant - En attente de modération</i>

👉 <a href="https://admin.job2mada.com/services">Modérer maintenant</a>
  `.trim();

  return sendTelegramNotification(message);
};

// ==================== 3. DOCUMENT À VÉRIFIER ====================
export const notifyNewDocument = async (doc: {
  type: string;
  user_name: string;
  document_name: string;
  purpose?: string;
}) => {
  const message = `
📄 <b>NOUVEAU DOCUMENT À VÉRIFIER</b>

📎 <b>Type :</b> ${doc.type}
👤 <b>Utilisateur :</b> ${doc.user_name}
📝 <b>Document :</b> ${doc.document_name}
${doc.purpose ? `🎯 <b>Objectif :</b> ${doc.purpose}` : ''}

⏰ <i>Soumis à l'instant - Vérification requise</i>

👉 <a href="https://admin.job2mada.com/documents">Vérifier maintenant</a>
  `.trim();

  return sendTelegramNotification(message);
};

// ==================== 4. NOUVEL ABONNEMENT (AUTOMATIQUE) ====================
export const notifyNewSubscription = async (subscription: {
  user_name: string;
  user_email: string;
  plan: string;
  amount: string;
  payment_method: string;
  status: 'success' | 'pending' | 'failed';
}) => {
  const statusEmoji = {
    success: '✅',
    pending: '⏳',
    failed: '❌'
  };

  const statusText = {
    success: 'Paiement réussi',
    pending: 'En attente de confirmation',
    failed: 'Échec du paiement'
  };

  const message = `
💳 <b>NOUVEL ABONNEMENT</b>

${statusEmoji[subscription.status]} <b>Statut :</b> ${statusText[subscription.status]}

👤 <b>Utilisateur :</b> ${subscription.user_name}
📧 <b>Email :</b> ${subscription.user_email}
📦 <b>Plan :</b> ${subscription.plan}
💰 <b>Montant :</b> ${subscription.amount}
💳 <b>Méthode :</b> ${subscription.payment_method}

⏰ <i>${new Date().toLocaleString('fr-FR')}</i>

${subscription.status === 'success' 
  ? '👉 <a href="https://admin.job2mada.com/subscriptions">Voir les abonnements</a>'
  : '⚠️ <i>Action requise si paiement manuel</i>'
}
  `.trim();

  return sendTelegramNotification(message);
};

// ==================== 5. NOUVEL UTILISATEUR INSCRIT ====================
export const notifyNewUser = async (user: {
  name: string;
  email: string;
  role: string;
  registration_type?: string;
}) => {
  const message = `
👤 <b>NOUVEL UTILISATEUR INSCRIT</b>

🆔 <b>Nom :</b> ${user.name}
📧 <b>Email :</b> ${user.email}
🎭 <b>Rôle :</b> ${user.role}
${user.registration_type ? `📱 <b>Type :</b> ${user.registration_type}` : ''}

⏰ <i>Inscrit à l'instant</i>

👉 <a href="https://admin.job2mada.com/users">Voir les utilisateurs</a>
  `.trim();

  return sendTelegramNotification(message);
};

// ==================== 6. CANDIDATURE REÇUE ====================
export const notifyNewApplication = async (application: {
  job_title: string;
  candidate_name: string;
  candidate_email: string;
  company_name: string;
}) => {
  const message = `
📨 <b>NOUVELLE CANDIDATURE</b>

📋 <b>Offre :</b> ${application.job_title}
🏢 <b>Entreprise :</b> ${application.company_name}

👤 <b>Candidat :</b> ${application.candidate_name}
📧 <b>Email :</b> ${application.candidate_email}

⏰ <i>Reçue à l'instant</i>

👉 <a href="https://admin.job2mada.com/applications">Voir les candidatures</a>
  `.trim();

  return sendTelegramNotification(message);
};

// ==================== 7. CONTACT/MESSAGE REÇU ====================
export const notifyNewContact = async (contact: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) => {
  const truncatedMessage = contact.message.length > 100 
    ? contact.message.substring(0, 100) + '...' 
    : contact.message;

  const message = `
💬 <b>NOUVEAU MESSAGE DE CONTACT</b>

👤 <b>Nom :</b> ${contact.name}
📧 <b>Email :</b> ${contact.email}
📌 <b>Sujet :</b> ${contact.subject}

💬 <b>Message :</b>
<i>${truncatedMessage}</i>

⏰ <i>Reçu à l'instant</i>

👉 <a href="https://admin.job2mada.com/contacts">Voir les messages</a>
  `.trim();

  return sendTelegramNotification(message);
};

// ==================== 8. RÉSUMÉ QUOTIDIEN ====================
export const notifyDailySummary = async (counts: {
  jobs: number;
  services: number;
  documents?: number;
  users?: number;
  subscriptions?: number;
}) => {
  if (
    counts.jobs === 0 && 
    counts.services === 0 && 
    (counts.documents || 0) === 0 &&
    (counts.users || 0) === 0 &&
    (counts.subscriptions || 0) === 0
  ) {
    return { success: false, error: 'Nothing pending' };
  }

  const items: string[] = [];
  if (counts.jobs > 0) {
    items.push(`📊 <b>${counts.jobs}</b> offre${counts.jobs > 1 ? 's' : ''} d'emploi`);
  }
  if (counts.services > 0) {
    items.push(`🛠️ <b>${counts.services}</b> service${counts.services > 1 ? 's' : ''}`);
  }
  if (counts.documents && counts.documents > 0) {
    items.push(`📄 <b>${counts.documents}</b> document${counts.documents > 1 ? 's' : ''}`);
  }
  if (counts.users && counts.users > 0) {
    items.push(`👥 <b>${counts.users}</b> utilisateur${counts.users > 1 ? 's' : ''}`);
  }
  if (counts.subscriptions && counts.subscriptions > 0) {
    items.push(`💳 <b>${counts.subscriptions}</b> abonnement${counts.subscriptions > 1 ? 's' : ''}`);
  }

  const message = `
🔔 <b>RÉSUMÉ QUOTIDIEN - MODÉRATIONS EN ATTENTE</b>

${items.join('\n')}

⏰ <i>${new Date().toLocaleString('fr-FR', { 
  weekday: 'long', 
  day: 'numeric', 
  month: 'long', 
  hour: '2-digit', 
  minute: '2-digit' 
})}</i>

👉 <a href="https://admin.job2mada.com">Accéder au panel admin</a>
  `.trim();

  return sendTelegramNotification(message);
};

// ==================== 9. ALERTE URGENTE ====================
export const notifyUrgentAlert = async (alert: {
  type: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}) => {
  const priorityEmoji = {
    high: '🚨',
    medium: '⚠️',
    low: 'ℹ️'
  };

  const message = `
${priorityEmoji[alert.priority]} <b>ALERTE ${alert.priority === 'high' ? 'URGENTE' : alert.priority === 'medium' ? 'IMPORTANTE' : 'INFO'}</b>

📌 <b>Type :</b> ${alert.type}
🔖 <b>Titre :</b> ${alert.title}

📝 <b>Description :</b>
${alert.description}

⏰ <i>${new Date().toLocaleString('fr-FR')}</i>

👉 <a href="https://admin.job2mada.com">Vérifier le panel</a>
  `.trim();

  return sendTelegramNotification(message);
};

// ==================== 10. TEST DE CONFIGURATION ====================
export const testTelegramConfig = async () => {
  return sendTelegramNotification(`
🧪 <b>Test de configuration Telegram</b>

✅ Le bot fonctionne parfaitement !
🎯 Chat ID: ${TELEGRAM_CHAT_ID}

⏰ ${new Date().toLocaleString('fr-FR')}

🎉 <i>Prêt à recevoir des notifications !</i>
  `.trim());
};

// ==================== 11. OFFRE APPROUVÉE (INFO) ====================
export const notifyJobApproved = async (job: {
  title: string;
  company_name: string;
  moderator_name: string;
}) => {
  const message = `
✅ <b>OFFRE APPROUVÉE</b>

📋 ${job.title}
🏢 ${job.company_name}
👤 Approuvée par : ${job.moderator_name}

⏰ <i>${new Date().toLocaleTimeString('fr-FR')}</i>
  `.trim();

  return sendTelegramNotification(message);
};

// ==================== 12. OFFRE REJETÉE (INFO) ====================
export const notifyJobRejected = async (job: {
  title: string;
  company_name: string;
  reason: string;
  moderator_name: string;
}) => {
  const message = `
❌ <b>OFFRE REJETÉE</b>

📋 ${job.title}
🏢 ${job.company_name}
👤 Rejetée par : ${job.moderator_name}
💬 Raison : <i>${job.reason}</i>

⏰ <i>${new Date().toLocaleTimeString('fr-FR')}</i>
  `.trim();

  return sendTelegramNotification(message);
};

// ==================== 13. NOUVEL ABONNEMENT STRIPE ====================
export const notifyNewSubscriptionStripe = async (subscription: {
    user_name: string;
    user_email: string;
    plan_name: string;
    amount: number;
    billing_period: string;
    ticket_quantity?: number;
  }) => {
    const message = `
  🎉 <b>NOUVEL ABONNEMENT PAYÉ (STRIPE)</b>
   
  👤 <b>Utilisateur :</b> ${subscription.user_name}
  📧 <b>Email :</b> ${subscription.user_email}
   
  💎 <b>Plan :</b> ${subscription.plan_name}
  💰 <b>Montant :</b> ${subscription.amount.toLocaleString()} Ar
  📅 <b>Période :</b> ${subscription.billing_period === 'monthly' ? 'Mensuel' : 'Annuel'}
  ${subscription.ticket_quantity ? `🎫 <b>Tickets :</b> ${subscription.ticket_quantity}` : ''}
   
  ✅ <b>Statut :</b> PAYÉ ET ACTIVÉ
  ⏰ <b>Date :</b> ${new Date().toLocaleString('fr-FR')}
   
  🔔 L'abonnement a été automatiquement activé via Stripe.
    `.trim();
   
    return sendTelegramNotification(message, TELEGRAM_PAYMENT_CHAT_ID);
  };

  // ==================== 14. DEMANDE ABONNEMENT MVOLA ====================
  export const notifyNewSubscriptionMVola = async (subscription: {
    user_name: string;
    user_email: string;
    plan_name: string;
    amount: number;
    billing_period: string;
    phone_number: string;
    mvola_reference: string;
    ticket_quantity?: number;
  }) => {
    const message = `
  📱 <b>DEMANDE ABONNEMENT (MVOLA)</b>
   
  👤 <b>Utilisateur :</b> ${subscription.user_name}
  📧 <b>Email :</b> ${subscription.user_email}
  📞 <b>Téléphone :</b> ${subscription.phone_number}
   
  💎 <b>Plan :</b> ${subscription.plan_name}
  💰 <b>Montant :</b> ${subscription.amount.toLocaleString()} Ar
  📅 <b>Période :</b> ${subscription.billing_period === 'monthly' ? 'Mensuel' : 'Annuel'}
  ${subscription.ticket_quantity ? `🎫 <b>Tickets :</b> ${subscription.ticket_quantity}` : ''}
   
  🔖 <b>Référence MVola :</b> <code>${subscription.mvola_reference}</code>
   
  ⏳ <b>Statut :</b> EN ATTENTE DE VÉRIFICATION
  ⏰ <b>Date :</b> ${new Date().toLocaleString('fr-FR')}
   
  ⚠️ <b>ACTION REQUISE :</b> Vérifier le paiement MVola et activer l'abonnement manuellement.
    `.trim();
   
    return sendTelegramNotification(message);
  };
   
  // ==================== 15. ABONNEMENT ACTIVÉ MANUELLEMENT ====================
  export const notifySubscriptionActivated = async (subscription: {
    user_name: string;
    user_email: string;
    plan_name: string;
    activated_by: string;
  }) => {
    const message = `
  ✅ <b>ABONNEMENT ACTIVÉ</b>
   
  👤 <b>Utilisateur :</b> ${subscription.user_name}
  📧 <b>Email :</b> ${subscription.user_email}
   
  💎 <b>Plan :</b> ${subscription.plan_name}
  👨‍💼 <b>Activé par :</b> ${subscription.activated_by}
  ⏰ <b>Date :</b> ${new Date().toLocaleString('fr-FR')}
   
  🎉 L'abonnement a été activé avec succès !
    `.trim();
   
    return sendTelegramNotification(message);
  };