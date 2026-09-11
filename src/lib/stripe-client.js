// lib/stripe-client.js
import { loadStripe } from '@stripe/stripe-js';

let stripePromise;

const getStripe = () => {
  if (!stripePromise) {
    // Utilisez votre clé publique Stripe (commence par pk_)
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    
    if (!publishableKey) {
      console.error('VITE_STRIPE_PUBLISHABLE_KEY manquante dans .env');
      return null;
    }
    
    console.log('Initialisation Stripe avec la clé publique:', publishableKey.substring(0, 12) + '...');
    stripePromise = loadStripe(publishableKey);
  }
  
  return stripePromise;
};

export default getStripe;