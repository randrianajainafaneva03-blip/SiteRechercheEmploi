import emailjs from '@emailjs/browser';


// Configuration EmailJS
const EMAIL_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAIL_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAIL_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

// Types pour les paramètres
interface ApplicationNotificationParams {
  recruiterEmail: string;
  recruiterName: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  jobTitle: string;
  jobId: string;
  companyName: string;
  applicationDate: string;
  coverLetter?: string;
  cvUrl?: string;
  additionalDocs?: Array<{ name: string; url: string }>;
}

interface ApplicationConfirmationParams {
  candidateEmail: string;
  candidateName: string;
  jobTitle: string;
  companyName: string;
  applicationDate: string;
}

interface EmailResponse {
  success: boolean;
  response?: any;
  error?: any;
}
interface MessageNotificationParams {
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  senderType: 'candidat' | 'recruteur';
  messagePreview?: string;
}

interface PremiumUpgradeParams {
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  senderType: 'candidat' | 'recruteur';
}

class EmailService {
  constructor() {
    if (EMAIL_PUBLIC_KEY) {
      emailjs.init(EMAIL_PUBLIC_KEY);
    }
  }

  // Envoyer notification de candidature au recruteur
  async sendApplicationNotification(params: ApplicationNotificationParams): Promise<EmailResponse> {
    try {
      const {
        recruiterEmail,
        recruiterName,
        candidateName,
        candidateEmail,
        candidatePhone,
        jobTitle,
        jobId,
        companyName,
        applicationDate,
        coverLetter,
        cvUrl,
        additionalDocs = []
      } = params;

      const templateParams = {
        // Données du recruteur
        to_email: recruiterEmail,
        to_name: recruiterName,
        
        // Données de l'offre
        job_title: jobTitle,
        job_id: jobId,
        company_name: companyName,
        
        // Données du candidat
        candidate_name: candidateName,
        candidate_email: candidateEmail,
        candidate_phone: candidatePhone || 'Non renseigné',
        
        // Détails de la candidature
        application_date: new Date(applicationDate).toLocaleDateString('fr-FR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        cover_letter: coverLetter || 'Aucune lettre de motivation fournie',
        cv_url: cvUrl || '#',
        
        // Documents supplémentaires
        additional_docs_count: additionalDocs.length,
        additional_docs_list: additionalDocs.map(doc => doc.name).join(', '),
        
        // Liens d'action
        dashboard_url: `${window.location.origin}/dashboard?tab=applications`,
        job_url: `${window.location.origin}/jobs/${jobId}`,
        
        // Informations de l'entreprise
        platform_name: 'Job2mada',
        platform_url: window.location.origin,
        support_email: 'support@job2mada.com'
      };

      console.log('Envoi notification email...', templateParams);

      const response = await emailjs.send(
        EMAIL_SERVICE_ID,
        EMAIL_TEMPLATE_ID,
        templateParams
      );

      console.log('Email envoyé avec succès:', response);
      return { success: true, response };

    } catch (error) {
      console.error('Erreur envoi email:', error);
      return { success: false, error };
    }
  }

  // Envoyer email de confirmation au candidat
  async sendApplicationConfirmation(params: ApplicationConfirmationParams): Promise<EmailResponse> {
    try {
      const {
        candidateEmail,
        candidateName,
        jobTitle,
        companyName,
        applicationDate
      } = params;

      const templateParams = {
        to_email: candidateEmail,
        to_name: candidateName,
        job_title: jobTitle,
        company_name: companyName,
        application_date: new Date(applicationDate).toLocaleDateString('fr-FR'),
        platform_name: 'Job2mada'
      };

      const response = await emailjs.send(
        EMAIL_SERVICE_ID,
        'template_confirmation_candidat', // Template séparé pour le candidat
        templateParams
      );

      return { success: true, response };
    } catch (error) {
      console.error('Erreur confirmation candidat:', error);
      return { success: false, error };
    }
  }
  async sendMessageNotification(params: MessageNotificationParams): Promise<EmailResponse> {
    try {
      const {
        recipientEmail,
        recipientName,
        senderName,
        senderType,
        messagePreview
      } = params;
  
      const templateParams = {
        to_email: recipientEmail,
        to_name: recipientName,
        sender_name: senderName,
        sender_type: senderType === 'recruteur' ? 'un recruteur' : 'un candidat',
        message_preview: messagePreview || 'Nouveau message reçu',
        messages_url: `${window.location.origin}/messages`,
        platform_name: 'Job2mada',
        platform_url: window.location.origin
      };
  
      const response = await emailjs.send(
        EMAIL_SERVICE_ID,
        'template_message_notification', // Vous devrez créer ce template
        templateParams
      );
  
      return { success: true, response };
    } catch (error) {
      console.error('Erreur notification message:', error);
      return { success: false, error };
    }
  }
  
  // Encourager le passage premium pour lire un message
  async sendPremiumUpgradeNotification(params: PremiumUpgradeParams): Promise<EmailResponse> {
    try {
      const {
        recipientEmail,
        recipientName,
        senderName,
        senderType
      } = params;
  
      const templateParams = {
        to_email: recipientEmail,
        to_name: recipientName,
        sender_name: senderName,
        sender_type: senderType === 'recruteur' ? 'un recruteur' : 'un candidat',
        premium_url: `${window.location.origin}/premium`,
        platform_name: 'Job2mada',
        platform_url: window.location.origin,
        benefits_list: [
          'Recevoir et répondre aux messages',
          'Contacter directement les recruteurs',
          'Profil vérifié et mis en avant',
          'Accès aux fonctionnalités premium'
        ].join('\n• ')
      };
  
      const response = await emailjs.send(
        EMAIL_SERVICE_ID,
        'template_premium_upgrade', // Vous devrez créer ce template
        templateParams
      );
  
      return { success: true, response };
    } catch (error) {
      console.error('Erreur notification premium:', error);
      return { success: false, error };
    }
  }
}

export const emailService = new EmailService();
export type { 
  ApplicationNotificationParams, 
  ApplicationConfirmationParams, 
  MessageNotificationParams,
  PremiumUpgradeParams,
  EmailResponse 
};