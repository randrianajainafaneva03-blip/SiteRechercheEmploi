
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Briefcase, User } from 'lucide-react';

const CallToAction = () => {
  return (
    <section className="py-16">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gradient-blue rounded-lg p-8 text-white shadow-lg">
            <Briefcase className="h-12 w-12 mb-4" />
            <h3 className="text-2xl font-bold mb-3">Vous recherchez des talents ?</h3>
            <p className="mb-6 text-white/90">
              Publiez vos offres d'emploi et accédez à notre base de candidats qualifiés. 
              Trouvez le candidat idéal pour votre entreprise.
            </p>
            <Link to="/employer/register">
              <Button size="lg" className="bg-white text-job-blue hover:bg-gray-100">
                Publier une offre
              </Button>
            </Link>
          </div>
          
          <div className="bg-gradient-green rounded-lg p-8 text-white shadow-lg">
            <User className="h-12 w-12 mb-4" />
            <h3 className="text-2xl font-bold mb-3">Vous recherchez un emploi ?</h3>
            <p className="mb-6 text-white/90">
              Créez votre profil, postulez aux offres d'emploi et soyez visible auprès des recruteurs 
              à Madagascar.
            </p>
            <Link to="/candidate/register">
              <Button size="lg" className="bg-white text-job-green hover:bg-gray-100">
                Créer mon profil
              </Button>
            </Link>
          </div>
        </div>
        <div className="bg-gray-50 py-8">
  <div className="container mx-auto px-4 text-center">
    <p className="text-sm text-gray-600">
      En vous inscrivant sur Job2mada, vous acceptez nos{' '}
      <Link to="/terms" className="text-blue-600 hover:underline font-medium">
        conditions d'utilisation
      </Link>
      {' '}et notre{' '}
      <Link to="/privacy" className="text-blue-600 hover:underline font-medium">
        politique de confidentialité
      </Link>
    </p>
  </div>
</div>
      </div>
      
    </section>
  );
};

export default CallToAction;
