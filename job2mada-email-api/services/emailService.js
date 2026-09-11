// services/emailService.js - VERSION 7 PROVIDERS GRATUITS COMPLET

const axios = require('axios');

// ===== CONFIGURATION DES PROVIDERS =====
const PROVIDERS = {
  brevo: {
    apiKey: process.env.BREVO_API_KEY,
    dailyLimit: 300,
    count: 0
  },
  mailjet: {
    apiKey: process.env.MAILJET_API_KEY,
    secretKey: process.env.MAILJET_SECRET_KEY,
    dailyLimit: 200,
    count: 0
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY,
    dailyLimit: 100,
    count: 0
  },
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY,
    dailyLimit: 100,
    count: 0
  },
  mailersend: {
    apiKey: process.env.MAILERSEND_API_KEY,
    dailyLimit: 100,
    count: 0
  },
  smtp2go: {
    apiKey: process.env.SMTP2GO_API_KEY,
    dailyLimit: 33,
    count: 0
  },
  emailjs: {
    serviceId: process.env.EMAILJS_SERVICE_ID,
    templateId: process.env.EMAILJS_TEMPLATE_ID,
    publicKey: process.env.EMAILJS_PUBLIC_KEY,
    privateKey: process.env.EMAILJS_PRIVATE_KEY,
    dailyLimit: 200,
    count: 0
  }
};

let lastResetDate = new Date().toDateString();

const SENDER_EMAIL = process.env.SENDER_EMAIL || 'noreply@job2mada.com';
const SENDER_NAME = process.env.SENDER_NAME || 'Job2Mada';

// ===== RESET QUOTAS JOURNALIERS =====
function resetDailyCountsIfNeeded() {
  const today = new Date().toDateString();
  if (lastResetDate !== today) {
    Object.keys(PROVIDERS).forEach(key => {
      PROVIDERS[key].count = 0;
    });
    lastResetDate = today;
    console.log('📅 Quotas email réinitialisés pour', today);
  }
}

// ===== FONCTIONS D'ENVOI PAR PROVIDER =====

// 1. BREVO (ex-Sendinblue)
async function sendWithBrevo(params) {
  const response = await axios.post('https://api.brevo.com/v3/smtp/email', {
    sender: { name: SENDER_NAME, email: SENDER_EMAIL },
    to: [{ email: params.to, name: params.toName || '' }],
    subject: params.subject,
    htmlContent: params.htmlContent,
    attachment: params.attachments?.map(a => ({
      name: a.name,
      content: a.content
    })) || []
  }, {
    headers: {
      'accept': 'application/json',
      'api-key': PROVIDERS.brevo.apiKey,
      'content-type': 'application/json'
    },
    timeout: 30000
  });
  return { messageId: response.data.messageId };
}

// 2. MAILJET
async function sendWithMailjet(params) {
  const auth = Buffer.from(`${PROVIDERS.mailjet.apiKey}:${PROVIDERS.mailjet.secretKey}`).toString('base64');
  
  const message = {
    From: { Email: SENDER_EMAIL, Name: SENDER_NAME },
    To: [{ Email: params.to, Name: params.toName || '' }],
    Subject: params.subject,
    HTMLPart: params.htmlContent
  };

  if (params.attachments?.length > 0) {
    message.Attachments = params.attachments.map(att => ({
      ContentType: att.contentType || 'application/octet-stream',
      Filename: att.name,
      Base64Content: att.content
    }));
  }

  const response = await axios.post('https://api.mailjet.com/v3.1/send', {
    Messages: [message]
  }, {
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    },
    timeout: 30000
  });

  if (response.data.Messages?.[0]?.Status !== 'success') {
    throw new Error(response.data.Messages?.[0]?.Errors?.[0]?.ErrorMessage || 'Mailjet failed');
  }
  return { messageId: response.data.Messages[0].To[0].MessageID };
}

// 3. RESEND
async function sendWithResend(params) {
  const payload = {
    from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
    to: params.to,
    subject: params.subject,
    html: params.htmlContent
  };

  if (params.attachments?.length > 0) {
    payload.attachments = params.attachments.map(att => ({
      filename: att.name,
      content: att.content
    }));
  }

  const response = await axios.post('https://api.resend.com/emails', payload, {
    headers: {
      'Authorization': `Bearer ${PROVIDERS.resend.apiKey}`,
      'Content-Type': 'application/json'
    },
    timeout: 30000
  });
  return { messageId: response.data.id };
}

// 4. SENDGRID
async function sendWithSendGrid(params) {
  const payload = {
    personalizations: [{ 
      to: [{ email: params.to, name: params.toName || '' }] 
    }],
    from: { email: SENDER_EMAIL, name: SENDER_NAME },
    subject: params.subject,
    content: [{ type: 'text/html', value: params.htmlContent }]
  };

  if (params.attachments?.length > 0) {
    payload.attachments = params.attachments.map(att => ({
      content: att.content,
      filename: att.name,
      type: att.contentType || 'application/octet-stream',
      disposition: 'attachment'
    }));
  }

  await axios.post('https://api.sendgrid.com/v3/mail/send', payload, {
    headers: {
      'Authorization': `Bearer ${PROVIDERS.sendgrid.apiKey}`,
      'Content-Type': 'application/json'
    },
    timeout: 30000
  });
  return { messageId: 'sendgrid-' + Date.now() };
}

// 5. MAILERSEND
async function sendWithMailersend(params) {
  const payload = {
    from: { email: SENDER_EMAIL, name: SENDER_NAME },
    to: [{ email: params.to, name: params.toName || '' }],
    subject: params.subject,
    html: params.htmlContent
  };

  if (params.attachments?.length > 0) {
    payload.attachments = params.attachments.map(att => ({
      filename: att.name,
      content: att.content
    }));
  }

  const response = await axios.post('https://api.mailersend.com/v1/email', payload, {
    headers: {
      'Authorization': `Bearer ${PROVIDERS.mailersend.apiKey}`,
      'Content-Type': 'application/json'
    },
    timeout: 30000
  });
  return { messageId: response.headers['x-message-id'] || 'mailersend-' + Date.now() };
}

// 6. SMTP2GO
async function sendWithSmtp2go(params) {
  const payload = {
    api_key: PROVIDERS.smtp2go.apiKey,
    sender: `${SENDER_NAME} <${SENDER_EMAIL}>`,
    to: [params.to],
    subject: params.subject,
    html_body: params.htmlContent
  };

  if (params.attachments?.length > 0) {
    payload.attachments = params.attachments.map(att => ({
      filename: att.name,
      fileblob: att.content,
      mimetype: att.contentType || 'application/octet-stream'
    }));
  }

  const response = await axios.post('https://api.smtp2go.com/v3/email/send', payload, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 30000
  });
  
  if (response.data.data?.succeeded !== 1) {
    throw new Error(response.data.data?.error || 'SMTP2GO failed');
  }
  return { messageId: response.data.data.email_id };
}

// 7. EMAILJS (pas de pièces jointes, mais bon fallback)
async function sendWithEmailJS(params) {
  // EmailJS ne supporte pas les pièces jointes, skip si présentes
  if (params.attachments?.length > 0) {
    throw new Error('EmailJS ne supporte pas les pièces jointes');
  }

  const response = await axios.post('https://api.emailjs.com/api/v1.0/email/send', {
    service_id: PROVIDERS.emailjs.serviceId,
    template_id: PROVIDERS.emailjs.templateId,
    user_id: PROVIDERS.emailjs.publicKey,
    accessToken: PROVIDERS.emailjs.privateKey,
    template_params: {
      to_email: params.to,
      to_name: params.toName || '',
      from_name: SENDER_NAME,
      subject: params.subject,
      message_html: params.htmlContent
    }
  }, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 30000
  });

  return { messageId: 'emailjs-' + Date.now() };
}

// ===== MAPPING DES FONCTIONS =====
const PROVIDER_FUNCTIONS = {
  brevo: sendWithBrevo,
  mailjet: sendWithMailjet,
  resend: sendWithResend,
  sendgrid: sendWithSendGrid,
  mailersend: sendWithMailersend,
  smtp2go: sendWithSmtp2go,
  emailjs: sendWithEmailJS
};

// ===== CLASSE PRINCIPALE =====
class EmailService {
  
  // ===== ENVOI AVEC ROTATION AUTOMATIQUE =====
  async sendEmail(params) {
    resetDailyCountsIfNeeded();

    const hasAttachments = params.attachments?.length > 0;

    // Trier par quota restant (plus de quota = priorité)
    const availableProviders = Object.entries(PROVIDERS)
      .filter(([name, config]) => {
        // Vérifier si le provider est configuré
        let hasApiKey = false;
        if (name === 'mailjet') {
          hasApiKey = !!(config.apiKey && config.secretKey);
        } else if (name === 'emailjs') {
          hasApiKey = !!(config.serviceId && config.templateId && config.publicKey);
          // EmailJS ne supporte pas les pièces jointes
          if (hasAttachments) return false;
        } else {
          hasApiKey = !!config.apiKey;
        }
        
        const hasQuota = config.count < config.dailyLimit;
        return hasApiKey && hasQuota;
      })
      .map(([name, config]) => ({
        name,
        remaining: config.dailyLimit - config.count,
        fn: PROVIDER_FUNCTIONS[name]
      }))
      .sort((a, b) => b.remaining - a.remaining);

    if (availableProviders.length === 0) {
      console.error('❌ Tous les quotas email sont épuisés !');
      throw new Error('Quota email journalier atteint. Réessayez demain.');
    }

    // Log des providers disponibles
    console.log(`📊 Providers disponibles: ${availableProviders.map(p => `${p.name}(${p.remaining})`).join(', ')}`);

    // Essayer chaque provider jusqu'à succès
    const errors = [];
    for (const provider of availableProviders) {
      try {
        console.log(`📧 Tentative via ${provider.name} (reste ${provider.remaining})...`);
        const result = await provider.fn(params);
        
        // Incrémenter le compteur
        PROVIDERS[provider.name].count++;
        
        console.log(`✅ Email envoyé via ${provider.name}: ${result.messageId}`);
        return {
          success: true,
          messageId: result.messageId,
          provider: provider.name
        };
      } catch (error) {
        const errorMsg = error.response?.data?.message || error.message;
        console.warn(`⚠️ ${provider.name} échoué: ${errorMsg}`);
        errors.push(`${provider.name}: ${errorMsg}`);
        continue;
      }
    }

    console.error('❌ Tous les providers ont échoué:', errors);
    throw new Error(`Échec envoi email: ${errors.join(' | ')}`);
  }

  // ===== STATISTIQUES =====
  getStats() {
    resetDailyCountsIfNeeded();
    
    let totalUsed = 0;
    let totalLimit = 0;
    
    const stats = Object.entries(PROVIDERS).map(([name, config]) => {
      let hasKey = false;
      if (name === 'mailjet') {
        hasKey = !!(config.apiKey && config.secretKey);
      } else if (name === 'emailjs') {
        hasKey = !!(config.serviceId && config.templateId && config.publicKey);
      } else {
        hasKey = !!config.apiKey;
      }
      
      if (hasKey) {
        totalUsed += config.count;
        totalLimit += config.dailyLimit;
      }
      
      return {
        name,
        configured: hasKey,
        used: config.count,
        limit: config.dailyLimit,
        remaining: config.dailyLimit - config.count
      };
    });

    return {
      providers: stats.filter(s => s.configured),
      unconfigured: stats.filter(s => !s.configured).map(s => s.name),
      totalUsed,
      totalLimit,
      totalRemaining: totalLimit - totalUsed,
      date: lastResetDate
    };
  }

  // ===== NOTIFICATION CANDIDATURE (avec CV) =====
  async sendApplicationNotification({
    recruiterEmail,
    recruiterName,
    candidateData,
    jobData,
    attachments = []
  }) {
    try {
      const { generateCandidatureTemplate } = require('../templates/candidatureTemplate');
      
      const htmlBody = generateCandidatureTemplate({
        recruiterName,
        candidateData,
        jobData
      });

      const emailAttachments = [];

      // Ajouter les fichiers uploadés
      if (attachments?.length > 0) {
        for (const file of attachments) {
          emailAttachments.push({
            name: file.originalname,
            content: file.buffer.toString('base64'),
            contentType: file.mimetype
          });
        }
      }

      // Télécharger et ajouter le CV
      if (candidateData.cvUrl) {
        try {
          console.log('📄 Téléchargement CV depuis:', candidateData.cvUrl);
          const cvResponse = await axios.get(candidateData.cvUrl, {
            responseType: 'arraybuffer',
            timeout: 15000
          });
          
          const cvFilename = `CV_${(candidateData.name || 'candidat').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
          emailAttachments.push({
            name: cvFilename,
            content: Buffer.from(cvResponse.data).toString('base64'),
            contentType: 'application/pdf'
          });
          console.log('✅ CV ajouté:', cvFilename);
        } catch (cvError) {
          console.warn('⚠️ Impossible de télécharger le CV:', cvError.message);
        }
      }

      const result = await this.sendEmail({
        to: recruiterEmail,
        toName: recruiterName,
        subject: `Nouvelle candidature - ${jobData.title} | Job2Mada`,
        htmlContent: htmlBody,
        attachments: emailAttachments
      });

      return {
        success: true,
        messageId: result.messageId,
        provider: result.provider,
        recipient: recruiterEmail,
        attachmentCount: emailAttachments.length
      };

    } catch (error) {
      console.error('❌ Erreur envoi candidature:', error);
      throw new Error(`Échec envoi email: ${error.message}`);
    }
  }

  // ===== CONFIRMATION CANDIDAT =====
  async sendCandidateConfirmation({
    candidateEmail,
    candidateName,
    jobData,
    applicationDate
  }) {
    try {
      const { generateCandidateConfirmationTemplate } = require('../templates/candidateConfirmationTemplate');
      
      const htmlBody = generateCandidateConfirmationTemplate({
        candidateName,
        jobData,
        applicationDate
      });

      const result = await this.sendEmail({
        to: candidateEmail,
        toName: candidateName,
        subject: `Candidature confirmée - ${jobData.title} | Job2Mada`,
        htmlContent: htmlBody
      });

      console.log('✅ Confirmation candidat envoyée:', result.messageId);
      return {
        success: true,
        messageId: result.messageId,
        provider: result.provider,
        recipient: candidateEmail
      };

    } catch (error) {
      console.error('❌ Erreur confirmation candidat:', error);
      throw new Error(`Échec confirmation: ${error.message}`);
    }
  }

  // ===== NOTIFICATION MESSAGE =====
  async sendMessageNotification({
    recipientEmail,
    recipientName,
    senderEmail,
    senderName,
    subject,
    message,
    jobTitle = null,
    contextType = 'profile',
    conversationId = null,
    senderType = '',
    senderUserType = ''
  }) {
    try {
      if (!(await this.validateEmail(recipientEmail))) {
        throw new Error(`Email destinataire invalide: ${recipientEmail}`);
      }

      const rawType = String(senderType || senderUserType || '').trim().toLowerCase();
      const normalizedSenderType = ['recruteur', 'recruiter', 'employer', 'employeur'].includes(rawType)
        ? 'recruteur'
        : 'candidat';

      const { generateMessageNotificationTemplate } = require('../templates/messageNotificationTemplate');

      const htmlBody = generateMessageNotificationTemplate({
        recipientName,
        senderName,
        senderType: normalizedSenderType,
        messagePreview: (message || '').slice(0, 200),
        message,
        jobTitle,
        conversationId
      });

      const result = await this.sendEmail({
        to: recipientEmail,
        toName: recipientName,
        subject: `Nouveau message de ${senderName} | Job2Mada`,
        htmlContent: htmlBody
      });

      return {
        success: true,
        messageId: result.messageId,
        provider: result.provider,
        recipient: recipientEmail
      };

    } catch (error) {
      console.error('❌ Erreur notification message:', error);
      throw new Error(`Échec notification: ${error.message}`);
    }
  }

  // ===== SUPPORT TICKET =====
  async sendSupportTicket({
    supportEmail,
    name,
    email,
    category,
    subject,
    message,
    priority,
    attachments = []
  }) {
    try {
      const { generateSupportTemplate } = require('../templates/supportTemplate');
      
      const htmlBody = generateSupportTemplate({
        name,
        email,
        category,
        subject,
        message,
        priority,
        timestamp: new Date().toLocaleDateString('fr-FR') + ' à ' + new Date().toLocaleTimeString('fr-FR')
      });

      const emailAttachments = attachments.map(file => ({
        name: file.originalname,
        content: file.buffer.toString('base64'),
        contentType: file.mimetype
      }));

      const result = await this.sendEmail({
        to: supportEmail,
        toName: 'Support Job2Mada',
        subject: `[${category.toUpperCase()}] ${subject} | Support Job2Mada`,
        htmlContent: htmlBody,
        attachments: emailAttachments
      });

      return {
        success: true,
        messageId: result.messageId,
        provider: result.provider,
        recipient: supportEmail,
        attachmentCount: emailAttachments.length
      };

    } catch (error) {
      console.error('❌ Erreur support:', error);
      throw new Error(`Échec envoi support: ${error.message}`);
    }
  }

  // ===== PREMIUM UPGRADE =====
  async sendPremiumUpgrade({
    recipientEmail,
    recipientName,
    senderName,
    senderType
  }) {
    try {
      const { generatePremiumUpgradeTemplate } = require('../templates/premiumUpgradeTemplate');
      
      const htmlBody = generatePremiumUpgradeTemplate({
        recipientName,
        senderName,
        senderType
      });

      const result = await this.sendEmail({
        to: recipientEmail,
        toName: recipientName,
        subject: `${senderName} souhaite vous contacter - Découvrez Premium | Job2Mada`,
        htmlContent: htmlBody
      });

      return {
        success: true,
        messageId: result.messageId,
        provider: result.provider,
        recipient: recipientEmail
      };

    } catch (error) {
      console.error('❌ Erreur premium upgrade:', error);
      throw new Error(`Échec invitation premium: ${error.message}`);
    }
  }

  // ===== TEST CONNEXION =====
  async testConnection() {
    try {
      const stats = this.getStats();
      console.log('📊 Email Service Stats:', JSON.stringify(stats, null, 2));
      return {
        connected: stats.providers.length > 0,
        ...stats
      };
    } catch (error) {
      console.error('❌ Erreur test connexion:', error);
      return { connected: false, error: error.message };
    }
  }

  // ===== VALIDATION EMAIL =====
  async validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // ===== QUOTA (compatibilité) =====
  async getQuota() {
    const stats = this.getStats();
    return {
      maxSendRate: 10,
      max24HourSend: stats.totalLimit,
      sentLast24Hours: stats.totalUsed
    };
  }
}

module.exports = new EmailService();