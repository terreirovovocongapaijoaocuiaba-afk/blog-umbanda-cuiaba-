
import React from 'react';
import { Lock, Crown, Clock, CheckCircle, Sparkles } from 'lucide-react';
import { getTimeUntilNextFree } from '../lib/usageUtils';

interface PremiumLockProps {
  children: React.ReactNode;
  isLocked: boolean;
  onUnlock: () => void;
  title?: string;
  price?: string;
  benefits?: string[];
}

const PremiumLock: React.FC<PremiumLockProps> = ({ 
  children, 
  isLocked, 
  onUnlock, 
  title = "Análise Completa", 
  price = "9,90",
  benefits = [
    "Interpretação detalhada e profunda",
    "Conselhos práticos dos Guias",
    "Recomendações personalizadas",
    "Acesso sem filas ou esperas"
  ]
}) => {
  if (!isLocked) {
    return <div className="animate-fadeIn">{children}</div>;
  }

  const timeLeft = getTimeUntilNextFree();

  return (
    <div className="relative rounded-2xl overflow-hidden bg-[#fdfcf8] dark:bg-stone-900 shadow-xl border border-stone-200 dark:border-stone-800">
      {/* Content Preview (Blurred) */}
      <div className="p-8 md:p-12 filter blur-[6px] select-none opacity-50 pointer-events-none max-h-[400px] overflow-hidden">
        {children}
      </div>

      {/* Lock Overlay */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 bg-gradient-to-b from-transparent via-white/80 to-white dark:via-stone-900/80 dark:to-stone-900">
        
        <div className="max-w-md w-full bg-white dark:bg-stone-950 p-8 rounded-2xl border border-umbanda-gold/30 shadow-2xl transform transition-all hover:scale-[1.02] duration-300">
          
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-umbanda-gold to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-yellow-600/20 relative">
              <Lock size={28} />
              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white dark:border-stone-900 animate-pulse">
                Premium
              </div>
            </div>
            <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-white mb-2">
              Desbloquear {title}
            </h3>
            <p className="text-stone-500 dark:text-stone-400 text-sm">
              Você já usou seu recurso gratuito de hoje.
            </p>
          </div>

          {/* Timer & Benefits */}
          <div className="bg-stone-50 dark:bg-stone-900/50 rounded-xl p-4 mb-6 border border-stone-100 dark:border-stone-800">
             <div className="flex justify-between items-center mb-4 pb-4 border-b border-stone-200 dark:border-stone-700">
                <span className="text-xs font-bold uppercase text-stone-500 flex items-center gap-2">
                    <Clock size={14}/> Próximo Grátis
                </span>
                <span className="font-mono font-bold text-umbanda-gold">{timeLeft}</span>
             </div>
             <div className="space-y-2">
                <p className="text-xs font-bold uppercase text-stone-400 mb-2">Na versão completa:</p>
                {benefits.map((b, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300">
                        <CheckCircle size={14} className="text-green-500 flex-shrink-0"/> {b}
                    </div>
                ))}
             </div>
          </div>

          {/* CTAs */}
          <button 
            onClick={onUnlock}
            className="w-full py-4 bg-gradient-to-r from-umbanda-red to-red-800 hover:from-red-600 hover:to-red-900 text-white font-bold rounded-xl shadow-lg shadow-red-900/20 transition-all flex items-center justify-center gap-2 mb-3 group"
          >
            <Sparkles size={18} className="group-hover:rotate-12 transition-transform"/> 
            Liberar Agora por R$ {price}
          </button>
          
          <button className="w-full py-2 text-stone-500 hover:text-umbanda-gold text-xs font-bold uppercase tracking-wider transition-colors">
             Ou seja Membro VIP (Acesso Ilimitado)
          </button>

        </div>
      </div>
    </div>
  );
};

export default PremiumLock;
