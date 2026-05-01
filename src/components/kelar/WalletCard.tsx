"use client";

import { formatRupiah } from '@/lib/utils';
import { motion } from 'motion/react';
import { getWalletPreset } from '@/lib/wallet-icons';
import { CreditCard, Building2, Wallet2, PiggyBank } from 'lucide-react';

interface Props {
  wallet: {
    id: string;
    name: string;
    type: string;
    balance: number;
    color?: string;
    icon?: string;
  };
}

function WalletTypeIcon({ type }: { type: string }) {
  const t = (type || '').toLowerCase();
  if (t === 'bank') return <Building2 size={14} />;
  if (t === 'ewallet') return <Wallet2 size={14} />;
  if (t === 'credit') return <CreditCard size={14} />;
  if (t === 'saving') return <PiggyBank size={14} />;
  return <Wallet2 size={14} />;
}

function walletTypeLabel(type: string) {
  const map: Record<string, string> = {
    bank: 'Bank', ewallet: 'E-Wallet', credit: 'Kredit', saving: 'Tabungan', cash: 'Tunai'
  };
  return map[type?.toLowerCase()] ?? type ?? 'Dompet';
}

export default function WalletCard({ wallet }: Props) {
  const preset = getWalletPreset(wallet.name);

  // Gradient based on brand color
  const gradientStyle = {
    background: `linear-gradient(135deg, ${preset.color} 0%, ${preset.color}cc 60%, ${adjustBrightness(preset.color, -20)} 100%)`,
  };

  return (
    <motion.div
      whileTap={{ scale: 0.96 }}
      className="rounded-[20px] overflow-hidden shadow-lg cursor-pointer select-none"
      style={gradientStyle}
    >
      {/* Top noise texture overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }} />

      <div className="relative z-10 p-4">
        {/* Header: logo + type badge */}
        <div className="flex justify-between items-start mb-5">
          {/* Brand logo box */}
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-xs tracking-tight shadow-inner"
            style={{ background: 'rgba(255,255,255,0.18)', color: preset.textColor === '#fff' ? '#fff' : preset.textColor }}
          >
            {preset.initial}
          </div>

          {/* Type badge */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold" style={{ background: 'rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.9)' }}>
            <WalletTypeIcon type={wallet.type} />
            {walletTypeLabel(wallet.type)}
          </div>
        </div>

        {/* Balance */}
        <div className="mb-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Saldo
          </p>
          <p className="text-[22px] font-black text-white leading-tight tracking-tight">
            {formatRupiah(wallet.balance ?? 0)}
          </p>
        </div>

        {/* Name */}
        <p className="text-[11px] font-semibold mt-2" style={{ color: 'rgba(255,255,255,0.75)' }}>
          {wallet.name}
        </p>
      </div>

      {/* Decorative circle */}
      <div className="absolute -bottom-6 -right-6 w-28 h-28 rounded-full pointer-events-none" style={{ background: 'rgba(255,255,255,0.07)' }} />
      <div className="absolute -top-4 -left-4 w-20 h-20 rounded-full pointer-events-none" style={{ background: 'rgba(255,255,255,0.05)' }} />
    </motion.div>
  );
}

// Simple brightness adjustment for gradient end-stop
function adjustBrightness(hex: string, amount: number): string {
  try {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000ff) + amount));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  } catch {
    return hex;
  }
}
