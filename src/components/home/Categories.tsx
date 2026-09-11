
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MonitorSmartphone, TrendingUp, Landmark, Wrench, 
  Stethoscope, GraduationCap, ShoppingBag, Truck
} from 'lucide-react';

const categories = [
  {
    id: 'it',
    name: 'Informatique & Tech',
    count: 178,
    icon: <MonitorSmartphone className="h-10 w-10" />,
    color: 'bg-blue-50 text-job-blue border-blue-100'
  },
  {
    id: 'marketing',
    name: 'Marketing',
    count: 145,
    icon: <TrendingUp className="h-10 w-10" />,
    color: 'bg-orange-50 text-job-orange border-orange-100'
  },
  {
    id: 'finance',
    name: 'Finance',
    count: 132,
    icon: <Landmark className="h-10 w-10" />,
    color: 'bg-green-50 text-job-green border-green-100'
  },
  {
    id: 'engineering',
    name: 'Ingénierie',
    count: 112,
    icon: <Wrench className="h-10 w-10" />,
    color: 'bg-yellow-50 text-amber-600 border-yellow-100'
  },
  {
    id: 'healthcare',
    name: 'Santé',
    count: 97,
    icon: <Stethoscope className="h-10 w-10" />,
    color: 'bg-red-50 text-red-500 border-red-100'
  },
  {
    id: 'education',
    name: 'Éducation',
    count: 86,
    icon: <GraduationCap className="h-10 w-10" />,
    color: 'bg-purple-50 text-job-purple border-purple-100'
  },
  {
    id: 'retail',
    name: 'Vente au Détail',
    count: 74,
    icon: <ShoppingBag className="h-10 w-10" />,
    color: 'bg-pink-50 text-pink-500 border-pink-100'
  },
  {
    id: 'logistics',
    name: 'Logistique',
    count: 65,
    icon: <Truck className="h-10 w-10" />,
    color: 'bg-indigo-50 text-indigo-500 border-indigo-100'
  }
];

const Categories = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="section-title">Parcourir par Catégorie</h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            Explorez les opportunités professionnelles dans votre domaine d'expertise
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category, index) => (
            <Link to={`/jobs/category/${category.id}`} key={category.id}>
              <div 
                className={`rounded-xl border p-6 card-hover flex items-center justify-between ${category.color} h-full`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex flex-col">
                  <h3 className="text-lg font-bold">{category.name}</h3>
                  <div className="mt-1 text-sm font-medium opacity-80 px-2 py-0.5 rounded-full bg-black/5 inline-block w-fit">
                    {category.count} offres
                  </div>
                </div>
                <div className="category-icon">
                  {category.icon}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
