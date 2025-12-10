import React from 'react';

const Newsletter: React.FC = () => {
  return (
    <section className="py-24 bg-gradient-to-r from-red-900 to-red-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-30"></div>
      <div className="container mx-auto px-6 relative z-10 text-center">
        <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6">
          Faça parte da nossa Corrente
        </h2>
        <p className="text-red-100 text-lg mb-10 max-w-2xl mx-auto">
          Receba rezas, avisos de giras e conteúdos exclusivos do Clube VIP diretamente no seu e-mail. Axé não se vende, se compartilha.
        </p>
        
        <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
          <input 
            type="email" 
            placeholder="Seu melhor e-mail" 
            className="flex-grow px-6 py-4 rounded-lg bg-red-950/50 border border-red-700 text-white placeholder-red-300 focus:outline-none focus:ring-2 focus:ring-umbanda-gold"
          />
          <button 
            type="button"
            className="px-8 py-4 bg-umbanda-gold hover:bg-yellow-500 text-red-950 font-bold rounded-lg transition-colors shadow-lg"
          >
            Inscrever
          </button>
        </form>
        <p className="mt-4 text-xs text-red-300 opacity-70">
          Respeitamos sua privacidade. Sem spam, apenas luz.
        </p>
      </div>
    </section>
  );
};

export default Newsletter;