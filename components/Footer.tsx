'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-brand-600 flex items-center justify-center text-white">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-navy-900">Humanize AI</span>
          <span className="text-slate-300">|</span>
          <span>Google Student Club Hackathon 2026</span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400">
          <span>Engineered with Next.js, Gemini AI & Firebase</span>
        </div>
      </div>
    </footer>
  );
}
