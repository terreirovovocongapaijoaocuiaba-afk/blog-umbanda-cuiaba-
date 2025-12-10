
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppNotification } from '../types';
import { db } from './firebase';
import { collection, query, orderBy, limit, onSnapshot, updateDoc, doc, writeBatch, where, getDocs } from 'firebase/firestore';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (n: Omit<AppNotification, 'id' | 'read' | 'timestamp'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // REAL-TIME LISTENER: Escuta a coleção 'notifications' do Firestore
  useEffect(() => {
    // Em um app real com Auth, filtraríamos por where('userId', '==', currentUser.uid)
    // Aqui, ouvimos as últimas 50 notificações globais para demonstração do sistema
    const q = query(
        collection(db, 'notifications'), 
        orderBy('timestamp', 'desc'), 
        limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AppNotification[];
      
      setNotifications(data);
      
      // Tocar som apenas se houver uma nova notificação não lida no topo criada nos últimos 2 segundos
      if (data.length > 0 && !data[0].read) {
          const now = Date.now();
          if (now - data[0].timestamp < 5000) { // 5 segundos de tolerância
              const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'); 
              audio.volume = 0.2;
              audio.play().catch(() => {});
          }
      }
    });

    return () => unsubscribe();
  }, []);

  // Função auxiliar para componentes que precisam adicionar (embora o AdminSimulator use firestore direto)
  // Mantida para compatibilidade interna se necessário
  const addNotification = async (n: Omit<AppNotification, 'id' | 'read' | 'timestamp'>) => {
      // Esta função agora é apenas um wrapper, a lógica real de inserção deve ser feita via Firestore
      // Se chamada localmente, não faz nada pois o listener cuidará da atualização
      console.warn("Use firestore addDoc directly instead of context addNotification for persistency");
  };

  const markAsRead = async (id: string) => {
    try {
        const notifRef = doc(db, 'notifications', id);
        await updateDoc(notifRef, { read: true });
    } catch (e) {
        console.error("Erro ao marcar como lida:", e);
    }
  };

  const markAllAsRead = async () => {
    try {
        const batch = writeBatch(db);
        notifications.forEach(n => {
            if (!n.read) {
                const ref = doc(db, 'notifications', n.id);
                batch.update(ref, { read: true });
            }
        });
        await batch.commit();
    } catch (e) {
        console.error("Erro ao marcar todas como lidas:", e);
    }
  };

  const clearAll = async () => {
    // Cuidado: Isso deletaria do banco real. 
    // Para UX, talvez apenas marcar como "arquivada", mas aqui vamos deletar para limpar o demo.
    try {
        const batch = writeBatch(db);
        notifications.forEach(n => {
            const ref = doc(db, 'notifications', n.id);
            batch.delete(ref);
        });
        await batch.commit();
    } catch (e) {
        console.error("Erro ao limpar notificações:", e);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
