'use client';

import React from 'react';
import { Sparkles, Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-[#8E84E0]/15 bg-white/60 backdrop-blur-md py-8 text-xs text-[#6F7088]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#6654F5] to-[#8A7CFF] flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-[#15152B]">Humanize AI</span>
          <span className="text-[#8E84E0]/40">·</span>
          <span className="text-[#6F7088]">Make every word sound more human.</span>
        </div>

        <div className="flex items-center gap-3 text-[#9596AA] text-[11px]">
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-[#6654F5]" /> Truth Guard Protected
          </span>
          <span className="text-[#8E84E0]/40">·</span>
          <span>Google Student Club Hackathon 2026</span>
        </div>
      </div>
    </footer>
  );
}
