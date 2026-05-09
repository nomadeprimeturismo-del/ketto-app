import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, Info, CheckCircle, AlertTriangle } from 'lucide-react';

interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
  timestamp: any;
}

interface NotificationContextType {
  notifications: Notification[];
  sendNotification: (userId: string, title: string, message: string, type?: Notification['type']) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [latestNotification, setLatestNotification] = useState<Notification | null>(null);

  useEffect(() => {
    if (!profile) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', profile.uid),
      orderBy('timestamp', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
      
      setNotifications(newNotifications);

      // Check for new unread notification to show toast
      const unread = newNotifications.find(n => !n.read);
      if (unread && (!latestNotification || unread.id !== latestNotification.id)) {
        setLatestNotification(unread);
        // Auto hide after 5 seconds
        setTimeout(() => setLatestNotification(null), 5000);
      }
    });

    return () => unsubscribe();
  }, [profile]);

  const sendNotification = async (userId: string, title: string, message: string, type: Notification['type'] = 'info') => {
    await addDoc(collection(db, 'notifications'), {
      userId,
      title,
      message,
      type,
      read: false,
      timestamp: serverTimestamp()
    });
  };

  return (
    <NotificationContext.Provider value={{ notifications, sendNotification }}>
      {children}
      
      {/* Global Notification Toast */}
      <div className="fixed top-6 right-6 z-[100] w-full max-w-sm pointer-events-none">
        <AnimatePresence>
          {latestNotification && (
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              className="pointer-events-auto bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-2xl flex gap-4 items-start mb-3"
            >
              <div className={`p-2 rounded-xl ${
                latestNotification.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' :
                latestNotification.type === 'warning' ? 'bg-yellow-400/10 text-yellow-400' :
                'bg-blue-500/10 text-blue-500'
              }`}>
                {latestNotification.type === 'success' && <CheckCircle className="w-5 h-5" />}
                {latestNotification.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
                {latestNotification.type === 'info' && <Bell className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <h4 className="font-black text-xs uppercase tracking-widest text-white mb-1">{latestNotification.title}</h4>
                <p className="text-[10px] font-bold text-neutral-500 leading-relaxed uppercase italic">{latestNotification.message}</p>
              </div>
              <button onClick={() => setLatestNotification(null)} className="text-neutral-700 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
