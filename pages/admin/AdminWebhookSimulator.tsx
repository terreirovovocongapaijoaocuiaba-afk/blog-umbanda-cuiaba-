
import React, { useState } from 'react';
import { Zap, CheckCircle, AlertTriangle, RefreshCw, DollarSign } from 'lucide-react';
import { db } from '../../lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { setPremiumStatus } from '../../lib/usageUtils';

const AdminWebhookSimulator: React.FC = () => {
  const [log, setLog] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addLog = (msg: string) => setLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);

  const simulateSale = async (status: 'paid' | 'refused') => {
      setLoading(true);
      addLog(`Iniciando simulação REAL: ${status.toUpperCase()}...`);
      
      try {
          // 1. Gravar Transação Real no Firestore
          const transactionData = {
              order_id: `kwf_${Math.floor(Math.random() * 100000)}`,
              product_name: "Acesso Clube VIP (Mensal)",
              customer_email: "cliente_teste@exemplo.com",
              customer_name: "Maria Teste",
              amount: 29.90,
              status: status,
              payment_method: 'credit_card',
              created_at: serverTimestamp(),
              utm_source: 'simulador_admin_real'
          };
          
          await addDoc(collection(db, 'transactions'), transactionData);
          addLog(`Transação gravada no DB.`);

          // 2. Lógica de Negócio (Backend Trigger)
          if (status === 'paid') {
             // Atualizar Assinatura
             await addDoc(collection(db, 'subscriptions'), {
                 user_email: "cliente_teste@exemplo.com",
                 plan: "monthly",
                 status: "active",
                 start_date: serverTimestamp(),
                 kiwify_subscription_id: `sub_${Math.floor(Math.random() * 10000)}`
             });
             addLog("Assinatura criada no DB.");

             setPremiumStatus(true); // Local helper para UX imediata

             // DISPARO DE NOTIFICAÇÃO REAL (Persistida)
             // O NotificationContext vai ler isso via onSnapshot
             await addDoc(collection(db, 'notifications'), {
                 type: 'payment',
                 title: 'Pagamento Aprovado!',
                 message: 'Seu acesso VIP foi liberado. Saravá! Toque para acessar seus benefícios exclusivos.',
                 actionLink: '/vip',
                 actionLabel: 'Acessar Área VIP',
                 priority: 'high',
                 read: false,
                 timestamp: Date.now(),
                 category: 'conversion' // Tag para analytics
             });
             addLog("Notificação de Sucesso gravada no Firestore.");
             
             alert("Venda Processada! Verifique o sino de notificações.");
          } else {
             addLog("Pagamento RECUSADO. Gravando notificação de recuperação...");
             
             // DISPARO DE NOTIFICAÇÃO DE FALHA REAL
             await addDoc(collection(db, 'notifications'), {
                type: 'system',
                title: 'Falha no Pagamento',
                message: 'Não conseguimos processar seu cartão. Verifique seus dados ou tente via PIX para liberação imediata.',
                actionLink: '/vip',
                actionLabel: 'Tentar Novamente',
                priority: 'high',
                read: false,
                timestamp: Date.now(),
                category: 'churn_prevention'
            });
          }

      } catch (e) {
          addLog(`ERRO CRÍTICO: ${e}`);
          console.error(e);
      } finally {
          setLoading(false);
      }
  };

  const triggerEngagementPush = async () => {
      setLoading(true);
      addLog("Disparando Push de Engajamento...");
      try {
          await addDoc(collection(db, 'notifications'), {
              type: 'insight',
              title: 'Orixá do Dia',
              message: 'A energia de Oxóssi está forte hoje. Que tal buscar prosperidade?',
              actionLink: '/servicos/orixa',
              actionLabel: 'Ver Previsão',
              priority: 'normal',
              read: false,
              timestamp: Date.now(),
              category: 'engagement'
          });
          addLog("Push enviado para a base.");
      } catch (e) {
          addLog(`Erro: ${e}`);
      } finally {
          setLoading(false);
      }
  };

  const resetSystem = () => {
      setPremiumStatus(false);
      addLog("Status local resetado para FREE.");
      
      // Enviar notificação real de reset
      addDoc(collection(db, 'notifications'), {
          type: 'system',
          title: 'Status Resetado',
          message: 'Você voltou para o plano Gratuito.',
          priority: 'low',
          read: false,
          timestamp: Date.now(),
          category: 'system'
      });
  };

  return (
    <div className="animate-fadeIn space-y-8">
      <header>
           <h1 className="text-3xl font-serif font-bold text-stone-900 dark:text-white flex items-center gap-3">
               <Zap className="text-yellow-500" fill="currentColor"/> Simulador Real (Firestore)
           </h1>
           <p className="text-stone-500">
               Todas as ações abaixo gravam dados reais no banco de dados, acionando os listeners do cliente instantaneamente.
           </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Controls */}
          <div className="space-y-6">
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6">
                  <h3 className="font-bold text-stone-900 dark:text-white mb-4">Eventos Financeiros (Kiwify)</h3>
                  
                  <div className="space-y-3">
                      <button 
                         onClick={() => simulateSale('paid')}
                         disabled={loading}
                         className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg flex items-center justify-center gap-2 shadow-lg"
                      >
                          {loading ? <RefreshCw className="animate-spin"/> : <DollarSign/>} Webhook: Venda Aprovada
                      </button>

                      <button 
                         onClick={() => simulateSale('refused')}
                         disabled={loading}
                         className="w-full py-3 bg-red-600/10 hover:bg-red-600/20 text-red-600 border border-red-600/30 font-bold rounded-lg flex items-center justify-center gap-2"
                      >
                          <AlertTriangle size={18}/> Webhook: Pagamento Recusado
                      </button>
                  </div>
              </div>

              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6">
                  <h3 className="font-bold text-stone-900 dark:text-white mb-4">Eventos de Engajamento</h3>
                  <button 
                      onClick={triggerEngagementPush}
                      className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg mb-3"
                  >
                      Disparar Push de Conteúdo
                  </button>
                  <button 
                      onClick={resetSystem}
                      className="w-full py-3 bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold rounded-lg hover:bg-stone-300 dark:hover:bg-stone-700"
                  >
                      Resetar Status para FREE
                  </button>
              </div>
          </div>

          {/* Console Log */}
          <div className="bg-black text-green-400 font-mono text-xs p-6 rounded-xl border border-stone-800 h-[400px] overflow-y-auto shadow-inner">
              <div className="mb-2 border-b border-green-900 pb-2 font-bold uppercase tracking-widest text-green-600">Logs do Servidor</div>
              {log.length === 0 && <span className="opacity-50">Aguardando eventos...</span>}
              {log.map((l, i) => (
                  <div key={i} className="mb-1">{l}</div>
              ))}
          </div>

      </div>
    </div>
  );
};

export default AdminWebhookSimulator;
