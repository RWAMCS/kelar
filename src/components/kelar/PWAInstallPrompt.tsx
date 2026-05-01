"use client";

import { useEffect, useState } from "react";
import { Download, Smartphone, Share, PlusSquare, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // Capture beforeinstallprompt for Android/Chrome
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    if (!deferredPrompt) {
      alert("Browser Anda belum mendeteksi aplikasi sebagai PWA. Pastikan koneksi stabil dan gunakan Chrome/Edge.");
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  if (isStandalone) return null;

  return (
    <>
      <div className="px-5 mt-6">
        <h2 className="text-[15px] font-black text-gray-900 mb-3">Aplikasi Kelar</h2>
        <button 
          onClick={handleInstallClick}
          className="w-full bg-primary text-white p-4 rounded-2xl flex items-center gap-4 shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform"
        >
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Smartphone size={20} />
          </div>
          <div className="flex-1 text-left">
            <p className="font-black text-sm">Instal Aplikasi</p>
            <p className="text-[11px] text-white/70">Akses lebih cepat & tanpa bar browser</p>
          </div>
          <Download size={20} />
        </button>
      </div>

      {/* iOS Instructions Modal */}
      <AnimatePresence>
        {showIOSInstructions && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowIOSInstructions(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm bg-white rounded-[32px] p-6 shadow-2xl overflow-hidden"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <Smartphone size={24} />
                </div>
                <button onClick={() => setShowIOSInstructions(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <h3 className="text-xl font-black text-gray-900 mb-2">Instal di iPhone</h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Safari di iOS tidak mendukung tombol instal langsung. Ikuti langkah mudah ini:
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs">1</div>
                  <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    Tekan tombol <Share size={18} className="text-blue-500" /> (Share) di bawah
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs">2</div>
                  <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    Pilih <PlusSquare size={18} /> <span className="text-gray-900 font-black">"Add to Home Screen"</span>
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs">3</div>
                  <p className="text-sm font-bold text-gray-700">
                    Klik <span className="text-blue-500 font-black">"Add"</span> di pojok kanan atas
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setShowIOSInstructions(false)}
                className="w-full mt-8 py-4 bg-gray-900 text-white font-bold rounded-2xl active:scale-[0.98] transition-transform"
              >
                Mengerti
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
