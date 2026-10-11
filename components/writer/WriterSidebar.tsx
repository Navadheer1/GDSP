'use client';

import React, { useState } from 'react';
import { WriterDocument } from '@/types/writer';
import {
  FilePlus,
  LayoutGrid,
  Search,
  FileText,
  Trash2,
  Edit2,
  Clock,
  ChevronLeft,
  X,
  Check,
  FolderOpen,
} from 'lucide-react';

interface WriterSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  documents: WriterDocument[];
  currentDocumentId: string;
  onSelectDocument: (doc: WriterDocument) => void;
  onNewDocument: () => void;
  onOpenTemplates: () => void;
  onRenameDocument: (docId: string, newTitle: string) => Promise<void>;
  onDeleteDocument: (docId: string) => Promise<void>;
  isMobile?: boolean;
}

function formatRelativeTime(timestamp: number) {
  if (!timestamp) return 'Just now';
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function WriterSidebar({
  isOpen,
  onToggle,
  documents,
  currentDocumentId,
  onSelectDocument,
  onNewDocument,
  onOpenTemplates,
  onRenameDocument,
  onDeleteDocument,
  isMobile = false,
}: WriterSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const filteredDocs = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startRename = (doc: WriterDocument, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingId(doc.id);
    setRenameValue(doc.title);
  };

  const submitRename = async (docId: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (renameValue.trim()) {
      await onRenameDocument(docId, renameValue.trim());
    }
    setRenamingId(null);
  };

  const handleDelete = async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this document?')) {
      await onDeleteDocument(docId);
    }
  };

  const content = (
    <div className="flex flex-col h-full bg-[#FAF9FF] border-r border-[#8E84E0]/20 w-72 sm:w-80 select-none">
      {/* Top Header */}
      <div className="p-4 border-b border-[#8E84E0]/15 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-[#6654F5]" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#15152B]">
            Documents
          </h2>
          <span className="text-[10px] font-semibold text-[#6654F5] bg-[#EBE8FF] px-1.5 py-0.5 rounded-full">
            {documents.length}
          </span>
        </div>

        <button
          type="button"
          onClick={onToggle}
          title="Collapse sidebar"
          className="p-1.5 rounded-lg text-[#6F7088] hover:text-[#15152B] hover:bg-white transition-colors"
        >
          {isMobile ? <X className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Action Buttons */}
      <div className="p-3 space-y-2 border-b border-[#8E84E0]/15">
        <button
          type="button"
          onClick={onNewDocument}
          className="w-full flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#6654F5] to-[#8A7CFF] hover:from-[#5542E5] hover:to-[#7869FF] rounded-xl shadow-xs transition-all active:scale-[0.98]"
        >
          <FilePlus className="w-4 h-4" />
          <span>New Document</span>
        </button>

        <button
          type="button"
          onClick={onOpenTemplates}
          className="w-full flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#15152B] bg-white hover:bg-[#F4F2FF] border border-[#8E84E0]/25 rounded-xl shadow-2xs transition-colors"
        >
          <LayoutGrid className="w-4 h-4 text-[#6654F5]" />
          <span>Writing Templates</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-[#8E84E0]/15">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#8E84E0] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#8E84E0]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6654F5] text-[#15152B] placeholder-[#9596AA]"
          />
        </div>
      </div>

      {/* Document List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredDocs.length > 0 ? (
          filteredDocs.map((doc) => {
            const isActive = doc.id === currentDocumentId;
            const isEditing = renamingId === doc.id;

            return (
              <div
                key={doc.id}
                onClick={() => onSelectDocument(doc)}
                className={`group relative flex items-center justify-between p-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-[#15152B] border border-[#6654F5]/30 shadow-xs font-semibold'
                    : 'text-[#6F7088] hover:text-[#15152B] hover:bg-white/80 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <FileText
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-[#6654F5]' : 'text-[#8E84E0]'
                    }`}
                  />

                  {isEditing ? (
                    <form
                      onSubmit={(e) => submitRename(doc.id, e)}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 flex-1"
                    >
                      <input
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        className="w-full px-2 py-0.5 text-xs bg-[#F4F2FF] border border-[#6654F5] rounded-md focus:outline-none"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="p-1 text-emerald-600 hover:text-emerald-700"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  ) : (
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-[#15152B]">
                        {doc.title || 'Untitled'}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-[#9596AA] mt-0.5">
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {formatRelativeTime(doc.updatedAt)}
                        </span>
                        <span>·</span>
                        <span>{doc.wordCount || 0} words</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Hover Actions */}
                {!isEditing && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pl-1">
                    <button
                      type="button"
                      onClick={(e) => startRename(doc, e)}
                      title="Rename"
                      className="p-1 text-[#6F7088] hover:text-[#6654F5] hover:bg-[#F4F2FF] rounded-md transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(doc.id, e)}
                      title="Delete"
                      className="p-1 text-[#6F7088] hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="py-8 px-4 text-center text-[#9596AA] text-xs">
            {searchQuery ? 'No matching documents' : 'No documents yet. Create one!'}
          </div>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex">
        <div
          className="fixed inset-0 bg-[#15152B]/40 backdrop-blur-xs transition-opacity"
          onClick={onToggle}
        />
        <div className="relative z-10">{content}</div>
      </div>
    );
  }

  if (!isOpen) return null;

  return content;
}
