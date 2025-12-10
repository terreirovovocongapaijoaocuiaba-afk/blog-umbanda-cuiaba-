
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, query, limit, getDocs, updateDoc, increment, addDoc, serverTimestamp, onSnapshot, orderBy } from 'firebase/firestore';
import { Article, Comment } from '../types';
import { 
  Loader2, Calendar, Clock, BookOpen, Heart, Send, PlayCircle, PauseCircle, Star, ChevronDown, ChevronUp,
  MessageSquare, Volume2, List, Sparkles, Lock, Crown, Share2, Facebook, Linkedin, Link as LinkIcon, MessageCircle, ArrowRight, Unlock
} from 'lucide-react';
import { SITE_NAME } from '../constants';
import { isUserPremium } from '../lib/usageUtils';

// --- VIP GATE COMPONENT ---
const VipGate: React.FC<{ children: React.ReactNode, isVip: boolean }> = ({ children, isVip }) => {
    const [isSubscriber, setIsSubscriber] = useState(false);

    useEffect(() => {
        setIsSubscriber(isUserPremium());
    }, []);

    if (!isVip || isSubscriber) return <div className="animate-fadeIn">{children}</div>;

    return (
        <div className="relative">
            <div className="filter blur-sm select-none pointer-events-none opacity-50 h-[400px] overflow-hidden bg-white/50 dark:bg-transparent transition-all">
                {children}
            </div>
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-transparent to-[#fdfcf8] dark:to-stone-950">
                <div className="bg-white dark:bg-stone-900 p-8 rounded-2xl border border-umbanda-gold/30 shadow-2xl max-w-md transform transition-all hover:scale-105">
                    <div className="w-16 h-16 bg-gradient-to-br from-umbanda-gold to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white shadow-lg shadow-yellow-600/20">
                        <Lock size={32} />
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-white mb-2">Conteúdo Exclusivo VIP</h3>
                    <p className="text-stone-600 dark:text-stone-300 mb-6">Este fundamento é reservado para membros da nossa corrente de estudos. Assine para liberar.</p>
                    <Link to="/vip" className="block w-full py-4 bg-umbanda-red hover:bg-red-800 text-white font-bold rounded-lg transition-colors uppercase tracking-widest text-sm shadow-lg shadow-red-900/20">
                        Quero Liberar Acesso
                    </Link>
                </div>
            </div>
        </div>
    );
};

// --- AUDIO PLAYER COMPONENT ---
const AudioPlayer: React.FC<{ duration: string }> = ({ duration }) => {
    const [playing, setPlaying] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let interval: any;
        if (playing) {
            interval = setInterval(() => {
                setProgress(p => (p >= 100 ? 0 : p + 1));
            }, 100);
        }
        return () => clearInterval(interval);
    }, [playing]);

    return (
        <div className="my-8 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <button 
                onClick={() => setPlaying(!playing)}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-umbanda-gold text-white hover:bg-yellow-600 transition-colors flex-shrink-0 shadow-lg shadow-yellow-600/20"
            >
                {playing ? <PauseCircle size={24} /> : <PlayCircle size={24} />}
            </button>
            <div className="flex-grow">
                <div className="flex justify-between text-xs font-bold uppercase text-stone-500 mb-2">
                    <span>Ouvir Artigo</span>
                    <span>{duration}</span>
                </div>
                <div className="h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-umbanda-gold to-umbanda-red transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

const ArticleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [userRating, setUserRating] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isSubscriber, setIsSubscriber] = useState(false);

  // Comment Form
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    setIsSubscriber(isUserPremium());
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

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = encodeURIComponent(article?.title || '');
    if (platform === 'whatsapp') window.open(`https://wa.me/?text=${text} ${url}`, '_blank');
    if (platform === 'facebook') window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    if (platform === 'copy') {
        navigator.clipboard.writeText(url);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  // Helper: Inject "Big Idea Box" and "Micro CTA" into HTML string
  const processContentInjection = (html: string) => {
      const parts = html.split('</p>');
      
      // Inject Big Idea Box after 2nd paragraph
      if (parts.length > 2) {
          const bigIdeaBox = `
            <div class="my-10 p-8 border-l-4 border-amber-500 bg-amber-50/50 dark:bg-stone-900/50 rounded-r-xl relative overflow-hidden group shadow-sm">
                <div class="absolute -right-6 -top-6 text-amber-500/10 dark:text-amber-500/5 transform rotate-12 group-hover:rotate-0 transition-transform duration-700">
                    <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                </div>
                <h4 class="font-bold text-amber-700 dark:text-amber-500 text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-amber-500"></span> Ensinamento dos Guias
                </h4>
                <p class="text-xl md:text-2xl font-serif font-bold text-stone-800 dark:text-stone-200 italic leading-relaxed z-10 relative">
                    "A Umbanda não faz milagres para quem cruza os braços. O milagre é a força que você desperta dentro de si quando firma sua fé."
                </p>
            </div>
          `;
          parts[2] = parts[2] + bigIdeaBox;
      }

      // Inject Micro CTA after 5th paragraph (or last if shorter)
      const ctaIndex = parts.length > 5 ? 5 : parts.length - 1;
      if (parts.length > 3) {
          const microCTA = `
            <div class="my-8 flex items-center justify-between p-4 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-md">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-500 flex items-center justify-center font-bold">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                    </div>
                    <span class="text-stone-700 dark:text-stone-200 font-bold text-sm hidden sm:block">Dúvidas sobre este fundamento?</span>
                </div>
                <a href="#/contato" class="px-4 py-2 bg-stone-900 hover:bg-stone-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white text-xs font-bold uppercase rounded transition-colors">
                    Falar com Pai de Santo
                </a>
            </div>
          `;
          parts[ctaIndex] = parts[ctaIndex] + microCTA;
      }

      return parts.join('</p>');
  };

  const getTOC = (html: string) => {
      const regex = /<h2.*?>(.*?)<\/h2>/g;
      const matches = [...html.matchAll(regex)];
      return matches.map((m, i) => ({ id: `section-${i}`, text: m[1].replace(/<[^>]+>/g, '') }));
  };

  const processContentIDs = (html: string) => {
      let count = 0;
      return html.replace(/<h2(.*?)>/g, () => `<h2 id="section-${count++}"$1>`);
  };

  if (loading) return <div className="min-h-screen pt-32 flex justify-center bg-[#fdfcf8] dark:bg-umbanda-black"><Loader2 className="w-10 h-10 text-umbanda-gold animate-spin" /></div>;
  if (!article) return <div className="min-h-screen pt-32 text-center text-white">Artigo não encontrado.</div>;

  const wordCount = article.content ? article.content.replace(/<[^>]*>?/gm, '').split(' ').length : 0;
  const readTime = Math.ceil(wordCount / 200);
  const toc = article.content ? getTOC(article.content) : [];
  
  let finalHTML = article.content ? processContentIDs(article.content) : '';
  finalHTML = processContentInjection(finalHTML);

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": article.title,
    "image": article.imageUrl,
    "author": { "@type": "Person", "name": article.author },
    "publisher": { "@type": "Organization", "name": SITE_NAME },
    "datePublished": article.date,
    "description": article.excerpt,
    "articleBody": article.content?.replace(/<[^>]*>?/gm, '')
  };

  return (
    <div className="bg-[#fdfcf8] dark:bg-umbanda-black min-h-screen animate-fadeIn font-sans text-stone-900 dark:text-stone-200 transition-colors duration-300">
      <script type="application/ld+json">{JSON.stringify(schemaData)}</script>

      {/* --- 1. HERO IMAGE --- */}
      <div className="relative w-full h-[65vh] lg:h-[75vh] overflow-hidden">
        <img 
          src={article.imageUrl} 
          alt={article.title} 
          className="w-full h-full object-cover fixed-bg-effect"
          style={{ transform: 'scale(1.05)' }} 
        />
        {/* Adjusted Gradient for better Light Mode blending */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent dark:from-[#1a1918] dark:via-stone-900/40 dark:to-transparent"></div>
        <div className="absolute inset-0 bg-umbanda-red/20 mix-blend-overlay"></div>
        
        <div className="absolute bottom-0 left-0 w-full z-20 pb-12 md:pb-16 pt-32 bg-gradient-to-t from-black/90 to-transparent">
            <div className="container mx-auto px-6 max-w-6xl">
                
                <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm font-bold text-stone-300 mb-6 uppercase tracking-widest">
                    <Link to="/" className="hover:text-umbanda-gold">Home</Link>
                    <span className="text-stone-600">/</span>
                    <Link to="/artigos" className="hover:text-umbanda-gold">Blog</Link>
                    <span className="text-stone-600">/</span>
                    <span className="text-umbanda-gold px-2 py-1 bg-umbanda-gold/10 rounded border border-umbanda-gold/30">
                        {article.tags?.[0] || 'Espiritualidade'}
                    </span>
                    {article.isVip && <span className="flex items-center gap-1 text-purple-400 border border-purple-500/50 px-2 py-1 rounded bg-purple-900/20"><Crown size={12}/> VIP</span>}
                </div>
                
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white leading-tight mb-6 drop-shadow-2xl max-w-4xl">
                    {article.title}
                </h1>
                
                <p className="text-lg md:text-2xl text-stone-200 font-serif italic mb-8 max-w-3xl leading-relaxed border-l-4 border-umbanda-gold pl-6 opacity-90">
                    "{article.excerpt}"
                </p>

                <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 border-t border-white/10 pt-8">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full border-2 border-umbanda-gold p-0.5 bg-black/20 backdrop-blur">
                            <img src={article.authorAvatar || `https://ui-avatars.com/api/?name=${article.author}`} alt={article.author} className="w-full h-full rounded-full object-cover" />
                        </div>
                        <div>
                            <p className="text-white font-bold text-lg leading-none mb-1">{article.author}</p>
                            <p className="text-stone-400 text-xs uppercase tracking-wide mb-1">{article.authorRole || 'Zelador de Santo'}</p>
                            <div className="flex items-center gap-4 text-stone-400 text-xs">
                                <span className="flex items-center gap-1"><Calendar size={12} /> {article.date}</span>
                                <span className="flex items-center gap-1"><Clock size={12} /> {readTime} min leitura</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button onClick={() => handleShare('whatsapp')} className="p-3 bg-white/5 hover:bg-[#25D366] text-white rounded-full transition-all border border-white/10 hover:border-transparent"><MessageCircle size={20}/></button>
                        <button onClick={() => handleShare('facebook')} className="p-3 bg-white/5 hover:bg-[#1877F2] text-white rounded-full transition-all border border-white/10 hover:border-transparent"><Facebook size={20}/></button>
                        <button onClick={() => handleShare('copy')} className="p-3 bg-white/5 hover:bg-umbanda-gold text-white rounded-full transition-all border border-white/10 hover:border-transparent"><LinkIcon size={20}/></button>
                    </div>
                </div>
            </div>
        </div>
    </div>

      <div className="container mx-auto px-4 md:px-6 py-12 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-7xl mx-auto">
            
            {/* 6. TOC SIDEBAR */}
            <aside className="hidden lg:block lg:col-span-3 space-y-8">
                <div className="sticky top-24 space-y-8">
                    <div className="bg-white dark:bg-stone-900/80 backdrop-blur rounded-xl p-6 border border-stone-200 dark:border-stone-800 shadow-lg dark:shadow-xl">
                        <h4 className="font-bold text-stone-900 dark:text-white mb-4 flex items-center gap-2 text-xs uppercase tracking-widest">
                            <List size={14} className="text-umbanda-gold"/> Neste Artigo
                        </h4>
                        <nav className="space-y-1">
                            {toc.length > 0 ? toc.map((item) => (
                                <a 
                                    href={`#${item.id}`} 
                                    key={item.id} 
                                    className="block text-sm text-stone-600 dark:text-stone-400 hover:text-umbanda-red dark:hover:text-umbanda-gold transition-colors py-1.5 pl-3 border-l-2 border-stone-100 dark:border-stone-800 hover:border-umbanda-gold"
                                >
                                    {item.text}
                                </a>
                            )) : <p className="text-xs text-stone-500">Conteúdo direto.</p>}
                        </nav>
                        <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="mt-6 flex items-center gap-2 text-xs font-bold text-stone-500 hover:text-umbanda-gold transition-colors w-full pt-4 border-t border-stone-100 dark:border-stone-800">
                           <ChevronUp size={14}/> Voltar ao Topo
                        </button>
                    </div>

                    {!isSubscriber && (
                        <div className="bg-gradient-to-br from-stone-900 to-black p-6 rounded-xl border border-stone-800 text-center relative overflow-hidden shadow-xl">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-umbanda-red/20 blur-2xl rounded-full"></div>
                            <Crown size={32} className="text-umbanda-gold mx-auto mb-3"/>
                            <h5 className="text-white font-bold font-serif mb-2">Clube VIP</h5>
                            <p className="text-stone-400 text-xs mb-4">Tenha acesso a rituais avançados e ebooks mensais.</p>
                            <Link to="/vip" className="block w-full py-2 bg-white text-black font-bold text-xs uppercase rounded hover:bg-stone-200 transition-colors">
                                Conhecer
                            </Link>
                        </div>
                    )}
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="lg:col-span-6">
                
                <AudioPlayer duration={`${readTime}:00`} />

                <VipGate isVip={article.isVip || false}>
                    <article className="
                        prose prose-lg md:prose-xl max-w-none 
                        text-stone-800 dark:text-stone-300
                        prose-p:leading-[1.9] prose-p:mb-8 prose-p:font-light prose-p:text-lg
                        prose-headings:font-serif prose-headings:font-bold prose-headings:text-stone-900 dark:prose-headings:text-stone-100
                        prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-8 prose-h2:flex prose-h2:items-center prose-h2:gap-3
                        prose-h3:text-xl prose-h3:text-umbanda-gold prose-h3:font-sans prose-h3:uppercase prose-h3:tracking-wider prose-h3:mt-10
                        prose-blockquote:border-none prose-blockquote:text-center prose-blockquote:text-2xl prose-blockquote:font-serif prose-blockquote:italic prose-blockquote:text-stone-900 dark:prose-blockquote:text-white prose-blockquote:my-12 prose-blockquote:bg-transparent
                        prose-a:text-umbanda-red prose-a:font-bold prose-a:no-underline hover:prose-a:underline
                        prose-img:rounded-xl prose-img:shadow-2xl prose-img:my-10 prose-img:border prose-img:border-stone-200 dark:prose-img:border-stone-800
                        prose-strong:font-bold prose-strong:text-stone-900 dark:prose-strong:text-stone-100
                    ">
                         <div dangerouslySetInnerHTML={{ __html: finalHTML || `<p class="lead">${article.excerpt}</p>` }} />
                    </article>

                    {/* CTA FINAL */}
                    {!isSubscriber && (
                        <div className="mt-16 mb-12 p-10 rounded-2xl bg-gradient-to-r from-umbanda-red to-red-900 text-white text-center shadow-2xl shadow-red-900/20 relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-20"></div>
                            <div className="relative z-10">
                                <Sparkles size={40} className="mx-auto mb-4 text-yellow-300" />
                                <h3 className="text-3xl font-serif font-bold mb-4">Receba Orientação Espiritual</h3>
                                <p className="text-red-100 text-lg mb-8 max-w-lg mx-auto">
                                    Não caminhe sozinho. Entre para nossa corrente e receba conteúdos exclusivos e rituais de proteção toda semana.
                                </p>
                                <div className="flex flex-col sm:flex-row justify-center gap-4">
                                    <Link to="/vip" className="px-8 py-3 bg-white text-red-900 font-bold rounded-lg hover:bg-stone-100 transition-colors shadow-lg">
                                        Entrar para Clube VIP
                                    </Link>
                                    <Link to="/contato" className="px-8 py-3 bg-red-950/50 border border-red-800 text-white font-bold rounded-lg hover:bg-red-900 transition-colors">
                                        Agendar Consulta
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </VipGate>

                {/* NOTA + REPUTAÇÃO */}
                <div className="py-10 border-t border-b border-stone-200 dark:border-stone-800 my-12 text-center">
                    <p className="text-stone-500 font-bold uppercase text-xs mb-4 tracking-widest">Este fundamento foi útil?</p>
                    <div className="flex justify-center gap-2 mb-4">
                        {[1,2,3,4,5].map(star => (
                            <button key={star} onClick={() => setUserRating(star)} className="group transition-transform hover:scale-110">
                                <Star 
                                    size={32} 
                                    className={`transition-colors ${star <= userRating ? 'text-umbanda-gold fill-umbanda-gold' : 'text-stone-300 dark:text-stone-700 group-hover:text-umbanda-gold'}`}
                                />
                            </button>
                        ))}
                    </div>
                    <div className="flex justify-center items-center gap-6 text-sm text-stone-500">
                        <button onClick={handleLike} className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${hasLiked ? 'bg-red-100 dark:bg-red-900/30 text-umbanda-red' : 'hover:bg-stone-100 dark:hover:bg-stone-800'}`}>
                            <Heart size={18} fill={hasLiked ? "currentColor" : "none"} /> {likes} Axés
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
                            <Share2 size={18} /> Compartilhar
                        </button>
                    </div>
                </div>

                {/* SEÇÃO AUTOR */}
                <div className="bg-white dark:bg-stone-900/50 rounded-2xl p-8 flex flex-col sm:flex-row gap-8 items-center sm:items-start text-center sm:text-left border border-stone-200 dark:border-stone-800 shadow-sm">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-stone-100 dark:border-stone-800 shadow-lg flex-shrink-0">
                         <img src={article.authorAvatar || `https://ui-avatars.com/api/?name=${article.author}`} alt={article.author} className="w-full h-full object-cover"/>
                    </div>
                    <div className="flex-1">
                        <h4 className="text-xl font-bold text-stone-900 dark:text-white font-serif mb-1">{article.author}</h4>
                        <p className="text-umbanda-gold text-xs font-bold uppercase tracking-wide mb-4">{article.authorRole || 'Colunista'}</p>
                        <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed mb-4 italic">
                            "Minha missão é desmistificar a Umbanda e trazer luz ao conhecimento ancestral, sempre com respeito e fundamento."
                        </p>
                        <Link to="/sobre" className="text-stone-900 dark:text-white font-bold text-xs uppercase border-b border-umbanda-gold hover:text-umbanda-gold transition-colors pb-0.5">
                            Ver Perfil Completo
                        </Link>
                    </div>
                </div>

                {/* COMENTÁRIOS */}
                <div className="mt-16">
                     <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-white mb-8 flex items-center gap-3">
                        <MessageSquare className="text-umbanda-gold" /> A Voz da Corrente <span className="text-sm font-sans font-normal text-stone-500">({comments.length})</span>
                    </h3>
                    
                    <form onSubmit={handleCommentSubmit} className="mb-10 bg-white dark:bg-stone-900 p-1 rounded-xl border border-stone-200 dark:border-stone-800 shadow-lg dark:shadow-sm focus-within:ring-2 ring-umbanda-gold/50 transition-all">
                        <div className="p-4">
                            <textarea 
                                value={commentText} onChange={e => setCommentText(e.target.value)} 
                                placeholder="Deixe sua mensagem de axé, dúvida ou agradecimento..." 
                                className="w-full bg-transparent text-stone-900 dark:text-white focus:outline-none min-h-[80px] text-lg resize-none placeholder-stone-400"
                            />
                        </div>
                        <div className="bg-[#fdfcf8] dark:bg-stone-950 p-3 rounded-b-xl flex flex-col sm:flex-row gap-3 items-center border-t border-stone-100 dark:border-stone-800">
                            <input value={commentName} onChange={e => setCommentName(e.target.value)} placeholder="Seu Nome (Obrigatório)" className="flex-1 bg-white dark:bg-transparent border border-stone-300 dark:border-stone-800 rounded-md py-2 px-3 text-stone-900 dark:text-white focus:outline-none focus:border-umbanda-gold text-sm shadow-sm dark:shadow-none"/>
                            <button type="submit" disabled={isSubmittingComment} className="bg-umbanda-gold hover:bg-yellow-600 text-white font-bold px-6 py-2 rounded-lg transition-colors disabled:opacity-50 text-sm flex items-center gap-2 whitespace-nowrap shadow-md">
                                {isSubmittingComment ? <Loader2 className="animate-spin" size={16}/> : <Send size={16}/>} Publicar
                            </button>
                        </div>
                    </form>

                    <div className="space-y-8">
                        {comments.length === 0 && <p className="text-stone-500 italic text-center">Seja o primeiro a firmar ponto nos comentários.</p>}
                        {comments.map(c => (
                            <div key={c.id} className="flex gap-4 group">
                                <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center font-bold text-stone-500 border border-stone-200 dark:border-stone-700 flex-shrink-0">
                                    {c.name.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <div className="bg-white dark:bg-stone-900/60 p-4 rounded-xl rounded-tl-none border border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 transition-colors shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <h5 className="font-bold text-stone-900 dark:text-white text-sm">{c.name}</h5>
                                            <span className="text-[10px] text-stone-500 uppercase tracking-wide">Hoje</span>
                                        </div>
                                        <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed">{c.text}</p>
                                    </div>
                                    <button className="text-xs text-stone-500 hover:text-umbanda-gold font-bold mt-2 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">Responder</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* RIGHT SIDEBAR (Sticky) */}
            <aside className="lg:col-span-3 space-y-8 hidden lg:block">
                <div className="sticky top-[400px]">
                    <h4 className="font-bold text-stone-900 dark:text-white mb-6 uppercase text-xs tracking-widest border-b border-stone-200 dark:border-stone-800 pb-2">
                        Relacionados
                    </h4>
                    <div className="space-y-6">
                        {relatedArticles.map(rel => (
                            <Link to={`/artigos/${rel.id}`} key={rel.id} className="flex gap-4 group items-start">
                                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 relative shadow-sm">
                                    <img src={rel.imageUrl} alt={rel.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>
                                </div>
                                <div>
                                    <span className="text-[10px] text-umbanda-gold font-bold uppercase mb-1 block">{rel.tags?.[0]}</span>
                                    <h5 className="text-sm font-bold text-stone-800 dark:text-stone-200 leading-snug group-hover:text-umbanda-red transition-colors line-clamp-3 font-serif">
                                        {rel.title}
                                    </h5>
                                </div>
                            </Link>
                        ))}
                    </div>
                    
                    <div className="mt-12 bg-white dark:bg-stone-900 p-6 rounded-xl text-center border border-stone-200 dark:border-stone-800 shadow-lg dark:shadow-none">
                        <MessageSquare className="mx-auto text-stone-400 mb-3" size={24}/>
                        <h4 className="font-bold text-stone-900 dark:text-white text-sm mb-2">Newsletter Espiritual</h4>
                        <p className="text-xs text-stone-500 mb-4">Receba ensinamentos semanais no seu e-mail.</p>
                        <input type="email" placeholder="Seu e-mail" className="w-full bg-[#fdfcf8] dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded px-3 py-2 text-xs mb-2 focus:border-umbanda-gold focus:outline-none"/>
                        <button className="w-full bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold py-2 rounded">Inscrever</button>
                    </div>
                </div>
            </aside>
        </div>
      </div>
      
      <div className="bg-[#fdfcf8] dark:bg-stone-900 py-16 border-t border-stone-200 dark:border-stone-900 mt-12">
          <div className="container mx-auto px-6 max-w-7xl">
              <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-white mb-8 flex items-center gap-2">
                  <BookOpen className="text-umbanda-gold"/> Continue Estudando
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                  {relatedArticles.map(rel => (
                      <Link to={`/artigos/${rel.id}`} key={rel.id} className="group block bg-white dark:bg-stone-900 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800 hover:shadow-xl dark:hover:shadow-lg transition-all shadow-sm">
                          <div className="h-48 overflow-hidden relative">
                              <img src={rel.imageUrl} alt={rel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>
                              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded uppercase">
                                  {rel.tags?.[0]}
                              </div>
                          </div>
                          <div className="p-6">
                              <h4 className="text-lg font-serif font-bold text-stone-900 dark:text-white mb-2 group-hover:text-umbanda-red transition-colors">
                                  {rel.title}
                              </h4>
                              <div className="flex items-center justify-between mt-4 text-xs text-stone-500">
                                  <span>{rel.date}</span>
                                  <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform text-umbanda-gold font-bold">Ler <ArrowRight size={12}/></span>
                              </div>
                          </div>
                      </Link>
                  ))}
              </div>
          </div>
      </div>

    </div>
  );
};

export default ArticleDetail;
