
import React, { useEffect, useState } from 'react';
import { Sparkles, Sun, Moon, Loader2, Heart, Users, Target } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { StatsSection, FooterCTA } from '../components/ConversionSections';
import TestimonialCarousel from '../components/TestimonialCarousel';
import TrustBadges from '../components/TrustBadges';

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
      return <div className="min-h-screen pt-32 flex justify-center bg-[#fdfcf8] dark:bg-umbanda-black"><Loader2 className="animate-spin text-umbanda-gold w-10 h-10"/></div>;
  }

  const title = data?.title || "Nossa História de Fé";
  const history = data?.history || "A história da nossa casa está sendo escrita. Em breve, disponibilizaremos aqui toda a trajetória do Umbanda Cuiabá.";
  const charityText = data?.charityText || "A caridade é o princípio basilar da Umbanda. Praticamos o bem sem olhar a quem.";
  const foundationText = data?.foundationText || "Respeito absoluto aos fundamentos passados pelos nossos ancestrais e guias chefes.";
  const studyText = data?.studyText || "A evolução espiritual caminha de mãos dadas com o conhecimento e o estudo constante.";

  return (
    <div className="bg-[#fdfcf8] dark:bg-umbanda-black min-h-screen transition-colors duration-300">
      
      {/* Hero About */}
      <div className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-umbanda-gold/10 to-transparent pointer-events-none"></div>
          <div className="container mx-auto px-6 relative z-10">
              <div className="max-w-4xl mx-auto text-center">
                  <span className="text-umbanda-gold font-bold tracking-[0.3em] uppercase text-xs mb-4 block animate-fadeIn">Quem Somos</span>
                  <h1 className="text-4xl md:text-6xl font-serif font-bold text-stone-900 dark:text-white mb-8 leading-tight animate-slideUp">
                      {title}
                  </h1>
                  <div className="w-24 h-1 bg-umbanda-red mx-auto rounded-full mb-8 animate-slideUp"></div>
                  <div className="text-lg md:text-xl text-stone-600 dark:text-stone-300 leading-relaxed whitespace-pre-wrap font-light animate-slideUp animation-delay-200">
                      {history}
                  </div>
              </div>
          </div>
      </div>

      <TrustBadges />

      {/* Pillars Section */}
      <section className="py-20 bg-stone-100 dark:bg-stone-900/50">
          <div className="container mx-auto px-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <ValueCard 
                    icon={<Heart size={32}/>} 
                    title="Caridade" 
                    text={charityText} 
                    color="text-red-500" 
                    bg="bg-red-500/10"
                  />
                  <ValueCard 
                    icon={<Target size={32}/>} 
                    title="Fundamento" 
                    text={foundationText} 
                    color="text-umbanda-gold" 
                    bg="bg-umbanda-gold/10"
                  />
                  <ValueCard 
                    icon={<Users size={32}/>} 
                    title="Comunidade" 
                    text={studyText} 
                    color="text-blue-500" 
                    bg="bg-blue-500/10"
                  />
              </div>
          </div>
      </section>

      {/* Visual Gallery */}
      <section className="py-20 container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[600px]">
              <div className="md:col-span-8 h-full rounded-2xl overflow-hidden shadow-2xl relative group">
                  <img src="https://picsum.photos/id/1028/1200/800" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Terreiro" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-8">
                      <h3 className="text-white text-2xl font-serif font-bold">Nosso Congá Sagrado</h3>
                  </div>
              </div>
              <div className="md:col-span-4 flex flex-col gap-4 h-full">
                  <div className="flex-1 rounded-2xl overflow-hidden shadow-xl relative group">
                      <img src="https://picsum.photos/id/1041/600/800" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Altar" />
                  </div>
                  <div className="flex-1 rounded-2xl overflow-hidden shadow-xl relative group">
                      <img src="https://picsum.photos/id/1039/600/800" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Gira" />
                  </div>
              </div>
          </div>
      </section>

      <StatsSection />
      
      <div className="py-10">
        <TestimonialCarousel />
      </div>

      <FooterCTA />
    </div>
  );
};

const ValueCard: React.FC<{ icon: React.ReactNode, title: string, text: string, color: string, bg: string }> = ({ icon, title, text, color, bg }) => (
    <div className="bg-white dark:bg-stone-900 p-10 rounded-2xl border border-stone-200 dark:border-stone-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
        <div className={`w-16 h-16 ${bg} ${color} rounded-full flex items-center justify-center mb-6 border-2 border-transparent group-hover:border-current transition-colors`}>
            {icon}
        </div>
        <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-white mb-4">{title}</h3>
        <p className="text-stone-600 dark:text-stone-400 leading-relaxed text-sm">
            {text}
        </p>
    </div>
);

export default About;
