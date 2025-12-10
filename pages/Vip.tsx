import React from 'react';
import { CheckCircle, Crown, Lock, PlayCircle, BookOpen, Star } from 'lucide-react';

const Vip: React.FC = () => {
  return (
    <div className="animate-fadeIn">
      {/* Hero VIP - Mantém escuro para sensação premium */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-50 z-0"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-umbanda-red/20 to-[#fdfcf8] dark:to-stone-950 z-0"></div>
        <div className="absolute inset-0 bg-stone-950/80 dark:bg-transparent z-0"></div>
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-umbanda-gold/10 border border-umbanda-gold text-umbanda-gold mb-8 animate-bounce backdrop-blur-sm">
            <Crown size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Área de Membros Exclusiva</span>
          </div>
          
          <h1 className="text-4xl md:text-7xl font-serif font-bold text-white mb-6 drop-shadow-lg">
            Clube VIP <span className="text-umbanda-gold">Saravá</span>
          </h1>
          <p className="text-xl text-stone-200 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Aprofunde seus estudos, tenha acesso a rituais avançados e faça parte de uma comunidade fechada de aprendizado espiritual.
          </p>

          <div className="flex flex-col md:flex-row justify-center gap-4">
            <button className="px-8 py-4 bg-umbanda-gold hover:bg-yellow-500 text-stone-950 font-bold rounded-lg shadow-[0_0_20px_rgba(217,119,6,0.4)] transition-all transform hover:-translate-y-1">
              Quero ser Membro VIP
            </button>
            <button className="px-8 py-4 bg-white/10 border border-white/20 hover:border-white text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 backdrop-blur-md">
              <Lock size={18} /> Já sou assinante
            </button>
          </div>
        </div>
      </section>

      {/* Benefits Grid - Adaptive Light/Dark */}
      <section className="py-20 bg-stone-100 dark:bg-stone-950 transition-colors duration-300">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <BenefitCard 
              icon={<PlayCircle size={32} />}
              title="Aulas em Vídeo"
              description="Acesso a gravações de doutrinas, pontos cantados explicados e tutoriais de firmezas passo a passo."
            />
            <BenefitCard 
              icon={<BookOpen size={32} />}
              title="E-books Mensais"
              description="Receba todo mês um material em PDF sobre orixás, ervas, banhos e fundamentos da Umbanda."
            />
            <BenefitCard 
              icon={<Star size={32} />}
              title="Rituais Avançados"
              description="Aprenda firmezas que não são publicadas no blog aberto, para proteção forte e prosperidade."
            />
          </div>
        </div>
      </section>

      {/* Pricing / CTA - Adaptive */}
      <section className="py-20 bg-white dark:bg-stone-900 border-y border-stone-200 dark:border-stone-800 transition-colors duration-300">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="bg-gradient-to-br from-stone-100 to-white dark:from-stone-800 dark:to-stone-900 rounded-2xl p-8 md:p-12 border border-stone-200 dark:border-stone-700 shadow-2xl relative overflow-hidden transition-colors duration-300">
            <div className="absolute top-0 right-0 bg-umbanda-red text-white text-xs font-bold px-4 py-2 rounded-bl-xl uppercase shadow-sm">
              Oferta Especial
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-serif font-bold text-stone-900 dark:text-white mb-4">O conhecimento do terreiro na sua casa.</h3>
                <ul className="space-y-4 text-stone-600 dark:text-stone-300">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="text-umbanda-gold flex-shrink-0" size={20} />
                    <span>Acesso imediato a todo acervo</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="text-umbanda-gold flex-shrink-0" size={20} />
                    <span>Grupo exclusivo no WhatsApp</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="text-umbanda-gold flex-shrink-0" size={20} />
                    <span>Desconto em consultas</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="text-umbanda-gold flex-shrink-0" size={20} />
                    <span>Cancela quando quiser</span>
                  </li>
                </ul>
              </div>

              <div className="text-center bg-white dark:bg-stone-950/50 p-8 rounded-xl border border-stone-200 dark:border-stone-800 shadow-inner">
                <p className="text-stone-500 dark:text-stone-400 text-sm uppercase font-bold mb-2">Assinatura Mensal</p>
                <div className="text-5xl font-bold text-stone-900 dark:text-white mb-2">R$ 29,90</div>
                <p className="text-stone-500 text-xs mb-6">Cobrado mensalmente</p>
                <button className="w-full py-4 bg-umbanda-red hover:bg-red-800 text-white font-bold rounded shadow-lg transition-colors">
                  Assinar Agora
                </button>
                <p className="text-xs text-stone-500 mt-4">Compra 100% segura</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const BenefitCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="p-8 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-umbanda-gold dark:hover:border-umbanda-gold transition-all group shadow-lg dark:shadow-none">
    <div className="w-16 h-16 bg-stone-50 dark:bg-stone-950 rounded-full flex items-center justify-center text-umbanda-gold mb-6 group-hover:scale-110 transition-transform shadow-inner border border-stone-100 dark:border-stone-800">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-3">{title}</h3>
    <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
      {description}
    </p>
  </div>
);

export default Vip;