
import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Moon, Sun, Flame, Brain, ArrowRight } from 'lucide-react';
import TrustBadges from '../components/TrustBadges';
import { PricingComparison, FooterCTA } from '../components/ConversionSections';

const ServicesHub: React.FC = () => {
  return (
    <div className="bg-[#1a1520] min-h-screen text-stone-200 animate-fadeIn font-sans pb-0">
       {/* Hero Section */}
       <div className="relative pt-32 pb-16 text-center px-6 bg-gradient-to-b from-purple-900/30 to-transparent">
          <div className="inline-block p-3 rounded-full bg-purple-900/40 border border-purple-500/30 mb-6 backdrop-blur">
             <Sparkles size={24} className="text-purple-400" />
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4 drop-shadow-xl">
            Templo Digital
          </h1>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto font-light mb-8">
            Ferramentas espirituais autônomas guiadas por inteligência ancestral para iluminar seu caminho agora mesmo.
          </p>
          <TrustBadges />
       </div>

       <div className="container mx-auto px-6 max-w-6xl pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
             
             {/* 1. Oráculo */}
             <ServiceCard 
                to="/oraculo"
                title="Oráculo dos Guias"
                desc="Tire as cartas e receba conselhos diretos das entidades de luz."
                icon={<Sparkles className="w-10 h-10 text-amber-400" />}
                color="from-amber-900/40 to-amber-950"
                borderColor="border-amber-700/50"
                badge="Mais Popular"
             />

             {/* 2. Interpretador de Sonhos */}
             <ServiceCard 
                to="/servicos/sonhos"
                title="Revelador de Sonhos"
                desc="Descubra o significado espiritual do seu sonho e receba números da sorte."
                icon={<Moon className="w-10 h-10 text-indigo-400" />}
                color="from-indigo-900/40 to-indigo-950"
                borderColor="border-indigo-700/50"
             />

             {/* 3. Terapeuta de Ervas */}
             <ServiceCard 
                to="/servicos/banhos"
                title="Terapeuta de Ervas"
                desc="Diagnóstico energético e receita personalizada de banho de descarrego."
                icon={<Sun className="w-10 h-10 text-green-400" />}
                color="from-green-900/40 to-green-950"
                borderColor="border-green-700/50"
             />

             {/* 4. Calculadora Orixá */}
             <ServiceCard 
                to="/servicos/orixa"
                title="Orixá de Cabeça"
                desc="Calculadora numerológica dos Odus para descobrir seu pai e mãe de cabeça."
                icon={<Brain className="w-10 h-10 text-white" />}
                color="from-stone-800 to-black"
                borderColor="border-stone-700"
             />

             {/* 5. Leitura de Vela */}
             <ServiceCard 
                to="/servicos/velas"
                title="Ceromancia Digital"
                desc="Entenda o recado da chama da sua vela. O pedido foi aceito?"
                icon={<Flame className="w-10 h-10 text-red-500" />}
                color="from-red-900/40 to-red-950"
                borderColor="border-red-700/50"
             />

          </div>

          <PricingComparison />
       </div>

       <FooterCTA />
    </div>
  );
};

const ServiceCard: React.FC<{ to: string, title: string, desc: string, icon: React.ReactNode, color: string, borderColor: string, badge?: string }> = ({ to, title, desc, icon, color, borderColor, badge }) => (
    <Link to={to} className={`block relative group overflow-hidden rounded-2xl bg-gradient-to-br ${color} border ${borderColor} p-8 hover:-translate-y-2 transition-transform duration-300 shadow-xl`}>
        {badge && (
            <div className="absolute top-4 right-4 bg-white/10 backdrop-blur text-white text-[10px] font-bold uppercase px-2 py-1 rounded border border-white/20">
                {badge}
            </div>
        )}
        <div className="mb-6 bg-black/20 w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
            {icon}
        </div>
        <h3 className="text-2xl font-serif font-bold text-white mb-2">{title}</h3>
        <p className="text-stone-300 text-sm leading-relaxed mb-6">{desc}</p>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-70 group-hover:opacity-100 transition-opacity">
            Acessar <ArrowRight size={14}/>
        </div>
    </Link>
);

export default ServicesHub;
