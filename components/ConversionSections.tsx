
import React from 'react';
import { Link } from 'react-router-dom';
import { MousePointerClick, MessageSquareHeart, Sparkles, Check, X, TrendingUp, Shield, Zap, Lock, Star } from 'lucide-react';

// --- COMO FUNCIONA ---
export const HowItWorks: React.FC = () => (
  <section className="py-20 bg-white dark:bg-stone-950">
    <div className="container mx-auto px-6 text-center">
      <span className="text-umbanda-gold font-bold tracking-widest text-xs uppercase mb-2 block">Simples e Poderoso</span>
      <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 dark:text-white mb-16">Sua Jornada em 3 Passos</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
        {/* Connecting Line (Desktop) */}
        <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-stone-300 dark:via-stone-700 to-transparent -z-10"></div>

        <Step 
          num="01" 
          icon={<MousePointerClick size={32} />} 
          title="Escolha seu Oráculo" 
          desc="Selecione entre Cartas, Búzios, Interpretação de Sonhos ou Banhos." 
        />
        <Step 
          num="02" 
          icon={<Sparkles size={32} />} 
          title="Receba a Orientação" 
          desc="Nossa Inteligência Espiritual canaliza a resposta baseada nos fundamentos." 
        />
        <Step 
          num="03" 
          icon={<MessageSquareHeart size={32} />} 
          title="Transforme sua Vida" 
          desc="Aplique os conselhos, faça os banhos e sinta a mudança acontecer." 
        />
      </div>

      <div className="mt-12">
        <Link to="/servicos" className="inline-flex items-center gap-2 text-umbanda-red font-bold hover:underline">
           Começar Agora <TrendingUp size={16}/>
        </Link>
      </div>
    </div>
  </section>
);

const Step = ({ num, icon, title, desc }: any) => (
  <div className="flex flex-col items-center group">
    <div className="w-24 h-24 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-center text-stone-700 dark:text-stone-300 shadow-lg group-hover:scale-110 transition-transform duration-300 relative mb-6">
      <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-umbanda-gold text-white font-bold flex items-center justify-center text-sm border-2 border-white dark:border-stone-950">
        {num}
      </div>
      {icon}
    </div>
    <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-2">{title}</h3>
    <p className="text-stone-600 dark:text-stone-400 text-sm max-w-xs leading-relaxed">{desc}</p>
  </div>
);


// --- COMPARATIVO ---
export const PricingComparison: React.FC = () => (
  <section className="py-20 bg-stone-50 dark:bg-stone-900/50">
    <div className="container mx-auto px-6">
       <div className="text-center mb-12">
          <h2 className="text-3xl font-serif font-bold text-stone-900 dark:text-white">Escolha seu Caminho</h2>
          <p className="text-stone-500 mt-2">Invista na sua evolução espiritual.</p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Card */}
          <div className="bg-white dark:bg-stone-950 p-8 rounded-2xl border border-stone-200 dark:border-stone-800 flex flex-col items-center text-center opacity-80 hover:opacity-100 transition-opacity">
              <h3 className="text-xl font-bold text-stone-500 uppercase tracking-widest mb-4">Visitante</h3>
              <div className="text-4xl font-serif font-bold text-stone-900 dark:text-white mb-2">Grátis</div>
              <p className="text-sm text-stone-500 mb-8">Para quem está conhecendo.</p>
              
              <ul className="space-y-4 mb-8 text-sm text-stone-600 dark:text-stone-400 w-full">
                  <li className="flex items-center justify-center gap-2"><Check size={16} className="text-stone-400"/> 1 Leitura Diária (Simples)</li>
                  <li className="flex items-center justify-center gap-2"><Check size={16} className="text-stone-400"/> Acesso ao Blog</li>
                  <li className="flex items-center justify-center gap-2 text-stone-400/50 line-through"><X size={16}/> Análises Profundas</li>
                  <li className="flex items-center justify-center gap-2 text-stone-400/50 line-through"><X size={16}/> Rituais Completos</li>
              </ul>
              <Link to="/oraculo" className="w-full py-3 border border-stone-300 dark:border-stone-700 rounded-lg font-bold text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
                  Testar Grátis
              </Link>
          </div>

          {/* Premium Card */}
          <div className="bg-white dark:bg-stone-900 p-8 rounded-2xl border-2 border-umbanda-gold relative shadow-2xl transform md:-translate-y-4 flex flex-col items-center text-center">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-umbanda-gold text-white text-xs font-bold px-4 py-1 rounded-full uppercase shadow-lg">
                  Recomendado
              </div>
              <h3 className="text-xl font-bold text-umbanda-gold uppercase tracking-widest mb-4">Membro VIP</h3>
              <div className="text-4xl font-serif font-bold text-stone-900 dark:text-white mb-2">R$ 29,90</div>
              <p className="text-sm text-stone-500 mb-8">Acesso ilimitado e profundo.</p>

              <ul className="space-y-4 mb-8 text-sm text-stone-700 dark:text-stone-300 w-full font-medium">
                  <li className="flex items-center justify-center gap-2"><Check size={16} className="text-green-500"/> Leituras Ilimitadas</li>
                  <li className="flex items-center justify-center gap-2"><Check size={16} className="text-green-500"/> Análises Detalhadas</li>
                  <li className="flex items-center justify-center gap-2"><Check size={16} className="text-green-500"/> Rituais Exclusivos</li>
                  <li className="flex items-center justify-center gap-2"><Check size={16} className="text-green-500"/> Suporte Prioritário</li>
              </ul>
              <Link to="/vip" className="w-full py-4 bg-gradient-to-r from-umbanda-gold to-yellow-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2">
                  <Sparkles size={18}/> Desbloquear Tudo
              </Link>
          </div>
       </div>
    </div>
  </section>
);

// --- RESULTS STATS ---
export const StatsSection: React.FC = () => (
    <section className="py-16 bg-stone-900 text-white border-y border-stone-800">
        <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-stone-800">
                <div className="p-4">
                    <div className="text-4xl md:text-5xl font-bold text-umbanda-gold mb-2">98%</div>
                    <p className="text-stone-400 text-sm uppercase tracking-wide">Sentiram mais clareza mental</p>
                </div>
                <div className="p-4">
                    <div className="text-4xl md:text-5xl font-bold text-green-500 mb-2">24h</div>
                    <p className="text-stone-400 text-sm uppercase tracking-wide">Disponibilidade Espiritual</p>
                </div>
                <div className="p-4">
                    <div className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">12k+</div>
                    <p className="text-stone-400 text-sm uppercase tracking-wide">Vidas Transformadas</p>
                </div>
            </div>
            <p className="text-center text-stone-500 text-xs mt-8 italic">
                * Dados baseados em pesquisa interna com usuários ativos nos últimos 30 dias.
            </p>
        </div>
    </section>
);

// --- USP (Unique Selling Proposition) ---
export const UniqueSellingPoints: React.FC = () => (
    <section className="py-20 bg-white dark:bg-stone-950">
        <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="flex-1 space-y-8">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 dark:text-white">
                        Por que nossa comunidade não para de crescer?
                    </h2>
                    <div className="space-y-6">
                        <USPItem 
                            icon={<Zap className="text-yellow-500"/>} 
                            title="Precisão e Rapidez" 
                            desc="Sem filas de espera. Obtenha respostas imediatas para suas angústias."
                        />
                        <USPItem 
                            icon={<Shield className="text-green-500"/>} 
                            title="Ambiente Seguro" 
                            desc="Livre de julgamentos. Sua jornada é pessoal e respeitada aqui."
                        />
                        <USPItem 
                            icon={<Lock className="text-blue-500"/>} 
                            title="Fundamento Real" 
                            desc="Não é aleatório. Todo o sistema foi treinado com base na teologia de Umbanda."
                        />
                    </div>
                    <Link to="/vip" className="inline-block px-8 py-4 bg-stone-900 dark:bg-stone-800 text-white font-bold rounded-lg hover:bg-stone-800 dark:hover:bg-stone-700 transition-colors">
                        Junte-se a Nós
                    </Link>
                </div>
                <div className="flex-1 relative">
                     <div className="absolute inset-0 bg-umbanda-gold/20 blur-3xl rounded-full"></div>
                     <img 
                        src="https://images.unsplash.com/photo-1528351655760-705b7668579d?w=800&q=80" 
                        alt="Paz Espiritual" 
                        className="relative z-10 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 grayscale hover:grayscale-0 transition-all duration-700"
                     />
                </div>
            </div>
        </div>
    </section>
);

const USPItem = ({icon, title, desc}: any) => (
    <div className="flex gap-4">
        <div className="w-12 h-12 rounded-full bg-stone-100 dark:bg-stone-900 flex items-center justify-center flex-shrink-0 shadow-sm">
            {icon}
        </div>
        <div>
            <h4 className="text-lg font-bold text-stone-900 dark:text-white mb-1">{title}</h4>
            <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">{desc}</p>
        </div>
    </div>
);

// --- EMOTIONAL BLOCK ---
export const EmotionalBlock: React.FC = () => (
    <section className="relative py-32 bg-fixed bg-center bg-cover" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1518155317743-a8ff43ea6a5f?w=1920&q=80')" }}>
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="container mx-auto px-6 relative z-10 text-center">
             <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6">
                "A paz que você procura não está longe. <br/>Ela começa com o primeiro passo."
             </h2>
             <p className="text-stone-300 text-lg mb-10 max-w-2xl mx-auto">
                 Milhares de pessoas já encontraram seu caminho de luz através da nossa orientação. Você é o próximo.
             </p>
             <Link to="/servicos" className="px-10 py-4 bg-white text-stone-900 font-bold rounded-full hover:bg-stone-200 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                 Quero Encontrar Minha Paz
             </Link>
        </div>
    </section>
);

// --- HIGH CONVERSION FOOTER CTA ---
export const FooterCTA: React.FC = () => (
    <section className="py-20 bg-gradient-to-r from-umbanda-red to-red-900 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-30"></div>
        <div className="container mx-auto px-6 relative z-10">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur">
                <Star className="text-yellow-300 fill-yellow-300" size={32}/>
            </div>
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">Pronto para transformar sua vida?</h2>
            <p className="text-red-100 text-lg mb-10 max-w-2xl mx-auto">
                Não deixe para amanhã a clareza que você pode ter hoje. Garantia de satisfação ou cancelamento a qualquer momento.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/vip" className="px-8 py-4 bg-umbanda-gold hover:bg-yellow-500 text-stone-900 font-bold rounded-lg shadow-xl transform hover:scale-105 transition-all">
                    Começar Agora e Descobrir
                </Link>
                <Link to="/contato" className="px-8 py-4 bg-transparent border border-white/30 hover:bg-white/10 rounded-lg font-bold transition-all">
                    Falar com Suporte
                </Link>
            </div>
            <p className="mt-6 text-xs text-red-200 opacity-80 flex items-center justify-center gap-2">
                <Lock size={12}/> Pagamento Seguro • Acesso Imediato
            </p>
        </div>
    </section>
);
