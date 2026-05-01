'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatRupiah, parseNominal } from '@/lib/utils';
import { X, Plus, Share2, Save, CheckCircle2, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Person {
  id: string;
  name: string;
  customAmount: number | null;
  hasPaid: boolean;
}

export default function SplitBillPage() {
  const router = useRouter();
  
  const [description, setDescription] = useState('');
  const [totalAmountStr, setTotalAmountStr] = useState('');
  const [taxPercentStr, setTaxPercentStr] = useState('0');
  const [people, setPeople] = useState<Person[]>([]);
  const [isEqualSplit, setIsEqualSplit] = useState(true);
  const [newPersonName, setNewPersonName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const totalAmount = parseNominal(totalAmountStr) || 0;
  const taxPercent = parseFloat(taxPercentStr) || 0;

  const addPerson = () => {
    if (!newPersonName.trim()) return;
    setPeople([...people, { id: Date.now().toString(), name: newPersonName.trim(), customAmount: null, hasPaid: false }]);
    setNewPersonName('');
  };

  const removePerson = (id: string) => {
    setPeople(people.filter(p => p.id !== id));
  };

  const updateCustomAmount = (id: string, val: string) => {
    setPeople(people.map(p => p.id === id ? { ...p, customAmount: parseNominal(val) || null } : p));
  };

  const togglePaid = (id: string) => {
    setPeople(people.map(p => p.id === id ? { ...p, hasPaid: !p.hasPaid } : p));
  };

  const results = useMemo(() => {
    const subtotal = totalAmount;
    const taxAmount = subtotal * (taxPercent / 100);
    const grandTotal = subtotal + taxAmount;
    
    let allocatedCustom = 0;
    if (!isEqualSplit) {
      allocatedCustom = people.reduce((sum, p) => sum + (p.customAmount || 0), 0);
    }

    const calculatedPeople = people.map(p => {
      let pSubtotal = 0;
      if (isEqualSplit) {
        pSubtotal = people.length > 0 ? subtotal / people.length : 0;
      } else {
        pSubtotal = p.customAmount || 0;
      }
      
      const pTax = pSubtotal * (taxPercent / 100);
      const pTotal = pSubtotal + pTax;
      
      return {
        ...p,
        subtotal: Math.round(pSubtotal),
        tax: Math.round(pTax),
        total: Math.round(pTotal)
      };
    });

    const sumTotal = calculatedPeople.reduce((sum, p) => sum + p.total, 0);

    return {
      subtotal,
      taxAmount: Math.round(taxAmount),
      grandTotal: Math.round(grandTotal),
      allocatedCustom,
      calculatedPeople,
      sumTotal
    };
  }, [totalAmount, taxPercent, people, isEqualSplit]);

  const paidCount = people.filter(p => p.hasPaid).length;

  const handleSave = async () => {
    if (!description.trim() || totalAmount <= 0 || people.length === 0) {
      alert('Harap lengkapi deskripsi, total tagihan, dan nama anggota.');
      return;
    }

    setIsSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const splitData = {
        subtotal: results.subtotal,
        taxPercent,
        isEqualSplit,
        people: results.calculatedPeople
      };

      const { error } = await supabase.from('split_bills').insert({
        user_id: user.id,
        description,
        total_amount: results.grandTotal,
        data: splitData // Menyimpan detail sebagai JSON di kolom data
      });

      if (error) throw error;
      alert('Data Split Bill berhasil disimpan!');
      router.push('/');
    } catch (e: any) {
      console.error(e);
      alert('Gagal menyimpan: pastikan tabel split_bills sudah menerima insert dengan benar.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShareWa = () => {
    if (!description.trim() || people.length === 0) return;
    
    let text = `*Tagihan: ${description}*\n`;
    text += `Total: *${formatRupiah(results.grandTotal)}*\n\n`;
    text += `Rincian per orang:\n`;
    
    results.calculatedPeople.forEach(p => {
      const status = p.hasPaid ? '✅ Lunas' : '❌ Belum';
      text += `- ${p.name}: ${formatRupiah(p.total)} (${status})\n`;
    });
    
    text += `\nYuk segera dilunasin ya! 🙏`;
    
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="p-4 space-y-6 pb-24 max-w-[430px] mx-auto bg-surface min-h-screen">
      <header className="flex items-center gap-3 pt-2">
        <button onClick={() => router.back()} className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-600">
          <X size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Split Bill</h1>
      </header>

      {/* SECTION 1 - Input Dasar */}
      <section className="bg-white p-5 rounded-3xl shadow-sm border border-gray-50 space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Deskripsi</label>
          <input 
            type="text" 
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Makan siang kantor..."
            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Total Tagihan (Subtotal)</label>
          <input 
            type="number" 
            value={totalAmountStr}
            onChange={e => setTotalAmountStr(e.target.value)}
            placeholder="Contoh: 150000"
            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xl font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Pajak / Layanan (%)</label>
            <input 
              type="number" 
              value={taxPercentStr}
              onChange={e => setTaxPercentStr(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Mode Pembagian</label>
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button 
                onClick={() => setIsEqualSplit(true)} 
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${isEqualSplit ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}
              >
                Rata
              </button>
              <button 
                onClick={() => setIsEqualSplit(false)} 
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${!isEqualSplit ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}
              >
                Custom
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 - Daftar Orang */}
      <section className="bg-white p-5 rounded-3xl shadow-sm border border-gray-50 space-y-4">
        <h2 className="text-sm font-bold text-gray-800">Anggota ({people.length} orang)</h2>
        
        <div className="flex gap-2">
          <input 
            type="text" 
            value={newPersonName}
            onChange={e => setNewPersonName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addPerson(); }}
            placeholder="Nama anggota..."
            className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button 
            onClick={addPerson}
            disabled={!newPersonName.trim()}
            className="bg-primary text-white w-12 rounded-xl flex items-center justify-center hover:bg-primary/90 disabled:opacity-50"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="space-y-3 pt-2">
          <AnimatePresence>
            {people.map(p => (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                exit={{ opacity: 0, height: 0 }}
                key={p.id} 
                className="flex items-center gap-3 overflow-hidden"
              >
                <div className="flex-1 flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="font-bold text-gray-700 text-sm">{p.name}</span>
                  {!isEqualSplit && (
                    <input 
                      type="number"
                      value={p.customAmount || ''}
                      onChange={e => updateCustomAmount(p.id, e.target.value)}
                      placeholder="Nominal"
                      className="w-28 text-right bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-bold text-gray-800 focus:outline-none focus:border-primary/50"
                    />
                  )}
                </div>
                <button 
                  onClick={() => removePerson(p.id)}
                  className="w-10 h-10 flex items-center justify-center text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                >
                  <X size={16} strokeWidth={3} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* SECTION 3 & 4 - Hasil Kalkulasi & Status */}
      {people.length > 0 && totalAmount > 0 && (
        <section className="bg-primary-dark p-5 rounded-3xl shadow-lg space-y-4 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
          
          <div className="flex justify-between items-end border-b border-white/10 pb-4 relative z-10">
            <div>
              <p className="text-white/60 text-xs font-bold uppercase tracking-wide mb-1">Grand Total</p>
              <h2 className="text-3xl font-black">{formatRupiah(results.grandTotal)}</h2>
            </div>
            <div className="text-right">
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-wide mb-1">Pajak ({taxPercent}%)</p>
              <p className="text-sm font-bold">+{formatRupiah(results.taxAmount)}</p>
            </div>
          </div>

          <div className="space-y-3 relative z-10 pt-2">
            {results.calculatedPeople.map(p => (
              <div key={p.id} className="flex items-center justify-between gap-3 bg-white/5 p-3 rounded-2xl border border-white/10">
                <button 
                  onClick={() => togglePaid(p.id)}
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${p.hasPaid ? 'bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-white/10 text-white/40'}`}
                >
                  {p.hasPaid ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{p.name}</p>
                  <p className="text-[10px] text-white/50">{formatRupiah(p.subtotal)} + pajak {formatRupiah(p.tax)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-[var(--color-gold)]">{formatRupiah(p.total)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-between items-center text-xs font-medium text-white/70 relative z-10">
            <span>Status: {paidCount} dari {people.length} lunas</span>
            {(!isEqualSplit && results.allocatedCustom !== results.subtotal) && (
              <span className="text-red-400 font-bold">Selisih: {formatRupiah(Math.abs(results.subtotal - results.allocatedCustom))}</span>
            )}
          </div>
        </section>
      )}

      {/* SECTION 5 - Action Buttons */}
      <div className="flex gap-3 pt-2">
        <button 
          onClick={handleShareWa}
          disabled={people.length === 0 || totalAmount <= 0}
          className="flex-1 py-4 bg-green-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-green-600 transition-colors shadow-sm disabled:opacity-50"
        >
          <Share2 size={18} /> WhatsApp
        </button>
        <button 
          onClick={handleSave}
          disabled={people.length === 0 || totalAmount <= 0 || isSaving}
          className="flex-1 py-4 bg-primary text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
        >
          {isSaving ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" /> : <><Save size={18} /> Simpan</>}
        </button>
      </div>
    </div>
  );
}
