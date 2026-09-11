import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { HelmetProvider } from 'react-helmet-async';
import '@/styles/about.css';
import Index from "./pages/Index";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import CreateJob from './pages/CreateJob';
import Dashboard from './pages/dashboard';
import SavedJobs from './pages/SavedJobs';
import MyApplications from './pages/MyApplications'; 
import JobSeekers from './pages/JobSeekers'; 
import Services from './pages/Services';
import CreateService from './pages/CreateService';
import MyServices from '@/pages/MyServices';
import EditService from '@/pages/EditService';
import AuthCallback from '@/pages/AuthCallback';
import Privacy from '@/pages/Privacy';
import Terms from '@/pages/Terms';
import UserTypeSelection from '@/pages/UserTypeSelection';
import AuthSuccess from '@/pages/AuthSuccess';
import AuthError from '@/pages/AuthError';
import GoogleCallback from './pages/GoogleCallback';
import CandidatePremiumSubscription from '@/pages/CandidatePremiumSubscription';
import Messages from '@/pages/Messages';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import { SEO } from '@/components/SEO';
import Conditions from '@/pages/Conditions';
import TestPage from './pages/TestPage';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import VerifyEmail from '@/pages/VerifyEmail';


// ✅ NOUVELLE ROUTE PREMIUM
import PremiumSubscription from './pages/PremiumSubscription';

// Configuration améliorée du QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Durée de cache de 5 minutes pour éviter trop de requêtes
      staleTime: 5 * 60 * 1000,
      // Garde les données en cache pendant 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry automatique en cas d'échec
      retry: (failureCount, error) => {
        // Ne pas retry sur les erreurs d'authentification
        if (error?.message?.includes('session') || 
            error?.message?.includes('JWT') ||
            (error as any).code === 'PGRST301') {
          return false;
        }
        // Retry jusqu'à 2 fois pour les autres erreurs
        return failureCount < 2;
      },
      // Délai entre les retries
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch en arrière-plan quand l'utilisateur revient sur l'onglet
      refetchOnWindowFocus: true,
      // Refetch quand la connexion est rétablie
      refetchOnReconnect: true,
      // Ne pas refetch automatiquement au mount si les données sont fraîches
      refetchOnMount: (query) => {
        return query.state.data === undefined;
      }
    },
    mutations: {
      // Retry pour les mutations en cas d'erreur réseau
      retry: (failureCount, error) => {
        if (error?.message?.includes('network') || 
            error?.message?.includes('timeout')) {
          return failureCount < 1;
        }
        return false;
      },
      // Options pour les mutations
      onError: (error) => {
        console.error('Erreur mutation:', error);
      }
    }
  }
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
    <HelmetProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/jobs/create" element={<CreateJob />} />
            <Route path="/test" element={<TestPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/saved-jobs" element={<SavedJobs />} />
            <Route path="/my-applications" element={<MyApplications />} />
            <Route path="/JobSeekers" element={<JobSeekers />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/create" element={<CreateService />} />
            <Route path="/my-services" element={<MyServices />} />
            <Route path="/services/edit/:serviceId" element={<EditService />} />
            <Route path="/conditions" element={<Conditions />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/Privacy" element={<Privacy />} />
            <Route path="/Terms" element={<Terms />} />
            <Route path="/user-type-selection" element={<UserTypeSelection />} />
            <Route path="/auth/success" element={<AuthSuccess />} />
            <Route path="/auth/error" element={<AuthError />} />
            <Route path="/auth/google-callback" element={<GoogleCallback />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/candidate-premium" element={<CandidatePremiumSubscription />} />
            <Route path="/about" element={<About />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<Contact />} /> 
            
            {/* ✅ ROUTE PREMIUM */}
            <Route path="/premium" element={<PremiumSubscription />} />
            
            {/* Routes temporaires pour les autres liens du menu */}
            <Route path="/my-jobs" element={<div className="pt-24 text-center">Page en construction</div>} />
            <Route path="/applications-received" element={<div className="pt-24 text-center">Page en construction</div>} />
            <Route path="/transactions" element={<div className="pt-24 text-center">Page en construction</div>} />
            <Route path="/settings" element={<div className="pt-24 text-center">Page en construction</div>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
      </HelmetProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;