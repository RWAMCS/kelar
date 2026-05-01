"use client";

import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/store/app-store';
import { Download, Bell, Shield, LogOut, ChevronRight, Award, Target, Users, Receipt, LineChart, Flame, Zap } from 'lucide-react';
import { ElementType } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getNameFromEmail } from '@/lib/utils';
import PWAInstallPrompt from '@/components/kelar/PWAInstallPrompt';

async function fetchUserProgress() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { streak: 0, level: 1, xp: 0 };
  const { data } = await supabase.from('user_progress').select('streak, level, xp').eq('user_id', user.id).single();
  return data || { streak: 0, level: 1, xp: 0 };
}

async function fetchUserProfile() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  return { ...data, email: user.email };
}

export default function ProfilePage() {
  const { user } = useAppStore();
  const router = useRouter();

  const { data: profile } = useQuery({ queryKey: ['profile'], queryFn: fetchUserProfile, staleTime: 1000 * 60 * 10 });
  const { data: progress } = useQuery({ queryKey: ['user-progress'], queryFn: fetchUserProgress, staleTime: 1000 * 60 * 5 });

  const userName = profile?.name || profile?.full_name || user?.name || getNameFromEmail(profile?.email || user?.email);
  const userEmail = profile?.email || user?.email || "";
  const streak = progress?.streak || 0;
  const level = progress?.level || 1;
  const xp = progress?.xp || 0;
  const nextLevelXP = level * 1000;
  const xpPercent = Math.min((xp / nextLevelXP) * 100, 100);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleExport = async () => {
    try {
      const res = await fetch('/api/export');
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'kelar-export.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert("Gagal mengunduh file export.");
    }
  };

  const achievements = [
    { id: 1, title: 'First Blood', unlocked: true },
    { id: 2, title: 'Saver', unlocked: true },
    { id: 3, title: 'Rich', unlocked: false },
    { id: 4, title: 'King', unlocked: false },
    { id: 5, title: 'Master', unlocked: false },
    { id: 6, title: 'Legend', unlocked: false },
  ];

  return (
    <div className="pb-24">
      {/* Profile header with gradient */}
      <div
        className="px-5 pt-8 pb-6 rounded-b-[32px]"
        style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}
      >
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black text-white mb-3 relative"
            style={{ background: 'linear-gradient(135deg, #2A9D8F 0%, #21867A 100%)' }}
          >
            {userName.charAt(0).toUpperCase()}
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full border-2 border-[#16213e] flex items-center justify-center text-white shadow-md"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)' }}
            >
              <span className="text-[10px] font-black">{level}</span>
            </div>
          </div>
          <h1 className="text-xl font-black text-white">{userName}</h1>
          <p className="text-[12px] text-white/50 font-medium">{userEmail}</p>
        </div>

        {/* Gamification strip (same data as dashboard) */}
        <div className="mt-5 bg-white/10 backdrop-blur-sm rounded-2xl p-3.5 flex items-center gap-3">
          <div className="flex items-center gap-1.5 pr-3 border-r border-white/10">
            <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <Flame size={16} className="text-orange-400" />
            </div>
            <div>
              <p className="text-[17px] font-black text-white leading-none">{streak}</p>
              <p className="text-[9px] text-white/40 font-semibold uppercase">Streak</p>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-1">
                <Zap size={11} className="text-amber-400" />
                <span className="text-[10px] font-bold text-white/60">Lv.{level}</span>
              </div>
              <span className="text-[10px] font-bold text-white/40">{xp}/{nextLevelXP}</span>
            </div>
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${xpPercent}%`, background: 'linear-gradient(90deg, #F59E0B, #EF4444)' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="px-5 mt-5">
        <h2 className="text-[15px] font-black text-gray-900 mb-3">Pencapaian</h2>
        <div className="grid grid-cols-3 gap-2">
          {achievements.map((ach) => (
            <div key={ach.id} className={`flex flex-col items-center p-3 rounded-2xl border ${
              ach.unlocked 
                ? 'bg-white border-gray-100' 
                : 'bg-gray-50 border-gray-100 grayscale opacity-40'
            }`}>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-1.5 ${
                ach.unlocked ? 'text-amber-500' : 'text-gray-400'
              }`}
                style={{ background: ach.unlocked ? 'linear-gradient(135deg, #FEF3C7, #FDE68A)' : '#F3F4F6' }}
              >
                <Award size={22} />
              </div>
              <span className="text-[10px] font-bold text-center text-gray-700">{ach.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* PWA Install Button */}
      <PWAInstallPrompt />

      {/* Menu: Fitur */}
      <div className="px-5 mt-6">
        <h2 className="text-[15px] font-black text-gray-900 mb-3">Fitur Lanjut</h2>
        <div className="space-y-2">
          <MenuRow icon={Target} title="Goals & Target" onClick={() => router.push('/goals')} />
          <MenuRow icon={Users} title="Hutang & Piutang" onClick={() => router.push('/debts')} />
          <MenuRow icon={Receipt} title="Split Bill" onClick={() => router.push('/split')} />
          <MenuRow icon={Download} title="Export Data" onClick={handleExport} />
        </div>
      </div>

      {/* Menu: Pengaturan */}
      <div className="px-5 mt-6">
        <h2 className="text-[15px] font-black text-gray-900 mb-3">Pengaturan</h2>
        <div className="space-y-2">
          <MenuRow icon={Bell} title="Notifikasi" />
          <MenuRow icon={Shield} title="Keamanan" />
          <MenuRow icon={LogOut} title="Keluar" color="text-red-500" onClick={handleLogout} />
        </div>
      </div>
    </div>
  );
}

function MenuRow({ icon: Icon, title, color = "text-gray-700", onClick }: { icon: ElementType, title: string, color?: string, onClick?: () => void }) {
  return (
    <button onClick={onClick} className="w-full bg-white border border-gray-100 px-4 py-3.5 rounded-2xl flex items-center gap-3 active:scale-[0.98] transition-transform">
      <div className={`w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center ${color}`}>
        <Icon size={18} />
      </div>
      <span className={`flex-1 text-left text-[13px] font-bold ${color}`}>{title}</span>
      <ChevronRight size={16} className="text-gray-300" />
    </button>
  );
}
