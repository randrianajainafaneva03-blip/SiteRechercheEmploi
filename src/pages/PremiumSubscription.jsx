import React, { useState, useEffect, useRef } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { 
  notifyNewSubscriptionStripe, 
  notifyNewSubscriptionMVola 
} from '@/lib/telegram';
import { 
  Crown, Star, Check, X, Zap, Target, Users, Phone, Download, Eye,
  MessageSquare, TrendingUp, Shield, HeadphonesIcon, Award, Sparkles,
  ArrowRight, CreditCard, Lock, AlertCircle, CheckCircle, Gift, Clock,
  BarChart3, Bell, Wallet, Rocket, Diamond, MousePointer, Mail, Ticket,
  Plus, Minus, Briefcase, Copy, Info, UserCheck, Send, Loader,
  BadgeCheck, TrendingDown, ChevronRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import getStripe from '@/lib/stripe-client';
import StripePaymentService from '@/components/services/stripePaymentService';
import { getActiveSubscription, canSubscribeToPlan } from '@/services/subscriptionService';
import toast from 'react-hot-toast';

// ========================================
// MODAL PAIEMENT CARTE BANCAIRE
// ========================================
const StripePaymentModal = ({ isOpen, onClose, selectedPlan, billingPeriod, ticketQuantity, plans, user, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [cardholderName, setCardholderName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && !processing) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Bloquer scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset'; // Débloquer scroll
    };
  }, [isOpen, onClose, processing]);

  const calculateTotalPrice = () => {
    if (selectedPlan === 'recruiter_ticket') {
      return plans[selectedPlan].ticketPrice * ticketQuantity;
    }
    return billingPeriod === 'monthly' 
      ? plans[selectedPlan]?.monthlyPrice 
      : plans[selectedPlan]?.annualPrice;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!stripe || !elements) {
      setError('Stripe non chargé. Veuillez rafraîchir la page.');
      return;
    }

    if (!cardholderName.trim()) {
      setError('Veuillez entrer le nom du titulaire de la carte');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Élément de carte non trouvé');
      return;
    }

    try {
      setProcessing(true);

      const planData = {
        type: selectedPlan,
        price: calculateTotalPrice(),
        billingPeriod: billingPeriod,
        name: plans[selectedPlan].name
      };

      const userData = {
        id: user.$id,
        email: user.email,
        name: user.name || cardholderName
      };

      const paymentResult = await StripePaymentService.createPaymentIntent(planData, userData);
      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Erreur création paiement');
      }

      const confirmResult = await StripePaymentService.confirmPayment(
        cardElement,
        paymentResult.clientSecret,
        paymentResult.paymentIntentId,
        user.$id,
        cardholderName
      );

      if (!confirmResult.success) {
        throw new Error(confirmResult.error || 'Erreur confirmation paiement');
      }
      
      // Notification gérée côté serveur (confirm-payment)
      
      toast.success('🎉 Paiement réussi ! Votre compte Premium est actif !');
      onSuccess(confirmResult);

    } catch (error) {
      setError(error.message || 'Une erreur est survenue');
      toast.error(error.message || 'Erreur lors du paiement');
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget && !processing) {
              onClose();
            }
          }}
        >
      <div 
          className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp"
          onClick={(e) => e.stopPropagation()}
        >
        <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 p-8 relative overflow-hidden">
          <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
            <X className="h-5 w-5 text-white" />
          </button>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
              <CreditCard className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-black text-white mb-2">Paiement par Carte Bancaire</h2>
            <p className="text-white/90 text-lg">Paiement sécurisé vers notre société mère DAT-CORP DIGITAL LTD</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-black text-gray-900">{plans[selectedPlan]?.name}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedPlan === 'recruiter_ticket' 
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
                <p>Vos données bancaires sont cryptées et ne sont jamais stockées.</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-start animate-shake">
              <AlertCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold text-red-800">Erreur de paiement</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

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

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && !processing) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Bloquer scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset'; // Débloquer scroll
    };
  }, [isOpen, onClose, processing]);

  const MVOLA_NUMBER = '034 26 126 52';
  const MVOLA_NAME = 'TDI DIGITAL MG';

  const calculateTotalPrice = () => {
    if (selectedPlan === 'recruiter_ticket') {
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
  
      // ✅ 1. NOTIFICATION TELEGRAM D'ABORD
      console.log('📱 Envoi notification Telegram...');
      try {
        await notifyNewSubscriptionMVola({
          user_name: user.name || 'Utilisateur',
          user_email: user.email,
          plan_name: plans[selectedPlan]?.name,
          amount: calculateTotalPrice(),
          billing_period: billingPeriod,
          phone_number: phoneNumber,
          mvola_reference: mvolaReference,
          ticket_quantity: selectedPlan === 'recruiter_ticket' ? ticketQuantity : undefined
        });
        console.log('✅ Notification Telegram MVola envoyée');
      } catch (telegramError) {
        console.warn('⚠️ Erreur notification Telegram (non bloquant):', telegramError);
      }
  
      // 2. PUIS EMAIL SUPPORT
      console.log('📧 Envoi email support...');
      const formData = new FormData();
      formData.append('name', user.name || 'Utilisateur');
      formData.append('email', user.email);
      formData.append('category', 'Abonnement Premium Employeur - MVola');
      formData.append('subject', `Activation Premium Employeur - ${plans[selectedPlan]?.name}`);
      formData.append('priority', 'high');
      formData.append('message', `
  Demande d'activation Premium EMPLOYEUR
  
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
  
      if (!response.ok) {
        console.warn('⚠️ Erreur envoi email (non bloquant)');
      } else {
        console.log('✅ Email support envoyé');
      }
  
      toast.success('✅ Demande envoyée ! Activation sous 24h.');
      onSuccess({ manual: true });
      
    } catch (error) {
      console.error('❌ Erreur:', error);
      toast.error('Erreur envoi. Contactez support@job2mada.com');
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
            <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget && !processing) {
              onClose();
            }
          }}
        >
      <div 
          className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp"
          onClick={(e) => e.stopPropagation()}
        >
        <div className="bg-job-purple p-8 relative overflow-hidden">
          <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
            <X className="h-5 w-5 text-white" />
          </button>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
              <img src="/mvola.png" alt="MVola" className="w-12 h-12 object-contain" />
            </div>
            <h2 className="text-3xl font-black text-white mb-2">Paiement MVola</h2>
            <p className="text-white/90 text-lg">Paiement mobile sécurisé</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-black text-gray-900">{plans[selectedPlan]?.name}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedPlan === 'recruiter_ticket' 
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

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6">
            <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center">
              <Info className="h-5 w-5 mr-2 text-blue-600" />
              Instructions de paiement
            </h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-black text-sm mr-4 flex-shrink-0">1</div>
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
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-black text-sm mr-4 flex-shrink-0">2</div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 mb-2">Entrez la référence MVola</p>
                  <p className="text-sm text-gray-600">Après paiement, saisissez la référence de transaction.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
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
            <div>
              <label className="block text-base font-bold text-gray-900 mb-3 flex items-center">
                <Ticket className="h-5 w-5 mr-2 text-red-600" />
                Référence de transaction MVola
              </label>
              <input
                type="text"
                value={mvolaReference}
                onChange={(e) => setMvolaReference(e.target.value)}
                placeholder="Ex: 123456789"
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl text-base focus:outline-none focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 bg-gray-50 focus:bg-white"
                required
              />
              <p className="text-xs text-gray-500 mt-2 flex items-center">
                <Info className="h-3 w-3 mr-1" />
                Vous recevrez cette référence par SMS après votre paiement MVola
              </p>
            </div>
          </div>

          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4">
            <div className="flex items-start">
              <Clock className="h-5 w-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-bold text-amber-900">Activation sous 24h</p>
                <p className="text-amber-800 mt-1">Notre équipe vérifiera votre paiement et activera votre abonnement dans les 24 heures ouvrées.</p>
              </div>
            </div>
          </div>

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
              className="flex-1 bg-job-blue hover:from-red-700 hover:via-pink-700 hover:to-rose-700 text-white font-black py-4 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
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
// COMPOSANT PRINCIPAL - CARTE DE PLAN
// ========================================
const PlanCard = ({ plan, planId, isSelected, onSelect, isPopular = false, billingPeriod = 'monthly', ticketQuantity = 1, onTicketQuantityChange }) => {
  const [isHovered, setIsHovered] = useState(false);

  const calculatePrice = () => {
    if (planId === 'recruiter_ticket') {
      return plan.ticketPrice * ticketQuantity;
    }
    return billingPeriod === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
  };

  const calculateOffersCount = () => {
    if (planId === 'recruiter_ticket') {
      return plan.baseOffers * ticketQuantity;
    }
    return null;
  };

  const calculateMessagesCount = () => {
    if (planId === 'recruiter_ticket') {
      return plan.baseMessages * ticketQuantity;
    }
    return null;
  };

  return (
    <div
      className={`relative cursor-pointer group transition-all duration-700 ease-out ${
        isSelected ? 'scale-[1.03] z-30' : 'hover:scale-[1.02] z-10'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(planId)}
    >
      <div className={`absolute -inset-4 rounded-[2rem] opacity-0 blur-xl transition-all duration-700 ${
        isSelected 
          ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 opacity-30 animate-pulse' 
          : isHovered 
          ? 'bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 opacity-20' 
          : ''
      }`} />
      
      <div className={`relative bg-white rounded-[1.75rem] overflow-hidden transition-all duration-700 border backdrop-blur-xl ${
        isSelected 
          ? 'border-amber-300 shadow-2xl shadow-amber-500/25' 
          : isHovered
          ? 'border-gray-200 shadow-xl shadow-purple-500/10'
          : 'border-gray-100 shadow-lg'
      }`}>
        
        {isPopular && (
          <div className={`absolute -top-2 -right-2 z-20 transition-all duration-500 ${
            isHovered ? 'scale-110 rotate-3' : ''
          }`}>
            <div className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-white px-4 py-2 rounded-xl shadow-lg border-2 border-white">
              <span className="text-sm font-black flex items-center tracking-wide">
                <Star className="h-4 w-4 mr-1 fill-current animate-pulse" />
                RECOMMANDÉ
              </span>
            </div>
          </div>
        )}

        <div className={`relative p-8 transition-all duration-700 ${
          isSelected 
            ? 'bg-gradient-to-br from-job-purple to-job-pink'
            : isHovered 
            ? 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50' 
            : 'bg-gray-50'
        }`}>
          
          <div className="absolute inset-0 opacity-5">
            <div className="w-full h-full bg-gradient-to-br from-transparent via-black/5 to-transparent" />
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-current rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>

          <div className="relative z-10 flex items-center justify-between mb-6">
            <div className={`flex items-center justify-center w-20 h-20 rounded-2xl transition-all duration-700 ${
              isSelected 
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white scale-110 shadow-lg rotate-3' 
                : isHovered
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white scale-105 rotate-1'
                : 'bg-white text-gray-600 border-2 border-gray-200'
            }`}>
              <plan.icon className={`transition-all duration-500 ${
                isSelected || isHovered ? 'h-10 w-10' : 'h-8 w-8'
              }`} />
            </div>
            
            {isSelected && (
              <div className="flex items-center text-amber-600 animate-fadeIn">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mr-3">
                  <Check className="h-5 w-5" />
                </div>
                <span className="font-bold text-lg">Sélectionné</span>
              </div>
            )}
          </div>

          <h3 className={`text-3xl font-black mb-3 transition-all duration-500 ${
            isSelected ? 'text-amber-900' : isHovered ? 'text-purple-900' : 'text-gray-900'
          }`}>
            {plan.name}
          </h3>
          
          <p className="text-gray-700 mb-6 leading-relaxed text-lg">
            {plan.description}
          </p>
          
          <div className="flex items-baseline mb-4">
            <div className="flex flex-col items-start">
              <div className="flex items-baseline">
                <span className={`text-4xl font-black transition-colors duration-500 bg-gradient-to-br from-job-purple to-job-pink text-white`} style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif", letterSpacing: '-0.02em' }}>
                  {calculatePrice().toLocaleString()}
                </span>
                <span className="text-3xl ml-2 text-job-gold font-black">{plan.currency}</span>
              </div>
              <div className="text-lg text-white font-medium mt-1">
                {planId === 'recruiter_ticket' 
                  ? `${ticketQuantity} ticket${ticketQuantity > 1 ? 's' : ''} /mois`
                  : billingPeriod === 'monthly' ? '/mois' : '/an'
                }
              </div>
            </div>
            
            {billingPeriod === 'annual' && planId !== 'recruiter_ticket' && (
              <div className="ml-6 text-right w-full">
                <div className="bg-gradient-to-br from-green-400 to-emerald-500 text-black px-4 py-2 rounded-2xl shadow-lg transform rotate-3">
                  <div className="text-sm font-black">Économisez</div>
                  <div className="text-lg font-black">
                    {((plan.monthlyPrice * 12 - plan.annualPrice) / 1000).toFixed(0)}k Ar
                  </div>
                </div>
              </div>
            )}
          </div>

          {planId === 'recruiter_ticket' && (
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 mb-3 border-2 border-amber-200">
              <label className="block text-xs font-bold text-gray-900 mb-2">
                Nombre de tickets mensuels
              </label>
              <div className="flex items-center justify-between">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (ticketQuantity > 1) {
                      onTicketQuantityChange(ticketQuantity - 1);
                    }
                  }}
                  className="w-10 h-10 bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    if (ticketQuantity < 50) {
                      onTicketQuantityChange(ticketQuantity + 1);
                    }
                  }}
                  className="w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={ticketQuantity >= 50}
                >
                  <Plus className="h-4 w-4 text-white" />
                </button>
              </div>
              
              {ticketQuantity >= 10 && (
                <div className="mt-2 bg-green-100 border border-green-300 rounded-lg p-2 text-center">
                  <span className="text-green-800 font-bold text-xs flex items-center justify-center">
                    <Gift className="h-3 w-3 mr-1" />
                    Super choix ! Volume optimal
                  </span>
                </div>
              )}
              
              <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-2">
                <p className="text-blue-800 text-xs font-medium text-center">
                  💡 Renouvelable chaque mois - Achetez autant de tickets que nécessaire
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="p-8">
          <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <div className={`w-6 h-6 rounded-lg mr-3 flex items-center justify-center transition-all duration-500 ${
              isSelected 
                ? 'bg-gradient-to-r from-amber-400 to-orange-500' 
                : 'bg-gradient-to-r from-blue-500 to-purple-600'
            }`}>
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            Fonctionnalités incluses
          </h4>
          
          <ul className="space-y-4 mb-8">
            {plan.features.map((feature, index) => {
              let displayText = feature.text;
              let dynamicHighlight = feature.highlight;
              
              if (planId === 'recruiter_ticket') {
                if (feature.text.includes('Offre supplémentaires')) {
                  displayText = `${calculateOffersCount()} Offres supplémentaires à la une pendant 2 jours`;
                  dynamicHighlight = `${calculateOffersCount()}x OFFRES`;
                } else if (feature.text.includes('Contact direct')) {
                  displayText = `Contact direct message à ${calculateMessagesCount()} candidats`;
                  dynamicHighlight = `${calculateMessagesCount()}x DIRECT`;
                } else if (feature.text.includes('Voir les contacts')) {
                  displayText = `Voir les contacts et CV de ${calculateMessagesCount()} candidats`;
                }
              }
              
              return (
                <li 
                  key={index} 
                  className={`flex items-start group/item transition-all duration-300 hover:translate-x-1 ${
                    feature.included ? 'opacity-100' : 'opacity-60'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center mr-4 mt-0.5 transition-all duration-300 ${
                    feature.included 
                      ? 'bg-gradient-to-br from-job-purple to-job-pink text-white shadow-md group-hover/item:scale-110' 
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {feature.included ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <span className={`font-medium transition-colors duration-300 ${
                      feature.included ? 'text-gray-800 group-hover/item:text-gray-900' : 'text-gray-400'
                    }`}>
                      {displayText}
                    </span>
                    {dynamicHighlight && (
                      <span className="ml-3 bg-gradient-to-br from-job-gold via-job-orange to-job-dark-gold text-white px-2 py-1 rounded-full text-xs font-bold">
                        {dynamicHighlight}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          <div className={`relative overflow-hidden rounded-2xl p-6 mb-6 transition-all duration-500 ${
            isSelected 
              ? 'bg-gradient-to-br from-amber-100 via-orange-100 to-red-100 border border-amber-200' 
              : 'bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 border border-blue-200'
          }`}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent" />
            <div className="relative">
              <h5 className="font-bold text-gray-900 mb-4 flex items-center">
                <Target className={`h-5 w-5 mr-3 ${
                  isSelected ? 'text-amber-600' : 'text-blue-600'
                }`} />
                Parfait pour
              </h5>
              <ul className="space-y-2">
                {plan.idealFor.map((item, index) => (
                  <li key={index} className="text-gray-700 flex items-center font-medium">
                    <div className={`w-2 h-2 rounded-full mr-3 ${
                      isSelected ? 'bg-amber-500' : 'bg-blue-500'
                    }`} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(planId);
            }}
            className={`w-full relative overflow-hidden py-5 font-black text-lg rounded-2xl transition-all duration-500 group ${
              isSelected
                ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-white shadow-xl transform scale-105 hover:shadow-2xl'
                : 'bg-gray-900 text-white hover:bg-gray-800 shadow-lg hover:shadow-xl hover:scale-[1.02]'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-job-purple to-job-pink text-white transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <span className="relative z-10 flex items-center justify-center">
              {isSelected ? (
                <>
                  <Check className="h-6 w-6 mr-3" />
                  Plan sélectionné
                </>
              ) : (
                <>
                  Choisir ce plan
                  <ArrowRight className="h-6 w-6 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
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
// COMPOSANT PRINCIPAL
// ========================================
const EmployerPremiumSubscription = () => {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState('premium_pro');
  const [billingPeriod, setBillingPeriod] = useState('monthly'); 
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [step, setStep] = useState(1);
  const continueButtonRef = useRef(null);
  
  const [stripePromise] = useState(() => getStripe());
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [showMVolaModal, setShowMVolaModal] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(null);
   
  const plans = {
    premium_pro: {
      name: 'Premium Pro',
      description: 'Solution complète pour les entreprises en croissance qui veulent optimiser leur recrutement.',
      monthlyPrice: 30000,
      annualPrice: 340000,
      currency: 'Ariary',
      popular: true,
      icon: Crown,
      idealFor: [
        'PME et startups (5-50 employés)',
        'Recrutement régulier (2-5 postes/mois)',
        'Recherche de profils qualifiés',
        'Budget optimisé'
      ],
      features: [
        { 
          text: '5 Publication d\'offres à la une pendant 3 jours', 
          icon: Star, 
          included: true,
          highlight: 'TOP'
        },
        { 
          text: 'Badge "Urgent" sur vos offres', 
          icon: Zap, 
          included: true,
          highlight: 'VISIBLE'
        },
        { 
          text: 'Contact direct messages de 10 candidats', 
          icon: MessageSquare, 
          included: true 
        },
        { 
          text: 'Téléchargement des CV (PDF)', 
          icon: Download, 
          included: true 
        },
        { 
          text: 'Accès aux coordonnées candidats', 
          icon: Eye, 
          included: true 
        },
        { 
          text: 'Base de données prestataires', 
          icon: Users, 
          included: true 
        },
        { 
          text: 'Support email prioritaire', 
          icon: Shield, 
          included: true 
        },
        { 
          text: 'Analytics de base', 
          icon: BarChart3, 
          included: true 
        },
        { 
          text: 'Popup publicitaire', 
          icon: Bell, 
          included: false 
        },
        { 
          text: 'Chasseurs de têtes dédiés', 
          icon: HeadphonesIcon, 
          included: false 
        },
        { 
          text: 'Support téléphonique 24/7', 
          icon: Phone, 
          included: false 
        },
        { 
          text: 'Manager de compte personnel', 
          icon: Award, 
          included: false 
        }
      ]
    },
    premium_plus: {
      name: 'Premium Plus+',
      description: 'Solution premium pour les grandes entreprises avec des besoins de recrutement intensifs.',
      monthlyPrice: 50000,
      annualPrice: 570000,
      currency: 'Ariary',
      popular: false,
      icon: Diamond,
      idealFor: [
        'Grandes entreprises (50+ employés)',
        'Recrutement intensif (5+ postes/mois)',
        'Profils experts et dirigeants',
        'Service personnalisé premium'
      ],
      features: [
        { 
          text: 'Tout Premium Pro inclus + offre à la une passé à 7 jours + Contact direct messages passé à 15 candidats', 
          icon: Check, 
          included: true,
          highlight: 'COMPLET'
        },
        { 
          text: 'Popup publicitaire ciblée', 
          icon: Bell, 
          included: true,
          highlight: 'EXCLUSIF'
        },
        { 
          text: 'Chasseurs de têtes dédiés', 
          icon: HeadphonesIcon, 
          included: true,
          highlight: 'VIP'
        },
        { 
          text: 'Support prioritaire', 
          icon: Phone, 
          included: true,
          highlight: '24/7'
        },
        { 
          text: 'Manager de compte personnel', 
          icon: Award, 
          included: true,
          highlight: 'DÉDIÉ'
        },
        { 
          text: 'Rapports personnalisés', 
          icon: TrendingUp, 
          included: true 
        },
        { 
          text: 'Accès bêta nouvelles fonctionnalités', 
          icon: Rocket, 
          included: true 
        },
        { 
          text: 'Garantie de résultats', 
          icon: Target, 
          included: true 
        }
      ]
    },
    recruiter_ticket: {
      name: 'Ticket Crédit',
      description: 'Solution flexible mensuelle - Achetez autant de tickets que nécessaire chaque mois selon vos besoins.',
      ticketPrice: 20000,
      baseOffers: 3,
      baseMessages: 7,
      currency: 'Ariary',
      popular: false,
      icon: Ticket,
      idealFor: [
        'Recrutement ponctuel',
        'TPE et entrepreneurs',
        'Budget flexible et contrôlé',
        'Essai de nos services premium'
      ],
      features: [
        { 
          text: '3 Offre supplémentaires à la une pendant 2 jours', 
          icon: Star, 
          included: true,
          highlight: 'À LA UNE'
        },
        { 
          text: 'Contact direct message à 7 candidats', 
          icon: MessageSquare, 
          included: true,
          highlight: 'DIRECT'
        },
        { 
          text: 'Voir les contacts et CV de 7 candidats', 
          icon: Download, 
          included: true 
        },
        { 
          text: 'Support prioritaire', 
          icon: Shield, 
          included: true 
        },
        { 
          text: 'Analytics de base', 
          icon: BarChart3, 
          included: true 
        },
        { 
          text: 'Accès bêta nouvelles fonctionnalités', 
          icon: Rocket, 
          included: true 
        }
      ]
    }
  };

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
    
    if (window.innerWidth <= 768 && continueButtonRef.current) {
      setTimeout(() => {
        continueButtonRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 300);
    }
  };

  const calculateTotalPrice = () => {
    if (selectedPlan === 'recruiter_ticket') {
      return plans[selectedPlan].ticketPrice * ticketQuantity;
    }
    return billingPeriod === 'monthly' 
      ? plans[selectedPlan]?.monthlyPrice 
      : plans[selectedPlan]?.annualPrice;
  };

  return (
    <ProtectedRoute isPublic={false} requireAuth={true}>
      <div className="min-h-screen bg-gray-50">
        
        <Navbar />
        <div style={{ height: '130px' }}></div>
        
        <section className="relative pt-20 pb-16 overflow-hidden bg-gradient-to-br from-job-purple to-job-pink px-4 md:px-16 lg:px-20">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900" />
          
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='m0 0h40v40h-40z'/%3E%3Cpath d='m40 40h40v40h-40z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
          
          <div className="relative z-10 max-w-6xl mx-auto px-8 text-center text-white">
            <div className="animate-slideUp">
              <h1 className="text-4xl md:text-7xl font-black mb-8 leading-tight">
                Passez au niveau{' '}
                <span className="bg-job-dark-brown bg-clip-text text-transparent animate-gradient">
                  Premium Employeur
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
                Débloquez tout le potentiel de Job2Mada avec nos outils avancés de recrutement
              </p>
              
              <div className="flex items-center justify-center space-x-8 mb-12">
                {[
                  { num: 1, label: 'Choisir', icon: MousePointer },
                  { num: 2, label: 'Payer', icon: CreditCard },
                  { num: 3, label: 'Profiter', icon: Rocket }
                ].map(({ num, label, icon: Icon }) => (
                  <div key={num} className="flex flex-col items-center group">
                    <div className={`relative flex items-center justify-center w-16 h-16 rounded-2xl border-2 transition-all duration-500 group-hover:scale-110 ${
                      step >= num 
                        ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white border-transparent shadow-lg animate-pulse' 
                        : 'border-gray-400 text-gray-400 hover:border-white hover:text-white'
                    }`}>
                      {step > num ? (
                        <Check className="h-8 w-8" />
                      ) : (
                        <Icon className="h-8 w-8" />
                      )}
                      {step >= num && (
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl blur opacity-50" />
                      )}
                    </div>
                    <span className={`mt-3 text-sm font-bold transition-all duration-300 ${
                      step >= num ? 'text-white' : 'text-gray-400 group-hover:text-white'
                    }`}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="w-full px-4 md:px-8 pb-8">
          <div style={{ 
            maxWidth: '1500px', 
            margin: '0 auto',
            width: '100%'
          }}>
            <div style={{ 
              display: 'flex', 
              gap: '24px',
              width: '100%'
            }}>
              
              <div className="w-full px-0 md:px-4 lg:px-8">
                
              <div className="py-8 md:py-16 lg:py-20 px-0">
                  
                  {/* ÉTAPE 1: Choix du plan */}
                  {step === 1 && (
                    <div className="animate-slideUp">
                      
                      <div className="text-center mb-16">
                        <h2 className="text-4xl font-black text-gray-900 mb-4">
                          Choisissez votre formule Employeur PRO
                        </h2>
                        <p className="text-xl text-gray-600">
                          Des solutions adaptées à chaque étape de votre croissance
                        </p>
                      </div>

                      {selectedPlan !== 'recruiter_ticket' && (
                        <div className="flex justify-center mb-12">
                          <div className="bg-gradient-to-br from-job-purple to-job-pink rounded-2xl p-2 shadow-2xl">
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => setBillingPeriod('monthly')}
                                className={`px-8 py-4 rounded-xl font-black text-lg transition-all duration-300 ${
                                  billingPeriod === 'monthly'
                                    ? 'bg-gradient-to-br from-job-gold via-job-orange to-job-dark-gold text-white shadow-lg'
                                    : 'text-white hover:bg-white/10'
                                }`}
                              >
                                Mensuel
                              </button>
                              <button
                                onClick={() => setBillingPeriod('annual')}
                                className={`px-8 py-4 rounded-xl font-black text-lg transition-all duration-300 relative ${
                                  billingPeriod === 'annual'
                                    ? 'bg-gradient-to-br from-job-gold via-job-orange to-job-dark-gold text-white shadow-lg'
                                    : 'text-white hover:bg-white/10'
                                }`}
                              >
                                Annuel
                                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                  -15%
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-center mb-20">
                        <div className="grid lg:grid-cols-3 gap-12 w-full max-w-[1800px]">
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
                            />
                          ))}
                        </div>
                      </div>

                      <div className="text-center" ref={continueButtonRef}>
                        <button
                          onClick={() => setStep(2)}
                          disabled={!selectedPlan}
                          className="group relative px-16 py-6 bg-gradient-to-r from-gray-900 mt-24 via-blue-900 to-purple-900 text-white text-xl font-black rounded-2xl shadow-2xl transform transition-all duration-500 hover:scale-105 hover:shadow-3xl disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-job-purple to-job-pink transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                          <span style={{ padding: '12px' }} className="text-2xl font-black relative z-10 flex items-center justify-center">
                            Continuer vers le paiement
                            <ArrowRight className="h-6 w-6 ml-3 group-hover:translate-x-2 transition-transform duration-300" />
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

                      <div className="bg-white rounded-3xl shadow-2xl border-2 border-gray-100 p-8 mb-8">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-2xl font-black text-gray-900">{plans[selectedPlan]?.name}</h3>
                            <p className="text-gray-600 mt-1">
                              {selectedPlan === 'recruiter_ticket' 
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

                      <div className="grid md:grid-cols-2 gap-6">
                        
                        <button
                          onClick={() => setShowStripeModal(true)}
                          className="group bg-white rounded-3xl shadow-xl border-2 border-gray-100 hover:border-purple-300 p-8 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl text-left"
                        >
                          <div className="flex items-center justify-between mb-6">
                          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                              <img src="/cbb.png" alt="MVola" className="w-12 h-12 object-contain" />
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

                  {/* ÉTAPE 3: Confirmation */}
                  {step === 3 && (
                    <div className="max-w-5xl mx-auto text-center animate-slideUp">
                      <div style={{ padding: '90px' }} className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-16 relative overflow-hidden">
                        
                        {paymentSuccess?.manual ? (
                          // ✅ VERSION MVOLA - MANUEL
                          <>
                            <div className="relative mb-12">
                              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto animate-bounce-gentle shadow-2xl">
                                <Mail className="h-16 w-16 text-white" />
                              </div>
                              <div className="absolute inset-0 w-32 h-32 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full mx-auto opacity-20 animate-ping-gentle"></div>
                            </div>

                            <h2 className="text-5xl font-black text-gray-900 mb-6">
                              Demande envoyée !
                            </h2>
                            
                            <p className="text-2xl text-gray-700 mb-12 leading-relaxed max-w-3xl mx-auto">
                              Nous avons bien reçu votre demande pour l'offre{' '}
                              <strong className="text-blue-600">{plans[selectedPlan]?.name}</strong>.
                              Notre équipe vérifiera votre paiement MVola et activera votre abonnement dans les <strong>24 heures</strong>.
                            </p>

                            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-8 mb-8 max-w-2xl mx-auto">
                              <div className="flex items-start">
                                <Clock className="h-6 w-6 text-blue-600 mt-1 mr-4 flex-shrink-0" />
                                <div className="text-left">
                                  <h3 className="font-bold text-blue-900 text-lg mb-2">Prochaines étapes</h3>
                                  <p className="text-blue-800 leading-relaxed">
                                    Un membre de notre équipe vous contactera à l'adresse{' '}
                                    <strong>{user.email}</strong> après vérification de votre paiement MVola.
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-6 justify-center">
                              <button 
                                onClick={() => setStep(1)}
                                className="px-12 py-5 border-2 border-gray-300 text-gray-700 font-black text-lg rounded-2xl hover:bg-gray-50 transition-all duration-300 hover:scale-105"
                              >
                                Retour aux offres
                              </button>
                            </div>
                          </>
                        ) : (
                          // ✅ VERSION STRIPE - INSTANTANÉ
                          <>
                            <div className="relative mb-12">
                              <div className="w-32 h-32 bg-gradient-to-br from-job-gold via-job-orange to-job-dark-gold rounded-full flex items-center justify-center mx-auto animate-bounce-gentle shadow-2xl">
                                <CheckCircle className="h-16 w-16 text-white" />
                              </div>
                              <div className="absolute inset-0 w-32 h-32 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mx-auto opacity-20 animate-ping-gentle"></div>
                            </div>

                            <h2 className="text-5xl font-black text-gray-900 mb-6">
                              Paiement réussi !
                            </h2>
                            
                            <p className="text-2xl text-gray-700 mb-12 leading-relaxed max-w-3xl mx-auto">
                              Votre abonnement{' '}
                              <strong className="text-amber-600">{plans[selectedPlan]?.name}</strong>
                              {' '}est maintenant actif ! Profitez de toutes les fonctionnalités premium.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-6 justify-center">
                              <button 
                                onClick={() => window.location.href = '/dashboard'}
                                className="px-12 py-5 bg-gradient-to-r from-job-purple to-job-pink text-white font-black text-lg rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                              >
                                Accéder au tableau de bord
                              </button>
                              <button 
                                onClick={() => setStep(1)}
                                className="px-12 py-5 border-2 border-gray-300 text-gray-700 font-black text-lg rounded-2xl hover:bg-gray-50 transition-all duration-300 hover:scale-105"
                              >
                                Retour aux offres
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* FAQ */}
                  {step === 1 && (
                    <div className="mt-20">
                      <div style={{ margin: '50px' }} className="text-center mb-16">
                        <h3 className="text-4xl font-black text-gray-900 mb-4">
                          Questions fréquentes
                        </h3>
                        <p className="text-xl text-gray-600">
                          Tout sur nos abonnements Premium Employeur
                        </p>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                        {[
                          {
                            question: "Comment fonctionnent les tickets ?",
                            answer: "Achetez autant de tickets que vous voulez chaque mois. Chaque ticket = 3 offres à la une + 7 contacts directs. Si épuisés, rachetez-en simplement !",
                            icon: Ticket,
                            gradient: "from-amber-500 to-orange-600"
                          },
                          {
                            question: "Quelle différence tickets vs abonnement ?",
                            answer: "L'abonnement se renouvelle automatiquement. Les tickets mensuels vous donnent un contrôle total : achetez uniquement quand vous en avez besoin.",
                            icon: Briefcase,
                            gradient: "from-amber-500 to-orange-600"
                          },
                          {
                            question: "L'activation est-elle immédiate ?",
                            answer: "Oui ! Dès confirmation du paiement, toutes vos fonctionnalités premium sont activées en temps réel.",
                            icon: Rocket,
                            gradient: "from-amber-500 to-orange-600"
                          },
                          {
                            question: "Puis-je changer de plan ?",
                            answer: "Absolument, vous pouvez upgrader ou downgrader à tout moment. La facturation est ajustée au prorata.",
                            icon: TrendingUp,
                            gradient: "from-amber-500 to-orange-600"
                          },
                          {
                            question: "Y a-t-il des frais cachés ?",
                            answer: "Aucun ! Le prix affiché est tout inclus. Aucune surprise.",
                            icon: Wallet,
                            gradient: "from-amber-500 to-orange-600"
                          }
                        ].map((faq, index) => (
                          <div 
                            key={index} 
                            className="group bg-white rounded-3xl p-8 shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] cursor-pointer"
                          >
                            <div className="flex items-start space-x-4">
                              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${faq.gradient} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-all duration-300`}>
                                <faq.icon className="h-6 w-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-black text-gray-900 mb-4 text-lg group-hover:text-gray-800 transition-colors">
                                  {faq.question}
                                </h4>
                                <p className="text-gray-700 leading-relaxed group-hover:text-gray-600 transition-colors">
                                  {faq.answer}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div style={{ margin: '50px' }} className="text-center mt-16 p-12 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 rounded-3xl text-white max-w-4xl mx-auto">
                        <h4 className="text-3xl font-black mb-4 text-black">
                          Une question spécifique ?
                        </h4>
                        <p className="text-xl text-gray-300 mb-8 text-job-purple">
                          Notre équipe est là pour vous accompagner
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                          <a 
                            href="mailto:support@job2mada.com"
                            className="group px-8 py-4 bg-white text-gray-900 font-bold rounded-2xl hover:bg-gray-100 transition-all duration-300 hover:scale-105"
                          >
                            <span className="flex items-center justify-center">
                              <MessageSquare className="h-5 w-5 mr-3" />
                              Nous contacter
                            </span>
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals Stripe + MVola */}
      <Elements stripe={stripePromise}>
      <StripePaymentModal
        isOpen={showStripeModal}
        onClose={() => setShowStripeModal(false)}
        selectedPlan={selectedPlan}
        billingPeriod={billingPeriod}
        ticketQuantity={ticketQuantity}
        plans={plans}
        user={user}
        onSuccess={(result) => {
          setPaymentSuccess(result);
          setShowStripeModal(false);
          setStep(3);
        }}
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
        onSuccess={(result) => {
          setPaymentSuccess(result);
          setShowMVolaModal(false);
          setStep(3);
        }}
      />

      {/* Styles CSS */}
      <style>{`
        .job-gold { color: #D4AF37; }
        .job-dark-gold { color: #B8860B; }
        .job-purple { color: #8B5CF6; }
        .job-pink { color: #EC4899; }
        .job-orange { color: #F97316; }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes bounce-gentle {
          0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
          40%, 43% { transform: translate3d(0,-10px,0); }
          70% { transform: translate3d(0,-5px,0); }
          90% { transform: translate3d(0,-2px,0); }
        }

        @keyframes ping-gentle {
          75%, 100% { transform: scale(1.3); opacity: 0; }
        }

        .animate-slideUp { animation: slideUp 0.6s ease-out; }
        .animate-fadeIn { animation: fadeIn 0.8s ease-out; }
        .animate-bounce-gentle { animation: bounce-gentle 2s infinite; }
        .animate-ping-gentle { animation: ping-gentle 2s cubic-bezier(0, 0, 0.2, 1) infinite; }

        @media (max-width: 1024px) {
          .lg\\:grid-cols-3 { grid-template-columns: 1fr; }
        }

        @media (max-width: 768px) {
          .text-6xl, .text-7xl { font-size: 2.5rem; }
          .text-5xl { font-size: 2rem; }
          .text-4xl { font-size: 1.75rem; }
          .text-3xl { font-size: 1.5rem; }
          .p-16, .p-8 { padding: 2rem; }
          .px-16, .px-12 { padding-left: 2rem; padding-right: 2rem; }
          .gap-12, .gap-8 { gap: 2rem; }
        }

        .scale-\\[1\\.02\\] { transform: scale(1.02); }
        .scale-\\[1\\.03\\] { transform: scale(1.03); }
        .hover\\:scale-\\[1\\.02\\]:hover { transform: scale(1.02); }
        .shadow-3xl { box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25); }
        .bg-clip-text { -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
      `}</style>
    </ProtectedRoute>
  );
};

export default EmployerPremiumSubscription;