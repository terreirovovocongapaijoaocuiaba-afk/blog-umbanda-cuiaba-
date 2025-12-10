import React, { useEffect, useState } from 'react';
import SectionHeading from '../components/SectionHeading';
import RitualCard from '../components/RitualCard';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Ritual } from '../types';
import { Loader2 } from 'lucide-react';

const Rituals: React.FC = () => {
  const [rituals, setRituals] = useState<Ritual[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  return (
    <div className="pt-32 pb-20 container mx-auto px-6 animate-fadeIn">
      <SectionHeading subtitle="Arquivo Sagrado" title="Todos os Rituais" />
      
      <div className="flex flex-wrap gap-4 mb-12">
        <button className="px-6 py-2 bg-umbanda-red text-white rounded-full text-sm font-bold shadow-lg shadow-red-900/20">
          Todos
        </button>
        <button className="px-6 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700 dark:hover:text-white rounded-full text-sm font-bold border border-stone-300 dark:border-stone-700 transition-colors">
          Prosperidade
        </button>
        <button className="px-6 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700 dark:hover:text-white rounded-full text-sm font-bold border border-stone-300 dark:border-stone-700 transition-colors">
          Amor
        </button>
        <button className="px-6 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700 dark:hover:text-white rounded-full text-sm font-bold border border-stone-300 dark:border-stone-700 transition-colors">
          Proteção
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 text-umbanda-gold animate-spin" />
        </div>
      ) : rituals.length === 0 ? (
        <div className="text-center py-12 text-stone-500 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800">
          <p>Nenhum ritual publicado ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rituals.map(ritual => (
            <RitualCard key={ritual.id} ritual={ritual} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Rituals;