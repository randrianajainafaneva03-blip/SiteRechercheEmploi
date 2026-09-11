import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  ChevronLeft, 
  ChevronRight, 
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

const PremiumServicesCarousel = ({ services, onServiceClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [animationDirection, setAnimationDirection] = useState('right');

  // Auto-play avec pause au hover
  useEffect(() => {
    if (!isAutoPlaying || services.length <= 3) return;

    const interval = setInterval(() => {
      goToNext();
    }, 4000);

    return () => clearInterval(interval);
  }, [currentIndex, isAutoPlaying, services.length]);

  const goToNext = () => {
    setAnimationDirection('right');
    setCurrentIndex((prev) => (prev + 1) % services.length);
  };

  const goToPrev = () => {
    setAnimationDirection('left');
    setCurrentIndex((prev) => (prev - 1 + services.length) % services.length);
  };

  const goToSlide = (index) => {
    setAnimationDirection(index > currentIndex ? 'right' : 'left');
    setCurrentIndex(index);
  };

  const getVisibleServices = () => {
    if (services.length === 0) return [];
    
    const visibleServices = [];
    const servicesToShow = Math.min(3, services.length);
    
    for (let i = 0; i < servicesToShow; i++) {
      const index = (currentIndex + i) % services.length;
      visibleServices.push({
        ...services[index],
        displayIndex: i,
        isCenter: i === 1 && servicesToShow === 3
      });
    }
    
    return visibleServices;
  };

  if (services.length === 0) {
    return (
      <div className="bg-gradient-to-br from-job-gold via-job-orange to-job-dark-gold rounded-3xl p-8 relative overflow-hidden shadow-2xl mt-8">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 text-center text-white">
          <Crown className="h-16 w-16 mx-auto mb-4 text-yellow-300" />
          <h2 className="text-3xl font-bold mb-2">Services Premium</h2>
          <p className="text-white/90">Aucun service premium disponible pour le moment</p>
        </div>
      </div>
    );
  }

  const visibleServices = getVisibleServices();

  return (
    <div 
      className="bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-3xl p-4 md:p-8 relative overflow-hidden shadow-2xl mt-8"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Effets de background animés */}
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-2">
            <Crown className="h-8 w-8 mr-3 text-yellow-300 animate-pulse" />
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Services Premium
            </h2>
            <Star className="h-8 w-8 ml-3 text-yellow-300 animate-pulse" />
          </div>
          <p className="text-white/90 text-lg">
            Les services premium les plus demandés • {services.length} disponibles
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[280px]">
            {visibleServices.map((service, index) => (
              <div
                key={`premium-${service.id}-${service.displayIndex}`}
                onClick={() => onServiceClick(service)}
                className={`
                  premium-card cursor-pointer transform transition-all duration-500 ease-out
                  ${service.isCenter ? 'md:scale-105 md:z-10' : 'md:scale-95'}
                  ${animationDirection === 'right' ? 'animate-slide-in-right' : 'animate-slide-in-left'}
                `}
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                  animationFillMode: 'both'
                }}
              >
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 h-full shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-yellow-300/50 hover:border-yellow-400">
                  
                  {/* Premium Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-lg">
                      <Crown className="h-3 w-3 mr-1" />
                      PREMIUM
                    </div>
                    {service.delivery_time === '24h' && (
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center animate-pulse">
                        <Zap className="h-3 w-3 mr-1" />
                        EXPRESS
                      </div>
                    )}
                  </div>

                  {/* Profile Section */}
                  <div className="flex items-center mb-4">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center mr-4 shadow-lg border-2 border-yellow-300 bg-white overflow-hidden">
                      {service.creator?.avatar_url ? (
                        <img 
                          src={service.creator.avatar_url} 
                          alt={`Photo de ${service.creator.full_name}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                          <Package className="h-7 w-7 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg line-clamp-1 hover:text-orange-600 transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-gray-600 text-sm font-medium flex items-center">
                        <Star className="h-3 w-3 mr-1 text-yellow-500" />
                        {service.creator?.full_name}
                      </p>
                    </div>
                  </div>
                  
                  {/* Service Details */}
                  <div className="space-y-3 text-sm text-gray-600 mb-4">
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
                  
                  {/* Call to Action */}
                  <div className="mt-auto pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 font-medium">Voir le service premium</span>
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all">
                        <ArrowRight className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Controls */}
          {services.length > 3 && (
            <>
              {/* Previous Button */}
              <button
                onClick={goToPrev}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 p-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full shadow-lg transition-all z-20 group"
              >
                <ChevronLeft className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
              </button>

              {/* Next Button */}
              <button
                onClick={goToNext}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 p-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full shadow-lg transition-all z-20 group"
              >
                <ChevronRight className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
              </button>
            </>
          )}
        </div>

        {/* Dots Indicator */}
        {services.length > 3 && (
          <div className="flex items-center justify-center mt-6 space-x-3">
            <div className="flex space-x-2">
              {Array.from({ length: Math.min(services.length, 8) }, (_, i) => (
                <button
                  key={`indicator-${i}`}
                  onClick={() => goToSlide(i)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    i === currentIndex % Math.min(services.length, 8)
                      ? 'bg-white shadow-lg scale-125' 
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>
            
            {/* Auto-play indicator */}
            <div className="ml-4 flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full transition-all ${isAutoPlaying ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-xs text-white/80">
                {isAutoPlaying ? 'Auto' : 'Pause'}
              </span>
            </div>
          </div>
        )}

        {/* Service Count Badge */}
        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
          <span className="text-white text-sm font-bold flex items-center">
            <Sparkles className="h-4 w-4 mr-1" />
            {services.length} Premium
          </span>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }

        @keyframes slideInRight {
          0% {
            opacity: 0;
            transform: translateX(50px) scale(0.9);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        @keyframes slideInLeft {
          0% {
            opacity: 0;
            transform: translateX(-50px) scale(0.9);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        .animate-shimmer {
          animation: shimmer 3s infinite;
        }

        .animate-slide-in-right {
          animation: slideInRight 0.6s ease-out;
        }

        .animate-slide-in-left {
          animation: slideInLeft 0.6s ease-out;
        }

        .premium-card:hover {
          transform: translateY(-8px) scale(1.02);
        }

        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default PremiumServicesCarousel;