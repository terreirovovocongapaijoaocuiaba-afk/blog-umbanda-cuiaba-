import React from 'react';
import { Ritual } from '../types';
import { Clock, BarChart } from 'lucide-react';

const RitualCard: React.FC<{ ritual: Ritual }> = ({ ritual }) => {
  return (
    <div className="group bg-stone-900 rounded-xl overflow-hidden border border-stone-800 hover:border-umbanda-gold/50 transition-all duration-300 hover:shadow-lg hover:shadow-umbanda-gold/10 flex flex-col h-full">
      <div className="relative h-48 overflow-hidden">
        <div className="absolute top-2 left-2 bg-umbanda-black/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-umbanda-gold border border-umbanda-gold/20 z-10 uppercase tracking-wider">
          {ritual.category}
        </div>
        <img 
          src={ritual.imageUrl} 
          alt={ritual.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 filter saturate-50 group-hover:saturate-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 to-transparent opacity-80"></div>
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-serif font-bold text-stone-100 mb-3 group-hover:text-umbanda-gold transition-colors">
          {ritual.title}
        </h3>
        <p className="text-stone-400 text-sm mb-6 line-clamp-3 flex-grow">
          {ritual.description}
        </p>
        
        <div className="flex items-center justify-between text-xs text-stone-500 border-t border-stone-800 pt-4">
          <div className="flex items-center space-x-1">
            <Clock size={14} />
            <span>{ritual.duration}</span>
          </div>
          <div className="flex items-center space-x-1">
            <BarChart size={14} />
            <span>{ritual.difficulty}</span>
          </div>
        </div>
        
        <button className="w-full mt-4 py-2 bg-stone-800 hover:bg-umbanda-red text-stone-300 hover:text-white rounded transition-colors text-sm font-bold uppercase tracking-wide">
          Ver Firmeza
        </button>
      </div>
    </div>
  );
};

export default RitualCard;