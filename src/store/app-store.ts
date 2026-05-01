import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Wallet } from '@/types';

interface AppState {
  user: User | null;
  wallets: Wallet[];
  totalBalance: number;
  streak: number;
  level: number;
  xp: number;
  pendingCount: number;
  isChatOpen: boolean;
  lastRefresh: number;
  setUser: (user: User | null) => void;
  setWallets: (wallets: Wallet[]) => void;
  updateBalance: (amount: number) => void;
  addXP: (amount: number) => void;
  incrementStreak: () => void;
  openChat: () => void;
  closeChat: () => void;
  triggerRefresh: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      wallets: [],
      totalBalance: 0,
      streak: 0,
      level: 1,
      xp: 0,
      pendingCount: 0,
      isChatOpen: false,
      lastRefresh: Date.now(),
      setUser: (user) => set({ user }),
      setWallets: (wallets) => set({ wallets }),
      updateBalance: (amount) => set((state) => ({ totalBalance: state.totalBalance + amount })),
      addXP: (amount) => set((state) => ({ xp: state.xp + amount })),
      incrementStreak: () => set((state) => ({ streak: state.streak + 1 })),
      openChat: () => set({ isChatOpen: true }),
      closeChat: () => set({ isChatOpen: false }),
      triggerRefresh: () => set({ lastRefresh: Date.now() }),
    }),
    { name: 'kelar-app-store' }
  )
);
