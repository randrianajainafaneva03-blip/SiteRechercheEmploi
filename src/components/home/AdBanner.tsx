
import React from 'react';
import { Award, Star, Trophy } from 'lucide-react';

const AdBanner = () => {
  return (
    <section className="py-12 bg-gradient-brown overflow-hidden relative">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full opacity-20"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white rounded-full opacity-20"></div>
      </div>
      
      <div className="container-custom relative z-10">
        <div className="glass-card rounded-2xl overflow-hidden shadow-elegant">
          <div className="relative py-12 px-8 text-center">
            <div className="absolute inset-0 bg-gradient-elegant opacity-20"></div>
            <div className="relative z-10">
              <div className="flex justify-center gap-4 mb-6">
                <Trophy className="h-10 w-10 text-job-gold animate-float" />
                <Star className="h-8 w-8 text-job-light-gold animate-float" style={{ animationDelay: '0.2s' }} />
                <Award className="h-10 w-10 text-job-gold animate-float" style={{ animationDelay: '0.4s' }} />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Découvrez nos formations professionnelles
              </h3>
              <p className="text-white/80 max-w-2xl mx-auto mb-6">
                Boostez votre carrière avec nos formations certifiantes en ligne. 
                Plus de 500 cours disponibles dans tous les domaines.
              </p>
              <div className="relative inline-block group">
                <div className="absolute inset-0 bg-gradient-to-r from-job-light-gold to-job-gold rounded-lg blur-sm transform group-hover:scale-105 transition-all"></div>
                <a 
                  href="#" 
                  className="relative inline-flex items-center justify-center px-6 py-3 bg-white text-job-brown font-medium rounded-lg hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl group-hover:-translate-y-0.5 transform"
                >
                  En savoir plus
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdBanner;
