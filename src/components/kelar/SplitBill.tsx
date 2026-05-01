"use client";

import { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Circle, Share2, Save, X } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

export interface SplitData {
  total: number;
  people: string[];
  tax_pct: number;
}

interface PersonState {
  name: string;
  amount: number;
  isPaid: boolean;
}

export default function SplitBill({ 
  initialData, 
  onClose,
  description
}: { 
  initialData: SplitData, 
  onClose: () => void,
  description: string
}) {
  const [total, setTotal] = useState(initialData.total || 0);
  const [taxPct, setTaxPct] = useState(initialData.tax_pct || 0);
  const [people, setPeople] = useState<PersonState[]>(
    (initialData.people || []).map(p => ({ name: p, amount: 0, isPaid: false }))
  );
  const [newPerson, setNewPerson] = useState('');
  const supabase = createClient();

  const addPerson = () => {
    if (newPerson.trim()) {
      setPeople([...people, { name: newPerson.trim(), amount: 0, isPaid: false }]);
      setNewPerson('');
    }
  };

  const removePerson = (index: number) => {
    setPeople(people.filter((_, i) => i !== index));
  };

  const togglePaid = (index: number) => {
    const updated = [...people];
    updated[index].isPaid = !updated[index].isPaid;
    setPeople(updated);
  };

  const calculateSplit = () => {
    if (people.length === 0) return 0;
    const finalTotal = total * (1 + taxPct / 100);
    // Bulatkan ke ratusan terdekat
    return Math.round((finalTotal / people.length) / 100) * 100;
  };

  const amountPerPerson = calculateSplit();

  const handleShare = async () => {
    let text = `*Tagihan Patungan: ${description || 'Makan / Nongkrong'}*\nTotal: ${formatRupiah(total)}\nPajak/Layanan: ${taxPct}%\n\n*Per orang bayar: ${formatRupiah(amountPerPerson)}*\n\nStatus:\n`;
    people.forEach(p => {
      text += `- ${p.name}: ${p.isPaid ? '✅ Lunas' : '❌ Belum'}\n`;
    });

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Split Bill KELAR',
          text: text,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      // Fallback to WhatsApp wa.me link
      const encodedUrl = encodeURIComponent(text);
      window.open(`https://wa.me/?text=${encodedUrl}`, '_blank');
    }
  };

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert('Silakan login terlebih dahulu');

    const splitDataToSave = {
      description,
      total,
      data: {
        tax_pct: taxPct,
        amount_per_person: amountPerPerson,
        participants: people
      }
    };

    const { error } = await supabase.from('split_bills').insert({
      user_id: user.id,
      description: splitDataToSave.description,
      total: splitDataToSave.total,
      data: splitDataToSave.data
    });

    if (error) {
      alert("Gagal menyimpan: " + error.message);
    } else {
      alert("Split Bill berhasil disimpan!");
      onClose();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed inset-0 z-[60] bg-white flex flex-col max-w-[430px] mx-auto overflow-hidden"
    >
      <header className="flex justify-between items-center p-4 border-b border-gray-100">
        <h2 className="font-bold text-gray-800 text-lg">Detail Patungan</h2>
        <button onClick={onClose} className="p-2 bg-gray-100 rounded-full"><X size={20}/></button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="bg-gray-50 p-4 rounded-2xl space-y-4 border border-gray-100">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Total Tagihan (Rp)</label>
            <input 
              type="number" 
              value={total || ''} 
              onChange={e => setTotal(Number(e.target.value))}
              className="w-full bg-white border border-gray-200 rounded-xl p-3 font-bold text-gray-800"
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Pajak / Servis (%)</label>
            <input 
              type="number" 
              value={taxPct || ''} 
              onChange={e => setTaxPct(Number(e.target.value))}
              className="w-full bg-white border border-gray-200 rounded-xl p-3 font-bold text-gray-800"
              placeholder="0"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Peserta Patungan</label>
          <div className="flex gap-2 mb-3">
            <input 
              type="text" 
              value={newPerson}
              onChange={e => setNewPerson(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addPerson()}
              className="flex-1 bg-white border border-gray-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
              placeholder="Tambah nama..."
            />
            <button onClick={addPerson} className="bg-primary text-white rounded-xl px-4 font-bold text-sm">Add</button>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {people.map((p, i) => (
              <div key={i} className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-sm flex gap-2 items-center font-medium border border-primary/20">
                {p.name}
                <button onClick={() => removePerson(i)} className="text-primary hover:text-danger">&times;</button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-primary-dark text-white p-5 rounded-2xl shadow-lg">
          <p className="text-white/80 text-sm font-medium mb-1">Per Orang Bayar</p>
          <h3 className="text-3xl font-black text-gold mb-4">{formatRupiah(amountPerPerson)}</h3>
          
          <div className="space-y-3">
            {people.map((p, i) => (
              <div key={i} className="flex justify-between items-center bg-white/10 p-3 rounded-xl cursor-pointer hover:bg-white/20 transition-colors" onClick={() => togglePaid(i)}>
                <span className="font-bold">{p.name}</span>
                <div className="flex gap-2 items-center">
                  <span className={`text-xs px-2 py-1 rounded-md font-bold ${p.isPaid ? 'bg-green-500/20 text-green-300' : 'bg-danger/20 text-danger'}`}>
                    {p.isPaid ? 'Lunas' : 'Belum'}
                  </span>
                  {p.isPaid ? <CheckCircle2 size={20} className="text-green-400" /> : <Circle size={20} className="text-white/40" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-100 flex gap-3 bg-white pb-safe">
        <button onClick={handleShare} className="flex-1 bg-green-50 text-green-700 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-green-100 transition-colors">
          <Share2 size={20} /> Share
        </button>
        <button onClick={handleSave} className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors">
          <Save size={20} /> Simpan
        </button>
      </div>
    </motion.div>
  );
}
