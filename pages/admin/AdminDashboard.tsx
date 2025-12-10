
import React, { useState, useEffect } from 'react';
import { DollarSign, Users, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight, Crown, CreditCard, Activity } from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
      totalSales: 0,
      mrr: 0,
      activeSubs: 0,
      churnRate: 2.4,
      ticketAverage: 0,
      todaySales: 0
  });
  const [recentSales, setRecentSales] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
        try {
            // Simulation of fetching financial data from Firestore 'transactions' collection
            const salesSnap = await getDocs(query(collection(db, 'transactions'), orderBy('created_at', 'desc'), limit(10)));
            const allSalesSnap = await getDocs(collection(db, 'transactions'));
            const subsSnap = await getDocs(collection(db, 'subscriptions'));

            const total = allSalesSnap.docs.reduce((acc, curr) => acc + (curr.data().amount || 0), 0);
            const activeCount = subsSnap.docs.filter(d => d.data().status === 'active').length;
            
            // Calculo MRR (Simulado: Assinantes * Preço Médio R$29,90)
            const simulatedMRR = activeCount * 29.90;

            setMetrics({
                totalSales: total,
                mrr: simulatedMRR,
                activeSubs: activeCount,
                churnRate: 2.4, // Hardcoded simulation for demo
                ticketAverage: total / (allSalesSnap.size || 1),
                todaySales: 4 // Mock
            });

            setRecentSales(salesSnap.docs.map(d => ({id: d.id, ...d.data()})));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-stone-500">Carregando inteligência...</div>;

  return (
    <div className="animate-fadeIn space-y-8">
      
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
           <h1 className="text-3xl font-serif font-bold text-stone-900 dark:text-white">Painel Executivo</h1>
           <p className="text-stone-500">Visão financeira e saúde do ecossistema.</p>
        </div>
        <div className="flex gap-2">
            <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded text-xs font-bold border border-green-200 dark:border-green-800 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> API Kiwify Conectada
            </span>
        </div>
      </div>

      {/* --- MRR & MAIN KPI --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <KPICard 
             title="Receita Mensal (MRR)" 
             value={`R$ ${metrics.mrr.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`}
             trend="+12% vs mês anterior"
             trendUp={true}
             icon={<DollarSign className="text-green-500"/>}
          />
          <KPICard 
             title="Assinantes Ativos" 
             value={metrics.activeSubs.toString()}
             trend="+5 hoje"
             trendUp={true}
             icon={<Crown className="text-purple-500"/>}
          />
          <KPICard 
             title="Ticket Médio" 
             value={`R$ ${metrics.ticketAverage.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`}
             trend="Estável"
             trendUp={true}
             icon={<CreditCard className="text-blue-500"/>}
          />
          <KPICard 
             title="Churn Rate (Cancelamento)" 
             value={`${metrics.churnRate}%`}
             trend="-0.5% (Melhorou)"
             trendUp={true} // Good because it went down
             icon={<Activity className="text-orange-500"/>}
          />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* SALES CHART AREA */}
          <div className="lg:col-span-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-stone-900 dark:text-white">Fluxo de Caixa (30 dias)</h3>
                  <select className="bg-stone-100 dark:bg-stone-800 border-none rounded text-xs p-1">
                      <option>Últimos 30 dias</option>
                      <option>Este Ano</option>
                  </select>
              </div>
              <div className="h-64 w-full relative flex items-end justify-between px-2 gap-2">
                   {/* Simulated Bars */}
                   {[40, 60, 45, 80, 55, 70, 90, 65, 85, 100, 75, 95].map((h, i) => (
                       <div key={i} className="w-full bg-umbanda-gold/20 hover:bg-umbanda-gold/40 rounded-t transition-all relative group" style={{height: `${h}%`}}>
                           <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                               R$ {(h * 150).toFixed(0)}
                           </div>
                       </div>
                   ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-stone-500 uppercase font-bold">
                  <span>Semana 1</span><span>Semana 2</span><span>Semana 3</span><span>Semana 4</span>
              </div>
          </div>

          {/* SMART INSIGHTS */}
          <div className="space-y-6">
              <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-xl p-6 text-white border border-indigo-700 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-20"><Activity size={64}/></div>
                  <h3 className="font-bold text-lg mb-2 relative z-10">Diagnóstico Inteligente</h3>
                  <ul className="space-y-3 relative z-10 text-sm">
                      <li className="flex gap-2 items-start">
                          <ArrowUpRight className="text-green-400 flex-shrink-0" size={16}/>
                          <span>Conversão da página <strong>Oráculo</strong> subiu 15% após mudança de CTA.</span>
                      </li>
                      <li className="flex gap-2 items-start">
                          <AlertTriangle className="text-yellow-400 flex-shrink-0" size={16}/>
                          <span><strong>12 usuários</strong> tentaram acessar "Banho de Ervas" hoje e pararam no checkout. Sugestão: Enviar cupom.</span>
                      </li>
                      <li className="flex gap-2 items-start">
                          <Users className="text-blue-400 flex-shrink-0" size={16}/>
                          <span>Horário de pico detectado: <strong>19h às 21h</strong>. Ideal para lançar ofertas.</span>
                      </li>
                  </ul>
              </div>

              {/* RECENT SALES */}
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6">
                  <h3 className="font-bold text-stone-900 dark:text-white mb-4">Últimas Transações</h3>
                  <div className="space-y-4">
                      {recentSales.length === 0 ? <p className="text-xs text-stone-500">Nenhuma venda registrada.</p> : recentSales.map((sale) => (
                          <div key={sale.id} className="flex justify-between items-center border-b border-stone-100 dark:border-stone-800 pb-2 last:border-0 last:pb-0">
                              <div>
                                  <p className="font-bold text-stone-800 dark:text-stone-200 text-sm">{sale.customer_name}</p>
                                  <p className="text-xs text-stone-500">{sale.product_name}</p>
                              </div>
                              <div className="text-right">
                                  <p className="font-bold text-green-600 text-sm">+ R$ {sale.amount}</p>
                                  <p className="text-[10px] text-stone-400 uppercase">{sale.payment_method}</p>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>

      </div>
    </div>
  );
};

const KPICard = ({ title, value, trend, trendUp, icon }: any) => (
  <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 rounded-xl relative overflow-hidden group hover:border-stone-300 dark:hover:border-stone-700 transition-all shadow-sm">
      <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-stone-100 dark:bg-stone-950 rounded-lg group-hover:scale-110 transition-transform">
              {icon}
          </div>
          <div className={`flex items-center text-xs font-bold ${trendUp ? 'text-green-500 bg-green-50 dark:bg-green-900/20' : 'text-red-500 bg-red-50 dark:bg-red-900/20'} px-2 py-1 rounded-full`}>
              {trendUp ? <ArrowUpRight size={12} className="mr-1"/> : <ArrowDownRight size={12} className="mr-1"/>}
              {trend}
          </div>
      </div>
      <h3 className="text-stone-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</h3>
      <p className="text-2xl font-bold text-stone-900 dark:text-white font-serif">{value}</p>
  </div>
);

export default AdminDashboard;
