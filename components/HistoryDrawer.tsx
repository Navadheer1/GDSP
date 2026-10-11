'use client';

import React, { useEffect, useState, useCallback } from 'react';
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

  const fetchHistory = useCallback(async () => {
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
  }, [user]);

  useEffect(() => {
    if (isOpen && user) {
      fetchHistory();
    }
  }, [isOpen, user, fetchHistory]);

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
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#15152B]/40 backdrop-blur-xs flex justify-end animate-fade-in">
      <div className="w-full max-w-md bg-white h-full shadow-[0_20px_60px_rgba(21,21,43,0.25)] flex flex-col border-l border-[#8E84E0]/20">
        {/* Header */}
        <div className="p-5 border-b border-[#8E84E0]/15 flex items-center justify-between bg-[#FAF9FF]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#F4F2FF] text-[#6654F5] rounded-xl border border-[#6654F5]/20">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#15152B]">Your Rewrite History</h3>
              <p className="text-[11px] text-[#6F7088]">Synced to Cloud Firestore</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close history drawer"
            className="p-1.5 text-[#6F7088] hover:text-[#15152B] hover:bg-[#F4F2FF] rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6654F5]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 text-[#6F7088]">
              <Loader2 className="w-6 h-6 animate-spin text-[#6654F5] mb-2.5" />
              <p className="text-xs">Loading saved rewrites...</p>
            </div>
          ) : historyItems.length === 0 ? (
            <div className="text-center py-16 px-4">
              <History className="w-8 h-8 text-[#9596AA] mx-auto mb-2.5" />
              <p className="text-sm font-semibold text-[#15152B]">No saved rewrites yet</p>
              <p className="text-xs text-[#6F7088] mt-1.5 max-w-xs mx-auto leading-relaxed">
                Humanize text and click &ldquo;Save to History&rdquo; to store and audit your revisions.
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
                  className="group p-4 rounded-2xl border border-[#8E84E0]/20 hover:border-[#6654F5]/40 hover:bg-[#F4F2FF]/40 cursor-pointer transition-all duration-150 relative shadow-subtle hover:shadow-card"
                >
                  <div className="flex items-center justify-between text-[11px] text-[#6F7088] mb-2">
                    <span className="font-semibold text-[#6654F5] uppercase tracking-wider text-[10px] bg-[#F4F2FF] px-2 py-0.5 rounded-full border border-[#6654F5]/20">
                      {item.context.replace('-', ' ')}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-[#9596AA]">
                      <Calendar className="w-3 h-3 text-[#9596AA]" />
                      {dateStr}
                    </span>
                  </div>

                  <p className="text-xs text-[#15152B] line-clamp-2 font-medium mb-2.5 leading-relaxed">
                    {item.humanizedText}
                  </p>

                  <div className="flex items-center justify-between pt-2.5 border-t border-[#8E84E0]/15 text-[11px]">
                    <span className="text-[#6F7088] flex items-center gap-1.5">
                      {item.verificationStatus === 'passed' ? (
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      )}
                      Score: {item.verificationScore}%
                    </span>

                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, item.id)}
                      disabled={deletingId === item.id}
                      className="text-[#9596AA] hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                      title="Delete from history"
                    >
                      {deletingId === item.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
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
