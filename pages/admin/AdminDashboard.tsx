import React, { useState, useEffect } from 'react';
import { Users, BookOpen, MessageCircle, Crown, Loader2, TrendingUp, DollarSign, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    messages: 0,
    articles: 0,
    vipMembers: 124, // Simulado para SaaS demo
    monthlyRevenue: 3707.60 // Simulado: 124 * 29.90
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const msgSnap = await getDocs(collection(db, 'messages'));
        const artSnap = await getDocs(collection(db, 'articles'));
        const ritSnap = await getDocs(collection(db, 'rituals'));
        const vipSnap = await getDocs(collection(db, 'vip_content'));

        setStats(prev => ({
          ...prev,
          messages: msgSnap.size,
          articles: artSnap.size + ritSnap.size + vipSnap.size,
        }));

        // Activity Feed
        const recentMsgs = await getDocs(query(collection(db, 'messages'), orderBy('createdAt', 'desc'), limit(5)));
        
        const activities = recentMsgs.docs.map(d => ({
            id: d.id,
            label: 'Nova Mensagem',
            title: d.data().subject,
            user: d.data().name,
            time: d.data().createdAt?.toDate ? d.data().createdAt.toDate() : new Date(),
            type: 'msg'
        }));

        setRecentActivity(activities);

      } catch (error) {
        console.error("Erro dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className="flex justify-center h-96 items-center"><Loader2 className="animate-spin text-umbanda-gold"/></div>;

  return (
    <div className="animate-fadeIn space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white">Dashboard do Templo</h1>
          <p className="text-stone-400 mt-1">Métricas de crescimento e saúde do negócio.</p>
        </div>
        <div className="flex gap-2">
            <span className="bg-green-900/30 text-green-400 border border-green-800 px-3 py-1 rounded text-xs font-bold flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> Sistema Operacional
            </span>
        </div>
      </div>

      {/* KPI Cards (SaaS Style) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPICard 
          title="Receita Mensal (MRR)" 
          value={`R$ ${stats.monthlyRevenue.toLocaleString('pt-BR')}`} 
          trend="+12%" 
          trendUp={true} 
          icon={<DollarSign className="text-green-400"/>} 
        />
        <KPICard 
          title="Membros VIP Ativos" 
          value={stats.vipMembers.toString()} 
          trend="+5 novos" 
          trendUp={true} 
          icon={<Crown className="text-purple-400"/>} 
        />
        <KPICard 
          title="Conteúdos Totais" 
          value={stats.articles.toString()} 
          trend="+3 essa semana" 
          trendUp={true} 
          icon={<BookOpen className="text-umbanda-gold"/>} 
        />
        <KPICard 
          title="Mensagens / Leads" 
          value={stats.messages.toString()} 
          trend="-2% vs ontem" 
          trendUp={false} 
          icon={<MessageCircle className="text-blue-400"/>} 
        />
      </div>

      {/* Charts Section (Custom SVG for Performance) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-stone-900 border border-stone-800 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-white">Crescimento de Assinantes</h3>
                    <p className="text-xs text-stone-500">Últimos 6 meses</p>
                  </div>
                  <button className="text-xs bg-stone-800 hover:bg-stone-700 text-white px-3 py-1 rounded">Ver Relatório</button>
              </div>
              
              {/* Mock Chart SVG */}
              <div className="h-64 w-full relative">
                  <svg viewBox="0 0 100 40" className="w-full h-full drop-shadow-xl" preserveAspectRatio="none">
                      {/* Grid Lines */}
                      <line x1="0" y1="30" x2="100" y2="30" stroke="#333" strokeWidth="0.1" />
                      <line x1="0" y1="20" x2="100" y2="20" stroke="#333" strokeWidth="0.1" />
                      <line x1="0" y1="10" x2="100" y2="10" stroke="#333" strokeWidth="0.1" />
                      
                      {/* Path Gradient Definition */}
                      <defs>
                        <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#d97706" stopOpacity="0.5" />
                          <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      
                      {/* Area */}
                      <path d="M0,35 Q10,32 20,28 T40,25 T60,15 T80,10 T100,5 V40 H0 Z" fill="url(#gradient)" />
                      {/* Line */}
                      <path d="M0,35 Q10,32 20,28 T40,25 T60,15 T80,10 T100,5" fill="none" stroke="#d97706" strokeWidth="0.8" />
                      
                      {/* Points */}
                      <circle cx="0" cy="35" r="0.8" fill="white" />
                      <circle cx="20" cy="28" r="0.8" fill="white" />
                      <circle cx="40" cy="25" r="0.8" fill="white" />
                      <circle cx="60" cy="15" r="0.8" fill="white" />
                      <circle cx="80" cy="10" r="0.8" fill="white" />
                      <circle cx="100" cy="5" r="0.8" fill="white" />
                  </svg>
                  <div className="flex justify-between text-xs text-stone-500 mt-2 px-2">
                      <span>Jan</span><span>Fev</span><span>Mar</span><span>Abr</span><span>Mai</span><span>Jun</span>
                  </div>
              </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 flex flex-col">
              <h3 className="text-lg font-bold text-white mb-4">Atividade Recente</h3>
              <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pr-2">
                  {recentActivity.length === 0 ? (
                      <p className="text-stone-500 text-sm">Sem atividades recentes.</p>
                  ) : (
                      recentActivity.map((act, i) => (
                          <div key={i} className="flex gap-3 items-start relative pb-6 border-l border-stone-800 last:pb-0 last:border-0">
                              <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-stone-700 border-2 border-stone-900"></div>
                              <div className="mt-[-4px]">
                                  <p className="text-xs text-stone-500 mb-0.5">{act.time.toLocaleDateString('pt-BR')}</p>
                                  <p className="text-white text-sm font-medium">{act.label}</p>
                                  <p className="text-stone-400 text-xs mt-1">"{act.title}" por <span className="text-umbanda-gold">{act.user}</span></p>
                              </div>
                          </div>
                      ))
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};

const KPICard = ({ title, value, trend, trendUp, icon }: any) => (
  <div className="bg-stone-900 border border-stone-800 p-6 rounded-xl relative overflow-hidden group hover:border-stone-700 transition-all">
      <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-stone-950 rounded-lg border border-stone-800 group-hover:scale-110 transition-transform">
              {icon}
          </div>
          <div className={`flex items-center text-xs font-bold ${trendUp ? 'text-green-500' : 'text-red-500'} bg-stone-950 px-2 py-1 rounded-full`}>
              {trendUp ? <ArrowUpRight size={12} className="mr-1"/> : <ArrowDownRight size={12} className="mr-1"/>}
              {trend}
          </div>
      </div>
      <h3 className="text-stone-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</h3>
      <p className="text-2xl font-bold text-white font-serif">{value}</p>
  </div>
);

export default AdminDashboard;