import React, { useEffect, useState } from 'react';
import SectionHeading from './SectionHeading';
import { Shield, Heart, Anchor, Sparkles, Sword, Info } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Entity } from '../types';

const EntitySection: React.FC = () => {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntities = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'entities'));
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Entity));
        setEntities(data);
      } catch (error) {
        console.error("Erro ao buscar entidades", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEntities();
  }, []);

  const getIcon = (symbol: string) => {
    const s = symbol?.toLowerCase();
    if (s === 'tridente') return <Sparkles className="w-8 h-8 text-red-600 dark:text-red-500" />;
    if (s === 'taça') return <Heart className="w-8 h-8 text-red-600 dark:text-red-500" />;
    if (s === 'flecha') return <Shield className="w-8 h-8 text-green-700 dark:text-green-600" />;
    if (s === 'cachimbo' || s === 'ancora') return <Anchor className="w-8 h-8 text-stone-700 dark:text-white" />;
    if (s === 'espada') return <Sword className="w-8 h-8 text-blue-700 dark:text-blue-500" />;
    return <Sparkles className="w-8 h-8 text-umbanda-gold" />;
  };

  return (
    <section className="py-20 bg-stone-100 dark:bg-stone-950 relative transition-colors duration-300">
      {/* Pattern opacity adjusted for light mode visibility */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-5 dark:opacity-20 pointer-events-none"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <SectionHeading subtitle="Nossos Guias" title="Linhas de Trabalho" />
        
        {loading ? (
           <div className="text-center text-stone-500">Carregando guias...</div>
        ) : entities.length === 0 ? (
           <div className="text-center text-stone-500 border border-stone-300 dark:border-stone-800 rounded p-8">
              Nenhuma entidade cadastrada. Acesse o painel para adicionar.
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {entities.map((entity) => (
              <div key={entity.id} className="bg-white dark:bg-stone-900/50 p-6 rounded-lg border border-stone-200 dark:border-stone-800 hover:border-umbanda-red/40 hover:shadow-xl dark:hover:bg-stone-900 transition-all group shadow-sm">
                <div className="mb-4 bg-stone-50 dark:bg-stone-950 w-16 h-16 rounded-full flex items-center justify-center border border-stone-200 dark:border-stone-800 group-hover:border-umbanda-gold transition-colors shadow-inner">
                  {getIcon(entity.symbol)}
                </div>
                <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-white mb-2">{entity.name}</h3>
                <p className="text-stone-600 dark:text-stone-400 text-sm mb-4 h-20 line-clamp-3 leading-relaxed">{entity.description}</p>
                <div className="text-xs font-bold text-umbanda-gold uppercase tracking-wider bg-umbanda-gold/10 inline-block px-2 py-1 rounded">
                  {entity.greeting}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default EntitySection;