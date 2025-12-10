
import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertTriangle, Zap, DollarSign, ExternalLink, Trash2 } from 'lucide-react';
import { useNotification } from '../lib/NotificationContext';
import { Link } from 'react-router-dom';

export const NotificationBell: React.FC = () => {
  const { unreadCount, markAllAsRead, notifications, clearAll, markAsRead } = useNotification();
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => {
    if (!isOpen && unreadCount > 0) {
        // Optional: mark all as read immediately or wait for user interaction
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <button 
        onClick={toggle}
        className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors relative"
      >
        <Bell size={20} className="text-umbanda-gold" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white dark:border-stone-900 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
            <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-fadeIn">
                <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex justify-between items-center bg-stone-50 dark:bg-stone-950">
                    <h3 className="font-bold text-stone-900 dark:text-white text-sm">Notificações</h3>
                    <div className="flex gap-2">
                        <button onClick={markAllAsRead} className="text-xs text-umbanda-gold hover:underline font-bold">Lidas</button>
                        <button onClick={clearAll} className="text-stone-400 hover:text-red-500"><Trash2 size={14}/></button>
                    </div>
                </div>
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-stone-500 text-sm">
                            <Bell className="mx-auto mb-2 opacity-30" size={32}/>
                            Nenhuma notificação nova.
                        </div>
                    ) : (
                        notifications.map(n => (
                            <div 
                                key={n.id} 
                                onClick={() => markAsRead(n.id)}
                                className={`p-4 border-b border-stone-100 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors cursor-pointer relative ${!n.read ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''}`}
                            >
                                {!n.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-umbanda-gold"></div>}
                                <div className="flex gap-3">
                                    <div className="mt-1 flex-shrink-0">
                                        <NotificationIcon type={n.type} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className={`text-sm ${!n.read ? 'font-bold text-stone-900 dark:text-white' : 'font-medium text-stone-600 dark:text-stone-400'}`}>
                                                {n.title}
                                            </h4>
                                            <span className="text-[10px] text-stone-400">{timeAgo(n.timestamp)}</span>
                                        </div>
                                        <p className="text-xs text-stone-500 dark:text-stone-400 mb-2 leading-relaxed">
                                            {n.message}
                                        </p>
                                        {n.actionLink && (
                                            <Link 
                                                to={n.actionLink} 
                                                onClick={() => setIsOpen(false)}
                                                className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-umbanda-gold hover:underline"
                                            >
                                                {n.actionLabel || 'Ver agora'} <ExternalLink size={10}/>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
      )}
    </div>
  );
};

export const NotificationToaster: React.FC = () => {
    const { notifications, markAsRead } = useNotification();
    const [visibleToasts, setVisibleToasts] = useState<any[]>([]);

    useEffect(() => {
        // Show only the latest unread notification as a toast if it's new (less than 5 seconds old)
        const latest = notifications[0];
        if (latest && !latest.read && (Date.now() - latest.timestamp < 1000)) {
            setVisibleToasts(prev => [...prev, latest]);
            
            // Auto remove after 5s
            setTimeout(() => {
                setVisibleToasts(prev => prev.filter(t => t.id !== latest.id));
            }, 6000);
        }
    }, [notifications]);

    const closeToast = (id: string) => {
        setVisibleToasts(prev => prev.filter(t => t.id !== id));
        markAsRead(id);
    };

    return (
        <div className="fixed top-24 right-4 z-50 flex flex-col gap-2 pointer-events-none">
            {visibleToasts.map(n => (
                <div key={n.id} className="pointer-events-auto w-80 bg-white dark:bg-stone-900 border-l-4 border-umbanda-gold shadow-2xl rounded-lg p-4 animate-slideLeft relative overflow-hidden">
                    <button onClick={() => closeToast(n.id)} className="absolute top-2 right-2 text-stone-400 hover:text-stone-900 dark:hover:text-white">
                        <X size={14}/>
                    </button>
                    <div className="flex gap-3">
                        <NotificationIcon type={n.type} />
                        <div>
                            <h4 className="font-bold text-sm text-stone-900 dark:text-white mb-1">{n.title}</h4>
                            <p className="text-xs text-stone-600 dark:text-stone-400">{n.message}</p>
                            {n.actionLink && (
                                <Link to={n.actionLink} className="mt-2 inline-block text-xs font-bold text-umbanda-gold uppercase tracking-wider hover:underline">
                                    {n.actionLabel || 'Confira'}
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const NotificationIcon = ({type}: {type: string}) => {
    switch(type) {
        case 'payment': return <div className="p-1.5 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full"><DollarSign size={16}/></div>;
        case 'system': return <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full"><AlertTriangle size={16}/></div>;
        case 'offer': return <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-full"><Zap size={16}/></div>;
        default: return <div className="p-1.5 bg-stone-100 dark:bg-stone-800 text-stone-600 rounded-full"><CheckCircle size={16}/></div>;
    }
}

function timeAgo(date: number) {
  const seconds = Math.floor((new Date().getTime() - date) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " anos";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " meses";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m";
  return "agora";
}
