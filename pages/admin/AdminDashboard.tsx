import React, { useState, useEffect } from 'react';
import { Users, Eye, Flame, ArrowUp, ArrowRight, BookOpen, MessageCircle, Crown, Loader2, Sparkles } from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    messages: 0,
    articles: 0,
    rituals: 0,
    vip: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 1. Fetch Collections for counts
        const msgSnap = await getDocs(collection(db, 'messages'));
        const artSnap = await getDocs(collection(db, 'articles'));
        const ritSnap = await getDocs(collection(db, 'rituals'));
        const vipSnap = await getDocs(collection(db, 'vip_content'));

        setStats({
          messages: msgSnap.size,
          articles: artSnap.size,
          rituals: ritSnap.size,
          vip: vipSnap.size
        });

        // 2. Fetch Recent Activity (Messages & Articles)
        const recentMsgs = await getDocs(query(collection(db, 'messages'), orderBy('createdAt', 'desc'), limit(3)));
        const recentArts = await getDocs(query(collection(db, 'articles'), limit(3))); // Assuming simple limit as articles might not have 'createdAt' on old data yet

        const activities = [
            ...recentMsgs.docs.map(d => ({
                id: d.id,
                type: 'message',
                label: 'Nova Mensagem',
                title: d.data().subject,
                user: d.data().name,
                time: d.data().createdAt?.toDate ? d.data().createdAt.toDate() : new Date(),
                color: 'text-green-400'
            })),
            ...recentArts.docs.map(d => ({
                id: d.id,
                type: 'article',
                label: 'Artigo Publicado',
                title: d.data().title,
                user: d.data().author,
                time: new Date(), // Using current date if field missing
                color: 'text-umbanda-gold'
            }))
        ].sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 5);

        setRecentActivity(activities);

      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
      return (
          <div className="flex items-center justify-center h-full min-h-[400px]">
              <Loader2 className="w-10 h-10 text-umbanda-gold animate-spin" />
          </div>
      )
  }

  // Calculate percentages for distribution bars based on TOTAL content, not arbitrary goal
  const totalContent = stats.articles + stats.rituals + stats.vip;
  const getPercent = (val: number) => totalContent === 0 ? 0 : (val / totalContent) * 100;

  return (
    <div className="animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-white">Saravá, Administrador</h1>
        <p className="text-stone-400 mt-1">Visão geral em tempo real do seu terreiro digital.</p>
      </div>

      {/* Stats Cards - Real Data */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard 
          title="Mensagens Recebidas" 
          value={stats.messages.toString()} 
          icon={<MessageCircle className="text-blue-400" />} 
          desc="Caixa de entrada"
        />
        <StatCard 
          title="Acervo de Conteúdo" 
          value={(stats.articles + stats.rituals).toString()} 
          icon={<BookOpen className="text-umbanda-gold" />} 
          desc="Artigos & Rituais"
        />
        <StatCard 
          title="Conteúdo VIP" 
          value={stats.vip.toString()} 
          icon={<Crown className="text-umbanda-redBright" />} 
          desc="Materiais exclusivos"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Content Distribution Chart */}
        <div className="lg:col-span-2 bg-stone-900 border border-stone-800 rounded-xl p-8 flex flex-col justify-center">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Sparkles size={20} className="text-umbanda-gold" /> Distribuição de Conteúdo
            </h3>
            
            <div className="space-y-6">
                <div>
                    <div className="flex justify-between text-sm mb-2 text-stone-400">
                        <span>Artigos Publicados</span>
                        <span className="text-white font-bold">{stats.articles} un.</span>
                    </div>
                    <div className="w-full bg-stone-950 rounded-full h-4 overflow-hidden border border-stone-800">
                        <div className="bg-gradient-to-r from-umbanda-gold to-yellow-600 h-full rounded-full transition-all duration-1000" style={{ width: `${getPercent(stats.articles)}%` }}></div>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between text-sm mb-2 text-stone-400">
                        <span>Rituais Cadastrados</span>
                        <span className="text-white font-bold">{stats.rituals} un.</span>
                    </div>
                    <div className="w-full bg-stone-950 rounded-full h-4 overflow-hidden border border-stone-800">
                        <div className="bg-gradient-to-r from-umbanda-red to-red-900 h-full rounded-full transition-all duration-1000" style={{ width: `${getPercent(stats.rituals)}%` }}></div>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between text-sm mb-2 text-stone-400">
                        <span>Materiais VIP</span>
                        <span className="text-white font-bold">{stats.vip} un.</span>
                    </div>
                    <div className="w-full bg-stone-950 rounded-full h-4 overflow-hidden border border-stone-800">
                        <div className="bg-purple-900 h-full rounded-full transition-all duration-1000" style={{ width: `${getPercent(stats.vip)}%` }}></div>
                    </div>
                </div>
            </div>
            
            <p className="mt-8 text-xs text-stone-500 text-center">
                * Proporção baseada no total de {totalContent} itens cadastrados.
            </p>
        </div>

        {/* Recent Activity List */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Atividade Recente</h3>
          <div className="space-y-6">
            {recentActivity.length === 0 ? (
                <div className="text-stone-500 text-center py-4 text-sm border border-stone-800 rounded border-dashed">
                    Nenhuma atividade recente registrada no banco de dados.
                </div>
            ) : (
                recentActivity.map((act, idx) => (
                    <ActivityItem 
                        key={idx}
                        action={act.label}
                        target={act.title}
                        time={act.time.toLocaleDateString('pt-BR')}
                        user={act.user}
                    />
                ))
            )}
            
            <button className="w-full mt-4 py-2 text-sm text-stone-400 hover:text-white border border-stone-800 hover:border-stone-600 rounded transition-colors flex items-center justify-center gap-2">
              Ver Tudo <ArrowRight size={14}/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; desc: string }> = ({ title, value, icon, desc }) => (
  <div className="bg-stone-900 border border-stone-800 p-6 rounded-xl hover:border-stone-700 transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-stone-950 rounded-lg border border-stone-800">
        {icon}
      </div>
    </div>
    <h3 className="text-stone-400 text-sm font-medium uppercase tracking-wide">{title}</h3>
    <div className="flex items-baseline gap-2 mt-1">
        <p className="text-3xl font-serif font-bold text-white">{value}</p>
        <span className="text-xs text-stone-600">{desc}</span>
    </div>
  </div>
);

const ActivityItem: React.FC<{ action: string; target: string; time: string; user: string }> = ({ action, target, time, user }) => (
  <div className="flex items-start border-l-2 border-stone-800 pl-4 relative">
    <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-umbanda-gold"></div>
    <div>
      <p className="text-stone-200 text-sm font-medium">{action}</p>
      <p className="text-umbanda-redBright text-xs font-bold truncate max-w-[200px]">{target}</p>
      <p className="text-stone-600 text-xs mt-1">{time} • por {user}</p>
    </div>
  </div>
);

export default AdminDashboard;