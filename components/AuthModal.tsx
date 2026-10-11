'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/firebase/authContext';
import { X, Sparkles, LogIn, UserPlus, AlertCircle, Loader2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export default function AuthModal({ isOpen, onClose, initialMode = 'signin' }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!email || !password) throw new Error('Please fill all required fields.');
        if (password.length < 6) throw new Error('Password must be at least 6 characters.');
        await signUp(email, password, displayName || undefined);
      } else {
        await signIn(email, password);
      }
      onClose();
    } catch (err: any) {
      console.error('Auth error:', err);
      const code = err.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else if (code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError(err.message || 'Authentication failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#15152B]/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-[0_20px_60px_rgba(21,21,43,0.2)] border border-[#8E84E0]/25 overflow-hidden">
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-[#6654F5] via-[#7563FF] to-[#8A7CFF] px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/15 rounded-xl backdrop-blur-md">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">
                  {mode === 'signin' ? 'Sign in to Humanize AI' : 'Create Free Account'}
                </h3>
                <p className="text-xs text-white/80">
                  {mode === 'signin'
                    ? 'Access and sync your private rewrite history'
                    : 'Save sessions, audit trails, and access history'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/15 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-7">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200/90 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-[#15152B] mb-1.5">
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-4 py-2.5 text-sm bg-[#FAF9FF] border border-[#8E84E0]/25 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6654F5] focus:bg-white text-[#15152B] placeholder:text-[#9596AA] transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#15152B] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full px-4 py-2.5 text-sm bg-[#FAF9FF] border border-[#8E84E0]/25 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6654F5] focus:bg-white text-[#15152B] placeholder:text-[#9596AA] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#15152B] mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 text-sm bg-[#FAF9FF] border border-[#8E84E0]/25 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6654F5] focus:bg-white text-[#15152B] placeholder:text-[#9596AA] transition-all"
              />
              {mode === 'signup' && (
                <span className="text-[11px] text-[#6F7088] mt-1 block">
                  Must be at least 6 characters
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-[#6654F5] to-[#8A7CFF] hover:from-[#5542E5] hover:to-[#7869FF] text-white text-sm font-semibold rounded-xl shadow-button-primary hover:shadow-[0_4px_16px_rgba(102,84,245,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6654F5]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : mode === 'signin' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-[#8E84E0]/15 text-center">
            {mode === 'signin' ? (
              <p className="text-xs text-[#6F7088]">
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMode('signup');
                  }}
                  className="font-semibold text-[#6654F5] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6654F5] rounded"
                >
                  Create one here
                </button>
              </p>
            ) : (
              <p className="text-xs text-[#6F7088]">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMode('signin');
                  }}
                  className="font-semibold text-[#6654F5] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6654F5] rounded"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
