"use client";

import Link from 'next/link';
import { motion } from 'motion/react';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 text-center">
      <motion.div 
        animate={{ y: [0, -15, 0], rotate: [0, -5, 5, 0] }} 
        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        className="mb-8 relative"
      >
        <div className="w-32 h-32 bg-gray-100 rounded-3xl rotate-12 absolute -z-10 blur-sm opacity-50" />
        <div className="w-32 h-32 bg-primary text-white rounded-3xl flex items-center justify-center shadow-xl rotate-3">
          <FileQuestion size={64} />
        </div>
      </motion.div>
      
      <h2 className="text-4xl font-black text-gray-800 mb-2">404</h2>
      <h3 className="text-xl font-bold text-gray-600 mb-3">Halaman Hilang Dimakan Tuyul</h3>
      <p className="text-gray-400 font-medium mb-8 max-w-xs mx-auto text-sm">
        Kayaknya kamu nyasar terlalu jauh nih. Yuk balik ke dompetmu!
      </p>
      
      <Link href="/" className="px-8 py-3 bg-[var(--color-primary)] text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
        Pulang ke Beranda
      </Link>
    </div>
  );
}
