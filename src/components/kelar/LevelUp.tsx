"use client";

import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

export default function LevelUp({ isVisible, onDismiss }: { isVisible: boolean, onDismiss: () => void }) {
  
  useEffect(() => {
    if (isVisible) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2A9D8F', '#F4A261', '#E9C46A']
      });

      const timer = setTimeout(() => {
        onDismiss();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onDismiss]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none max-w-[430px] mx-auto"
        >
          <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl text-center border-4 border-[var(--color-gold)]">
            <h2 className="text-4xl font-black text-[var(--color-primary)] mb-2">Level Up!</h2>
            <p className="text-gray-600 font-bold mb-4">Luar biasa! Lanjutkan terus!</p>
            <div className="w-20 h-20 bg-[var(--color-gold)] rounded-full flex items-center justify-center mx-auto text-white text-3xl font-black shadow-lg">
              ✨
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
