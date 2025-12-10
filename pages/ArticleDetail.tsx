import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, query, limit, getDocs, updateDoc, increment, addDoc, serverTimestamp, onSnapshot, orderBy } from 'firebase/firestore';
import { Article, Comment } from '../types';
import { 
  Loader2, Calendar, Clock, BookOpen, Heart, Send, PlayCircle, Star, ChevronDown, ChevronUp,
  MessageSquare, Volume2, List, Sparkles, Lock, Crown
} from 'lucide-react';
import { SITE_NAME } from '../constants';

// --- VIP GATE COMPONENT ---
const VipGate: React.FC<{ children: React.ReactNode, isVip: boolean }> = ({ children, isVip }) => {
    // Simulated auth check. In real app, check useContext(AuthContext).user.isSubscriber
    const isUserSubscriber = false; 

    if (!isVip || isUserSubscriber) return <>{children}</>;

    return (
        <div className="relative">
            {/* Blurrable Content */}
            <div className="filter blur-sm select-none pointer-events-none opacity-50 h-[400px] overflow-hidden">
                {children}
            </div>
            
            {/* Lock Overlay */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-transparent to-stone-50 dark:to-stone-950">
                <div className="bg-stone-900 p-8 rounded-2xl border border-umbanda-gold/30 shadow-2xl max-w-md transform transition-all hover:scale-105">
                    <div className="w-16 h-16 bg-gradient-to-br from-umbanda-gold to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white shadow-lg shadow-yellow-600/20">
                        <Lock size={32} />
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-white mb-2">Conteúdo Exclusivo VIP</h3>
                    <p className="text-stone-300 mb-6">Este fundamento é reservado para membros da nossa corrente de estudos. Assine para liberar.</p>
                    <Link to="/vip" className="block w-full py-4 bg-umbanda-red hover:bg-red-800 text-white font-bold rounded-lg transition-colors uppercase tracking-widest text-sm">
                        Quero Liberar Acesso
                    </Link>
                    <p className="text-xs text-stone-500 mt-4">Apenas R$ 29,90/mês. Cancele quando quiser.</p>
                </div>
            </div>
        </div>
    );
};

const ArticleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  // Data State
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Interaction State
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [userRating, setUserRating] = useState(0);

  // Comment Form State
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchArticleAndRelated = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const docRef = doc(db, 'articles', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const articleData = { id: docSnap.id, ...docSnap.data() } as Article;
          setArticle(articleData);
          setLikes(articleData.likes || 0);

          const likedKey = `liked_article_${id}`;
          if (localStorage.getItem(likedKey)) setHasLiked(true);

          // Related (Simulated logic + Firestore)
          const q = query(collection(db, 'articles'), limit(4));
          const querySnapshot = await getDocs(q);
          const related = querySnapshot.docs
            .map(d => ({ id: d.id, ...d.data() } as Article))
            .filter(a => a.id !== id)
            .slice(0, 3);
          setRelatedArticles(related);
        }
      } catch (error) {
        console.error("Erro ao carregar artigo:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
        const commentsRef = collection(db, 'articles', id, 'comments');
        const qComments = query(commentsRef, orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(qComments, (snapshot) => {
            const loadedComments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Comment[];
            setComments(loadedComments);
        });
        window.scrollTo(0, 0);
        fetchArticleAndRelated();
        return () => unsubscribe();
    }
  }, [id]);

  // --- HANDLERS ---
  const handleLike = async () => {
      if (!id || hasLiked) return;
      setLikes(prev => prev + 1);
      setHasLiked(true);
      localStorage.setItem(`liked_article_${id}`, 'true');
      try { await updateDoc(doc(db, 'articles', id), { likes: increment(1) }); } catch (e) { console.error(e); }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!id || !commentName.trim() || !commentText.trim()) return;
      setIsSubmittingComment(true);
      try {
          await addDoc(collection(db, 'articles', id, 'comments'), {
              name: commentName,
              text: commentText,
              createdAt: serverTimestamp()
          });
          setCommentText('');
      } catch (e) { alert("Erro ao enviar comentário."); } 
      finally { setIsSubmittingComment(false); }
  };

  const handleRate = (stars: number) => {
    setUserRating(stars);
    // Logic to save rating to DB would go here
  };

  // Generate Table of Contents from H2 tags
  const getTOC = (html: string) => {
      const regex = /<h2.*?>(.*?)<\/h2>/g;
      const matches = [...html.matchAll(regex)];
      return matches.map((m, i) => ({ id: `section-${i}`, text: m[1].replace(/<[^>]+>/g, '') }));
  };

  // Add IDs to H2s in content
  const processContent = (html: string) => {
      let count = 0;
      return html.replace(/<h2(.*?)>/g, () => `<h2 id="section-${count++}"$1>`);
  };

  if (loading) return <div className="min-h-screen pt-32 flex justify-center bg-stone-50 dark:bg-umbanda-black"><Loader2 className="w-10 h-10 text-umbanda-gold animate-spin" /></div>;
  if (!article) return <div className="min-h-screen pt-32 text-center text-white">Artigo não encontrado.</div>;

  const wordCount = article.content ? article.content.replace(/<[^>]*>?/gm, '').split(' ').length : 0;
  const readTime = Math.ceil(wordCount / 200);
  const toc = article.content ? getTOC(article.content) : [];
  const processedContent = article.content ? processContent(article.content) : '';

  // JSON-LD Schema
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": article.title,
    "image": article.imageUrl,
    "author": { "@type": "Person", "name": article.author },
    "publisher": { "@type": "Organization", "name": SITE_NAME },
    "datePublished": article.date,
    "description": article.excerpt,
    "isAccessibleForFree": !article.isVip
  };

  return (
    <div className="bg-stone-50 dark:bg-umbanda-black min-h-screen animate-fadeIn font-sans text-stone-800 dark:text-stone-200 transition-colors duration-300">
      <script type="application/ld+json">{JSON.stringify(schemaData)}</script>

      {/* --- PREMIUM HERO SECTION --- */}
      <div className="relative w-full h-[60vh] md:h-[75vh] overflow-hidden">
        <img 
          src={article.imageUrl} 
          alt={article.title} 
          className="w-full h-full object-cover fixed-bg-effect"
          style={{ transform: 'scale(1.05)' }} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-50 via-stone-900/40 to-black/30 dark:from-umbanda-black dark:via-umbanda-black/60 dark:to-black/60"></div>
        
        <div className="absolute bottom-0 left-0 w-full z-20 pb-12 md:pb-20">
            <div className="container mx-auto px-6 max-w-5xl">
                {article.isVip && (
                    <div className="inline-flex items-center gap-2 bg-purple-600/20 border border-purple-500/50 text-purple-300 px-3 py-1 rounded-full mb-4 backdrop-blur-md">
                        <Crown size={14} className="text-purple-400 fill-purple-400"/>
                        <span className="text-xs font-bold uppercase tracking-wider">Conteúdo Exclusivo VIP</span>
                    </div>
                )}
                
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white leading-tight mb-6 drop-shadow-2xl">
                    {article.title}
                </h1>
                
                <p className="text-lg md:text-2xl text-stone-200 font-serif italic mb-8 max-w-3xl leading-relaxed border-l-4 border-umbanda-gold pl-6">
                    "{article.excerpt}"
                </p>

                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full border-2 border-umbanda-gold p-0.5 bg-black/20 backdrop-blur">
                            <img src={article.authorAvatar || `https://ui-avatars.com/api/?name=${article.author}`} alt={article.author} className="w-full h-full rounded-full object-cover" />
                        </div>
                        <div>
                            <p className="text-white font-bold text-lg">{article.author}</p>
                            <p className="text-stone-300 text-xs uppercase tracking-wide">{article.authorRole || 'Colunista Espiritual'}</p>
                        </div>
                    </div>
                    <div className="hidden md:block w-px h-10 bg-white/20"></div>
                    <div className="flex items-center gap-6 text-stone-300 text-sm font-medium">
                        <span className="flex items-center gap-2"><Calendar size={16} /> {article.date}</span>
                        <span className="flex items-center gap-2"><Clock size={16} /> {readTime} min</span>
                        <span className="flex items-center gap-2 text-umbanda-gold"><Star size={16} fill="currentColor"/> 4.9</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* --- CONTENT WRAPPER --- */}
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-7xl mx-auto">
            
            {/* LEFT SIDEBAR (Desktop) */}
            <aside className="hidden lg:block lg:col-span-3 space-y-8 sticky top-24 h-fit">
                {/* TOC */}
                <div className="bg-white dark:bg-stone-900 rounded-xl p-6 border border-stone-200 dark:border-stone-800 shadow-lg">
                    <h4 className="font-bold text-stone-900 dark:text-white mb-4 flex items-center gap-2">
                        <List size={18} className="text-umbanda-gold"/> Índice
                    </h4>
                    <nav className="space-y-2 text-sm">
                        {toc.length > 0 ? toc.map((item) => (
                            <a href={`#${item.id}`} key={item.id} className="block text-stone-600 dark:text-stone-400 hover:text-umbanda-red dark:hover:text-umbanda-gold transition-colors pl-2 border-l-2 border-transparent hover:border-umbanda-gold">
                                {item.text}
                            </a>
                        )) : <p className="text-xs text-stone-500">Sem seções definidas.</p>}
                    </nav>
                </div>
            </aside>

            {/* MAIN ARTICLE */}
            <main className="lg:col-span-6">
                
                {/* Audio Reader */}
                <div className="bg-gradient-to-r from-stone-100 to-white dark:from-stone-900 dark:to-stone-950 p-4 rounded-xl border border-stone-200 dark:border-stone-800 mb-8 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-umbanda-gold/20 text-umbanda-gold flex items-center justify-center">
                             <Volume2 size={20}/>
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase text-stone-500 dark:text-stone-400">Escutar Artigo</p>
                            <p className="text-sm font-bold text-stone-800 dark:text-white">{readTime} minutos</p>
                        </div>
                    </div>
                </div>

                {/* --- CONTENT START WITH PAYWALL --- */}
                <VipGate isVip={article.isVip || false}>
                    <article className="
                        prose prose-lg md:prose-xl max-w-none 
                        text-stone-700 dark:text-stone-300
                        prose-p:leading-[1.9] prose-p:mb-8 prose-p:font-light
                        prose-headings:font-serif prose-headings:font-bold prose-headings:text-stone-900 dark:prose-headings:text-stone-100
                        prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:border-l-4 prose-h2:border-umbanda-gold prose-h2:pl-4 prose-h2:relative
                        prose-h3:text-2xl prose-h3:text-umbanda-redBright
                        prose-a:text-umbanda-red prose-a:font-bold prose-a:no-underline hover:prose-a:underline
                        prose-img:rounded-xl prose-img:shadow-2xl prose-img:my-10
                    ">
                         <div dangerouslySetInnerHTML={{ __html: processedContent || `<p class="lead">${article.excerpt}</p>` }} />
                    </article>
                    
                     {/* BIG IDEA BOX (Only shows if unlocked) */}
                    <div className="my-12 bg-gradient-to-br from-amber-50 to-white dark:from-stone-900 dark:to-stone-950 p-8 rounded-2xl border border-amber-200 dark:border-stone-800 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Sparkles size={100} className="text-umbanda-gold"/>
                        </div>
                        <h3 className="text-umbanda-gold font-bold uppercase tracking-widest text-xs mb-2 flex items-center gap-2">
                            <Sparkles size={16}/> Ensinamento da Casa
                        </h3>
                        <p className="text-xl md:text-2xl font-serif font-bold text-stone-800 dark:text-stone-200 leading-relaxed italic relative z-10">
                            "Na Umbanda, o conhecimento não se guarda, se compartilha. A verdadeira magia está na transformação de quem estuda e pratica o bem."
                        </p>
                    </div>
                </VipGate>

                {/* Rating System */}
                <div className="py-8 border-y border-stone-200 dark:border-stone-800 my-10 text-center">
                    <p className="text-stone-500 font-bold uppercase text-xs mb-4">Esse conteúdo foi útil para você?</p>
                    <div className="flex justify-center gap-2">
                        {[1,2,3,4,5].map(star => (
                            <button key={star} onClick={() => handleRate(star)} className="group">
                                <Star 
                                    size={28} 
                                    className={`transition-colors ${star <= userRating ? 'text-umbanda-gold fill-umbanda-gold' : 'text-stone-300 dark:text-stone-700 group-hover:text-umbanda-gold'}`}
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* FAQ Section (SEO) */}
                {article.faqs && article.faqs.length > 0 && (
                    <div className="mb-12">
                        <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-white mb-6">Perguntas Frequentes</h3>
                        <div className="space-y-4">
                            {article.faqs.map((faq, idx) => (
                                <details key={idx} className="group bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg open:border-umbanda-gold/50 transition-colors">
                                    <summary className="flex justify-between items-center cursor-pointer p-4 font-bold text-stone-800 dark:text-stone-200">
                                        {faq.question}
                                        <ChevronDown className="group-open:rotate-180 transition-transform" size={18} />
                                    </summary>
                                    <div className="p-4 pt-0 text-stone-600 dark:text-stone-400 leading-relaxed border-t border-transparent group-open:border-stone-200 dark:group-open:border-stone-800 group-open:mt-2">
                                        {faq.answer}
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>
                )}

                {/* Comments */}
                <div className="mt-16">
                     <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-white mb-8 flex items-center gap-3">
                        <MessageSquare className="text-umbanda-gold" /> Comentários ({comments.length})
                    </h3>
                    
                    <form onSubmit={handleCommentSubmit} className="mb-10 bg-white dark:bg-stone-900 p-6 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm">
                        <textarea 
                            value={commentText} onChange={e => setCommentText(e.target.value)} 
                            placeholder="Deixe sua mensagem de axé..." 
                            className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded p-4 text-stone-900 dark:text-white focus:outline-none focus:border-umbanda-gold mb-4 min-h-[100px]"
                        />
                        <div className="flex gap-4">
                            <input value={commentName} onChange={e => setCommentName(e.target.value)} placeholder="Seu Nome" className="flex-1 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded p-3 text-stone-900 dark:text-white focus:outline-none focus:border-umbanda-gold"/>
                            <button type="submit" disabled={isSubmittingComment} className="bg-umbanda-gold hover:bg-yellow-600 text-white font-bold px-8 rounded transition-colors disabled:opacity-50">
                                {isSubmittingComment ? <Loader2 className="animate-spin"/> : 'Publicar'}
                            </button>
                        </div>
                    </form>

                    <div className="space-y-6">
                        {comments.map(c => (
                            <div key={c.id} className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center font-bold text-stone-500">{c.name.charAt(0)}</div>
                                <div>
                                    <div className="flex items-baseline gap-2">
                                        <h5 className="font-bold text-stone-900 dark:text-white">{c.name}</h5>
                                        <span className="text-xs text-stone-500">Hoje</span>
                                    </div>
                                    <p className="text-stone-600 dark:text-stone-400 text-sm mt-1">{c.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* RIGHT SIDEBAR (Sticky) */}
            <aside className="lg:col-span-3 space-y-8">
                {/* CTA Card */}
                <div className="bg-stone-900 text-white rounded-xl p-6 border border-stone-800 shadow-xl sticky top-24">
                    <div className="w-12 h-12 bg-umbanda-gold rounded-full flex items-center justify-center mb-4 text-stone-900">
                        <Sparkles size={24}/>
                    </div>
                    <h3 className="text-xl font-bold font-serif mb-2">Evolua sua Mediunidade</h3>
                    <p className="text-stone-400 text-sm mb-6">Entre para o Clube VIP e tenha acesso a rituais secretos e ebooks mensais.</p>
                    <Link to="/vip" className="block w-full text-center py-3 bg-gradient-to-r from-umbanda-red to-red-800 font-bold rounded hover:shadow-lg transition-all">
                        Quero Ser VIP
                    </Link>
                </div>

                {/* Related Articles */}
                <div>
                    <h4 className="font-bold text-stone-900 dark:text-white mb-4 uppercase text-xs tracking-widest border-b border-stone-200 dark:border-stone-800 pb-2">Leia Também</h4>
                    <div className="space-y-4">
                        {relatedArticles.map(rel => (
                            <Link to={`/artigos/${rel.id}`} key={rel.id} className="flex gap-3 group">
                                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                    <img src={rel.imageUrl} alt={rel.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform grayscale group-hover:grayscale-0"/>
                                </div>
                                <div>
                                    <span className="text-[10px] text-umbanda-gold font-bold uppercase">{rel.tags?.[0]}</span>
                                    <h5 className="text-sm font-bold text-stone-800 dark:text-stone-200 leading-snug group-hover:text-umbanda-red transition-colors line-clamp-3">
                                        {rel.title}
                                    </h5>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </aside>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;