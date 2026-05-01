"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { formatRupiah, parseNominal } from '@/lib/utils';
import type { Wallet } from '@/types';

export interface ParsedTransaction {
  amount?: number;
  category?: string;
  merchant?: string;
  note?: string;
  type?: 'expense' | 'income' | 'transfer';
  wallet_name?: string;
}

interface ConfirmSheetProps {
  transaction: ParsedTransaction | null;
  wallets: Wallet[];
  onConfirm: (tx: any) => void;
  onCancel: () => void;
}

const CATEGORIES = [
  'Makanan', 'Minuman', 'Kebutuhan Rumah', 'Kebutuhan Pribadi', 
  'Transportasi', 'Servis Kendaraan', 'Hobi', 'Tagihan', 
  'Kesehatan', 'Investasi', 'Gaji', 'Jualan', 'Pemberian', 'Lainnya'
];

export default function ConfirmSheet({ transaction, wallets, onConfirm, onCancel }: ConfirmSheetProps) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Lainnya');
  const [walletId, setWalletId] = useState('');
  const [note, setNote] = useState('');
  const [merchant, setMerchant] = useState('');

  useEffect(() => {
    if (transaction) {
      setAmount(transaction.amount ? transaction.amount.toString() : '');
      const matchedCat = CATEGORIES.find(c => c.toLowerCase() === transaction.category?.toLowerCase());
      setCategory(matchedCat || 'Lainnya');
      setNote(transaction.note || '');
      setMerchant(transaction.merchant || '');

      if (transaction.wallet_name && wallets.length > 0) {
        const matchedWallet = wallets.find(w => 
          w.name.toLowerCase().includes(transaction.wallet_name!.toLowerCase())
        );
        if (matchedWallet) setWalletId(matchedWallet.id);
      } else if (wallets.length === 1) {
        setWalletId(wallets[0].id);
      } else {
        setWalletId('');
      }
    }
  }, [transaction, wallets]);

  if (!transaction) return null;

  const handleSave = () => {
    if (!walletId) return;
    
    // Destructure AI-only keys so they aren't inserted into the 'transactions' table
    const { needs_confirm, new_wallet, wallet_name, ...validTx } = transaction as any;

    onConfirm({
      ...validTx,
      amount: parseNominal(amount),
      category: category.toLowerCase(),
      merchant,
      note,
      wallet_id: walletId,
      type: transaction.type || 'expense'
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute bottom-0 left-0 right-0 z-[70] bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col max-h-[85vh]"
      >
        <div className="w-full flex justify-center py-3">
          <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
        </div>
        
        <div className="px-5 pb-6 overflow-y-auto">
          <div className="text-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">Konfirmasi Transaksi</h3>
            <p className="text-sm text-gray-500">Cek kembali data dari {transaction.merchant ? 'struk' : 'teks'}</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Nominal (Rp)</label>
              <input 
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xl font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Kategori</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Merchant / Nama</label>
              <input 
                type="text"
                value={merchant}
                onChange={e => setMerchant(e.target.value)}
                placeholder="Contoh: Indomaret, Gaji Bulanan"
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Metode Pembayaran</label>
              {wallets.length === 0 ? (
                <div className="text-sm text-red-500 bg-red-50 p-3 rounded-xl border border-red-100 font-medium">
                  Harap tambah wallet dulu di halaman Wallet
                </div>
              ) : (
                <select
                  value={walletId}
                  onChange={e => setWalletId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
                >
                  <option value="" disabled>Pilih Wallet...</option>
                  {wallets.map(w => (
                    <option key={w.id} value={w.id}>{w.name} ({formatRupiah(w.balance || 0)})</option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Catatan (Opsional)</label>
              <input 
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              onClick={onCancel}
              className="flex-1 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={!walletId}
              className="flex-1 py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Simpan
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
