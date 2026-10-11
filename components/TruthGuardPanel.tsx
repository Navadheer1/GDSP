'use client';

import React, { useState } from 'react';
import { TruthGuardResult } from '@/types';
import {
  Shield,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  HelpCircle,
  Binary,
  Calendar,
  Layers,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface TruthGuardPanelProps {
  truthGuard: TruthGuardResult | null;
  loading?: boolean;
}

export default function TruthGuardPanel({ truthGuard, loading }: TruthGuardPanelProps) {
  const [detailsExpanded, setDetailsExpanded] = useState(false);

  if (loading) {
    return (
      <div className="bg-[#FAF9FF] rounded-2xl border border-[#8E84E0]/20 p-4 space-y-2.5 animate-pulse">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#6654F5]" />
          <span className="text-xs font-semibold text-[#15152B]">
            Truth Guard active: verifying numbers, entities & semantic nuance...
          </span>
        </div>
        <div className="space-y-1.5 pt-1">
          <div className="h-2 bg-[#EBE8FF] rounded w-3/4" />
          <div className="h-2 bg-[#EBE8FF] rounded w-1/2" />
        </div>
      </div>
    );
  }

  // Before checks run: do not show verification success or empty reports
  if (!truthGuard) {
    return null;
  }

  const { score, summary, deterministicChecks, semanticVerification } = truthGuard;

  // Icon selector based on category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'numbers':
        return <Binary className="w-3.5 h-3.5" />;
      case 'dates':
        return <Calendar className="w-3.5 h-3.5" />;
      case 'entities':
        return <Layers className="w-3.5 h-3.5" />;
      default:
        return <Sparkles className="w-3.5 h-3.5" />;
    }
  };

  const getStatusBadge = (status: 'verified' | 'warning' | 'failed' | 'incomplete') => {
    switch (status) {
      case 'verified':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          badgeText: 'bg-emerald-100 text-emerald-800',
          label: 'Verified',
          icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />,
        };
      case 'warning':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          badgeText: 'bg-amber-100 text-amber-800',
          label: 'Advisory Warning',
          icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
        };
      case 'failed':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          badgeText: 'bg-rose-100 text-rose-800',
          label: 'Discrepancy Detected',
          icon: <XCircle className="w-4 h-4 text-rose-600" />,
        };
      case 'incomplete':
      default:
        return {
          bg: 'bg-slate-100 text-slate-800 border-slate-200',
          badgeText: 'bg-slate-200 text-slate-800',
          label: 'Audit Incomplete',
          icon: <Info className="w-4 h-4 text-slate-600" />,
        };
    }
  };

  const statusBadge = getStatusBadge(truthGuard.status);
  const passedCount = deterministicChecks.filter((c) => c.status === 'passed').length;
  const issueCount = deterministicChecks.filter((c) => c.status !== 'passed').length;

  return (
    <div className={`rounded-2xl border ${statusBadge.bg} p-4 transition-all space-y-3`}>
      {/* Compact Header Summary */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="mt-0.5 shrink-0">{statusBadge.icon}</div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-[#15152B]">
                Truth Guard Audit
              </span>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${statusBadge.badgeText}`}
              >
                {statusBadge.label}
              </span>
            </div>
            <p className="text-xs text-[#15152B]/85 mt-0.5 leading-relaxed">
              {summary}
            </p>
          </div>
        </div>

        {/* Fidelity Index Indicator */}
        <div className="shrink-0 text-right bg-white/70 px-2.5 py-1 rounded-xl border border-black/5 shadow-2xs">
          <span className="text-[9px] uppercase font-bold text-[#6F7088] block">Fidelity</span>
          <span
            className={`text-sm font-black ${
              truthGuard.status === 'incomplete'
                ? 'text-amber-600'
                : score >= 85
                ? 'text-emerald-700'
                : score >= 70
                ? 'text-amber-700'
                : 'text-rose-700'
            }`}
          >
            {truthGuard.status === 'incomplete' ? `${score}%*` : `${score}%`}
          </span>
        </div>
      </div>

      {/* Semantic Check Summary */}
      <div className="p-3 bg-white/70 rounded-xl border border-black/5 text-xs text-[#15152B] space-y-1">
        <div className="flex items-center justify-between font-semibold">
          <span className="flex items-center gap-1.5 text-xs text-[#15152B]">
            <Sparkles className="w-3.5 h-3.5 text-[#6654F5]" /> AI Semantic Audit
          </span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
              semanticVerification.status === 'verified'
                ? 'bg-emerald-100 text-emerald-800'
                : semanticVerification.status === 'caution'
                ? 'bg-amber-100 text-amber-800'
                : semanticVerification.status === 'incomplete'
                ? 'bg-slate-200 text-slate-800'
                : 'bg-rose-100 text-rose-800'
            }`}
          >
            {semanticVerification.status}
          </span>
        </div>
        <p className="text-[#6F7088] text-[11px] leading-relaxed">
          {semanticVerification.semanticExplanation}
        </p>
      </div>

      {/* Granular checks toggle & collapsible breakdown */}
      {deterministicChecks.length > 0 && (
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setDetailsExpanded(!detailsExpanded)}
            className="flex items-center justify-between w-full py-1.5 text-xs font-semibold text-[#15152B] hover:text-[#6654F5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6654F5] rounded-lg"
          >
            <span className="flex items-center gap-1.5">
              <span>Detailed Checks ({passedCount} passed{issueCount > 0 ? `, ${issueCount} flagged` : ''})</span>
            </span>
            <div className="flex items-center gap-1 text-[11px] text-[#6F7088]">
              <span>{detailsExpanded ? 'Hide' : 'Inspect'}</span>
              {detailsExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </div>
          </button>

          {detailsExpanded && (
            <div className="mt-2 space-y-2 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {deterministicChecks.map((check) => {
                  const isPassed = check.status === 'passed';
                  const isWarn = check.status === 'warning';

                  return (
                    <div
                      key={check.id}
                      className={`p-2.5 rounded-xl border text-xs ${
                        isPassed
                          ? 'bg-white/80 border-[#8E84E0]/20'
                          : isWarn
                          ? 'bg-amber-50/90 border-amber-300'
                          : 'bg-rose-50/90 border-rose-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <div className="flex items-center gap-1.5 font-bold text-[#15152B] text-[11px]">
                          <span className="text-[#6F7088]">{getCategoryIcon(check.category)}</span>
                          <span className="truncate">{check.title}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {isPassed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          ) : isWarn ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-rose-500" />
                          )}
                        </div>
                      </div>
                      <p className="text-[11px] text-[#6F7088] leading-relaxed">{check.details}</p>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-start gap-1.5 pt-2 text-[10px] text-[#9596AA]">
                <HelpCircle className="w-3 h-3 shrink-0 mt-0.5" />
                <span>
                  Deterministic matching inspects numbers, entities, and symbols. Manual review recommended for sensitive data.
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
