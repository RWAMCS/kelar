"use client";

import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 text-center">
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-[var(--color-primary)] mb-6">
        <AlertCircle size={40} />
      </div>
      <h2 className="text-2xl font-black text-gray-800 mb-2">Waduh, Kesandung!</h2>
      <p className="text-gray-500 font-medium mb-8 max-w-xs mx-auto text-sm">
        Sistem kita lagi nyangkut sedikit. Coba segarkan lagi ya!
      </p>
      <button
        onClick={() => reset()}
        className="px-8 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] transition-colors text-white rounded-2xl font-bold shadow-lg"
      >
        Coba Lagi
      </button>
    </div>
  );
}
