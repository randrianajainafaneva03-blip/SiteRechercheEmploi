import { Navbar } from '@/components/layout/Navbar';
import { Shield, CheckCircle, XCircle } from 'lucide-react';

const Conditions = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-32 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
            <div className="flex items-center mb-8">
              <Shield className="h-12 w-12 text-[#667eea] mr-4" />
              <h1 className="text-4xl font-bold text-gray-900">
                Conditions de Publication
              </h1>
            </div>

            <div className="prose prose-lg max-w-none">
              <h2 className="flex items-center text-green-600">
                <CheckCircle className="h-6 w-6 mr-2" />
                Contenu Autorisé
              </h2>
              <ul>
                <li>Offres d'emploi légitimes et vérifiables</li>
                <li>Services professionnels conformes à la loi</li>
                <li>Descriptions claires et honnêtes</li>
                <li>Informations de contact via la plateforme uniquement</li>
              </ul>

              <h2 className="flex items-center text-red-600 mt-8">
                <XCircle className="h-6 w-6 mr-2" />
                Contenu Interdit
              </h2>
              <ul>
                <li>❌ Numéros de téléphone dans les descriptions</li>
                <li>❌ Adresses email dans le contenu</li>
                <li>❌ Liens externes vers d'autres plateformes</li>
                <li>❌ Contenus discriminatoires ou illégaux</li>
                <li>❌ Arnaques ou offres frauduleuses</li>
              </ul>

              <div className="bg-blue-50 p-6 rounded-xl mt-8">
                <h3 className="text-blue-900 mt-0">ℹ️ Processus de Modération</h3>
                <p className="text-blue-800">
                  Toutes les offres et services sont vérifiés sous 24-48h. 
                  Vous recevrez un email de confirmation ou de refus avec explications.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Conditions;