import { ParsedBiomarker, ValidatedBiomarker } from '../types';

// ─── Plausible physiological ranges per canonical marker class ─────────────────
// These are broad sanity filters, not clinical reference ranges
interface PlausibleRange { min: number; max: number }

const PLAUSIBLE_RANGES: Record<string, PlausibleRange> = {
  hemoglobin:           { min: 3,    max: 25 },      // g/dL
  hematocrit:           { min: 10,   max: 70 },      // %
  sodium:               { min: 100,  max: 180 },     // mEq/L
  potassium:            { min: 1,    max: 10 },      // mEq/L
  chloride:             { min: 70,   max: 130 },     // mEq/L
  glucose:              { min: 20,   max: 900 },     // mg/dL
  creatinine:           { min: 0.1,  max: 20 },      // mg/dL
  bun:                  { min: 1,    max: 150 },     // mg/dL
  urea:                 { min: 1,    max: 50 },      // mmol/L
  calcium:              { min: 4,    max: 15 },      // mg/dL
  albumin:              { min: 1,    max: 7 },       // g/dL
  totalprotein:         { min: 3,    max: 12 },      // g/dL
  cholesterol:          { min: 50,   max: 500 },     // mg/dL
  triglycerides:        { min: 20,   max: 2000 },    // mg/dL
  hdl:                  { min: 5,    max: 150 },     // mg/dL
  ldl:                  { min: 10,   max: 400 },     // mg/dL
  tsh:                  { min: 0.001, max: 100 },    // mIU/L
  t4:                   { min: 0.1,  max: 30 },      // µg/dL or ng/dL
  t3:                   { min: 0.5,  max: 10 },      // ng/mL or nmol/L
  testosterone:         { min: 0.1,  max: 3000 },    // ng/dL (wide range for total)
  estradiol:            { min: 0,    max: 5000 },    // pg/mL
  cortisol:             { min: 0.5,  max: 100 },     // µg/dL
  insulin:              { min: 0.5,  max: 300 },     // µIU/mL
  vitaminD:             { min: 1,    max: 200 },     // ng/mL
  vitaminB12:           { min: 50,   max: 3000 },    // pg/mL
  ferritin:             { min: 1,    max: 5000 },    // ng/mL
  iron:                 { min: 10,   max: 400 },     // µg/dL
  alt:                  { min: 1,    max: 5000 },    // U/L
  ast:                  { min: 1,    max: 5000 },    // U/L
  ggt:                  { min: 1,    max: 2000 },    // U/L
  alkalinephosphatase:  { min: 10,   max: 2000 },    // U/L
  bilirubin:            { min: 0.1,  max: 50 },      // mg/dL
  wbc:                  { min: 0.5,  max: 100 },     // K/µL or 10^3/µL
  rbc:                  { min: 1,    max: 10 },      // M/µL or 10^6/µL
  platelets:            { min: 10,   max: 2000 },    // K/µL
  mcv:                  { min: 50,   max: 130 },     // fL
  mch:                  { min: 10,   max: 50 },      // pg
  mchc:                 { min: 20,   max: 45 },      // g/dL
  lymphocytes:          { min: 0,    max: 100 },     // % or K/µL
  neutrophils:          { min: 0,    max: 100 },
  psa:                  { min: 0,    max: 5000 },    // ng/mL
  hba1c:                { min: 3,    max: 20 },      // %
  uricacid:             { min: 0.5,  max: 20 },      // mg/dL
  phosphorus:           { min: 0.5,  max: 15 },      // mg/dL
  magnesium:            { min: 0.5,  max: 10 },      // mg/dL
};

// ─── Key normalization for range lookup ───────────────────────────────────────
function normalizeKey(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function findPlausibleRange(rawName: string): PlausibleRange | null {
  const key = normalizeKey(rawName);
  // Direct lookup
  if (PLAUSIBLE_RANGES[key]) return PLAUSIBLE_RANGES[key];
  // Substring lookup
  for (const [k, range] of Object.entries(PLAUSIBLE_RANGES)) {
    if (key.includes(k) || k.includes(key)) return range;
  }
  return null;
}

// ─── Context rejection (second pass — catches things that slipped through) ────
const POST_FILTER_REJECTION: RegExp[] = [
  /method/i,
  /technician/i,
  /\bLOINC\b/,
  /CPT\s*code/i,
  /order\s*code/i,
  /collection\s*(date|time|site)/i,
];

function isContextRow(sourceRow: string): boolean {
  return POST_FILTER_REJECTION.some(p => p.test(sourceRow));
}

// ─── Confidence scoring ───────────────────────────────────────────────────────
function scoreConfidence(
  biomarker: ParsedBiomarker,
  isDuplicate: boolean,
  plausibilityFailed: boolean,
): { confidence: 'high' | 'medium' | 'low'; notes: string[] } {
  const notes: string[] = [];
  let score = 0;

  const src = biomarker.source_row_text || '';

  // Positive signals
  if (biomarker.value !== undefined && biomarker.value !== null) { score += 3; notes.push('has_value'); }
  if (biomarker.unit && biomarker.unit.trim().length > 0) { score += 2; notes.push('has_unit'); }
  if (biomarker.reference_range_low !== null && biomarker.reference_range_high !== null) {
    score += 2; notes.push('has_reference_range');
  }
  if (src.length > 0 && src.length < 150) { score += 1; notes.push('compact_source_row'); }

  // Negative signals
  if (isDuplicate) { score -= 3; notes.push('duplicate_conflict'); }
  if (plausibilityFailed) { score -= 3; notes.push('implausible_value'); }
  if (isContextRow(src)) { score -= 4; notes.push('context_row_detected'); }
  if (!biomarker.unit || biomarker.unit.trim().length === 0) { notes.push('missing_unit'); }

  if (score >= 6) return { confidence: 'high', notes };
  if (score >= 3) return { confidence: 'medium', notes };
  return { confidence: 'low', notes };
}

// ─── Duplicate detection within a single document ────────────────────────────
function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/\s+/g, '');
}

function suppressDuplicates(biomarkers: ParsedBiomarker[]): Map<string, ParsedBiomarker> {
  const seen = new Map<string, ParsedBiomarker>();

  for (const b of biomarkers) {
    const key = normalizeName(b.name);
    if (!seen.has(key)) {
      seen.set(key, b);
    } else {
      const existing = seen.get(key)!;
      // Keep the one with more structural data
      const existingScore =
        (existing.unit ? 1 : 0) +
        (existing.reference_range_low !== null ? 1 : 0) +
        (existing.source_row_text ? 1 : 0);
      const newScore =
        (b.unit ? 1 : 0) +
        (b.reference_range_low !== null ? 1 : 0) +
        (b.source_row_text ? 1 : 0);

      if (newScore > existingScore) {
        console.log(`[validator] Duplicate resolved: kept better candidate for "${b.name}" (new score ${newScore} > existing ${existingScore})`);
        seen.set(key, b);
      } else {
        console.log(`[validator] Duplicate rejected: "${b.name}" already captured with better data`);
      }
    }
  }

  return seen;
}

// ─── Main validation entry point ──────────────────────────────────────────────
export function validateAndScore(biomarkers: ParsedBiomarker[], documentId: string, labDate: string): ValidatedBiomarker[] {
  console.log(`[validator] Starting validation of ${biomarkers.length} raw candidates`);

  // Step 1: suppress duplicates
  const deduped = suppressDuplicates(biomarkers);
  const dedupedList = Array.from(deduped.values());

  console.log(`[validator] After dedup: ${dedupedList.length} unique candidates (removed ${biomarkers.length - dedupedList.length} duplicates)`);

  const results: ValidatedBiomarker[] = [];

  for (const b of dedupedList) {
    const isDuplicate = false; // already deduped — track conflicts differently if needed

    // Plausibility check
    const range = findPlausibleRange(b.name);
    let plausibilityFailed = false;
    if (range && (b.value < range.min || b.value > range.max)) {
      plausibilityFailed = true;
      console.log(`[validator] Plausibility FAILED for "${b.name}": value ${b.value} outside [${range.min}, ${range.max}]`);
    }

    // Context check
    const contextRejected = isContextRow(b.source_row_text || '');
    if (contextRejected) {
      console.log(`[validator] Context REJECTED: "${b.name}" from row: "${b.source_row_text?.slice(0, 60)}"`);
    }

    const { confidence, notes } = scoreConfidence(b, isDuplicate, plausibilityFailed);

    const referenceText = (b.reference_range_low !== null && b.reference_range_high !== null)
      ? `${b.reference_range_low} - ${b.reference_range_high}`
      : null;

    const validated: ValidatedBiomarker = {
      raw_name: b.name,
      canonical_name: null, // set by normalizer
      value: b.value,
      unit: b.unit || '',
      reference_range_text: referenceText,
      reference_range_low: b.reference_range_low,
      reference_range_high: b.reference_range_high,
      source_row_text: b.source_row_text || '',
      extraction_confidence: confidence,
      validation_notes: notes,
    };

    console.log(`[validator] "${b.name}" → confidence=${confidence} | notes=[${notes.join(', ')}]`);
    results.push(validated);
  }

  const high = results.filter(r => r.extraction_confidence === 'high').length;
  const medium = results.filter(r => r.extraction_confidence === 'medium').length;
  const low = results.filter(r => r.extraction_confidence === 'low').length;
  console.log(`[validator] Results: ${high} high, ${medium} medium, ${low} low confidence`);

  return results;
}
