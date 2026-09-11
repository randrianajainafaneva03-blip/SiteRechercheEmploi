import React from 'react';
import { Search, Briefcase, User, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Hero = () => {
  return (
    <section className="relative bg-gradient-to-br from-amber-700 via-amber-600 to-amber-800 pt-32 pb-20 md:py-36">
      {/* Texture overlay */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diamond-upholstery.png')] opacity-10"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 max-w-2xl">
            {/* Titre avec texte super visible */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-white drop-shadow-sm">
              Trouvez le Job <br />
              de Vos Rêves à <br className="hidden sm:block"/>
              <span className="text-amber-200">Madagascar</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white">
              Job-Mada connecte les talents avec les meilleures opportunités professionnelles sur l'île, 
              avec plus de <span className="font-semibold text-amber-200">2000+ offres</span> disponibles.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link to="/jobs">
                <Button size="lg" className="bg-white text-amber-800 hover:bg-amber-100 flex items-center gap-2 shadow-lg font-semibold text-lg">
                  <Briefcase className="h-5 w-5" />
                  <span>Voir les offres</span>
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="outline" className="border-white border-2 text-white hover:bg-white/10 flex items-center gap-2 font-medium text-lg">
                  <User className="h-5 w-5" />
                  <span>Créer un compte</span>
                </Button>
              </Link>
            </div>
            
            <div className="flex gap-10 mt-8 py-4">
              <div>
                <div className="text-4xl font-bold text-amber-200">1200+</div>
                <div className="text-white text-lg">Entreprises</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-amber-200">8500+</div>
                <div className="text-white text-lg">Candidats</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-amber-200">95%</div>
                <div className="text-white text-lg">Satisfaction</div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            {/* Boîte de recherche avec fond clair pour une visibilité maximale */}
            <div className="bg-white rounded-xl p-8 shadow-2xl">
              <h2 className="text-2xl font-bold text-amber-800 mb-6">Recherche rapide</h2>
              <div className="space-y-5">
                <div>
                  <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-1">
                    Mots clés
                  </label>
                  <div className="relative">
                    <Input 
                      id="keywords"
                      placeholder="Titre, compétences ou entreprise" 
                      className="pl-10 border-amber-300 focus:ring-amber-500 focus:border-amber-500 bg-amber-50"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500" />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Lieu
                  </label>
                  <div className="relative">
                    <Input 
                      id="location"
                      placeholder="Ville ou région" 
                      className="pl-10 border-amber-300 focus:ring-amber-500 focus:border-amber-500 bg-amber-50"
                    />
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500" />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Catégorie
                  </label>
                  <select 
                    id="category"
                    className="w-full rounded-md border border-amber-300 bg-amber-50 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="">Toutes les catégories</option>
                    <option value="it">Informatique & Tech</option>
                    <option value="marketing">Marketing & Communication</option>
                    <option value="finance">Finance & Comptabilité</option>
                    <option value="engineering">Ingénierie</option>
                    <option value="healthcare">Santé</option>
                    <option value="education">Éducation</option>
                  </select>
                </div>
                
                <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium text-lg py-6">
                  Rechercher des offres
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;