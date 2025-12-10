
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Sparkles, Star, Users } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1600609842388-3e4722839569?q=80&w=1920&auto=format&fit=crop" 
          alt="Altar de Umbanda Iluminado" 
          className="w-full h-full object-cover animate-pulse-slow"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/90 via-stone-900/70 to-stone-950"></div>
        {/* Mystic Overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center mt-10 md:mt-16">
        
        {/* Authority Tag */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border border-umbanda-gold/40 bg-black/60 backdrop-blur-md mb-8 animate-fadeIn shadow-[0_0_15px_rgba(217,119,6,0.3)]">
          <Sparkles size={14} className="text-umbanda-gold" />
          <span className="text-[10px] md:text-xs font-bold tracking-widest text-umbanda-gold uppercase">
            Sistema Oficial • Conexão 24 horas
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-2xl animate-slideUp">
          Descubra o que os <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-umbanda-gold to-yellow-200">
            Guias Têm a Dizer
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-stone-300 text-lg md:text-xl max-w-2xl mx-auto mb-8 font-light leading-relaxed animate-slideUp animation-delay-200">
          Obtenha clareza, proteção e direção espiritual agora mesmo. 
          Sem sair de casa, com o respeito e fundamento que sua fé merece.
        </p>

        {/* Mini Social Proof */}
        <div className="flex flex-col items-center justify-center gap-2 mb-10 animate-fadeIn animation-delay-300">
             <div className="flex -space-x-3">
                 {[1,2,3,4].map(i => (
                     <img key={i} src={`https://ui-avatars.com/api/?name=User+${i}&background=random`} className="w-8 h-8 rounded-full border-2 border-stone-900" alt="User" />
                 ))}
                 <div className="w-8 h-8 rounded-full bg-stone-800 border-2 border-stone-900 flex items-center justify-center text-[10px] font-bold text-white">
                     +12k
                 </div>
             </div>
             <div className="flex items-center gap-1">
                 <div className="flex text-umbanda-gold">
                     {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="currentColor"/>)}
                 </div>
                 <span className="text-xs text-stone-400 font-medium">4.9/5 de satisfação</span>
             </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-6 animate-slideUp animation-delay-400">
          <Link 
            to="/servicos" 
            className="group relative px-8 py-4 bg-gradient-to-r from-umbanda-red to-red-800 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-lg shadow-[0_0_20px_rgba(220,38,38,0.5)] hover:shadow-[0_0_30px_rgba(220,38,38,0.8)] transition-all transform hover:-translate-y-1 w-full md:w-auto text-center overflow-hidden"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
            <span className="relative flex items-center justify-center gap-2">
                Começar Minha Jornada <ChevronDown className="rotate-[-90deg]" size={18}/>
            </span>
          </Link>
          <Link 
            to="/oraculo" 
            className="px-8 py-4 bg-transparent border border-white/20 hover:border-umbanda-gold text-stone-300 hover:text-white font-semibold rounded-lg hover:bg-white/5 transition-all backdrop-blur-sm w-full md:w-auto text-center flex items-center justify-center gap-2"
          >
            <Sparkles size={18} /> Testar Oráculo Grátis
          </Link>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
        <ChevronDown className="w-8 h-8 text-white" />
      </div>
    </section>
  );
};

export default Hero;
