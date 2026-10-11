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
  onChange: (val: WritingContext) => void;
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

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {CONTEXT_OPTIONS.map((item) => {
          const Icon = item.icon;
          const isSelected = value === item.id;
          return (
            <button
              key={item.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(item.id)}
              className={`p-3 rounded-xl border text-left transition relative flex flex-col justify-between ${
                isSelected
                  ? 'border-brand-500 bg-brand-50/70 text-navy-900 shadow-sm ring-1 ring-brand-500'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div
                    className={`p-1.5 rounded-lg ${
                      isSelected ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                  )}
                </div>
                <div className="text-xs font-semibold leading-tight line-clamp-1">{item.label}</div>
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
