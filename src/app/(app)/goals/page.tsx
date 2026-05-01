"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import GoalCard from '@/components/kelar/GoalCard';
import EmptyState from '@/components/kelar/EmptyState';
import { Plus, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useGoals, useUpdateGoalProgress } from '@/hooks/use-goals';
import { useWallets, useDeductFromWallet } from '@/hooks/use-wallet';
import { useQueryClient } from '@tanstack/react-query';

export default function GoalsPage() {
  const { data: goals = [], isLoading } = useGoals();
  const { data: wallets = [] } = useWallets();
  const updateProgress = useUpdateGoalProgress();
  const deductWallet = useDeductFromWallet();
  const qc = useQueryClient();
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  
  const [selectedGoalId, setSelectedGoalId] = useState('');
  const [selectedGoalName, setSelectedGoalName] = useState('');
  const [savingAmount, setSavingAmount] = useState('');
  const [selectedWalletId, setSelectedWalletId] = useState('');

  const supabase = createClient();

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newAmount || !newDeadline) return;
    
    setIsPending(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsPending(false);
      return;
    }

    const newGoal = {
      user_id: user.id,
      name: newName,
      target_amount: Number(newAmount),
      current_amount: 0,
      deadline: newDeadline
    };

    const { error } = await supabase.from('goals').insert(newGoal);
    setIsPending(false);
    
    if (!error) {
      setIsAddOpen(false);
      setNewName('');
      setNewAmount('');
      setNewDeadline('');
      qc.invalidateQueries({ queryKey: ['goals'] });
      qc.invalidateQueries({ queryKey: ['goals-count'] });
    } else {
      alert("Gagal menyimpan goal");
    }
  };

  const handleUpdateProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoalId || !savingAmount || !selectedWalletId) return;
    
    setIsPending(true);
    try {
      // 1. Add to goal progress
      await updateProgress.mutateAsync({ 
        id: selectedGoalId, 
        amountToAdd: Number(savingAmount) 
      });
      // 2. Deduct from chosen wallet
      await deductWallet.mutateAsync({
        walletId: selectedWalletId,
        amount: Number(savingAmount)
      });
      setIsUpdateOpen(false);
      setSavingAmount('');
      setSelectedWalletId('');
    } catch (e: any) {
      alert(e?.message ?? 'Gagal menambah tabungan');
    } finally {
      setIsPending(false);
    }
  };

  const openUpdateModal = (id: string, name: string) => {
    setSelectedGoalId(id);
    setSelectedGoalName(name);
    setSelectedWalletId(wallets[0]?.id ?? '');
    setIsUpdateOpen(true);
  };

  return (
    <div className="pb-24 relative min-h-screen">
      {/* Header */}
      <div className="px-5 pt-4 pb-4">
        <h1 className="text-[22px] font-black text-gray-900">Goal Tracker</h1>
        <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-widest mt-0.5">Wujudkan target keuanganmu</p>
      </div>

      {/* Summary card */}
      <div className="px-5">
        <div className="bg-white border border-gray-100 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2A9D8F, #21867A)' }}>
              <span className="text-lg">🎯</span>
            </div>
            <div>
              <p className="text-[11px] text-gray-400 font-bold uppercase">Goals Aktif</p>
              <p className="text-xl font-black text-gray-900">{goals.length}</p>
            </div>
          </div>
          <button onClick={() => setIsAddOpen(true)} className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-primary active:scale-95 transition-transform">
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Goals list */}
      <div className="px-5 mt-5 space-y-3">

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : goals.length === 0 ? (
          <EmptyState 
            icon="🎯" 
            title="Belum ada goal" 
            subtitle="Mulai tabungan pertama kamu dengan pencet tombol +, atau bilang ke AI chat"
            actionLabel="Tambah Goal"
            onAction={() => setIsAddOpen(true)}
          />
        ) : (
          goals.map((g: any) => (
            <GoalCard 
              key={g.id} 
              goal={g} 
              avgSaving={0}
              onDelete={() => {
                qc.invalidateQueries({ queryKey: ['goals'] });
                qc.invalidateQueries({ queryKey: ['goals-count'] });
              }}
              onUpdateProgress={openUpdateModal}
            />
          ))
        )}
      </div>

      {/* Slide Panel: Tambah Goal Baru */}
      <AnimatePresence>
        {isAddOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddOpen(false)}
              className="fixed inset-0 bg-black/40 z-[60] max-w-[430px] mx-auto" 
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-white rounded-t-3xl z-[60] p-6 pb-12 shadow-2xl h-[70vh] flex flex-col overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-gray-800">Tambah Goal Baru</h2>
                <button onClick={() => setIsAddOpen(false)} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 transition-colors rounded-full flex items-center justify-center">
                  <X size={20} className="text-gray-600" />
                </button>
              </div>

              <form onSubmit={handleAddGoal} className="space-y-4 flex flex-col h-full">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nama Target</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Contoh: Dana Darurat"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:bg-white focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Jumlah Target</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">Rp</span>
                    <input
                      type="number"
                      required
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      placeholder="5000000"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-sm font-bold outline-none focus:bg-white focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Target Tercapai</label>
                  <input
                    type="date"
                    required
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:bg-white focus:border-primary transition-colors text-gray-700"
                  />
                </div>

                <div className="mt-auto pt-6">
                  <button 
                    type="submit" 
                    disabled={isPending || !newName.trim() || !newAmount || !newDeadline}
                    className="w-full bg-primary text-white py-4 rounded-full font-bold text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isPending ? <Loader2 className="animate-spin" size={20} /> : 'Simpan Goal'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Slide Panel: Update Progress */}
      <AnimatePresence>
        {isUpdateOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsUpdateOpen(false)}
              className="fixed inset-0 bg-black/40 z-[60] max-w-[430px] mx-auto" 
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-white rounded-t-3xl z-[60] p-6 pb-12 shadow-2xl h-[75vh] flex flex-col overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-black text-gray-800">Tambah Tabungan</h2>
                  <p className="text-xs text-gray-500 font-medium">untuk "{selectedGoalName}"</p>
                </div>
                <button onClick={() => setIsUpdateOpen(false)} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 transition-colors rounded-full flex items-center justify-center">
                  <X size={20} className="text-gray-600" />
                </button>
              </div>

              <form onSubmit={handleUpdateProgress} className="space-y-4 flex flex-col h-full">
                {/* Wallet selector */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Dari Wallet</label>
                  <div className="grid grid-cols-2 gap-2">
                    {wallets.map((w: any) => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => setSelectedWalletId(w.id)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-left transition-all ${
                          selectedWalletId === w.id
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-100 bg-gray-50'
                        }`}
                      >
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black text-white" style={{ background: '#2A9D8F' }}>
                          {w.name.slice(0,3).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-700 truncate">{w.name}</p>
                          <p className="text-[10px] text-gray-400">Rp {(w.balance ?? 0).toLocaleString('id-ID')}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nominal Ditabung</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">Rp</span>
                    <input
                      type="number"
                      required
                      value={savingAmount}
                      onChange={(e) => setSavingAmount(e.target.value)}
                      placeholder="100000"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-sm font-bold outline-none focus:bg-white focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div className="mt-auto pt-4">
                  <button 
                    type="submit" 
                    disabled={isPending || !savingAmount || !selectedWalletId}
                    className="w-full bg-primary text-white py-4 rounded-full font-bold text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isPending ? <Loader2 className="animate-spin" size={20} /> : 'Simpan & Potong Saldo'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
