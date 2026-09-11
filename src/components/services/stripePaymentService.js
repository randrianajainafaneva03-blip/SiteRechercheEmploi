import getStripe from '@/lib/stripe-client';

class StripePaymentService {
  static async createPaymentIntent(planData, userData) {
    try {
      console.log('=== DEBUT CREATE PAYMENT INTENT ===');
      console.log('planData:', planData);
      console.log('userData:', userData);

      // Utiliser l'URL d'environnement si disponible
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

      const response = await fetch(`${apiUrl}/api/stripe/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: planData.price,
          planType: planData.type,
          userId: userData.id,
          userEmail: userData.email,
          userName: userData.name,
          billingPeriod: planData.billingPeriod || 'monthly' // Ajouter le billingPeriod
        })
      });

      console.log('Response status:', response.status);

      const responseText = await response.text();
      console.log('Response text:', responseText);

      if (!responseText) {
        throw new Error('Réponse vide du serveur');
      }

      const data = JSON.parse(responseText);
      console.log('Parsed data:', data);

      if (!response.ok) {
        throw new Error(data.error || `Erreur HTTP ${response.status}`);
      }

      if (!data.success || !data.clientSecret) {
        throw new Error(data.error || 'Données de paiement manquantes');
      }

      console.log('=== SUCCESS CREATE PAYMENT INTENT ===');
      
      return {
        success: true,
        clientSecret: data.clientSecret,
        paymentIntentId: data.paymentIntentId
      };

    } catch (error) {
      console.error('=== ERREUR CREATE PAYMENT INTENT ===');
      console.error('Error details:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async createSubscription(planData, userData) {
    try {
      console.log('=== DEBUT CREATE SUBSCRIPTION ===');
      console.log('planData:', planData);
      console.log('userData:', userData);
  
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  
      const response = await fetch(`${apiUrl}/api/stripe/create-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planType: planData.type,
          billingPeriod: planData.billingPeriod,
          userId: userData.id,
          userEmail: userData.email,
          userName: userData.name
        })
      });
  
      console.log('Response status:', response.status);
  
      const responseText = await response.text();
      console.log('Response text:', responseText);
  
      if (!responseText) {
        throw new Error('Réponse vide du serveur');
      }
  
      const data = JSON.parse(responseText);
      console.log('Parsed data:', data);
  
      if (!response.ok) {
        throw new Error(data.error || `Erreur HTTP ${response.status}`);
      }
  
      if (!data.success || !data.clientSecret) {
        throw new Error(data.error || 'Données d\'abonnement manquantes');
      }
  
      console.log('=== SUCCESS CREATE SUBSCRIPTION ===');
      
      return {
        success: true,
        subscriptionId: data.subscriptionId,
        customerId: data.customerId,
        clientSecret: data.clientSecret,
        paymentIntentId: data.paymentIntentId
      };
  
    } catch (error) {
      console.error('=== ERREUR CREATE SUBSCRIPTION ===');
      console.error('Error details:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }
  // Version corrigée qui utilise confirmCardPayment au lieu de confirmPayment
  static async confirmPayment(cardElement, clientSecret, paymentIntentId, userId, cardholderName) {
    try {
      console.log('=== DEBUT CONFIRM PAYMENT ===');
      const stripe = await getStripe();
      
      if (!stripe) {
        throw new Error('Stripe non initialisé');
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: cardholderName,
          },
        }
      });

      if (error) {
        console.error('Erreur Stripe confirmCardPayment:', error);
        return {
          success: false,
          error: error.message
        };
      }

      console.log('PaymentIntent confirmé:', paymentIntent);

      if (paymentIntent.status === 'succeeded') {
        // Confirmer côté serveur pour activer l'abonnement
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        
        const confirmResponse = await fetch(`${apiUrl}/api/stripe/confirm-payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            userId: userId
          })
        });

        const confirmData = await confirmResponse.json();
        console.log('Server confirmation:', confirmData);
        
        return {
          success: true,
          paymentIntent,
          transactionId: paymentIntent.id,
          subscription: confirmData.success ? confirmData.subscription : null
        };
      }

      return {
        success: false,
        error: `Statut de paiement: ${paymentIntent.status}`
      };

    } catch (error) {
      console.error('=== ERREUR CONFIRM PAYMENT ===');
      console.error('Payment confirmation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default StripePaymentService;