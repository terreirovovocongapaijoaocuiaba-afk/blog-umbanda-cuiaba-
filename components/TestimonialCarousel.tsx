
import React, { useState, useEffect } from 'react';
import { Star, Quote } from 'lucide-react';
import { EXTENDED_TESTIMONIALS } from '../constants';

const TestimonialCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotate logic (optional, keeping it simple grid for better conversion visibility)
  // For high conversion, grid is often better than slider so user sees volume.
  // We will display a grid of top 3, then a slider for mobile.

  return (
    <section className="py-24 bg-stone-100 dark:bg-stone-900 transition-colors duration-300">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-umbanda-gold font-bold tracking-widest text-xs uppercase mb-2 block">Prova Social</span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 dark:text-white mb-4">
             Quem usa, confia e recomenda
          </h2>
          <div className="w-24 h-1 bg-umbanda-red mx-auto rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {EXTENDED_TESTIMONIALS.slice(0, 6).map((t) => (
                <div key={t.id} className="bg-white dark:bg-stone-800 p-8 rounded-2xl shadow-lg border border-stone-200 dark:border-stone-700 relative hover:-translate-y-1 transition-transform duration-300">
                    <Quote className="absolute top-6 right-6 text-stone-200 dark:text-stone-600 w-10 h-10" />
                    
                    <div className="flex items-center gap-4 mb-6">
                        <img 
                            src={t.avatarUrl} 
                            alt={t.name} 
                            className="w-14 h-14 rounded-full border-2 border-umbanda-gold object-cover" 
                        />
                        <div>
                            <h4 className="font-bold text-stone-900 dark:text-white">{t.name}</h4>
                            <p className="text-xs text-stone-500 uppercase font-bold">{t.role}</p>
                        </div>
                    </div>

                    <div className="flex text-yellow-400 mb-4">
                        {[...Array(t.stars)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                    </div>

                    <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed italic">
                        "{t.text}"
                    </p>
                </div>
            ))}
        </div>

        <div className="mt-12 text-center">
            <p className="text-stone-500 dark:text-stone-400 text-sm mb-4">Junte-se a mais de 12.000 pessoas transformadas</p>
            <div className="flex justify-center -space-x-2 overflow-hidden mb-4">
                {[1,2,3,4,5,6].map(i => (
                    <img key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-stone-900" src={`https://ui-avatars.com/api/?name=User+${i}&background=random`} alt=""/>
                ))}
            </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialCarousel;
