
import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, User, Briefcase, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Dummy data for featured candidates
const candidates = [
  {
    id: 1,
    name: 'Rakoto Jean',
    title: 'Développeur Web Senior',
    location: 'Antananarivo',
    experience: '5 ans',
    skills: ['React', 'Node.js', 'MongoDB'],
    avatar: '/placeholder.svg',
  },
  {
    id: 2,
    name: 'Rasoa Marie',
    title: 'Designer UX/UI',
    location: 'Antananarivo',
    experience: '3 ans',
    skills: ['Figma', 'Adobe XD', 'Sketch'],
    avatar: '/placeholder.svg',
  },
  {
    id: 3,
    name: 'Rabe Koto',
    title: 'Chef de Projet',
    location: 'Fianarantsoa',
    experience: '7 ans',
    skills: ['Gestion de projet', 'Agile', 'Scrum'],
    avatar: '/placeholder.svg',
  }
];

const FeaturedCandidates = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-elegant opacity-5"></div>
      <div className="container-custom relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <h2 className="section-title mb-2">Talents en Vedette</h2>
            <p className="section-subtitle max-w-2xl">
              Rencontrez les professionnels qualifiés disponibles à Madagascar
            </p>
          </div>
          <Link to="/candidates" className="mt-4 md:mt-0">
            <Button className="btn-primary group">
              <span>Tous les profils</span>
              <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {candidates.map((candidate, index) => (
            <Link to={`/candidates/${candidate.id}`} key={candidate.id} className="group">
              <div 
                className="bg-white rounded-xl shadow-elegant p-8 card-hover border-t-4 border-job-purple h-full animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 mb-4 ring-4 ring-job-purple/20">
                    <AvatarImage src={candidate.avatar} alt={candidate.name} />
                    <AvatarFallback className="bg-gradient-elegant text-white text-xl">
                      {candidate.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-bold text-job-dark group-hover:text-job-purple transition-colors">
                    {candidate.name}
                  </h3>
                  <p className="text-job-purple font-medium mt-1">{candidate.title}</p>
                  <div className="mt-3 flex items-center text-job-gray">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{candidate.location}</span>
                  </div>
                  <div className="mt-2 flex items-center text-job-gray">
                    <Briefcase className="h-4 w-4 mr-1" />
                    <span>{candidate.experience} d'expérience</span>
                  </div>
                  
                  <div className="mt-5 flex flex-wrap gap-2 justify-center">
                    {candidate.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="bg-job-light border border-job-purple/20 text-job-purple">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="mt-6 w-full pt-4 border-t border-gray-100 text-job-purple flex items-center font-medium text-sm justify-center group-hover:underline">
                    <span>Voir profil complet</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-1 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCandidates;
