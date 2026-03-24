import { supabase } from '../lib/supabase';
import { BiomarkerDefinition, ParsedBiomarker } from '@wellness-copilot/types';

interface NormalizedResult {
  biomarker_id: string | null;
  normalized_name: string | null;
  normalized_value: number | null;
  normalized_unit: string | null;
  status: 'optimal' | 'normal' | 'borderline' | 'abnormal' | 'unknown';
  confidence_score: number;
}

// Unit conversion table
const UNIT_CONVERSIONS: Record<string, Record<string, number>> = {
  // mg/dL to mmol/L
  'mg/dl': { 'mmol/l': 0.0555, 'mg/dl': 1 },
  'mg/dl_cholesterol': { 'mmol/l': 0.0259 },
  // ng/mL to pmol/L
  'ng/ml': { 'pmol/l': 1000 },
  // Various glucose conversions
  'mg/100ml': { 'mg/dl': 1 },
};

function normalize(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function fuzzyMatch(input: string, definition: BiomarkerDefinition): number {
  const inputNorm = normalize(input);
  const nameNorm = normalize(definition.name);

  // Exact match
  if (inputNorm === nameNorm) return 1.0;

  // Alias match
  for (const alias of definition.aliases) {
    if (normalize(alias) === inputNorm) return 0.95;
  }

  // Partial match — input contains name or vice versa
  if (inputNorm.includes(nameNorm) || nameNorm.includes(inputNorm)) return 0.8;

  // Check aliases for partial
  for (const alias of definition.aliases) {
    const aliasNorm = normalize(alias);
    if (inputNorm.includes(aliasNorm) || aliasNorm.includes(inputNorm)) return 0.7;
  }

  return 0;
}

function determineStatus(
  value: number,
  def: BiomarkerDefinition
): 'optimal' | 'normal' | 'borderline' | 'abnormal' | 'unknown' {
  if (def.optimal_low != null && def.optimal_high != null) {
    if (value >= def.optimal_low && value <= def.optimal_high) return 'optimal';
  }
  if (def.reference_range_low != null && def.reference_range_high != null) {
    const range = def.reference_range_high - def.reference_range_low;
    const buffer = range * 0.1;
    if (value >= def.reference_range_low && value <= def.reference_range_high) return 'normal';
    if (
      value >= def.reference_range_low - buffer &&
      value <= def.reference_range_high + buffer
    )
      return 'borderline';
    return 'abnormal';
  }
  return 'unknown';
}

export async function normalizeBiomarker(
  parsed: ParsedBiomarker
): Promise<NormalizedResult> {
  const { data: definitions } = await supabase
    .from('biomarker_definitions')
    .select('*');

  if (!definitions || definitions.length === 0) {
    return {
      biomarker_id: null,
      normalized_name: null,
      normalized_value: null,
      normalized_unit: null,
      status: 'unknown',
      confidence_score: 0,
    };
  }

  let bestMatch: BiomarkerDefinition | null = null;
  let bestScore = 0;

  for (const def of definitions as BiomarkerDefinition[]) {
    const score = fuzzyMatch(parsed.name, def);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = def;
    }
  }

  if (!bestMatch || bestScore < 0.6) {
    return {
      biomarker_id: null,
      normalized_name: null,
      normalized_value: parsed.value,
      normalized_unit: parsed.unit,
      status: 'unknown',
      confidence_score: bestScore,
    };
  }

  const status = determineStatus(parsed.value, bestMatch);

  return {
    biomarker_id: bestMatch.id,
    normalized_name: bestMatch.name,
    normalized_value: parsed.value,
    normalized_unit: bestMatch.unit,
    status,
    confidence_score: bestScore,
  };
}
