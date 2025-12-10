import React, { useEffect, useState } from 'react';
import { Sparkles, Sun, Moon, Loader2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const About: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'settings', 'about'));
        if (docSnap.exists()) {
          setData(docSnap.data());
        }
      } catch (e) {
        console.error("Erro ao carregar Sobre:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchAbout();
  }, []);

  if (loading) {
      return <div className="min-h-screen pt-32 flex justify-center"><Loader2 className="animate-spin text-umbanda-gold"/></div>;
  }

  // Fallback data if nothing is in DB yet
  const title = data?.title || "Nossa História de Fé";
  const history = data?.history || "A história da nossa casa está sendo escrita. Em breve, disponibilizaremos aqui toda a trajetória do Umbanda Cuiabá.";
  const charityText = data?.charityText || "A caridade é o princípio basilar da Umbanda. Praticamos o bem sem olhar a quem.";
  const foundationText = data?.foundationText || "Respeito absoluto aos fundamentos passados pelos nossos ancestrais e guias chefes.";
  const studyText = data?.studyText || "A evolução espiritual caminha de mãos dadas com o conhecimento e o estudo constante.";

  return (
    <div className="pt-32 pb-20 container mx-auto px-6 animate-fadeIn">
      {/* Intro */}
      <div className="text-center max-w-4xl mx-auto mb-20">
        <h1 className="text-4xl md:text-6xl font-serif font-bold text-stone-900 dark:text-white mb-6 transition-colors duration-300">{title}</h1>
        <div className="text-xl text-stone-600 dark:text-stone-300 leading-relaxed whitespace-pre-wrap transition-colors duration-300">
            {history}
        </div>
      </div>

      {/* Grid Images */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-20">
        <div className="h-64 md:h-96 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-lg">
            <img src="https://picsum.photos/id/1028/600/800" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" alt="Terreiro" />
        </div>
        <div className="h-64 md:h-96 rounded-2xl overflow-hidden md:-mt-8 border border-stone-200 dark:border-stone-800 shadow-2xl">
            <img src="https://picsum.photos/id/1041/600/800" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" alt="Altar" />
        </div>
        <div className="h-64 md:h-96 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-lg">
            <img src="https://picsum.photos/id/1039/600/800" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" alt="Gira" />
        </div>
      </div>

      {/* Pillars - Dynamic Texts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 bg-white dark:bg-stone-900/50 p-12 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xl dark:shadow-none transition-colors duration-300">
        <div className="text-center">
            <div className="w-16 h-16 bg-umbanda-red/10 dark:bg-umbanda-red/20 text-umbanda-red rounded-full flex items-center justify-center mx-auto mb-6 border border-umbanda-red/20 shadow-sm">
                <Sun size={32} />
            </div>
            <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-white mb-4">Caridade</h3>
            <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">{charityText}</p>
        </div>
        <div className="text-center">
            <div className="w-16 h-16 bg-umbanda-gold/10 dark:bg-umbanda-gold/20 text-umbanda-gold rounded-full flex items-center justify-center mx-auto mb-6 border border-umbanda-gold/20 shadow-sm">
                <Sparkles size={32} />
            </div>
            <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-white mb-4">Fundamento</h3>
            <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">{foundationText}</p>
        </div>
        <div className="text-center">
            <div className="w-16 h-16 bg-stone-100 dark:bg-stone-700/50 text-stone-600 dark:text-stone-200 rounded-full flex items-center justify-center mx-auto mb-6 border border-stone-200 dark:border-stone-600 shadow-sm">
                <Moon size={32} />
            </div>
            <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-white mb-4">Estudo</h3>
            <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">{studyText}</p>
        </div>
      </div>
    </div>
  );
};

export default About;