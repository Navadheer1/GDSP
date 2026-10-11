'use client';

import React from 'react';
import { WritingContext } from '@/types';
import {
  UserCheck,
  Send,
  HelpCircle,
  FileCheck,
  Briefcase,
  PenTool,
} from 'lucide-react';

interface ContextSelectorProps {
  value: WritingContext;
  onChange: (value: WritingContext) => void;
  disabled?: boolean;
}

const CONTEXT_OPTIONS: {
  id: WritingContext;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: 'recruiter-feedback',
    label: 'Recruiter Feedback',
    description: 'Empathetic, clear, and constructive candidate notes',
    icon: UserCheck,
  },
  {
    id: 'candidate-comm',
    label: 'Candidate Outreach',
    description: 'Warm, authentic recruitment engagement',
    icon: Send,
  },
  {
    id: 'interview-questions',
    label: 'Interview Questions',
    description: 'Natural, insightful questions without stiffness',
    icon: HelpCircle,
  },
  {
    id: 'interview-summary',
    label: 'Interview Summaries',
    description: 'Crisp, structured hiring panel evaluation notes',
    icon: FileCheck,
  },
  {
    id: 'professional-report',
    label: 'Professional Reports',
    description: 'Executive-ready, clear, and active-voice summaries',
    icon: Briefcase,
  },
  {
    id: 'general-writing',
    label: 'General Writing',
    description: 'Natural flow, varied cadence, zero robot tropes',
    icon: PenTool,
  },
];

export default function ContextSelector({ value, onChange, disabled }: ContextSelectorProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Target Context
        </label>
        <span className="text-[11px] text-slate-400">Where this text will be used</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {CONTEXT_OPTIONS.map((item) => {
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
              className={`p-3 rounded-xl border text-left transition relative flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 ${
                isSelected
                  ? 'border-brand-600 bg-brand-50/90 text-navy-900 shadow-xs ring-2 ring-brand-500/30'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 text-slate-700'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-xs'}`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`p-1.5 rounded-lg transition ${
                      isSelected
                        ? 'bg-brand-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  {isSelected && (
                    <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-brand-600 ring-4 ring-brand-100" />
                  )}
                </div>
                <div className="text-xs font-bold leading-tight text-navy-900 line-clamp-1">
                  {item.label}
                </div>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
