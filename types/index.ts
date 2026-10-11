export type WritingContext =
  | 'recruiter-feedback'
  | 'candidate-comm'
  | 'interview-questions'
  | 'interview-summary'
  | 'professional-report'
  | 'general-writing';

export type WritingTone = 'professional' | 'polished' | 'conversational';

export interface HumanizeRequest {
  text: string;
  context: WritingContext;
  tone: WritingTone;
  customInstructions?: string;
}

export interface VerificationCheck {
  id: string;
  category: 'numbers' | 'dates' | 'entities' | 'intent' | 'claims';
  title: string;
  status: 'passed' | 'warning' | 'failed';
  details: string;
  evidence?: {
    original?: string[];
    rewritten?: string[];
  };
}

export interface TruthGuardResult {
  score: number; // 0 - 100
  passed: boolean;
  summary: string;
  deterministicChecks: VerificationCheck[];
  semanticVerification: {
    status: 'verified' | 'caution' | 'failed';
    meaningPreserved: boolean;
    unsupportedClaimsFound: boolean;
    tonalShiftAppropriate: boolean;
    semanticExplanation: string;
  };
}

export interface HumanizeResponse {
  originalText: string;
  humanizedText: string;
  context: WritingContext;
  tone: WritingTone;
  truthGuard: TruthGuardResult;
  stats: {
    originalWords: number;
    originalChars: number;
    rewrittenWords: number;
    rewrittenChars: number;
    readingTimeSeconds: number;
  };
}

export interface SavedHistoryItem {
  id?: string;
  userId: string;
  originalText: string;
  humanizedText: string;
  context: WritingContext;
  tone: WritingTone;
  verificationStatus: 'passed' | 'warning' | 'failed';
  verificationScore: number;
  createdAt: number;
}
