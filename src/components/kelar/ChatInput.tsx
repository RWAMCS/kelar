"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Send, X } from 'lucide-react';
import ConfirmSheet, { ParsedTransaction } from './ConfirmSheet';
import { useWallets } from '@/hooks/use-wallet';
import { useAddTransaction } from '@/hooks/use-transactions';

interface ChatInputProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

export default function ChatInput({ isOpen, onClose }: ChatInputProps) {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [pendingTransaction, setPendingTransaction] = useState<ParsedTransaction | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: wallets = [] } = useWallets();
  const addTransaction = useAddTransaction();

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Auto-resize
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputText]);

  // Clear state when closed
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setMessages([]);
        setInputText('');
        setPendingTransaction(null);
      }, 300);
    }
  }, [isOpen]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: userText }]);
    setInputText('');
    setIsLoading(true);

    try {
      const walletNames = wallets.map(w => w.name);
      const res = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: userText, wallets: walletNames })
      });
      const parsed = await res.json();
      
      const parsedData = parsed.data || parsed;
      
      if (parsed.needs_confirm || parsedData.type === 'expense' || parsedData.type === 'transfer') {
        setPendingTransaction(parsedData);
      } else {
        // Find default wallet
        const defaultWalletId = wallets.find(w => w.name.toLowerCase() === parsedData.wallet?.toLowerCase())?.id || wallets[0]?.id;
        if (!defaultWalletId) {
          setPendingTransaction(parsedData); // force confirm if no wallet
        } else {
          const { needs_confirm, wallet, wallet_name, new_wallet, confidence, ...validData } = parsedData;
          await addTransaction.mutateAsync({
            ...validData,
            wallet_id: defaultWalletId,
            type: validData.type || 'income'
          });
          onClose();
        }
      }
    } catch (e: any) {
      setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'ai', text: `Error: ${e.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: '📸 Mengunggah struk...' }]);
    setIsLoading(true);

    try {
      const base64 = await fileToBase64(file);
      const res = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, mode: 'receipt' })
      });
      const parsed = await res.json();
      const parsedData = parsed.data || parsed;
      setPendingTransaction(parsedData); // Selalu tampilkan konfirmasi untuk struk
    } catch (e: any) {
      setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'ai', text: `Error: ${e.message}` }]);
    } finally {
      setIsLoading(false);
      e.target.value = ''; // reset file input
    }
  };

  const handleConfirmSave = async (tx: any) => {
    try {
      await addTransaction.mutateAsync(tx);
      setPendingTransaction(null);
      onClose();
    } catch (e: any) {
      setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'ai', text: `Gagal simpan: ${e.message}` }]);
      setPendingTransaction(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-[60] bg-[var(--color-surface)] flex flex-col mx-auto max-w-[430px] shadow-2xl"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-4 py-3 bg-white border-b border-gray-100 flex-shrink-0">
            <h2 className="font-bold text-gray-800">Tambah Transaksi</h2>
            <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200">
              <X size={18} />
            </button>
          </div>

          {/* Chat Bubble Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 relative">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center py-8 space-y-2">
                <span className="text-5xl">💬</span>
                <p className="text-gray-500 font-medium">Ketik transaksi atau foto struk</p>
              </div>
            )}

            {messages.map(m => (
              <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  m.sender === 'user' ? 'bg-primary text-white rounded-tr-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5 shadow-sm">
                  <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-2 h-2 bg-gray-400 rounded-full" />
                  <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.15 }} className="w-2 h-2 bg-gray-400 rounded-full" />
                  <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.3 }} className="w-2 h-2 bg-gray-400 rounded-full" />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
            
            {/* Overlay if pendingTransaction is active */}
            {pendingTransaction && (
              <div className="absolute inset-0 bg-black/20 z-[65] backdrop-blur-sm" />
            )}
          </div>

          {/* Input Bar */}
          <div className="flex-shrink-0 bg-white border-t border-gray-100 px-3 py-3 flex items-end gap-2 pb-safe-bottom">
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              className="hidden" 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors flex-shrink-0"
            >
              <Camera size={22} />
            </button>
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Contoh: Beli kopi 25k pakai gopay"
              className="flex-1 max-h-[120px] bg-gray-50 rounded-2xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none text-sm font-medium border border-transparent transition-all"
              rows={1}
              disabled={isLoading || !!pendingTransaction}
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || isLoading || !!pendingTransaction}
              className="p-2.5 bg-primary text-white rounded-xl flex-shrink-0 hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Send size={20} />
            </button>
          </div>

          {/* Bottom Sheet for Confirmation */}
          <ConfirmSheet 
            transaction={pendingTransaction}
            wallets={wallets}
            onConfirm={handleConfirmSave}
            onCancel={() => setPendingTransaction(null)}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
