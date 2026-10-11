'use client';

import React, { useEffect, useImperativeHandle, forwardRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo2,
  Redo2,
  Link as LinkIcon,
  Unlink,
  RemoveFormatting,
} from 'lucide-react';

export interface RichTextEditorHandle {
  replaceSelection: (html: string) => void;
  insertContent: (html: string) => void;
  setContent: (html: string) => void;
  appendContent: (html: string) => void;
  prependContent: (html: string) => void;
  replaceExcerpt: (excerpt: string, replacementHtml: string) => boolean;
  getSelectedText: () => string;
  getHtml: () => string;
  getText: () => string;
  focus: () => void;
}

interface RichTextEditorProps {
  initialContent: string;
  onChange: (html: string, plainText: string, words: number, chars: number) => void;
  onSelectionChange?: (selectedText: string, from: number, to: number) => void;
  placeholder?: string;
  readOnly?: boolean;
}

export const RichTextEditor = forwardRef<RichTextEditorHandle, RichTextEditorProps>(
  (
    {
      initialContent,
      onChange,
      onSelectionChange,
      placeholder = 'Start writing your document or generate with AI...',
      readOnly = false,
    },
    ref
  ) => {
    const [linkModalOpen, setLinkModalOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');

    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          heading: {
            levels: [1, 2, 3],
          },
        }),
        Underline,
        TextAlign.configure({
          types: ['heading', 'paragraph'],
        }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: 'text-[#6654F5] underline hover:text-[#5542E5]',
          },
        }),
        Placeholder.configure({
          placeholder,
          emptyEditorClass: 'is-editor-empty',
        }),
      ],
      content: initialContent,
      editable: !readOnly,
      immediatelyRender: false,
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        const plainText = editor.getText();
        const trimmed = plainText.trim();
        const words = trimmed ? trimmed.split(/\s+/).length : 0;
        const chars = plainText.length;
        onChange(html, plainText, words, chars);
      },
      onSelectionUpdate: ({ editor }) => {
        if (!onSelectionChange) return;
        const { from, to } = editor.state.selection;
        const text = editor.state.doc.textBetween(from, to, ' ');
        onSelectionChange(text, from, to);
      },
    });

    // Sync external content changes if editor content is completely out of sync
    useEffect(() => {
      if (editor && initialContent !== undefined) {
        const currentHtml = editor.getHTML();
        if (initialContent !== currentHtml && !editor.isFocused) {
          editor.commands.setContent(initialContent, { emitUpdate: false });
        }
      }
    }, [initialContent, editor]);

    // Expose imperative methods to parent
    useImperativeHandle(ref, () => ({
      replaceSelection: (html: string) => {
        if (!editor) return;
        editor.chain().focus().deleteSelection().insertContent(html).run();
      },
      insertContent: (html: string) => {
        if (!editor) return;
        editor.chain().focus().insertContent(html).run();
      },
      setContent: (html: string) => {
        if (!editor) return;
        editor.commands.setContent(html, { emitUpdate: false });
      },
      appendContent: (html: string) => {
        if (!editor) return;
        const current = editor.getHTML();
        editor.commands.setContent(`${current}${html}`, { emitUpdate: true });
      },
      prependContent: (html: string) => {
        if (!editor) return;
        const current = editor.getHTML();
        editor.commands.setContent(`${html}${current}`, { emitUpdate: true });
      },
      replaceExcerpt: (excerpt: string, replacementHtml: string) => {
        if (!editor || !excerpt.trim()) return false;
        const currentHtml = editor.getHTML();
        const cleanExcerpt = excerpt.trim();

        // 1. Try direct HTML substring replacement
        if (currentHtml.includes(cleanExcerpt)) {
          const updated = currentHtml.replace(cleanExcerpt, replacementHtml);
          editor.commands.setContent(updated, { emitUpdate: true });
          return true;
        }

        // 2. Try tag-stripped plain text search
        const plainText = editor.getText();
        if (plainText.includes(cleanExcerpt)) {
          // Replace within plain text representation inside paragraph if simple
          const updated = currentHtml.replace(
            new RegExp(cleanExcerpt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'),
            replacementHtml
          );
          if (updated !== currentHtml) {
            editor.commands.setContent(updated, { emitUpdate: true });
            return true;
          }
        }

        return false;
      },
      getSelectedText: () => {
        if (!editor) return '';
        const { from, to } = editor.state.selection;
        return editor.state.doc.textBetween(from, to, ' ');
      },
      getHtml: () => {
        return editor ? editor.getHTML() : '';
      },
      getText: () => {
        return editor ? editor.getText() : '';
      },
      focus: () => {
        editor?.commands.focus();
      },
    }));

    if (!editor) {
      return (
        <div className="w-full h-96 flex items-center justify-center bg-white rounded-2xl border border-[#8E84E0]/20">
          <div className="w-6 h-6 border-2 border-[#6654F5] border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    const setLink = () => {
      if (linkUrl) {
        editor
          .chain()
          .focus()
          .extendMarkRange('link')
          .setLink({ href: linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}` })
          .run();
      }
      setLinkModalOpen(false);
      setLinkUrl('');
    };

    return (
      <div className="w-full flex flex-col bg-white rounded-2xl border border-[#8E84E0]/20 shadow-sm overflow-hidden transition-all duration-200 focus-within:border-[#6654F5]/40 focus-within:shadow-[0_4px_24px_-4px_rgba(102,84,245,0.08)]">
        {/* Formatting Toolbar */}
        <div
          role="toolbar"
          aria-label="Rich text formatting"
          className="flex flex-wrap items-center gap-1 p-2 bg-[#FAF9FF]/90 border-b border-[#8E84E0]/15 sticky top-0 z-20 backdrop-blur-md"
        >
          {/* History */}
          <div className="flex items-center gap-0.5 pr-1.5 border-r border-[#8E84E0]/20">
            <button
              type="button"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title="Undo (Ctrl+Z)"
              className="p-1.5 rounded-lg text-[#6F7088] hover:text-[#15152B] hover:bg-white disabled:opacity-35 disabled:hover:bg-transparent transition-colors"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title="Redo (Ctrl+Y)"
              className="p-1.5 rounded-lg text-[#6F7088] hover:text-[#15152B] hover:bg-white disabled:opacity-35 disabled:hover:bg-transparent transition-colors"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          {/* Heading / Structure */}
          <div className="flex items-center gap-0.5 px-1.5 border-r border-[#8E84E0]/20">
            <button
              type="button"
              onClick={() => editor.chain().focus().setParagraph().run()}
              title="Normal Text"
              className={`p-1.5 rounded-lg transition-colors ${
                editor.isActive('paragraph')
                  ? 'bg-[#EBE8FF] text-[#5542E5] font-semibold'
                  : 'text-[#6F7088] hover:text-[#15152B] hover:bg-white'
              }`}
            >
              <Pilcrow className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              title="Heading 1"
              className={`p-1.5 rounded-lg transition-colors ${
                editor.isActive('heading', { level: 1 })
                  ? 'bg-[#EBE8FF] text-[#5542E5] font-semibold'
                  : 'text-[#6F7088] hover:text-[#15152B] hover:bg-white'
              }`}
            >
              <Heading1 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              title="Heading 2"
              className={`p-1.5 rounded-lg transition-colors ${
                editor.isActive('heading', { level: 2 })
                  ? 'bg-[#EBE8FF] text-[#5542E5] font-semibold'
                  : 'text-[#6F7088] hover:text-[#15152B] hover:bg-white'
              }`}
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              title="Heading 3"
              className={`p-1.5 rounded-lg transition-colors ${
                editor.isActive('heading', { level: 3 })
                  ? 'bg-[#EBE8FF] text-[#5542E5] font-semibold'
                  : 'text-[#6F7088] hover:text-[#15152B] hover:bg-white'
              }`}
            >
              <Heading3 className="w-4 h-4" />
            </button>
          </div>

          {/* Text Styling */}
          <div className="flex items-center gap-0.5 px-1.5 border-r border-[#8E84E0]/20">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              title="Bold (Ctrl+B)"
              className={`p-1.5 rounded-lg transition-colors ${
                editor.isActive('bold')
                  ? 'bg-[#EBE8FF] text-[#5542E5] font-semibold'
                  : 'text-[#6F7088] hover:text-[#15152B] hover:bg-white'
              }`}
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              title="Italic (Ctrl+I)"
              className={`p-1.5 rounded-lg transition-colors ${
                editor.isActive('italic')
                  ? 'bg-[#EBE8FF] text-[#5542E5] font-semibold'
                  : 'text-[#6F7088] hover:text-[#15152B] hover:bg-white'
              }`}
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              title="Underline (Ctrl+U)"
              className={`p-1.5 rounded-lg transition-colors ${
                editor.isActive('underline')
                  ? 'bg-[#EBE8FF] text-[#5542E5] font-semibold'
                  : 'text-[#6F7088] hover:text-[#15152B] hover:bg-white'
              }`}
            >
              <UnderlineIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Lists */}
          <div className="flex items-center gap-0.5 px-1.5 border-r border-[#8E84E0]/20">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              title="Bullet List"
              className={`p-1.5 rounded-lg transition-colors ${
                editor.isActive('bulletList')
                  ? 'bg-[#EBE8FF] text-[#5542E5] font-semibold'
                  : 'text-[#6F7088] hover:text-[#15152B] hover:bg-white'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              title="Numbered List"
              className={`p-1.5 rounded-lg transition-colors ${
                editor.isActive('orderedList')
                  ? 'bg-[#EBE8FF] text-[#5542E5] font-semibold'
                  : 'text-[#6F7088] hover:text-[#15152B] hover:bg-white'
              }`}
            >
              <ListOrdered className="w-4 h-4" />
            </button>
          </div>

          {/* Alignment */}
          <div className="flex items-center gap-0.5 px-1.5 border-r border-[#8E84E0]/20">
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              title="Align Left"
              className={`p-1.5 rounded-lg transition-colors ${
                editor.isActive({ textAlign: 'left' })
                  ? 'bg-[#EBE8FF] text-[#5542E5] font-semibold'
                  : 'text-[#6F7088] hover:text-[#15152B] hover:bg-white'
              }`}
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              title="Align Center"
              className={`p-1.5 rounded-lg transition-colors ${
                editor.isActive({ textAlign: 'center' })
                  ? 'bg-[#EBE8FF] text-[#5542E5] font-semibold'
                  : 'text-[#6F7088] hover:text-[#15152B] hover:bg-white'
              }`}
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              title="Align Right"
              className={`p-1.5 rounded-lg transition-colors ${
                editor.isActive({ textAlign: 'right' })
                  ? 'bg-[#EBE8FF] text-[#5542E5] font-semibold'
                  : 'text-[#6F7088] hover:text-[#15152B] hover:bg-white'
              }`}
            >
              <AlignRight className="w-4 h-4" />
            </button>
          </div>

          {/* Links & Cleanup */}
          <div className="flex items-center gap-0.5 pl-1.5">
            <button
              type="button"
              onClick={() => {
                const prev = editor.getAttributes('link').href || '';
                setLinkUrl(prev);
                setLinkModalOpen(true);
              }}
              title="Insert Link"
              className={`p-1.5 rounded-lg transition-colors ${
                editor.isActive('link')
                  ? 'bg-[#EBE8FF] text-[#5542E5] font-semibold'
                  : 'text-[#6F7088] hover:text-[#15152B] hover:bg-white'
              }`}
            >
              <LinkIcon className="w-4 h-4" />
            </button>
            {editor.isActive('link') && (
              <button
                type="button"
                onClick={() => editor.chain().focus().unsetLink().run()}
                title="Remove Link"
                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <Unlink className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
              title="Clear Formatting"
              className="p-1.5 rounded-lg text-[#6F7088] hover:text-[#15152B] hover:bg-white transition-colors"
            >
              <RemoveFormatting className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Link Input Dialog Popup */}
        {linkModalOpen && (
          <div className="p-3 bg-[#F4F2FF] border-b border-[#8E84E0]/20 flex items-center gap-2 animate-fade-in">
            <LinkIcon className="w-4 h-4 text-[#6654F5] shrink-0" />
            <input
              type="url"
              placeholder="https://example.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  setLink();
                } else if (e.key === 'Escape') {
                  setLinkModalOpen(false);
                }
              }}
              className="flex-1 px-3 py-1.5 text-xs bg-white rounded-lg border border-[#8E84E0]/30 focus:outline-none focus:ring-2 focus:ring-[#6654F5]"
              autoFocus
            />
            <button
              type="button"
              onClick={setLink}
              className="px-3 py-1.5 text-xs font-semibold bg-[#6654F5] text-white rounded-lg hover:bg-[#5542E5] transition-colors"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={() => setLinkModalOpen(false)}
              className="px-2.5 py-1.5 text-xs font-semibold text-[#6F7088] hover:text-[#15152B] transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Editor Body */}
        <div className="p-6 sm:p-8 min-h-[500px] cursor-text">
          <EditorContent editor={editor} />
        </div>
      </div>
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';
