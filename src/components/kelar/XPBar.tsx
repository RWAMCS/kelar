"use client";

import { motion } from 'motion/react';
import { useAppStore } from '@/store/app-store';

export default function XPBar() {
  const { xp, level } = useAppStore();
  const nextLevelXP = level * 1000;
  const progress = Math.min((xp / nextLevelXP) * 100, 100);

  return (
    <div className="w-full relative z-10">
      <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
        <span>Level {level}</span>
        <span>{xp} / {nextLevelXP} XP</span>
      </div>
      <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-accent to-gold rounded-full"
        />
      </div>
    </div>
  );
}
