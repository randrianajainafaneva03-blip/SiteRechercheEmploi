// src/pages/Terms.jsx
import Layout from '@/components/layout/Layout';
import { FileText, Users, AlertTriangle, CheckCircle, Scale, Shield } from 'lucide-react';

export default function Terms() {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-black py-16">
          <div className="container mx-auto px-4 text-center">
            <Scale className="w-16 h-16 mx-auto mb-4 text-indigo-200" />
            <h1 className="text-4xl font-bold mb-4">Conditions d'Utilisation</h1>
            <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
              Les règles et conditions qui régissent l'utilisation de la plateforme Job2mada.
            </p>
            <div className="mt-6 text-sm text-indigo-200">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Quick Agreement */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6 mb-8">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-900 mb-2">Acceptation des conditions</h3>
                  <p className="text-green-800">
                    En utilisant Job2mada, vous acceptez automatiquement ces conditions d'utilisation. 
                    Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre plateforme.
                  </p>
                </div>
              </div>
            </div>

            {/* Table of Contents */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-indigo-600" />
                Sommaire
              </h2>
              <div className="grid md:grid-cols-2 gap-2">
                <a href="#definitions" className="text-indigo-600 hover:underline">1. Définitions</a>
                <a href="#services" className="text-indigo-600 hover:underline">2. Description des services</a>
                <a href="#inscription" className="text-indigo-600 hover:underline">3. Inscription et compte</a>
                <a href="#utilisateurs" className="text-indigo-600 hover:underline">4. Obligations des utilisateurs</a>
                <a href="#contenu" className="text-indigo-600 hover:underline">5. Contenu et propriété</a>
                <a href="#interdictions" className="text-indigo-600 hover:underline">6. Comportements interdits</a>
                <a href="#responsabilite" className="text-indigo-600 hover:underline">7. Responsabilité</a>
                <a href="#suspension" className="text-indigo-600 hover:underline">8. Suspension et résiliation</a>
                <a href="#propriete" className="text-indigo-600 hover:underline">9. Propriété intellectuelle</a>
                <a href="#modifications" className="text-indigo-600 hover:underline">10. Modifications</a>
                <a href="#droit" className="text-indigo-600 hover:underline">11. Droit applicable</a>
                <a href="#contact-terms" className="text-indigo-600 hover:underline">12. Contact</a>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-8 space-y-12">
                
                {/* Introduction */}
                <section>
                  <div className="bg-indigo-50 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-indigo-900 mb-2">Bienvenue sur Job2mada</h3>
                    <p className="text-indigo-800">
                      Job2mada est une plateforme innovante dédiée à l'emploi à Madagascar. Nous connectons 
                      les talents malgaches avec les meilleures opportunités professionnelles. Ces conditions 
                      d'utilisation définissent les règles d'usage de notre plateforme pour garantir une 
                      expérience équitable et sécurisée pour tous.
                    </p>
                  </div>
                </section>

                {/* Section 1 */}
                <section id="definitions">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <FileText className="w-6 h-6 mr-3 text-indigo-600" />
                    1. Définitions
                  </h2>
                  <div className="space-y-4 text-gray-700">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Plateforme</h4>
                        <p className="text-sm">Le site web Job2mada accessible à l'adresse job2mada.com et ses applications mobiles.</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Utilisateur</h4>
                        <p className="text-sm">Toute personne physique ou morale utilisant la plateforme Job2mada.</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Candidat</h4>
                        <p className="text-sm">Utilisateur cherchant un emploi ou consultant les offres d'emploi.</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Recruteur</h4>
                        <p className="text-sm">Utilisateur représentant une entreprise publiant des offres d'emploi.</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 2 */}
                <section id="services">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <Users className="w-6 h-6 mr-3 text-indigo-600" />
                    2. Description des services
                  </h2>
                  <div className="space-y-4 text-gray-700">
                    <p>Job2mada propose les services suivants :</p>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-3">Pour les candidats</h4>
                        <ul className="space-y-2 text-sm text-blue-800">
                          <li>• Création de profil professionnel</li>
                          <li>• Recherche d'offres d'emploi</li>
                          <li>• Candidature en ligne</li>
                          <li>• Alertes emploi personnalisées</li>
                          <li>• Conseils carrière</li>
                          <li>• Networking professionnel</li>
                        </ul>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-semibold text-green-900 mb-3">Pour les recruteurs</h4>
                        <ul className="space-y-2 text-sm text-green-800">
                          <li>• Publication d'offres d'emploi</li>
                          <li>• Recherche de candidats</li>
                          <li>• Gestion des candidatures</li>
                          <li>• Statistiques de recrutement</li>
                          <li>• Promotion d'entreprise</li>
                          <li>• Outils de sélection</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 3 */}
                <section id="inscription">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Inscription et compte utilisateur</h2>
                  <div className="space-y-4 text-gray-700">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Conditions d'inscription</h4>
                      <ul className="text-yellow-700 space-y-1 text-sm">
                        <li>• Avoir au minimum 16 ans</li>
                        <li>• Fournir des informations exactes et à jour</li>
                        <li>• Posséder une adresse email valide</li>
                        <li>• Accepter ces conditions d'utilisation</li>
                      </ul>
                    </div>
                    
                    <h4 className="font-semibold mt-6">Responsabilités du compte :</h4>
                    <ul className="space-y-2 ml-6">
                      <li>• <strong>Sécurité :</strong> Vous êtes responsable de la confidentialité de vos identifiants</li>
                      <li>• <strong>Exactitude :</strong> Les informations fournies doivent être véridiques</li>
                      <li>• <strong>Mise à jour :</strong> Maintenez vos informations à jour</li>
                      <li>• <strong>Usage personnel :</strong> Un compte par personne, usage non commercial pour les candidats</li>
                    </ul>
                  </div>
                </section>

                {/* Section 4 */}
                <section id="utilisateurs">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Obligations des utilisateurs</h2>
                  <div className="space-y-4 text-gray-700">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-semibold text-green-900 mb-3">✅ Comportements attendus</h4>
                        <ul className="space-y-1 text-sm text-green-800">
                          <li>• Respecter les autres utilisateurs</li>
                          <li>• Fournir des informations exactes</li>
                          <li>• Utiliser la plateforme de bonne foi</li>
                          <li>• Respecter les lois malgaches</li>
                          <li>• Signaler les contenus inappropriés</li>
                          <li>• Maintenir la confidentialité des données</li>
                        </ul>
                      </div>
                      <div className="bg-red-50 rounded-lg p-4">
                        <h4 className="font-semibold text-red-900 mb-3">❌ Comportements interdits</h4>
                        <ul className="space-y-1 text-sm text-red-800">
                          <li>• Harcèlement ou discrimination</li>
                          <li>• Fausses informations</li>
                          <li>• Spam ou publicité non autorisée</li>
                          <li>• Contenu offensant ou illégal</li>
                          <li>• Tentative de piratage</li>
                          <li>• Violation de propriété intellectuelle</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 5 */}
                <section id="contenu">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Contenu et propriété</h2>
                  <div className="space-y-4 text-gray-700">
                    <h4 className="font-semibold">Contenu utilisateur :</h4>
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                      <p className="text-blue-800 text-sm">
                        En publiant du contenu sur Job2mada (CV, offres d'emploi, messages), vous accordez à 
                        la plateforme une licence non exclusive pour afficher, distribuer et promouvoir ce contenu 
                        dans le cadre de nos services. Vous conservez la propriété de votre contenu.
                      </p>
                    </div>
                    
                    <h4 className="font-semibold">Responsabilité du contenu :</h4>
                    <ul className="space-y-2 ml-6">
                      <li>• Vous êtes seul responsable du contenu que vous publiez</li>
                      <li>• Job2mada se réserve le droit de modérer ou supprimer tout contenu</li>
                      <li>• Les contenus doivent respecter les lois en vigueur</li>
                      <li>• Pas de contenu diffamatoire, obscène ou illégal</li>
                    </ul>
                  </div>
                </section>

                {/* Section 6 */}
                <section id="interdictions">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <AlertTriangle className="w-6 h-6 mr-3 text-red-600" />
                    6. Comportements strictement interdits
                  </h2>
                  <div className="space-y-4 text-gray-700">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                      <h4 className="font-semibold text-red-900 mb-4">🚫 Interdictions formelles</h4>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <h5 className="font-semibold text-red-800 mb-2">Activités frauduleuses :</h5>
                          <ul className="space-y-1 text-red-700">
                            <li>• Fausses offres d'emploi</li>
                            <li>• Usurpation d'identité</li>
                            <li>• Escroqueries financières</li>
                            <li>• Pyramides de Ponzi</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-semibold text-red-800 mb-2">Activités techniques :</h5>
                          <ul className="space-y-1 text-red-700">
                            <li>• Scraping automatisé</li>
                            <li>• Injection de code malveillant</li>
                            <li>• Surcharge des serveurs</li>
                            <li>• Contournement des mesures de sécurité</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-900 mb-2">⚖️ Conséquences</h4>
                      <p className="text-orange-800 text-sm">
                        La violation de ces interdictions peut entraîner la suspension immédiate du compte, 
                        la suppression du contenu, et dans les cas graves, des poursuites judiciaires.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 7 */}
                <section id="responsabilite">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Limitation de responsabilité</h2>
                  <div className="space-y-4 text-gray-700">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-3">Responsabilité de Job2mada :</h4>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <h5 className="font-semibold text-green-700 mb-2">✅ Nous nous engageons à :</h5>
                          <ul className="space-y-1 text-gray-600">
                            <li>• Maintenir la plateforme fonctionnelle</li>
                            <li>• Protéger vos données personnelles</li>
                            <li>• Modérer les contenus signalés</li>
                            <li>• Fournir un support technique</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-semibold text-orange-700 mb-2">⚠️ Nous ne garantissons pas :</h5>
                          <ul className="space-y-1 text-gray-600">
                            <li>• La véracité des offres d'emploi</li>
                            <li>• Le succès des candidatures</li>
                            <li>• La disponibilité 100% de la plateforme</li>
                            <li>• L'absence d'erreurs techniques</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-yellow-800 text-sm">
                        <strong>Important :</strong> Job2mada est un intermédiaire entre candidats et recruteurs. 
                        Nous ne sommes pas responsables des relations contractuelles qui peuvent se nouer entre les utilisateurs.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 8 */}
                <section id="suspension">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Suspension et résiliation</h2>
                  <div className="space-y-4 text-gray-700">
                    <h4 className="font-semibold">Motifs de suspension :</h4>
                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-red-50 rounded-lg p-4">
                        <h5 className="font-semibold text-red-900 mb-2">Suspension immédiate</h5>
                        <ul className="text-xs text-red-700 space-y-1">
                          <li>• Activités frauduleuses</li>
                          <li>• Harcèlement</li>
                          <li>• Contenu illégal</li>
                        </ul>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-4">
                        <h5 className="font-semibold text-orange-900 mb-2">Avertissement puis suspension</h5>
                        <ul className="text-xs text-orange-700 space-y-1">
                          <li>• Spam répété</li>
                          <li>• Informations inexactes</li>
                          <li>• Comportement inapproprié</li>
                        </ul>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h5 className="font-semibold text-blue-900 mb-2">À votre demande</h5>
                        <ul className="text-xs text-blue-700 space-y-1">
                          <li>• Suppression de compte</li>
                          <li>• Désactivation temporaire</li>
                          <li>• Export des données</li>
                        </ul>
                      </div>
                    </div>
                    
                    <h4 className="font-semibold">Procédure de résiliation :</h4>
                    <ol className="space-y-2 ml-6">
                      <li>1. <strong>Notification :</strong> Information par email (sauf cas urgents)</li>
                      <li>2. <strong>Délai de réponse :</strong> 7 jours pour contester la décision</li>
                      <li>3. <strong>Sauvegarde :</strong> 30 jours pour récupérer vos données</li>
                      <li>4. <strong>Suppression définitive :</strong> Après 30 jours d'inactivité</li>
                    </ol>
                  </div>
                </section>

                {/* Section 9 */}
                <section id="propriete">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <Shield className="w-6 h-6 mr-3 text-indigo-600" />
                    9. Propriété intellectuelle
                  </h2>
                  <div className="space-y-4 text-gray-700">
                    <div className="bg-indigo-50 rounded-lg p-6">
                      <h4 className="font-semibold text-indigo-900 mb-3">Propriété de Job2mada :</h4>
                      <p className="text-indigo-800 text-sm mb-3">
                        La plateforme Job2mada, incluant son design, ses fonctionnalités, son code source, 
                        ses algorithmes et sa marque, est la propriété exclusive de Job2mada.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4 text-xs">
                        <div>
                          <h5 className="font-semibold text-indigo-800 mb-1">Éléments protégés :</h5>
                          <ul className="space-y-1 text-indigo-700">
                            <li>• Logo et marques</li>
                            <li>• Interface utilisateur</li>
                            <li>• Algorithmes de matching</li>
                            <li>• Base de données</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-semibold text-indigo-800 mb-1">Droits d'usage :</h5>
                          <ul className="space-y-1 text-indigo-700">
                            <li>• Licence d'utilisation personnelle</li>
                            <li>• Pas de reproduction commerciale</li>
                            <li>• Pas de reverse engineering</li>
                            <li>• Respect des droits d'auteur</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 10 */}
                <section id="modifications">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Modifications des conditions</h2>
                  <div className="space-y-4 text-gray-700">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">Procédure de modification :</h4>
                      <ol className="space-y-2 text-sm text-blue-800">
                        <li>1. <strong>Notification préalable :</strong> 30 jours avant l'entrée en vigueur</li>
                        <li>2. <strong>Communication :</strong> Email + notification sur la plateforme</li>
                        <li>3. <strong>Période de grâce :</strong> Possibilité de refuser les modifications</li>
                        <li>4. <strong>Acceptation tacite :</strong> Continuation d'usage = acceptation</li>
                      </ol>
                    </div>
                    <p className="text-sm">
                      <strong>Modifications mineures</strong> (corrections, clarifications) peuvent être effectuées sans préavis.
                    </p>
                  </div>
                </section>

                {/* Section 11 */}
                <section id="droit">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Droit applicable et juridiction</h2>
                  <div className="space-y-4 text-gray-700">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">🇲🇬 Droit applicable</h4>
                          <p className="text-sm text-gray-600">
                            Ces conditions sont régies par le droit malgache. En cas de conflit entre 
                            les lois locales et internationales, le droit malgache prévaut.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">⚖️ Juridiction compétente</h4>
                          <p className="text-sm text-gray-600">
                            Tout litige sera soumis aux tribunaux compétents d'Antananarivo, Madagascar. 
                            Nous privilégions néanmoins la médiation amiable.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 12 */}
                <section id="contact-terms">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact et support</h2>
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6">
                    <p className="text-gray-700 mb-4">
                      Pour toute question concernant ces conditions d'utilisation :
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Job2mada - Service Juridique</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>📧 Email : <a href="mailto:legal@job2mada.com" className="text-indigo-600 hover:underline">legal@job2mada.com</a></p>
                          <p>📱 Support : <a href="mailto:support@job2mada.com" className="text-indigo-600 hover:underline">support@job2mada.com</a></p>
                          <p>📍 Adresse : Antananarivo, Madagascar</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Délais de réponse</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>• Questions générales : <strong>48h</strong></p>
                          <p>• Litiges : <strong>7 jours</strong></p>
                          <p>• Urgences : <strong>24h</strong></p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Signature */}
                <section className="border-t pt-8">
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Acceptation et entrée en vigueur</h3>
                    <div className="space-y-3 text-sm text-gray-700">
                      <p>
                        Ces conditions d'utilisation entrent en vigueur dès votre première utilisation de Job2mada. 
                        Elles constituent un contrat juridiquement contraignant entre vous et Job2mada.
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div>
                          <p className="font-semibold text-gray-900">Job2mada</p>
                          <p className="text-xs text-gray-500">Plateforme d'emploi à Madagascar</p>
                        </div>
                        <div className="text-right text-xs text-gray-500">
                          <p>Version : 1.0</p>
                          <p>Date : {new Date().toLocaleDateString('fr-FR')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}