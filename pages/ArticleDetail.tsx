import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, query, limit, getDocs, updateDoc, increment, addDoc, serverTimestamp, onSnapshot, orderBy } from 'firebase/firestore';
import { Article, Comment } from '../types';
import { 
  Loader2, ArrowLeft, Calendar, User, Tag, Share2, 
  Facebook, Twitter, Link as LinkIcon, MessageCircle, 
  Clock, BookOpen, Heart, Send, MessageSquare
} from 'lucide-react';

const ArticleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  // Article Data
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Social Interactions State
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);

  // Comment Form State
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchArticleAndRelated = async () => {
      if (!id) return;
      setLoading(true);
      try {
        // 1. Fetch Main Article
        const docRef = doc(db, 'articles', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const articleData = { id: docSnap.id, ...docSnap.data() } as Article;
          setArticle(articleData);
          setLikes(articleData.likes || 0);

          // Check Local Storage for Like
          const likedKey = `liked_article_${id}`;
          if (localStorage.getItem(likedKey)) {
            setHasLiked(true);
          }

          // 2. Fetch Related (Simulated)
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
    
    // 3. Realtime Listener for Comments
    if (id) {
        const commentsRef = collection(db, 'articles', id, 'comments');
        const qComments = query(commentsRef, orderBy('createdAt', 'desc'));
        
        const unsubscribe = onSnapshot(qComments, (snapshot) => {
            const loadedComments = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Comment[];
            setComments(loadedComments);
        });

        window.scrollTo(0, 0);
        fetchArticleAndRelated();
        
        return () => unsubscribe();
    }
  }, [id]);

  const handleLike = async () => {
      if (!id || hasLiked) return;

      // Optimistic UI update
      setLikes(prev => prev + 1);
      setHasLiked(true);
      localStorage.setItem(`liked_article_${id}`, 'true');

      try {
          const articleRef = doc(db, 'articles', id);
          await updateDoc(articleRef, {
              likes: increment(1)
          });
      } catch (error) {
          console.error("Erro ao curtir:", error);
          // Revert if error
          setLikes(prev => prev - 1);
          setHasLiked(false);
      }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!id || !commentName.trim() || !commentText.trim()) return;

      setIsSubmittingComment(true);
      try {
          const commentsRef = collection(db, 'articles', id, 'comments');
          await addDoc(commentsRef, {
              name: commentName,
              text: commentText,
              createdAt: serverTimestamp()
          });
          setCommentText(''); // Keep name for convenience
      } catch (error) {
          console.error("Erro ao comentar:", error);
          alert("Erro ao enviar comentário. Tente novamente.");
      } finally {
          setIsSubmittingComment(false);
      }
  };

  const handleShare = (platform: string) => {
    if (!article) return;
    const url = window.location.href;
    const text = encodeURIComponent(`Leia este artigo incrível no Umbanda Cuiabá: ${article.title}`);
    
    let shareUrl = '';
    switch(platform) {
        case 'whatsapp': shareUrl = `https://wa.me/?text=${text} ${url}`; break;
        case 'facebook': shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`; break;
        case 'twitter': shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`; break;
        case 'copy':
            navigator.clipboard.writeText(url);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
            return;
    }
    if (shareUrl) window.open(shareUrl, '_blank');
  };

  // Format Date Helper
  const formatCommentDate = (timestamp: any) => {
      if (!timestamp) return 'Agora mesmo';
      const date = timestamp.toDate ? timestamp.toDate() : new Date();
      return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex justify-center bg-umbanda-black">
        <Loader2 className="w-10 h-10 text-umbanda-gold animate-spin" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen pt-32 container mx-auto px-6 text-center bg-umbanda-black">
        <h2 className="text-2xl text-white font-bold mb-4">Artigo não encontrado</h2>
        <Link to="/artigos" className="text-umbanda-gold hover:underline">Voltar para o Blog</Link>
      </div>
    );
  }

  // Calculate read time estimate (rough)
  const wordCount = article.content ? article.content.replace(/<[^>]*>?/gm, '').split(' ').length : 0;
  const readTime = Math.ceil(wordCount / 200);

  return (
    <div className="bg-umbanda-black min-h-screen animate-fadeIn font-sans text-stone-200">
      
      {/* --- HERO SECTION --- */}
      <div className="relative h-[50vh] md:h-[65vh] w-full">
        {/* Image Background */}
        <div className="absolute inset-0">
            <img 
            src={article.imageUrl} 
            alt={article.title} 
            className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-umbanda-black via-umbanda-black/80 to-transparent"></div>
            <div className="absolute inset-0 bg-umbanda-red/10 mix-blend-multiply"></div>
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 w-full z-20 pb-16">
            <div className="container mx-auto px-6 md:px-12">
                <Link to="/artigos" className="inline-flex items-center text-stone-300 hover:text-umbanda-gold mb-8 transition-colors font-bold text-xs uppercase tracking-[0.2em] group">
                    <ArrowLeft size={14} className="mr-2 group-hover:-translate-x-1 transition-transform"/> Voltar para o Blog
                </Link>
                
                <div className="flex flex-wrap items-center gap-4 mb-6">
                    {article.tags?.map(tag => (
                        <span key={tag} className="bg-umbanda-gold/10 text-umbanda-gold border border-umbanda-gold/30 px-3 py-1 text-xs font-bold uppercase rounded tracking-wider">
                            {tag}
                        </span>
                    ))}
                    <span className="flex items-center text-xs text-stone-400 font-medium">
                        <Clock size={14} className="mr-1"/> {readTime} min de leitura
                    </span>
                </div>

                <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-white leading-tight max-w-5xl drop-shadow-2xl mb-8">
                    {article.title}
                </h1>

                <div className="flex items-center gap-4 border-t border-stone-800 pt-6 max-w-3xl">
                    <div className="w-12 h-12 bg-stone-800 rounded-full flex items-center justify-center text-stone-400 border-2 border-stone-700">
                        <User size={24} />
                    </div>
                    <div>
                        <p className="text-white font-bold text-sm">Escrito por {article.author}</p>
                        <p className="text-stone-500 text-xs flex items-center gap-2">
                             <Calendar size={12}/> {article.date}
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="container mx-auto px-6 md:px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* ARTICLE BODY */}
            <main className="lg:col-span-8">
                
                {/* Social Share Mobile */}
                <div className="flex justify-between items-center mb-8 lg:hidden pb-8 border-b border-stone-800">
                    <div className="flex gap-4">
                        <button onClick={() => handleShare('whatsapp')} className="bg-[#25D366] text-white p-3 rounded-full"><MessageCircle size={20}/></button>
                        <button onClick={() => handleShare('facebook')} className="bg-[#1877F2] text-white p-3 rounded-full"><Facebook size={20}/></button>
                    </div>
                    <button 
                        onClick={handleLike} 
                        className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all ${hasLiked ? 'bg-umbanda-red text-white' : 'bg-stone-800 text-stone-300'}`}
                    >
                        <Heart size={20} fill={hasLiked ? "currentColor" : "none"} /> {likes}
                    </button>
                </div>

                {/* The Content */}
                <article className="
                    prose prose-lg prose-invert max-w-none 
                    prose-headings:font-serif prose-headings:font-bold prose-headings:text-stone-100 prose-headings:mt-12 prose-headings:mb-6
                    prose-h1:text-4xl prose-h2:text-3xl prose-h2:border-l-4 prose-h2:border-umbanda-red prose-h2:pl-4
                    prose-h3:text-2xl prose-h3:text-umbanda-gold
                    prose-p:text-stone-300 prose-p:leading-8 prose-p:mb-6
                    prose-strong:text-white prose-strong:font-bold
                    prose-lead:text-xl prose-lead:text-stone-200 prose-lead:font-serif prose-lead:italic
                    prose-a:text-umbanda-gold prose-a:font-bold prose-a:no-underline hover:prose-a:underline hover:prose-a:text-white transition-colors
                    prose-blockquote:border-l-umbanda-gold prose-blockquote:bg-stone-900/40 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:text-stone-200 prose-blockquote:not-italic prose-blockquote:font-serif
                    prose-ul:list-disc prose-ul:marker:text-umbanda-red prose-li:text-stone-300 prose-li:mb-2
                    prose-img:rounded-xl prose-img:shadow-2xl prose-img:border prose-img:border-stone-800 prose-img:my-10
                    prose-hr:border-stone-800 prose-hr:my-12
                ">
                    <div dangerouslySetInnerHTML={{ __html: article.content || `<p class="lead">${article.excerpt}</p><p>Conteúdo completo em breve...</p>` }} />
                </article>

                {/* Footer Interaction Area */}
                <div className="mt-16 pt-10 border-t border-stone-800">
                    
                    {/* Like & Share Big Block */}
                    <div className="bg-stone-900 rounded-xl p-8 mb-12 flex flex-col md:flex-row justify-between items-center gap-8 border border-stone-800">
                        <div className="text-center md:text-left">
                            <h3 className="text-2xl font-serif font-bold text-white mb-2">Gostou deste ensinamento?</h3>
                            <p className="text-stone-400">Deixe seu axé clicando no coração ao lado.</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <button 
                                onClick={handleLike} 
                                className={`group flex flex-col items-center justify-center w-20 h-20 rounded-full border-2 transition-all duration-300 ${hasLiked ? 'bg-umbanda-red border-umbanda-red shadow-[0_0_20px_rgba(220,38,38,0.5)]' : 'bg-transparent border-stone-600 hover:border-umbanda-red'}`}
                            >
                                <Heart 
                                    size={32} 
                                    className={`transition-all duration-300 ${hasLiked ? 'text-white scale-110' : 'text-stone-400 group-hover:text-umbanda-red'}`} 
                                    fill={hasLiked ? "currentColor" : "none"} 
                                />
                                <span className={`text-xs font-bold mt-1 ${hasLiked ? 'text-white' : 'text-stone-500 group-hover:text-umbanda-red'}`}>{likes}</span>
                            </button>
                        </div>
                    </div>

                    {/* Social Buttons */}
                    <div className="flex justify-center md:justify-start gap-3 mb-12">
                         <span className="text-sm font-bold uppercase tracking-wider text-stone-500 py-3 mr-2">Compartilhar:</span>
                         <button onClick={() => handleShare('whatsapp')} className="flex items-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-white px-4 py-2 rounded-lg transition-all font-bold text-sm border border-[#25D366]/20">
                            <MessageCircle size={18}/> <span className="hidden sm:inline">WhatsApp</span>
                         </button>
                         <button onClick={() => handleShare('facebook')} className="p-3 bg-stone-800 hover:bg-[#1877F2] text-stone-300 hover:text-white rounded-lg transition-all">
                            <Facebook size={18}/>
                         </button>
                         <button onClick={() => handleShare('copy')} className="p-3 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded-lg transition-all relative">
                            <LinkIcon size={18}/>
                            {copySuccess && <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] bg-white text-black px-2 py-1 rounded">Copiado!</span>}
                         </button>
                    </div>

                    {/* COMMENTS SECTION */}
                    <div className="bg-stone-900/40 rounded-2xl p-6 md:p-10 border border-stone-800">
                        <h3 className="text-2xl font-serif font-bold text-white mb-8 flex items-center gap-3">
                            <MessageSquare className="text-umbanda-gold" /> Comentários da Corrente ({comments.length})
                        </h3>

                        {/* Comment Form */}
                        <form onSubmit={handleCommentSubmit} className="mb-12 bg-stone-900 p-6 rounded-xl border border-stone-800 shadow-inner">
                            <div className="mb-4">
                                <label className="block text-xs font-bold uppercase text-stone-500 mb-2">Seu Nome</label>
                                <input 
                                    type="text" 
                                    value={commentName}
                                    onChange={(e) => setCommentName(e.target.value)}
                                    placeholder="Digite seu nome ou apelido"
                                    className="w-full bg-stone-950 border border-stone-800 rounded p-3 text-white focus:border-umbanda-gold focus:outline-none placeholder-stone-700"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-xs font-bold uppercase text-stone-500 mb-2">Sua Mensagem</label>
                                <textarea 
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Deixe seu axé, dúvida ou agradecimento..."
                                    rows={3}
                                    className="w-full bg-stone-950 border border-stone-800 rounded p-3 text-white focus:border-umbanda-gold focus:outline-none placeholder-stone-700 resize-none"
                                    required
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={isSubmittingComment}
                                className="bg-umbanda-gold hover:bg-yellow-600 text-stone-950 font-bold py-3 px-6 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                {isSubmittingComment ? <Loader2 className="animate-spin" size={18}/> : <Send size={18}/>}
                                Publicar Comentário
                            </button>
                        </form>

                        {/* Comments List */}
                        <div className="space-y-6">
                            {comments.length === 0 ? (
                                <p className="text-center text-stone-500 py-8 italic">Seja o primeiro a deixar seu axé neste artigo.</p>
                            ) : (
                                comments.map(comment => (
                                    <div key={comment.id} className="flex gap-4 animate-fadeIn">
                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-400 font-serif font-bold flex-shrink-0">
                                            {comment.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                            <div className="bg-stone-900 rounded-lg rounded-tl-none p-4 border border-stone-800/50">
                                                <div className="flex justify-between items-baseline mb-2">
                                                    <h4 className="font-bold text-white text-sm">{comment.name}</h4>
                                                    <span className="text-[10px] text-stone-500">{formatCommentDate(comment.createdAt)}</span>
                                                </div>
                                                <p className="text-stone-300 text-sm leading-relaxed whitespace-pre-wrap">{comment.text}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Author Bio Box */}
                <div className="mt-12 bg-stone-900/60 p-8 rounded-2xl border border-stone-800 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                    <div className="w-20 h-20 bg-stone-800 rounded-full flex items-center justify-center text-stone-500 border-2 border-umbanda-gold/50 flex-shrink-0">
                        <User size={40} />
                    </div>
                    <div>
                        <h4 className="text-white font-serif font-bold text-lg mb-2">Sobre {article.author}</h4>
                        <p className="text-stone-400 text-sm leading-relaxed mb-4">
                            Membro da curimba de conteúdo do Umbanda Cuiabá. Dedicado aos estudos da espiritualidade e fundamentos de terreiro.
                        </p>
                    </div>
                </div>

            </main>

            {/* SIDEBAR */}
            <aside className="lg:col-span-4 space-y-12">
                
                {/* Related Articles Widget */}
                <div className="bg-stone-900/30 border border-stone-800 rounded-xl p-6">
                    <h3 className="text-lg font-serif font-bold text-white mb-6 flex items-center gap-2">
                        <BookOpen size={18} className="text-umbanda-gold"/> Veja Também
                    </h3>
                    <div className="space-y-6">
                        {relatedArticles.map(item => (
                            <Link to={`/artigos/${item.id}`} key={item.id} className="group flex gap-4 items-start">
                                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 grayscale group-hover:grayscale-0"/>
                                </div>
                                <div>
                                    <h4 className="text-stone-200 font-bold text-sm leading-snug group-hover:text-umbanda-gold transition-colors mb-1 line-clamp-3">
                                        {item.title}
                                    </h4>
                                    <span className="text-xs text-stone-500">{item.date}</span>
                                </div>
                            </Link>
                        ))}
                        {relatedArticles.length === 0 && <p className="text-stone-500 text-sm">Sem outros artigos no momento.</p>}
                    </div>
                </div>

                {/* Newsletter Widget */}
                <div className="bg-gradient-to-b from-stone-900 to-stone-950 border border-stone-800 p-8 rounded-xl sticky top-24 text-center">
                    <div className="w-12 h-12 bg-umbanda-red/20 text-umbanda-red rounded-full flex items-center justify-center mx-auto mb-4 border border-umbanda-red/30">
                        <Share2 size={24}/>
                    </div>
                    <h3 className="text-xl font-serif font-bold text-white mb-2">Participe da Corrente</h3>
                    <p className="text-stone-400 mb-6 text-sm">
                        Não perca nenhum fundamento. Receba novos artigos e avisos de gira no seu e-mail.
                    </p>
                    <input type="email" placeholder="Seu melhor e-mail" className="w-full bg-stone-950 border border-stone-800 rounded p-3 text-white mb-3 focus:border-umbanda-gold focus:outline-none text-sm"/>
                    <button className="w-full bg-umbanda-red hover:bg-red-800 text-white font-bold py-3 rounded transition-colors text-sm uppercase tracking-wide">
                        Inscrever-se Agora
                    </button>
                    <p className="text-[10px] text-stone-600 mt-4">Respeitamos seu axé. Zero spam.</p>
                </div>

            </aside>

        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;