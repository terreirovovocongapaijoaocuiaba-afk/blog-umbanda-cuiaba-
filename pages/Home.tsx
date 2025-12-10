import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import SectionHeading from '../components/SectionHeading';
import RitualCard from '../components/RitualCard';
import EntitySection from '../components/EntitySection';
import Newsletter from '../components/Newsletter';
import { ArrowRight, Star, Quote } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { Article, Ritual, Testimonial } from '../types';

const Home: React.FC = () => {
  const [featuredRituals, setFeaturedRituals] = useState<Ritual[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Real Data from Firestore
        const ritQuery = query(collection(db, 'rituals'), limit(3));
        const artQuery = query(collection(db, 'articles'), limit(3));
        const testQuery = query(collection(db, 'testimonials'), limit(3));

        const [ritSnap, artSnap, testSnap] = await Promise.all([
            getDocs(ritQuery),
            getDocs(artQuery),
            getDocs(testQuery)
        ]);

        setFeaturedRituals(ritSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ritual)));
        setFeaturedArticles(artSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article)));
        setTestimonials(testSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial)));

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
      
      {/* Introduction */}
      <section className="py-20 bg-white dark:bg-umbanda-black border-b border-stone-200 dark:border-stone-900 transition-colors duration-300">
        <div className="container mx-auto px-6 text-center">
          <span className="text-umbanda-gold text-4xl mb-4 block">❝</span>
          <p className="text-xl md:text-3xl font-serif text-stone-800 dark:text-stone-200 leading-relaxed max-w-4xl mx-auto italic">
            "A Umbanda é paz e amor, é um mundo cheio de luz. É a força que nos dá vida, e a grandeza que nos conduz."
          </p>
          <div className="mt-8 w-24 h-1 bg-umbanda-red mx-auto rounded-full"></div>
        </div>
      </section>

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
                  Novos rituais serão publicados em breve.
               </div>
            )}
          </div>

          <div className="mt-12 text-center">
            <Link to="/rituais" className="inline-flex items-center text-umbanda-gold hover:text-umbanda-red dark:hover:text-white font-bold tracking-wider uppercase border-b-2 border-umbanda-gold hover:border-umbanda-red dark:hover:border-white pb-1 transition-all">
              Ver todos os rituais <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Entities */}
      <EntitySection />

      {/* Testimonials - REAL DATA */}
      <section className="py-24 bg-white dark:bg-gradient-to-b dark:from-stone-900 dark:to-stone-950 transition-colors duration-300">
        <div className="container mx-auto px-6">
          <SectionHeading subtitle="A Voz da Comunidade" title="Depoimentos Reais" centered />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {loading ? (
                <p className="text-center w-full text-stone-500">Carregando depoimentos...</p>
            ) : testimonials.length > 0 ? (
                testimonials.map(t => (
                <div key={t.id} className="bg-stone-50 dark:bg-stone-800/50 p-8 rounded-2xl border border-stone-200 dark:border-stone-700 relative hover:border-umbanda-gold/30 transition-colors shadow-sm dark:shadow-none">
                    <Quote className="absolute top-6 right-6 text-stone-300 dark:text-stone-700 w-8 h-8 opacity-50" />
                    <div className="flex items-center space-x-4 mb-6">
                    <img src={t.avatarUrl} alt={t.name} className="w-12 h-12 rounded-full border-2 border-umbanda-gold object-cover" />
                    <div>
                        <h4 className="text-stone-900 dark:text-white font-bold">{t.name}</h4>
                        <span className="text-stone-500 dark:text-stone-400 text-xs uppercase font-bold tracking-wider">{t.role}</span>
                    </div>
                    </div>
                    <div className="flex text-umbanda-gold mb-4">
                    {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                    </div>
                    <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed italic">
                    "{t.text}"
                    </p>
                </div>
                ))
            ) : (
                <div className="col-span-3 text-center py-12 border border-dashed border-stone-300 dark:border-stone-800 rounded-xl text-stone-500">
                    <p>Nenhum depoimento cadastrado ainda.</p>
                    <p className="text-xs mt-2">Adicione depoimentos reais através do Painel Administrativo.</p>
                </div>
            )}
          </div>
        </div>
      </section>

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

      <Newsletter />
    </div>
  );
};

export default Home;