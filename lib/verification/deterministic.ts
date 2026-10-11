import { VerificationCheck } from '@/types';

/**
 * Extracts numeric tokens including currencies, percentages, and decimals
 */
function extractNumbers(text: string): string[] {
  // Matches patterns like $100,000, 45%, 3.14, 1,000, 42
  const matches = text.match(/[$€£¥]?\d+(?:,\d+)*(?:\.\d+)?%?/g);
  if (!matches) return [];
  return Array.from(new Set(matches.map(m => m.trim().toLowerCase())));
}

/**
 * Extracts common date/time expressions
 */
function extractDatePatterns(text: string): string[] {
  const patterns = [
    // Month Day Year: Oct 11, 2026 or October 11, 2026
    /\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember))\s+\d{1,2}(?:st|nd|rd|th)?(?:,?\s+\d{4})?\b/gi,
    // Numerical dates: 2026-10-11, 10/11/2026, 11.10.2026
    /\b\d{1,4}[-\/\.]\d{1,2}[-\/\.]\d{2,4}\b/g,
    // Days of week
    /\b(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b/gi,
    // Relative specific temporal markers
    /\b(?:Q[1-4]\s*(?:20\d\d)?|FY\s*\d{2,4})\b/gi,
  ];

  const found: string[] = [];
  for (const regex of patterns) {
    const matches = text.match(regex);
    if (matches) {
      found.push(...matches.map(m => m.trim().toLowerCase()));
    }
  }
  return Array.from(new Set(found));
}

/**
 * Extracts proper nouns / capitalized entity phrases (excluding beginning of sentence words)
 */
function extractEntities(text: string): string[] {
  // Matches mid-sentence capitalized words / acronyms without trailing punctuation
  const matches = text.match(/(?<![.!?]\s+)(?<!^)\b[A-Z][a-zA-Z0-9_\-\+]*\b/g);
  if (!matches) return [];
  // Filter out very common conversational filler words if capitalized
  const stopWords = new Set(['I', 'However', 'Therefore', 'Please', 'Thank', 'Thanks', 'The', 'This', 'That', 'These', 'Those', 'And', 'But', 'Or']);
  const filtered = matches.filter(w => !stopWords.has(w));
  return Array.from(new Set(filtered.map(w => w.trim())));
}

/**
 * Runs deterministic checks on numbers, dates, and named entities
 */
export function runDeterministicChecks(original: string, rewritten: string): VerificationCheck[] {
  const checks: VerificationCheck[] = [];

  // 1. Numbers Check
  const origNumbers = extractNumbers(original);
  const rewrNumbers = extractNumbers(rewritten);

  const missingNumbers = origNumbers.filter(num => !rewrNumbers.includes(num));
  const newNumbers = rewrNumbers.filter(num => !origNumbers.includes(num));

  if (origNumbers.length === 0) {
    checks.push({
      id: 'num-check',
      category: 'numbers',
      title: 'Numerical Fidelity',
      status: 'passed',
      details: 'No numeric values found in original text. No data altered.',
    });
  } else if (missingNumbers.length === 0 && newNumbers.length === 0) {
    checks.push({
      id: 'num-check',
      category: 'numbers',
      title: 'Numerical Fidelity',
      status: 'passed',
      details: `All ${origNumbers.length} numerical values preserved exactly: [${origNumbers.join(', ')}].`,
      evidence: { original: origNumbers, rewritten: rewrNumbers },
    });
  } else if (missingNumbers.length > 0 || newNumbers.length > 0) {
    const issues: string[] = [];
    if (missingNumbers.length > 0) issues.push(`Missing: [${missingNumbers.join(', ')}]`);
    if (newNumbers.length > 0) issues.push(`Unexpected additions: [${newNumbers.join(', ')}]`);

    checks.push({
      id: 'num-check',
      category: 'numbers',
      title: 'Numerical Fidelity',
      status: missingNumbers.length > 0 ? 'failed' : 'warning',
      details: `Numerical discrepancies detected. ${issues.join('; ')}.`,
      evidence: { original: origNumbers, rewritten: rewrNumbers },
    });
  }

  // 2. Dates & Temporal Check
  const origDates = extractDatePatterns(original);
  const rewrDates = extractDatePatterns(rewritten);

  const missingDates = origDates.filter(d => !rewrDates.includes(d));

  if (origDates.length === 0) {
    checks.push({
      id: 'date-check',
      category: 'dates',
      title: 'Dates & Timeline Preservation',
      status: 'passed',
      details: 'No explicit dates or calendar references in original text.',
    });
  } else if (missingDates.length === 0) {
    checks.push({
      id: 'date-check',
      category: 'dates',
      title: 'Dates & Timeline Preservation',
      status: 'passed',
      details: `All temporal references intact (${origDates.join(', ')}).`,
      evidence: { original: origDates, rewritten: rewrDates },
    });
  } else {
    checks.push({
      id: 'date-check',
      category: 'dates',
      title: 'Dates & Timeline Preservation',
      status: 'warning',
      details: `Potentially omitted temporal references: [${missingDates.join(', ')}].`,
      evidence: { original: origDates, rewritten: rewrDates },
    });
  }

  // 3. Proper Names & Named Entities Check
  const origEntities = extractEntities(original);
  const rewrEntities = extractEntities(rewritten);
  const origEntitiesLower = origEntities.map(e => e.toLowerCase());
  const rewrEntitiesLower = rewrEntities.map(e => e.toLowerCase());

  const missingEntities = origEntities.filter(
    (e, idx) => !rewrEntitiesLower.includes(origEntitiesLower[idx])
  );

  if (origEntities.length === 0) {
    checks.push({
      id: 'entity-check',
      category: 'entities',
      title: 'Named Entities & Technical Terms',
      status: 'passed',
      details: 'No mid-sentence named entities or specialized uppercase terms found.',
    });
  } else if (missingEntities.length === 0) {
    checks.push({
      id: 'entity-check',
      category: 'entities',
      title: 'Named Entities & Technical Terms',
      status: 'passed',
      details: `Key entities preserved: [${origEntities.slice(0, 6).join(', ')}${origEntities.length > 6 ? '...' : ''}].`,
      evidence: { original: origEntities, rewritten: rewrEntities },
    });
  } else {
    checks.push({
      id: 'entity-check',
      category: 'entities',
      title: 'Named Entities & Technical Terms',
      status: 'warning',
      details: `Please verify if essential proper nouns/terms were omitted: [${missingEntities.join(', ')}].`,
      evidence: { original: origEntities, rewritten: rewrEntities },
    });
  }

  return checks;
}
