'use client';

import React from 'react';
import { Sparkles, ShieldCheck, Cpu, RefreshCw } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Context & Tone Alignment',
      description:
        'Select your audience persona—from constructive recruiter feedback to executive reports—ensuring appropriate vocabulary and phrasing.',
      icon: Cpu,
    },
    {
      step: '02',
      title: 'Gemini Natural Language Synthesis',
      description:
        'Google Gemini reformulates stiff phrasing into dynamic human rhythm, eliminating corporate buzzwords, excessive hedging, and robotic clichés.',
      icon: Sparkles,
    },
    {
      step: '03',
      title: 'Deterministic Verification',
      description:
        'Truth Guard scans every number, percentage, date, and proper noun to strictly guarantee zero factual drift from your original text.',
      icon: ShieldCheck,
    },
    {
      step: '04',
      title: 'AI Semantic Audit',
      description:
        'A secondary independent semantic pass verifies that the core meaning, uncertainty levels, and original claims remain 100% intact.',
      icon: RefreshCw,
    },
  ];

  return (
    <section className="py-12 border-t border-slate-200/80 bg-white/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-navy-900 tracking-tight">
            How Truth Guard Ensures Absolute Accuracy
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            The only text humanizer engineered with verifiable factual safeguards and zero meaning loss.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-black text-slate-300 font-mono">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-navy-900 mb-1.5">{item.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
