import React, { useEffect, useState } from 'react';
import SectionHeading from '../components/SectionHeading';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Article } from '../types';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Articles: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'articles'));
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article));
        setArticles(data);
      } catch (error) {
        console.error("Erro ao buscar artigos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  return (
    <div className="pt-32 pb-20 container mx-auto px-6 animate-fadeIn">
      <SectionHeading subtitle="Estudos e Fundamentos" title="Blog do Terreiro" />
      
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 text-umbanda-gold animate-spin" />
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-12 text-stone-500 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm">
          <p>Nenhum artigo publicado ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Main Article (First one) - Mantém estilo escuro/imagem */}
          {articles.length > 0 && (
            <Link to={`/artigos/${articles[0].id}`} className="lg:col-span-2 group cursor-pointer relative overflow-hidden rounded-2xl h-[500px] border border-stone-200 dark:border-stone-800 block shadow-xl">
              <img 
                src={articles[0].imageUrl} 
                alt={articles[0].title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-8 md:p-12">
                <span className="bg-umbanda-red text-white px-3 py-1 text-xs font-bold uppercase rounded mb-4 inline-block shadow-sm">
                  Destaque
                </span>
                <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4 group-hover:text-umbanda-gold transition-colors drop-shadow-md">
                  {articles[0].title}
                </h2>
                <p className="text-stone-200 max-w-2xl mb-6 hidden md:block leading-relaxed drop-shadow">
                  {articles[0].excerpt}
                </p>
                <span className="text-white border-b border-umbanda-gold pb-1 text-sm font-bold uppercase tracking-widest">
                  Ler Artigo Completo
                </span>
              </div>
            </Link>
          )}

          {/* List of other articles - Adaptive */}
          {articles.slice(1).map(article => (
            <Link to={`/artigos/${article.id}`} key={article.id} className="flex flex-col md:flex-row gap-6 group cursor-pointer bg-white dark:bg-stone-900/40 p-4 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-900 transition-all border border-stone-200 dark:border-transparent dark:hover:border-stone-800 shadow-lg dark:shadow-none hover:shadow-xl">
              <div className="w-full md:w-48 h-48 md:h-32 rounded-lg overflow-hidden flex-shrink-0 relative">
                <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="flex flex-col justify-center">
                 <div className="flex items-center space-x-2 text-xs text-stone-500 mb-2">
                  <span className="text-umbanda-gold font-bold">{article.tags?.[0]}</span>
                  <span>•</span>
                  <span>{article.date}</span>
                </div>
                <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-2 group-hover:text-umbanda-red transition-colors">
                  {article.title}
                </h3>
                <p className="text-stone-600 dark:text-stone-400 text-sm line-clamp-2 leading-relaxed">
                  {article.excerpt}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Articles;