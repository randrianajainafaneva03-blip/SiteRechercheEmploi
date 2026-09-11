
import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Dummy data for featured jobs
const featuredJobs = [
  {
    id: 1,
    title: 'Développeur Full-Stack',
    company: 'TechMada',
    location: 'Antananarivo',
    type: 'Temps plein',
    logo: '🌐',
    category: 'IT',
    posted: '2 jours',
    color: 'bg-blue-100 text-job-blue'
  },
  {
    id: 2,
    title: 'Responsable Marketing',
    company: 'Orange Madagascar',
    location: 'Antananarivo',
    type: 'Temps plein',
    logo: '📱',
    category: 'Marketing',
    posted: '3 jours',
    color: 'bg-orange-100 text-job-orange'
  },
  {
    id: 3,
    title: 'Comptable Senior',
    company: 'Bank of Africa',
    location: 'Antananarivo',
    type: 'Temps plein',
    logo: '🏦',
    category: 'Finance',
    posted: '1 jour',
    color: 'bg-green-100 text-job-green'
  },
  {
    id: 4,
    title: 'Ingénieur Civil',
    company: 'Bâtimada',
    location: 'Toamasina',
    type: 'Temps plein',
    logo: '🏗️',
    category: 'Ingénierie',
    posted: '5 jours',
    color: 'bg-yellow-100 text-amber-600'
  },
];

const FeaturedJobs = () => {
  return (
    <section className="py-20 bg-job-light">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <h2 className="section-title mb-2">Offres d'Emploi en Vedette</h2>
            <p className="section-subtitle max-w-2xl">
              Découvrez les dernières opportunités professionnelles à Madagascar
            </p>
          </div>
          <Link to="/jobs" className="mt-4 md:mt-0">
            <Button className="btn-primary group">
              <span>Toutes les offres</span>
              <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
        
        <div className="overflow-hidden">
          <div className="flex flex-nowrap gap-6 pb-6 overflow-x-auto scrollbar-none snap-x">
            {featuredJobs.map((job) => (
              <Link 
                to={`/jobs/${job.id}`} 
                key={job.id} 
                className="group min-w-[300px] sm:min-w-[340px] snap-start"
              >
                <div className="bg-white rounded-xl shadow-elegant p-6 card-hover h-full flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <div className="text-3xl mb-4 bg-gray-100 w-12 h-12 rounded-lg flex items-center justify-center">
                        {job.logo}
                      </div>
                      <Badge className={`${job.color} featured-badge`}>{job.category}</Badge>
                    </div>
                    <h3 className="text-xl font-bold text-job-dark group-hover:text-job-purple transition-colors">
                      {job.title}
                    </h3>
                    <p className="text-job-gray font-medium mt-1">{job.company}</p>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center text-job-gray">
                        <MapPin className="h-4 w-4 mr-2 text-job-purple" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center text-job-gray">
                        <Briefcase className="h-4 w-4 mr-2 text-job-purple" />
                        <span>{job.type}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center text-job-gray text-sm">
                      <Clock className="h-3.5 w-3.5 mr-1 text-job-gray" />
                      <span>Il y a {job.posted}</span>
                    </div>
                    <div className="text-job-purple flex items-center font-medium text-sm group-hover:underline">
                      <span>Voir détails</span>
                      <ArrowRight className="h-3.5 w-3.5 ml-1 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <div className="inline-flex space-x-2">
            <span className="w-2 h-2 rounded-full bg-job-purple/40"></span>
            <span className="w-2 h-2 rounded-full bg-job-purple"></span>
            <span className="w-2 h-2 rounded-full bg-job-purple/40"></span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedJobs;
