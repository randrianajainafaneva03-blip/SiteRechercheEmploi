
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const testimonials = [
  {
    id: 1,
    name: 'Rakoto Jean',
    role: 'Développeur Web',
    content: 'Grâce à Job-Mada, j\'ai trouvé un poste de développeur dans une excellente entreprise en moins d\'une semaine. Le processus était simple et efficace.',
    avatar: '/placeholder.svg',
  },
  {
    id: 2,
    name: 'Rasoa Marie',
    role: 'Directrice RH, Orange Madagascar',
    content: 'Job-Mada nous a permis de trouver des talents qualifiés rapidement. La qualité des candidats est exceptionnelle et le service de validation des annonces est très utile.',
    avatar: '/placeholder.svg',
  },
  {
    id: 3,
    name: 'Rabe André',
    role: 'Entrepreneur',
    content: 'Le service de transfert d\'argent de Job-Mada est incroyablement pratique. Je l\'utilise pour payer mes employés à distance et c\'est simple, rapide et sécurisé.',
    avatar: '/placeholder.svg',
  },
];

const Testimonials = () => {
  return (
    <section className="py-16 bg-job-light">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="section-title">Ce que disent nos utilisateurs</h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            Découvrez les expériences de ceux qui ont utilisé Job-Mada pour trouver un emploi ou recruter des talents
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center space-x-4 mb-4">
                <Avatar>
                  <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                  <AvatarFallback className="bg-job-blue text-white">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-job-dark">{testimonial.name}</h3>
                  <p className="text-job-gray text-sm">{testimonial.role}</p>
                </div>
              </div>
              <div className="mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="text-yellow-400">★</span>
                ))}
              </div>
              <p className="text-job-dark">{testimonial.content}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
