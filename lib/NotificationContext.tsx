
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppNotification } from '../types';
import { db } from './firebase';
import { collection, query, orderBy, limit, onSnapshot, updateDoc, doc, writeBatch, where } from 'firebase/firestore';
import { getDeviceId } from './usageUtils';

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

  // REAL-TIME LISTENER SEGMENTADO
  useEffect(() => {
    const deviceId = getDeviceId();
    
    // Consulta Filtra: Notificações Globais OU Notificações para este Device ID
    const q = query(
        collection(db, 'notifications'), 
        where('targetId', 'in', ['global', deviceId]),
        // Nota: Firestore requer um índice composto para usar 'in' + 'orderBy'.
        // Para evitar erros em modo de dev sem acesso ao console do firebase para criar índices,
        // vamos ordenar no cliente (javascript) após receber os dados.
        limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AppNotification[];
      
      // Ordenação no Cliente (descendente por data)
      data.sort((a, b) => b.timestamp - a.timestamp);

      setNotifications(data);
      
      // Tocar som apenas se houver uma nova notificação não lida RECENTE (últimos 5s)
      if (data.length > 0 && !data[0].read) {
          const now = Date.now();
          if (now - data[0].timestamp < 5000) {
              const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'); 
              audio.volume = 0.2;
              audio.play().catch(() => {});
          }
      }
    });

    return () => unsubscribe();
  }, []);

  // Função auxiliar wrapper (não usada diretamente para persistência real, mas mantida para compatibilidade)
  const addNotification = async (n: Omit<AppNotification, 'id' | 'read' | 'timestamp'>) => {
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
    // Cuidado: Isso deleta do banco real.
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
