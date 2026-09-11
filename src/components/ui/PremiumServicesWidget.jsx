import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  ChevronUp, 
  ChevronDown, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  Timer, 
  ArrowRight, 
  Package,
  Star,
  Zap,
  Sparkles
} from 'lucide-react';

const PremiumServicesWidget = ({ services, onServiceClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (services.length > 1) {
      const interval = setInterval(() => {
        goToNext();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [services.length]);

  const goToNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % services.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const goToPrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + services.length) % services.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  if (!services.length) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border-2 border-amber-400 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 flex items-center justify-between">
          <h3 className="font-bold text-white text-lg flex items-center">
            <Crown className="h-5 w-5 mr-2" />
            Services Premium
          </h3>
        </div>
        
        <div className="text-center py-8">
          <Crown className="h-12 w-12 text-amber-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucun service premium</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-white rounded-2xl shadow-xl border-2 border-amber-400 overflow-hidden">
      {/* Header avec gradient premium */}
      <div className="bg-gradient-to-br from-job-gold via-job-orange to-job-dark-gold p-4 flex items-center justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
        <h3 className="font-bold text-white text-lg flex items-center relative z-10">
          <Crown className="h-5 w-5 mr-2 text-yellow-300" />
          Services Premium
        </h3>
        <div className="relative z-10 flex items-center space-x-2">
          <span className="text-white/80 text-sm font-medium">{services.length}</span>
          <Star className="h-4 w-4 text-yellow-300" />
        </div>
      </div>

      {/* Container des services */}
      <div className="relative h-80 overflow-hidden">
        <div 
          className={`transition-transform duration-500 ease-in-out h-full ${isAnimating ? 'transform-gpu' : ''}`}
          style={{ transform: `translateY(-${currentIndex * 100}%)` }}
        >
          {services.map((service, index) => (
            <div
              key={`premium-widget-${service.id}-${index}`}
              onClick={() => onServiceClick(service)}
              className="h-full cursor-pointer transform transition-all duration-300"
            >
              <div className="h-full p-6 flex flex-col justify-between bg-gradient-to-br from-white via-amber-50/30 to-orange-50/30 hover:from-orange-50/50 hover:via-amber-50/50 hover:to-white border-b border-amber-400/20 relative group">
                
                {/* Premium Effects */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10">
                  {/* Premium Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-md">
                      <Crown className="h-3 w-3 mr-1" />
                      PREMIUM
                    </div>
                    {service.delivery_time === '24h' && (
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center animate-pulse">
                        <Zap className="h-3 w-3 mr-1" />
                        24H
                      </div>
                    )}
                  </div>

                  {/* Profile Section */}
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4 shadow-lg border-2 border-amber-300 bg-white overflow-hidden group-hover:border-orange-400 transition-colors">
                      {service.creator?.avatar_url ? (
                        <img 
                          src={service.creator.avatar_url} 
                          alt={`Photo de ${service.creator.full_name}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                          <Package className="h-6 w-6 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 text-sm line-clamp-1 group-hover:text-orange-600 transition-colors">
                        {service.title}
                      </h4>
                      <p className="text-gray-600 text-xs font-medium flex items-center">
                        <Star className="h-3 w-3 mr-1 text-yellow-500" />
                        {service.creator?.full_name}
                      </p>
                    </div>
                  </div>
                  
                  {/* Service Details */}
                  <div className="space-y-2 text-xs text-gray-600 mb-4">
                    <div className="flex items-center">
                      <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                        <MapPin className="h-3 w-3 text-purple-600" />
                      </div>
                      <span className="font-medium">{service.creator?.location}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-2">
                        <Briefcase className="h-3 w-3 text-green-600" />
                      </div>
                      <span>{service.category}</span>
                    </div>
                    {service.price_range && (
                      <div className="flex items-center">
                        <div className="w-5 h-5 bg-yellow-100 rounded-full flex items-center justify-center mr-2">
                          <DollarSign className="h-3 w-3 text-yellow-600" />
                        </div>
                        <span className="font-bold text-green-600">{service.price_range}</span>
                      </div>
                    )}
                    {service.delivery_time && (
                      <div className="flex items-center">
                        <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                          <Timer className="h-3 w-3 text-blue-600" />
                        </div>
                        <span className="font-medium text-blue-600">{service.delivery_time}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Call to Action */}
                <div className="mt-auto pt-3 border-t border-amber-400/20 relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">Service premium</span>
                    <div className="w-6 h-6 bg-gradient-to-br from-job-gold via-job-orange to-job-dark-gold rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
                      <ArrowRight className="h-3 w-3 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Controls */}
        {services.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
            <button
              onClick={goToPrev}
              disabled={isAnimating}
              className="p-2 bg-gradient-to-br from-job-purple to-job-pink hover:from-amber-600 hover:to-orange-600 rounded-full shadow-lg transition-all disabled:opacity-50 group"
            >
              <ChevronUp className="h-3 w-3 text-white group-hover:scale-110 transition-transform" />
            </button>
            <button
              onClick={goToNext}
              disabled={isAnimating}
              className="p-2 bg-gradient-to-br from-job-purple to-job-pink hover:from-amber-600 hover:to-orange-600 rounded-full shadow-lg transition-all disabled:opacity-50 group"
            >
              <ChevronDown className="h-3 w-3 text-white group-hover:scale-110 transition-transform" />
            </button>
          </div>
        )}

        {/* Progress Indicator */}
        {services.length > 1 && (
          <div className="absolute top-4 right-4 z-20">
            <div className="bg-gradient-to-br from-job-purple to-job-pink backdrop-blur-sm rounded-full px-2 py-1 shadow-md">
              <span className="text-xs font-bold text-white">
                {currentIndex + 1}/{services.length}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }

        .animate-shimmer {
          animation: shimmer 3s infinite;
        }

        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .transform-gpu {
          transform: translateZ(0);
          will-change: transform;
        }
      `}</style>
    </div>
  );
};

export default PremiumServicesWidget;