import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CreditCard, Send, Shield, Clock } from 'lucide-react';

const MoneyTransferPromo = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-amber-700 via-amber-600 to-amber-800 relative overflow-hidden">
      {/* Texture overlay */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diamond-upholstery.png')] opacity-10"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
              Transfert d'Argent <br />
              <span className="text-amber-200">Rapide et Sécurisé</span>
            </h2>
            <p className="text-xl text-white">
              Envoyez de l'argent à vos proches à Madagascar en toute sécurité, 
              avec les meilleurs taux et des frais minimes.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="flex items-start space-x-4">
                <div className="bg-amber-500 p-3 rounded-xl shadow-md">
                  <Send className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">Transfert Rapide</h3>
                  <p className="text-amber-100 text-sm">Argent reçu en quelques minutes</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-amber-500 p-3 rounded-xl shadow-md">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">Sécurité Garantie</h3>
                  <p className="text-amber-100 text-sm">Transactions cryptées et sécurisées</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-amber-500 p-3 rounded-xl shadow-md">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">Plusieurs Options</h3>
                  <p className="text-amber-100 text-sm">Visa, Mastercard, PayPal et plus</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-amber-500 p-3 rounded-xl shadow-md">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">24/7 Disponible</h3>
                  <p className="text-amber-100 text-sm">Service client disponible en permanence</p>
                </div>
              </div>
            </div>
            
            <div className="pt-4">
              <Link to="/money-transfer">
                <Button size="lg" className="bg-white text-amber-800 hover:bg-amber-100 shadow-xl transition-all font-medium text-lg py-6 px-8">
                  Transférer de l'argent maintenant
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="relative">
            {/* Remplacer le fond blanc flou par une bordure élégante en ambre */}
            <div className="absolute -inset-0.5 bg-amber-300 rounded-xl blur-[1px]"></div>
            
            <div className="bg-white rounded-xl p-8 shadow-xl relative">
              <h3 className="text-2xl font-bold text-amber-800 mb-6">Simuler un transfert</h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Montant à envoyer
                  </label>
                  <div className="relative">
                    <select className="absolute top-0 bottom-0 left-0 bg-amber-100 text-amber-800 px-3 border-r border-amber-300 rounded-l-md font-medium">
                      <option>EUR</option>
                      <option>USD</option>
                    </select>
                    <input 
                      type="text" 
                      defaultValue="100.00"
                      className="w-full pl-16 pr-3 py-2 border border-amber-300 rounded-md bg-amber-50 text-amber-900 font-medium" 
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Destinataire recevra
                  </label>
                  <div className="relative">
                    <select className="absolute top-0 bottom-0 left-0 bg-amber-100 text-amber-800 px-3 border-r border-amber-300 rounded-l-md font-medium">
                      <option>MGA</option>
                    </select>
                    <input 
                      type="text" 
                      defaultValue="451,365.00" 
                      className="w-full pl-16 pr-3 py-2 bg-amber-50 border border-amber-300 rounded-md text-amber-900 font-medium"
                      readOnly
                    />
                  </div>
                  <p className="text-sm text-amber-800 mt-1">
                    1 EUR = 4,513.65 MGA (Taux du jour)
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frais de service
                  </label>
                  <input 
                    type="text" 
                    defaultValue="2.50 EUR" 
                    className="w-full px-3 py-2 bg-amber-50 border border-amber-300 rounded-md text-amber-900 font-medium"
                    readOnly
                  />
                </div>
                
                <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white transition-all font-medium text-lg py-6">
                  Continuer
                </Button>
                
                <div className="flex items-center justify-center space-x-4 pt-2">
                  <div className="bg-white p-1.5 rounded shadow-sm">
                    <img src="https://cdn-icons-png.flaticon.com/512/349/349230.png" alt="Visa" className="h-6" />
                  </div>
                  <div className="bg-white p-1.5 rounded shadow-sm">
                    <img src="https://cdn-icons-png.flaticon.com/512/349/349228.png" alt="MasterCard" className="h-6" />
                  </div>
                  <div className="bg-white p-1.5 rounded shadow-sm">
                    <img src="https://cdn-icons-png.flaticon.com/512/174/174861.png" alt="PayPal" className="h-6" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MoneyTransferPromo;