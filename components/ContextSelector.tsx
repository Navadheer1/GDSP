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
  ChevronDown,
} from 'lucide-react';

interface ContextSelectorProps {
  value: WritingContext;
  onChange: (value: WritingContext) => void;
  disabled?: boolean;
}

export const CONTEXT_OPTIONS: {
  id: WritingContext;
  label: string;
  shortLabel: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: 'recruiter-feedback',
    label: 'Recruiter Feedback',
    shortLabel: 'Recruiter Feedback',
    description: 'Empathetic, clear, and constructive candidate notes',
    icon: UserCheck,
  },
  {
    id: 'candidate-comm',
    label: 'Candidate Outreach',
    shortLabel: 'Outreach & Comm',
    description: 'Warm, authentic recruitment engagement',
    icon: Send,
  },
  {
    id: 'interview-questions',
    label: 'Interview Questions',
    shortLabel: 'Interview Questions',
    description: 'Natural, insightful questions without stiffness',
    icon: HelpCircle,
  },
  {
    id: 'interview-summary',
    label: 'Interview Summaries',
    shortLabel: 'Interview Summary',
    description: 'Crisp, structured hiring panel evaluation notes',
    icon: FileCheck,
  },
  {
    id: 'professional-report',
    label: 'Professional Reports',
    shortLabel: 'Executive Report',
    description: 'Executive-ready, clear, and active-voice summaries',
    icon: Briefcase,
  },
  {
    id: 'general-writing',
    label: 'General Writing',
    shortLabel: 'General Writing',
    description: 'Natural flow, varied cadence, zero robot tropes',
    icon: PenTool,
  },
];

export default function ContextSelector({ value, onChange, disabled }: ContextSelectorProps) {
  const currentOption = CONTEXT_OPTIONS.find((opt) => opt.id === value) || CONTEXT_OPTIONS[0];
  const Icon = currentOption.icon;

  return (
    <div className="w-full space-y-1">
      <div className="flex items-center justify-between">
        <label htmlFor="context-select-dropdown" className="text-[11px] font-bold text-[#6F7088] uppercase tracking-wider">
          Context
        </label>
        <span className="text-[11px] text-[#9596AA] hidden sm:inline truncate max-w-[170px]" title={currentOption.description}>
          {currentOption.description}
        </span>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6654F5]">
          <Icon className="w-4 h-4" />
        </div>

        <select
          id="context-select-dropdown"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value as WritingContext)}
          className="w-full appearance-none pl-9 pr-9 py-2 bg-white hover:bg-[#FAF9FF] border border-[#8E84E0]/25 rounded-xl text-xs font-semibold text-[#15152B] focus:outline-none focus:ring-2 focus:ring-[#6654F5]/30 focus:border-[#6654F5] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
        >
          {CONTEXT_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id} className="text-[#15152B] font-medium py-1">
              {opt.label} — {opt.description}
            </option>
          ))}
        </select>

        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#9596AA]">
          <ChevronDown className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}
