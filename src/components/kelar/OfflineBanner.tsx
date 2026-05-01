"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WifiOff, AlertCircle } from 'lucide-react';
import { db } from '@/lib/offline/db';
import { useLiveQuery } from 'dexie-react-hooks';

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const pendingCount = useLiveQuery(() => db.pending_transactions.count(), [], 0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const toOnline = () => setIsOnline(true);
      const toOffline = () => setIsOnline(false);

      window.addEventListener('online', toOnline);
      window.addEventListener('offline', toOffline);

      return () => {
        window.removeEventListener('online', toOnline);
        window.removeEventListener('offline', toOffline);
      };
    }
  }, []);

  const isVisible = !isOnline && pendingCount > 0;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 z-50 max-w-[430px] mx-auto p-3 pointer-events-none"
        >
          <div className="bg-amber-100 border border-amber-200 text-amber-800 p-3 rounded-2xl shadow-lg flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-200/50 rounded-full">
                <WifiOff size={16} className="text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Offline</p>
                <p className="text-sm font-medium">{pendingCount} transaksi menunggu sync</p>
              </div>
            </div>
            <AlertCircle size={16} className="text-amber-500" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
