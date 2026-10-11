'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import HumanizeWorkspace from '@/components/HumanizeWorkspace';
import HistoryDrawer from '@/components/HistoryDrawer';
import Footer from '@/components/Footer';
import { SavedHistoryItem } from '@/types';
import { Shield, BookOpen } from 'lucide-react';

export default function StudioPage() {
  const [showHistory, setShowHistory] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<SavedHistoryItem | null>(null);

  return (
    <div className="relative min-h-screen flex flex-col bg-[#FAF9FF] overflow-x-hidden selection:bg-[#EBE8FF] selection:text-[#5542E5]">
      {/* Subtle Atmospheric Lighting & Textures */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <div className="absolute -top-[12%] left-1/2 -translate-x-1/2 w-[850px] h-[550px] bg-gradient-to-b from-[#6654F5]/08 via-[#8A7CFF]/05 to-transparent rounded-full blur-[120px]" />
        <div className="absolute top-[40%] -left-[140px] w-[500px] h-[500px] bg-gradient-to-tr from-[#78B9FF]/08 via-[#6654F5]/04 to-transparent rounded-full blur-[110px]" />
        <div className="absolute top-[65%] -right-[120px] w-[550px] h-[550px] bg-gradient-to-bl from-[#8A7CFF]/07 via-[#78B9FF]/04 to-transparent rounded-full blur-[130px]" />
        <div className="absolute inset-0 bg-dot-pattern opacity-30 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />
      </div>

      {/* Dedicated Compact Studio Header */}
      <Header
        variant="studio"
        showHistory={showHistory}
        onToggleHistory={() => setShowHistory(!showHistory)}
      />

      {/* Main Studio Workspace Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4">
        {/* Compact Workspace Header */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#8E84E0]/15">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#15152B] tracking-tight">
                Writing Studio
              </h1>
              <span className="text-xs text-[#8E84E0]/40">·</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <Shield className="w-3 h-3 text-emerald-600" /> Truth Guard Active
              </span>
            </div>
            <p className="text-xs text-[#6F7088] font-normal mt-0.5">
              Refine your words without losing what matters.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#15152B] bg-white hover:bg-[#F4F2FF] border border-[#8E84E0]/25 rounded-xl shadow-2xs transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#6654F5]" />
              <span>History</span>
            </button>
          </div>
        </section>

        {/* The Live Interactive Two-Panel Workspace */}
        <section id="studio-workspace" aria-label="Writing Studio Two-Panel Workspace">
          <HumanizeWorkspace
            loadedHistoryItem={selectedHistoryItem}
            onSavedToHistory={() => {}}
          />
        </section>
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
