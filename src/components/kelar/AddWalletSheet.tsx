"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2 } from 'lucide-react';
import { useAddWallet } from '@/hooks/use-wallet';
import { WALLET_PRESETS, getWalletPreset } from '@/lib/wallet-icons';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddWalletSheet({ isOpen, onClose }: Props) {
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('bank');
  const [newBalance, setNewBalance] = useState('');
  
  const addWallet = useAddWallet();
  const currentPreset = getWalletPreset(newName || 'Pilih Wallet');

  const handlePresetSelect = (preset: any, type: string) => {
    setNewName(preset.name);
    setNewType(type);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newBalance) return;
    
    addWallet.mutate({
      name: newName,
      type: newType,
      balance: Number(newBalance),
      color: currentPreset.color,
      icon: currentPreset.initial
    }, {
      onSuccess: () => {
        onClose();
        setNewName('');
        setNewBalance('');
        setNewType('bank');
      }
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-[60] max-w-[430px] mx-auto backdrop-blur-sm" 
          />
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-white rounded-t-3xl z-[70] p-6 pb-12 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] h-[90vh] flex flex-col overflow-y-auto"
          >
            <div className="w-full flex justify-center py-1 absolute top-0 left-0 right-0">
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mt-3" />
            </div>

            <div className="flex justify-between items-center mb-6 mt-4">
              <h2 className="text-xl font-black text-gray-800">Tambah Wallet</h2>
              <button onClick={onClose} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 transition-colors rounded-full flex items-center justify-center">
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            <div className="mb-6 space-y-4">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Pilih Bank/Wallet</p>
                <div className="space-y-4">
                  {/* Bank Indonesia */}
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Bank Indonesia</p>
                    <div className="flex overflow-x-auto gap-3 pb-2 [&::-webkit-scrollbar]:hidden">
                      {WALLET_PRESETS.bank.map(b => (
                        <button key={b.id} type="button" onClick={() => handlePresetSelect(b, 'bank')} className="flex flex-col items-center gap-1.5 min-w-[64px] group">
                          <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm transition-transform group-active:scale-95" style={{ backgroundColor: b.color, color: b.textColor }}>
                            {b.initial}
                          </div>
                          <span className="text-[10px] font-bold text-gray-600">{b.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* E-Wallet */}
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">E-Wallet</p>
                    <div className="flex overflow-x-auto gap-3 pb-2 [&::-webkit-scrollbar]:hidden">
                      {WALLET_PRESETS.ewallet.map(e => (
                        <button key={e.id} type="button" onClick={() => handlePresetSelect(e, 'ewallet')} className="flex flex-col items-center gap-1.5 min-w-[64px] group">
                          <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm transition-transform group-active:scale-95" style={{ backgroundColor: e.color, color: e.textColor }}>
                            {e.initial}
                          </div>
                          <span className="text-[10px] font-bold text-gray-600">{e.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Lainnya */}
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Lainnya</p>
                    <div className="flex gap-3">
                      {WALLET_PRESETS.other.map(o => (
                        <button key={o.id} type="button" onClick={() => handlePresetSelect(o, o.id === 'cash' ? 'cash' : o.id === 'credit' ? 'credit' : 'saving')} className="flex flex-col items-center gap-1.5 min-w-[64px] group">
                          <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl shadow-sm transition-transform group-active:scale-95" style={{ backgroundColor: o.color, color: o.textColor }}>
                            {o.initial}
                          </div>
                          <span className="text-[10px] font-bold text-gray-600">{o.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 flex flex-col flex-1">
              {/* Preview Auto-fill */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                 <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm shadow-sm" style={{ backgroundColor: currentPreset.color, color: currentPreset.textColor }}>
                   {currentPreset.initial}
                 </div>
                 <div>
                   <p className="text-[10px] text-gray-400 font-bold uppercase">Preview Ikon</p>
                   <p className="text-sm font-black text-gray-800">{newName || 'Belum dipilih'}</p>
                 </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nama Wallet</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contoh: BCA Utama"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-bold outline-none focus:bg-white focus:border-primary transition-colors"
                />
              </div>

              <div className="hidden">
                {/* Hidden type input as it is auto-set by preset */}
                <input type="hidden" value={newType} />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Saldo Awal</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">Rp</span>
                  <input
                    type="number"
                    required
                    value={newBalance}
                    onChange={(e) => setNewBalance(e.target.value)}
                    placeholder="0"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3.5 text-lg font-black outline-none focus:bg-white focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div className="mt-auto pt-6">
                <button 
                  type="submit" 
                  disabled={addWallet.isPending || !newName.trim() || !newBalance}
                  className="w-full bg-primary text-white py-4 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {addWallet.isPending ? <Loader2 className="animate-spin" size={20} /> : 'Simpan Wallet'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
