import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Sparkles } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://picsum.photos/id/1056/1920/1080" 
          alt="Altar de Umbanda" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-umbanda-black/80 via-umbanda-black/60 to-umbanda-black"></div>
        {/* Red tint overlay */}
        <div className="absolute inset-0 bg-umbanda-red/20 mix-blend-overlay"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center mt-16">
        <div className="inline-flex items-center space-x-2 px-4 py-1 rounded-full border border-umbanda-gold/40 bg-black/40 backdrop-blur-sm mb-6 animate-fadeIn">
          <Sparkles size={14} className="text-umbanda-gold" />
          <span className="text-xs md:text-sm font-bold tracking-widest text-umbanda-gold uppercase">
            A Força que vem da Aruanda
          </span>
          <Sparkles size={14} className="text-umbanda-gold" />
        </div>

        <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-lg animate-slideUp">
          Tradição, Mistério <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-umbanda-gold to-yellow-200">
            e Axé
          </span>
        </h1>

        <p className="text-stone-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-light leading-relaxed animate-slideUp animation-delay-200">
          Bem-vindo ao portal oficial do <span className="text-white font-semibold">Umbanda Cuiabá</span>. 
          Aqui firmamos o ponto, batemos cabeça e compartilhamos o conhecimento sagrado dos nossos guias.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-6 animate-slideUp animation-delay-400">
          <Link 
            to="/rituais" 
            className="px-8 py-4 bg-umbanda-red hover:bg-red-800 text-white font-bold rounded-lg shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] transition-all transform hover:-translate-y-1 w-full md:w-auto text-center"
          >
            Ver Rituais & Firmezas
          </Link>
          <Link 
            to="/vip" 
            className="px-8 py-4 bg-transparent border border-umbanda-white/30 hover:border-umbanda-gold text-white font-semibold rounded-lg hover:bg-umbanda-gold/10 transition-all backdrop-blur-sm w-full md:w-auto text-center"
          >
            Entrar no Clube VIP
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