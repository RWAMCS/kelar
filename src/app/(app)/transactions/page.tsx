"use client";

import { Suspense } from 'react';
import { useTransactions } from '@/hooks/use-transactions';
import TransactionItem from '@/components/kelar/TransactionItem';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

function TransactionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const walletId = searchParams.get('walletId');
  const walletName = searchParams.get('walletName');

  // Fetch up to 100 transactions for the history page, filter by walletId if present
  const { data: transactions = [], isLoading } = useTransactions(100, walletId);

  // Group by date
  const grouped = transactions.reduce((acc: any, tx: any) => {
    const date = tx.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(tx);
    return acc;
  }, {});

  const dates = Object.keys(grouped).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <div className="p-4 space-y-6 pb-24 relative min-h-screen">
      <header className="flex items-center gap-3 mt-2 mb-6">
        <button onClick={() => router.back()} className="w-10 h-10 bg-white border border-gray-100 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors">
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            {walletId ? `Histori ${walletName || 'Wallet'}` : 'Semua Transaksi'}
          </h1>
          <p className="text-xs text-gray-500 font-medium">Riwayat lengkap pengeluaran dan pemasukan</p>
        </div>
      </header>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">👻</p>
          <p className="text-gray-500 font-medium">Belum ada transaksi sama sekali.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {dates.map(date => {
            const dateObj = new Date(date);
            const isToday = new Date().toDateString() === dateObj.toDateString();
            const dateStr = isToday ? 'Hari Ini' : dateObj.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
            
            return (
              <div key={date}>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 pl-1">{dateStr}</h3>
                <div className="space-y-3">
                  {grouped[date].map((tx: any) => (
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AllTransactionsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><Loader2 className="animate-spin text-primary" size={32} /></div>}>
      <TransactionsContent />
    </Suspense>
  );
}
