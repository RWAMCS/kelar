'use client';

import { useState } from 'react';
import { useDebts, useAddDebt, useSettleDebt } from '@/hooks/use-debts';
import { motion, AnimatePresence } from 'motion/react';
import { formatRupiah, parseNominal } from '@/lib/utils';
import { ArrowDownLeft, ArrowUpRight, CheckCircle2, Plus, X } from 'lucide-react';
import EmptyState from '@/components/kelar/EmptyState';

export default function DebtsPage() {
  const { data: debts = [], isLoading } = useDebts();
  const addDebt = useAddDebt();
  const settleDebt = useSettleDebt();

  const [activeTab, setActiveTab] = useState<'owed' | 'owe'>('owed');
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form states
  const [direction, setDirection] = useState<'owed' | 'owe'>('owed');
  const [person, setPerson] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');

  // Summaries
  let totalOwed = 0; // Piutang (orang utang ke saya)
  let totalOwe = 0;  // Hutang (saya utang ke orang)

  debts.forEach((d: any) => {
    const unpaidAmount = d.amount - (d.paid_amount || 0);
    if (unpaidAmount > 0) {
      if (d.direction === 'owed') totalOwed += unpaidAmount;
      else if (d.direction === 'owe') totalOwe += unpaidAmount;
    }
  });

  const netPosition = totalOwed - totalOwe;

  // Filtered lists
  const filteredDebts = debts.filter((d: any) => d.direction === activeTab && (d.amount - (d.paid_amount || 0)) > 0);

  const handleSave = async () => {
    if (!person.trim() || !amount) return;

    try {
      await addDebt.mutateAsync({
        person,
        direction,
        amount: parseNominal(amount),
        note,
        due_date: dueDate || undefined
      });
      setIsFormOpen(false);
      
      // Reset
      setPerson('');
      setAmount('');
      setNote('');
      setDueDate('');
    } catch (e) {
      console.error(e);
      alert('Gagal menyimpan data');
    }
  };

  const handleSettle = async (id: string, amount: number) => {
    if (confirm('Tandai sebagai lunas?')) {
      try {
        await settleDebt.mutateAsync({ id, amount });
      } catch (e) {
        console.error(e);
        alert('Gagal menandai lunas');
      }
    }
  };

  return (
    <div className="p-4 space-y-6 pb-6 relative min-h-[calc(100vh-80px)]">
      {/* Header */}
      <header className="flex justify-between items-center mt-2">
        <h1 className="text-2xl font-bold text-gray-800">Hutang & Piutang</h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-primary/10 text-primary px-4 py-2 rounded-full font-bold text-sm flex items-center gap-1 hover:bg-primary/20 transition-colors"
        >
          <Plus size={16} /> Tambah
        </button>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-50 p-3 rounded-2xl border border-green-100 flex flex-col items-center justify-center text-center gap-1">
          <ArrowDownLeft size={20} className="text-green-600 mb-0.5" />
          <p className="text-[10px] text-green-700 font-bold uppercase tracking-wide">Piutang</p>
          <p className="text-sm font-black text-green-700">{formatRupiah(totalOwed)}</p>
        </div>
        <div className="bg-red-50 p-3 rounded-2xl border border-red-100 flex flex-col items-center justify-center text-center gap-1">
          <ArrowUpRight size={20} className="text-red-600 mb-0.5" />
          <p className="text-[10px] text-red-700 font-bold uppercase tracking-wide">Hutang</p>
          <p className="text-sm font-black text-red-700">{formatRupiah(totalOwe)}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 flex flex-col items-center justify-center text-center gap-1">
          <div className={`w-5 h-5 rounded-full flex items-center justify-center mb-0.5 ${netPosition >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            {netPosition >= 0 ? <ArrowDownLeft size={12} strokeWidth={3} /> : <ArrowUpRight size={12} strokeWidth={3} />}
          </div>
          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wide">Bersih</p>
          <p className={`text-sm font-black ${netPosition >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {formatRupiah(Math.abs(netPosition))}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('owed')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
            activeTab === 'owed' ? 'bg-white shadow-sm text-green-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Piutang (Owed)
        </button>
        <button
          onClick={() => setActiveTab('owe')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
            activeTab === 'owe' ? 'bg-white shadow-sm text-red-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Hutang (Owe)
        </button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-2xl" />)}
        </div>
      ) : filteredDebts.length === 0 ? (
        <EmptyState 
          icon="🤝" 
          title={`Tidak ada ${activeTab === 'owed' ? 'piutang' : 'hutang'} aktif`}
          subtitle={`Klik tombol + Tambah untuk mencatat ${activeTab === 'owed' ? 'piutang' : 'hutang'} baru.`} 
        />
      ) : (
        <div className="space-y-3">
          {filteredDebts.map((d: any) => (
            <div key={d.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 transition-all hover:shadow-md">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${activeTab === 'owed' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {activeTab === 'owed' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-800 truncate">{d.person}</h3>
                <p className="text-xs text-gray-500 truncate">
                  {new Date(d.created_at).toLocaleDateString('id-ID')} 
                  {d.due_date && <span className="text-orange-500 font-medium"> • JT: {new Date(d.due_date).toLocaleDateString('id-ID')}</span>}
                </p>
                <div className={`font-black mt-1 ${activeTab === 'owed' ? 'text-green-600' : 'text-red-600'}`}>
                  {formatRupiah(d.amount - (d.paid_amount || 0))}
                </div>
              </div>
              <button
                onClick={() => handleSettle(d.id, d.amount)}
                className="bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold px-3 py-2 rounded-lg flex flex-col items-center gap-1 transition-colors border border-gray-200"
                disabled={settleDebt.isPending}
              >
                <CheckCircle2 size={16} className="text-primary" /> 
                <span>Lunas</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Sheet Form */}
      <AnimatePresence>
        {isFormOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm"
              onClick={() => setIsFormOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col max-h-[90vh] max-w-[430px] mx-auto"
            >
              <div className="w-full flex justify-center py-3">
                <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
              </div>
              
              <div className="px-5 pb-8 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Catat Hutang/Piutang</h3>
                    <p className="text-sm text-gray-500">Siapa pinjam siapa?</p>
                  </div>
                  <button onClick={() => setIsFormOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors">
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Type Toggle */}
                  <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button
                      onClick={() => setDirection('owed')}
                      className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                        direction === 'owed' ? 'bg-white shadow-sm text-green-600' : 'text-gray-500'
                      }`}
                    >
                      Saya meminjami (Piutang)
                    </button>
                    <button
                      onClick={() => setDirection('owe')}
                      className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                        direction === 'owe' ? 'bg-white shadow-sm text-red-600' : 'text-gray-500'
                      }`}
                    >
                      Saya meminjam (Hutang)
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Nama Orang</label>
                    <input 
                      type="text"
                      value={person}
                      onChange={e => setPerson(e.target.value)}
                      placeholder="Contoh: Budi, Warung Ibu Ani"
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Nominal (Rp)</label>
                    <input 
                      type="number"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xl font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Tanggal</label>
                      <input 
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-3 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Jatuh Tempo (Opsional)</label>
                      <input 
                        type="date"
                        value={dueDate}
                        onChange={e => setDueDate(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-3 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Keterangan (Opsional)</label>
                    <textarea 
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      placeholder="Contoh: Patungan makan siang"
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none h-20"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSave}
                  disabled={!person.trim() || !amount || addDebt.isPending}
                  className="w-full mt-6 py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {addDebt.isPending ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                  ) : 'Simpan'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
