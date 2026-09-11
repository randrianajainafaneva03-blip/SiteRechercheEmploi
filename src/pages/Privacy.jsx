// src/pages/Privacy.jsx
import Layout from '@/components/layout/Layout';
import { Shield, Eye, Lock, Users, FileText, Mail } from 'lucide-react';

export default function Privacy() {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-black py-16">
          <div className="container mx-auto px-4 text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 text-blue-200" />
            <h1 className="text-4xl font-bold mb-4">Politique de Confidentialité</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Votre confidentialité est notre priorité. Découvrez comment nous protégeons vos données personnelles.
            </p>
            <div className="mt-6 text-sm text-blue-200">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Table of Contents */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                Sommaire
              </h2>
              <div className="grid md:grid-cols-2 gap-2">
                <a href="#collecte" className="text-blue-600 hover:underline">1. Collecte des données</a>
                <a href="#utilisation" className="text-blue-600 hover:underline">2. Utilisation des données</a>
                <a href="#partage" className="text-blue-600 hover:underline">3. Partage des informations</a>
                <a href="#cookies" className="text-blue-600 hover:underline">4. Cookies et technologies</a>
                <a href="#securite" className="text-blue-600 hover:underline">5. Sécurité des données</a>
                <a href="#droits" className="text-blue-600 hover:underline">6. Vos droits</a>
                <a href="#conservation" className="text-blue-600 hover:underline">7. Conservation des données</a>
                <a href="#contact" className="text-blue-600 hover:underline">8. Nous contacter</a>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-8 space-y-12">
                
                {/* Introduction */}
                <section>
                  <div className="bg-blue-50 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">Bienvenue sur Job2mada</h3>
                    <p className="text-blue-800">
                      Job2mada est la plateforme de référence pour l'emploi à Madagascar. Nous connectons les talents malgaches 
                      avec les meilleures opportunités professionnelles du pays. Cette politique de confidentialité explique 
                      comment nous collectons, utilisons et protégeons vos informations personnelles.
                    </p>
                  </div>
                </section>

                {/* Section 1 */}
                <section id="collecte">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <Eye className="w-6 h-6 mr-3 text-blue-600" />
                    1. Collecte des données personnelles
                  </h2>
                  <div className="space-y-4 text-gray-700">
                    <h3 className="text-lg font-semibold">Données que nous collectons :</h3>
                    <ul className="space-y-2 ml-6">
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Informations de profil :</strong> Nom, prénom, adresse email, numéro de téléphone, photo de profil</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Informations professionnelles :</strong> CV, expériences, compétences, formations, certifications</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Données de localisation :</strong> Région, ville (pour les offres d'emploi locales)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Données de connexion :</strong> Adresse IP, type de navigateur, pages visitées</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Données OAuth :</strong> Informations publiques de vos comptes Google, Facebook, LinkedIn</span>
                      </li>
                    </ul>
                  </div>
                </section>

                {/* Section 2 */}
                <section id="utilisation">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <Users className="w-6 h-6 mr-3 text-blue-600" />
                    2. Utilisation des données
                  </h2>
                  <div className="space-y-4 text-gray-700">
                    <p>Nous utilisons vos données personnelles pour :</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Services principaux</h4>
                        <ul className="space-y-1 text-sm">
                          <li>• Créer et gérer votre compte</li>
                          <li>• Publier et gérer vos offres d'emploi</li>
                          <li>• Rechercher des candidats appropriés</li>
                          <li>• Faciliter les candidatures</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Amélioration des services</h4>
                        <ul className="space-y-1 text-sm">
                          <li>• Personnaliser vos recommandations</li>
                          <li>• Analyser les tendances du marché</li>
                          <li>• Améliorer notre plateforme</li>
                          <li>• Prévenir la fraude</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 3 */}
                <section id="partage">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Partage des informations</h2>
                  <div className="space-y-4 text-gray-700">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-semibold text-red-800 mb-2">🔒 Principe de confidentialité</h4>
                      <p className="text-red-700">
                        Job2mada ne vend jamais vos données personnelles à des tiers. Nous ne partageons vos informations 
                        que dans les cas spécifiques mentionnés ci-dessous.
                      </p>
                    </div>
                    <h4 className="font-semibold">Partage autorisé uniquement :</h4>
                    <ul className="space-y-2 ml-6">
                      <li>• <strong>Avec les recruteurs :</strong> Lorsque vous postulez à une offre d'emploi</li>
                      <li>• <strong>Avec les candidats :</strong> Lorsque vous publiez une offre d'emploi</li>
                      <li>• <strong>Prestataires techniques :</strong> Pour l'hébergement et la maintenance (Vercel, Appwrite)</li>
                      <li>• <strong>Obligations légales :</strong> Si requis par la loi malgache</li>
                    </ul>
                  </div>
                </section>

                {/* Section 4 */}
                <section id="cookies">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Cookies et technologies similaires</h2>
                  <div className="space-y-4 text-gray-700">
                    <p>Job2mada utilise des cookies pour améliorer votre expérience :</p>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">Cookies essentiels</h4>
                        <p className="text-sm text-blue-800">Nécessaires au fonctionnement du site (connexion, sécurité)</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-semibold text-green-900 mb-2">Cookies de performance</h4>
                        <p className="text-sm text-green-800">Analyse du trafic et amélioration des performances</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h4 className="font-semibold text-purple-900 mb-2">Cookies de personnalisation</h4>
                        <p className="text-sm text-purple-800">Préférences et recommandations personnalisées</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 5 */}
                <section id="securite">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <Lock className="w-6 h-6 mr-3 text-blue-600" />
                    5. Sécurité des données
                  </h2>
                  <div className="space-y-4 text-gray-700">
                    <div className="bg-green-50 rounded-lg p-6">
                      <h4 className="font-semibold text-green-900 mb-3">🛡️ Mesures de sécurité mises en place :</h4>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <ul className="space-y-2">
                          <li>• Chiffrement SSL/TLS (HTTPS)</li>
                          <li>• Authentification sécurisée</li>
                          <li>• Sauvegarde régulière des données</li>
                          <li>• Surveillance 24/7 des intrusions</li>
                        </ul>
                        <ul className="space-y-2">
                          <li>• Accès limité aux données</li>
                          <li>• Mise à jour régulière des systèmes</li>
                          <li>• Tests de sécurité périodiques</li>
                          <li>• Conformité aux standards internationaux</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 6 */}
                <section id="droits">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Vos droits</h2>
                  <div className="space-y-4 text-gray-700">
                    <p>Conformément à la législation malgache sur la protection des données, vous disposez des droits suivants :</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">Droits d'accès et de contrôle</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• Accéder à vos données personnelles</li>
                          <li>• Rectifier vos informations</li>
                          <li>• Supprimer votre compte</li>
                          <li>• Exporter vos données</li>
                        </ul>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-4">
                        <h4 className="font-semibold text-orange-900 mb-2">Droits de limitation</h4>
                        <ul className="text-sm text-orange-800 space-y-1">
                          <li>• Limiter le traitement</li>
                          <li>• Vous opposer au traitement</li>
                          <li>• Révoquer votre consentement</li>
                          <li>• Déposer une réclamation</li>
                        </ul>
                      </div>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-yellow-800">
                        <strong>Pour exercer vos droits :</strong> Contactez-nous à 
                        <a href="mailto:support@job2mada.com" className="text-blue-600 hover:underline ml-1">support@job2mada.com</a>
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 7 */}
                <section id="conservation">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Conservation des données</h2>
                  <div className="space-y-4 text-gray-700">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-200 rounded-lg">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="border border-gray-200 px-4 py-2 text-left">Type de données</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">Durée de conservation</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-gray-200 px-4 py-2">Données de profil actif</td>
                            <td className="border border-gray-200 px-4 py-2">Tant que le compte est actif</td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="border border-gray-200 px-4 py-2">Historique des candidatures</td>
                            <td className="border border-gray-200 px-4 py-2">3 ans après la dernière activité</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-200 px-4 py-2">Données de connexion</td>
                            <td className="border border-gray-200 px-4 py-2">12 mois maximum</td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="border border-gray-200 px-4 py-2">Compte supprimé</td>
                            <td className="border border-gray-200 px-4 py-2">30 jours (puis suppression définitive)</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>

                {/* Section 8 */}
                <section id="contact">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <Mail className="w-6 h-6 mr-3 text-blue-600" />
                    8. Nous contacter
                  </h2>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                    <p className="text-gray-700 mb-4">
                      Pour toute question concernant cette politique de confidentialité ou le traitement de vos données personnelles :
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Job2mada - Équipe Protection des Données</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>📧 Email : <a href="mailto:support@job2mada.com" className="text-blue-600 hover:underline">support@job2mada.com</a></p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Délai de réponse</h4>
                        <p className="text-sm text-gray-600">
                          Nous nous engageons à répondre à vos demandes dans un délai maximum de 
                          <strong className="text-blue-600"> 30 jours</strong>.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Updates */}
                <section className="border-t pt-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Modifications de cette politique</h2>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <p className="text-gray-700 mb-4">
                      Cette politique de confidentialité peut être mise à jour pour refléter les changements 
                      dans nos pratiques ou pour des raisons légales. Les modifications importantes vous seront 
                      notifiées par email ou via une notification sur la plateforme.
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Version actuelle :</strong> 1.0 | 
                      <strong> Date d'entrée en vigueur :</strong> {new Date().toLocaleDateString('fr-FR')}
                    </p>
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