"use client";

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { formatRupiah, parseNominal } from '@/lib/utils';
import { Target, Calendar, TrendingUp, Plus, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Goal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
}

export default function GoalCard({ 
  goal, 
  avgSaving, 
  onDelete,
  onUpdateProgress
}: { 
  goal: Goal, 
  avgSaving: number,
  onDelete: (id: string) => void,
  onUpdateProgress: (id: string, name: string) => void
}) {
  const [progress, setProgress] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    const currentProgress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
    setProgress(currentProgress);
  }, [goal]);

  useEffect(() => {
    // Fire confetti on milestone
    if (progress > 0) {
      const milestones = [25, 50, 75, 100];
      const hitMilestone = milestones.find(m => Math.abs(progress - m) < 2); // 2% buffer for UI loading
      if (hitMilestone) {
        confetti({
          particleCount: 50,
          spread: 40,
          origin: { y: 0.7 },
          colors: ['#2A9D8F', '#F4A261', '#E9C46A']
        });
      }
    }
  }, [progress]);

  // Calc deadline and monthly needed
  const today = new Date();
  let monthlyNeeded = 0;
  let monthsLeft = 0;
  let estimatedFinish = "Belum bisa diprediksi";

  if (goal.deadline) {
    const deadlineDate = new Date(goal.deadline);
    const msDiff = deadlineDate.getTime() - today.getTime();
    monthsLeft = Math.ceil(msDiff / (1000 * 60 * 60 * 24 * 30));
    
    if (monthsLeft > 0) {
      monthlyNeeded = (goal.target_amount - goal.current_amount) / monthsLeft;
    }
  }

  if (avgSaving > 0) {
    const monthsToFinish = Math.ceil((goal.target_amount - goal.current_amount) / avgSaving);
    const finishDate = new Date();
    finishDate.setMonth(today.getMonth() + monthsToFinish);
    estimatedFinish = finishDate.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
  }

  const handleDelete = async () => {
    if (confirm(`Hapus goal "${goal.name}"?`)) {
      await supabase.from('goals').delete().match({ id: goal.id });
      onDelete(goal.id);
    }
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50 flex flex-col gap-4 relative overflow-hidden">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <Target size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">{goal.name}</h3>
            <p className="text-xs text-gray-400 font-medium">{formatRupiah(goal.current_amount)} / {formatRupiah(goal.target_amount)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onUpdateProgress(goal.id, goal.name)} className="px-3 py-1.5 text-xs font-bold text-white bg-primary hover:bg-primary/90 rounded-lg shadow-sm transition-colors flex items-center gap-1">
            <Plus size={14} /> Nabung
          </button>
          <button onClick={handleDelete} className="p-1.5 text-gray-400 hover:text-danger rounded-lg bg-gray-50 hover:bg-red-50 transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-xs font-bold text-gray-800 mb-2">
          <span>Progress</span>
          <span className="text-primary">{Math.round(progress)}%</span>
        </div>
        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full rounded-full ${progress >= 100 ? 'bg-green-500' : 'bg-primary'}`}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-1 text-xs">
        {goal.deadline && (
          <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
            <Calendar size={14} className="text-gray-400" />
            <div>
              <p className="text-gray-400 font-medium">Bulan Ini</p>
              <p className="font-bold text-gray-700">{formatRupiah(monthlyNeeded)}</p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
          <TrendingUp size={14} className="text-accent" />
          <div>
            <p className="text-gray-400 font-medium">Est. Selesai</p>
            <p className="font-bold text-gray-700">{progress >= 100 ? 'Selesai!' : estimatedFinish}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
