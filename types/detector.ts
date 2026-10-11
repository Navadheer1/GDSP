export type DetectorPatternAssessment =
  | 'ai-like'
  | 'human-like'
  | 'mixed-or-inconclusive';

export interface SentenceStat {
  index: number;
  text: string;
  wordCount: number;
  isFlagged?: boolean;
  flagReason?: string;
}

export interface PassageAnalysis {
  id: string;
  text: string;
  patternType:
    | 'uniform-cadence'
    | 'formulaic-transition'
    | 'repetitive-structure'
    | 'varied-human-cadence'
    | 'idiosyncratic'
    | 'neutral';
  title: string;
  explanation: string;
}

export interface WritingCharacteristics {
  totalWords: number;
  totalSentences: number;
  totalParagraphs: number;
  averageSentenceLength: number;
  sentenceLengthStdDev: number;
  sentenceVariationCoefficient: number; // CV = stdDev / mean (burstiness measure)
  vocabularyDiversityRatio: number; // Unique words / total words
  repeatedPhrases: { phrase: string; count: number }[];
  formulaicTransitionsFound: { transition: string; count: number }[];
}

export interface DetectorAnalysisRequest {
  text: string;
}

export interface DetectorAnalysisResult {
  assessment: DetectorPatternAssessment;
  assessmentLabel: string;
  summaryExplanation: string;
  writingCharacteristics: WritingCharacteristics;
  passages: PassageAnalysis[];
  sentences: SentenceStat[];
  limitations: string[];
  analysisTimestamp: number;
}
