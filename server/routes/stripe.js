import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import { Client, Databases, ID } from 'node-appwrite';

dotenv.config();

const router = express.Router();

// ========================================
// INITIALISATION STRIPE
// ========================================
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY manquante dans .env');
  process.exit(1);
}

console.log('✅ Stripe initialisé:', process.env.STRIPE_SECRET_KEY.substring(0, 12) + '...');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ========================================
// INITIALISATION APPWRITE
// ========================================
const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

// ========================================
// TAUX DE CONVERSION - 1€ = 4600 Ar
// ========================================
const EUR_TO_MGA_RATE = 4600;

// ========================================
// CONFIGURATION DES PLANS
// ========================================
const PLANS_CONFIG = {
  candidate_pro: {
    monthly: 15000,
    annual: 160000,
    name: 'Candidat PRO',
    messages: 10
  },
  candidate_plus: {
    monthly: 25000,
    annual: 280000,
    name: 'Candidat PLUS+',
    messages: 20
  },
  candidate_ticket: {
    ticketPrice: 8000,
    baseMessages: 5,
    name: 'Ticket Crédit'
  },
  recruiter_ticket: {
    ticketPrice: 20000,
    name: 'Ticket Crédit Employeur',
    jobSlots: 3,
    messages: 7
  },
  premium_pro: {
    monthly: 30000,
    annual: 340000,
    name: 'Premium Pro',
    jobSlots: 5,
    messages: 10,
    featured_days: 3
  },
  premium_plus: {
    monthly: 50000,
    annual: 570000,
    name: 'Premium Plus+',
    jobSlots: 10,
    messages: 15,
    featured_days: 7
  },
  candidat_pro: {
    monthly: 15000,
    annual: 160000,
    name: 'Candidat PRO',
    messages: 10
  },
  candidat_plus: {
    monthly: 25000,
    annual: 280000,
    name: 'Candidat PLUS+',
    messages: 20
  },
  employer_basic: {
    monthly: 30000,
    annual: 320000,
    name: 'Employeur BASIC',
    jobSlots: 5,
    messages: 10
  },
  employer_pro: {
    monthly: 50000,
    annual: 540000,
    name: 'Employeur PRO',
    jobSlots: 15,
    messages: 15
  },
  employer_enterprise: {
    monthly: 100000,
    annual: 1080000,
    name: 'Employeur ENTERPRISE',
    jobSlots: 50,
    messages: 20
  }
};

// ========================================
// ROUTE 1 : Create Payment Intent
// ========================================
router.post('/create-payment-intent', async (req, res) => {
  try {
    console.log('📥 Requête create-payment-intent:', req.body);

    const { amount, planType, userId, userEmail, userName, billingPeriod, ticketQuantity } = req.body;

    // Validation
    if (!amount || !planType || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Champs requis: amount, planType, userId'
      });
    }

    // ✅ CONVERSION AVEC NOUVEAU TAUX : 1€ = 4600 Ar
    const amountInEurCents = Math.round(amount / EUR_TO_MGA_RATE * 100);
    console.log(`💱 Conversion (1€ = ${EUR_TO_MGA_RATE} Ar): ${amount} Ar → ${amountInEurCents / 100} EUR`);

    // Créer Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInEurCents,
      currency: 'eur',
      payment_method_types: ['card'],
      metadata: {
        planType,
        userId,
        userEmail: userEmail || '',
        userName: userName || '',
        billingPeriod: billingPeriod || 'monthly',
        originalAmountMga: amount.toString(),
        ticketQuantity: ticketQuantity ? ticketQuantity.toString() : '1',
        platform: 'job2mada'
      },
      receipt_email: userEmail,
      description: `Job2Mada ${planType} - ${billingPeriod || 'monthly'} - ${amount.toLocaleString()} Ar`
    });

    console.log('✅ PaymentIntent créé:', paymentIntent.id);

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error('❌ Erreur Stripe:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur création paiement',
      details: error.message
    });
  }
});

// ========================================
// ROUTE 2 : Confirm Payment (AVEC APPWRITE CORRIGÉ)
// ========================================
router.post('/confirm-payment', async (req, res) => {
  try {
    console.log('📥 Requête confirm-payment:', req.body);

    const { paymentIntentId, userId } = req.body;

    if (!paymentIntentId || !userId) {
      return res.status(400).json({
        success: false,
        error: 'paymentIntentId et userId requis'
      });
    }

    // Récupérer le Payment Intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        error: `Paiement non confirmé. Status: ${paymentIntent.status}`
      });
    }

    console.log('💳 Paiement confirmé:', paymentIntent.id);

    // 🚀 ACTIVER LE PREMIUM DANS APPWRITE
    const subscription = await activatePremiumSubscription(
      userId,
      paymentIntent.metadata.planType,
      paymentIntent.metadata.billingPeriod,
      parseInt(paymentIntent.metadata.originalAmountMga),
      paymentIntent.id,
      parseInt(paymentIntent.metadata.ticketQuantity || '1')
    );

    res.json({
      success: true,
      subscription: subscription,
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount_mga: parseInt(paymentIntent.metadata.originalAmountMga),
        amount_eur: paymentIntent.amount / 100
      }
    });

  } catch (error) {
    console.error('❌ Erreur confirmation:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur confirmation paiement',
      details: error.message
    });
  }
});

// ========================================
// ROUTE 3 : Webhook Stripe (AUTO-ACTIVATION)
// ========================================
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    console.log('🔔 Webhook reçu:', event.type);
  } catch (err) {
    console.error('❌ Erreur webhook signature:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Gérer les événements
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('💰 Paiement webhook réussi:', paymentIntent.id);

        // Auto-activation premium
        await activatePremiumSubscription(
          paymentIntent.metadata.userId,
          paymentIntent.metadata.planType,
          paymentIntent.metadata.billingPeriod,
          parseInt(paymentIntent.metadata.originalAmountMga),
          paymentIntent.id,
          parseInt(paymentIntent.metadata.ticketQuantity || '1')
        );
        break;

      case 'payment_intent.payment_failed':
        console.error('❌ Paiement échoué:', event.data.object.id);
        break;

      default:
        console.log(`ℹ️ Event non géré: ${event.type}`);
    }

    res.json({ received: true });

  } catch (error) {
    console.error('❌ Erreur traitement webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========================================
// FONCTION : Activer Premium Appwrite
// ✅ CORRIGÉ - Quotas mensuels pour abonnement annuel
// ========================================
async function sendTelegramNotification(message) {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_PAYMENT_CHAT_ID;
    console.log('📨 Telegram:', { token: token?.substring(0,10), chatId });
    if (!token || !chatId) { console.warn('⚠️ Telegram vars manquantes'); return; }
    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' }),
    });
    const tgJson = await tgRes.json();
    console.log('📨 Telegram response:', JSON.stringify(tgJson));
  } catch (e) {
    console.warn('⚠️ Telegram notification failed:', e.message);
  }
}

async function activatePremiumSubscription(userId, planType, billingPeriod, amount, transactionId, ticketQuantity = 1) {
  try {
    console.log('🚀 Activation Premium:', { userId, planType, billingPeriod });

    const databaseId = process.env.APPWRITE_DATABASE_ID;
    const profilesCollectionId = process.env.APPWRITE_PROFILES_COLLECTION_ID;
    const subscriptionsCollectionId = process.env.APPWRITE_SUBSCRIPTIONS_COLLECTION_ID;
    const quotasCollectionId = process.env.APPWRITE_QUOTAS_COLLECTION_ID;

    // ✅ CORRECTION : Calculer les dates
    const now = new Date();
    let subscriptionEnd;
    let quotaResetDate; // ← NOUVEAU : Date de reset des quotas
    
    if (billingPeriod === 'annual') {
      // Abonnement se termine dans 1 an
      subscriptionEnd = new Date(now);
      subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);
      
      // ✅ QUOTAS se renouvellent MENSUELLEMENT (pas dans 1 an)
      quotaResetDate = new Date(now);
      quotaResetDate.setMonth(quotaResetDate.getMonth() + 1);
    } else {
      // Mensuel : tout se renouvelle dans 1 mois
      subscriptionEnd = new Date(now);
      subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);
      quotaResetDate = new Date(subscriptionEnd);
    }

    // ✅ 1. Mettre à jour le profil (SEULEMENT is_premium)
    await databases.updateDocument(
      databaseId,
      profilesCollectionId,
      userId,
      {
        is_premium: true
      }
    );

    console.log('✅ Profil mis à jour');

    // ✅ 2. Créer subscription (structure EXACTE de ton admin)
    const subscription = await databases.createDocument(
      databaseId,
      subscriptionsCollectionId,
      ID.unique(),
      {
        user_id: userId,
        user_type: (planType.startsWith('candidate') || planType.startsWith('candidat')) ? 'candidate' : 'employer',
        subscription_type: planType,
        plan_name: PLANS_CONFIG[planType]?.name || planType,
        billing_period: billingPeriod || 'monthly',
        amount_mga: amount,
        status: 'active',
        payment_method: 'stripe',
        transaction_id: transactionId,
        start_date: new Date().toISOString(),
        end_date: subscriptionEnd.toISOString(),
        activated_by: 'stripe_auto',
        activated_by_name: 'Stripe (Automatique)',
        auto_renew: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    );

    console.log('✅ Subscription créée:', subscription.$id);
    console.log(`📅 Expire le: ${subscriptionEnd.toLocaleDateString('fr-FR')}`);

    // ✅ 3. Créer les quotas (reset MENSUEL même pour annuel)
    const planConfig = PLANS_CONFIG[planType];
    console.log('🔍 planType reçu:', planType, '| planConfig trouvé:', !!planConfig, '| clés dispo:', Object.keys(PLANS_CONFIG));
    if (!planConfig) {
      console.error('❌ Plan inconnu:', planType);
      throw new Error(`Plan inconnu: ${planType}`);
    }
    let quotaData = {
      subscription_id: subscription.$id,
      user_id: userId,
      user_type: (planType.startsWith('candidate') || planType.startsWith('candidat')) ? 'candidate' : 'employer',
      reset_date: quotaResetDate.toISOString(), // ← UTILISE quotaResetDate
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (planType.startsWith('candidate') || planType.startsWith('candidat')) {
      // Quotas candidats
      const messagesCount = planType === 'candidate_ticket'
        ? planConfig.baseMessages * ticketQuantity
        : planConfig.messages;

      quotaData = {
        ...quotaData,
        messages_quota: messagesCount,
        messages_used: 0,
        featured_jobs_quota: 0,
        featured_jobs_used: 0,
        featured_days: 0
      };
    } else {
      // Quotas employeurs (tickets : multiplier par quantité)
      const isTicket = planType === 'recruiter_ticket';
      quotaData = {
        ...quotaData,
        messages_quota: (planConfig.messages || 10) * (isTicket ? ticketQuantity : 1),
        messages_used: 0,
        featured_jobs_quota: (planConfig.jobSlots || 5) * (isTicket ? ticketQuantity : 1),
        featured_jobs_used: 0,
        featured_days: planConfig.featured_days || (planType === 'employer_pro' ? 7 : 3)
      };
    }

    const quota = await databases.createDocument(
      databaseId,
      quotasCollectionId,
      ID.unique(),
      quotaData
    );

    console.log('✅ Quotas créés:', quota.$id);
    console.log(`🔄 Quotas se renouvellent le: ${quotaResetDate.toLocaleDateString('fr-FR')}`);

    // Notification Telegram
    const planName = PLANS_CONFIG[planType]?.name || planType;
    const amountFormatted = amount.toLocaleString('fr-FR');
    const telegramMsg = `💳 <b>Paiement reçu — Job2Mada</b>\n\n` +
      `👤 User ID: <code>${userId}</code>\n` +
      `📦 Plan: <b>${planName}</b>${planType === 'candidate_ticket' ? ` (x${ticketQuantity})` : ''}\n` +
      `💰 Montant: <b>${amountFormatted} Ar</b>\n` +
      `🔁 Période: ${billingPeriod || 'monthly'}\n` +
      `💳 Transaction: <code>${transactionId}</code>\n` +
      `📅 Date: ${new Date().toLocaleString('fr-FR')}`;
    await sendTelegramNotification(telegramMsg);

    return {
      subscription: subscription,
      quota: quota
    };

  } catch (error) {
    console.error('❌ Erreur activation:', error);
    throw error;
  }
}

// ========================================
// ROUTE TEST
// ========================================
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'API Stripe Job2Mada OK',
    config: {
      stripeConfigured: !!process.env.STRIPE_SECRET_KEY,
      webhookConfigured: !!process.env.STRIPE_WEBHOOK_SECRET,
      appwriteConfigured: !!process.env.APPWRITE_API_KEY,
      eurToMgaRate: EUR_TO_MGA_RATE,
      plans: Object.keys(PLANS_CONFIG)
    }
  });
});

export default router;