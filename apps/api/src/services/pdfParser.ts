// pdf-parse v1 exports a single function via CommonJS
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse: (buf: Buffer) => Promise<{ text: string }> = require('pdf-parse');
import { anthropic } from '../lib/anthropic';
import { ParsedLabDocument } from '../types';

// ─── Patterns ─────────────────────────────────────────────────────────────────

const UNIT_PATTERN = /\b(g\/dL|g\/L|mg\/dL|mg\/L|mmol\/L|mEq\/L|meq\/L|ng\/dL|ng\/mL|pg\/mL|pmol\/L|nmol\/L|µmol\/L|umol\/L|IU\/L|mIU\/mL|µIU\/mL|mIU\/L|U\/L|kU\/L|fL|fl|%|g%|K\/µL|K\/uL|10\^3\/µL|cells\/µL|10\^6\/µL|10\^9\/L|10\^12\/L|µg\/dL|ug\/dL|µg\/L|ug\/L|mg\/g|mmol\/mol|ratio|index)\b/i;

const REFERENCE_RANGE_PATTERN = /\b\d+\.?\d*\s*[-–—to]\s*\d+\.?\d*\b/;

const NUMERIC_PATTERN = /\b\d+\.?\d*\b/;

// Lines matching any of these are immediately rejected as non-result rows
const REJECTION_PATTERNS: RegExp[] = [
  /method(ology)?s?/i,
  /measured\s+by/i,
  /performed\s+by/i,
  /detected\s+by/i,
  /determined\s+by/i,
  /calibrat(ed|ion)/i,
  /according\s+to/i,
  /\brefer(s)?\s+to\b/i,
  /\bsee\s+(page|section|note|below|above|table)\b/i,
  /\b(footnote|disclaimer|notice)\b/i,
  /\b(note|comment|remarks?)\s*:/i,
  /values?\s+(may|can|will|should)\s+vary/i,
  /results?\s+(may|can|will|should)\s+vary/i,
  /consult\s+(your|a|the)\s+/i,
  /contact\s+(your|a|the)\s+/i,
  /^\s*(page\s+\d+|continued|cont\.)\s*$/i,
  /copyright|all rights reserved/i,
  /reference\s+(values?|ranges?|interval|limits?)/i,
  /normal\s+(values?|ranges?|limits?)/i,
  /specimen\s+(type|collection|requirement)/i,
  /test\s+(code|number|id|mnemonic)/i,
  /reporting\s+(unit|lab|laboratory)/i,
  /accession\s+number/i,
  /patient\s+(name|id|dob|date of birth|age|sex|gender)/i,
  /physician|doctor|ordering/i,
  /interpretation\s+guide/i,
  /clinical\s+(significance|notes?|information)/i,
  /this\s+test\s+(measures?|detects?|evaluates?)/i,
  /the\s+(following|above|below)\s+(results?|values?)/i,
  /^\s*[A-Z\s]{15,}\s*$/,  // All-caps lines (section headers)
];

// ─── Score a line as a result row candidate ───────────────────────────────────
function scoreCandidate(line: string): { score: number; reasons: string[] } {
  const trimmed = line.trim();
  const reasons: string[] = [];

  if (trimmed.length < 4) return { score: 0, reasons: ['too_short'] };
  if (trimmed.length > 350) return { score: 0, reasons: ['too_long_likely_prose'] };
  if (!NUMERIC_PATTERN.test(trimmed)) return { score: 0, reasons: ['no_numeric_value'] };

  for (const pattern of REJECTION_PATTERNS) {
    if (pattern.test(trimmed)) return { score: 0, reasons: [`context_rejection:${pattern.source.slice(0, 30)}`] };
  }

  let score = 0;

  if (UNIT_PATTERN.test(trimmed)) { score += 3; reasons.push('has_unit'); }
  if (REFERENCE_RANGE_PATTERN.test(trimmed)) { score += 2; reasons.push('has_reference_range'); }

  const numbers = trimmed.match(/\b\d+\.?\d*\b/g) || [];
  if (numbers.length >= 2) { score += 1; reasons.push('multiple_numbers'); }
  if (numbers.length >= 3) { score += 1; reasons.push('many_numbers'); }

  if (trimmed.length < 120) { score += 1; reasons.push('short_line'); }
  if (trimmed.length < 70) { score += 1; reasons.push('very_short_line'); }

  if (/[a-zA-Z]{2,}/.test(trimmed)) { score += 1; reasons.push('has_text'); }

  // Separator characters common in result tables
  if (/[\t|]{1,}/.test(trimmed)) { score += 1; reasons.push('table_separator'); }

  return { score, reasons };
}

// ─── Extract candidate lines ──────────────────────────────────────────────────
function extractCandidateLines(text: string): string[] {
  const lines = text
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  const candidates: string[] = [];

  for (const line of lines) {
    const { score } = scoreCandidate(line);
    // Threshold: must have at least unit (3pts) OR reference range (2pts) + something else
    if (score >= 2) {
      candidates.push(line);
    }
  }

  return candidates;
}

// ─── Claude prompt — candidate-only, strict extraction ───────────────────────
const STRICT_PARSE_PROMPT = `You are a lab results parser. You will receive ONLY pre-filtered candidate rows extracted from a lab PDF. These rows have already been identified as likely result rows by heuristics.

Your job:
1. For each candidate row, determine if it is a TRUE lab measurement result
2. If yes, extract the structured data
3. If no (e.g. it is a header, sub-header, repeated label, or non-result), skip it entirely

Return a JSON object with this exact structure:
{"lab_date":"YYYY-MM-DD or null","lab_name":"string or null","patient_name":"string or null","biomarkers":[{"name":"analyte name exactly as printed","value":numeric_value,"unit":"unit string or empty string","reference_range_low":numeric or null,"reference_range_high":numeric or null,"source_row_text":"the exact candidate row text"}]}

Strict rules:
- Include ONLY rows that represent a real measured result with a numeric value
- Do NOT include rows that are sub-headers, category labels, or repeated analyte names without a value
- Do NOT include units-only rows or reference-range-only rows
- Convert value to a number (remove commas, use dot as decimal separator)
- Preserve the unit exactly as printed
- If a range is "3.5 - 5.0", set low=3.5 high=5.0
- source_row_text must be the exact candidate row you are extracting from
- Return ONLY valid compact JSON, no markdown, no explanation
- If no valid results found, return {"lab_date":null,"lab_name":null,"patient_name":null,"biomarkers":[]}`;

// ─── Main export ──────────────────────────────────────────────────────────────
export async function parsePdfDocument(pdfBase64: string): Promise<ParsedLabDocument> {
  const pdfBuffer = Buffer.from(pdfBase64, 'base64');
  const { text: pdfText } = await pdfParse(pdfBuffer);

  console.log(`[pdfParser] Extracted ${pdfText.length} chars from PDF`);

  // Pre-filter to candidate result rows
  const candidates = extractCandidateLines(pdfText);
  console.log(`[pdfParser] Pre-filter: ${candidates.length} candidate rows from ${pdfText.split('\n').length} total lines`);

  if (candidates.length === 0) {
    console.warn('[pdfParser] No candidate rows found after pre-filtering. Falling back to limited full-text parse.');
    // Fallback: send first 3000 chars of text if no candidates found (unusual PDFs)
    return parseFallback(pdfText.slice(0, 3000));
  }

  const candidateBlock = candidates.join('\n');
  console.log(`[pdfParser] Sending ${candidates.length} candidate rows to Claude (${candidateBlock.length} chars)`);

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8192,
    messages: [
      {
        role: 'user',
        content: `${STRICT_PARSE_PROMPT}\n\n---CANDIDATE ROWS---\n${candidateBlock}`,
      },
    ],
  });

  const stopReason = response.stop_reason;
  const text = response.content[0].type === 'text' ? response.content[0].text : '';

  console.log(`[pdfParser] Claude response: stop_reason=${stopReason} length=${text.length}`);

  if (stopReason === 'max_tokens') {
    throw new Error(`Claude response truncated (max_tokens). Candidate rows may be too many.`);
  }

  return parseClaudeResponse(text);
}

async function parseFallback(limitedText: string): Promise<ParsedLabDocument> {
  console.warn('[pdfParser] Running fallback parse on limited text');
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `${STRICT_PARSE_PROMPT}\n\n---CANDIDATE ROWS---\n${limitedText}`,
      },
    ],
  });
  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  return parseClaudeResponse(text);
}

function parseClaudeResponse(text: string): ParsedLabDocument {
  try {
    return JSON.parse(text) as ParsedLabDocument;
  } catch {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]) as ParsedLabDocument;
      } catch {
        // fall through
      }
    }
    console.error(`[pdfParser] Failed to parse Claude JSON response. First 300 chars: ${text.slice(0, 300)}`);
    throw new Error(`Failed to parse Claude response as JSON`);
  }
}
