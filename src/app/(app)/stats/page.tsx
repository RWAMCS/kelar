"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { formatRupiah } from '@/lib/utils';
import CategoryIcon from '@/components/kelar/CategoryIcon';
import EmptyState from '@/components/kelar/EmptyState';
import { useTransactions } from '@/hooks/use-transactions';
import { TrendingDown, TrendingUp, ArrowRight } from 'lucide-react';

type Period = 'Minggu' | 'Bulan' | '3 Bulan';

function periodStart(period: Period): string {
  const d = new Date();
  if (period === 'Minggu') d.setDate(d.getDate() - 7);
  else if (period === 'Bulan') d.setDate(1);
  else d.setMonth(d.getMonth() - 3);
  return d.toISOString().slice(0, 10);
}

export default function StatsPage() {
  const [tab, setTab] = useState<Period>('Bulan');
  const router = useRouter();

  const { data: transactions = [], isLoading } = useTransactions(1000);

  const { byCategory, byWeek, totalExpense, totalIncome, totalTransactions } = useMemo(() => {
    const start = periodStart(tab);
    const filtered = transactions.filter((tx: any) => tx.date >= start);
    
    let tExpense = 0;
    let tIncome = 0;
    const catMap: Record<string, number> = {};
    const weekMap: Record<string, { income: number; expense: number }> = {};
    
    filtered.forEach((tx: any) => {
      if (tx.type === 'expense') {
        tExpense += tx.amount;
        const cat = tx.category || 'other';
        catMap[cat] = (catMap[cat] || 0) + tx.amount;
      } else if (tx.type === 'income') {
        tIncome += tx.amount;
      }
      
      const date = new Date(tx.date);
      const weekNum = Math.ceil(date.getDate() / 7);
      const key = `Mg ${weekNum}`;
      if (!weekMap[key]) weekMap[key] = { income: 0, expense: 0 };
      if (tx.type === 'income') weekMap[key].income += tx.amount;
      if (tx.type === 'expense') weekMap[key].expense += tx.amount;
    });

    const CATEGORY_COLORS: Record<string, string> = {
      makanan: '#F4A261', minuman: '#D4A574', food: '#F4A261',
      transportasi: '#2A9D8F', transport: '#2A9D8F',
      'kebutuhan rumah': '#5C6BC0', 'kebutuhan pribadi': '#EC407A',
      belanja: '#E76F51', shopping: '#E76F51',
      tagihan: '#E9C46A', bills: '#E9C46A',
      hobi: '#9B5DE5', hiburan: '#9B5DE5', entertainment: '#9B5DE5',
      kesehatan: '#00BBF9', health: '#00BBF9',
      'servis kendaraan': '#78909C',
      investasi: '#26A69A', gaji: '#66BB6A', jualan: '#26C6DA', pemberian: '#AB47BC',
      transfer: '#90A4AE', other: '#A8A8A8', lainnya: '#A8A8A8',
    };

    const byCat = Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, value]) => ({
        name: cat.charAt(0).toUpperCase() + cat.slice(1),
        value,
        color: CATEGORY_COLORS[cat.toLowerCase()] || '#A8A8A8',
        iconCategory: cat,
      }));

    const byWk = Object.entries(weekMap).map(([name, vals]) => ({ name, ...vals }));
    
    return {
      byCategory: byCat,
      byWeek: byWk,
      totalExpense: tExpense,
      totalIncome: tIncome,
      totalTransactions: filtered.length
    };
  }, [transactions, tab]);

  const topCategories = byCategory.slice(0, 5);
  const maxCat = topCategories[0]?.value || 1;
  const isNotEnoughData = totalTransactions === 0;
  const netFlow = totalIncome - totalExpense;

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-5 pt-4 pb-4">
        <h1 className="text-[22px] font-black text-gray-900">Statistik</h1>
        <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-widest mt-0.5">Analisis keuanganmu</p>
      </div>

      {/* Period tabs */}
      <div className="px-5 mb-5">
        <div className="bg-gray-50 p-1 rounded-2xl flex">
          {(['Minggu', 'Bulan', '3 Bulan'] as Period[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl text-center transition-all ${
                tab === t ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="px-5 space-y-4">
          {[180, 180, 140].map((h, i) => (
            <div key={i} className="bg-gray-50 rounded-2xl animate-pulse" style={{ height: h }} />
          ))}
        </div>
      ) : isNotEnoughData ? (
        <div className="px-5">
          <EmptyState 
            icon="📊" 
            title="Belum cukup data" 
            subtitle="Minimal butuh 1 transaksi dalam periode ini." 
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary cards */}
          <div className="px-5 grid grid-cols-2 gap-3">
            <div className="bg-white border border-gray-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center">
                  <TrendingDown size={14} className="text-red-400" />
                </div>
                <span className="text-[11px] text-gray-400 font-bold uppercase">Pengeluaran</span>
              </div>
              <p className="text-lg font-black text-gray-900">{formatRupiah(totalExpense)}</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <TrendingUp size={14} className="text-emerald-500" />
                </div>
                <span className="text-[11px] text-gray-400 font-bold uppercase">Pemasukan</span>
              </div>
              <p className="text-lg font-black text-gray-900">{formatRupiah(totalIncome)}</p>
            </div>
          </div>

          {/* Donut chart */}
          {byCategory.length > 0 && (
            <div className="px-5">
              <section className="bg-white border border-gray-100 p-5 rounded-2xl">
                <h2 className="text-[13px] font-black text-gray-900 mb-4">Distribusi Pengeluaran</h2>
                <div className="h-48 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={byCategory} innerRadius={58} outerRadius={80} paddingAngle={3} dataKey="value">
                        {byCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] text-gray-400 font-semibold uppercase">Total</span>
                    <span className="text-base font-black text-gray-900">{formatRupiah(totalExpense)}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center mt-3">
                  {byCategory.map(c => (
                    <div key={c.name} className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.color }} />
                      {c.name}
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* Bar chart */}
          {byWeek.length > 0 && (
            <div className="px-5">
              <section className="bg-white border border-gray-100 p-5 rounded-2xl">
                <h2 className="text-[13px] font-black text-gray-900 mb-4">Pemasukan vs Pengeluaran</h2>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={byWeek} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(value: number) => formatRupiah(value)} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                      <Bar dataKey="income" fill="#2A9D8F" radius={[4, 4, 0, 0]} maxBarSize={24} name="Pemasukan" />
                      <Bar dataKey="expense" fill="#E76F51" radius={[4, 4, 0, 0]} maxBarSize={24} name="Pengeluaran" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>
            </div>
          )}

          {/* Top categories */}
          {topCategories.length > 0 && (
            <div className="px-5">
              <section className="bg-white border border-gray-100 rounded-2xl p-5">
                <h2 className="text-[13px] font-black text-gray-900 mb-4">Top Kategori</h2>
                <div className="space-y-4">
                  {topCategories.map(cat => (
                    <div key={cat.name} className="flex items-center gap-3">
                      <CategoryIcon category={cat.iconCategory} type="expense" />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between mb-1">
                          <p className="text-[13px] font-bold text-gray-800">{cat.name}</p>
                          <p className="text-[13px] font-black text-red-400">{formatRupiah(cat.value)}</p>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${Math.round((cat.value / maxCat) * 100)}%`, background: cat.color }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* Lihat Riwayat */}
          <div className="px-5 pt-1">
            <button 
              onClick={() => router.push('/transactions')}
              className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              style={{ background: 'linear-gradient(135deg, #2A9D8F, #21867A)', color: '#fff' }}
            >
              Lihat Riwayat Lengkap <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
