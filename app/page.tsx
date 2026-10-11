'use client';

import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  Sparkles,
  Shield,
  ArrowRight,
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  FileCheck,
  Cpu,
  ChevronRight,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="relative min-h-screen flex flex-col bg-[#FAF9FF] text-[#15152B] overflow-x-hidden selection:bg-[#EBE8FF] selection:text-[#5542E5]">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        {/* Soft atmospheric radial gradients */}
        <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-to-b from-[#6654F5]/10 via-[#8A7CFF]/06 to-transparent rounded-full blur-[130px] animate-drift-slow" />
        <div className="absolute top-[35%] -left-[160px] w-[580px] h-[580px] bg-gradient-to-tr from-[#78B9FF]/10 via-[#6654F5]/05 to-transparent rounded-full blur-[120px] animate-drift-reverse" />
        <div className="absolute top-[65%] -right-[140px] w-[620px] h-[620px] bg-gradient-to-bl from-[#8A7CFF]/09 via-[#78B9FF]/05 to-transparent rounded-full blur-[140px] animate-drift-slow" />

        {/* Subtle dot pattern */}
        <div className="absolute inset-0 bg-dot-pattern opacity-35 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />
      </div>

      {/* Landing Navigation */}
      <Header variant="landing" />

      {/* Main Landing Content */}
      <main className="relative z-10 flex-1 w-full mx-auto space-y-24 sm:space-y-32">

        {/* ============================================================ */}
        {/* SECTION B: HERO SECTION — TWO COLUMN EDITORIAL PRESENTATION */}
        {/* ============================================================ */}
        <section className="pt-12 sm:pt-20 pb-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            {/* Left Column: Editorial Headline & Value Narrative */}
            <div className="lg:col-span-7 space-y-7 text-left">
              {/* Category Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#8E84E0]/25 shadow-[0_2px_12px_rgba(102,84,245,0.06)]">
                <span className="w-2 h-2 rounded-full bg-[#6654F5] animate-pulse-subtle" />
                <span className="text-[11px] font-bold text-[#6F7088] uppercase tracking-wider">
                  A Better Way to Write
                </span>
                <span className="text-[#8E84E0]/40">·</span>
                <span className="text-[11px] font-semibold text-[#6654F5] flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-[#6654F5]" /> Dual-Engine Verification
                </span>
              </div>

              {/* Main Display Headline */}
              <h1 className="text-4xl sm:text-6xl lg:text-[64px] font-extrabold tracking-[-0.035em] text-[#15152B] leading-[1.08]">
                Less robotic.{' '}
                <br className="hidden sm:inline" />
                More human.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6654F5] via-[#7563FF] to-[#8A7CFF]">
                  Still your meaning.
                </span>
              </h1>

              {/* Supporting Copy */}
              <p className="text-base sm:text-lg text-[#6F7088] leading-relaxed max-w-xl font-normal">
                Standard rewrites often introduce hallucinations and distort specific numbers. Humanize AI pairs natural language polishing with independent fact-checking guardrails to preserve your original intent.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Link
                  href="/studio"
                  className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-[#6654F5] via-[#7563FF] to-[#8A7CFF] hover:from-[#5542E5] hover:to-[#7869FF] rounded-xl shadow-[0_4px_20px_rgba(102,84,245,0.32)] hover:shadow-[0_6px_24px_rgba(102,84,245,0.45)] transition-all duration-200 active:scale-[0.98]"
                >
                  <span>Open Writing Studio</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold text-[#15152B] bg-white hover:bg-[#F4F2FF] border border-[#8E84E0]/25 rounded-xl shadow-xs transition-colors"
                >
                  <span>How It Works</span>
                  <ChevronRight className="w-4 h-4 text-[#6F7088]" />
                </a>
              </div>

              {/* Key Highlights Badge Row */}
              <div className="pt-4 border-t border-[#8E84E0]/15 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-[#6F7088]">
                <div className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Deterministic Fact Checks</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#6654F5]" />
                  <span>Adaptive Tone & Context</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#78B9FF]" />
                  <span>No Fake Guarantees</span>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Product Preview Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl bg-white/85 backdrop-blur-xl border border-[#8E84E0]/25 shadow-workspace p-5 sm:p-6 space-y-4">
                {/* Preview Window Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#8E84E0]/15">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="ml-2 text-[11px] font-semibold text-[#6F7088] uppercase tracking-wider">
                      Illustrative Transformation
                    </span>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EBE8FF] text-[#5542E5] text-[10px] font-bold">
                    <Shield className="w-3 h-3 text-[#5542E5]" />
                    <span>Truth Guard Audit</span>
                  </div>
                </div>

                {/* Before: Robotic Draft Card */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-[#6F7088]">
                    <span>Original Draft (Stiff AI Phrasing)</span>
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      Passive & Repetitive
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#FAF9FF] border border-[#8E84E0]/20 text-xs text-[#6F7088] leading-relaxed font-mono">
                    &ldquo;It is crucial to note that the candidate completed 3 projects utilizing Python and Java, recording an 82% score in the technical evaluation with 2 years of professional background.&rdquo;
                  </div>
                </div>

                {/* Arrow Transition */}
                <div className="flex items-center justify-center -my-1 text-[#6654F5]">
                  <div className="w-8 h-8 rounded-full bg-[#F4F2FF] border border-[#6654F5]/20 flex items-center justify-center shadow-xs">
                    <ArrowRight className="w-3.5 h-3.5 rotate-90 text-[#6654F5]" />
                  </div>
                </div>

                {/* After: Natural Polish Card */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#15152B]">
                    <span className="flex items-center gap-1.5 text-[#5542E5]">
                      <Sparkles className="w-3.5 h-3.5 text-[#6654F5]" />
                      Humanized Output
                    </span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-semibold">
                      Natural Cadence
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-gradient-to-br from-white to-[#FAF9FF] border border-[#6654F5]/30 text-xs text-[#15152B] leading-relaxed shadow-xs font-sans">
                    &ldquo;The candidate has two years of professional experience, having shipped <mark className="bg-[#EBE8FF] text-[#5542E5] px-1 rounded font-semibold">3 projects</mark> across Python and Java and scoring <mark className="bg-[#EBE8FF] text-[#5542E5] px-1 rounded font-semibold">82%</mark> on their technical assessment.&rdquo;
                  </div>
                </div>

                {/* Illustrative Verification Report Pill Strip */}
                <div className="pt-2 border-t border-[#8E84E0]/15 space-y-2">
                  <div className="text-[10px] uppercase font-bold text-[#6F7088] tracking-wider flex items-center justify-between">
                    <span>Audit Breakdown</span>
                    <span className="text-[#6F7088] font-normal lowercase">sample benchmark</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="flex items-center gap-1.5 p-2 rounded-lg bg-emerald-50/80 border border-emerald-200 text-emerald-800 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">Numbers preserved: 3, 82%, 2</span>
                    </div>
                    <div className="flex items-center gap-1.5 p-2 rounded-lg bg-emerald-50/80 border border-emerald-200 text-emerald-800 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">Entities retained: Python, Java</span>
                    </div>
                  </div>
                </div>

                {/* Bottom link to Studio */}
                <div className="text-center pt-1">
                  <Link
                    href="/studio"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#6654F5] hover:text-[#5542E5] hover:underline"
                  >
                    <span>Test your own text in the studio</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION C: PRODUCT BENEFITS — 3 DISTINCT EDITORIAL PILLARS   */}
        {/* ============================================================ */}
        <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#EBE8FF] text-[#5542E5] text-[11px] font-bold uppercase tracking-wider">
              Core Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#15152B] tracking-tight">
              Designed for writers who refuse robotic output.
            </h2>
            <p className="text-sm sm:text-base text-[#6F7088] leading-relaxed">
              Most humanizers simply run random synonym swaps that mangle your technical meaning. We built a verifiable pipeline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-7 border border-[#8E84E0]/20 shadow-card hover:shadow-card-hover transition-all duration-300 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#F4F2FF] border border-[#6654F5]/15 flex items-center justify-center text-[#6654F5]">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#15152B]">
                Rewrite with intent
              </h3>
              <p className="text-sm text-[#6F7088] leading-relaxed">
                Break rigid corporate filler and repetitive syntax into conversational, expressive phrasing that sounds genuine without sounding casual by accident.
              </p>
              <div className="pt-2 text-xs font-semibold text-[#6654F5] flex items-center gap-1">
                <span>Natural flow & rhythm</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-7 border border-[#8E84E0]/20 shadow-card hover:shadow-card-hover transition-all duration-300 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#F4F2FF] border border-[#6654F5]/15 flex items-center justify-center text-[#6654F5]">
                <SlidersHorizontal className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#15152B]">
                Choose your voice
              </h3>
              <p className="text-sm text-[#6F7088] leading-relaxed">
                Select specific contexts (Academic, Executive, Technical, Creative) and calibrate tone from Natural to Persuasive or Analytical for precision communication.
              </p>
              <div className="pt-2 text-xs font-semibold text-[#6654F5] flex items-center gap-1">
                <span>Context-aware prompts</span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-7 border border-[#8E84E0]/20 shadow-card hover:shadow-card-hover transition-all duration-300 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#F4F2FF] border border-[#6654F5]/15 flex items-center justify-center text-[#6654F5]">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#15152B]">
                Review what changed
              </h3>
              <p className="text-sm text-[#6F7088] leading-relaxed">
                Truth Guard executes deterministic extraction checks and independent semantic evaluation to alert you whenever crucial data or subtleties might drift.
              </p>
              <div className="pt-2 text-xs font-semibold text-[#6654F5] flex items-center gap-1">
                <span>Dual verification engine</span>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION D: HOW IT WORKS — MULTI-STAGE REFINEMENT TIMELINE   */}
        {/* ============================================================ */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="rounded-3xl bg-gradient-to-b from-white/90 to-[#FAF9FF]/90 border border-[#8E84E0]/20 p-8 sm:p-14 shadow-card">
            <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
              <span className="text-[11px] font-bold text-[#6654F5] uppercase tracking-wider bg-[#F4F2FF] border border-[#6654F5]/15 px-3 py-1 rounded-full">
                Step-by-Step Architecture
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#15152B] tracking-tight">
                How Truth Guard Validates Your Text
              </h2>
              <p className="text-xs sm:text-sm text-[#6F7088] leading-relaxed">
                A dual verification pipeline that never blindly claims perfection, instead providing transparent inspections.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
              {/* Step 1 */}
              <div className="bg-white/80 p-6 rounded-2xl border border-[#8E84E0]/20 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[#F4F2FF] border border-[#6654F5]/15 text-[#6654F5] flex items-center justify-center font-bold">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <span className="text-2xl font-mono font-bold text-[#8E84E0]/30">01</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#15152B]">
                    Context & Tone Analysis
                  </h3>
                  <p className="text-xs text-[#6F7088] leading-relaxed">
                    Evaluates the audience persona and chosen tone to tailor cadence, phrasing, and vocabulary to the target scenario.
                  </p>
                </div>
                <div className="text-[11px] font-medium text-[#6654F5]">Persona calibrated</div>
              </div>

              {/* Step 2 */}
              <div className="bg-white/80 p-6 rounded-2xl border border-[#8E84E0]/20 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[#F4F2FF] border border-[#6654F5]/15 text-[#6654F5] flex items-center justify-center font-bold">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <span className="text-2xl font-mono font-bold text-[#8E84E0]/30">02</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#15152B]">
                    AI-Powered Rewriting
                  </h3>
                  <p className="text-xs text-[#6F7088] leading-relaxed">
                    Gemini 3.8 Flash rewrites stiff structures into natural, human cadence while instructed to preserve all factual claims.
                  </p>
                </div>
                <div className="text-[11px] font-medium text-[#6654F5]">Fluid phrasing</div>
              </div>

              {/* Step 3 */}
              <div className="bg-white/80 p-6 rounded-2xl border border-[#8E84E0]/20 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[#F4F2FF] border border-[#6654F5]/15 text-[#6654F5] flex items-center justify-center font-bold">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <span className="text-2xl font-mono font-bold text-[#8E84E0]/30">03</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#15152B]">
                    Deterministic Fact Checks
                  </h3>
                  <p className="text-xs text-[#6F7088] leading-relaxed">
                    Client and server pattern matching detects numbers, percentages, dates, currency, and named entities to flag discrepancies.
                  </p>
                </div>
                <div className="text-[11px] font-medium text-[#6654F5]">Hard fact extraction</div>
              </div>

              {/* Step 4 */}
              <div className="bg-white/80 p-6 rounded-2xl border border-[#8E84E0]/20 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[#F4F2FF] border border-[#6654F5]/15 text-[#6654F5] flex items-center justify-center font-bold">
                      <Shield className="w-5 h-5" />
                    </div>
                    <span className="text-2xl font-mono font-bold text-[#8E84E0]/30">04</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#15152B]">
                    Semantic Verification
                  </h3>
                  <p className="text-xs text-[#6F7088] leading-relaxed">
                    A dedicated verification call examines subtle nuances, caveats, and tone drift to report warnings requiring human review.
                  </p>
                </div>
                <div className="text-[11px] font-medium text-[#6654F5]">Meaning preservation</div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION E: TRUTH GUARD SHOWCASE — TRANSPARENT STATUS STATES  */}
        {/* ============================================================ */}
        <section id="truth-guard" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Narrative */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                Transparent Guardrails
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#15152B] tracking-tight">
                Honest reporting. <br />
                Never fake accuracy percentages.
              </h2>

              <p className="text-sm sm:text-base text-[#6F7088] leading-relaxed">
                Many tools show deceptive badges claiming &ldquo;100% Guaranteed Zero Hallucination.&rdquo; In real-world AI, that claim is mathematically misleading.
              </p>
              <p className="text-sm sm:text-base text-[#6F7088] leading-relaxed">
                Humanize AI takes the engineering-first approach: we run actual programmatic checks, surface explicit warnings when numbers or caveats shift, and empower you with full visibility.
              </p>

              <div className="pt-2">
                <Link
                  href="/studio"
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#6654F5] hover:text-[#5542E5] hover:underline"
                >
                  <span>Experience Truth Guard in the Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Status Indicator Cards */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Passed */}
              <div className="p-5 rounded-2xl bg-white/80 border border-emerald-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Passed Check
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    Match
                  </span>
                </div>
                <p className="text-xs text-[#6F7088] leading-relaxed">
                  All extracted numbers, percentages, dates, and named entities matched between source and rewritten text.
                </p>
              </div>

              {/* Warning */}
              <div className="p-5 rounded-2xl bg-white/80 border border-amber-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Advisory Warning
                  </span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                    Review
                  </span>
                </div>
                <p className="text-xs text-[#6F7088] leading-relaxed">
                  A subtle caveat or epistemic certainty change was detected. Flagged for writer inspection.
                </p>
              </div>

              {/* Failed */}
              <div className="p-5 rounded-2xl bg-white/80 border border-rose-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    Failed Check
                  </span>
                  <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full">
                    Discrepancy
                  </span>
                </div>
                <p className="text-xs text-[#6F7088] leading-relaxed">
                  A specific numerical quantity or key term was omitted or altered. Safer rewrite suggested.
                </p>
              </div>

              {/* Incomplete */}
              <div className="p-5 rounded-2xl bg-white/80 border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-500" />
                    Incomplete
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full">
                    Pending / Error
                  </span>
                </div>
                <p className="text-xs text-[#6F7088] leading-relaxed">
                  If semantic verification cannot complete, we never show fake green ticks. It is marked incomplete.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION F: CALL TO ACTION — DIRECT STUDIO LAUNCH            */}
        {/* ============================================================ */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-[#15152B] via-[#211F4A] to-[#2D2A68] text-white p-8 sm:p-14 text-center shadow-2xl">
            {/* Ambient background glows */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-[#6654F5]/30 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-[#78B9FF]/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-semibold text-[#8A7CFF] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#8A7CFF]" /> Ready to polish your drafts?
              </div>

              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
                Your words. Just more human.
              </h2>

              <p className="text-sm sm:text-base text-white/70 leading-relaxed max-w-xl mx-auto">
                Step into the writing studio to experience fluid humanization backed by real-time Truth Guard fact checks.
              </p>

              <div className="pt-2">
                <Link
                  href="/studio"
                  className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-bold text-[#15152B] bg-white hover:bg-[#FAF9FF] rounded-xl shadow-lg transition-transform active:scale-[0.98]"
                >
                  <span>Launch Writing Studio</span>
                  <ArrowRight className="w-4 h-4 text-[#6654F5]" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
