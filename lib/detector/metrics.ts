import { WritingCharacteristics, SentenceStat } from '@/types/detector';

const FORMULAIC_TRANSITIONS = [
  'furthermore',
  'moreover',
  'in conclusion',
  'additionally',
  'in summary',
  'it is important to note',
  'it is crucial to note',
  'it is essential to',
  'delve into',
  'serves as a testament',
  'testament to',
  'tapestry of',
  'beacon of',
  'pivotal role',
  'in today\'s fast-paced',
  'in today\'s world',
  'consequently',
  'subsequently',
  'by and large',
  'sheds light on',
];

/**
 * Tokenizes text into sentences while respecting common abbreviations
 */
export function tokenizeSentences(text: string): string[] {
  if (!text || !text.trim()) return [];

  // Protect common abbreviations before splitting
  const protectedText = text
    .replace(/(\b(?:Mr|Mrs|Ms|Dr|Prof|Sr|Jr|vs|etc|i\.e|e\.g)\.)/gi, (match) =>
      match.replace(/\./g, '__DOT__')
    )
    .replace(/(\d+)\.(\d+)/g, '$1__DOT__$2'); // Protect decimals

  // Split on sentence boundaries (. ! ?) followed by whitespace or line ending
  const rawSentences = protectedText.split(/(?<=[.!?])\s+|\n+/);

  return rawSentences
    .map((s) => s.replace(/__DOT__/g, '.').trim())
    .filter((s) => s.length > 0);
}

/**
 * Tokenizes text into clean lowercase words
 */
export function tokenizeWords(text: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 0);
}

/**
 * Calculates comprehensive deterministic linguistic metrics
 */
export function calculateLinguisticCharacteristics(text: string): {
  characteristics: WritingCharacteristics;
  sentences: SentenceStat[];
} {
  const rawSentences = tokenizeSentences(text);
  const words = tokenizeWords(text);
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);

  const totalWords = words.length;
  const totalSentences = Math.max(1, rawSentences.length);
  const totalParagraphs = Math.max(1, paragraphs.length);

  // Sentence stats & word count distribution
  const sentenceWordCounts: number[] = [];
  const sentenceStats: SentenceStat[] = rawSentences.map((s, idx) => {
    const sWords = tokenizeWords(s);
    const count = sWords.length;
    sentenceWordCounts.push(count);

    return {
      index: idx,
      text: s,
      wordCount: count,
    };
  });

  // Calculate Mean, Variance, and Std Dev of sentence length
  const sum = sentenceWordCounts.reduce((acc, c) => acc + c, 0);
  const averageSentenceLength = totalSentences > 0 ? sum / totalSentences : 0;

  const variance =
    totalSentences > 1
      ? sentenceWordCounts.reduce((acc, c) => acc + Math.pow(c - averageSentenceLength, 2), 0) /
        (totalSentences - 1)
      : 0;

  const sentenceLengthStdDev = Math.sqrt(variance);

  // Coefficient of Variation (CV) measures cadence burstiness
  const sentenceVariationCoefficient =
    averageSentenceLength > 0 ? sentenceLengthStdDev / averageSentenceLength : 0;

  // Vocabulary diversity (Type-Token Ratio)
  const uniqueWords = new Set(words);
  const vocabularyDiversityRatio =
    totalWords > 0 ? Math.min(1, uniqueWords.size / totalWords) : 0;

  // Detect repeated formulaic transitions
  const lowerText = text.toLowerCase();
  const formulaicTransitionsFound: { transition: string; count: number }[] = [];

  for (const phrase of FORMULAIC_TRANSITIONS) {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches && matches.length > 0) {
      formulaicTransitionsFound.push({
        transition: phrase,
        count: matches.length,
      });
    }
  }

  // Detect repeated 3-word phrases (n-grams)
  const ngramMap = new Map<string, number>();
  for (let i = 0; i < words.length - 2; i++) {
    const gram = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
    ngramMap.set(gram, (ngramMap.get(gram) || 0) + 1);
  }

  const repeatedPhrases: { phrase: string; count: number }[] = [];
  ngramMap.forEach((count, phrase) => {
    if (count >= 2 && phrase.length > 10) {
      repeatedPhrases.push({ phrase, count });
    }
  });

  repeatedPhrases.sort((a, b) => b.count - a.count);

  const characteristics: WritingCharacteristics = {
    totalWords,
    totalSentences: rawSentences.length,
    totalParagraphs,
    averageSentenceLength: Math.round(averageSentenceLength * 10) / 10,
    sentenceLengthStdDev: Math.round(sentenceLengthStdDev * 10) / 10,
    sentenceVariationCoefficient: Math.round(sentenceVariationCoefficient * 100) / 100,
    vocabularyDiversityRatio: Math.round(vocabularyDiversityRatio * 100) / 100,
    repeatedPhrases: repeatedPhrases.slice(0, 5),
    formulaicTransitionsFound,
  };

  return { characteristics, sentences: sentenceStats };
}
