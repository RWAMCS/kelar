"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, AlertTriangle, Lightbulb, Trophy, Activity } from 'lucide-react';

interface InsightItem {
  type: 'warning' | 'tip' | 'achievement';
  title: string;
  body: string;
}

interface InsightData {
  insights: InsightItem[];
  health_score: number;
  health_label: 'Rawan' | 'Stabil' | 'Sehat' | 'Elite';
}

export default function InsightCard() {
  const [data, setData] = useState<InsightData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchInsight();
  }, []);

  const fetchInsight = async (clear = false) => {
    if (clear) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const res = await fetch(`/api/insight${clear ? '?clear=1' : ''}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error("Failed to fetch insight");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  if (isLoading && !data) {
    return (
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 flex flex-col items-center justify-center min-h-[300px]">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, ease: 'linear', duration: 1 }} className="text-primary mb-3">
          <RefreshCw size={24} />
        </motion.div>
        <p className="text-sm font-bold text-gray-500">AI sedang memproses datamu...</p>
      </div>
    );
  }

  if (!data) return null;

  const scoreColors = {
    Rawan: 'text-danger',
    Stabil: 'text-accent',
    Sehat: 'text-primary',
    Elite: 'text-gold'
  };

  const bgColors = {
    Rawan: 'bg-danger/10',
    Stabil: 'bg-accent/10',
    Sehat: 'bg-primary/10',
    Elite: 'bg-gold/10'
  };

  return (
    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-50 relative overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center">
            <Activity size={16} />
          </div>
          <h2 className="font-bold text-gray-800">Skor Finansial AI</h2>
        </div>
        <button 
          onClick={() => fetchInsight(true)} 
          disabled={isRefreshing}
          className={`p-2 bg-gray-50 text-gray-400 hover:text-primary rounded-full transition-colors ${isRefreshing ? 'animate-spin text-primary' : ''}`}
        >
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="flex flex-col items-center mb-8">
        <div className="relative w-32 h-32 flex flex-col items-center justify-center rounded-full border-[6px] border-gray-50 shadow-inner">
          <motion.span 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-5xl font-black ${scoreColors[data.health_label]}`}
          >
            {data.health_score}
          </motion.span>
        </div>
        <div className={`mt-3 px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest ${bgColors[data.health_label]} ${scoreColors[data.health_label]}`}>
          {data.health_label}
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {data.insights.map((insight, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex gap-3 border border-gray-50 p-3 rounded-2xl shadow-sm bg-gray-50/50"
            >
              <div className="mt-1">
                {insight.type === 'warning' && <AlertTriangle size={20} className="text-danger" />}
                {insight.type === 'tip' && <Lightbulb size={20} className="text-blue-500" />}
                {insight.type === 'achievement' && <Trophy size={20} className="text-gold" />}
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-sm mb-0.5">{insight.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{insight.body}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
