"use client";

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/store/app-store';
import BalanceCard from '@/components/kelar/BalanceCard';
import ChatInput from '@/components/kelar/ChatInput';
import TransactionItem from '@/components/kelar/TransactionItem';
import EmptyState from '@/components/kelar/EmptyState';
import { Plus, ArrowLeftRight, Target, Scissors, Users, RefreshCw, ChevronRight, Flame, Zap } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useTransactions } from '@/hooks/use-transactions';
import { useWallets } from '@/hooks/use-wallet';
import { useRouter } from 'next/navigation';
import { getNameFromEmail } from '@/lib/utils';

function getGreeting(name: string): { text: string; emoji: string } {
  const hour = new Date().getHours()
  const firstName = (name && name !== 'Pengguna' && name !== 'Kamu') ? name.split(' ')[0] : 'Kamu'
  if (hour >= 5 && hour < 11) return { text: `Pagi, ${firstName}!`, emoji: '☀️' }
  if (hour >= 11 && hour < 15) return { text: `Siang, ${firstName}!`, emoji: '☀️' }
  if (hour >= 15 && hour < 19) return { text: `Sore, ${firstName}!`, emoji: '🌅' }
  return { text: `Malam, ${firstName}!`, emoji: '🌙' }
}

async function fetchUserProfile() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  return { ...data, email: user.email };
}

async function fetchActiveGoalsCount() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;
  const { count } = await supabase.from('goals').select('*', { count: 'exact', head: true }).eq('user_id', user.id).neq('status', 'completed');
  return count ?? 0;
}

async function fetchUserProgress() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { streak: 0, level: 1, xp: 0 };
  const { data } = await supabase.from('user_progress').select('streak, level, xp').eq('user_id', user.id).single();
  return data || { streak: 0, level: 1, xp: 0 };
}

export default function DashboardPage() {
  const { user, isChatOpen, openChat, closeChat } = useAppStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading: txLoading } = useTransactions(5);
  const { data: wallets = [] } = useWallets();

  const { data: profile } = useQuery({ queryKey: ['profile'], queryFn: fetchUserProfile, staleTime: 1000 * 60 * 10 });
  const { data: goalsCount = 0 } = useQuery({ queryKey: ['goals-count'], queryFn: fetchActiveGoalsCount, staleTime: 1000 * 60 * 5 });
  const { data: progress } = useQuery({ queryKey: ['user-progress'], queryFn: fetchUserProgress, staleTime: 1000 * 60 * 5 });

  const streak = progress?.streak || 0;
  const level = progress?.level || 1;
  const xp = progress?.xp || 0;
  const nextLevelXP = level * 1000;
  const xpPercent = Math.min((xp / nextLevelXP) * 100, 100);

  const userName = profile?.name || profile?.full_name || user?.name || getNameFromEmail(profile?.email || user?.email);
  const avatarInitial = userName.charAt(0).toUpperCase();
  const greeting = getGreeting(userName);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
    queryClient.invalidateQueries({ queryKey: ['wallets'] });
    queryClient.invalidateQueries({ queryKey: ['goals-count'] });
    queryClient.invalidateQueries({ queryKey: ['user-progress'] });
  };

  return (
    <div className="pb-6">
      {/* ── Header ── */}
      <div className="px-5 pt-4 pb-5">
        <header className="flex justify-between items-center">
          <div>
            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-widest">
              {new Date().toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long' })}
            </p>
            <h1 className="text-[22px] font-black text-gray-900 mt-1 leading-tight">
              {greeting.text} {greeting.emoji}
            </h1>
          </div>
          <button 
            onClick={() => router.push('/profile')}
            className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-base shadow-sm border-2 border-white active:scale-95 transition-transform"
            style={{ background: 'linear-gradient(135deg, #2A9D8F 0%, #21867A 100%)', color: '#fff' }}
          >
            {avatarInitial}
          </button>
        </header>
      </div>

      {/* ── Balance Card ── */}
      <div className="px-5">
        <BalanceCard />
      </div>

      {/* ── Quick Actions (4-col compact grid) ── */}
      <div className="px-5 mt-5">
        <div className="grid grid-cols-4 gap-2">
          <GridAction icon={<Plus size={20} />} label="Catat" color="#2A9D8F" onClick={openChat} />
          <GridAction icon={<ArrowLeftRight size={20} />} label="Transfer" color="#3B82F6" onClick={() => router.push('/transfer')} />
          <GridAction icon={<Scissors size={20} />} label="Split" color="#8B5CF6" onClick={() => router.push('/split')} />
          <GridAction icon={<Users size={20} />} label="Hutang" color="#EF4444" onClick={() => router.push('/debts')} />
        </div>
      </div>

      {/* ── Gamification + Goals Strip ── */}
      <div className="px-5 mt-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-3.5 flex items-center gap-3">
          {/* Streak flame */}
          <div className="flex items-center gap-1.5 pr-3 border-r border-gray-100">
            <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
              <Flame size={16} className="text-orange-500" />
            </div>
            <div>
              <p className="text-[17px] font-black text-gray-900 leading-none">{streak}</p>
              <p className="text-[9px] text-gray-400 font-semibold uppercase">Streak</p>
            </div>
          </div>

          {/* XP bar (takes remaining space) */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-1">
                <Zap size={11} className="text-amber-500" />
                <span className="text-[10px] font-bold text-gray-600">Lv.{level}</span>
              </div>
              <span className="text-[10px] font-bold text-gray-400">{xp}/{nextLevelXP}</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${xpPercent}%`, background: 'linear-gradient(90deg, #F59E0B, #EF4444)' }}
              />
            </div>
          </div>

          {/* Goals count badge */}
          {goalsCount > 0 && (
            <button 
              onClick={() => router.push('/goals')}
              className="flex items-center gap-1.5 pl-3 border-l border-gray-100"
            >
              <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                <Target size={16} className="text-emerald-500" />
              </div>
              <div>
                <p className="text-[17px] font-black text-gray-900 leading-none">{goalsCount}</p>
                <p className="text-[9px] text-gray-400 font-semibold uppercase">Goals</p>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* ── Recent Transactions ── */}
      <div className="px-5 mt-5">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-[15px] font-black text-gray-900">Transaksi Terbaru</h2>
          <div className="flex items-center gap-3">
            <button onClick={handleRefresh} className="text-gray-400 hover:text-primary transition-colors p-1">
              <RefreshCw size={14} />
            </button>
            <button onClick={() => router.push('/transactions')} className="text-xs text-primary font-bold">
              Lihat Semua
            </button>
          </div>
        </div>

        {txLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-14 bg-gray-50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <EmptyState 
            icon="💸" 
            title="Belum ada transaksi" 
            subtitle="Ketik atau foto struk via tombol + untuk mulai" 
            actionLabel="Tambah Transaksi" 
            onAction={openChat} 
          />
        ) : (
          <div className="space-y-2">
            {transactions.map((tx: any) => (
              <TransactionItem 
                key={tx.id} 
                transaction={{
                  id: tx.id,
                  type: tx.type,
                  amount: tx.amount,
                  category: tx.category || 'other',
                  merchant: tx.merchant || tx.note || 'Transaksi',
                  wallet: tx.wallet?.name || '-',
                }} 
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={openChat}
        className="fixed bottom-[88px] w-[56px] h-[56px] rounded-full shadow-lg flex flex-col items-center justify-center text-white z-40 transform hover:scale-105 active:scale-95 transition-transform"
        style={{ 
          right: 'max(1rem, calc(50% - 215px + 1rem))',
          background: 'linear-gradient(135deg, #2A9D8F 0%, #21867A 100%)',
        }}
      >
        <Plus size={28} strokeWidth={2.5} />
      </button>

      <ChatInput isOpen={isChatOpen} onClose={closeChat} />
    </div>
  );
}

/* ── Grid Action (compact square) ── */
function GridAction({ icon, label, color, onClick }: { icon: React.ReactNode; label: string; color: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl bg-white border border-gray-50 shadow-sm active:scale-95 transition-transform"
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
        style={{ background: color }}
      >
        {icon}
      </div>
      <span className="text-[11px] font-bold text-gray-600">{label}</span>
    </button>
  );
}
