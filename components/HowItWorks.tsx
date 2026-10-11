'use client';

import React from 'react';
import { Sparkles, Shield, Cpu, RefreshCw } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Context and Tone Analysis',
      description:
        'Analyzes your selected audience persona and tone requirements to guide vocabulary, structure, and phrasing without altering underlying intent.',
      icon: Cpu,
    },
    {
      step: '02',
      title: 'AI-Powered Rewriting',
      description:
        'Gemini models rephrase robotic patterns, clichés, and passive sentences into natural, human cadence while retaining original facts.',
      icon: Sparkles,
    },
    {
      step: '03',
      title: 'Deterministic Fact Checks',
      description:
        'Pattern-based checks compare original and rewritten text for numbers, percentages, currency, dates, and named entities to flag changes.',
      icon: Shield,
    },
    {
      step: '04',
      title: 'Independent Semantic Verification',
      description:
        'A secondary AI audit checks that core meaning, caveats, and epistemic uncertainty remain preserved without unsupported claims.',
      icon: RefreshCw,
    },
  ];

  return (
    <section className="py-12 border-t border-[#8E84E0]/15">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#8E84E0]/20 text-[11px] font-semibold text-[#6654F5] uppercase tracking-wider shadow-xs">
            Multi-Stage Architecture
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#15152B] tracking-tight">
            How Truth Guard Checks Your Text
          </h2>
          <p className="text-sm text-[#6F7088] leading-relaxed max-w-lg mx-auto">
            Preserving factual integrity by pairing deterministic regex pattern guardrails with independent semantic inspection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="group relative bg-white/70 hover:bg-white backdrop-blur-md p-6 rounded-2xl border border-[#8E84E0]/20 hover:border-[#6654F5]/35 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-10 h-10 rounded-xl bg-[#F4F2FF] border border-[#6654F5]/15 text-[#6654F5] flex items-center justify-center transition-colors group-hover:bg-[#6654F5] group-hover:text-white">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-2xl font-black text-[#8E84E0]/30 font-mono tracking-tighter group-hover:text-[#6654F5]/40 transition-colors">
                      {item.step}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#15152B] mb-2 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#6F7088] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
