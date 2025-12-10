
import React, { useEffect, useState } from 'react';
import SectionHeading from '../components/SectionHeading';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Article } from '../types';
import { Loader2, Search, ArrowRight, Mail, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FooterCTA } from '../components/ConversionSections';

const Articles: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredArticles = articles.filter(a => 
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      a.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-[#fdfcf8] dark:bg-stone-950 min-h-screen transition-colors duration-300">
        <div className="pt-32 pb-20 container mx-auto px-6 animate-fadeIn">
            
            {/* Header with Search */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                <div>
                    <SectionHeading subtitle="Estudos e Fundamentos" title="Blog do Terreiro" centered={false} />
                    <p className="text-stone-600 dark:text-stone-400 max-w-xl -mt-8">
                        Explore nossa biblioteca de conhecimento ancestral. Artigos escritos por sacerdotes e pesquisadores da Umbanda.
                    </p>
                </div>
                <div className="relative w-full md:w-80">
                    <input 
                        type="text" 
                        placeholder="Buscar fundamento..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-full py-3 pl-12 pr-4 focus:outline-none focus:border-umbanda-gold focus:ring-1 focus:ring-umbanda-gold transition-all shadow-sm"
                    />
                    <Search className="absolute left-4 top-3.5 text-stone-400" size={20}/>
                </div>
            </div>
            
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 text-umbanda-gold animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    
                    {/* Main Content Grid */}
                    <div className="lg:col-span-8">
                        {filteredArticles.length === 0 ? (
                            <div className="text-center py-12 text-stone-500 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm">
                                <p>Nenhum artigo encontrado.</p>
                            </div>
                        ) : (
                            <div className="space-y-12">
                                {filteredArticles.map((article, idx) => (
                                    <Link to={`/artigos/${article.id}`} key={article.id} className="group block bg-white dark:bg-stone-900 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col md:flex-row h-full md:h-64">
                                        <div className="md:w-2/5 h-48 md:h-full relative overflow-hidden">
                                            <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"/>
                                            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded uppercase border border-white/20">
                                                {article.tags?.[0]}
                                            </div>
                                        </div>
                                        <div className="p-6 md:p-8 flex flex-col justify-center flex-1">
                                            <div className="flex items-center gap-2 mb-3 text-xs font-bold text-stone-500 uppercase tracking-wide">
                                                <span className="text-umbanda-gold">{article.date}</span>
                                                <span>•</span>
                                                <span>{article.author}</span>
                                            </div>
                                            <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-white mb-3 group-hover:text-umbanda-red transition-colors leading-tight">
                                                {article.title}
                                            </h3>
                                            <p className="text-stone-600 dark:text-stone-400 text-sm line-clamp-2 leading-relaxed mb-4 flex-grow">
                                                {article.excerpt}
                                            </p>
                                            <div className="flex items-center text-umbanda-gold font-bold text-sm uppercase tracking-wider group-hover:gap-2 transition-all">
                                                Ler Artigo <ArrowRight size={16} className="ml-1"/>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar Sticky */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="sticky top-32 space-y-8">
                            
                            {/* Newsletter Box */}
                            <div className="bg-stone-100 dark:bg-stone-900 p-8 rounded-2xl border border-stone-200 dark:border-stone-800 text-center">
                                <div className="w-14 h-14 bg-umbanda-red text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-900/20">
                                    <Mail size={24}/>
                                </div>
                                <h4 className="font-serif font-bold text-xl text-stone-900 dark:text-white mb-2">Boletim Semanal</h4>
                                <p className="text-stone-600 dark:text-stone-400 text-sm mb-6">Receba rezas, pontos riscados e conselhos espirituais toda segunda-feira.</p>
                                <input className="w-full bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-lg px-4 py-3 text-sm mb-3 focus:outline-none focus:border-umbanda-gold" placeholder="Seu melhor e-mail" />
                                <button className="w-full bg-stone-900 dark:bg-white text-white dark:text-black font-bold py-3 rounded-lg hover:opacity-90 transition-opacity">
                                    Inscrever-se Grátis
                                </button>
                            </div>

                            {/* VIP Promo */}
                            <div className="bg-gradient-to-br from-umbanda-gold to-yellow-600 p-8 rounded-2xl text-white shadow-xl relative overflow-hidden group">
                                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-3xl group-hover:bg-white/30 transition-all"></div>
                                <Crown size={32} className="mb-4 relative z-10"/>
                                <h4 className="font-serif font-bold text-2xl mb-2 relative z-10">Seja Membro VIP</h4>
                                <p className="text-white/90 text-sm mb-6 relative z-10 leading-relaxed">
                                    Acesse a biblioteca oculta com e-books de rituais, vídeos exclusivos e descontos em consultas.
                                </p>
                                <Link to="/vip" className="inline-block w-full text-center bg-white text-yellow-700 font-bold py-3 rounded-lg hover:bg-stone-100 transition-colors shadow-lg relative z-10">
                                    Conhecer Benefícios
                                </Link>
                            </div>

                            {/* Categories */}
                            <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800">
                                <h5 className="font-bold text-stone-900 dark:text-white mb-4 uppercase text-xs tracking-widest border-b border-stone-200 dark:border-stone-800 pb-2">Categorias Populares</h5>
                                <div className="flex flex-wrap gap-2">
                                    {['Orixás', 'Banhos', 'Orações', 'História', 'Magia', 'Oferendas'].map(tag => (
                                        <button key={tag} onClick={() => setSearchTerm(tag)} className="px-3 py-1 bg-stone-100 dark:bg-stone-800 hover:bg-umbanda-gold hover:text-white dark:hover:bg-umbanda-gold transition-colors rounded text-xs font-bold text-stone-600 dark:text-stone-400">
                                            #{tag}
                                        </button>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            )}
        </div>
        <FooterCTA />
    </div>
  );
};

export default Articles;
