'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/firebase/authContext';
import {
  getUserDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  saveLocalRecoveryDraft,
  getLocalRecoveryDraft,
} from '@/lib/firebase/documents';
import {
  WriterDocument,
  DocumentTemplate,
  ToneOption,
  LanguageOption,
  AIWritingAction,
  AgentChatMessage,
  AgentDocumentOperation,
  AgentChatResponse,
} from '@/types/writer';
import { RichTextEditor, RichTextEditorHandle } from './RichTextEditor';
import { WriterSidebar } from './WriterSidebar';
import { AIAssistantPanel } from './AIAssistantPanel';
import { TemplateModal } from './TemplateModal';
import { DiffComparisonModal } from './DiffComparisonModal';
import { exportToTxt, exportToDocx, exportToPdf, copyFormattedText } from '@/lib/writer/export';
import {
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Download,
  Copy,
  Check,
  Sparkles,
  Cloud,
  CloudOff,
  Loader2,
  FileText,
  FileCode,
  Printer,
  ChevronDown,
  LayoutGrid,
} from 'lucide-react';

const INITIAL_DEFAULT_CONTENT = `<h1>Welcome to Writer</h1><p>Start writing your document here, or use the <strong>Writing Templates</strong> and <strong>AI Assistant</strong> to draft letters, emails, proposals, and reports.</p><p>Select any text to polish, expand, simplify, or translate it using the assistant panel on the right.</p>`;

export default function WriterWorkspace() {
  const { user } = useAuth();
  const editorRef = useRef<RichTextEditorHandle>(null);

  // Documents state
  const [documents, setDocuments] = useState<WriterDocument[]>([]);
  const [currentDoc, setCurrentDoc] = useState<WriterDocument>({
    id: 'local-init',
    userId: 'guest',
    title: 'Untitled Document',
    content: INITIAL_DEFAULT_CONTENT,
    plainText: '',
    documentType: 'blank',
    wordCount: 42,
    characterCount: 260,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  // Autosave and sync status
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'failed' | 'unsaved'>('saved');
  const lastSaveTimeRef = useRef<number>(Date.now());
  const pendingSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Layout panels toggle
  const [isLeftOpen, setIsLeftOpen] = useState(true);
  const [isRightOpen, setIsRightOpen] = useState(true);
  const [isMobileLeftOpen, setIsMobileLeftOpen] = useState(false);
  const [isMobileRightOpen, setIsMobileRightOpen] = useState(false);

  // Selection tracking
  const [selectedText, setSelectedText] = useState('');

  // Revision and undo history
  const [revision, setRevision] = useState(1);
  const undoHistoryRef = useRef<Array<{ title: string; content: string }>>([]);

  // Conversational AI Agent State
  const [chatMessages, setChatMessages] = useState<AgentChatMessage[]>([]);
  const agentAbortControllerRef = useRef<AbortController | null>(null);

  // Modals state
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [diffModalOpen, setDiffModalOpen] = useState(false);
  const [diffData, setDiffData] = useState<{
    actionTitle: string;
    originalText: string;
    revisedText: string;
    revisedHtml?: string;
    isEntireDocument: boolean;
  }>({
    actionTitle: '',
    originalText: '',
    revisedText: '',
    isEntireDocument: false,
  });

  // AI loading and dropdown states
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load documents on user login
  useEffect(() => {
    async function loadUserDocs() {
      if (!user) {
        // Load recovery draft from localStorage if available
        const local = getLocalRecoveryDraft('default');
        if (local && local.content) {
          setCurrentDoc((prev) => ({
            ...prev,
            title: local.title || prev.title,
            content: local.content || prev.content,
            wordCount: local.wordCount || prev.wordCount,
          }));
        }
        return;
      }

      try {
        const docs = await getUserDocuments(user.uid, 50);
        setDocuments(docs);
        if (docs.length > 0) {
          setCurrentDoc(docs[0]);
        } else {
          // Create initial starter document in Firestore for first-time user
          const starter = await createDocument(user.uid, {
            title: 'Welcome to Writer',
            content: INITIAL_DEFAULT_CONTENT,
            plainText: 'Welcome to Writer',
            documentType: 'blank',
            wordCount: 42,
            characterCount: 260,
          });
          setDocuments([starter]);
          setCurrentDoc(starter);
        }
      } catch (err) {
        console.warn('Error fetching user documents:', err);
      }
    }

    loadUserDocs();
  }, [user]);

  // Debounced Autosave Handler
  const triggerAutoSave = useCallback(
    (updates: Partial<WriterDocument>) => {
      setSaveStatus('unsaved');

      if (pendingSaveTimeoutRef.current) {
        clearTimeout(pendingSaveTimeoutRef.current);
      }

      pendingSaveTimeoutRef.current = setTimeout(async () => {
        setSaveStatus('saving');
        const now = Date.now();
        lastSaveTimeRef.current = now;

        try {
          if (user && currentDoc.id && currentDoc.id !== 'local-init') {
            await updateDocument(user.uid, currentDoc.id, {
              ...updates,
              updatedAt: now,
            });

            // Update in documents list
            setDocuments((prev) =>
              prev.map((d) => (d.id === currentDoc.id ? { ...d, ...updates, updatedAt: now } : d))
            );
          } else {
            // Local recovery save
            saveLocalRecoveryDraft('default', {
              ...currentDoc,
              ...updates,
              updatedAt: now,
            });
          }
          setSaveStatus('saved');
        } catch (err) {
          console.error('Autosave error:', err);
          setSaveStatus('failed');
        }
      }, 1200);
    },
    [user, currentDoc]
  );

  // Undo snapshot helper
  const saveToUndoHistory = useCallback((title: string, content: string) => {
    undoHistoryRef.current.push({ title, content });
    if (undoHistoryRef.current.length > 25) {
      undoHistoryRef.current.shift();
    }
  }, []);

  // Editor content changes
  const handleEditorChange = (
    html: string,
    plainText: string,
    words: number,
    chars: number
  ) => {
    setRevision((r) => r + 1);
    setCurrentDoc((prev) => ({
      ...prev,
      content: html,
      plainText,
      wordCount: words,
      characterCount: chars,
    }));

    triggerAutoSave({
      content: html,
      plainText,
      wordCount: words,
      characterCount: chars,
    });
  };

  // Title changes
  const handleTitleChange = (newTitle: string) => {
    setCurrentDoc((prev) => ({ ...prev, title: newTitle }));
    triggerAutoSave({ title: newTitle });
  };

  // Selection update from editor
  const handleSelectionChange = (text: string) => {
    setSelectedText(text);
  };

  // Create new blank document
  const handleNewDocument = async () => {
    const blankData = {
      title: 'Untitled Document',
      content: '<p></p>',
      plainText: '',
      documentType: 'blank',
      wordCount: 0,
      characterCount: 0,
    };

    if (user) {
      try {
        const created = await createDocument(user.uid, blankData);
        setDocuments((prev) => [created, ...prev]);
        setCurrentDoc(created);
        editorRef.current?.setContent('<p></p>');
      } catch (err) {
        console.error('Error creating doc:', err);
      }
    } else {
      const localDoc: WriterDocument = {
        id: `doc-${Date.now()}`,
        userId: 'guest',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        ...blankData,
      };
      setDocuments((prev) => [localDoc, ...prev]);
      setCurrentDoc(localDoc);
      editorRef.current?.setContent('<p></p>');
    }
  };

  // Select existing document
  const handleSelectDocument = (doc: WriterDocument) => {
    setCurrentDoc(doc);
    editorRef.current?.setContent(doc.content || '<p></p>');
    setIsMobileLeftOpen(false);
  };

  // Rename document
  const handleRenameDocument = async (docId: string, newTitle: string) => {
    if (user && docId !== 'local-init') {
      await updateDocument(user.uid, docId, { title: newTitle });
    }
    setDocuments((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, title: newTitle } : d))
    );
    if (currentDoc.id === docId) {
      setCurrentDoc((prev) => ({ ...prev, title: newTitle }));
    }
  };

  // Delete document
  const handleDeleteDocument = async (docId: string) => {
    if (user && docId !== 'local-init') {
      await deleteDocument(user.uid, docId);
    }
    const remaining = documents.filter((d) => d.id !== docId);
    setDocuments(remaining);
    if (currentDoc.id === docId) {
      if (remaining.length > 0) {
        handleSelectDocument(remaining[0]);
      } else {
        handleNewDocument();
      }
    }
  };

  // Handle template selection and draft generation
  const handleSelectTemplate = async (
    template: DocumentTemplate,
    formData: Record<string, string>,
    instructions: string,
    tone: ToneOption,
    language: LanguageOption,
    useAI: boolean
  ) => {
    if (!useAI) {
      // Use standard outline without AI
      const scaffold = template.scaffoldHtml || '<p></p>';
      const newTitle = template.title || 'New Document';
      setCurrentDoc((prev) => ({ ...prev, title: newTitle, content: scaffold }));
      editorRef.current?.setContent(scaffold);
      triggerAutoSave({ title: newTitle, content: scaffold });
      setTemplateModalOpen(false);
      return;
    }

    setIsAIGenerating(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/writer/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: template.id,
          templateTitle: template.title,
          category: template.category,
          formData,
          instructions,
          tone,
          language,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate draft.');
      }

      const generatedHtml = data.data.contentHtml;
      const newTitle = template.title || currentDoc.title;

      setCurrentDoc((prev) => ({
        ...prev,
        title: newTitle,
        content: generatedHtml,
        wordCount: data.data.wordCount,
      }));
      editorRef.current?.setContent(generatedHtml);
      triggerAutoSave({ title: newTitle, content: generatedHtml, wordCount: data.data.wordCount });
      setTemplateModalOpen(false);
    } catch (err: any) {
      console.error('Template generation error:', err);
      setErrorMessage(err.message || 'AI generation failed. Please try again.');
    } finally {
      setIsAIGenerating(false);
    }
  };

  // Handle freeform AI draft generation from assistant panel
  const handleGenerateDraft = async (
    instructions: string,
    tone: ToneOption,
    language: LanguageOption
  ) => {
    setIsAIGenerating(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/writer/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instructions,
          tone,
          language,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate draft.');
      }

      const generatedHtml = data.data.contentHtml;

      // Ask confirmation via Diff modal before replacing full content
      setDiffData({
        actionTitle: 'Generate Draft from Instructions',
        originalText: currentDoc.plainText || currentDoc.content.replace(/<[^>]+>/g, ' '),
        revisedText: data.data.plainText,
        revisedHtml: generatedHtml,
        isEntireDocument: true,
      });
      setDiffModalOpen(true);
    } catch (err: any) {
      console.error('Draft generation error:', err);
      setErrorMessage(err.message || 'AI generation failed.');
    } finally {
      setIsAIGenerating(false);
    }
  };

  // Handle targeted 1-click AI actions (improve, professional, simplify, etc.)
  const handleExecuteAction = async (
    action: AIWritingAction,
    actionInstructions?: string,
    targetTone?: ToneOption,
    targetLanguage?: LanguageOption
  ) => {
    const isSelection = selectedText && selectedText.trim().length > 0;
    const targetText = isSelection
      ? selectedText
      : currentDoc.plainText || currentDoc.content.replace(/<[^>]+>/g, ' ');

    if (!targetText || !targetText.trim()) {
      setErrorMessage('Please type some text or select a section to refine.');
      return;
    }

    setIsAIGenerating(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/writer/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          selectedText: targetText,
          fullDocumentText: currentDoc.plainText,
          instructions: actionInstructions,
          targetTone,
          targetLanguage,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to execute writing action.');
      }

      const formatActionName = (act: string) => {
        return act
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
      };

      setDiffData({
        actionTitle: formatActionName(action),
        originalText: targetText,
        revisedText: data.data.revisedText,
        revisedHtml: data.data.revisedHtml,
        isEntireDocument: !isSelection,
      });
      setDiffModalOpen(true);
    } catch (err: any) {
      console.error('AI action error:', err);
      setErrorMessage(err.message || 'Action failed to execute.');
    } finally {
      setIsAIGenerating(false);
    }
  };

  // Confirm Diff Acceptance
  const handleAcceptDiff = () => {
    if (!diffData.revisedHtml) {
      setDiffModalOpen(false);
      return;
    }

    saveToUndoHistory(currentDoc.title, currentDoc.content);

    if (diffData.isEntireDocument) {
      setCurrentDoc((prev) => ({
        ...prev,
        content: diffData.revisedHtml!,
      }));
      editorRef.current?.setContent(diffData.revisedHtml);
      triggerAutoSave({ content: diffData.revisedHtml });
    } else {
      editorRef.current?.replaceSelection(diffData.revisedHtml);
    }

    setDiffModalOpen(false);
  };

  // ----------------------------------------------------
  // CONVERSATIONAL AI AGENT: OPERATION EXECUTION ENGINE
  // ----------------------------------------------------

  const executeAgentOperation = useCallback(
    async (op: AgentDocumentOperation): Promise<{ success: boolean; message?: string }> => {
      saveToUndoHistory(currentDoc.title, currentDoc.content);

      switch (op.operation) {
        case 'create_document': {
          const payload = op.payload as any;
          const newTitle = payload.title || 'New Document';
          const newContent = payload.content;

          // If current doc is empty/welcome doc or user requested create_document
          if (user) {
            try {
              const created = await createDocument(user.uid, {
                title: newTitle,
                content: newContent,
                plainText: newContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
                documentType: payload.documentType || 'general',
                wordCount: newContent.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).length,
                characterCount: newContent.length,
              });
              setDocuments((prev) => [created, ...prev]);
              setCurrentDoc(created);
              editorRef.current?.setContent(newContent);
            } catch (err) {
              console.error('Error creating doc in Firestore:', err);
              // Fallback local
              setCurrentDoc((prev) => ({
                ...prev,
                title: newTitle,
                content: newContent,
              }));
              editorRef.current?.setContent(newContent);
              triggerAutoSave({ title: newTitle, content: newContent });
            }
          } else {
            const localDoc: WriterDocument = {
              id: `doc-${Date.now()}`,
              userId: 'guest',
              title: newTitle,
              content: newContent,
              plainText: newContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
              documentType: payload.documentType || 'general',
              wordCount: newContent.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).length,
              characterCount: newContent.length,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            };
            setDocuments((prev) => [localDoc, ...prev]);
            setCurrentDoc(localDoc);
            editorRef.current?.setContent(newContent);
            triggerAutoSave({ title: newTitle, content: newContent });
          }
          return { success: true };
        }

        case 'replace_document': {
          const payload = op.payload as any;
          const newContent = payload.content;
          const newTitle = payload.title || currentDoc.title;

          setCurrentDoc((prev) => ({
            ...prev,
            title: newTitle,
            content: newContent,
          }));
          editorRef.current?.setContent(newContent);
          triggerAutoSave({ title: newTitle, content: newContent });
          return { success: true };
        }

        case 'edit_selection': {
          const payload = op.payload as any;
          editorRef.current?.replaceSelection(payload.replacementHtml);
          const updatedHtml = editorRef.current?.getHtml() || currentDoc.content;
          setCurrentDoc((prev) => ({ ...prev, content: updatedHtml }));
          triggerAutoSave({ content: updatedHtml });
          return { success: true };
        }

        case 'replace_range': {
          const payload = op.payload as any;
          const replaced = editorRef.current?.replaceExcerpt(
            payload.targetExcerpt,
            payload.replacementContent
          );
          if (replaced) {
            const updatedHtml = editorRef.current?.getHtml() || currentDoc.content;
            setCurrentDoc((prev) => ({ ...prev, content: updatedHtml }));
            triggerAutoSave({ content: updatedHtml });
            return { success: true };
          } else {
            return {
              success: false,
              message: `Could not reliably locate the target section ("${payload.targetExcerpt.slice(0, 30)}..."). Please select the section directly.`,
            };
          }
        }

        case 'insert_text': {
          const payload = op.payload as any;
          if (payload.position === 'beginning') {
            editorRef.current?.prependContent(payload.content);
          } else if (payload.position === 'end') {
            editorRef.current?.appendContent(payload.content);
          } else {
            editorRef.current?.insertContent(payload.content);
          }
          const updatedHtml = editorRef.current?.getHtml() || currentDoc.content;
          setCurrentDoc((prev) => ({ ...prev, content: updatedHtml }));
          triggerAutoSave({ content: updatedHtml });
          return { success: true };
        }

        case 'append_text': {
          const payload = op.payload as any;
          editorRef.current?.appendContent(payload.content);
          const updatedHtml = editorRef.current?.getHtml() || currentDoc.content;
          setCurrentDoc((prev) => ({ ...prev, content: updatedHtml }));
          triggerAutoSave({ content: updatedHtml });
          return { success: true };
        }

        case 'format_document': {
          const payload = op.payload as any;
          const formatted = payload.formattedContent;
          setCurrentDoc((prev) => ({ ...prev, content: formatted }));
          editorRef.current?.setContent(formatted);
          triggerAutoSave({ content: formatted });
          return { success: true };
        }

        case 'rename_document': {
          const payload = op.payload as any;
          handleTitleChange(payload.title);
          return { success: true };
        }

        case 'summarize_document': {
          // Handled visually in chat message
          return { success: true };
        }

        case 'translate_document': {
          const payload = op.payload as any;
          const translated = payload.translatedContent;
          setCurrentDoc((prev) => ({ ...prev, content: translated }));
          editorRef.current?.setContent(translated);
          triggerAutoSave({ content: translated });
          return { success: true };
        }

        case 'export_document': {
          const payload = op.payload as any;
          const format = payload.format;
          const title = payload.filename || currentDoc.title;
          if (format === 'docx') {
            await exportToDocx(title, currentDoc.content);
          } else if (format === 'txt') {
            exportToTxt(title, currentDoc.content);
          } else if (format === 'pdf') {
            exportToPdf(title, currentDoc.content);
          }
          return { success: true };
        }

        case 'undo_last_change': {
          if (undoHistoryRef.current.length > 0) {
            const lastState = undoHistoryRef.current.pop()!;
            setCurrentDoc((prev) => ({
              ...prev,
              title: lastState.title,
              content: lastState.content,
            }));
            editorRef.current?.setContent(lastState.content);
            triggerAutoSave({ title: lastState.title, content: lastState.content });
            return { success: true };
          }
          return { success: false, message: 'No previous AI changes found to undo.' };
        }

        default:
          return { success: false, message: 'Unsupported document operation.' };
      }
    },
    [currentDoc, user, saveToUndoHistory, triggerAutoSave, handleTitleChange]
  );

  // Send message to AI Writing Agent
  const handleSendAgentMessage = async (userInputText: string) => {
    setErrorMessage(null);
    setIsAIGenerating(true);

    const userMsgId = `msg-${Date.now()}`;
    const userMsg: AgentChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: userInputText,
      timestamp: Date.now(),
    };

    const newMessages = [...chatMessages, userMsg];
    setChatMessages(newMessages);

    const controller = new AbortController();
    agentAbortControllerRef.current = controller;

    // Snapshot current revision before making AI request (for stale edit protection)
    const requestStartRevision = revision;
    const requestStartHtml = editorRef.current?.getHtml() || currentDoc.content;
    const currentExcerptSelection = selectedText;

    try {
      const response = await fetch('/api/writer/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text,
          })),
          context: {
            currentDocumentId: currentDoc.id,
            currentTitle: currentDoc.title,
            currentContentHtml: requestStartHtml,
            currentPlainText: currentDoc.plainText || requestStartHtml.replace(/<[^>]+>/g, ' '),
            selectedText: currentExcerptSelection || undefined,
            documentRevision: requestStartRevision,
            wordCount: currentDoc.wordCount,
            characterCount: currentDoc.characterCount,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        }),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Agent request failed.');
      }

      const agentData: AgentChatResponse = resData.data;
      const assistantMsgId = `asst-${Date.now()}`;

      if (agentData.operation) {
        const op = agentData.operation;

        // Check if editor changed while generation was running
        const currentNowRevision = revision;
        if (
          currentNowRevision !== requestStartRevision &&
          (op.operation === 'replace_document' || op.operation === 'replace_range' || op.operation === 'edit_selection')
        ) {
          // Document was edited during request: safeguard against stale overwrite!
          setChatMessages((prev) => [
            ...prev,
            {
              id: assistantMsgId,
              sender: 'assistant',
              text: `${agentData.message}\n\n⚠️ Notice: You edited the document while this response was generating. To prevent overwriting your latest manual edits, please review the proposed change below before applying.`,
              timestamp: Date.now(),
              operation: op,
              status: 'pending',
              followUpQuestions: agentData.followUpQuestions,
              suggestions: agentData.suggestedPrompts,
            },
          ]);
          return;
        }

        // Substantial changes trigger preview confirmation
        if (op.requiresConfirmation) {
          const payload = op.payload as any;
          setDiffData({
            actionTitle:
              op.operation === 'replace_document'
                ? payload.summaryOfChanges || 'Replace Document'
                : op.operation === 'translate_document'
                ? `Translate to ${payload.targetLanguage}`
                : 'Document Format',
            originalText: currentDoc.plainText || currentDoc.content.replace(/<[^>]+>/g, ' '),
            revisedText: (payload.content || payload.formattedContent || payload.translatedContent || '').replace(/<[^>]+>/g, ' '),
            revisedHtml: payload.content || payload.formattedContent || payload.translatedContent,
            isEntireDocument: true,
          });
          setDiffModalOpen(true);

          setChatMessages((prev) => [
            ...prev,
            {
              id: assistantMsgId,
              sender: 'assistant',
              text: agentData.message,
              timestamp: Date.now(),
              operation: op,
              status: 'pending',
              followUpQuestions: agentData.followUpQuestions,
              suggestions: agentData.suggestedPrompts,
            },
          ]);
        } else {
          // Safe / targeted operations apply directly
          const execRes = await executeAgentOperation(op);
          setChatMessages((prev) => [
            ...prev,
            {
              id: assistantMsgId,
              sender: 'assistant',
              text: execRes.success
                ? agentData.message
                : `${agentData.message}\n\n⚠️ ${execRes.message || 'Could not apply change.'}`,
              timestamp: Date.now(),
              operation: op,
              status: execRes.success ? 'applied' : 'failed',
              followUpQuestions: agentData.followUpQuestions,
              suggestions: agentData.suggestedPrompts,
            },
          ]);
        }
      } else {
        // Plain conversational / question response
        setChatMessages((prev) => [
          ...prev,
          {
            id: assistantMsgId,
            sender: 'assistant',
            text: agentData.message,
            timestamp: Date.now(),
            followUpQuestions: agentData.followUpQuestions,
            suggestions: agentData.suggestedPrompts,
          },
        ]);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setChatMessages((prev) => [
          ...prev,
          {
            id: `abort-${Date.now()}`,
            sender: 'system',
            text: 'Generation stopped by user.',
            timestamp: Date.now(),
          },
        ]);
      } else {
        console.error('Agent chat error:', err);
        setErrorMessage(err.message || 'AI Agent failed to respond.');
        setChatMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            sender: 'assistant',
            text: `I encountered an issue: ${err.message || 'Please retry your message.'}`,
            timestamp: Date.now(),
            status: 'failed',
          },
        ]);
      }
    } finally {
      setIsAIGenerating(false);
      agentAbortControllerRef.current = null;
    }
  };

  const handleApplyPendingOperation = async (msgId: string, op: AgentDocumentOperation) => {
    const res = await executeAgentOperation(op);
    setChatMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, status: res.success ? 'applied' : 'failed' } : m))
    );
  };

  const handleRejectPendingOperation = (msgId: string) => {
    setChatMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, status: 'rejected' } : m))
    );
  };

  const handleStopAgentGeneration = () => {
    if (agentAbortControllerRef.current) {
      agentAbortControllerRef.current.abort();
    }
  };

  const handleClearChat = () => {
    setChatMessages([]);
  };

  // Copy Document Handler
  const handleCopyDocument = async () => {
    const ok = await copyFormattedText(currentDoc.content);
    if (ok) {
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2000);
    }
  };

  return (
    <div className="relative flex flex-col h-[calc(100vh-4.25rem)] overflow-hidden bg-[#FAF9FF]">
      {/* Top Action Bar */}
      <div className="h-14 bg-white/80 backdrop-blur-md border-b border-[#8E84E0]/20 px-4 flex items-center justify-between shrink-0 z-30">
        {/* Left Controls: Sidebar toggle & Title */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            type="button"
            onClick={() => {
              if (window.innerWidth < 1024) {
                setIsMobileLeftOpen(!isMobileLeftOpen);
              } else {
                setIsLeftOpen(!isLeftOpen);
              }
            }}
            title={isLeftOpen ? 'Collapse sidebar' : 'Open sidebar'}
            className="p-1.5 rounded-xl text-[#6F7088] hover:text-[#15152B] hover:bg-[#F4F2FF] border border-[#8E84E0]/20 transition-colors"
          >
            {isLeftOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
          </button>

          {/* Editable Document Title */}
          <div className="min-w-0 max-w-[280px] sm:max-w-md">
            <input
              type="text"
              value={currentDoc.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Untitled Document"
              className="text-sm sm:text-base font-extrabold text-[#15152B] bg-transparent hover:bg-[#F4F2FF]/60 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6654F5] rounded-lg px-2 py-1 truncate transition-all w-full"
            />
          </div>

          {/* Autosave Status Pill */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs">
            {saveStatus === 'saving' && (
              <span className="flex items-center gap-1 text-[#6654F5] font-medium bg-[#EBE8FF] px-2 py-0.5 rounded-full text-[11px]">
                <Loader2 className="w-3 h-3 animate-spin" /> Saving...
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="flex items-center gap-1 text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full text-[11px] border border-emerald-200">
                <Cloud className="w-3 h-3 text-emerald-600" /> Saved
              </span>
            )}
            {saveStatus === 'unsaved' && (
              <span className="flex items-center gap-1 text-[#6F7088] font-normal text-[11px]">
                <CloudOff className="w-3 h-3 text-[#9596AA]" /> Unsaved
              </span>
            )}
            {saveStatus === 'failed' && (
              <span className="flex items-center gap-1 text-rose-600 font-medium bg-rose-50 px-2 py-0.5 rounded-full text-[11px] border border-rose-200">
                Save failed
              </span>
            )}
          </div>
        </div>

        {/* Right Controls: Templates, Export, Copy, AI toggle */}
        <div className="flex items-center gap-2">
          {/* Templates Trigger */}
          <button
            type="button"
            onClick={() => setTemplateModalOpen(true)}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#15152B] bg-white hover:bg-[#F4F2FF] border border-[#8E84E0]/25 rounded-xl shadow-2xs transition-colors"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-[#6654F5]" />
            <span>Templates</span>
          </button>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopyDocument}
            title="Copy document formatted text"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#15152B] bg-white hover:bg-[#F4F2FF] border border-[#8E84E0]/25 rounded-xl shadow-2xs transition-colors"
          >
            {copiedToast ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#6F7088]" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#15152B] bg-white hover:bg-[#F4F2FF] border border-[#8E84E0]/25 rounded-xl shadow-2xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#6654F5]" />
              <span className="hidden sm:inline">Export</span>
              <ChevronDown className="w-3 h-3 text-[#6F7088]" />
            </button>

            {exportMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-48 bg-white border border-[#8E84E0]/20 rounded-xl shadow-card py-1.5 z-40 animate-fade-in text-xs"
                onMouseLeave={() => setExportMenuOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => {
                    exportToTxt(currentDoc.title, currentDoc.content);
                    setExportMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[#15152B] hover:bg-[#F4F2FF] text-left transition-colors"
                >
                  <FileCode className="w-4 h-4 text-[#6654F5]" />
                  <span>Plain Text (.txt)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    exportToDocx(currentDoc.title, currentDoc.content);
                    setExportMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[#15152B] hover:bg-[#F4F2FF] text-left transition-colors"
                >
                  <FileText className="w-4 h-4 text-[#6654F5]" />
                  <span>Word Document (.docx)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    exportToPdf(currentDoc.title, currentDoc.content);
                    setExportMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[#15152B] hover:bg-[#F4F2FF] text-left transition-colors border-t border-[#8E84E0]/15"
                >
                  <Printer className="w-4 h-4 text-[#6654F5]" />
                  <span>Print / Save as PDF</span>
                </button>
              </div>
            )}
          </div>

          {/* AI Panel Toggle */}
          <button
            type="button"
            onClick={() => {
              if (window.innerWidth < 1024) {
                setIsMobileRightOpen(!isMobileRightOpen);
              } else {
                setIsRightOpen(!isRightOpen);
              }
            }}
            title={isRightOpen ? 'Collapse AI panel' : 'Open AI panel'}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
              isRightOpen
                ? 'bg-[#EBE8FF] text-[#5542E5] border-[#6654F5]/30'
                : 'bg-white text-[#6F7088] border-[#8E84E0]/20 hover:text-[#15152B]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#6654F5]" />
            <span className="hidden sm:inline">AI Assistant</span>
            {isRightOpen ? <PanelRightClose className="w-3.5 h-3.5 ml-0.5" /> : <PanelRightOpen className="w-3.5 h-3.5 ml-0.5" />}
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="bg-rose-50 border-b border-rose-200 px-4 py-2 text-xs text-rose-700 flex items-center justify-between z-20">
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-500 hover:text-rose-700 font-bold ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main 3-Column Workspace Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar (Desktop) */}
        <div className="hidden lg:block h-full shrink-0">
          <WriterSidebar
            isOpen={isLeftOpen}
            onToggle={() => setIsLeftOpen(!isLeftOpen)}
            documents={documents}
            currentDocumentId={currentDoc.id}
            onSelectDocument={handleSelectDocument}
            onNewDocument={handleNewDocument}
            onOpenTemplates={() => setTemplateModalOpen(true)}
            onRenameDocument={handleRenameDocument}
            onDeleteDocument={handleDeleteDocument}
          />
        </div>

        {/* Left Sidebar (Mobile Drawer) */}
        <div className="lg:hidden">
          <WriterSidebar
            isOpen={isMobileLeftOpen}
            onToggle={() => setIsMobileLeftOpen(!isMobileLeftOpen)}
            documents={documents}
            currentDocumentId={currentDoc.id}
            onSelectDocument={handleSelectDocument}
            onNewDocument={handleNewDocument}
            onOpenTemplates={() => setTemplateModalOpen(true)}
            onRenameDocument={handleRenameDocument}
            onDeleteDocument={handleDeleteDocument}
            isMobile
          />
        </div>

        {/* Center Main Editor View */}
        <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col space-y-3">
            <RichTextEditor
              ref={editorRef}
              initialContent={currentDoc.content}
              onChange={handleEditorChange}
              onSelectionChange={handleSelectionChange}
              placeholder="Start drafting your document..."
            />

            {/* Bottom Status & Count Strip */}
            <div className="flex items-center justify-between text-xs text-[#6F7088] px-2 py-1">
              <div className="flex items-center gap-3">
                <span>{currentDoc.wordCount || 0} words</span>
                <span>·</span>
                <span>{currentDoc.characterCount || 0} characters</span>
              </div>
              <div className="text-[11px] text-[#9596AA]">
                Autosaved to your private workspace
              </div>
            </div>
          </div>
        </div>

        {/* Right AI Assistant Panel (Desktop) */}
        <div className="hidden lg:block h-full shrink-0">
          <AIAssistantPanel
            isOpen={isRightOpen}
            onToggle={() => setIsRightOpen(!isRightOpen)}
            selectedText={selectedText}
            isGenerating={isAIGenerating}
            chatMessages={chatMessages}
            onSendMessage={handleSendAgentMessage}
            onClearChat={handleClearChat}
            onStopGeneration={handleStopAgentGeneration}
            onApplyPendingOperation={handleApplyPendingOperation}
            onRejectPendingOperation={handleRejectPendingOperation}
            onGenerateDraft={handleGenerateDraft}
            onExecuteAction={handleExecuteAction}
          />
        </div>

        {/* Right AI Assistant Panel (Mobile Drawer) */}
        <div className="lg:hidden">
          <AIAssistantPanel
            isOpen={isMobileRightOpen}
            onToggle={() => setIsMobileRightOpen(!isMobileRightOpen)}
            selectedText={selectedText}
            isGenerating={isAIGenerating}
            chatMessages={chatMessages}
            onSendMessage={handleSendAgentMessage}
            onClearChat={handleClearChat}
            onStopGeneration={handleStopAgentGeneration}
            onApplyPendingOperation={handleApplyPendingOperation}
            onRejectPendingOperation={handleRejectPendingOperation}
            onGenerateDraft={handleGenerateDraft}
            onExecuteAction={handleExecuteAction}
            isMobile
          />
        </div>
      </div>

      {/* Template Selection Modal */}
      <TemplateModal
        isOpen={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
        isGenerating={isAIGenerating}
      />

      {/* Diff Confirmation Modal */}
      <DiffComparisonModal
        isOpen={diffModalOpen}
        actionTitle={diffData.actionTitle}
        originalText={diffData.originalText}
        revisedText={diffData.revisedText}
        revisedHtml={diffData.revisedHtml}
        isEntireDocument={diffData.isEntireDocument}
        onAccept={handleAcceptDiff}
        onCancel={() => setDiffModalOpen(false)}
      />
    </div>
  );
}
