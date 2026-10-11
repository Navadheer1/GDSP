'use client';

import React, { useEffect, useState } from 'react';
import { SavedHistoryItem } from '@/types';
import { useAuth } from '@/lib/firebase/authContext';
import { getUserHistory, deleteHistoryItem } from '@/lib/firebase/history';
import {
  History,
  X,
  Trash2,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Calendar,
} from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectHistory: (item: SavedHistoryItem) => void;
}

export default function HistoryDrawer({ isOpen, onClose, onSelectHistory }: HistoryDrawerProps) {
  const { user } = useAuth();
  const [historyItems, setHistoryItems] = useState<SavedHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchHistory = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const items = await getUserHistory(user.uid, 25);
      setHistoryItems(items);
    } catch (err) {
      console.error('Fetch history error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      fetchHistory();
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleDelete = async (e: React.MouseEvent, historyId?: string) => {
    e.stopPropagation();
    if (!user || !historyId) return;
    setDeletingId(historyId);
    try {
      await deleteHistoryItem(user.uid, historyId);
      setHistoryItems((prev) => prev.filter((item) => item.id !== historyId));
    } catch (err) {
      console.error('Delete item error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-navy-900/30 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-slide-left">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-brand-50 text-brand-600 rounded-lg">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-navy-900">Your Rewrite History</h3>
              <p className="text-[11px] text-slate-500">Synced to Cloud Firestore</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-brand-600 mb-2" />
              <p className="text-xs">Loading saved rewrites...</p>
            </div>
          ) : historyItems.length === 0 ? (
            <div className="text-center py-12 px-4">
              <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No saved rewrites yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Humanize text and click &ldquo;Save to History&rdquo; to access your previous runs at any time.
              </p>
            </div>
          ) : (
            historyItems.map((item) => {
              const dateStr = new Date(item.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectHistory(item);
                    onClose();
                  }}
                  className="group p-3.5 rounded-xl border border-slate-200 hover:border-brand-300 hover:bg-brand-50/20 cursor-pointer transition relative"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
                    <span className="font-semibold text-brand-700 uppercase tracking-wider text-[10px] bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                      {item.context.replace('-', ' ')}
                    </span>
                    <span className="flex items-center gap-1 text-[10px]">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {dateStr}
                    </span>
                  </div>

                  <p className="text-xs text-slate-800 line-clamp-2 font-medium mb-1.5">
                    {item.humanizedText}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                    <span className="text-slate-500 flex items-center gap-1">
                      {item.verificationStatus === 'passed' ? (
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      )}
                      Score: {item.verificationScore}%
                    </span>

                    <button
                      onClick={(e) => handleDelete(e, item.id)}
                      disabled={deletingId === item.id}
                      className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition"
                      title="Delete from history"
                    >
                      {deletingId === item.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
