"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Loader2, ArrowDownUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useWallets } from '@/hooks/use-wallet';
import { useAddTransaction } from '@/hooks/use-transactions';
import { createClient } from '@/lib/supabase/client';
import { formatRupiah } from '@/lib/utils';
import { getWalletPreset } from '@/lib/wallet-icons';
import { useQueryClient } from '@tanstack/react-query';

type TransferMode = 'internal' | 'external';

export default function TransferPage() {
  const router = useRouter();
  const { data: wallets = [], isLoading } = useWallets();
  const addTransaction = useAddTransaction();
  const qc = useQueryClient();
  const supabase = createClient();

  const [mode, setMode] = useState<TransferMode>('internal');
  const [fromWalletId, setFromWalletId] = useState('');
  const [toWalletId, setToWalletId] = useState('');
  const [amount, setAmount] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [note, setNote] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [success, setSuccess] = useState(false);

  const fromWallet = wallets.find((w: any) => w.id === fromWalletId);
  const toWallet = wallets.find((w: any) => w.id === toWalletId);
  const availableDestinations = wallets.filter((w: any) => w.id !== fromWalletId);

  const canSubmit = fromWalletId && amount && Number(amount) > 0 && (
    mode === 'internal' ? toWalletId !== '' : recipientName.trim() !== ''
  );

  const handleTransfer = async () => {
    if (!canSubmit || !fromWallet) return;
    setIsPending(true);

    try {
      const transferAmount = Number(amount);

      if (mode === 'internal') {
        // ── Internal Transfer: move between own wallets ──
        // 1. Deduct from source wallet
        const { error: e1 } = await supabase
          .from('wallets')
          .update({ balance: (fromWallet as any).balance - transferAmount })
          .eq('id', fromWalletId);
        if (e1) throw e1;

        // 2. Add to destination wallet
        const { error: e2 } = await supabase
          .from('wallets')
          .update({ balance: ((toWallet as any)?.balance ?? 0) + transferAmount })
          .eq('id', toWalletId);
        if (e2) throw e2;

        // 3. Record transaction (type=transfer, no balance impact since internal)
        const { needs_confirm, wallet, wallet_name, new_wallet, confidence, ...clean } = {} as any;
        await addTransaction.mutateAsync({
          type: 'transfer',
          amount: transferAmount,
          category: 'transfer',
          wallet_id: fromWalletId,
          to_wallet_id: toWalletId,
          merchant: `Transfer ke ${(toWallet as any)?.name}`,
          note: note || `Transfer internal`,
        });

      } else {
        // ── External Transfer: send to someone else ──
        // 1. Deduct from source wallet
        const { error: e1 } = await supabase
          .from('wallets')
          .update({ balance: (fromWallet as any).balance - transferAmount })
          .eq('id', fromWalletId);
        if (e1) throw e1;

        // 2. Record as expense (reduces total balance)
        await addTransaction.mutateAsync({
          type: 'expense',
          amount: transferAmount,
          category: 'transfer',
          wallet_id: fromWalletId,
          merchant: `Kirim ke ${recipientName}`,
          note: note || `Transfer ke ${recipientName}`,
        });
      }

      // Refresh wallet data
      qc.invalidateQueries({ queryKey: ['wallets'] });
      qc.invalidateQueries({ queryKey: ['balance'] });
      setSuccess(true);
    } catch (err: any) {
      alert(err?.message || 'Gagal melakukan transfer');
    } finally {
      setIsPending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="p-5 pb-24 min-h-screen">
      {/* Header */}
      <header className="flex items-center gap-3 mt-2 mb-6">
        <button onClick={() => router.back()} className="w-10 h-10 bg-white border border-gray-100 rounded-full flex items-center justify-center shadow-sm">
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
        <h1 className="text-xl font-black text-gray-900">Transfer</h1>
      </header>

      {/* Success state */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl">✅</span>
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-1">Transfer Berhasil!</h2>
            <p className="text-sm text-gray-500 mb-6">
              {mode === 'internal'
                ? `${formatRupiah(Number(amount))} dipindahkan ke ${(toWallet as any)?.name}`
                : `${formatRupiah(Number(amount))} dikirim ke ${recipientName}`
              }
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-primary text-white px-8 py-3 rounded-full font-bold text-sm shadow-lg"
            >
              Kembali ke Dashboard
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {!success && (
        <div className="space-y-5">
          {/* Mode toggle */}
          <div className="bg-gray-50 p-1 rounded-2xl flex">
            <button
              onClick={() => setMode('internal')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-center transition-all ${
                mode === 'internal' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
              }`}
            >
              Antar Wallet
            </button>
            <button
              onClick={() => setMode('external')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-center transition-all ${
                mode === 'external' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
              }`}
            >
              Kirim ke Orang
            </button>
          </div>

          {/* From wallet */}
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Dari Wallet</label>
            <div className="grid grid-cols-2 gap-2">
              {wallets.map((w: any) => {
                const preset = getWalletPreset(w.name);
                return (
                  <button
                    key={w.id}
                    onClick={() => {
                      setFromWalletId(w.id);
                      if (toWalletId === w.id) setToWalletId('');
                    }}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all text-left ${
                      fromWalletId === w.id ? 'border-primary bg-primary/5' : 'border-gray-100 bg-white'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black text-white" style={{ background: preset.color }}>
                      {preset.initial}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate">{w.name}</p>
                      <p className="text-[10px] text-gray-400">{formatRupiah(w.balance ?? 0)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Arrow separator */}
          <div className="flex justify-center">
            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100">
              <ArrowDownUp size={18} className="text-gray-400" />
            </div>
          </div>

          {/* Destination */}
          {mode === 'internal' ? (
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Ke Wallet</label>
              {availableDestinations.length === 0 ? (
                <p className="text-xs text-gray-400 bg-gray-50 p-3 rounded-xl text-center">Pilih wallet asal terlebih dahulu</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {availableDestinations.map((w: any) => {
                    const preset = getWalletPreset(w.name);
                    return (
                      <button
                        key={w.id}
                        onClick={() => setToWalletId(w.id)}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all text-left ${
                          toWalletId === w.id ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-white'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black text-white" style={{ background: preset.color }}>
                          {preset.initial}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-800 truncate">{w.name}</p>
                          <p className="text-[10px] text-gray-400">{formatRupiah(w.balance ?? 0)}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Nama Penerima</label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Contoh: Budi Santoso"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-primary transition-colors"
              />
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Nominal</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">Rp</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-3.5 text-lg font-black outline-none focus:border-primary transition-colors"
              />
            </div>
            {fromWallet && Number(amount) > (fromWallet as any).balance && (
              <p className="text-xs text-red-500 font-medium mt-1">⚠️ Saldo tidak cukup</p>
            )}
          </div>

          {/* Note */}
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Catatan (opsional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Keterangan transfer..."
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Summary */}
          {canSubmit && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-2"
            >
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Ringkasan</p>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Dari</span>
                <span className="font-bold text-gray-800">{(fromWallet as any)?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{mode === 'internal' ? 'Ke Wallet' : 'Ke'}</span>
                <span className="font-bold text-gray-800">{mode === 'internal' ? (toWallet as any)?.name : recipientName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Jumlah</span>
                <span className="font-bold text-gray-800">{formatRupiah(Number(amount))}</span>
              </div>
              {mode === 'internal' && (
                <div className="pt-2 border-t border-gray-200 mt-2">
                  <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    ✓ Total saldo tidak berubah — hanya pindah antar wallet
                  </p>
                </div>
              )}
              {mode === 'external' && (
                <div className="pt-2 border-t border-gray-200 mt-2">
                  <p className="text-[10px] text-orange-600 font-semibold flex items-center gap-1">
                    ⚠ Total saldo akan berkurang {formatRupiah(Number(amount))}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Submit */}
          <button
            onClick={handleTransfer}
            disabled={!canSubmit || isPending || (fromWallet && Number(amount) > (fromWallet as any).balance)}
            className="w-full text-white py-4 rounded-full font-bold text-sm shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ background: canSubmit ? 'linear-gradient(135deg, #2A9D8F, #21867A)' : '#ccc' }}
          >
            {isPending ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <ArrowRight size={18} />
                {mode === 'internal' ? 'Transfer Antar Wallet' : 'Kirim Uang'}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
