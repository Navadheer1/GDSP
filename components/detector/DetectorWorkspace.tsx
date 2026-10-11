'use client';

import React, { useState, useRef } from 'react';
import { DetectorAnalysisResult } from '@/types/detector';
import { ResultsDashboard } from './ResultsDashboard';
import { extractTextFromFile } from '@/lib/detector/upload';
import {
  ScanSearch,
  UploadCloud,
  ClipboardPaste,
  Trash2,
  Loader2,
  Sparkles,
  AlertCircle,
  FileText,
  FileCheck2,
} from 'lucide-react';

const SAMPLE_TEXTS = [
  {
    label: 'AI-Style Pattern',
    text: `In today's fast-paced technological landscape, artificial intelligence serves as a testament to human innovation. Furthermore, it is important to note that machine learning algorithms continually evolve to address complex industrial problems. Moreover, data integrity remains a pivotal pillar in ensuring that automated systems operate transparently. In conclusion, the thoughtful integration of artificial intelligence will inevitably transform modern society for generations to come.`,
  },
  {
    label: 'Human-Style Pattern',
    text: `I spent three hours debugging that stubborn race condition yesterday. Honestly, nothing worked at first. After four cups of stale coffee and pulling half my hair out, I realized I had accidentally forgotten to release the lock in the error handling block. Classic rookie mistake. Once I patched that single line, the whole test suite went green in two seconds flat. What a relief.`,
  },
  {
    label: 'Mixed Draft',
    text: `The engineering team finalized the database migration schedule for next quarter. Although latency spiked by roughly 12% during the initial benchmark runs on staging, we isolated the root cause to an unindexed foreign key column. Consequently, the team resolved the issue forthwith. We will proceed with the canary deployment on Tuesday morning provided no further regression emerges.`,
  },
];

export default function DetectorWorkspace() {
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<DetectorAnalysisResult | null>(null);
  const [uploadedFilename, setUploadedFilename] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const charCount = inputText.length;
  const isTooShort = wordCount < 25;

  // Paste from clipboard
  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputText(text);
        setErrorMessage(null);
      }
    } catch {
      setErrorMessage('Could not read clipboard. Please paste directly using Ctrl+V.');
    }
  };

  // Clear text
  const handleClear = () => {
    setInputText('');
    setResult(null);
    setErrorMessage(null);
    setUploadedFilename(null);
  };

  // Upload file
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setErrorMessage(null);
      const extracted = await extractTextFromFile(file);
      setInputText(extracted.text);
      setUploadedFilename(extracted.filename);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to read document.');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Run analysis
  const handleAnalyze = async () => {
    if (isTooShort) {
      setErrorMessage('Please provide at least 25 words to analyze writing patterns.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/detector/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete analysis.');
      }

      setResult(data.data);

      // Scroll smoothly down to results
      setTimeout(() => {
        const el = document.getElementById('analysis-results');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (err: any) {
      console.error('Detector error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred during analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Locate passage in text
  const handleSelectPassage = (passageText: string) => {
    if (!textareaRef.current || !passageText) return;
    const start = inputText.indexOf(passageText);
    if (start !== -1) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(start, start + passageText.length);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Page Header */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBE8FF] text-[#5542E5] text-[11px] font-bold uppercase tracking-wider border border-[#6654F5]/20">
          <ScanSearch className="w-3.5 h-3.5" />
          <span>Writing-Pattern Analysis</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-[#15152B] tracking-tight">
          AI Detector
        </h1>
        <p className="text-xs sm:text-sm text-[#6F7088] max-w-2xl leading-relaxed">
          Analyze writing patterns and explore whether text resembles AI-generated or human-written content.
        </p>
      </div>

      {/* Main Input Card */}
      <div className="bg-white rounded-3xl border border-[#8E84E0]/20 shadow-card p-5 sm:p-7 space-y-4">
        {/* Sample Texts Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#8E84E0]/15">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F7088]">
              Try a Sample:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {SAMPLE_TEXTS.map((sample) => (
                <button
                  key={sample.label}
                  type="button"
                  onClick={() => {
                    setInputText(sample.text);
                    setErrorMessage(null);
                    setUploadedFilename(null);
                  }}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#FAF9FF] hover:bg-[#F4F2FF] border border-[#8E84E0]/20 text-[#15152B] transition-colors"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePasteClipboard}
              title="Paste text from clipboard"
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#6F7088] hover:text-[#15152B] hover:bg-[#FAF9FF] rounded-lg transition-colors border border-transparent hover:border-[#8E84E0]/20"
            >
              <ClipboardPaste className="w-3.5 h-3.5" />
              <span>Paste</span>
            </button>

            {/* Document Upload */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".txt,.md,.markdown"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Upload text document (.txt, .md)"
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#6F7088] hover:text-[#15152B] hover:bg-[#FAF9FF] rounded-lg transition-colors border border-transparent hover:border-[#8E84E0]/20"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload Doc</span>
            </button>

            {inputText && (
              <button
                type="button"
                onClick={handleClear}
                title="Clear input"
                className="p-1 text-[#6F7088] hover:text-rose-600 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Uploaded File Pill Indicator */}
        {uploadedFilename && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#F4F2FF] border border-[#6654F5]/20 text-xs text-[#5542E5]">
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Loaded document: <strong>{uploadedFilename}</strong></span>
          </div>
        )}

        {/* Text Input Area */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            rows={8}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste or type text to inspect writing characteristics (minimum 25 words recommended for statistical variance)..."
            className="w-full p-4 text-xs sm:text-sm bg-[#FAF9FF] border border-[#8E84E0]/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6654F5] text-[#15152B] placeholder-[#9596AA] leading-relaxed resize-y min-h-[180px]"
          />
        </div>

        {/* Footer Bar: Metrics & Analyze Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="text-xs text-[#6F7088] flex items-center gap-3">
            <span>
              <strong>{wordCount}</strong> words
            </span>
            <span>·</span>
            <span>{charCount} characters</span>
            {isTooShort && (
              <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md text-[11px] font-medium border border-amber-200">
                Minimum 25 words required
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isAnalyzing || isTooShort}
            className="flex items-center justify-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#6654F5] via-[#7563FF] to-[#8A7CFF] hover:from-[#5542E5] hover:to-[#7869FF] rounded-xl shadow-[0_4px_14px_rgba(102,84,245,0.3)] transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing Writing Patterns...</span>
              </>
            ) : (
              <>
                <ScanSearch className="w-4 h-4" />
                <span>Analyze Text</span>
              </>
            )}
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="flex-1">{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Results Dashboard Section */}
      {result && (
        <ResultsDashboard
          result={result}
          onSelectPassage={handleSelectPassage}
        />
      )}
    </div>
  );
}
