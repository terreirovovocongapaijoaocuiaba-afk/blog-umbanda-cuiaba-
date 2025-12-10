
import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { Transaction } from '../../types';
import { Search, Filter, Download, ArrowUpRight, CheckCircle, XCircle, Clock } from 'lucide-react';

const AdminSales: React.FC = () => {
  const [sales, setSales] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const q = query(collection(db, 'transactions'), orderBy('created_at', 'desc'));
        const snap = await getDocs(q);
        setSales(snap.docs.map(d => ({id: d.id, ...d.data()} as Transaction)));
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchSales();
  }, []);

  const filteredSales = filter === 'all' ? sales : sales.filter(s => s.status === filter);

  return (
    <div className="animate-fadeIn space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-end">
        <div>
           <h1 className="text-3xl font-serif font-bold text-stone-900 dark:text-white">Gestão de Vendas</h1>
           <p className="text-stone-500">Histórico completo de transações da Kiwify.</p>
        </div>
        <div className="flex gap-2">
            <button className="bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-900 dark:text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm">
                <Download size={16}/> Exportar CSV
            </button>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2">
              {['all', 'paid', 'pending', 'refused', 'refunded'].map(f => (
                  <button 
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase transition-colors ${filter === f ? 'bg-stone-900 dark:bg-white text-white dark:text-black' : 'bg-stone-100 dark:bg-stone-800 text-stone-500'}`}
                  >
                      {f === 'all' ? 'Todas' : f === 'paid' ? 'Aprovadas' : f === 'pending' ? 'Pendentes' : f === 'refused' ? 'Recusadas' : 'Reembolsos'}
                  </button>
              ))}
          </div>
          <div className="relative">
              <Search className="absolute left-3 top-2.5 text-stone-400" size={16}/>
              <input placeholder="Buscar por email ou nome..." className="pl-9 pr-4 py-2 bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg text-sm w-64 focus:outline-none focus:border-umbanda-gold"/>
          </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden">
          <table className="w-full text-left">
              <thead className="bg-stone-50 dark:bg-stone-950 text-stone-500 text-xs uppercase font-bold border-b border-stone-200 dark:border-stone-800">
                  <tr>
                      <th className="p-4">Status</th>
                      <th className="p-4">Cliente</th>
                      <th className="p-4">Produto</th>
                      <th className="p-4">Data</th>
                      <th className="p-4 text-right">Valor</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-sm">
                  {loading ? (
                      <tr><td colSpan={5} className="p-8 text-center text-stone-500">Carregando...</td></tr>
                  ) : filteredSales.length === 0 ? (
                      <tr><td colSpan={5} className="p-8 text-center text-stone-500">Nenhuma venda encontrada.</td></tr>
                  ) : (
                      filteredSales.map(s => (
                          <tr key={s.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                              <td className="p-4">
                                  <StatusBadge status={s.status}/>
                              </td>
                              <td className="p-4">
                                  <div className="font-bold text-stone-900 dark:text-white">{s.customer_name}</div>
                                  <div className="text-xs text-stone-500">{s.customer_email}</div>
                              </td>
                              <td className="p-4 text-stone-600 dark:text-stone-300">
                                  {s.product_name}
                                  {s.payment_method === 'pix' && <span className="ml-2 text-[10px] bg-green-100 text-green-700 px-1 rounded">PIX</span>}
                              </td>
                              <td className="p-4 text-stone-500">
                                  {s.created_at?.toDate ? s.created_at.toDate().toLocaleDateString() : 'Hoje'}
                              </td>
                              <td className="p-4 text-right font-mono font-bold text-stone-900 dark:text-white">
                                  R$ {s.amount.toFixed(2)}
                              </td>
                          </tr>
                      ))
                  )}
              </tbody>
          </table>
      </div>
    </div>
  );
};

const StatusBadge = ({status}: {status: string}) => {
    const config: any = {
        paid: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: <CheckCircle size={14}/>, label: 'Aprovada' },
        pending: { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: <Clock size={14}/>, label: 'Pendente' },
        refused: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: <XCircle size={14}/>, label: 'Recusada' },
        refunded: { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: <ArrowUpRight size={14}/>, label: 'Reembolso' },
    };
    const c = config[status] || config.pending;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase ${c.color}`}>
            {c.icon} {c.label}
        </span>
    );
};

export default AdminSales;
