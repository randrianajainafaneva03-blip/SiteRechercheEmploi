import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AvatarWithBadge from '@/components/ui/VerifiedBadge';
import { 
  User, 
  Briefcase, 
  FileText, 
  CreditCard, 
  Heart, 
  Users, 
  Settings, 
  LogOut,
  ChevronDown,
  Package,
  Crown
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const ProfileMenu = ({ user, profile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();

  // Fermer le menu en cliquant ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      setIsOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleNavigation = (path) => {
    setIsOpen(false);
    
    if (location.pathname === '/dashboard' && path.startsWith('/dashboard')) {
      const urlParams = new URLSearchParams(path.split('?')[1] || '');
      const tab = urlParams.get('tab');
      
      if (tab) {
        window.history.pushState({}, '', `/dashboard?tab=${tab}`);
        window.dispatchEvent(new CustomEvent('dashboardTabChange', { detail: { tab } }));
      }
    } else {
      navigate(path);
    }
  };

  // Nom d'affichage avec fallbacks
  const displayName = profile?.full_name || user?.name || user?.email?.split('@')[0] || 'Utilisateur';
  const userEmail = user?.email || 'email@example.com';

  const menuItems = [
    {
      icon: User,
      label: 'Mon profil',
      href: '/profile',
      show: true
    },
    {
      icon: Briefcase,
      label: 'Mon Tableau de Bord',
      href: '/dashboard',
      show: profile?.user_type === 'employer'
    },
    {
      icon: Users,
      label: 'CV & Candidatures reçues',
      href: '/dashboard?tab=applications',
      show: profile?.user_type === 'employer'
    },
    {
      icon: FileText,
      label: 'Mes candidatures',
      href: '/my-applications',
      show: profile?.user_type === 'candidate'
    },
    {
      icon: Package,
      label: 'Mes Services',
      href: '/my-services',
      show: profile?.user_type === 'candidate'
    },
    {
      icon: Heart,
      label: 'Offres sauvegardées',
      href: '/saved-jobs',
      show: profile?.user_type === 'candidate'
    },
    {
      icon: Settings,
      label: 'Paramètres',
      href: '/settings',
      show: true
    }
  ];

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/10 transition-all group"
      >
        <div className="relative">
        <AvatarWithBadge
  src={profile?.avatar_url}
  alt={profile?.full_name || user?.name || 'Avatar'}
  name={profile?.full_name || user?.name || user?.email || 'U'}
  isVerified={profile?.is_verified}
  isPremium={profile?.is_premium}
  size="medium" // pour un avatar 10x10 (h-10 w-10)
  showBadgeAlways={true} // ← Force l'affichage du badge
/>
          
          {/* Badge Premium sur l'avatar */}
          {profile?.is_premium && (
            <div className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-yellow-400 to-orange-500 border-2 border-white rounded-full flex items-center justify-center">
              <Crown className="h-3 w-3 text-white" />
            </div>
          )}
          
          <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-white rounded-full"></div>
        </div>
        
        <div className="hidden md:block text-left">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-gray-900">
              {displayName}
            </p>
            {/* Badge Premium dans le nom */}
            {profile?.is_premium && (
              <div className="flex items-center bg-gradient-to-br from-job-purple to-job-pink text-white px-2 py-0.5 rounded-full text-xs font-bold">
                <Crown className="h-3 w-3 mr-1" />
                VIP
              </div>
            )}
          </div>
          <p className="text-xs text-job-green">
            {profile?.user_type === 'employer' ? 'Employeur' : 'Candidat'}
          </p>
        </div>
        
        <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-slide-in">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="relative">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={displayName}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 bg-gradient-elegant rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {getInitials(displayName)}
                  </div>
                )}
                
                {/* Badge Premium sur l'avatar du dropdown */}
                {profile?.is_premium && (
                  <div className="absolute -top-1 -right-1 h-6 w-6 bg-gradient-to-r from-yellow-400 to-orange-500 border-2 border-white rounded-full flex items-center justify-center">
                    <Crown className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="font-semibold text-gray-900 truncate">
                    {displayName}
                  </p>
                  {/* Badge Premium dans le dropdown */}
                  {profile?.is_premium && (
                    <div className="flex items-center bg-gradient-to-br from-job-gold via-job-orange to-job-dark-gold text-white px-2 py-1 rounded-full text-xs font-bold">
                      <Crown className="h-3 w-3 mr-1" />
                      VIP
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500 truncate">
                  {userEmail}
                </p>
                {profile?.company_name && (
                  <p className="text-xs text-job-purple font-medium">
                    {profile.company_name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {menuItems
              .filter(item => item.show)
              .map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleNavigation(item.href)}
                  className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-gray-50 hover:text-job-purple transition-colors group"
                >
                  <item.icon className="h-5 w-5 mr-3 text-gray-400 group-hover:text-job-purple" />
                  <span className="font-medium">{item.label}</span>
                  {/* Badge nouveau pour "Mes Services" */}
                  {item.label === 'Mes Services' && (
                    <span className="ml-auto bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                      NOUVEAU
                    </span>
                  )}
                </button>
              ))}
          </div>

          {/* Logout Button */}
          <div className="border-t border-gray-100 pt-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 transition-colors group"
            >
              <LogOut className="h-5 w-5 mr-3" />
              <span className="font-medium">Se déconnecter</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;