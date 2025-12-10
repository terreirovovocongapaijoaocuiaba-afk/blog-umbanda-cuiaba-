
import React, { useEffect, useState } from 'react';
import SectionHeading from '../components/SectionHeading';
import RitualCard from '../components/RitualCard';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Ritual } from '../types';
import { Loader2, Lock, Crown, Star, Unlock } from 'lucide-react';
import { Link } from 'react-router-dom';
import TrustBadges from '../components/TrustBadges';
import { FooterCTA } from '../components/ConversionSections';
import { isUserPremium } from '../lib/usageUtils';

const Rituals: React.FC = () => {
  const [rituals, setRituals] = useState<Ritual[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Todos');
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    setIsPremium(isUserPremium());
    const fetchRituals = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'rituals'));
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ritual));
        setRituals(data);
      } catch (error) {
        console.error("Erro ao buscar rituais:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRituals();
  }, []);

  const filteredRituals = filter === 'Todos' ? rituals : rituals.filter(r => r.category === filter);

  return (
    <div className="bg-[#fdfcf8] dark:bg-stone-950 min-h-screen transition-colors duration-300">
        <div className="pt-32 pb-10 container mx-auto px-6 animate-fadeIn">
            <div className="text-center max-w-3xl mx-auto mb-12">
                <SectionHeading subtitle="Arquivo Sagrado" title="Rituais & Firmezas" centered={true}/>
                <p className="text-stone-600 dark:text-stone-400 text-lg leading-relaxed">
                    Aprenda a manipular as energias da natureza com responsabilidade e fundamento.
                    Práticas testadas e aprovadas pela nossa corrente.
                </p>
            </div>
            
            <TrustBadges />

            <div className="flex flex-wrap justify-center gap-4 my-12">
                {['Todos', 'Prosperidade', 'Amor', 'Proteção', 'Limpeza'].map(cat => (
                    <button 
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all transform hover:scale-105 ${
                            filter === cat 
                            ? 'bg-umbanda-red text-white shadow-lg shadow-red-900/30' 
                            : 'bg-stone-200 hover:bg-stone-300 text-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800 border border-transparent dark:border-stone-800'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 text-umbanda-gold animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                    {filteredRituals.length > 0 ? filteredRituals.map(ritual => (
                        <RitualCard key={ritual.id} ritual={ritual} />
                    )) : (
                        <div className="col-span-3 text-center py-20 bg-stone-100 dark:bg-stone-900 rounded-2xl border border-dashed border-stone-300 dark:border-stone-800">
                            <p className="text-stone-500">Nenhum ritual encontrado nesta categoria.</p>
                        </div>
                    )}

                    {/* VIP TEASER CARD - Dynamic Status */}
                    <div className={`relative group overflow-hidden rounded-xl border p-1 ${isPremium ? 'bg-gradient-to-br from-green-900 to-black border-green-500/50' : 'bg-gradient-to-br from-stone-900 to-black border-umbanda-gold/30'}`}>
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                        <div className="h-full bg-stone-950/90 backdrop-blur rounded-lg p-8 flex flex-col items-center justify-center text-center relative z-10">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-lg animate-pulse ${isPremium ? 'bg-green-600 shadow-green-600/20' : 'bg-gradient-to-br from-umbanda-gold to-yellow-600 shadow-yellow-600/20'}`}>
                                {isPremium ? <Unlock className="text-white" size={28}/> : <Lock className="text-white" size={28}/>}
                            </div>
                            <h3 className="text-2xl font-serif font-bold text-white mb-2">Rituais de Alta Magia</h3>
                            <p className="text-stone-400 text-sm mb-6">
                                {isPremium ? 'Você tem acesso total às firmezas avançadas.' : 'Acesso exclusivo a firmezas avançadas para casos difíceis e urgentes.'}
                            </p>
                            <ul className="text-left text-sm text-stone-300 space-y-2 mb-8">
                                <li className="flex items-center gap-2"><Star size={12} className="text-umbanda-gold"/> Abertura de Caminhos Pesada</li>
                                <li className="flex items-center gap-2"><Star size={12} className="text-umbanda-gold"/> Amarração (Adoçamento)</li>
                                <li className="flex items-center gap-2"><Star size={12} className="text-umbanda-gold"/> Quebra de Maldição</li>
                            </ul>
                            <Link to="/vip" className={`w-full py-3 font-bold rounded-lg transition-colors uppercase tracking-widest text-xs flex items-center justify-center gap-2 ${isPremium ? 'bg-green-600 text-white hover:bg-green-500' : 'bg-white text-stone-900 hover:bg-stone-200'}`}>
                                {isPremium ? <><Unlock size={14}/> Acessar Agora</> : <><Crown size={14}/> Desbloquear Agora</>}
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
        
        <FooterCTA />
    </div>
  );
};

export default Rituals;
