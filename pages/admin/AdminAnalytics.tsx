
import React from 'react';
import { Activity, MousePointer, Eye, ShoppingCart, UserCheck } from 'lucide-react';

const AdminAnalytics: React.FC = () => {
  return (
    <div className="animate-fadeIn space-y-8">
      <header>
           <h1 className="text-3xl font-serif font-bold text-stone-900 dark:text-white">Analytics de Conversão</h1>
           <p className="text-stone-500">Entenda onde você ganha e perde clientes.</p>
      </header>

      {/* Funnel */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-8">
          <h3 className="font-bold text-lg mb-8 text-stone-900 dark:text-white">Funil de Vendas (Últimos 30 dias)</h3>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative">
              <FunnelStep icon={<Eye/>} label="Visitantes" count="12.504" color="bg-blue-500" percent="100%" />
              <Arrow />
              <FunnelStep icon={<MousePointer/>} label="Interessados (CTAs)" count="3.102" color="bg-purple-500" percent="24.8%" />
              <Arrow />
              <FunnelStep icon={<ShoppingCart/>} label="Checkout Iniciado" count="840" color="bg-yellow-500" percent="6.7%" />
              <Arrow />
              <FunnelStep icon={<UserCheck/>} label="Compradores" count="124" color="bg-green-500" percent="0.9%" />
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Heatmap Simulation */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6">
              <h3 className="font-bold mb-4 text-stone-900 dark:text-white">Páginas que Mais Vendem</h3>
              <div className="space-y-4">
                  <RankingItem label="/oraculo" percent={45} sales="56 vendas" />
                  <RankingItem label="/servicos/banhos" percent={25} sales="31 vendas" />
                  <RankingItem label="/vip" percent={15} sales="18 vendas" />
                  <RankingItem label="/servicos/sonhos" percent={10} sales="12 vendas" />
                  <RankingItem label="Outros" percent={5} sales="7 vendas" />
              </div>
          </div>

          {/* Behavior Insights */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6">
              <h3 className="font-bold mb-4 text-stone-900 dark:text-white">Comportamento do Usuário</h3>
              <div className="space-y-6">
                  <Insight 
                     title="Horário de Ouro" 
                     value="19:00 - 22:00" 
                     desc="Maior taxa de conversão em compras." 
                     color="text-yellow-500"
                  />
                  <Insight 
                     title="Origem Principal" 
                     value="Instagram (Bio)" 
                     desc="60% do tráfego pagante vem daqui." 
                     color="text-purple-500"
                  />
                  <Insight 
                     title="Recurso Mais Testado" 
                     value="Carta do Dia (Grátis)" 
                     desc="80% dos usuários testam antes de comprar." 
                     color="text-blue-500"
                  />
              </div>
          </div>
      </div>

    </div>
  );
};

const FunnelStep = ({icon, label, count, color, percent}: any) => (
    <div className="flex flex-col items-center text-center w-full relative z-10">
        <div className={`w-16 h-16 rounded-2xl ${color} text-white flex items-center justify-center mb-4 shadow-lg`}>
            {icon}
        </div>
        <h4 className="font-bold text-stone-900 dark:text-white text-lg">{count}</h4>
        <p className="text-xs text-stone-500 uppercase font-bold tracking-wide mb-1">{label}</p>
        <span className="text-xs bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded text-stone-600 dark:text-stone-300">{percent}</span>
    </div>
);

const Arrow = () => (
    <div className="hidden md:block w-full h-1 bg-stone-100 dark:bg-stone-800 rounded relative">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-stone-300 dark:bg-stone-700 rounded-full"></div>
    </div>
);

const RankingItem = ({label, percent, sales}: any) => (
    <div>
        <div className="flex justify-between text-sm mb-1">
            <span className="font-bold text-stone-700 dark:text-stone-300">{label}</span>
            <span className="text-stone-500 text-xs">{sales}</span>
        </div>
        <div className="h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
            <div className="h-full bg-umbanda-gold rounded-full" style={{width: `${percent}%`}}></div>
        </div>
    </div>
);

const Insight = ({title, value, desc, color}: any) => (
    <div className="flex items-start gap-4">
        <div className={`mt-1 ${color}`}><Activity size={20}/></div>
        <div>
            <h5 className="font-bold text-stone-500 text-xs uppercase">{title}</h5>
            <p className="font-serif font-bold text-xl text-stone-900 dark:text-white">{value}</p>
            <p className="text-stone-400 text-sm">{desc}</p>
        </div>
    </div>
);

export default AdminAnalytics;
