
import React, { useEffect, useState } from 'react';
import { CheckCircle, Crown, Lock, PlayCircle, BookOpen, Star, ShieldCheck, CreditCard, Video, FileText, Zap, LogOut, ArrowRight, Flame } from 'lucide-react';
import TestimonialCarousel from '../components/TestimonialCarousel';
import TrustBadges from '../components/TrustBadges';
import { StatsSection, FooterCTA } from '../components/ConversionSections';
import { isUserPremium, setPremiumStatus } from '../lib/usageUtils';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { VipContent } from '../types';
import { Link } from 'react-router-dom';

// Interface unificada para exibição
interface UnifiedVipItem {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    type: 'video' | 'ebook' | 'ritual_exclusivo' | 'article_vip' | 'ritual_vip';
    link: string;
    date?: any;
}

const Vip: React.FC = () => {
  const [isPremium, setIsPremium] = useState(false);
  const [content, setContent] = useState<UnifiedVipItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const checkStatus = async () => {
        const status = isUserPremium();
        setIsPremium(status);
        
        if (status) {
            try {
                // 1. Buscar Conteúdo VIP Exclusivo (Vídeos/Ebooks)
                const vipQuery = query(collection(db, 'vip_content'));
                const vipSnap = await getDocs(vipQuery);
                const vipItems = vipSnap.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        title: data.title,
                        description: data.description,
                        thumbnailUrl: data.thumbnailUrl,
                        type: data.type || 'video',
                        link: data.url || '#' // Link externo ou modal
                    } as UnifiedVipItem;
                });

                // 2. Buscar Artigos VIP
                const artQuery = query(collection(db, 'articles'), where('isVip', '==', true));
                const artSnap = await getDocs(artQuery);
                const artItems = artSnap.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        title: data.title,
                        description: data.excerpt,
                        thumbnailUrl: data.imageUrl,
                        type: 'article_vip',
                        link: `/artigos/${doc.id}`
                    } as UnifiedVipItem;
                });

                // 3. Buscar Rituais VIP
                const ritQuery = query(collection(db, 'rituals'), where('isVip', '==', true));
                const ritSnap = await getDocs(ritQuery);
                const ritItems = ritSnap.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        title: data.title,
                        description: data.description,
                        thumbnailUrl: data.imageUrl,
                        type: 'ritual_vip',
                        link: '/rituais' // Poderia ser detalhe se existisse página
                    } as UnifiedVipItem;
                });

                // Unificar e Ordenar (Mockando ordem pois vem de coleções diferentes)
                const allItems = [...vipItems, ...artItems, ...ritItems];
                setContent(allItems);

            } catch (e) {
                console.error("Erro ao carregar conteúdo VIP unificado:", e);
            }
        }
        setLoading(false);
    };
    checkStatus();
  }, []);

  const handleLogout = () => {
      if(window.confirm("Deseja sair do modo VIP? (Simulação)")) {
          setPremiumStatus(false);
          window.location.reload();
      }
  };

  const filteredContent = filter === 'all' ? content : content.filter(c => {
      if (filter === 'leitura') return c.type === 'article_vip' || c.type === 'ebook';
      if (filter === 'pratica') return c.type === 'ritual_vip' || c.type === 'ritual_exclusivo';
      return c.type === filter;
  });

  // --- VIP DASHBOARD VIEW ---
  if (loading) return <div className="min-h-screen bg-[#1a1520] flex items-center justify-center text-white font-serif">Abrindo a Porteira...</div>;

  if (isPremium) {
      return (
        <div className="min-h-screen bg-[#121016] text-stone-200 animate-fadeIn font-sans pb-20">
            {/* Header VIP */}
            <div className="bg-gradient-to-r from-purple-900 to-[#1a1520] border-b border-purple-800/50 pt-32 pb-12 px-6">
                <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-yellow-400 font-bold uppercase text-xs tracking-widest">
                            <Crown size={14} /> Membro da Corrente
                        </div>
                        <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2">Área do Assinante</h1>
                        <p className="text-purple-200">Bem-vindo de volta. Todo o conhecimento sagrado está liberado para você.</p>
                    </div>
                    <div className="flex gap-4">
                        <button className="px-6 py-2 bg-purple-800/50 border border-purple-500/30 rounded-lg text-sm font-bold hover:bg-purple-800 transition-colors">
                            Meu Plano
                        </button>
                        <button onClick={handleLogout} className="px-6 py-2 bg-red-900/20 border border-red-500/30 text-red-400 rounded-lg text-sm font-bold hover:bg-red-900/40 transition-colors flex items-center gap-2">
                            <LogOut size={16}/> Sair
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Stats / Shortcuts */}
            <div className="container mx-auto px-6 -mt-8 mb-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[#1e1a24] p-6 rounded-xl border border-purple-500/20 shadow-xl flex items-center gap-4">
                        <div className="p-3 bg-purple-500/20 rounded-full text-purple-400"><Video size={24}/></div>
                        <div>
                            <h4 className="font-bold text-white">Conteúdos Disponíveis</h4>
                            <p className="text-xs text-stone-400">{content.length} materiais liberados</p>
                        </div>
                    </div>
                    <div className="bg-[#1e1a24] p-6 rounded-xl border border-purple-500/20 shadow-xl flex items-center gap-4">
                        <div className="p-3 bg-yellow-500/20 rounded-full text-yellow-400"><Star size={24}/></div>
                        <div>
                            <h4 className="font-bold text-white">Rituais de Alta Magia</h4>
                            <p className="text-xs text-stone-400">Acesse firmezas avançadas</p>
                        </div>
                    </div>
                    <div className="bg-[#1e1a24] p-6 rounded-xl border border-purple-500/20 shadow-xl flex items-center gap-4">
                        <div className="p-3 bg-green-500/20 rounded-full text-green-400"><ShieldCheck size={24}/></div>
                        <div>
                            <h4 className="font-bold text-white">Proteção Ativa</h4>
                            <p className="text-xs text-stone-400">Seu nome está no congá</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Feed */}
            <div className="container mx-auto px-6">
                <div className="flex flex-wrap gap-4 mb-8 border-b border-stone-800 pb-4">
                    <FilterButton active={filter === 'all'} onClick={() => setFilter('all')} label="Todos" />
                    <FilterButton active={filter === 'leitura'} onClick={() => setFilter('leitura')} label="Estudos & Leitura" />
                    <FilterButton active={filter === 'pratica'} onClick={() => setFilter('pratica')} label="Rituais & Prática" />
                    <FilterButton active={filter === 'video'} onClick={() => setFilter('video')} label="Vídeos" />
                </div>

                {content.length === 0 ? (
                    <div className="text-center py-20 bg-[#1e1a24] rounded-2xl border border-dashed border-stone-800">
                        <Crown size={48} className="mx-auto mb-4 text-stone-600"/>
                        <h3 className="text-xl font-bold text-stone-400">A Curimba está preparando conteúdos...</h3>
                        <p className="text-stone-500">Aguarde novidades exclusivas em breve.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredContent.map(item => (
                            <Link to={item.link} key={item.id} className="block group">
                                <div className="bg-[#1e1a24] border border-stone-800 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all hover:-translate-y-1 h-full flex flex-col shadow-lg">
                                    <div className="h-48 relative overflow-hidden">
                                        <img src={item.thumbnailUrl || 'https://picsum.photos/id/1015/400/300'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.title}/>
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                                        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur px-2 py-1 rounded text-[10px] font-bold uppercase text-white flex items-center gap-1 border border-white/10">
                                            <ItemIcon type={item.type} />
                                            {formatType(item.type)}
                                        </div>
                                    </div>
                                    <div className="p-6 flex flex-col flex-1">
                                        <h3 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-purple-400 transition-colors">{item.title}</h3>
                                        <p className="text-stone-400 text-sm mb-6 line-clamp-3 flex-1">{item.description}</p>
                                        <div className="w-full py-3 bg-stone-800 group-hover:bg-purple-700 group-hover:text-white text-stone-300 rounded-lg font-bold transition-colors text-xs uppercase tracking-wide flex items-center justify-center gap-2">
                                            Acessar Agora <ArrowRight size={14}/>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
      );
  }

  // --- SALES PAGE VIEW (Non-Premium) ---
  return (
    <div className="animate-fadeIn font-sans text-stone-900 dark:text-stone-200">
      {/* Hero VIP */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-50 z-0"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-umbanda-red/20 to-[#fdfcf8] dark:to-stone-950 z-0"></div>
        <div className="absolute inset-0 bg-stone-950/80 dark:bg-transparent z-0"></div>
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-umbanda-gold/10 border border-umbanda-gold text-umbanda-gold mb-8 animate-bounce backdrop-blur-sm shadow-[0_0_15px_rgba(217,119,6,0.3)]">
            <Crown size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Acesso Restrito & Exclusivo</span>
          </div>
          
          <h1 className="text-4xl md:text-7xl font-serif font-bold text-white mb-6 drop-shadow-lg leading-tight">
            Sua Evolução Espiritual <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-umbanda-gold to-yellow-200">Começa Aqui</span>
          </h1>
          <p className="text-xl text-stone-200 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Junte-se à maior comunidade de estudos e práticas de Umbanda. Tenha acesso a rituais avançados, orientação direta e materiais que não estão disponíveis publicamente.
          </p>

          <div className="flex flex-col md:flex-row justify-center gap-4">
            <button className="px-8 py-4 bg-umbanda-gold hover:bg-yellow-500 text-stone-900 font-bold rounded-lg shadow-[0_0_20px_rgba(217,119,6,0.4)] transition-all transform hover:-translate-y-1 text-lg">
              Quero ser Membro VIP
            </button>
            <button className="px-8 py-4 bg-white/10 border border-white/20 hover:border-white text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 backdrop-blur-md">
              <Lock size={18} /> Área do Assinante
            </button>
          </div>
          
          <div className="mt-8 flex justify-center items-center gap-4 text-xs text-stone-400 font-bold uppercase tracking-wide">
             <span className="flex items-center gap-1"><ShieldCheck size={14} className="text-green-500"/> Compra Segura</span>
             <span className="flex items-center gap-1"><CheckCircle size={14} className="text-green-500"/> Satisfação Garantida</span>
          </div>
        </div>
      </section>

      <TrustBadges />

      {/* Benefits Grid */}
      <section className="py-24 bg-stone-100 dark:bg-stone-950 transition-colors duration-300">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
              <h2 className="text-3xl font-serif font-bold text-stone-900 dark:text-white mb-4">O Que Você Recebe Imediatamente</h2>
              <div className="w-24 h-1 bg-umbanda-red mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <BenefitCard 
              icon={<PlayCircle size={32} />}
              title="Acervo de Aulas"
              description="Vídeos exclusivos sobre doutrina, teologia e prática. Aprenda o fundamento correto sem sair de casa."
            />
            <BenefitCard 
              icon={<BookOpen size={32} />}
              title="Biblioteca Mística"
              description="E-books mensais e PDFs com rezas, pontos riscados e estudos aprofundados sobre os Orixás."
            />
            <BenefitCard 
              icon={<Star size={32} />}
              title="Rituais de Alta Magia"
              description="Firmezas avançadas para prosperidade, amor e proteção que não publicamos no blog aberto."
            />
            <BenefitCard 
              icon={<ShieldCheck size={32} />}
              title="Proteção Espiritual"
              description="Participe das orações coletivas semanais onde colocamos o nome de todos os membros no congá."
            />
            <BenefitCard 
              icon={<CreditCard size={32} />}
              title="Descontos Especiais"
              description="Preços reduzidos em consultas particulares de Búzios e Tarot com nossos sacerdotes."
            />
            <BenefitCard 
              icon={<Lock size={32} />}
              title="Grupo Fechado"
              description="Acesso ao nosso grupo de WhatsApp exclusivo para tirar dúvidas diretamente com a curimba."
            />
          </div>
        </div>
      </section>

      <StatsSection />

      {/* Pricing / Offer */}
      <section className="py-24 bg-white dark:bg-stone-900 border-y border-stone-200 dark:border-stone-800 transition-colors duration-300 relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-umbanda-gold/5 rounded-full blur-[100px]"></div>

        <div className="container mx-auto px-6 max-w-5xl relative z-10">
          <div className="bg-gradient-to-br from-stone-100 to-white dark:from-stone-950 dark:to-black rounded-3xl p-8 md:p-16 border-2 border-umbanda-gold shadow-2xl relative overflow-hidden transition-colors duration-300">
            <div className="absolute top-0 right-0 bg-umbanda-red text-white text-sm font-bold px-6 py-2 rounded-bl-xl uppercase shadow-lg">
              Oferta por Tempo Limitado
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div>
                <h3 className="text-4xl font-serif font-bold text-stone-900 dark:text-white mb-6">Invista na sua Espiritualidade</h3>
                <p className="text-stone-600 dark:text-stone-400 mb-8 leading-relaxed">
                    Não é apenas um acesso a conteúdo. É um compromisso com sua evolução e proteção. Pelo preço de um lanche, você garante um mês inteiro de orientação e luz.
                </p>
                <ul className="space-y-4 text-stone-700 dark:text-stone-300 font-medium">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                    <span>Acesso Ilimitado a TUDO</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                    <span>Sem fidelidade (Cancele quando quiser)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                    <span>Ferramentas de IA Ilimitadas</span>
                  </li>
                </ul>
              </div>

              <div className="text-center bg-white dark:bg-stone-900 p-10 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xl transform scale-105">
                <p className="text-stone-500 dark:text-stone-400 text-sm uppercase font-bold mb-2 tracking-widest">Plano Mensal</p>
                <div className="flex justify-center items-end gap-2 mb-4">
                    <span className="text-stone-400 line-through text-xl">R$ 49,90</span>
                    <span className="text-6xl font-bold text-stone-900 dark:text-white">R$ 29,90</span>
                </div>
                <p className="text-green-600 font-bold text-sm mb-8 bg-green-100 dark:bg-green-900/30 py-1 px-3 rounded-full inline-block">Economize e Ganhe Bônus</p>
                
                <button className="w-full py-5 bg-gradient-to-r from-umbanda-gold to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2">
                  <Crown size={20} className="fill-white"/> Assinar Agora
                </button>
                <p className="text-xs text-stone-500 mt-4 flex justify-center items-center gap-1">
                    <Lock size={10}/> Ambiente criptografado e seguro.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <TestimonialCarousel />
      <FooterCTA />
    </div>
  );
};

// --- HELPER COMPONENTS ---

const FilterButton = ({ active, onClick, label }: any) => (
    <button 
        onClick={onClick}
        className={`px-4 py-2 rounded-full text-sm font-bold capitalize transition-all ${active ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'bg-stone-800 text-stone-400 hover:text-white'}`}
    >
        {label}
    </button>
);

const BenefitCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="p-8 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-umbanda-gold dark:hover:border-umbanda-gold transition-all group shadow-lg dark:shadow-none hover:-translate-y-2">
    <div className="w-16 h-16 bg-stone-50 dark:bg-stone-950 rounded-full flex items-center justify-center text-umbanda-gold mb-6 group-hover:scale-110 transition-transform shadow-inner border border-stone-100 dark:border-stone-800 group-hover:bg-umbanda-gold group-hover:text-stone-900">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-3">{title}</h3>
    <p className="text-stone-600 dark:text-stone-400 leading-relaxed text-sm">
      {description}
    </p>
  </div>
);

const ItemIcon = ({type}: {type: string}) => {
    switch(type) {
        case 'video': return <Video size={10}/>;
        case 'ebook': return <FileText size={10}/>;
        case 'ritual_exclusivo': 
        case 'ritual_vip': return <Zap size={10}/>;
        case 'article_vip': return <BookOpen size={10}/>;
        default: return <Star size={10}/>;
    }
};

const formatType = (type: string) => {
    const map: any = {
        'video': 'Aula em Vídeo',
        'ebook': 'E-book Digital',
        'ritual_exclusivo': 'Firmeza Secreta',
        'article_vip': 'Fundamento VIP',
        'ritual_vip': 'Ritual Avançado'
    };
    return map[type] || 'Conteúdo Exclusivo';
};

export default Vip;
