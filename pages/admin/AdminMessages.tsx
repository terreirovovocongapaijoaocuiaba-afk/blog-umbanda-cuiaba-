import React, { useState, useEffect } from 'react';
import { Mail, Calendar, CheckCircle, Trash2, Archive, Reply, User, Phone, Loader2, Inbox } from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';

interface Message {
  id: string;
  name: string;
  email: string; // Adicionado caso exista no futuro, embora o form atual não colete email explicitamente no Contact.tsx, vamos assumir que pode vir ou adaptar
  phone: string;
  subject: string;
  message: string;
  createdAt: any;
  read: boolean;
}

const AdminMessages: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Escutar mudanças na coleção 'messages' em tempo real
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(msgs);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao buscar mensagens:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSelectMessage = async (msg: Message) => {
    setSelectedMessage(msg);
    if (!msg.read) {
      try {
        await updateDoc(doc(db, 'messages', msg.id), { read: true });
        // O snapshot vai atualizar o estado local automaticamente
      } catch (err) {
        console.error("Erro ao marcar como lida", err);
      }
    }
  };

  const handleDelete = async () => {
    if (!selectedMessage) return;
    if (window.confirm('Tem certeza que deseja excluir esta mensagem?')) {
      try {
        await deleteDoc(doc(db, 'messages', selectedMessage.id));
        setSelectedMessage(null);
      } catch (err) {
        console.error("Erro ao excluir", err);
      }
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    // Tratamento para Timestamp do Firestore ou Date normal
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <Loader2 className="w-10 h-10 text-umbanda-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white">Mensagens</h1>
          <p className="text-stone-400 mt-1">Contato direto com a assistência.</p>
        </div>
        <div className="text-stone-500 text-sm">
          {messages.length} mensagens no total
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Inbox List */}
        <div className="lg:col-span-1 bg-stone-900 border border-stone-800 rounded-xl overflow-hidden h-[calc(100vh-200px)] flex flex-col">
          <div className="p-4 border-b border-stone-800 bg-stone-950 sticky top-0">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Mail size={16} /> Caixa de Entrada
            </h3>
          </div>
          <div className="divide-y divide-stone-800 overflow-y-auto flex-1">
            {messages.length === 0 ? (
              <div className="p-8 text-center text-stone-500 flex flex-col items-center">
                <Inbox size={32} className="mb-2 opacity-50" />
                <p>Nenhuma mensagem.</p>
              </div>
            ) : (
              messages.map(msg => (
                <div 
                  key={msg.id} 
                  onClick={() => handleSelectMessage(msg)}
                  className={`p-4 cursor-pointer hover:bg-stone-800 transition-colors ${selectedMessage?.id === msg.id ? 'bg-stone-800 border-l-2 border-umbanda-gold' : ''} ${!msg.read && selectedMessage?.id !== msg.id ? 'bg-stone-800/30 border-l-2 border-umbanda-red' : ''}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-sm font-bold truncate pr-2 ${!msg.read ? 'text-white' : 'text-stone-400'}`}>{msg.name}</span>
                    <span className="text-[10px] text-stone-600 whitespace-nowrap">{formatDate(msg.createdAt)}</span>
                  </div>
                  <p className={`text-xs mb-1 font-medium truncate ${selectedMessage?.id === msg.id ? 'text-umbanda-gold' : 'text-stone-300'}`}>{msg.subject}</p>
                  <p className="text-xs text-stone-500 line-clamp-2">{msg.message}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Message Detail View */}
        <div className="lg:col-span-2 bg-stone-900 border border-stone-800 rounded-xl overflow-hidden h-[calc(100vh-200px)] flex flex-col relative">
          {selectedMessage ? (
            <>
              {/* Header */}
              <div className="p-6 border-b border-stone-800 bg-stone-950 flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-serif font-bold text-white mb-2">{selectedMessage.subject}</h2>
                  <div className="flex items-center space-x-4 text-sm text-stone-400">
                    <span className="flex items-center gap-1"><User size={14}/> {selectedMessage.name}</span>
                    <span className="flex items-center gap-1"><Calendar size={14}/> {formatDate(selectedMessage.createdAt)}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={handleDelete}
                    className="p-2 text-stone-400 hover:text-red-500 bg-stone-900 rounded border border-stone-800 hover:border-red-900 transition-colors" 
                    title="Excluir"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Contact Info Bar */}
              <div className="bg-stone-900/50 p-4 border-b border-stone-800 flex flex-wrap gap-4 text-xs font-bold uppercase tracking-wider text-stone-500">
                <div className="flex items-center gap-2">
                   <Phone size={14} className="text-umbanda-gold" /> {selectedMessage.phone}
                </div>
                {/* Caso adicione email no form futuro */}
                {selectedMessage.email && (
                  <div className="flex items-center gap-2">
                     <Mail size={14} className="text-umbanda-gold" /> {selectedMessage.email}
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-8 overflow-y-auto flex-1 text-stone-300 leading-relaxed text-lg whitespace-pre-wrap">
                {selectedMessage.message}
              </div>

              {/* Action Footer */}
              <div className="p-6 border-t border-stone-800 bg-stone-950 flex gap-4">
                <a 
                  href={`https://wa.me/55${selectedMessage.phone.replace(/\D/g, '')}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-6 rounded flex items-center gap-2 transition-colors"
                >
                  <Phone size={18} />
                  Responder no WhatsApp
                </a>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-20 h-20 bg-stone-800 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <Mail className="text-stone-600 w-10 h-10" />
              </div>
              <h3 className="text-2xl text-stone-300 font-serif mb-2">Nenhuma mensagem selecionada</h3>
              <p className="text-stone-500 max-w-sm">
                Selecione um contato na lista à esquerda para ler o conteúdo completo e gerenciar o atendimento.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMessages;