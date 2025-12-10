
import React, { useState, useEffect } from 'react';
import { Star, Quote } from 'lucide-react';
import { EXTENDED_TESTIMONIALS } from '../constants';

const TestimonialCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotate logic (optional, keeping it simple grid for better conversion visibility)
  // For high conversion, grid is often better than slider so user sees volume.
  // We will display a grid of top 3, then a slider for mobile.

  return (
    <section className="relative py-24 bg-stone-100 dark:bg-stone-900 transition-colors duration-300 overflow-hidden">
      
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img 
            src="https://images.unsplash.com/photo-1511406361295-e94066fea13f?q=80&w=1920&auto=format&fit=crop" 
            alt="Fundo Espiritual" 
            className="w-full h-full object-cover opacity-10 dark:opacity-20 grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-100/90 via-stone-100/60 to-stone-100 dark:from-stone-900/95 dark:via-stone-900/80 dark:to-stone-900"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <span className="text-umbanda-gold font-bold tracking-widest text-xs uppercase mb-2 block">Prova Social</span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 dark:text-white mb-4">
             Quem usa, confia e recomenda
          </h2>
          <div className="w-24 h-1 bg-umbanda-red mx-auto rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {EXTENDED_TESTIMONIALS.slice(0, 6).map((t) => (
                <div key={t.id} className="bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-stone-200 dark:border-stone-700 relative hover:-translate-y-1 transition-transform duration-300">
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
