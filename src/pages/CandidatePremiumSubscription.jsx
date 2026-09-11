import React, { useState, useEffect, useRef } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { 
  notifyNewSubscriptionStripe, 
  notifyNewSubscriptionMVola 
} from '@/lib/telegram';
import { 
  Crown, 
  Star, 
  Check, 
  X, 
  Zap, 
  Target, 
  Users, 
  Phone, 
  Eye, 
  MessageSquare, 
  TrendingUp, 
  Shield, 
  HeadphonesIcon,
  Award,
  Sparkles,
  ArrowRight,
  CreditCard,
  Lock,
  AlertCircle,
  CheckCircle,
  Gift,
  Clock,
  BarChart3,
  Bell,
  Wallet,
  Rocket,
  Diamond,
  MousePointer,
  Mail,
  UserCheck,
  Send,
  Lightbulb,
  Ticket,
  Plus,
  Minus,
  Loader,
  Copy,
  Info,
  ChevronRight,
  TrendingDown,
  BadgeCheck
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import getStripe from '@/lib/stripe-client';
import StripePaymentService from '@/components/services/stripePaymentService';
import { Navbar } from '@/components/layout/Navbar';
import toast from 'react-hot-toast';
import { getActiveSubscription, canSubscribeToPlan } from '@/services/subscriptionService';

// ========================================
// MODAL PAIEMENT CARTE BANCAIRE
// ========================================
const StripePaymentModal = ({ isOpen, onClose, selectedPlan, billingPeriod, ticketQuantity, plans, user, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [cardholderName, setCardholderName] = useState('');
  const [error, setError] = useState('');

  const calculateTotalPrice = () => {
    if (selectedPlan === 'candidate_ticket') {
      return plans[selectedPlan].ticketPrice * ticketQuantity;
    }
    return billingPeriod === 'monthly' 
      ? plans[selectedPlan]?.monthlyPrice 
      : plans[selectedPlan]?.annualPrice;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast.error('Stripe non initialisé, veuillez réessayer.');
      return;
    }

    if (!cardholderName.trim()) {
      toast.error('Veuillez entrer le nom du titulaire de la carte');
      return;
    }

    try {
      setProcessing(true);
      setError('');

      const apiUrl = import.meta.env.VITE_API_URL || 'https://server-stripe-job2mada.vercel.app';

      // 1. Créer le PaymentIntent côté serveurs
      const intentRes = await fetch(`${apiUrl}/api/stripe/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: calculateTotalPrice(),
          planType: selectedPlan,
          userId: user.$id || user.id,
          userEmail: user.email,
          userName: user.name || '',
          billingPeriod,
          ticketQuantity: selectedPlan === 'candidate_ticket' ? ticketQuantity : undefined,
        }),
      });

      if (!intentRes.ok) {
        const err = await intentRes.json();
        throw new Error(err.error || 'Erreur création paiement');
      }

      const { clientSecret } = await intentRes.json();

      // 2. Confirmer le paiement avec la carte
      const cardElement = elements.getElement(CardElement);
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: { name: cardholderName, email: user.email },
        },
      });

      if (stripeError) {
        setError(stripeError.message);
        toast.error(stripeError.message);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        const confirmRes = await fetch(`${apiUrl}/api/stripe/confirm-payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            userId: user.$id || user.id,
          }),
        });
        const confirmData = await confirmRes.json();
        if (!confirmRes.ok) {
          console.error('❌ confirm-payment error:', confirmData);
          toast.error('Paiement reçu mais activation échouée. Contactez support@job2mada.com');
          return;
        }
        toast.success('✅ Paiement réussi ! Votre abonnement est activé.');
        onSuccess();
      }

    } catch (error) {
      console.error('❌ Erreur paiement Stripe:', error);
      setError(error.message);
      toast.error(error.message || 'Erreur paiement. Contactez support@job2mada.com');
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
        
        {/* Header */}
        <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 p-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M0 0h30v30H0z'/%3E%3Cpath d='M30 30h30v30H30z'/%3E%3C/g%3E%3C/svg%3E")`
            }} />
          </div>
          
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
          >
            <X className="h-5 w-5 text-white" />
          </button>

          <div className="relative z-10">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <img src="/cbb.png" alt="MVola" className="w-12 h-12 object-contain" />
                    </div>
            <h2 className="text-3xl font-black text-white mb-2">Paiement par Carte Bancaire</h2>
            <p className="text-white/90 text-lg">Paiement sécurisé vers notre société mère DAT-CORP DIGITAL LTD</p>
          </div>
        </div>

        {/* Corps */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* Récapitulatif */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-black text-gray-900">{plans[selectedPlan]?.name}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedPlan === 'candidate_ticket' 
                    ? `${ticketQuantity} ticket${ticketQuantity > 1 ? 's' : ''} /mois`
                    : billingPeriod === 'monthly' ? 'Abonnement mensuel' : 'Abonnement annuel'
                  }
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-amber-600">
                  {calculateTotalPrice().toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Ariary</div>
              </div>
            </div>

            <div className="flex items-center text-sm text-gray-700 bg-white/50 rounded-lg p-3">
              <Info className="h-4 w-4 mr-2 text-blue-600" />
              <span>Équivaut à environ <strong>{(calculateTotalPrice() / 4600).toFixed(2)} EUR</strong></span>
            </div>
          </div>

          {/* Nom titulaire */}
          <div>
            <label className="block text-base font-bold text-gray-900 mb-3 flex items-center">
              <UserCheck className="h-5 w-5 mr-2 text-purple-600" />
              Nom du titulaire de la carte
            </label>
            <input
              type="text"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              placeholder="Ex: Jean Dupont"
              className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl text-base focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 bg-gray-50 focus:bg-white"
              required
            />
          </div>

          {/* Élément Stripe - AGRANDI */}
          <div>
            <label className="block text-base font-bold text-gray-900 mb-3 flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-purple-600" />
              Informations de la carte
            </label>
            <div className="p-6 min-h-[80px] border-2 border-gray-200 rounded-2xl bg-gray-50 focus-within:border-purple-500 focus-within:ring-4 focus-within:ring-purple-500/20 transition-all duration-300">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '18px',
                      color: '#1f2937',
                      fontFamily: '"Inter", sans-serif',
                      '::placeholder': { color: '#9ca3af' },
                      iconColor: '#9333ea',
                    },
                    invalid: {
                      color: '#ef4444',
                      iconColor: '#ef4444',
                    },
                  },
                  hidePostalCode: true,
                }}
              />
            </div>
            <div className="flex items-start space-x-2 mt-3 text-xs text-gray-600">
              <Shield className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">Paiement 100% sécurisé</p>
                <p>Vos données bancaires sont cryptées et ne sont jamais stockées sur nos serveurs.</p>
              </div>
            </div>
          </div>

          {/* Message erreur */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-start animate-shake">
              <AlertCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold text-red-800">Erreur de paiement</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Boutons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 transition-all duration-300 disabled:opacity-50"
              disabled={processing}
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={!stripe || processing}
              className="flex-1 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white font-black py-4 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              {processing ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  Paiement en cours...
                </>
              ) : (
                <>
                  <Lock className="h-5 w-5" />
                  Payer {calculateTotalPrice().toLocaleString()} Ar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ========================================
// MODAL PAIEMENT MVOLA
// ========================================
const MVolaPaymentModal = ({ isOpen, onClose, selectedPlan, billingPeriod, ticketQuantity, plans, user, onSuccess }) => {
  const [mvolaReference, setMvolaReference] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [processing, setProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  const MVOLA_NUMBER = '034 26 126 52';
  const MVOLA_NAME = 'TDI DIGITAL MG';

  const calculateTotalPrice = () => {
    if (selectedPlan === 'candidate_ticket') {
      return plans[selectedPlan].ticketPrice * ticketQuantity;
    }
    return billingPeriod === 'monthly' 
      ? plans[selectedPlan]?.monthlyPrice 
      : plans[selectedPlan]?.annualPrice;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Numéro copié !');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!mvolaReference.trim()) {
      toast.error('Veuillez entrer la référence MVola');
      return;
    }

    if (!phoneNumber.trim()) {
      toast.error('Veuillez entrer votre numéro de téléphone');
      return;
    }

    try {
      setProcessing(true);

      const formData = new FormData();
      formData.append('name', user.name || 'Utilisateur');
      formData.append('email', user.email);
      formData.append('category', 'Abonnement Premium - MVola');
      formData.append('subject', `Activation Premium - ${plans[selectedPlan]?.name}`);
      formData.append('priority', 'high');
      formData.append('message', `
Demande d'activation Premium

👤 Utilisateur: ${user.name || 'Utilisateur'}
📧 Email: ${user.email}
📦 Plan: ${plans[selectedPlan]?.name}
💰 Montant: ${calculateTotalPrice().toLocaleString()} Ar
📱 Téléphone: ${phoneNumber}
🔖 Référence MVola: ${mvolaReference}
⏱️ Date: ${new Date().toLocaleString('fr-FR')}

Merci d'activer l'abonnement après vérification du paiement.
      `);

      const response = await fetch('https://api.job2mada.com/api/send-support-email', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Erreur envoi');
 
      // ✅ NOTIFICATION TELEGRAM
      try {
        await notifyNewSubscriptionMVola({
          user_name: user.name || 'Utilisateur',
          user_email: user.email,
          plan_name: plans[selectedPlan]?.name,
          amount: calculateTotalPrice(),
          billing_period: billingPeriod,
          phone_number: phoneNumber,
          mvola_reference: mvolaReference,
          ticket_quantity: selectedPlan === 'candidate_ticket' ? ticketQuantity : undefined
        });
        console.log('✅ Notification Telegram MVola envoyée');
      } catch (telegramError) {
        console.warn('⚠️ Erreur notification Telegram (non bloquant):', telegramError);
      }
 
      toast.success('✅ Demande envoyée ! Activation sous 24h après vérification.');
      onSuccess();
      
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur envoi. Contactez support@job2mada.com');
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
        
        {/* Header */}
        <div className="bg-gradient-to-br from-red-600 via-pink-600 to-rose-600 p-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M0 0h30v30H0z'/%3E%3Cpath d='M30 30h30v30H30z'/%3E%3C/g%3E%3C/svg%3E")`
            }} />
          </div>
          
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
          >
            <X className="h-5 w-5 text-white" />
          </button>

          <div className="relative bg-gradient-to-br from-job-purple to-job-pink z-10">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
              <img src="/mvola.png" alt="MVola" className="w-12 h-12 object-contain" />
            </div>
            <h2 className="text-3xl font-black text-white mb-2">Paiement MVola</h2>
            <p className="text-white/90 text-lg">Paiement mobile sécurisé</p>
          </div>
        </div>

        {/* Corps */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* Récapitulatif */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-black text-gray-900">{plans[selectedPlan]?.name}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedPlan === 'candidate_ticket' 
                    ? `${ticketQuantity} ticket${ticketQuantity > 1 ? 's' : ''} /mois`
                    : billingPeriod === 'monthly' ? 'Abonnement mensuel' : 'Abonnement annuel'
                  }
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-amber-600">
                  {calculateTotalPrice().toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Ariary</div>
              </div>
            </div>
          </div>

          {/* Instructions de paiement */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6">
            <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center">
              <Info className="h-5 w-5 mr-2 text-blue-600" />
              Instructions de paiement
            </h3>

            <div className="space-y-4">
              {/* Étape 1 */}
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-black text-sm mr-4 flex-shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 mb-2">Effectuez le paiement MVola</p>
                  <div className="bg-white border-2 border-blue-300 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 font-medium">Numéro MVola :</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(MVOLA_NUMBER.replace(/\s/g, ''))}
                        className="text-blue-600 hover:text-blue-700 text-sm font-bold flex items-center"
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        {copied ? 'Copié !' : 'Copier'}
                      </button>
                    </div>
                    <p className="text-2xl font-black text-gray-900 mb-3">{MVOLA_NUMBER}</p>
                    <div className="flex items-center text-sm">
                      <UserCheck className="h-4 w-4 mr-2 text-gray-600" />
                      <span className="text-gray-700">Au nom de : <strong>{MVOLA_NAME}</strong></span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">(Société partenaire de Job2Mada)</p>
                  </div>
                </div>
              </div>

              {/* Étape 2 */}
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-black text-sm mr-4 flex-shrink-0">
                  2
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 mb-2">Entrez la référence MVola</p>
                  <p className="text-sm text-gray-600 mb-3">Après votre paiement, saisissez la référence de transaction pour activer votre abonnement.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire */}
          <div className="space-y-4">
            {/* Téléphone */}
            <div>
              <label className="block text-base font-bold text-gray-900 mb-3 flex items-center">
                <Phone className="h-5 w-5 mr-2 text-red-600" />
                Votre numéro de téléphone
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="034 XX XXX XX"
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl text-base focus:outline-none focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 bg-gray-50 focus:bg-white"
                required
              />
            </div>

            {/* Référence */}
            <div>
              <label className="block text-base font-bold text-gray-900 mb-3 flex items-center">
                <Ticket className="h-5 w-5 mr-2 text-red-600" />
                Référence de transaction MVola
              </label>
              <input
                type="text"
                value={mvolaReference}
                onChange={(e) => setMvolaReference(e.target.value)}
                placeholder="Ex: MP240521.XXXX.XXXXX"
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl text-base focus:outline-none focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 bg-gray-50 focus:bg-white"
                required
              />
              <p className="text-xs text-gray-500 mt-2 flex items-center">
                <Info className="h-3 w-3 mr-1" />
                Vous recevrez cette référence par SMS après votre paiement MVola
              </p>
            </div>
          </div>

          {/* Avertissement */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4">
            <div className="flex items-start">
              <Clock className="h-5 w-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-bold text-amber-900">Activation sous 24h</p>
                <p className="text-amber-800 mt-1">Notre équipe vérifiera votre paiement et activera votre abonnement dans les 24 heures ouvrées.</p>
              </div>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 transition-all duration-300 disabled:opacity-50"
              disabled={processing}
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={processing}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-700 hover:via-pink-700 hover:to-rose-700 text-white font-black py-4 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              {processing ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Confirmer le paiement
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ========================================
// COMPOSANT CARTE DE PLAN - AVEC LOGIQUE INTELLIGENTE
// ========================================
const PlanCard = ({ 
  plan, 
  planId, 
  isSelected, 
  onSelect, 
  isPopular = false, 
  billingPeriod = 'monthly', 
  ticketQuantity = 1, 
  onTicketQuantityChange,
  subscriptionStatus = null // ← NOUVEAU
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const calculatePrice = () => {
    if (planId === 'candidate_ticket') {
      return plan.ticketPrice * ticketQuantity;
    }
    return billingPeriod === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
  };

  const calculateMessagesCount = () => {
    if (planId === 'candidate_ticket') {
      return plan.baseMessages * ticketQuantity;
    }
    return null;
  };

  // ✅ LOGIQUE INTELLIGENTE
  const isCurrentPlan = subscriptionStatus?.reason === 'current';
  const isDowngrade = subscriptionStatus?.reason === 'downgrade';
  const isUpgrade = subscriptionStatus?.reason === 'upgrade';
  const isDisabled = !subscriptionStatus?.canSubscribe;

  return (
    <div
      className={`relative cursor-pointer group transition-all duration-700 ease-out ${
        isDisabled ? 'opacity-60 cursor-not-allowed' : ''
      } ${
        isSelected ? 'scale-[1.03] z-30' : 'hover:scale-[1.02] z-10'
      }`}
      onMouseEnter={() => !isDisabled && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => !isDisabled && onSelect(planId)}
    >
      {/* Glow Effect */}
      <div className={`absolute -inset-4 rounded-[2rem] opacity-0 blur-xl transition-all duration-700 ${
        isSelected 
          ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 opacity-30 animate-pulse' 
          : isHovered && !isDisabled
          ? 'bg-gradient-to-r from-amber-300 via-orange-400 to-amber-500 opacity-20' 
          : ''
      }`} />
      
      {/* Carte */}
      <div className={`relative bg-white rounded-[1.75rem] overflow-hidden transition-all duration-700 border backdrop-blur-xl ${
        isDisabled
          ? 'border-gray-200 shadow-lg bg-gray-50'
          : isSelected 
          ? 'border-amber-400 shadow-2xl shadow-amber-500/25' 
          : isHovered
          ? 'border-amber-200 shadow-xl shadow-orange-500/10'
          : 'border-gray-100 shadow-lg'
      }`}>
        
        {/* Badge ACTUEL / RECOMMANDÉ / UPGRADE */}
        {(isPopular || isCurrentPlan || isUpgrade || isDowngrade) && (
          <div className={`absolute -top-2 -right-2 z-20 transition-all duration-500 ${
            isHovered && !isDisabled ? 'scale-110 rotate-3' : ''
          }`}>
            {isCurrentPlan && (
              <div className="bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 text-white px-4 py-2 rounded-xl shadow-lg border-2 border-white">
                <span className="text-sm font-black flex items-center">
                  <BadgeCheck className="h-4 w-4 mr-1 fill-current" />
                  VOTRE PLAN ACTUEL
                </span>
              </div>
            )}
            {isDowngrade && (
              <div className="bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600 text-white px-4 py-2 rounded-xl shadow-lg border-2 border-white">
                <span className="text-sm font-black flex items-center">
                  <TrendingDown className="h-4 w-4 mr-1" />
                  DÉGRADATION
                </span>
              </div>
            )}
            {isUpgrade && !isCurrentPlan && (
              <div className="bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 text-white px-4 py-2 rounded-xl shadow-lg border-2 border-white">
                <span className="text-sm font-black flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  UPGRADE
                </span>
              </div>
            )}
            {isPopular && !isCurrentPlan && !isUpgrade && !isDowngrade && (
              <div className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-white px-4 py-2 rounded-xl shadow-lg border-2 border-white">
                <span className="text-sm font-black flex items-center">
                  <Star className="h-4 w-4 mr-1 fill-current animate-pulse" />
                  RECOMMANDÉ
                </span>
              </div>
            )}
          </div>
        )}

        {/* Header */}
        <div className={`relative p-6 transition-all duration-700 ${
          isDisabled
            ? 'bg-gray-100'
            : isSelected 
            ? 'bg-gradient-to-br from-amber-500 via-orange-500 to-red-500'
            : isHovered 
            ? 'bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50' 
            : 'bg-gray-50'
        }`}>
          
          <div className="relative z-10 flex items-center justify-between mb-4">
            <div className={`flex items-center justify-center w-16 h-16 rounded-2xl transition-all duration-700 ${
              isDisabled
                ? 'bg-gray-200 text-gray-400'
                : isSelected 
                ? 'bg-white text-amber-600 scale-110 shadow-lg rotate-3' 
                : isHovered
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white scale-105 rotate-1'
                : 'bg-white text-gray-600 border-2 border-gray-200'
            }`}>
              <plan.icon className={`transition-all duration-500 ${
                isSelected || isHovered ? 'h-8 w-8' : 'h-7 w-7'
              }`} />
            </div>
            
            {isSelected && !isDisabled && (
              <div className="flex items-center text-white animate-fadeIn">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-2">
                  <Check className="h-4 w-4" />
                </div>
                <span className="font-bold text-sm">Sélectionné</span>
              </div>
            )}
          </div>

          <h3 className={`text-2xl font-black mb-2 transition-all duration-500 ${
            isDisabled ? 'text-gray-500' : isSelected ? 'text-white' : 'text-gray-900'
          }`}>
            {plan.name}
          </h3>
          
          <p className={`mb-4 leading-relaxed text-base ${
            isDisabled ? 'text-gray-400' : isSelected ? 'text-white/90' : 'text-gray-700'
          }`}>
            {plan.description}
          </p>
          
          {/* Prix */}
          <div className="flex items-baseline mb-3">
            <div className="flex flex-col items-start">
              <div className="flex items-baseline">
                <span className={`text-3xl font-black ${
                  isDisabled ? 'text-gray-400' : isSelected ? 'text-white' : 'text-gray-900'
                }`}>
                  {calculatePrice().toLocaleString()}
                </span>
                <span className={`text-2xl ml-2 font-black ${
                  isDisabled ? 'text-gray-400' : isSelected ? 'text-white/80' : 'text-amber-600'
                }`}>{plan.currency}</span>
              </div>
              <div className={`text-sm font-medium mt-1 ${
                isDisabled ? 'text-gray-400' : isSelected ? 'text-white/80' : 'text-gray-600'
              }`}>
                {planId === 'candidate_ticket' 
                  ? `${ticketQuantity} ticket${ticketQuantity > 1 ? 's' : ''} /mois`
                  : billingPeriod === 'monthly' ? '/mois' : '/an'
                }
              </div>
            </div>
            
            {billingPeriod === 'annual' && planId !== 'candidate_ticket' && (
              <div className="ml-4 text-right w-full">
                <div className="bg-gradient-to-br from-green-400 to-emerald-500 text-white px-3 py-1.5 rounded-xl shadow-lg transform rotate-3">
                  <div className="text-xs font-black">Économisez</div>
                  <div className="text-sm font-black">
                    {((plan.monthlyPrice * 12 - plan.annualPrice) / 1000).toFixed(0)}k Ar
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quantité tickets */}
          {planId === 'candidate_ticket' && !isDisabled && (
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 mb-3 border-2 border-amber-200">
              <label className="block text-xs font-bold text-gray-900 mb-2">
                Nombre de tickets
              </label>
              <div className="flex items-center justify-between">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (ticketQuantity > 1) onTicketQuantityChange(ticketQuantity - 1);
                  }}
                  className="w-10 h-10 bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 disabled:opacity-50"
                  disabled={ticketQuantity <= 1}
                >
                  <Minus className="h-4 w-4 text-gray-700" />
                </button>
                
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-black text-gray-900">{ticketQuantity}</span>
                  <span className="text-xs text-gray-600 font-medium">ticket{ticketQuantity > 1 ? 's' : ''}</span>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (ticketQuantity < 50) onTicketQuantityChange(ticketQuantity + 1);
                  }}
                  className="w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 disabled:opacity-50"
                  disabled={ticketQuantity >= 50}
                >
                  <Plus className="h-4 w-4 text-white" />
                </button>
              </div>
              
              {ticketQuantity >= 10 && (
                <div className="mt-2 bg-green-100 border border-green-300 rounded-lg p-2 text-center">
                  <span className="text-green-800 font-bold text-xs flex items-center justify-center">
                    <Gift className="h-3 w-3 mr-1" />
                    Super choix !
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Fonctionnalités */}
        <div className="p-6">
          <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <div className={`w-5 h-5 rounded-lg mr-2 flex items-center justify-center transition-all duration-500 ${
              isDisabled
                ? 'bg-gray-300'
                : isSelected 
                ? 'bg-gradient-to-r from-amber-400 to-orange-500' 
                : 'bg-gradient-to-r from-amber-500 to-orange-600'
            }`}>
              <Sparkles className="h-3 w-3 text-white" />
            </div>
            Fonctionnalités
          </h4>
          
          <ul className="space-y-3 mb-6">
            {plan.features.slice(0, 6).map((feature, index) => {
              let displayText = feature.text;
              let dynamicHighlight = feature.highlight;
              
              if (planId === 'candidate_ticket' && feature.text.includes('Messages')) {
                displayText = `Messages pour ${calculateMessagesCount()} recruteurs`;
                dynamicHighlight = `${calculateMessagesCount()}x`;
              }
              
              return (
                <li 
                  key={index} 
                  className={`flex items-start group/item transition-all duration-300 hover:translate-x-1 ${
                    isDisabled ? 'opacity-40' : feature.included ? 'opacity-100' : 'opacity-60'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-0.5 transition-all duration-300 ${
                    isDisabled
                      ? 'bg-gray-200 text-gray-400'
                      : feature.included 
                      ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md group-hover/item:scale-110' 
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {feature.included ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  </div>
                  <div className="flex-1">
                    <span className={`font-medium text-sm ${
                      isDisabled ? 'text-gray-400' : feature.included ? 'text-gray-800' : 'text-gray-400'
                    }`}>
                      {displayText}
                    </span>
                    {dynamicHighlight && !isDisabled && (
                      <span className="ml-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                        {dynamicHighlight}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Bouton sélection */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!isDisabled) onSelect(planId);
            }}
            disabled={isDisabled}
            className={`w-full relative overflow-hidden py-4 font-black text-base rounded-xl transition-all duration-500 group ${
              isDisabled
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : isSelected
                ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-white shadow-xl transform scale-105 hover:shadow-2xl'
                : 'bg-gray-900 text-white hover:bg-gray-800 shadow-lg hover:shadow-xl hover:scale-[1.02]'
            }`}
          >
            <span className="relative z-10 flex items-center justify-center">
              {isCurrentPlan ? (
                <>
                  <BadgeCheck className="h-5 w-5 mr-2" />
                  Votre plan actuel
                </>
              ) : isDowngrade ? (
                <>
                  <TrendingDown className="h-5 w-5 mr-2" />
                  Dégradation impossible
                </>
              ) : isSelected ? (
                <>
                  <Check className="h-5 w-5 mr-2" />
                  Sélectionné
                </>
              ) : (
                <>
                  Choisir ce plan
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </>
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ========================================
// COMPOSANT PRINCIPAL - AVEC LOGIQUE INTELLIGENTE
// ========================================
const CandidatePremiumSubscription = () => {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState('candidate_pro');
  const [billingPeriod, setBillingPeriod] = useState('monthly'); 
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [step, setStep] = useState(1);
  const [stripePromise] = useState(() => getStripe());
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [showMVolaModal, setShowMVolaModal] = useState(false);
  const continueButtonRef = useRef(null);
  
  // ✅ NOUVEAU : États pour abonnement actuel
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [planStatuses, setPlanStatuses] = useState({});
   
  const plans = {
    candidate_pro: {
      name: 'Candidat PRO',
      description: 'Boostez votre recherche avec des outils avancés.',
      monthlyPrice: 15000,
      annualPrice: 160000,
      currency: 'Ariary',
      popular: true,
      icon: Crown,
      features: [
        { text: 'Messages directs pour 10 recruteurs', included: true, highlight: 'DIRECT' },
        { text: 'Mise en avant candidatures', included: true, highlight: 'PRIORITÉ' },
        { text: 'Profil mis en avant', included: true },
        { text: 'Statut temps réel', included: true },
        { text: 'Recommandations personnalisées', included: true },
        { text: 'Statistiques', included: true },
      ]
    },
    candidate_plus: {
      name: 'Candidat PLUS+',
      description: 'Solution complète avec accompagnement.',
      monthlyPrice: 25000,
      annualPrice: 280000,
      currency: 'Ariary',
      popular: false,
      icon: Diamond,
      features: [
        { text: 'Tout PRO inclus', included: true, highlight: 'COMPLET' },
        { text: 'Support email prioritaire', included: true, highlight: '24H' },
        { text: 'Coaching carrière', included: true, highlight: 'VIP' },
        { text: 'Offres exclusives', included: true },
        { text: 'Assistance CV', included: true },
        { text: 'Matching IA', included: true },
      ]
    },
    candidate_ticket: {
      name: 'Ticket Crédit',
      description: 'Solution flexible mensuelle.',
      ticketPrice: 8000,
      baseMessages: 5,
      currency: 'Ariary',
      popular: false,
      icon: Ticket,
      features: [
        { text: 'Messages directs pour 5 recruteurs', included: true, highlight: 'DIRECT' },
        { text: 'Mise en avant', included: true },
        { text: 'Profil en avant', included: true },
        { text: 'Statut temps réel', included: true },
        { text: 'Recommandations', included: true },
        { text: 'Statistiques', included: true },
      ]
    }
  };

  // ✅ RÉCUPÉRER L'ABONNEMENT ACTUEL AU CHARGEMENT
  useEffect(() => {
    const fetchCurrentSubscription = async () => {
      if (!user?.$id) return;

      try {
        setLoading(true);
        const subscription = await getActiveSubscription(user.$id);
        setCurrentSubscription(subscription);

        // Calculer les statuts pour chaque plan
        const statuses = {};
        Object.keys(plans).forEach(planId => {
          statuses[planId] = canSubscribeToPlan(subscription, planId);
        });
        setPlanStatuses(statuses);

        console.log('📋 Abonnement actuel:', subscription);
        console.log('🔍 Statuts des plans:', statuses);

      } catch (error) {
        console.error('Erreur récupération abonnement:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentSubscription();
  }, [user]);

  const handlePlanSelect = (planId) => {
    // Vérifier si le plan est disponible
    if (planStatuses[planId]?.canSubscribe) {
      setSelectedPlan(planId);
      if (window.innerWidth <= 768 && continueButtonRef.current) {
        setTimeout(() => {
          continueButtonRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    } else {
      toast.error('Ce plan n\'est pas disponible');
    }
  };

  const handlePaymentSuccess = () => {
    setShowStripeModal(false);
    setShowMVolaModal(false);
    setStep(3);
  };

  const calculateTotalPrice = () => {
    if (selectedPlan === 'candidate_ticket') {
      return plans[selectedPlan].ticketPrice * ticketQuantity;
    }
    return billingPeriod === 'monthly' 
      ? plans[selectedPlan]?.monthlyPrice 
      : plans[selectedPlan]?.annualPrice;
  };

  // Afficher loader pendant récupération abonnement
  if (loading) {
    return (
      <ProtectedRoute isPublic={false} requireAuth={true}>
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
          <Navbar />
          <div className="text-center">
            <Loader className="h-12 w-12 animate-spin text-amber-600 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Chargement...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute isPublic={false} requireAuth={true}>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        
        <Navbar />
        <div style={{ height: '130px' }}></div>
        
        {/* Header */}
        <section className="relative bg-gradient-to-r from-red-500 to-red-600 pt-20 pb-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-amber-900 to-orange-900" />
          
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='m0 0h40v40h-40z'/%3E%3Cpath d='m40 40h40v40h-40z'/%3E%3C/g%3E%3C/svg%3E")`
          }} />
          
          <div className="relative  z-10 max-w-7xl mx-auto px-4 text-center text-white">
            <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
              Candidat{' '}
              <span className="bg-black bg-clip-text text-transparent">
                Premium
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-amber-100 mb-8 max-w-3xl mx-auto">
              Multipliez vos chances de succès
            </p>
            
            {/* Steps */}
            <div className="flex items-center justify-center space-x-8 mb-8">
              {[
                { num: 1, label: 'Choisir', icon: MousePointer },
                { num: 2, label: 'Payer', icon: CreditCard },
                { num: 3, label: 'Réussir', icon: Rocket }
              ].map(({ num, label, icon: Icon }) => (
                <div key={num} className="flex flex-col items-center">
                  <div className={`relative flex items-center justify-center w-16 h-16 rounded-2xl border-2 transition-all duration-500 ${
                    step >= num 
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white border-transparent shadow-2xl' 
                      : 'border-amber-300 text-amber-300'
                  }`}>
                    {step > num ? <Check className="h-8 w-8" /> : <Icon className="h-8 w-8" />}
                  </div>
                  <span className={`mt-2 text-sm font-bold ${
                    step >= num ? 'text-white' : 'text-amber-300'
                  }`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* Badge abonnement actuel */}
            {currentSubscription && (
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mt-4">
                <BadgeCheck className="h-5 w-5 text-green-400 mr-2" />
                <span className="text-white font-bold">
                  Abonné actuellement : {plans[currentSubscription.subscription_type]?.name}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Contenu */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          
          {/* ÉTAPE 1: Choix du plan */}
          {step === 1 && (
            <div className="animate-slideUp">
              
              <div className="text-center mb-12">
                <h2 className="text-4xl font-black text-gray-900 mb-3">
                  Choisissez votre formule
                </h2>
                <p className="text-xl text-gray-700">
                  Solutions adaptées à chaque budget
                </p>
              </div>

              {/* Toggle mensuel/annuel */}
              {selectedPlan !== 'candidate_ticket' && (
                <div className="flex justify-center mb-12">
                  <div className="bg-white rounded-2xl p-2 shadow-xl border-2 border-amber-200">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setBillingPeriod('monthly')}
                        className={`px-8 py-3 rounded-xl font-black transition-all ${
                          billingPeriod === 'monthly'
                            ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        Mensuel
                      </button>
                      <button
                        onClick={() => setBillingPeriod('annual')}
                        className={`px-8 py-3 rounded-xl font-black transition-all relative ${
                          billingPeriod === 'annual'
                            ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        Annuel
                        <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                          -12%
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Plans - AVEC LOGIQUE INTELLIGENTE */}
              <div className="grid lg:grid-cols-3 gap-8 mb-12">
                {Object.entries(plans).map(([planId, plan]) => (
                  <PlanCard
                    key={planId}
                    plan={plan}
                    planId={planId}
                    isSelected={selectedPlan === planId}
                    onSelect={handlePlanSelect}
                    isPopular={plan.popular}
                    billingPeriod={billingPeriod}
                    ticketQuantity={ticketQuantity}
                    onTicketQuantityChange={setTicketQuantity}
                    subscriptionStatus={planStatuses[planId]} // ← NOUVEAU
                  />
                ))}
              </div>

              {/* Bouton continuer */}
              <div className="text-center" ref={continueButtonRef}>
                <button
                  onClick={() => setStep(2)}
                  disabled={!selectedPlan || !planStatuses[selectedPlan]?.canSubscribe}
                  className="px-16 py-5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white text-xl font-black rounded-2xl shadow-2xl transition-all duration-500 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <span className="flex items-center justify-center">
                    Continuer vers le paiement
                    <ChevronRight className="h-6 w-6 ml-3 group-hover:translate-x-2 transition-transform" />
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* ÉTAPE 2: Choix mode de paiement */}
          {step === 2 && (
            <div className="animate-slideUp max-w-4xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-4xl font-black text-gray-900 mb-3">
                  Choisissez votre mode de paiement
                </h2>
                <p className="text-xl text-gray-700">
                  Sélectionnez la méthode qui vous convient
                </p>
              </div>

              {/* Récapitulatif */}
              <div className="bg-white rounded-3xl shadow-2xl border-2 border-gray-100 p-8 mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-gray-900">{plans[selectedPlan]?.name}</h3>
                    <p className="text-gray-600 mt-1">
                      {selectedPlan === 'candidate_ticket' 
                        ? `${ticketQuantity} ticket${ticketQuantity > 1 ? 's' : ''} par mois`
                        : billingPeriod === 'monthly' ? 'Abonnement mensuel' : 'Abonnement annuel'
                      }
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-black text-amber-600">
                      {calculateTotalPrice().toLocaleString()}
                    </div>
                    <div className="text-gray-600">Ariary</div>
                  </div>
                </div>
              </div>

              {/* Options de paiement */}
              <div className="grid md:grid-cols-2 gap-6">
                
                {/* Carte Bancaire */}
                <button
                  onClick={() => setShowStripeModal(true)}
                  className="group bg-white rounded-3xl shadow-xl border-2 border-gray-100 hover:border-purple-300 p-8 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl text-left"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-16 h-16  rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-pink-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <img src="/cbb.png" alt="MVola" className="w-12 h-12 object-contain" />
                    </div>
                    </div>
                    <ChevronRight className="h-6 w-6 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-2 transition-all" />
                  </div>
                  
                  <h3 className="text-2xl font-black text-gray-900 mb-2">Carte Bancaire</h3>
                  <p className="text-gray-600 mb-4">Paiement instantané sécurisé</p>
                  
                  <div className="flex items-center text-sm text-green-600 font-bold">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Activation immédiate
                  </div>
                </button>

                {/* MVola */}
                <button
                  onClick={() => setShowMVolaModal(true)}
                  className="group bg-white rounded-3xl shadow-xl border-2 border-gray-100 hover:border-red-300 p-8 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl text-left"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-pink-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <img src="/mvola.png" alt="MVola" className="w-12 h-12 object-contain" />
                    </div>
                    <ChevronRight className="h-6 w-6 text-gray-400 group-hover:text-red-600 group-hover:translate-x-2 transition-all" />
                  </div>
                  
                  <h3 className="text-2xl font-black text-gray-900 mb-2">MVola</h3>
                  <p className="text-gray-600 mb-4">Paiement mobile Madagascar</p>
                  
                  <div className="flex items-center text-sm text-amber-600 font-bold">
                    <Clock className="h-4 w-4 mr-2" />
                    Activation sous 24h
                  </div>
                </button>
              </div>

              {/* Bouton retour */}
              <div className="text-center mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 transition-all duration-300"
                >
                  ← Retour au choix du plan
                </button>
              </div>
            </div>
          )}

          {/* ÉTAPE 3: Confirmation - MESSAGE CORRIGÉ POUR CB */}
          {step === 3 && (
            <div className="max-w-3xl mx-auto animate-slideUp">
              <div className="bg-white rounded-3xl shadow-2xl border-2 border-gray-100 p-12 text-center">
                
                <div className="relative mb-10">
                  <div className="w-28 h-28 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
                    <CheckCircle className="h-16 w-16 text-white" />
                  </div>
                </div>

                <h2 className="text-4xl font-black text-gray-900 mb-6">
                  🎉 Paiement réussi !
                </h2>
                
                <p className="text-xl text-gray-700 mb-8">
                  Votre compte est maintenant Premium ! Profitez de tous vos avantages dès maintenant.
                </p>

                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 mb-8 border-2 border-amber-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-3xl mb-2">✅</div>
                      <div className="font-bold text-gray-900">Plan: {plans[selectedPlan]?.name}</div>
                    </div>
                    <div>
                      <div className="text-3xl mb-2">💰</div>
                      <div className="font-bold text-gray-900">{calculateTotalPrice().toLocaleString()} Ar</div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => window.location.href = '/dashboard'}
                  className="px-12 py-5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white text-xl font-black rounded-2xl shadow-xl transition-all hover:scale-105"
                >
                  Retour au tableau de bord
                  <ArrowRight className="inline-block h-6 w-6 ml-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <Elements stripe={stripePromise}>
        <StripePaymentModal
          isOpen={showStripeModal}
          onClose={() => setShowStripeModal(false)}
          selectedPlan={selectedPlan}
          billingPeriod={billingPeriod}
          ticketQuantity={ticketQuantity}
          plans={plans}
          user={user}
          onSuccess={handlePaymentSuccess}
        />
      </Elements>

      <MVolaPaymentModal
        isOpen={showMVolaModal}
        onClose={() => setShowMVolaModal(false)}
        selectedPlan={selectedPlan}
        billingPeriod={billingPeriod}
        ticketQuantity={ticketQuantity}
        plans={plans}
        user={user}
        onSuccess={handlePaymentSuccess}
      />

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-slideUp { animation: slideUp 0.6s ease-out; }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
        .animate-shake { animation: shake 0.3s ease-out; }
        @media (max-width: 768px) {
          .lg\\:grid-cols-3, .lg\\:grid-cols-2 { grid-template-columns: 1fr; }
        }
      `}</style>
    </ProtectedRoute>
  );
};

export default CandidatePremiumSubscription;