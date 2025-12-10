import React from 'react';
import { Ritual } from '../types';
import { Clock, BarChart } from 'lucide-react';

const RitualCard: React.FC<{ ritual: Ritual }> = ({ ritual }) => {
  return (
    <div className="group bg-white dark:bg-stone-900 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800 hover:border-umbanda-gold/50 transition-all duration-300 hover:shadow-xl dark:hover:shadow-lg hover:shadow-umbanda-gold/10 flex flex-col h-full shadow-md dark:shadow-none">
      <div className="relative h-48 overflow-hidden">
        <div className="absolute top-2 left-2 bg-umbanda-black/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-umbanda-gold border border-umbanda-gold/20 z-10 uppercase tracking-wider">
          {ritual.category}
        </div>
        <img 
          src={ritual.imageUrl} 
          alt={ritual.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 filter saturate-100 dark:saturate-50 dark:group-hover:saturate-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 dark:from-stone-900 dark:opacity-80 transition-opacity"></div>
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-3 group-hover:text-umbanda-gold transition-colors">
          {ritual.title}
        </h3>
        <p className="text-stone-600 dark:text-stone-400 text-sm mb-6 line-clamp-3 flex-grow leading-relaxed">
          {ritual.description}
        </p>
        
        <div className="flex items-center justify-between text-xs text-stone-500 border-t border-stone-100 dark:border-stone-800 pt-4">
          <div className="flex items-center space-x-1">
            <Clock size={14} />
            <span>{ritual.duration}</span>
          </div>
          <div className="flex items-center space-x-1">
            <BarChart size={14} />
            <span>{ritual.difficulty}</span>
          </div>
        </div>
        
        <button className="w-full mt-4 py-2 bg-stone-100 hover:bg-umbanda-red dark:bg-stone-800 text-stone-700 hover:text-white dark:text-stone-300 dark:hover:text-white rounded transition-colors text-sm font-bold uppercase tracking-wide">
          Ver Firmeza
        </button>
      </div>
    </div>
  );
};

export default RitualCard;