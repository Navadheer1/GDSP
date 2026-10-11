'use client';

import React from 'react';
import { WritingTone } from '@/types';
import { Award, Sparkles, MessageCircle } from 'lucide-react';

interface ToneSelectorProps {
  value: WritingTone;
  onChange: (value: WritingTone) => void;
  disabled?: boolean;
}

const TONE_OPTIONS: {
  id: WritingTone;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: 'professional',
    label: 'Professional',
    icon: Award,
  },
  {
    id: 'polished',
    label: 'Polished',
    icon: Sparkles,
  },
  {
    id: 'conversational',
    label: 'Conversational',
    icon: MessageCircle,
  },
];

export default function ToneSelector({ value, onChange, disabled }: ToneSelectorProps) {
  return (
    <div className="w-full space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold text-[#6F7088] uppercase tracking-wider">
          Tone
        </label>
        <span className="text-[11px] text-[#9596AA]">
          {value === 'professional' && 'Articulate & structured'}
          {value === 'polished' && 'Crisp & modern'}
          {value === 'conversational' && 'Warm & relatable'}
        </span>
      </div>

      <div
        role="radiogroup"
        aria-label="Target Tone"
        className="grid grid-cols-3 gap-1 bg-[#F4F2FF] p-1 rounded-xl border border-[#8E84E0]/20"
      >
        {TONE_OPTIONS.map((item) => {
          const Icon = item.icon;
          const isSelected = value === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => onChange(item.id)}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6654F5] ${
                isSelected
                  ? 'bg-white text-[#6654F5] shadow-xs border border-[#8E84E0]/20 font-bold'
                  : 'text-[#6F7088] hover:text-[#15152B] hover:bg-white/60'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#6654F5]' : 'text-[#6F7088]'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
