
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import SectionHeading from '../components/SectionHeading';
import RitualCard from '../components/RitualCard';
import EntitySection from '../components/EntitySection';
import Newsletter from '../components/Newsletter';
import { ArrowRight } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { Article, Ritual } from '../types';

// New Conversion Components
import TrustBadges from '../components/TrustBadges';
import TestimonialCarousel from '../components/TestimonialCarousel';
import { HowItWorks, StatsSection, UniqueSellingPoints, EmotionalBlock, FooterCTA } from '../components/ConversionSections';

const Home: React.FC = () => {
  const [featuredRituals, setFeaturedRituals] = useState<Ritual[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ritQuery = query(collection(db, 'rituals'), limit(3));
        const artQuery = query(collection(db, 'articles'), limit(3));

        const [ritSnap, artSnap] = await Promise.all([
            getDocs(ritQuery),
            getDocs(artQuery),
        ]);

        setFeaturedRituals(ritSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ritual)));
        setFeaturedArticles(artSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article)));

      } catch (error) {
        console.error("Erro ao carregar home:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="animate-fadeIn">
      <Hero />
      <TrustBadges />
      
      {/* Introduction Quote */}
      <section className="py-20 bg-white dark:bg-umbanda-black border-b border-stone-200 dark:border-stone-900 transition-colors duration-300">
        <div className="container mx-auto px-6 text-center">
          <span className="text-umbanda-gold text-4xl mb-4 block">❝</span>
          <p className="text-xl md:text-3xl font-serif text-stone-800 dark:text-stone-200 leading-relaxed max-w-4xl mx-auto italic">
            "A Umbanda é paz e amor, é um mundo cheio de luz. É a força que nos dá vida, e a grandeza que nos conduz."
          </p>
          <div className="mt-8 w-24 h-1 bg-umbanda-red mx-auto rounded-full"></div>
        </div>
      </section>

      <HowItWorks />
      
      <UniqueSellingPoints />

      {/* Rituals Highlight */}
      <section className="py-24 bg-stone-50 dark:bg-stone-950 transition-colors duration-300">
        <div className="container mx-auto px-6">
          <SectionHeading subtitle="Práticas Sagradas" title="Rituais & Firmezas" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
                 <p className="text-stone-500">Carregando rituais...</p>
            ) : featuredRituals.length > 0 ? (
              featuredRituals.map(ritual => (
                <RitualCard key={ritual.id} ritual={ritual} />
              ))
            ) : (
               <div className="col-span-3 text-center text-stone-500 py-12 border border-stone-200 dark:border-stone-800 rounded-lg bg-white dark:bg-stone-900/50">
                  Conteúdos exclusivos sendo preparados.
               </div>
            )}
          </div>

          <div className="mt-12 text-center">
            <Link to="/rituais" className="inline-flex items-center px-6 py-3 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded font-bold hover:opacity-90 transition-all shadow-lg">
              Ver todos os rituais <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
      
      <StatsSection />
      
      <EntitySection />
      
      <TestimonialCarousel />

      <EmotionalBlock />

      {/* Blog Preview */}
      <section className="py-24 bg-stone-50 dark:bg-stone-950 transition-colors duration-300">
        <div className="container mx-auto px-6">
          <SectionHeading subtitle="Conhecimento" title="Artigos Recentes" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loading ? (
                <p className="text-stone-500">Carregando artigos...</p>
            ) : featuredArticles.length > 0 ? (
              featuredArticles.map(article => (
                <Link to={`/artigos/${article.id}`} key={article.id} className="group cursor-pointer block">
                  <div className="overflow-hidden rounded-lg mb-4 h-64 border border-stone-200 dark:border-stone-800 relative shadow-sm">
                    <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-umbanda-gold font-bold uppercase mb-2">
                    <span>{article.date}</span>
                    <span>•</span>
                    <span>{article.tags?.[0] || 'Umbanda'}</span>
                  </div>
                  <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-white mb-2 group-hover:text-umbanda-red transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-stone-600 dark:text-stone-400 text-sm line-clamp-2">
                    {article.excerpt}
                  </p>
                </Link>
              ))
            ) : (
              <div className="col-span-3 text-center text-stone-500 py-12 border border-stone-200 dark:border-stone-800 rounded-lg bg-white dark:bg-stone-900/50">
                  Em breve novos artigos.
               </div>
            )}
          </div>
        </div>
      </section>

      <FooterCTA />
      <Newsletter />
    </div>
  );
};

export default Home;
