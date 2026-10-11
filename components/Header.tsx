'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/firebase/authContext';
import AuthModal from './AuthModal';
import { Sparkles, Shield, History, UserCheck, LogOut, ArrowRight, Menu, X, ArrowLeft } from 'lucide-react';

interface HeaderProps {
  onToggleHistory?: () => void;
  showHistory?: boolean;
  variant?: 'landing' | 'studio';
}

export default function Header({
  onToggleHistory,
  showHistory = false,
  variant = 'landing',
}: HeaderProps) {
  const { user, signOut } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openAuth = (mode: 'signin' | 'signup') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled
            ? 'bg-[#FAF9FF]/85 backdrop-blur-xl border-b border-[#8E84E0]/20 shadow-[0_4px_24px_-4px_rgba(102,84,245,0.06)]'
            : 'bg-[#FAF9FF]/60 backdrop-blur-md border-b border-[#8E84E0]/15'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: Brand Wordmark */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="group flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6654F5] rounded-xl"
            >
              <div className="relative flex items-center justify-center">
                <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-[#6654F5] to-[#8A7CFF] opacity-35 blur-sm group-hover:opacity-60 transition duration-300" />
                <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6654F5] via-[#7563FF] to-[#8A7CFF] flex items-center justify-center text-white shadow-[0_2px_10px_rgba(102,84,245,0.3)]">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[17px] tracking-tight text-[#15152B]">
                  Humanize <span className="text-[#6654F5]">AI</span>
                </span>

                {variant === 'studio' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#EBE8FF] text-[#5542E5] border border-[#6654F5]/25">
                    Studio
                  </span>
                ) : (
                  <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F4F2FF] text-[#6654F5] border border-[#6654F5]/20 shadow-xs">
                    <Shield className="w-3 h-3 text-[#6654F5]" />
                    <span>Truth Guard</span>
                  </span>
                )}
              </div>
            </Link>
          </div>

          {/* Center Navigation: Shown only on Landing Page */}
          {variant === 'landing' ? (
            <nav className="hidden md:flex items-center gap-1 bg-white/70 backdrop-blur-md px-3 py-1 rounded-full border border-[#8E84E0]/20 shadow-subtle text-xs font-semibold text-[#6F7088]">
              <a
                href="#features"
                className="px-3.5 py-1.5 rounded-full hover:text-[#15152B] hover:bg-[#F4F2FF] transition-colors"
              >
                Product
              </a>
              <a
                href="#how-it-works"
                className="px-3.5 py-1.5 rounded-full hover:text-[#15152B] hover:bg-[#F4F2FF] transition-colors"
              >
                How It Works
              </a>
              <a
                href="#truth-guard"
                className="px-3.5 py-1.5 rounded-full hover:text-[#15152B] hover:bg-[#F4F2FF] transition-colors flex items-center gap-1"
              >
                <span>Truth Guard</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </a>
            </nav>
          ) : (
            <div className="hidden sm:flex items-center gap-2 text-xs text-[#6F7088]">
              <Link
                href="/"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:text-[#15152B] hover:bg-white/80 transition-colors border border-transparent hover:border-[#8E84E0]/20"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#6654F5]" />
                <span>Back to Overview</span>
              </Link>
            </div>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-2.5">
            {/* History drawer button (if in studio or authenticated) */}
            {user && onToggleHistory && (
              <button
                type="button"
                onClick={onToggleHistory}
                aria-label="Toggle rewrite history"
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6654F5] ${
                  showHistory
                    ? 'bg-[#EBE8FF] border-[#6654F5]/40 text-[#5542E5] shadow-xs'
                    : 'bg-white/80 border-[#8E84E0]/20 text-[#6F7088] hover:text-[#15152B] hover:border-[#6654F5]/30 hover:bg-[#F4F2FF]'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">History</span>
              </button>
            )}

            {user ? (
              <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-[#8E84E0]/20">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-semibold text-[#15152B] truncate max-w-[130px]">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                  <span className="text-[10px] text-emerald-600 flex items-center justify-end gap-1 font-medium">
                    <UserCheck className="w-3 h-3" /> Synced
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => signOut()}
                  title="Sign out"
                  aria-label="Sign out"
                  className="p-2 text-[#6F7088] hover:text-[#15152B] hover:bg-[#F4F2FF] rounded-xl transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6654F5]"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openAuth('signin')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-[#6F7088] hover:text-[#15152B] transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6654F5]"
                >
                  Log In
                </button>
              </div>
            )}

            {/* Studio Call to Action / Try It Free */}
            {variant === 'landing' ? (
              <Link
                href="/studio"
                className="group relative flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#6654F5] via-[#7563FF] to-[#8A7CFF] hover:from-[#5542E5] hover:to-[#7869FF] rounded-xl shadow-[0_2px_10px_rgba(102,84,245,0.28)] hover:shadow-[0_4px_16px_rgba(102,84,245,0.4)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6654F5] focus-visible:ring-offset-2 active:scale-[0.98]"
              >
                <span>Try It Free</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ) : (
              <div className="hidden lg:flex items-center gap-1.5 text-xs text-[#6F7088] bg-[#F4F2FF] border border-[#6654F5]/15 px-3 py-1.5 rounded-xl font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-subtle" />
                <span>Workspace Ready</span>
              </div>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            {variant === 'landing' && (
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle navigation menu"
                className="md:hidden p-2 text-[#6F7088] hover:text-[#15152B] rounded-lg hover:bg-white/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6654F5]"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {variant === 'landing' && mobileMenuOpen && (
          <div className="md:hidden px-4 pt-2 pb-4 border-t border-[#8E84E0]/15 bg-[#FAF9FF]/95 backdrop-blur-xl animate-fade-in space-y-3">
            <nav className="flex flex-col space-y-1 text-sm font-semibold text-[#6F7088]">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-[#F4F2FF] hover:text-[#15152B] transition-colors"
              >
                Product
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-[#F4F2FF] hover:text-[#15152B] transition-colors"
              >
                How It Works
              </a>
              <a
                href="#truth-guard"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-[#F4F2FF] hover:text-[#15152B] transition-colors flex items-center justify-between"
              >
                <span>Truth Guard</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Dual-Engine
                </span>
              </a>
            </nav>

            <div className="pt-2 border-t border-[#8E84E0]/15 flex items-center justify-between">
              {!user ? (
                <button
                  type="button"
                  onClick={() => openAuth('signin')}
                  className="px-4 py-2 text-xs font-semibold text-[#6F7088] hover:text-[#15152B]"
                >
                  Log In
                </button>
              ) : (
                <span className="text-xs text-[#6F7088] truncate">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
              )}

              <Link
                href="/studio"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#6654F5] to-[#8A7CFF] rounded-xl shadow-button-primary flex items-center gap-1.5"
              >
                <span>Open Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </header>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </>
  );
}
