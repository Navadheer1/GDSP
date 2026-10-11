'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import HumanizeWorkspace from '@/components/HumanizeWorkspace';
import HowItWorks from '@/components/HowItWorks';
import Footer from '@/components/Footer';
import HistoryDrawer from '@/components/HistoryDrawer';
import { SavedHistoryItem } from '@/types';
import { Sparkles, ShieldCheck, Zap } from 'lucide-react';

export default function Home() {
  const [showHistory, setShowHistory] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<SavedHistoryItem | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <Header
        showHistory={showHistory}
        onToggleHistory={() => setShowHistory(!showHistory)}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200/80 text-brand-700 text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Built for Google Student Club Hackathon 2026</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-navy-900 tracking-tight leading-tight">
            Make every word sound <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-purple">more human.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Transform robotic, repetitive, or awkward text into natural, context-appropriate communication. Backed by <strong className="text-navy-900 font-semibold">Truth Guard</strong> to ensure every number, metric, and original meaning stays 100% accurate.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Zero Hallucination Guarantee
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-brand-600" /> Powered by Gemini AI
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Free to test without login
            </span>
          </div>
        </div>

        {/* Humanize Workspace */}
        <HumanizeWorkspace
          loadedHistoryItem={selectedHistoryItem}
          onSavedToHistory={() => {
            // Can trigger a refresh or toast notification
          }}
        />

        {/* How It Works Explainer */}
        <HowItWorks />
      </main>

      {/* History Drawer Modal */}
      <HistoryDrawer
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        onSelectHistory={(item) => setSelectedHistoryItem(item)}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
