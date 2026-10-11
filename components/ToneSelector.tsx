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
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: 'professional',
    label: 'Professional',
    description: 'Articulate, authoritative, courteous, structured',
    icon: Award,
  },
  {
    id: 'polished',
    label: 'Polished',
    description: 'Crisp, punchy, elegant, modern cadence',
    icon: Sparkles,
  },
  {
    id: 'conversational',
    label: 'Conversational',
    description: 'Warm, relatable, authentic, human flow',
    icon: MessageCircle,
  },
];

export default function ToneSelector({ value, onChange, disabled }: ToneSelectorProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Target Tone
        </label>
        <span className="text-[11px] text-slate-400">Pacing and personality</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
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
              className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/80 text-navy-900 shadow-xs ring-2 ring-indigo-500/30'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 text-slate-700'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-xs'}`}
            >
              <div
                className={`p-2 rounded-lg shrink-0 transition ${
                  isSelected ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-navy-900">{item.label}</span>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 ring-4 ring-indigo-100" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 leading-normal">
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
