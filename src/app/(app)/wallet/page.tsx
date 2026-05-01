"use client";

import { useState } from 'react';
import WalletCard from '@/components/kelar/WalletCard';
import { Plus } from 'lucide-react';
import EmptyState from '@/components/kelar/EmptyState';
import { useWallets } from '@/hooks/use-wallet';
import { useRouter } from 'next/navigation';
import AddWalletSheet from '@/components/kelar/AddWalletSheet';


export default function WalletPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const router = useRouter();
  
  const { data: wallets = [], isLoading: isLoadingWallets } = useWallets();

  return (
    <div className="p-4 space-y-6 pb-24 relative min-h-screen">
      <header className="mt-2 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Dompet Pintar</h1>
        <p className="text-sm text-gray-500 font-medium">Kelola semua sumber danamu</p>
      </header>

      {isLoadingWallets ? (
        <div className="grid grid-cols-2 gap-4">
          {[1,2,3,4].map(n => (
            <div key={n} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : wallets.length === 0 ? (
        <EmptyState 
          icon="👛" 
          title="Belum ada wallet" 
          subtitle="Tambah Rekening, E-Wallet, atau Cash untuk memulai" 
          actionLabel="Tambah Wallet" 
          onAction={() => setIsAddOpen(true)} 
        />
      ) : (
        <section className="grid grid-cols-2 gap-4">
          {wallets.map((w: any) => (
            <div key={w.id} className="cursor-pointer active:scale-95 transition-transform" onClick={() => router.push(`/transactions?walletId=${w.id}&walletName=${encodeURIComponent(w.name)}`)}>
              <WalletCard wallet={w} />
            </div>
          ))}
          <button 
            onClick={() => setIsAddOpen(true)}
            className="h-[120px] rounded-[24px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-primary hover:border-primary transition-colors hover:bg-primary/5 active:scale-95"
          >
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mb-1">
              <Plus size={20} />
            </div>
            <span className="font-bold text-sm">Tambah Dompet</span>
          </button>
        </section>
      )}



      {/* Slide Panel: Tambah Wallet Form */}
      <AddWalletSheet isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </div>
  );
}
