const express = require('express');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();

// Import du service email existant
const emailService = require('./services/emailService');

const app = express();
const PORT = process.env.PORT || 3002;

// Configuration CORS pour votre frontend
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8080',
    'https://job2mada.com',
    'https://www.job2mada.com'
  ],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configuration Multer pour les pièces jointes
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max par fichier
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé'), false);
    }
  }
});

// ROUTES

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Job2mada Email API',
    timestamp: new Date().toISOString()
  });
});

// Test de connexion SES
app.get('/api/test-ses', async (req, res) => {
  try {
    const isConnected = await emailService.testConnection();
    const quota = await emailService.getQuota();
    
    res.json({
      connected: isConnected,
      quota: quota,
      message: isConnected ? 'Connexion SES réussie' : 'Échec connexion SES'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erreur test SES',
      details: error.message
    });
  }
});

// Route principale pour l'envoi d'emails de candidature (JOB)
app.post('/api/send-application-email', upload.array('attachments', 5), async (req, res) => {
  try {
    const {
      recruiterEmail,
      recruiterName,
      candidateData,
      jobData
    } = req.body;

    // Validation des données requises
    if (!recruiterEmail || !candidateData || !jobData) {
      return res.status(400).json({
        error: 'Données manquantes',
        required: ['recruiterEmail', 'candidateData', 'jobData']
      });
    }

    // Validation de l'email
    const isValidEmail = await emailService.validateEmail(recruiterEmail);
    if (!isValidEmail) {
      return res.status(400).json({
        error: 'Adresse email invalide'
      });
    }

    // Parser candidateData et jobData si ils sont des strings JSON
    let parsedCandidateData, parsedJobData;
    try {
      parsedCandidateData = typeof candidateData === 'string' ? JSON.parse(candidateData) : candidateData;
      parsedJobData = typeof jobData === 'string' ? JSON.parse(jobData) : jobData;
    } catch (error) {
      return res.status(400).json({
        error: 'Format JSON invalide pour candidateData ou jobData'
      });
    }

    // Traiter les pièces jointes
    const attachments = req.files || [];
    
    console.log(`Envoi email candidature:`, {
      to: recruiterEmail,
      candidate: parsedCandidateData.name,
      job: parsedJobData.title,
      attachments: attachments.length
    });

    // Envoyer l'email AU RECRUTEUR avec vos templates existants
    const result = await emailService.sendApplicationNotification({
      recruiterEmail,
      recruiterName: recruiterName || 'Recruteur',
      candidateData: parsedCandidateData,
      jobData: parsedJobData,
      attachments
    });
    
    // NOUVEAU : Envoyer aussi la confirmation AU CANDIDAT
    try {
      await emailService.sendCandidateConfirmation({
        candidateEmail: parsedCandidateData.email,
        candidateName: parsedCandidateData.name,
        jobData: parsedJobData,
        applicationDate: new Date().toISOString()
      });
      console.log('Confirmation candidat envoyée');
    } catch (confirmError) {
      console.warn('Erreur confirmation candidat:', confirmError.message);
    }

    res.json({
      success: true,
      messageId: result.messageId,
      recipient: result.recipient,
      attachmentCount: attachments.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur API send-application-email:', error);
    
    res.status(500).json({
      success: false,
      error: 'Erreur envoi email',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Route pour notification de message reçu (MESSAGERIE - utilise vos templates)
app.post('/api/send-message-notification', async (req, res) => {
  try {
    const { 
      recipientEmail, 
      recipientName, 
      senderName, 
      subject, 
      message, 
      contextType = 'profile',
      jobTitle = null,
      isRecipientPremium = false,
      senderType = 'candidat',
      messagePreview
    } = req.body;

    console.log('Envoi notification message:', { recipientEmail, senderName, contextType, isRecipientPremium });

    // Validation des données requises
    if (!recipientEmail || !recipientName || !senderName) {
      return res.status(400).json({
        error: 'Données manquantes',
        required: ['recipientEmail', 'recipientName', 'senderName']
      });
    }

    // Validation email
    const isValidEmail = await emailService.validateEmail(recipientEmail);
    if (!isValidEmail) {
      return res.status(400).json({ error: 'Email invalide' });
    }

    // Utiliser VOTRE service existant avec vos templates
    const result = await emailService.sendMessageNotification({
      recipientEmail,
      recipientName,
      senderName,
      senderType,
      message: messagePreview || subject || message || 'Nouveau message reçu'
    });

    res.json({
      success: true,
      messageId: result.messageId,
      recipient: result.recipient,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur envoi notification:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route pour invitation premium (MESSAGERIE - utilise vos templates)
app.post('/api/send-premium-upgrade', async (req, res) => {
  try {
    const { 
      recipientEmail, 
      recipientName, 
      senderName, 
      contextType = 'profile',
      jobTitle = null,
      senderType = 'candidat'
    } = req.body;

    // Validation
    if (!recipientEmail || !recipientName || !senderName) {
      return res.status(400).json({
        error: 'Données manquantes',
        required: ['recipientEmail', 'recipientName', 'senderName']
      });
    }

    const isValidEmail = await emailService.validateEmail(recipientEmail);
    if (!isValidEmail) {
      return res.status(400).json({ error: 'Email invalide' });
    }

    // Utiliser VOTRE service existant avec vos templates
    const result = await emailService.sendPremiumUpgrade({
      recipientEmail,
      recipientName,
      senderName,
      senderType
    });

    res.json({
      success: true,
      messageId: result.messageId,
      recipient: result.recipient,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur envoi invitation:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur envoi invitation premium',
      details: error.message
    });
  }
});

// Route support avec pièces jointes (utilise vos templates)
app.post('/api/send-support-email', upload.array('attachments', 3), async (req, res) => {
  try {
    const { name, email, category, subject, message, priority } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        error: 'Données manquantes',
        required: ['name', 'email', 'subject', 'message']
      });
    }

    const isValidEmail = await emailService.validateEmail(email);
    if (!isValidEmail) {
      return res.status(400).json({ error: 'Email invalide' });
    }

    const attachments = req.files || [];
    const supportEmail = process.env.SUPPORT_EMAIL || 'support@job2mada.com';

    // Utiliser VOTRE service existant
    const result = await emailService.sendSupportTicket({
      supportEmail,
      name,
      email,
      category: category || 'Autre',
      subject,
      message,
      priority: priority || 'normal',
      attachments
    });

    res.json({
      success: true,
      messageId: result.messageId,
      recipient: result.recipient,
      attachmentCount: result.attachmentCount,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur envoi support:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur envoi email support',
      details: error.message
    });
  }
});

// Route pour envoyer des emails simples (sans pièces jointes)
app.post('/api/send-simple-email', async (req, res) => {
  try {
    const { recruiterEmail, recruiterName, candidateData, jobData } = req.body;

    const result = await emailService.sendApplicationNotification({
      recruiterEmail,
      recruiterName,
      candidateData,
      jobData,
      attachments: []
    });

    res.json({
      success: true,
      messageId: result.messageId,
      recipient: result.recipient
    });

  } catch (error) {
    console.error('Erreur send-simple-email:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Gestion des erreurs Multer
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'Fichier trop volumineux',
        maxSize: '10MB'
      });
    }
  }
  
  res.status(500).json({
    error: 'Erreur serveur',
    details: error.message
  });
});

// Route 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    available: [
      'GET /api/health',
      'GET /api/test-ses',
      'POST /api/send-application-email',
      'POST /api/send-simple-email',
      'POST /api/send-message-notification',
      'POST /api/send-premium-upgrade',
      'POST /api/send-support-email'
    ]
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Job2mada Email API démarré sur le port ${PORT}`);
  console.log(`📧 Service email prêt avec AWS SES`);
  console.log(`🌐 Endpoints disponibles:`);
  console.log(`   - GET  http://localhost:${PORT}/api/health`);
  console.log(`   - GET  http://localhost:${PORT}/api/test-ses`);
  console.log(`   - POST http://localhost:${PORT}/api/send-application-email`);
  console.log(`   - POST http://localhost:${PORT}/api/send-message-notification`);
  console.log(`   - POST http://localhost:${PORT}/api/send-premium-upgrade`);
  console.log(`   - POST http://localhost:${PORT}/api/send-support-email`);
  console.log(`   - POST http://localhost:${PORT}/api/send-simple-email`);
});


module.exports = app;