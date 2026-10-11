'use client';

import React, { useState, useMemo } from 'react';
import { DOCUMENT_TEMPLATES } from '@/lib/writer/templates';
import { DocumentTemplate, DocumentCategory, ToneOption, LanguageOption } from '@/types/writer';
import {
  X,
  Search,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  Mail,
  Calendar,
  CheckSquare,
  FileQuestion,
  AlertCircle,
  LogOut,
  GraduationCap,
  Briefcase,
  HeartHandshake,
  Clock,
  Send,
  AlertTriangle,
  Users,
  HelpCircle,
  Smile,
  BookOpen,
  FileText,
  DollarSign,
  User,
  Mic,
  Megaphone,
  ListChecks,
  PenTool,
  File,
  Loader2,
} from 'lucide-react';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (
    template: DocumentTemplate,
    formData: Record<string, string>,
    instructions: string,
    tone: ToneOption,
    language: LanguageOption,
    useAI: boolean
  ) => Promise<void>;
  isGenerating?: boolean;
}

const CATEGORY_TABS: { id: DocumentCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All Templates' },
  { id: 'letters', label: 'Letters' },
  { id: 'emails', label: 'Emails' },
  { id: 'other', label: 'Documents & Reports' },
  { id: 'blank', label: 'Blank / Custom' },
];

const TONE_OPTIONS: ToneOption[] = [
  'Formal',
  'Professional',
  'Friendly',
  'Polite',
  'Persuasive',
  'Academic',
  'Casual',
];

const LANGUAGE_OPTIONS: LanguageOption[] = [
  'English',
  'Spanish',
  'French',
  'German',
  'Italian',
  'Portuguese',
  'Hindi',
  'Chinese',
  'Japanese',
  'Arabic',
];

// Helper to render icon dynamically
function getTemplateIcon(iconName: string) {
  const iconProps = { className: 'w-4 h-4' };
  switch (iconName) {
    case 'Mail': return <Mail {...iconProps} />;
    case 'Calendar': return <Calendar {...iconProps} />;
    case 'CheckSquare': return <CheckSquare {...iconProps} />;
    case 'FileQuestion': return <FileQuestion {...iconProps} />;
    case 'AlertCircle': return <AlertCircle {...iconProps} />;
    case 'LogOut': return <LogOut {...iconProps} />;
    case 'GraduationCap': return <GraduationCap {...iconProps} />;
    case 'Briefcase': return <Briefcase {...iconProps} />;
    case 'HeartHandshake': return <HeartHandshake {...iconProps} />;
    case 'Clock': return <Clock {...iconProps} />;
    case 'Send': return <Send {...iconProps} />;
    case 'AlertTriangle': return <AlertTriangle {...iconProps} />;
    case 'Users': return <Users {...iconProps} />;
    case 'HelpCircle': return <HelpCircle {...iconProps} />;
    case 'Smile': return <Smile {...iconProps} />;
    case 'BookOpen': return <BookOpen {...iconProps} />;
    case 'FileText': return <FileText {...iconProps} />;
    case 'DollarSign': return <DollarSign {...iconProps} />;
    case 'User': return <User {...iconProps} />;
    case 'Mic': return <Mic {...iconProps} />;
    case 'Megaphone': return <Megaphone {...iconProps} />;
    case 'ListChecks': return <ListChecks {...iconProps} />;
    case 'PenTool': return <PenTool {...iconProps} />;
    default: return <File {...iconProps} />;
  }
}

export function TemplateModal({
  isOpen,
  onClose,
  onSelectTemplate,
  isGenerating = false,
}: TemplateModalProps) {
  const [activeCategory, setActiveCategory] = useState<DocumentCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);

  // Form states when template is selected
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [instructions, setInstructions] = useState('');
  const [selectedTone, setSelectedTone] = useState<ToneOption>('Professional');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>('English');

  const filteredTemplates = useMemo(() => {
    return DOCUMENT_TEMPLATES.filter((tpl) => {
      const matchCat = activeCategory === 'all' || tpl.category === activeCategory;
      const matchQuery =
        !searchQuery.trim() ||
        tpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tpl.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [activeCategory, searchQuery]);

  if (!isOpen) return null;

  const handlePickTemplate = (tpl: DocumentTemplate) => {
    if (tpl.id === 'blank-doc') {
      // Blank document opens right away without a prompt form
      onSelectTemplate(tpl, {}, '', 'Professional', 'English', false);
      onClose();
      return;
    }
    setSelectedTemplate(tpl);
    setFormValues({});
    setInstructions('');
    setSelectedTone((tpl.defaultTone as ToneOption) || 'Professional');
    setSelectedLanguage('English');
  };

  const handleGenerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;

    await onSelectTemplate(
      selectedTemplate,
      formValues,
      instructions,
      selectedTone,
      selectedLanguage,
      true
    );
  };

  const handleUseScaffoldOnly = () => {
    if (!selectedTemplate) return;
    onSelectTemplate(
      selectedTemplate,
      formValues,
      instructions,
      selectedTone,
      selectedLanguage,
      false
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#15152B]/50 backdrop-blur-sm transition-opacity"
        onClick={() => !isGenerating && onClose()}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-2xl max-w-3xl w-full border border-[#8E84E0]/20 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh] animate-fade-in">
        {/* Header */}
        <div className="px-6 py-4 bg-[#FAF9FF] border-b border-[#8E84E0]/15 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {selectedTemplate && (
              <button
                type="button"
                onClick={() => setSelectedTemplate(null)}
                className="p-1 rounded-lg text-[#6F7088] hover:text-[#15152B] hover:bg-white transition-colors"
                title="Back to templates list"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#6654F5] to-[#8A7CFF] text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#15152B]">
                {selectedTemplate ? selectedTemplate.title : 'Writing Templates'}
              </h2>
              <p className="text-xs text-[#6F7088]">
                {selectedTemplate
                  ? 'Fill in the details to generate your tailored draft'
                  : 'Select a template to generate structured letters, emails, or reports'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="p-1.5 text-[#6F7088] hover:text-[#15152B] rounded-lg hover:bg-[#F4F2FF] transition-colors disabled:opacity-40"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        {!selectedTemplate ? (
          /* STEP 1: BROWSE & SEARCH TEMPLATES */
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Search Bar & Tabs */}
            <div className="p-4 sm:p-5 bg-white border-b border-[#8E84E0]/10 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-[#8E84E0] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search templates (e.g., Leave Application, Resignation, Project Report...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-[#FAF9FF] border border-[#8E84E0]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6654F5] text-[#15152B] placeholder-[#9596AA]"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                {CATEGORY_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveCategory(tab.id)}
                    className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition-colors ${
                      activeCategory === tab.id
                        ? 'bg-[#EBE8FF] text-[#5542E5] border border-[#6654F5]/30'
                        : 'bg-[#FAF9FF] text-[#6F7088] border border-[#8E84E0]/15 hover:bg-[#F4F2FF] hover:text-[#15152B]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Template Grid */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {filteredTemplates.length > 0 ? (
                filteredTemplates.map((tpl) => (
                  <div
                    key={tpl.id}
                    onClick={() => handlePickTemplate(tpl)}
                    className="group p-4 rounded-xl border border-[#8E84E0]/20 hover:border-[#6654F5]/40 hover:bg-[#FAF9FF] transition-all cursor-pointer flex flex-col justify-between shadow-2xs hover:shadow-card"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-lg bg-[#F4F2FF] group-hover:bg-[#EBE8FF] text-[#6654F5] flex items-center justify-center transition-colors">
                          {getTemplateIcon(tpl.iconName)}
                        </div>
                        <span className="text-[10px] font-semibold text-[#8E84E0] uppercase tracking-wider">
                          {tpl.category}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-[#15152B] group-hover:text-[#5542E5] transition-colors">
                        {tpl.title}
                      </h3>
                      <p className="text-xs text-[#6F7088] line-clamp-2 leading-relaxed">
                        {tpl.description}
                      </p>
                    </div>

                    <div className="pt-3 flex items-center justify-between text-xs font-semibold text-[#6654F5] group-hover:translate-x-0.5 transition-transform">
                      <span>Use Template</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-12 text-center text-[#6F7088] space-y-2">
                  <p className="text-sm font-semibold text-[#15152B]">No templates found</p>
                  <p className="text-xs">Try searching for something else or browse all templates.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* STEP 2: TEMPLATE FORM WITH RELEVANT FIELDS */
          <form onSubmit={handleGenerateSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="p-3 bg-[#FAF9FF] rounded-xl border border-[#8E84E0]/15 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#EBE8FF] text-[#5542E5] flex items-center justify-center">
                    {getTemplateIcon(selectedTemplate.iconName)}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#15152B]">{selectedTemplate.title}</h3>
                    <p className="text-[11px] text-[#6F7088]">{selectedTemplate.description}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleUseScaffoldOnly}
                  className="text-xs text-[#6654F5] hover:underline font-semibold"
                >
                  Start with Outline
                </button>
              </div>

              {/* Dynamic Relevant Fields */}
              {selectedTemplate.fields.length > 0 && (
                <div className="space-y-3.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#6F7088]">
                    Document Information
                  </h4>

                  {selectedTemplate.fields.map((field) => (
                    <div key={field.id} className="space-y-1">
                      <label className="block text-xs font-semibold text-[#15152B]">
                        {field.label}{' '}
                        {field.required ? (
                          <span className="text-rose-500">*</span>
                        ) : (
                          <span className="text-[#9596AA] font-normal">(optional)</span>
                        )}
                      </label>

                      {field.type === 'textarea' ? (
                        <textarea
                          rows={3}
                          placeholder={field.placeholder}
                          value={formValues[field.id] || ''}
                          onChange={(e) =>
                            setFormValues({ ...formValues, [field.id]: e.target.value })
                          }
                          className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#8E84E0]/25 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6654F5] text-[#15152B]"
                        />
                      ) : (
                        <input
                          type={field.type === 'date' ? 'date' : 'text'}
                          placeholder={field.placeholder}
                          value={formValues[field.id] || ''}
                          onChange={(e) =>
                            setFormValues({ ...formValues, [field.id]: e.target.value })
                          }
                          className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#8E84E0]/25 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6654F5] text-[#15152B]"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Additional User Instructions */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#15152B]">
                  Additional Instructions <span className="text-[#9596AA] font-normal">(optional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g., Emphasize our 5-year working relationship, keep it under 300 words..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#8E84E0]/25 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6654F5] text-[#15152B]"
                />
              </div>

              {/* Tone & Language Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-[#8E84E0]/15">
                <div>
                  <label className="block text-xs font-semibold text-[#15152B] mb-1">
                    Tone
                  </label>
                  <select
                    value={selectedTone}
                    onChange={(e) => setSelectedTone(e.target.value as ToneOption)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#8E84E0]/25 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6654F5] text-[#15152B]"
                  >
                    {TONE_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#15152B] mb-1">
                    Language
                  </label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value as LanguageOption)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#8E84E0]/25 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6654F5] text-[#15152B]"
                  >
                    {LANGUAGE_OPTIONS.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Form Footer */}
            <div className="px-6 py-4 bg-[#FAF9FF] border-t border-[#8E84E0]/15 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedTemplate(null)}
                disabled={isGenerating}
                className="px-4 py-2 text-xs font-semibold text-[#6F7088] hover:text-[#15152B] transition-colors"
              >
                Back
              </button>

              <button
                type="submit"
                disabled={isGenerating}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-[#6654F5] via-[#7563FF] to-[#8A7CFF] hover:from-[#5542E5] hover:to-[#7869FF] rounded-xl shadow-[0_4px_14px_rgba(102,84,245,0.3)] transition-all disabled:opacity-50 active:scale-[0.98]"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Generating Draft...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Complete Draft</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
