
import React from 'react';
import { ShieldCheck, Users, Clock, HeartHandshake } from 'lucide-react';

const TrustBadges: React.FC = () => {
  return (
    <section className="bg-stone-100 dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 py-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center justify-center">
          
          <Badge 
            icon={<Users className="text-umbanda-gold" size={24}/>} 
            title="+12.000" 
            desc="Filhos de fé atendidos" 
          />
          <Badge 
            icon={<ShieldCheck className="text-green-600 dark:text-green-500" size={24}/>} 
            title="100% Seguro" 
            desc="Sigilo absoluto garantido" 
          />
          <Badge 
            icon={<Clock className="text-blue-600 dark:text-blue-500" size={24}/>} 
            title="Online 24h" 
            desc="Orientação a qualquer momento" 
          />
          <Badge 
            icon={<HeartHandshake className="text-umbanda-red" size={24}/>} 
            title="Comunidade" 
            desc="Aprovado por Umbandistas" 
          />

        </div>
      </div>
    </section>
  );
};

const Badge = ({ icon, title, desc }: any) => (
  <div className="flex flex-col md:flex-row items-center justify-center gap-3 text-center md:text-left">
    <div className="bg-white dark:bg-stone-800 p-3 rounded-full shadow-sm">
      {icon}
    </div>
    <div>
      <h4 className="font-bold text-stone-900 dark:text-white text-sm md:text-base leading-tight">{title}</h4>
      <p className="text-[10px] md:text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wide">{desc}</p>
    </div>
  </div>
);

export default TrustBadges;
