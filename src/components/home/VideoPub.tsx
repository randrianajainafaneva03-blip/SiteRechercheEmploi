
import React from 'react';

const VideoAd = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="section-title">Nos Partenaires</h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            Découvrez les entreprises qui nous font confiance
          </p>
        </div>
        
        <div className="bg-job-light rounded-lg overflow-hidden shadow-lg">
          <div className="relative pb-[56.25%] h-0">
            {/* Emplacement pour la vidéo publicitaire */}
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
              <div className="text-center p-8">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-job-gray mx-auto mb-4">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className="text-job-dark font-bold text-xl">Vidéo publicitaire</p>
                <p className="text-job-gray">Découvrez nos services en vidéo</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-12">
          <h3 className="text-xl font-bold text-center mb-8">Ils nous font confiance</h3>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-70">
            <div className="grayscale hover:grayscale-0 transition-all">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Orange_logo.svg/1200px-Orange_logo.svg.png" alt="Orange" className="h-12" />
            </div>
            <div className="grayscale hover:grayscale-0 transition-all">
              <img src="https://www.axian-group.com/wp-content/uploads/2022/03/logo-axian.png" alt="Axian" className="h-10" />
            </div>
            <div className="grayscale hover:grayscale-0 transition-all">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Air_Madagascar_Logo.svg/2560px-Air_Madagascar_Logo.svg.png" alt="Air Madagascar" className="h-10" />
            </div>
            <div className="grayscale hover:grayscale-0 transition-all">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/LOGO-BOA-RVB.png/1200px-LOGO-BOA-RVB.png" alt="Bank of Africa" className="h-8" />
            </div>
            <div className="grayscale hover:grayscale-0 transition-all">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/WWF_logo.svg/1024px-WWF_logo.svg.png" alt="WWF" className="h-12" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoAd;
