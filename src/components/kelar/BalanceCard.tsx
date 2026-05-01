"use client";

import { useMemo, useEffect } from 'react';
import { formatRupiah } from '@/lib/utils';
import { ChevronRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { motion, useAnimate } from 'motion/react';
import { useWallets } from '@/hooks/use-wallet';
import { useAppStore } from '@/store/app-store';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function BalanceCard() {
  const [scope, animate] = useAnimate();
  const { setWallets } = useAppStore();
  const router = useRouter();
  const [showBalance, setShowBalance] = useState(true);

  const { data: wallets, isLoading } = useWallets();

  // Total balance = sum semua wallet.balance
  const totalBalance = useMemo(() => {
    return wallets?.reduce((sum, w) => sum + (w.balance || 0), 0) ?? 0;
  }, [wallets]);

  // Populate wallets into global store for use in other parts of the app
  useEffect(() => {
    if (wallets && wallets.length > 0) {
      setWallets(wallets as any);
    }
  }, [wallets, setWallets]);

  useEffect(() => {
    animate(scope.current, { opacity: [0, 1], y: [8, 0] }, { duration: 0.4, ease: 'easeOut' });
  }, [animate, scope]);

  return (
    <motion.div
      ref={scope}
      onClick={() => router.push('/wallet')}
      className="rounded-[24px] p-6 text-white relative overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      }}
    >
      {/* Subtle decorative elements */}
      <div className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none" style={{ background: 'rgba(42, 157, 143, 0.12)', filter: 'blur(40px)', transform: 'translate(20%, -30%)' }} />
      <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full pointer-events-none" style={{ background: 'rgba(42, 157, 143, 0.08)', filter: 'blur(30px)', transform: 'translate(-20%, 30%)' }} />

      {/* Top row */}
      <div className="flex justify-between items-start relative z-10 mb-4">
        <div>
          <p className="text-white/50 text-[11px] font-semibold uppercase tracking-widest">Total Aset</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); setShowBalance(!showBalance); }}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            {showBalance ? <Eye size={14} className="text-white/60" /> : <EyeOff size={14} className="text-white/60" />}
          </button>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            <ChevronRight size={16} className="text-white/60" />
          </div>
        </div>
      </div>

      {/* Balance */}
      <div className="relative z-10">
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 size={20} className="animate-spin text-white/50" />
            <span className="text-white/50 text-sm">Memuat...</span>
          </div>
        ) : (
          <h2 className="text-[32px] font-black tracking-tight leading-none">
            {showBalance ? formatRupiah(totalBalance) : '••••••••'}
          </h2>
        )}
      </div>

      {/* Wallet count */}
      {!isLoading && wallets && wallets.length > 0 && (
        <p className="text-white/35 text-[11px] font-medium mt-3 relative z-10">
          {wallets.length} wallet aktif
        </p>
      )}
    </motion.div>
  );
}
