'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/firebase/authContext';
import AuthModal from './AuthModal';
import { Sparkles, ShieldCheck, History, UserCheck, LogOut, ChevronRight } from 'lucide-react';

interface HeaderProps {
  onToggleHistory: () => void;
  showHistory: boolean;
}

export default function Header({ onToggleHistory, showHistory }: HeaderProps) {
  const { user, signOut } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  const openAuth = (mode: 'signin' | 'signup') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-navy-900">
                  Humanize <span className="text-brand-600">AI</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full border border-brand-200/60">
                  <ShieldCheck className="w-3 h-3 text-brand-600" /> Truth Guard
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Make every word sound more human
              </p>
            </div>
          </div>

          {/* Navigation & User Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user && (
              <button
                onClick={onToggleHistory}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition ${
                  showHistory
                    ? 'bg-brand-50 border-brand-300 text-brand-700 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <History className="w-3.5 h-3.5 text-slate-500" />
                <span>History</span>
              </button>
            )}

            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-800 truncate max-w-[140px]">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                  <span className="text-[10px] text-emerald-600 flex items-center justify-end gap-1 font-medium">
                    <UserCheck className="w-3 h-3" /> Synced
                  </span>
                </div>
                <button
                  onClick={() => signOut()}
                  title="Sign out"
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuth('signin')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-navy-900 transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuth('signup')}
                  className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-lg shadow-sm transition"
                >
                  <span>Sign Up</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </>
  );
}
